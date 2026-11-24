'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const QUEUE = process.env.EXECUTION_QUEUE_DIR || '/queue';
const INBOX = path.join(QUEUE, 'inbox');
const PROCESSING = path.join(QUEUE, 'processing');
const OUTBOX = path.join(QUEUE, 'outbox');
const POLL_MS = 100;
const MAX_SOURCE_BYTES = 64 * 1024;
const MAX_INPUT_BYTES = 64 * 1024;
const MAX_OUTPUT_BYTES = 64 * 1024;
const MAX_TIME_MS = 5000;
const MEMORY_BYTES = 256 * 1024 * 1024;
const SAFE_ENV = {
  PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
  HOME: '/tmp',
  LANG: 'C',
  LC_ALL: 'C'
};

function ensureDirectories() {
  for (const directory of [QUEUE, INBOX, PROCESSING, OUTBOX]) {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.chmodSync(directory, 0o700);
  }
}

function bytes(value) {
  return Buffer.byteLength(value, 'utf8');
}

function runCommand(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: options.cwd,
    input: options.input,
    encoding: 'utf8',
    env: SAFE_ENV,
    timeout: options.timeout || 10000,
    maxBuffer: MAX_OUTPUT_BYTES * 2,
    stdio: ['pipe', 'pipe', 'pipe']
  });
}

function allocateUid() {
  // The worker processes one job at a time and gives each job a fresh UID.
  for (let attempt = 0; attempt < 100; attempt++) {
    const uid = crypto.randomInt(20000, 60000);
    const check = spawnSync('/usr/bin/pgrep', ['-u', String(uid)], { encoding: 'utf8' });
    if (check.status !== 0) return uid;
  }
  throw new Error('Unable to allocate an unused execution UID');
}

function privilegedCommand(uid, command, args, cwd, timeoutSeconds, input) {
  const setprivArgs = [
    '--bounding-set=-all',
    '--inh-caps=-all',
    '--ambient-caps=-all',
    '--reuid=' + uid,
    '--regid=10002',
    '--clear-groups',
    '--no-new-privs',
    '--',
    command,
    ...args
  ];
  const prlimitArgs = [
    '--cpu=' + Math.max(1, timeoutSeconds),
    '--as=' + MEMORY_BYTES,
    '--fsize=1048576',
    '--nproc=16',
    '--',
    '/usr/bin/setpriv',
    ...setprivArgs
  ];
  return runCommand('/usr/bin/timeout', [
    '--signal=KILL',
    '--kill-after=1s',
    timeoutSeconds + 's',
    '/usr/bin/prlimit',
    ...prlimitArgs.slice(0)
  ], { cwd, input, timeout: (timeoutSeconds + 3) * 1000 });
}

function killUidProcesses(uid) {
  for (let attempt = 0; attempt < 20; attempt++) {
    spawnSync('/usr/bin/pkill', ['-KILL', '-u', String(uid)]);
    const remaining = spawnSync('/usr/bin/pgrep', ['-u', String(uid)]);
    if (remaining.status !== 0) return;
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50);
  }
  throw new Error('Could not terminate all processes for execution UID ' + uid);
}

function boundedText(value) {
  const text = String(value || '');
  if (bytes(text) > MAX_OUTPUT_BYTES) return text.slice(0, MAX_OUTPUT_BYTES);
  return text;
}

