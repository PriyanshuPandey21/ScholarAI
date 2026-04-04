import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Copy } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
export default function AIHumanizer() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const handleHumanize = async () => {
    if (!text.trim()) return toast.error("Please enter some text");
    setLoading(true);
    try {
      const { data } = await api.post("/api/ai/humanize", { text });
      setResult(data);
      toast.success("Text humanized!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Wand2 size={28} /> AI Humanizer
        </h1>
        <p className="text-gray-500">
          Rewrite AI-generated text to sound natural and human.
        </p>
      </div>
      <GlassCard>
        <textarea
          className="input-field min-h-[200px] resize-none w-full mb-4"
          placeholder="Paste AI-generated text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleHumanize}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" /> Humanizing...
            </>
          ) : (
            <>
              <Wand2 size={16} /> Humanize Text
            </>
          )}
        </button>
      </GlassCard>
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <GlassCard animate={false}>
              <h2 className="font-semibold text-white mb-4">
                Before / After Comparison
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-red-400 font-semibold uppercase mb-2">
                    AI Text
                  </p>
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 text-sm text-gray-400 leading-relaxed min-h-[150px]">
                    {result.original}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-green-400 font-semibold uppercase mb-2">
                    Humanized
                  </p>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20 text-sm text-gray-300 leading-relaxed min-h-[150px]">
                    {result.humanized}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.humanized);
                  toast.success("Copied!");
                }}
                className="btn-secondary mt-4 flex items-center gap-2 text-sm"
              >
                <Copy size={14} /> Copy Humanized Text
              </button>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
