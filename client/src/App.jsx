import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import AppLayout from './components/layout/AppLayout';
import PlagiarismChecker from './pages/tools/PlagiarismChecker';
import AIDetector from './pages/tools/AIDetector';
import AIHumanizer from './pages/tools/AIHumanizer';
import GrammarChecker from './pages/tools/GrammarChecker';
import Paraphraser from './pages/tools/Paraphraser';
import PDFCompressor from './pages/tools/PDFCompressor';
import PDFConverter from './pages/tools/PDFConverter';
import CitationGenerator from './pages/tools/CitationGenerator';
import AbstractSummarizer from './pages/tools/AbstractSummarizer';
import WordCounter from './pages/tools/WordCounter';
import StudyPlanner from './pages/tools/StudyPlanner';
import CodePlagiarism from './pages/tools/CodePlagiarism';
import ResearchFinder from './pages/tools/ResearchFinder';
import ATSChecker from './pages/tools/ATSChecker';
import AINotesGenerator from './pages/tools/AINotesGenerator';
import FlashcardGenerator from './pages/tools/FlashcardGenerator';
import QuizGenerator from './pages/tools/QuizGenerator';
import CodeDebugger from './pages/tools/CodeDebugger';
import InterviewPrep from './pages/tools/InterviewPrep';
import PresentationGenerator from './pages/tools/PresentationGenerator';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  return isAuthenticated ? children : <Navigate to="/login" state={{ from: location }} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/callback" element={<AuthCallback />} />
      <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="plagiarism" element={<PlagiarismChecker />} />
        <Route path="ai-detector" element={<AIDetector />} />
        <Route path="ai-humanizer" element={<AIHumanizer />} />
        <Route path="grammar" element={<GrammarChecker />} />
        <Route path="paraphrase" element={<Paraphraser />} />
        <Route path="pdf-compress" element={<PDFCompressor />} />
        <Route path="pdf-convert" element={<PDFConverter />} />
        <Route path="citation" element={<CitationGenerator />} />
        <Route path="summarizer" element={<AbstractSummarizer />} />
        <Route path="word-counter" element={<WordCounter />} />
        <Route path="study-planner" element={<StudyPlanner />} />
        <Route path="code-plagiarism" element={<CodePlagiarism />} />
        <Route path="research" element={<ResearchFinder />} />
        <Route path="ats-checker" element={<ATSChecker />} />
        <Route path="notes-generator" element={<AINotesGenerator />} />
        <Route path="flashcard-generator" element={<FlashcardGenerator />} />
        <Route path="quiz-generator" element={<QuizGenerator />} />
        <Route path="code-debugger" element={<CodeDebugger />} />
        <Route path="interview-prep" element={<InterviewPrep />} />
        <Route path="presentation-generator" element={<PresentationGenerator />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" toastOptions={{ style: { background: 'var(--glass-bg)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', backdropFilter: 'blur(12px)' } }} />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
