import express from 'express';
import { GoogleGenAI } from '@google/genai';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import mammoth from 'mammoth';
import fs from 'fs';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import History from '../models/History.js';

const router = express.Router();

// Helper to call Gemini and parse JSON safely
const generateGenAIParsed = async (prompt, systemInstruction = '') => {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || geminiKey === 'your_gemini_api_key_here') throw new Error('GEMINI_API_KEY is required');
  const ai = new GoogleGenAI({ apiKey: geminiKey });
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { temperature: 0.3, systemInstruction }
  });
  
  let resultJsonStr = response.text.trim();
  if (resultJsonStr.startsWith('\`\`\`json')) resultJsonStr = resultJsonStr.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  else if (resultJsonStr.startsWith('\`\`\`')) resultJsonStr = resultJsonStr.replace(/^```\s*/, '').replace(/\s*```$/, '');
  
  return JSON.parse(resultJsonStr);
};

// Tool 1: Notes Generator
router.post('/notes', protect, upload.single('file'), async (req, res) => {
  try {
    let text = req.body.text || '';
    const { topic = '', style = 'detailed notes' } = req.body;
    
    if (req.file) {
      if (req.file.originalname.endsWith('.pdf')) {
        text += (await pdfParse(fs.readFileSync(req.file.path))).text;
      } else if (req.file.originalname.endsWith('.docx')) {
        text += (await mammoth.extractRawText({ path: req.file.path })).value;
      } else {
        text += fs.readFileSync(req.file.path, 'utf8');
      }
      fs.unlinkSync(req.file.path);
    }
    
    if (!text.trim()) return res.status(400).json({ error: 'Source text required' });
    
    const prompt = `Convert the following study material into structured, easy-to-read ${style}. KEEP academic tone but simple language.
Topic: ${topic}
Material:
${text.substring(0, 10000)}

Return raw JSON strictly matching this structure:
{
  "title": "<Main Title>",
  "keyConcepts": ["<concept 1>", "<concept 2>"],
  "definitions": [{"term": "...", "definition": "..."}],
  "importantPoints": ["<point 1>"],
  "examples": ["<example 1>"],
  "summary": "<short paragraph summary>",
  "keyTerms": ["<term 1>"]
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Notes Generator', inputSummary: topic || 'Custom Text', resultSummary: 'Generated Notes' });
    res.json(parsed);
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message || 'Notes Generation failed' });
  }
});

// Tool 2: Flashcard Generator
router.post('/flashcards', protect, async (req, res) => {
  try {
    const { text, topic, count = 10, difficulty = 'medium' } = req.body;
    if (!text && !topic) return res.status(400).json({ error: 'Topic or text required' });
    
    const prompt = `Convert the following topic or notes into exact ${count} flashcards for quick revision. Difficulty: ${difficulty}.
Content: ${text || topic}

Return raw JSON strictly matching this structure:
{
  "flashcards": [
    { "q": "<Question>", "a": "<Concise Answer>" }
  ]
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Flashcard Generator', inputSummary: topic || 'Text', resultSummary: `Generated ${parsed.flashcards?.length} flashcards` });
    res.json(parsed.flashcards || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tool 3: Quiz Generator
router.post('/quiz', protect, async (req, res) => {
  try {
    const { text, topic, type = 'MCQ', count = 10, difficulty = 'medium' } = req.body;
    if (!text && !topic) return res.status(400).json({ error: 'Topic or text required' });
    
    const prompt = `Generate exactly ${count} practice questions for exams on the topic or text below. Type: ${type}, Difficulty: ${difficulty}.
Content: ${text || topic}

Format as strict raw JSON:
{
  "questions": [
    {
      "q": "<Question Text>",
      "options": ["A", "B", "C", "D"], // only needed if MCQ, omit or empty array if short answer
      "correct": "<Full text of the correct answer>",
      "explanation": "<Why this is correct>"
    }
  ]
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Quiz Generator', inputSummary: topic || 'Text', resultSummary: `Generated ${parsed.questions?.length} quiz questions` });
    res.json(parsed.questions || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tool 4: Code Debugger
router.post('/debug', protect, async (req, res) => {
  try {
    const { code, language } = req.body;
    if (!code) return res.status(400).json({ error: 'Code required' });
    
    const prompt = `Help a student fix errors in this ${language} code.
Code:
${code.substring(0, 5000)}

Format as strict raw JSON:
{
  "error": "<description of the logical or syntax error>",
  "explanation": "<explain the fix simply>",
  "correctedCode": "<the full corrected code block>",
  "bestPractice": "<one best practice suggestion>"
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Code Debugger', inputSummary: language, resultSummary: 'Debugged Code' });
    res.json(parsed);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tool 5: Interview Prep
router.post('/interview', protect, async (req, res) => {
  try {
    const { role, experienceLevel = 'fresher', questionType = 'mixed', count = 10 } = req.body;
    if (!role) return res.status(400).json({ error: 'Role required' });
    
    const prompt = `Generate ${count} ${questionType} interview questions for a ${experienceLevel} ${role}.
Format as strict raw JSON:
{
  "questions": [
    {
      "question": "<The question>",
      "sampleAnswer": "<A good sample answer>",
      "tip": "<Tip on how to answer this>"
    }
  ]
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Interview Prep', inputSummary: role, resultSummary: `Generated ${parsed.questions?.length} questions` });
    res.json(parsed.questions || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tool 6: Presentation Generator
router.post('/presentation', protect, async (req, res) => {
  try {
    const { topic, count = 10, style = 'professional' } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic required' });
    
    const prompt = `Generate a structured presentation outline for ${topic}. Exact ${count} slides. Style: ${style}.
Format as strict raw JSON:
{
  "slides": [
    {
      "title": "<Slide Title>",
      "points": ["<point 1>", "<point 2>"]
    }
  ]
}`;

    const parsed = await generateGenAIParsed(prompt);
    await History.create({ userId: req.user._id, toolUsed: 'Presentation Gen', inputSummary: topic, resultSummary: `Generated ${parsed.slides?.length} slides` });
    res.json(parsed.slides || []);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
