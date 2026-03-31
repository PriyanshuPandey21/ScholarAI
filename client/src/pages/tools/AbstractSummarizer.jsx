import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Copy } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import FileDropzone from '../../components/ui/FileDropzone';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export default function AbstractSummarizer() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const onDrop = useCallback((accepted) => setFile(accepted[0]), []);
  const handleSummarize = async () => {
    if (!file && !text.trim()) return toast.error('Please upload a PDF or paste text');
    setLoading(true);
    try { const form = new FormData(); if (file) form.append('file', file); else form.append('text', text); const { data } = await axios.post('/api/tools/summarize', form); setResult(data.summary); toast.success('Abstract generated!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Summarization failed'); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><FileText size={28} /> Abstract Summarizer</h1><p className="text-gray-500">Upload a research paper and get a 150-word abstract summary instantly.</p></div>
      <GlassCard>
        <FileDropzone onDrop={onDrop} accept={{ 'application/pdf': ['.pdf'] }} label="Drop your research paper PDF" />
        <div className="flex items-center gap-3 my-4"><div className="flex-1 h-px bg-white/5" /><span className="text-gray-600 text-sm">or paste text</span><div className="flex-1 h-px bg-white/5" /></div>
        <textarea className="input-field min-h-[120px] resize-none w-full mb-4" placeholder="Paste research paper content..." value={text} onChange={e => setText(e.target.value)} />
        <button onClick={handleSummarize} disabled={loading} className="btn-primary flex items-center gap-2">{loading?<><LoadingSpinner size="sm"/>Summarizing...</>:<><FileText size={16}/>Generate Abstract</>}</button>
      </GlassCard>
      <AnimatePresence>{result && (<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <GlassCard animate={false}>
          <div className="flex items-center justify-between mb-4"><h2 className="font-semibold text-white">Generated Abstract</h2><button onClick={()=>{navigator.clipboard.writeText(result);toast.success('Copied!');}} className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"><Copy size={13}/>Copy</button></div>
          <div className="p-5 rounded-xl bg-primary-500/5 border border-primary-500/20"><p className="text-gray-300 leading-relaxed text-sm">{result}</p></div>
          <p className="text-xs text-gray-600 mt-3">{result.split(' ').length} words</p>
        </GlassCard>
      </motion.div>)}</AnimatePresence>
    </div>
  );
}
