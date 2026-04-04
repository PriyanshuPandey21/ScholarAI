import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Scan } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import {
  LoadingSpinner,
  ProgressBar,
} from "../../components/ui/LoadingSpinner";
export default function AIDetector() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const handleDetect = async () => {
    if (!text.trim()) return toast.error("Please enter some text");
    setLoading(true);
    setResult(null);
    try {
      const { data } = await api.post("/api/ai/detect", { text });
      setResult(data);
      toast.success("Detection complete!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Detection failed");
    } finally {
      setLoading(false);
    }
  };
  const aiPct = result ? Math.round((result.score || 0) * 100) : 0;
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Bot size={28} /> AI Detector
        </h1>
        <p className="text-gray-500">
          Detect if content is AI-generated with sentence-level probability
          scores.
        </p>
      </div>
      <GlassCard>
        <textarea
          className="input-field min-h-[200px] resize-none w-full mb-4"
          placeholder="Paste text to analyze..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleDetect}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" /> Analyzing...
            </>
          ) : (
            <>
              <Scan size={16} /> Detect AI Content
            </>
          )}
        </button>
      </GlassCard>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="grid md:grid-cols-2 gap-6">
              <GlassCard animate={false}>
                <h2 className="font-semibold text-white mb-6">
                  Detection Result
                </h2>
                <div className="space-y-4">
                  <ProgressBar
                    value={aiPct}
                    label="AI-Generated"
                    color={aiPct > 60 ? "red" : aiPct > 30 ? "yellow" : "green"}
                  />
                  <ProgressBar
                    value={100 - aiPct}
                    label="Human Written"
                    color="primary"
                  />
                </div>
                <div className="mt-6 text-center">
                  <p
                    className={`text-5xl font-display font-black ${aiPct > 60 ? "text-red-400" : aiPct > 30 ? "text-yellow-400" : "text-green-400"}`}
                  >
                    {aiPct}%
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    likely AI-generated
                  </p>
                  <div
                    className={`mt-4 inline-block px-4 py-1.5 rounded-full text-sm font-semibold ${aiPct > 60 ? "bg-red-500/20 text-red-400" : aiPct > 30 ? "bg-yellow-500/20 text-yellow-400" : "bg-green-500/20 text-green-400"}`}
                  >
                    {aiPct > 60
                      ? "Likely AI"
                      : aiPct > 30
                        ? "Mixed Content"
                        : "Likely Human"}
                  </div>
                </div>
              </GlassCard>
              <GlassCard animate={false}>
                <h2 className="font-semibold text-white mb-4">
                  Sentence Scores
                </h2>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {(result.sentence_scores || []).map((s, i) => {
                    const pct = Math.round((s.score || 0) * 100);
                    return (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${pct > 60 ? "bg-red-400" : pct > 30 ? "bg-yellow-400" : "bg-green-400"}`}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 truncate">
                            {s.sentence?.substring(0, 80)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-white/5 rounded-full h-1">
                              <div
                                className={`h-1 rounded-full ${pct > 60 ? "bg-red-400" : pct > 30 ? "bg-yellow-400" : "bg-green-400"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 shrink-0">
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
