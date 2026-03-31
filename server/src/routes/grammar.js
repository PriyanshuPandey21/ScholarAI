import express from 'express';
import axios from 'axios';
import { protect } from '../middleware/auth.js';
import History from '../models/History.js';

const router = express.Router();

router.post('/check', protect, async (req, res) => {
  try {
    const { text, language = 'en-US' } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const { data } = await axios.post('https://api.languagetool.org/v2/check', new URLSearchParams({ text, language }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    await History.create({ userId: req.user._id, toolUsed: 'Grammar Checker', inputSummary: text.substring(0, 100), resultSummary: `${data.matches?.length || 0} issues found` });
    res.json({ matches: data.matches || [], errorCount: data.matches?.length || 0, language: data.language });
  } catch (err) { res.status(500).json({ error: 'Grammar check failed. Please try again.' }); }
});

export default router;
