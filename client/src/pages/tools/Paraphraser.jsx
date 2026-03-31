import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw, Copy } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
const MODES = ['standard','fluency','creative','academic'];
const MODE_DESC = { standard:'Clear & concise', fluency:'Smooth & readable', creative:'Vivid & engaging', academic:'Formal & structured' };
export default function Paraphraser() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState('standard');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleParaphrase = async () => {
    if (!text.trim()) return toast.error('Please enter text');
    setLoading(true);
    try { const { data } = await axios.post('/api/paraphrase', { text, mode }); setResult(data); toast.success('Paraphrased!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><RefreshCw size={28} /> Paraphrasing Tool</h1><p className="text-gray-500">Rewrite text in different styles using GPT-4o.</p></div>
      <GlassCard>
        <div className="mb-4"><p className="text-sm text-gray-400 mb-2">Select mode:</p>
          <div className="flex flex-wrap gap-2">{MODES.map(m => (<button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode===m?'bg-gradient-to-r from-primary-600 to-accent-600 text-white shadow-glow':'glass text-gray-400 hover:text-white'}`}>{m.charAt(0).toUpperCase()+m.slice(1)} <span className="ml-1 text-xs opacity-60">· {MODE_DESC[m]}</span></button>))}</div>
        </div>
        <textarea className="input-field min-h-[180px] resize-none w-full mb-4" placeholder="Enter text to paraphrase..." value={text} onChange={e => setText(e.target.value)} />
        <button onClick={handleParaphrase} disabled={loading} className="btn-primary flex items-center gap-2">{loading?<><LoadingSpinner size="sm"/>Paraphrasing...</>:<><RefreshCw size={16}/>Paraphrase</>}</button>
      </GlassCard>
      <AnimatePresence>{result && (<motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
        <GlassCard animate={false}>
          <h2 className="font-semibold text-white mb-4">Result — <span className="text-primary-400 capitalize">{result.mode}</span> mode</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div><p className="text-xs text-gray-500 font-semibold uppercase mb-2">Original</p><div className="p-4 rounded-xl bg-white/3 text-sm text-gray-400 leading-relaxed min-h-[120px]">{result.original}</div></div>
            <div><p className="text-xs text-primary-400 font-semibold uppercase mb-2">Paraphrased</p><div className="p-4 rounded-xl bg-primary-500/5 border border-primary-500/20 text-sm text-gray-300 leading-relaxed min-h-[120px]">{result.paraphrased}</div></div>
          </div>
          <button onClick={()=>{navigator.clipboard.writeText(result.paraphrased);toast.success('Copied!');}} className="btn-secondary mt-4 flex items-center gap-2 text-sm"><Copy size={14}/>Copy Result</button>
        </GlassCard>
      </motion.div>)}</AnimatePresence>
    </div>
  );
}
