import express from 'express';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { protect } from '../middleware/auth.js';
import History from '../models/History.js';

const router = express.Router();
const MODES = {
  standard: 'Rewrite the following text clearly and simply. Keep the meaning intact. Return ONLY the rewritten text.',
  fluency: 'Improve the fluency of the following text. Make it smooth and readable. Return ONLY the rewritten text.',
  creative: 'Creatively rewrite with engaging language. Return ONLY the rewritten text.',
  academic: 'Rewrite in a formal academic style suitable for research papers. Return ONLY the rewritten text.',
};

router.post('/', protect, async (req, res) => {
  try {
    const { text, mode = 'standard' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const geminiKey = process.env.GEMINI_API_KEY;
    let paraphrased = text;
    if (geminiKey && geminiKey !== 'your_gemini_api_key_here') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: text,
          config: {
            systemInstruction: MODES[mode] || MODES.standard,
            temperature: mode === 'creative' ? 0.9 : 0.7,
          }
        });
        paraphrased = response.text;
      } catch (apiErr) {
        return res.status(500).json({ error: apiErr.message || 'Gemini API failed' });
      }
    } else {
      paraphrased = `[${mode.toUpperCase()}] ${text}\n\n[Add GEMINI_API_KEY to enable paraphrasing]`;
    }
    await History.create({ userId: req.user._id, toolUsed: 'Paraphrasing Tool', inputSummary: text.substring(0, 100), resultSummary: paraphrased.substring(0, 100) });
    res.json({ original: text, paraphrased, mode });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
