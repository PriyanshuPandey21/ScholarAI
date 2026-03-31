import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarCheck, Plus, Trash2, Check } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
export default function StudyPlanner() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState('all');
  useEffect(() => { axios.get('/api/planner').then(r => setItems(r.data)).catch(()=>{}).finally(() => setLoading(false)); }, []);
  const handleAdd = async (e) => {
    e.preventDefault(); if (!newSubject.trim()) return toast.error('Subject is required'); setAdding(true);
    try { const { data } = await axios.post('/api/planner', { subject:newSubject, deadline:newDeadline||undefined, notes:newNotes }); setItems(prev => [data,...prev]); setNewSubject(''); setNewDeadline(''); setNewNotes(''); toast.success('Task added!'); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setAdding(false); }
  };
  const toggleDone = async (id, done) => { try { const { data } = await axios.patch(`/api/planner/${id}`, { done:!done }); setItems(prev => prev.map(i => i._id===id ? data : i)); } catch { toast.error('Failed'); } };
  const deleteItem = async (id) => { try { await axios.delete(`/api/planner/${id}`); setItems(prev => prev.filter(i => i._id!==id)); toast.success('Deleted'); } catch { toast.error('Failed'); } };
  const filtered = items.filter(i => filter==='all' ? true : filter==='done' ? i.done : !i.done);
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><CalendarCheck size={28} /> Study Planner</h1><p className="text-gray-500">Organize your subjects, deadlines, and study goals.</p></div>
      <GlassCard>
        <form onSubmit={handleAdd} className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3"><input className="input-field" placeholder="Subject / Task *" value={newSubject} onChange={e => setNewSubject(e.target.value)} required /><input type="date" className="input-field" value={newDeadline} onChange={e => setNewDeadline(e.target.value)} /></div>
          <input className="input-field" placeholder="Notes (optional)" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
          <button type="submit" disabled={adding} className="btn-primary flex items-center gap-2">{adding?<LoadingSpinner size="sm"/>:<Plus size={16}/>} Add Task</button>
        </form>
      </GlassCard>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">{['all','pending','done'].map(f => (<button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter===f?'bg-primary-600 text-white':'glass text-gray-400 hover:text-white'}`}>{f.charAt(0).toUpperCase()+f.slice(1)}</button>))}</div>
        <span className="text-sm text-gray-600">{items.filter(i=>i.done).length}/{items.length} done</span>
      </div>
      {loading ? <div className="flex justify-center py-10"><LoadingSpinner size="lg"/></div> : (
        <AnimatePresence>
          {filtered.length === 0 ? <GlassCard><p className="text-center text-gray-600 py-8">No tasks found.</p></GlassCard> : (
            <div className="space-y-3">{filtered.map(item => (
              <motion.div key={item._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,x:-20}} className={`glass rounded-2xl p-4 flex items-start gap-4 transition-all ${item.done?'opacity-60':''}`}>
                <button onClick={() => toggleDone(item._id,item.done)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${item.done?'bg-green-500 border-green-500':'border-gray-600 hover:border-primary-500'}`}>{item.done && <Check size={13} className="text-white"/>}</button>
                <div className="flex-1 min-w-0"><p className={`font-medium text-white ${item.done?'line-through text-gray-500':''}`}>{item.subject}</p>{item.notes && <p className="text-sm text-gray-500 mt-0.5">{item.notes}</p>}{item.deadline && <p className="text-xs text-primary-400 mt-1">📅 {new Date(item.deadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</p>}</div>
                <button onClick={() => deleteItem(item._id)} className="text-gray-600 hover:text-red-400 transition-colors shrink-0"><Trash2 size={16}/></button>
              </motion.div>
            ))}</div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
