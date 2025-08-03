const { exec } = require('child_process');

const executeGeminiPrompt = (prompt) => {
  return new Promise((resolve, reject) => {
    exec(`gemini --prompt "${prompt}"`, { 
      timeout: 600_000,
      maxBuffer: 100 * 1024 * 1024 // 100MB buffer for large outputs
    }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`Gemini CLI Error: ${error.message}\nStderr: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = { executeGeminiPrompt };
