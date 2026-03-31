import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileSearch, Bot, Wand2, SpellCheck, RefreshCw, FileDown, FileOutput, Quote, FileText, Hash, CalendarCheck, Code2, BookOpen, ChevronLeft, GraduationCap, FileCheck, TerminalSquare, Layers, Briefcase, Presentation, HelpCircle } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/app' },
  { label: 'Abstract Summarizer', icon: FileText, to: '/app/summarizer' },
  { label: 'AI Detector', icon: Bot, to: '/app/ai-detector' },
  { label: 'AI Humanizer', icon: Wand2, to: '/app/ai-humanizer' },
  { label: 'AI Notes Gen', icon: FileText, to: '/app/notes-generator' },
  { label: 'ATS Checker', icon: FileCheck, to: '/app/ats-checker' },
  { label: 'Citation Generator', icon: Quote, to: '/app/citation' },
  { label: 'Code Debugger', icon: TerminalSquare, to: '/app/code-debugger' },
  { label: 'Code Plagiarism', icon: Code2, to: '/app/code-plagiarism' },
  { label: 'Flashcard Gen', icon: Layers, to: '/app/flashcard-generator' },
  { label: 'Grammar Checker', icon: SpellCheck, to: '/app/grammar' },
  { label: 'Interview Prep', icon: Briefcase, to: '/app/interview-prep' },
  { label: 'Paraphraser', icon: RefreshCw, to: '/app/paraphrase' },
  { label: 'PDF Compressor', icon: FileDown, to: '/app/pdf-compress' },
  { label: 'PDF Converter', icon: FileOutput, to: '/app/pdf-convert' },
  { label: 'Plagiarism Checker', icon: FileSearch, to: '/app/plagiarism' },
  { label: 'Presentation Gen', icon: Presentation, to: '/app/presentation-generator' },
  { label: 'Quiz Generator', icon: HelpCircle, to: '/app/quiz-generator' },
  { label: 'Research Finder', icon: BookOpen, to: '/app/research' },
  { label: 'Study Planner', icon: CalendarCheck, to: '/app/study-planner' },
  { label: 'Word Counter', icon: Hash, to: '/app/word-counter' },
];

export default function Sidebar({ open, setOpen }) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.25 }}
          className="sidebar flex flex-col overflow-hidden shrink-0 relative z-20">
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-glow shrink-0">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg gradient-text">ScholarAI</span>
            <button onClick={() => setOpen(false)} className="ml-auto text-gray-500 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <NavLink key={to} to={to} end={to === '/app'}
                className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
                <Icon size={17} className="shrink-0" /><span className="truncate">{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="px-5 py-4 border-t border-white/5"><p className="text-xs text-gray-600 text-center">ScholarAI v1.0</p></div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
