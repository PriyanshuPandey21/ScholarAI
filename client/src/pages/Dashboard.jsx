import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Clock, TrendingUp, BarChart2, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get('/api/history?limit=10'), axios.get('/api/history/summary')])
      .then(([h, s]) => { setHistory(h.data); setSummary(s.data); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500">Here's your academic activity overview.</p>
      </motion.div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ icon: Activity, label: 'Total Uses', value: summary.reduce((a,s) => a+s.count, 0) },{ icon: TrendingUp, label: 'Tools Used', value: summary.length },{ icon: BarChart2, label: 'This Session', value: history.length },{ icon: Clock, label: 'Saved Records', value: summary.reduce((a,s) => a+s.count, 0) }].map(({ icon: Icon, label, value }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i*0.07 }} className="glass rounded-2xl p-5">
            <Icon size={20} className="text-primary-400 mb-3" /><p className="text-2xl font-display font-bold text-white">{value}</p><p className="text-xs text-gray-500 mt-1">{label}</p>
          </motion.div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><BarChart2 size={18} className="text-primary-400" /> Tool Usage</h2>
          {summary.length === 0 ? <p className="text-gray-600 text-sm text-center py-8">No usage yet. Try a tool from the sidebar!</p> : (
            <div className="space-y-3">{summary.slice(0,8).map(s => (<div key={s._id}><div className="flex justify-between text-sm mb-1"><span className="text-gray-400">{s._id}</span><span className="text-white font-medium">{s.count}×</span></div><div className="w-full bg-white/5 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${Math.min(100,(s.count/(summary[0]?.count||1))*100)}%` }} /></div></div>))}</div>
          )}
        </GlassCard>
        <GlassCard>
          <h2 className="font-display font-semibold text-white mb-4 flex items-center gap-2"><Clock size={18} className="text-primary-400" /> Recent Activity</h2>
          {history.length === 0 ? <p className="text-gray-600 text-sm text-center py-8">No recent activity.</p> : (
            <div className="space-y-3">{history.map(h => (<div key={h._id} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors"><div className="w-2 h-2 rounded-full bg-primary-500 mt-2 shrink-0" /><div className="min-w-0"><p className="text-sm font-medium text-white">{h.toolUsed}</p><p className="text-xs text-gray-600 truncate">{h.inputSummary}</p><p className="text-xs text-gray-700 mt-0.5">{new Date(h.createdAt).toLocaleString()}</p></div></div>))}</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
