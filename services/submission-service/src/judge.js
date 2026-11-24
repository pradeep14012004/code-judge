const fs = require('fs');
const { runSource } = require('./execution-client');

async function judge(sourceCode, inputPath, expectedOutputPath, timeLimit) {
  const input = fs.existsSync(inputPath) ? fs.readFileSync(inputPath, 'utf8') : '';
  const expectedOutput = fs.readFileSync(expectedOutputPath, 'utf8').trim();
  const result = await runSource(sourceCode, input, Number(timeLimit) * 1000);

  if (result.verdict !== 'Executed') {
    return {
      verdict: result.verdict,
      error: result.error || null,
      executionTime: result.executionTime || 0
    };
  }

  const actualOutput = String(result.output || '').trim();
  return {
    verdict: actualOutput === expectedOutput ? 'Accepted' : 'Wrong Answer',
    executionTime: result.executionTime || 0
  };
}

module.exports = { judge };
