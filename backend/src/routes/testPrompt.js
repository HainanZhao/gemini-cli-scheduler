const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

router.post('/test', (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is required' 
      });
    }
    
    const startTime = new Date();
    
    exec(`gemini --prompt "${prompt.trim()}"`, { 
      timeout: 600_000,
      maxBuffer: 100 * 1024 * 1024 // 100MB buffer
    }, (error, stdout, stderr) => {
      const endTime = new Date();
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
      
      if (error) {
        // Handle different types of errors
        let errorMessage = error.message;
        if (error.code === 'ENOENT') {
          errorMessage = 'Gemini CLI not found. Please ensure it is installed and in your PATH.';
        } else if (error.killed) {
          errorMessage = 'Command timed out after 30 seconds.';
        }
        
        return res.json({
          success: false,
          output: stderr ? `${errorMessage}\n\nDetails: ${stderr}` : errorMessage,
          duration: duration
        });
      }
      
      res.json({
        success: true,
        output: stdout || 'Command completed successfully but produced no output.',
        duration: duration
      });
    });
  } catch (error) {
    console.error('Test prompt error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error while testing prompt' 
    });
  }
});

module.exports = router;
