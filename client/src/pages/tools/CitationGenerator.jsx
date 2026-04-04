import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, Copy } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
export default function CitationGenerator() {
  const [input, setInput] = useState("");
  const [inputType, setInputType] = useState("topic");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const handleGenerate = async () => {
    if (!input.trim()) return toast.error("Please enter a topic or URL");
    setLoading(true);
    try {
      const payload = inputType === "url" ? { url: input } : { topic: input };
      const { data } = await api.post("/api/tools/citation", payload);
      setResult(data.citation);
      toast.success("Citations generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <Quote size={28} /> Citation Generator
        </h1>
        <p className="text-gray-500">
          Generate APA, MLA, and IEEE citations instantly.
        </p>
      </div>
      <GlassCard>
        <div className="flex gap-2 mb-4">
          {["topic", "url"].map((t) => (
            <button
              key={t}
              onClick={() => setInputType(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${inputType === t ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white" : "glass text-gray-400 hover:text-white"}`}
            >
              {t === "topic" ? "Topic / Title" : "URL / DOI"}
            </button>
          ))}
        </div>
        <input
          type="text"
          className="input-field mb-4"
          placeholder={
            inputType === "url"
              ? "https://example.com/paper..."
              : "e.g. Machine Learning in Healthcare"
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Generating...
            </>
          ) : (
            <>
              <Quote size={16} />
              Generate Citations
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white">
                  Generated Citations
                </h2>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(result);
                    toast.success("Copied!");
                  }}
                  className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-1"
                >
                  <Copy size={13} />
                  Copy All
                </button>
              </div>
              <div className="space-y-3">
                {result
                  .split("\n\n")
                  .filter(Boolean)
                  .map((block, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white/3 border border-white/5"
                    >
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {block}
                      </p>
                    </div>
                  ))}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
