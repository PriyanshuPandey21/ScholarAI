import express from 'express';
import axios from 'axios';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import History from '../models/History.js';
import { callGemini, callGeminiJSON } from '../utils/geminiClient.js';

const router = express.Router();

function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2, shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  const editDistance = (a, b) => {
    const matrix = Array.from({ length: b.length+1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++)
      for (let j = 1; j <= a.length; j++)
        matrix[i][j] = b[i-1] === a[j-1] ? matrix[i-1][j-1] : Math.min(matrix[i-1][j-1]+1, matrix[i][j-1]+1, matrix[i-1][j]+1);
    return matrix[b.length][a.length];
  };
  return (longer.length - editDistance(longer, shorter)) / longer.length;
}

router.post('/citation', protect, async (req, res) => {
  try {
    const { topic, url } = req.body;
    if (!topic && !url) return res.status(400).json({ error: 'Topic or URL required' });
    const input = url || topic;

    const citation = await callGemini(input, {
      systemInstruction: 'Generate APA, MLA, and IEEE citations for the given topic or URL. Format as APA:, MLA:, IEEE: on separate lines.',
      temperature: 0.3,
    });

    await History.create({ userId: req.user._id, toolUsed: 'Citation Generator', inputSummary: input.substring(0, 100), resultSummary: citation.substring(0, 100) });
    res.json({ citation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/summarize', protect, upload.single('file'), async (req, res) => {
  try {
    let text = req.body.text || '';
    if (req.file) { text = (await pdfParse(fs.readFileSync(req.file.path))).text; fs.unlinkSync(req.file.path); }
    if (!text.trim()) return res.status(400).json({ error: 'No text provided' });

    const summary = await callGemini(text.substring(0, 8000), {
      systemInstruction: 'Generate a concise 150-word academic abstract covering objective, methods, results, and conclusion. Return ONLY the abstract.',
      temperature: 0.5,
    });

    await History.create({ userId: req.user._id, toolUsed: 'Abstract Summarizer', inputSummary: text.substring(0, 100), resultSummary: summary.substring(0, 100) });
    res.json({ summary });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/codeplague', protect, async (req, res) => {
  try {
    const { code1, code2 } = req.body;
    if (!code1 || !code2) return res.status(400).json({ error: 'Both code snippets required' });
    const normalize = c => c.replace(/\s+/g,' ').trim().toLowerCase();
    const score = Math.round(similarity(normalize(code1), normalize(code2)) * 100);
    const lines1 = code1.split('\n'), lines2 = code2.split('\n');
    const matchedLines = lines1.filter(l => l.trim().length > 3 && lines2.some(l2 => l2.trim() === l.trim()));
    await History.create({ userId: req.user._id, toolUsed: 'Code Plagiarism', inputSummary: code1.substring(0, 50), resultSummary: `Similarity: ${score}%` });
    res.json({ similarity: score, matchedLines, verdict: score > 80 ? 'High Similarity' : score > 50 ? 'Moderate Similarity' : 'Low Similarity' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/papers', protect, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    if (!query) return res.status(400).json({ error: 'Query required' });
    const headers = {};
    if (process.env.SEMANTIC_SCHOLAR_API_KEY) headers['x-api-key'] = process.env.SEMANTIC_SCHOLAR_API_KEY;
    
    let papers = [];
    let total = 0;
    
    try {
      const { data } = await axios.get('https://api.semanticscholar.org/graph/v1/paper/search', { params: { query, limit, fields: 'title,authors,year,abstract,url,citationCount' }, headers });
      papers = data.data || [];
      total = data.total || 0;
    } catch (apiErr) {
      if (apiErr.response?.status === 429 || apiErr.response?.status === 403) {
        const crUrl = `https://api.crossref.org/works?query=${encodeURIComponent(query)}&select=title,author,issued,abstract,URL,is-referenced-by-count&rows=${limit}`;
        const { data } = await axios.get(crUrl);
        total = data.message['total-results'] || 0;
        papers = (data.message.items || []).map(item => ({
          paperId: item.URL || Math.random().toString(),
          title: item.title?.[0] || 'Unknown Title',
          authors: (item.author || []).map(a => ({ name: `${a.given || ''} ${a.family || ''}`.trim() })),
          year: item.issued?.['date-parts']?.[0]?.[0] || null,
          abstract: item.abstract ? item.abstract.replace(/(<([^>]+)>)/gi, "") : null,
          url: item.URL,
          citationCount: item['is-referenced-by-count'] || 0
        }));
      } else {
        return res.status(500).json({ error: apiErr.response?.data?.message || apiErr.message });
      }
    }

    await History.create({ userId: req.user._id, toolUsed: 'Research Finder', inputSummary: query, resultSummary: `Found ${total} papers` });
    res.json({ papers, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/ats', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Resume file required' });
    const { jobDescription = '' } = req.body;
    let text = '';
    
    if (req.file.originalname.endsWith('.pdf')) {
      text = (await pdfParse(fs.readFileSync(req.file.path))).text;
    } else if (req.file.originalname.endsWith('.docx')) {
      text = (await mammoth.extractRawText({ path: req.file.path })).value;
    } else {
      text = fs.readFileSync(req.file.path, 'utf8');
    }
    fs.unlinkSync(req.file.path);
    
    if (!text.trim()) return res.status(400).json({ error: 'Failed to extract text from file' });

    const prompt = `Assess this resume for ATS compatibility. ${jobDescription ? 'Compare it against the provided Job Description.' : 'Perform a general ATS and resume best-practices check.'}
    
Resume:
${text.substring(0, 5000)}

${jobDescription ? 'Job Description:\n' + jobDescription.substring(0, 3000) : ''}

You MUST return a raw JSON object with NO markdown formatting, NO backticks, and NO code blocks. The JSON must have this exact structure:
{
  "score": <number between 0 and 100>,
  "summary": "<short string summarizing the resume's quality>",
  "missingKeywords": ["<keyword1>", "<keyword2>"],
  "formattingIssues": ["<issue1>"],
  "recommendations": ["<recommendation1>"]
}`;

    const result = await callGeminiJSON(prompt, { temperature: 0.2 });
    await History.create({ userId: req.user._id, toolUsed: 'ATS Checker', inputSummary: req.file.originalname, resultSummary: `Score: ${result.score}%` });
    res.json(result);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message || 'ATS Analysis failed' });
  }
});

export default router;
