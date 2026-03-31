import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import History from '../models/History.js';

const router = express.Router();
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

router.post('/compress', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF file required' });
  const inputPath = req.file.path;
  const outputFilename = `compressed-${Date.now()}.pdf`;
  const outputPath = path.join(UPLOADS_DIR, outputFilename);
  const originalSize = fs.statSync(inputPath).size;
  try {
    await execAsync(`gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/ebook -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputPath}" "${inputPath}"`);
    const compressedSize = fs.statSync(outputPath).size;
    fs.unlinkSync(inputPath);
    await History.create({ userId: req.user._id, toolUsed: 'PDF Compressor', inputSummary: req.file.originalname, resultSummary: `${Math.round(originalSize/1024)}KB → ${Math.round(compressedSize/1024)}KB` });
    res.json({ originalSize, compressedSize, downloadUrl: `/uploads/${outputFilename}`, reduction: Math.round((1-compressedSize/originalSize)*100) });
  } catch (err) {
    if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
    res.status(500).json({ error: 'Compression failed. Ensure Ghostscript is installed.' });
  }
});

router.post('/totext', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'PDF file required' });
  try {
    const data = await pdfParse(fs.readFileSync(req.file.path));
    fs.unlinkSync(req.file.path);
    await History.create({ userId: req.user._id, toolUsed: 'PDF Converter', inputSummary: req.file.originalname, resultSummary: `Extracted ${data.numpages} pages` });
    res.json({ text: data.text, pages: data.numpages });
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

router.post('/convert', protect, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'File required' });
  const { format = 'txt' } = req.body;
  try {
    const data = await pdfParse(fs.readFileSync(req.file.path));
    if (format === 'txt') {
      fs.unlinkSync(req.file.path);
      const outputFilename = `converted-${Date.now()}.txt`;
      fs.writeFileSync(path.join(UPLOADS_DIR, outputFilename), data.text);
      return res.json({ downloadUrl: `/uploads/${outputFilename}`, format });
    }
    if (format === 'docx') {
      const doc = new Document({
        sections: [{
          properties: {},
          children: data.text.split('\n').filter(line => line.trim().length > 0).map(line => new Paragraph({ children: [new TextRun(line)] }))
        }]
      });
      const buffer = await Packer.toBuffer(doc);
      fs.unlinkSync(req.file.path);
      const outputFilename = `converted-${Date.now()}.docx`;
      fs.writeFileSync(path.join(UPLOADS_DIR, outputFilename), buffer);
      return res.json({ downloadUrl: `/uploads/${outputFilename}`, format });
    }
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

export default router;
