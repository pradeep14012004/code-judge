'use strict';

function isTimeLimitExceeded(result) {
  if (!result) return false;

  return result.error?.code === 'ETIMEDOUT'
    || result.status === 124
    || result.status === 137
    || result.status === 152
    || result.signal === 'SIGXCPU';
}

module.exports = { isTimeLimitExceeded };
