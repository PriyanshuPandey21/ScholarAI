import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

import authRoutes from './routes/auth.js';
import plagiarismRoutes from './routes/plagiarism.js';
import aiRoutes from './routes/ai.js';
import grammarRoutes from './routes/grammar.js';
import paraphraseRoutes from './routes/paraphrase.js';
import pdfRoutes from './routes/pdf.js';
import toolsRoutes from './routes/tools.js';
import plannerRoutes from './routes/planner.js';
import historyRoutes from './routes/history.js';
import generatorsRoutes from './routes/generators.js';
import { getKeyStats, totalKeys } from './utils/geminiClient.js';

import './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(session({ secret: process.env.SESSION_SECRET || 'scholarai-secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/auth', authRoutes);
app.use('/api/plagiarism', plagiarismRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/grammar', grammarRoutes);
app.use('/api/paraphrase', paraphraseRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/tools', toolsRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/generators', generatorsRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/ai-status', (req, res) => {
  res.json({
    totalKeys,
    keys: getKeyStats(),
    note: 'Key values are never exposed — only stats are shown here.'
  });
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarai')
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err); process.exit(1); });

export default app;
