import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { Code2 } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { LoadingSpinner, ProgressBar } from '../../components/ui/LoadingSpinner';
export default function CodePlagiarism() {
  const [code1, setCode1] = useState('');
  const [code2, setCode2] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleCheck = async () => {
    if (!code1.trim() || !code2.trim()) return toast.error('Please enter both code snippets');
    setLoading(true);
    try { const { data } = await axios.post('/api/tools/codeplague', { code1, code2 }); setResult(data); toast.success(`Similarity: ${data.similarity}%`); }
    catch (err) { toast.error(err.response?.data?.error || 'Check failed'); } finally { setLoading(false); }
  };
  const verdictColor = (v) => v==='High Similarity' ? 'text-red-400 bg-red-500/10 border-red-500/20' : v==='Moderate Similarity' ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' : 'text-green-400 bg-green-500/10 border-green-500/20';
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><Code2 size={28} /> Code Plagiarism Checker</h1><p className="text-gray-500">Compare two code snippets for similarity.</p></div>
      <div className="grid md:grid-cols-2 gap-4">
        <GlassCard><h2 className="font-semibold text-white mb-3">Snippet 1</h2><textarea className="input-field min-h-[250px] resize-none w-full font-mono text-sm" placeholder="// Paste first code snippet..." value={code1} onChange={e => setCode1(e.target.value)} /></GlassCard>
        <GlassCard><h2 className="font-semibold text-white mb-3">Snippet 2</h2><textarea className="input-field min-h-[250px] resize-none w-full font-mono text-sm" placeholder="// Paste second code snippet..." value={code2} onChange={e => setCode2(e.target.value)} /></GlassCard>
      </div>
      <div className="flex justify-center"><button onClick={handleCheck} disabled={loading} className="btn-primary flex items-center gap-2 px-10">{loading?<><LoadingSpinner size="sm"/>Comparing...</>:<><Code2 size={16}/>Compare Snippets</>}</button></div>
      <AnimatePresence>{result && (<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <GlassCard animate={false}>
          <div className="grid md:grid-cols-2 gap-6 items-center">
            <div><ProgressBar value={result.similarity} label="Similarity Score" color={result.similarity>80?'red':result.similarity>50?'yellow':'green'} /><div className={`mt-4 inline-block px-4 py-2 rounded-xl text-sm font-semibold border ${verdictColor(result.verdict)}`}>{result.verdict}</div></div>
            <div><p className="text-4xl font-display font-black text-center" style={{color:result.similarity>80?'#f87171':result.similarity>50?'#fbbf24':'#34d399'}}>{result.similarity}%</p><p className="text-center text-gray-500 text-sm">code similarity</p></div>
          </div>
          {result.matchedLines?.length > 0 && (<div className="mt-6"><p className="text-sm text-gray-400 mb-2 font-medium">{result.matchedLines.length} matching line(s):</p><div className="space-y-1 max-h-40 overflow-y-auto">{result.matchedLines.map((line,i) => (<div key={i} className="px-3 py-1.5 bg-red-500/5 border border-red-500/10 rounded-lg font-mono text-xs text-gray-400">{line}</div>))}</div></div>)}
        </GlassCard>
      </motion.div>)}</AnimatePresence>
    </div>
  );
}
