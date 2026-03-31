import { useState } from 'react';
import { Hash } from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
export default function WordCounter() {
  const [text, setText] = useState('');
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length, charsNoSpace = text.replace(/\s/g,'').length;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const readingTime = Math.ceil(words/200);
  const stats = [{ label:'Words', value:words, color:'text-primary-400' },{ label:'Characters', value:chars, color:'text-accent-400' },{ label:'Chars (no space)', value:charsNoSpace, color:'text-purple-400' },{ label:'Sentences', value:sentences, color:'text-green-400' },{ label:'Paragraphs', value:paragraphs, color:'text-yellow-400' },{ label:'Reading Time', value:`${readingTime} min`, color:'text-pink-400' }];
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div><h1 className="page-title flex items-center gap-3"><Hash size={28} /> Word Counter</h1><p className="text-gray-500">Live word, character, sentence, and paragraph count.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{stats.map(({ label, value, color }) => (<GlassCard key={label} className="text-center py-4"><p className={`text-2xl font-display font-bold ${color}`}>{value}</p><p className="text-xs text-gray-500 mt-1">{label}</p></GlassCard>))}</div>
      <GlassCard>
        <textarea className="input-field min-h-[300px] resize-none w-full font-mono text-sm" placeholder="Start typing or paste your text here..." value={text} onChange={e => setText(e.target.value)} autoFocus />
        <div className="flex items-center justify-between mt-3 text-xs text-gray-600"><span>{words} words · {chars} chars</span><button onClick={() => setText('')} className="hover:text-gray-400 transition-colors">Clear</button></div>
      </GlassCard>
    </div>
  );
}
