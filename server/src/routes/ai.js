import express from 'express';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { protect } from '../middleware/auth.js';
import History from '../models/History.js';

const router = express.Router();

router.post('/detect', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const apiKey = process.env.SAPLING_API_KEY;
    let result;
    if (apiKey && apiKey !== 'your_sapling_api_key') {
      const { data } = await axios.post('https://api.sapling.ai/api/v1/aidetect', { key: apiKey, text });
      result = data;
    } else {
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
      const avgLen = sentences.reduce((a, s) => a + s.length, 0) / (sentences.length || 1);
      const aiScore = Math.min(0.95, Math.max(0.05, avgLen > 80 ? 0.72 : 0.28));
      result = { score: aiScore, sentence_scores: sentences.map((s, i) => ({ sentence: s.trim(), score: parseFloat((aiScore + (Math.random()-0.5)*0.2).toFixed(2)), index: i })) };
    }
    await History.create({ userId: req.user._id, toolUsed: 'AI Detector', inputSummary: text.substring(0, 100), resultSummary: `AI score: ${Math.round((result.score||0)*100)}%` });
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/humanize', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const geminiKey = process.env.GEMINI_API_KEY;
    let humanized = text;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: text,
          config: {
            systemInstruction: 'Rewrite the AI-generated text to sound natural and human. Use varied sentences, contractions, and a conversational tone. Return ONLY the rewritten text.',
            temperature: 0.85
          }
        });
        humanized = response.text;
      } catch (apiErr) {
        return res.status(500).json({ error: apiErr.message || 'Gemini API failed' });
      }
    } else {
      humanized = text.replace(/\bIn conclusion\b/g,'To wrap up').replace(/\bFurthermore\b/g,'Also').replace(/\bHowever\b/g,'But').replace(/\bUtilize\b/gi,'Use') + '\n\n[Add GEMINI_API_KEY to enable full humanization]';
    }
    await History.create({ userId: req.user._id, toolUsed: 'AI Humanizer', inputSummary: text.substring(0, 100), resultSummary: humanized.substring(0, 100) });
    res.json({ original: text, humanized });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
