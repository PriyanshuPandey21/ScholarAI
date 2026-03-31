import express from 'express';
import axios from 'axios';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import History from '../models/History.js';

const router = express.Router();

async function extractText(file) {
  const ext = file.originalname.split('.').pop().toLowerCase();
  if (ext === 'pdf') { const buf = fs.readFileSync(file.path); const d = await pdfParse(buf); return d.text; }
  if (ext === 'docx' || ext === 'doc') { const r = await mammoth.extractRawText({ path: file.path }); return r.value; }
  if (ext === 'txt') return fs.readFileSync(file.path, 'utf-8');
  return '';
}

function splitSentences(text) { return text.match(/[^.!?]+[.!?]+/g) || [text]; }

async function searchGoogle(sentence) {
  const apiKey = process.env.GOOGLE_CSE_API_KEY, cseId = process.env.GOOGLE_CSE_ID;
  if (!apiKey || !cseId || apiKey === 'your_google_api_key') return [];
  try {
    const { data } = await axios.get('https://www.googleapis.com/customsearch/v1', { params: { key: apiKey, cx: cseId, q: sentence.trim().substring(0, 100) } });
    return (data.items || []).map(item => ({ title: item.title, url: item.link }));
  } catch { return []; }
}

router.post('/check', protect, upload.single('file'), async (req, res) => {
  try {
    let text = req.body.text || '';
    if (req.file) { text = await extractText(req.file); fs.unlinkSync(req.file.path); }
    if (!text.trim()) return res.status(400).json({ error: 'No text provided' });
    const sentences = splitSentences(text).slice(0, 15);
    let plagiarizedCount = 0;
    const results = [];
    for (const sentence of sentences) {
      if (sentence.trim().length < 20) continue;
      const sources = await searchGoogle(sentence);
      const isPlagiarized = sources.length > 0;
      if (isPlagiarized) plagiarizedCount++;
      results.push({ sentence: sentence.trim(), plagiarized: isPlagiarized, sources });
    }
    const score = sentences.length > 0 ? Math.round((plagiarizedCount / sentences.length) * 100) : 0;
    await History.create({ userId: req.user._id, toolUsed: 'Plagiarism Checker', inputSummary: text.substring(0, 100), resultSummary: `${score}% plagiarism` });
    res.json({ score, totalSentences: sentences.length, plagiarizedSentences: plagiarizedCount, results });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

export default router;