function executeJob(job) {
  if (!job || typeof job.sourceCode !== 'string' || typeof job.input !== 'string') {
    throw new Error('Invalid job payload');
  }
  if (bytes(job.sourceCode) > MAX_SOURCE_BYTES) throw new Error('Source code exceeds 64 KiB');
  if (bytes(job.input) > MAX_INPUT_BYTES) throw new Error('Input exceeds 64 KiB');

  const timeLimitMs = Math.min(MAX_TIME_MS, Math.max(100, Number(job.timeLimitMs) || 2000));
  const compileSeconds = 8;
  const uid = allocateUid();
  const workspace = fs.mkdtempSync('/tmp/codejudge-');
  let executionTime = 0;

  try {
    const sourcePath = path.join(workspace, 'main.c');
    const binaryPath = path.join(workspace, 'program');
    // Create the source while the supervisor owns the private directory.
    // Then hand the directory and source to the unprivileged job UID so
    // compilation can read the source and create its output without DAC_OVERRIDE.
    fs.writeFileSync(sourcePath, job.sourceCode, { mode: 0o600 });
    fs.chownSync(sourcePath, uid, 10002);
    fs.chownSync(workspace, uid, 10002);
    // The supervisor launches timeout with cwd=workspace before setpriv runs.
    // Give non-owners traversal only; the job UID remains the directory owner
    // and retains read/write access needed by GCC and the submitted program.
    fs.chmodSync(workspace, 0o711);

    const compile = privilegedCommand(
      uid, '/usr/bin/gcc',
      ['-std=c11', '-O2', 'main.c', '-o', 'program', '-lm'],
      workspace, compileSeconds
    );

    if (compile.error && compile.error.code === 'ETIMEDOUT') {
      return { verdict: 'Compilation Error', error: 'Compilation timed out', output: '', executionTime: 0 };
    }
    if (compile.status !== 0) {
      return {
        verdict: 'Compilation Error',
        error: boundedText(compile.stderr || compile.error?.message || 'Compilation failed'),
        output: '',
        executionTime: 0
      };
    }

    const start = process.hrtime.bigint();
    const run = privilegedCommand(
      uid, binaryPath, [],
      workspace, Math.max(1, Math.ceil(timeLimitMs / 1000)), job.input
    );
    executionTime = Number(process.hrtime.bigint() - start) / 1e9;

    if (run.error && run.error.code === 'ENOBUFS') {
      return { verdict: 'Output Limit Exceeded', error: 'Program output exceeded the limit', output: '', executionTime };
    }
    if (run.error && run.error.code === 'ETIMEDOUT') {
      return { verdict: 'Time Limit Exceeded', error: 'Execution timed out', output: '', executionTime };
    }
    if (run.status === 124 || run.status === 137) {
      return { verdict: 'Time Limit Exceeded', error: 'Execution time limit exceeded', output: '', executionTime };
    }
    if (run.status !== 0) {
      return {
        verdict: 'Runtime Error',
        error: boundedText(run.stderr || run.error?.message || 'Program exited with a non-zero status'),
        output: boundedText(run.stdout),
        executionTime
      };
    }
    return {
      verdict: 'Executed',
      error: null,
      output: boundedText(run.stdout),
      executionTime
    };
  } finally {
    killUidProcesses(uid);
    // Return directory ownership to the supervisor before removing the job tree.
    fs.chownSync(workspace, 0, 0);
    fs.rmSync(workspace, { recursive: true, force: true });
  }
}

function writeResult(id, result) {
  const temporary = path.join(OUTBOX, id + '.tmp');
  const destination = path.join(OUTBOX, id + '.json');
  fs.writeFileSync(temporary, JSON.stringify(result), { mode: 0o600 });
  fs.renameSync(temporary, destination);
}

function processNextJob() {
  const entries = fs.readdirSync(INBOX).filter(name => /^[a-f0-9-]{36}\.json$/.test(name)).sort();
  if (entries.length === 0) return false;

  const name = entries[0];
  const id = name.slice(0, -5);
  const source = path.join(INBOX, name);
  const claimed = path.join(PROCESSING, name);
  try {
    fs.renameSync(source, claimed);
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }

  let result;
  try {
    const job = JSON.parse(fs.readFileSync(claimed, 'utf8'));
    result = executeJob(job);
  } catch (error) {
    result = {
      verdict: 'Worker Error',
      error: boundedText(error.message),
      output: '',
      executionTime: 0
    };
  } finally {
    fs.rmSync(claimed, { force: true });
  }

  writeResult(id, result);
  return true;
}

function recoverInterruptedJobs() {
  // The worker is single-instance; on restart, anything left in processing
  // belongs to the previous, now-dead worker and can safely be requeued.
  for (const name of fs.readdirSync(PROCESSING)) {
    if (!/^[a-f0-9-]{36}\.json$/.test(name)) continue;
    const from = path.join(PROCESSING, name);
    const to = path.join(INBOX, name);
    try { fs.renameSync(from, to); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
}

function cleanStaleResults() {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const name of fs.readdirSync(OUTBOX)) {
    if (!/^[a-f0-9-]{36}\.json$/.test(name)) continue;
    const file = path.join(OUTBOX, name);
    try {
      if (fs.statSync(file).mtimeMs < cutoff) fs.rmSync(file, { force: true });
    } catch (_) {}
  }
}

async function main() {
  ensureDirectories();
  recoverInterruptedJobs();
  console.log('Isolated execution worker started; network access is disabled by container configuration.');
  let lastCleanup = 0;
  while (true) {
    const processed = processNextJob();
    if (Date.now() - lastCleanup > 60000) {
      cleanStaleResults();
      lastCleanup = Date.now();
    }
    if (!processed) await new Promise(resolve => setTimeout(resolve, POLL_MS));
  }
}

main().catch(error => {
  console.error('Execution worker stopped:', error);
  process.exit(1);
});
