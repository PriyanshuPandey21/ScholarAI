import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Upload, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import FileDropzone from '../../components/ui/FileDropzone';
import { LoadingSpinner, ProgressBar } from '../../components/ui/LoadingSpinner';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PlagiarismChecker() {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const onDrop = useCallback((accepted) => setFile(accepted[0]), []);
  const handleCheck = async () => {
    if (!text.trim() && !file) return toast.error('Please enter text or upload a file');
    setLoading(true); setResult(null);
    try {
      const form = new FormData();
      if (file) form.append('file', file); else form.append('text', text);
      const { data } = await axios.post('/api/plagiarism/check', form);
      setResult(data); toast.success('Plagiarism check complete!');
    } catch (err) { toast.error(err.response?.data?.error || 'Check failed'); } finally { setLoading(false); }
  };
  const pieData = result ? [{ name: 'Plagiarized', value: result.score }, { name: 'Original', value: 100-result.score }] : [];
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><FileSearch size={28} /> Plagiarism Checker</h1><p className="text-gray-500">Detect copied content with sentence-level analysis and source links.</p></div>
      <GlassCard>
        <div className="space-y-4">
          <FileDropzone onDrop={onDrop} accept={{ 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] }} label="Drop PDF, DOCX, or TXT file" />
          <div className="flex items-center gap-3"><div className="flex-1 h-px bg-white/5" /><span className="text-gray-600 text-sm">or paste text</span><div className="flex-1 h-px bg-white/5" /></div>
          <textarea className="input-field min-h-[150px] resize-none" placeholder="Paste your text here..." value={text} onChange={e => setText(e.target.value)} />
          <button onClick={handleCheck} disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center">
            {loading ? <><LoadingSpinner size="sm" /> Checking...</> : <><Upload size={16} /> Check Plagiarism</>}
          </button>
        </div>
      </GlassCard>
      <AnimatePresence>{result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard animate={false}>
              <h2 className="font-semibold text-white mb-4">Plagiarism Score</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">{pieData.map((_, i) => <Cell key={i} fill={['#ef4444','#8b5cf6'][i]} />)}</Pie><Tooltip formatter={v => `${v}%`} contentStyle={{ background: '#0f0f23', border: '1px solid #3a3a5c', borderRadius: 8 }} /><Legend /></PieChart>
              </ResponsiveContainer>
              <div className="text-center mt-2"><span className={`text-4xl font-display font-black ${result.score > 30 ? 'text-red-400' : 'text-green-400'}`}>{result.score}%</span><p className="text-gray-500 text-sm">Plagiarized content</p></div>
            </GlassCard>
            <GlassCard animate={false}>
              <h2 className="font-semibold text-white mb-4">Summary</h2>
              <ProgressBar value={result.score} label="Plagiarism" color={result.score > 50 ? 'red' : result.score > 20 ? 'yellow' : 'green'} />
              <p className="text-gray-500 text-sm mt-4">{result.totalSentences} sentences analyzed, {result.plagiarizedSentences} flagged.</p>
              <div className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${result.score > 30 ? 'bg-red-500/10 border border-red-500/20' : 'bg-green-500/10 border border-green-500/20'}`}>
                {result.score > 30 ? <AlertCircle size={20} className="text-red-400" /> : <CheckCircle size={20} className="text-green-400" />}
                <span className="text-sm text-gray-300">{result.score > 30 ? 'High plagiarism detected.' : 'Content appears mostly original.'}</span>
              </div>
            </GlassCard>
          </div>
          <GlassCard animate={false}>
            <h2 className="font-semibold text-white mb-4">Sentence Analysis</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {result.results.map((r, i) => (
                <div key={i} className={`p-4 rounded-xl border ${r.plagiarized ? 'border-red-500/30 bg-red-500/5' : 'border-white/5 bg-white/3'}`}>
                  <p className="text-sm text-gray-300 mb-2">{r.sentence}</p>
                  {r.plagiarized && r.sources.slice(0,2).map((s,j) => (
                    <a key={j} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"><ExternalLink size={11} /> {s.title?.substring(0,60)}...</a>
                  ))}
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}
