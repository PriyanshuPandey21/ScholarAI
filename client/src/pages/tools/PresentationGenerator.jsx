import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Presentation, Search, Copy, Download, Projector, ChevronRight } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export default function PresentationGenerator() {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(10);
  const [style, setStyle] = useState('professional');
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return toast.error('Please enter a presentation topic');
    
    setLoading(true);
    setSlides([]);

    try {
      const { data } = await axios.post('/api/generators/presentation', { topic, count, style });
      setSlides(data);
      toast.success('Presentation outline generated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!slides.length) return;
    const textData = slides.map((s, i) => `Slide ${i+1}: ${s.title}\n${s.points?.map(p => '• ' + p).join('\n')}`).join('\n\n');
    navigator.clipboard.writeText(textData.trim());
    toast.success('Copied outline to clipboard');
  };

  const handleDownloadDraft = () => {
    if (!slides.length) return;
    const textData = slides.map((s, i) => `Slide ${i+1}: ${s.title}\n${s.points?.map(p => '• ' + p).join('\n')}`).join('\n\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic.replace(/\\s+/g, '_')}_presentation_outline.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloading outline draft');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3"><Presentation size={28} /> Presentation Generator</h1>
        <p className="text-gray-500">Generate a structured outline and slide-deck content for your upcoming presentation.</p>
      </div>

      <GlassCard>
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium text-gray-400">Presentation Topic</label>
              <input type="text" className="input-field w-full text-lg font-medium" placeholder="e.g. The Impact of AI on Modern Software Engineering" value={topic} onChange={e => setTopic(e.target.value)} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Slides</label>
                <input type="number" min="5" max="20" className="input-field w-full" value={count} onChange={e => setCount(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Style</label>
                <select className="input-field w-full bg-background" value={style} onChange={e => setStyle(e.target.value)}>
                  <option value="academic">Academic</option>
                  <option value="professional">Professional</option>
                  <option value="simple">Simple</option>
                </select>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading || !topic.trim()} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><LoadingSpinner size="sm"/> Generating Slide Deck...</> : <><Search size={18}/> Draft Presentation</>}
          </button>
        </form>
      </GlassCard>

      {slides.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-medium text-white flex items-center gap-3">
              <Projector size={24} className="text-primary-500" /> Deck Outline
            </h2>
            <div className="flex gap-2">
              <button onClick={handleCopy} className="btn-secondary py-1.5 px-3 flex items-center gap-2"><Copy size={16}/> Copy All</button>
              <button onClick={handleDownloadDraft} className="btn-primary py-1.5 px-3 flex items-center gap-2"><Download size={16}/> Download PPT Draft</button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {slides.map((s, i) => (
              <GlassCard key={i} className="flex flex-col h-full bg-gradient-to-br from-white/5 to-transparent hover:border-primary-500/30 transition-colors">
                <div className="flex items-start gap-4 mb-4 border-b border-white/5 pb-4">
                  <div className="flex-col flex items-center justify-center w-12 h-12 rounded-xl bg-primary-900/30 text-primary-400 border border-primary-500/20 shrink-0">
                    <span className="text-[10px] uppercase font-bold tracking-widest leading-none opacity-80 mb-0.5">Slide</span>
                    <span className="text-lg font-display font-bold leading-none">{i + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white leading-snug pt-1">{s.title}</h3>
                </div>
                
                <ul className="space-y-4 flex-1">
                  {s.points?.map((point, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <ChevronRight size={16} className="text-primary-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300 leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
