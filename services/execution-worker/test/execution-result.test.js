'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { isTimeLimitExceeded } = require('../execution-result');

test('recognizes GNU timeout exit statuses', () => {
  assert.equal(isTimeLimitExceeded({ status: 124 }), true);
  assert.equal(isTimeLimitExceeded({ status: 137 }), true);
});

test('recognizes CPU resource-limit termination', () => {
  assert.equal(isTimeLimitExceeded({ status: 152 }), true);
  assert.equal(isTimeLimitExceeded({ status: null, signal: 'SIGXCPU' }), true);
});

test('recognizes Node spawn timeout errors', () => {
  assert.equal(isTimeLimitExceeded({ error: { code: 'ETIMEDOUT' } }), true);
});

test('does not classify ordinary exits as timeouts', () => {
  assert.equal(isTimeLimitExceeded({ status: 0 }), false);
  assert.equal(isTimeLimitExceeded({ status: 1 }), false);
  assert.equal(isTimeLimitExceeded({ status: 139, signal: 'SIGSEGV' }), false);
  assert.equal(isTimeLimitExceeded(null), false);
});
