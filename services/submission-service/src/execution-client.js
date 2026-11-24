'use strict';

const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

const QUEUE = process.env.EXECUTION_QUEUE_DIR || '/queue';
const INBOX = path.join(QUEUE, 'inbox');
const OUTBOX = path.join(QUEUE, 'outbox');
const MAX_SOURCE_BYTES = 64 * 1024;
const MAX_INPUT_BYTES = 64 * 1024;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSource(sourceCode, input, timeLimitMs = 2000) {
  if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
    throw Object.assign(new Error('source_code is required'), { statusCode: 400 });
  }
  if (Buffer.byteLength(sourceCode, 'utf8') > MAX_SOURCE_BYTES) {
    throw Object.assign(new Error('Source code exceeds 64 KiB'), { statusCode: 413 });
  }
  if (typeof input !== 'string') {
    throw Object.assign(new Error('input must be a string'), { statusCode: 400 });
  }
  if (Buffer.byteLength(input, 'utf8') > MAX_INPUT_BYTES) {
    throw Object.assign(new Error('Input exceeds 64 KiB'), { statusCode: 413 });
  }

  const id = randomUUID();
  const requestPath = path.join(INBOX, id + '.json');
  const temporaryPath = path.join(INBOX, id + '.tmp');
  const resultPath = path.join(OUTBOX, id + '.json');
  const safeTimeLimit = Math.min(5000, Math.max(100, Number(timeLimitMs) || 2000));
  const payload = JSON.stringify({ sourceCode, input, timeLimitMs: safeTimeLimit });

  try {
    await fs.promises.mkdir(INBOX, { recursive: true });
    await fs.promises.writeFile(temporaryPath, payload, { mode: 0o600, flag: 'wx' });
    await fs.promises.rename(temporaryPath, requestPath);

    const deadline = Date.now() + 20000;
    while (Date.now() < deadline) {
      try {
        const raw = await fs.promises.readFile(resultPath, 'utf8');
        await fs.promises.unlink(resultPath).catch(() => {});
        const result = JSON.parse(raw);
        if (result.verdict === 'Worker Error') {
          throw Object.assign(new Error(result.error || 'Execution worker failed'), { statusCode: 503 });
        }
        return result;
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
      await delay(50);
    }
    throw Object.assign(new Error('Execution worker did not respond within 20 seconds'), {
      statusCode: 503,
      code: 'EXECUTION_WORKER_UNAVAILABLE'
    });
  } finally {
    await Promise.all([
      fs.promises.unlink(temporaryPath).catch(() => {}),
      fs.promises.unlink(requestPath).catch(() => {}),
      fs.promises.unlink(resultPath).catch(() => {})
    ]);
  }
}

module.exports = { runSource };
