import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { GraduationCap, ArrowRight, FileSearch, Bot, SpellCheck, RefreshCw, FileDown, BookOpen, Zap, Shield, Clock, Quote, FileText, Hash, CalendarCheck, Code2, FileCheck, FileOutput, Wand2, Layers, HelpCircle, TerminalSquare, Briefcase, Presentation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const features = [
  { icon: FileSearch, title: 'Plagiarism Checker', desc: 'Detect duplicate content with sentence-level analysis', color: 'from-violet-500 to-purple-600' },
  { icon: Bot, title: 'AI Detector', desc: 'Identify AI-generated content with probability scores', color: 'from-blue-500 to-cyan-600' },
  { icon: SpellCheck, title: 'Grammar Checker', desc: 'Real-time grammar, spelling & punctuation corrections', color: 'from-green-500 to-emerald-600' },
  { icon: RefreshCw, title: 'Paraphrasing Tool', desc: 'Rewrite in Standard, Fluency, Creative, or Academic mode', color: 'from-orange-500 to-amber-600' },
  { icon: Quote, title: 'Citation Generator', desc: 'Instantly format citations in APA, MLA, Chicago, and more', color: 'from-rose-500 to-pink-600' },
  { icon: FileText, title: 'Abstract Summarizer', desc: 'Condense long papers into precise, abstract summaries', color: 'from-teal-500 to-emerald-600' },
  { icon: Hash, title: 'Word Counter', desc: 'Advanced character, word, and reading time analytics', color: 'from-slate-500 to-gray-600' },
  { icon: BookOpen, title: 'Research Finder', desc: 'Search 200M+ academic papers from Semantic Scholar', color: 'from-sky-500 to-blue-600' },
  { icon: CalendarCheck, title: 'Study Planner', desc: 'Organize tasks, exams, and automatic study schedules', color: 'from-fuchsia-500 to-pink-600' },
  { icon: Code2, title: 'Code Plagiarism', desc: 'Check programming assignments for code similarity', color: 'from-indigo-500 to-blue-600' },
  { icon: FileCheck, title: 'ATS Score Checker', desc: 'Evaluate resumes against job descriptions with AI', color: 'from-emerald-500 to-teal-600' },
  { icon: FileOutput, title: 'PDF Converter', desc: 'Convert beautiful formatted Docs to PDFs instantly', color: 'from-red-500 to-orange-600' },
  { icon: FileDown, title: 'PDF Compressor', desc: 'Reduce file sizes without losing visual quality', color: 'from-pink-500 to-rose-600' },
  { icon: Wand2, title: 'AI Humanizer', desc: 'Add natural, human-like cadence to AI generated text', color: 'from-yellow-400 to-amber-500' },
  { icon: FileText, title: 'AI Notes Generator', desc: 'Turn raw text into structured academic study notes', color: 'from-amber-500 to-orange-600' },
  { icon: Layers, title: 'Flashcard Generator', desc: 'Generate 3D interactive flashcards for quick revision', color: 'from-purple-500 to-fuchsia-600' },
  { icon: HelpCircle, title: 'Quiz Generator', desc: 'Generate multi-choice exams with detailed scorecards', color: 'from-cyan-500 to-blue-600' },
  { icon: TerminalSquare, title: 'Code Debugger', desc: 'Locate syntax errors and get AI corrected code', color: 'from-gray-600 to-gray-800' },
  { icon: Briefcase, title: 'Interview Prep', desc: 'Career-tailored interview questions and pro-tips', color: 'from-sky-500 to-indigo-600' },
  { icon: Presentation, title: 'Presentation Gen', desc: 'Create structured slide-deck outlines in one click', color: 'from-teal-500 to-emerald-600' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen">
      <nav className="glass border-b border-white/5 fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center"><GraduationCap size={18} className="text-white" /></div>
            <span className="font-display font-bold text-lg gradient-text">ScholarAI</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? <Link to="/app" className="btn-primary flex items-center gap-2">Dashboard <ArrowRight size={16} /></Link> :
              <><Link to="/login" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">Sign In</Link>
              <Link to="/login" className="btn-primary flex items-center gap-2 text-sm py-2 px-4">Get Started <ArrowRight size={14} /></Link></>}
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto relative">
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 right-10 w-96 h-96 bg-accent-600/15 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-sm text-primary-400 font-medium mb-8 border border-primary-500/20">
            <Zap size={14} /> Your All-in-One Academic Companion
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black leading-tight mb-6">
            Supercharge Your<span className="block gradient-text">Academic Success</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-2xl mx-auto mb-10">20 powerful tools for B.Tech students — plagiarism detection, AI writing tools, grammar checking, PDF utilities, and more.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/login" className="btn-primary flex items-center gap-2 text-base px-8 py-4">Start for Free <ArrowRight size={18} /></Link>
            <a href="#features" className="btn-secondary text-base px-8 py-4 cursor-pointer inline-flex items-center justify-center">View All Tools</a>
          </div>
        </motion.div>
      </section>

      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
          {[{ icon: Zap, value: '20+', label: 'Academic Tools' }, { icon: Shield, value: '100%', label: 'Privacy Focused' }, { icon: Clock, value: '<2s', label: 'Response Time' }].map(({ icon: Icon, value, label }) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="glass-hover rounded-2xl p-6 text-center">
              <Icon size={24} className="text-primary-400 mx-auto mb-3" />
              <p className="text-3xl font-display font-black gradient-text">{value}</p>
              <p className="text-gray-500 text-sm mt-1">{label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="py-16 px-6 max-w-6xl mx-auto scroll-mt-24">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
          Everything You Need to <span className="gradient-text">Ace Your Degree</span>
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*0.08 }} className="glass-hover rounded-2xl p-6 group">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}><Icon size={22} className="text-white" /></div>
              <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="glass rounded-3xl p-12 max-w-3xl mx-auto border border-primary-500/20">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to <span className="gradient-text">Scholar Smarter?</span></h2>
          <p className="text-gray-400 mb-8">Join thousands of students who use ScholarAI every day.</p>
          <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4">Get Started Free <ArrowRight size={18} /></Link>
        </motion.div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">About <span className="gradient-text">ScholarAI</span></h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-6">
            ScholarAI is a comprehensive toolkit designed specifically for students and researchers. Our mission is to provide accessible, powerful AI-driven tools that simplify the academic workflow, from content analysis to comprehensive research assistance.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            Built with a deep understanding of academic challenges, ScholarAI aims to boost your productivity without compromising on privacy, security, or the integrity of your work.
          </p>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm">© 2026 ScholarAI. Built for students, by students.</footer>
    </div>
  );
}
