
const express = require('express');
const router = express.Router();
const { executeGeminiPrompt } = require('../services/geminiService');

router.post('/', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const response = await executeGeminiPrompt(prompt);
    res.json({ response });
  } catch (error) {
    console.error(`Error executing Gemini prompt: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
