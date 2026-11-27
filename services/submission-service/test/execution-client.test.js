'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');

let root;
let runSource;

test.beforeEach(async () => {
  root = await fs.mkdtemp(path.join(os.tmpdir(), 'codejudge-submission-tests-'));
  process.env.EXECUTION_QUEUE_DIR = path.join(root, 'queue');
  delete require.cache[require.resolve('../src/execution-client')];
  ({ runSource } = require('../src/execution-client'));
});

test.afterEach(async () => {
  delete process.env.EXECUTION_QUEUE_DIR;
  await fs.rm(root, { recursive: true, force: true });
});

test('rejects empty source code with HTTP 400', async () => {
  await assert.rejects(runSource('   ', ''), error => error.statusCode === 400);
});

test('rejects source larger than 64 KiB with HTTP 413', async () => {
  await assert.rejects(runSource('x'.repeat(64 * 1024 + 1), ''), error => error.statusCode === 413);
});

test('rejects non-string input with HTTP 400', async () => {
  await assert.rejects(runSource('int main(void) { return 0; }', 123), error => error.statusCode === 400);
});

test('writes a bounded job request and returns the worker result', async () => {
  const inbox = path.join(process.env.EXECUTION_QUEUE_DIR, 'inbox');
  const outbox = path.join(process.env.EXECUTION_QUEUE_DIR, 'outbox');

  const fakeWorker = (async () => {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const files = await fs.readdir(inbox).catch(() => []);
      const request = files.find(name => name.endsWith('.json'));
      if (request) {
        const id = request.slice(0, -5);
        const payload = JSON.parse(await fs.readFile(path.join(inbox, request), 'utf8'));
        await fs.mkdir(outbox, { recursive: true });
        await fs.writeFile(path.join(outbox, id + '.json'), JSON.stringify({
          verdict: 'Executed',
          output: 'hello\\n',
          error: null,
          executionTime: 0.012
        }));
        return payload;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Fake worker did not receive a job');
  })();

  const result = await runSource('int main(void) { return 0; }', '', 9000);
  const payload = await fakeWorker;

  assert.equal(payload.timeLimitMs, 5000);
  assert.equal(payload.input, '');
  assert.equal(result.verdict, 'Executed');
  assert.equal(result.output, 'hello\\n');
});

test('maps worker-reported failures to HTTP 503', async () => {
  const inbox = path.join(process.env.EXECUTION_QUEUE_DIR, 'inbox');
  const outbox = path.join(process.env.EXECUTION_QUEUE_DIR, 'outbox');

  const fakeWorker = (async () => {
    const deadline = Date.now() + 3000;
    while (Date.now() < deadline) {
      const files = await fs.readdir(inbox).catch(() => []);
      const request = files.find(name => name.endsWith('.json'));
      if (request) {
        const id = request.slice(0, -5);
        await fs.mkdir(outbox, { recursive: true });
        await fs.writeFile(path.join(outbox, id + '.json'), JSON.stringify({
          verdict: 'Worker Error',
          error: 'worker unavailable'
        }));
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error('Fake worker did not receive a job');
  })();

  await assert.rejects(
    runSource('int main(void) { return 0; }', ''),
    error => error.statusCode === 503 && error.message === 'worker unavailable'
  );
  await fakeWorker;
});
