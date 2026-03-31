import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Search, ExternalLink } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export default function ResearchFinder() {
  const [query, setQuery] = useState('');
  const [papers, setPapers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const handleSearch = async (e) => {
    e.preventDefault(); if (!query.trim()) return; setLoading(true); setPapers([]);
    try { const { data } = await axios.get('/api/tools/papers', { params: { query, limit: 10 } }); setPapers(data.papers); setTotal(data.total); toast.success(`Found ${data.total.toLocaleString()} papers`); }
    catch (err) { toast.error(err.response?.data?.error || 'Search failed'); } finally { setLoading(false); }
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><BookOpen size={28} /> Research Paper Finder</h1><p className="text-gray-500">Search 200M+ academic papers via Semantic Scholar.</p></div>
      <GlassCard>
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="flex-1 relative"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type="text" className="input-field pl-10" placeholder="Search by topic, title, or keywords..." value={query} onChange={e => setQuery(e.target.value)} /></div>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 shrink-0">{loading?<LoadingSpinner size="sm"/>:<Search size={16}/>} Search</button>
        </form>
      </GlassCard>
      {loading && <div className="flex justify-center py-10"><LoadingSpinner size="lg"/></div>}
      {!loading && total > 0 && <p className="text-sm text-gray-500">{total.toLocaleString()} total results · showing top 10</p>}
      <AnimatePresence>
        <div className="space-y-4">{papers.map((paper,i) => (
          <motion.div key={paper.paperId||i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
            <GlassCard animate={false} className="hover:border-primary-500/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white leading-snug mb-2">{paper.title}</h3>
                  {paper.authors?.length > 0 && <p className="text-xs text-gray-500 mb-1">{paper.authors.slice(0,4).map(a=>a.name).join(', ')}{paper.authors.length>4?' ...':''}</p>}
                  {paper.abstract && <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mt-2">{paper.abstract}</p>}
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-600">{paper.year && <span>📅 {paper.year}</span>}{paper.citationCount!==undefined && <span>📖 {paper.citationCount.toLocaleString()} citations</span>}</div>
                </div>
                {paper.url && <a href={paper.url} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300 transition-colors shrink-0"><ExternalLink size={18}/></a>}
              </div>
            </GlassCard>
          </motion.div>
        ))}</div>
      </AnimatePresence>
      {!loading && papers.length===0 && query && <GlassCard><p className="text-center text-gray-500 py-8">No results found. Try a different query.</p></GlassCard>}
    </div>
  );
}
