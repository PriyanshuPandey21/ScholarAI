import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  TerminalSquare,
  BugPlay,
  Copy,
  AlertOctagon,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const LANGUAGES = [
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "SQL",
  "HTML/CSS",
  "TypeScript",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
];

export default function CodeDebugger() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState(LANGUAGES[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleDebug = async (e) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Please paste your code to debug");

    setLoading(true);
    setResult(null);

    try {
      const { data } = await api.post("/api/generators/debug", {
        code,
        language,
      });
      setResult(data);
      toast.success("Code analyzed!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Analysis failed. Check your API key.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Code copied to clipboard");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <TerminalSquare size={28} /> Code Debugger
        </h1>
        <p className="text-gray-500">
          Paste your broken code and let AI find syntax errors, logical bugs,
          and suggest best practices.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <GlassCard className="flex flex-col h-[600px]">
          <form
            onSubmit={handleDebug}
            className="flex flex-col h-full space-y-4"
          >
            <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-xl border border-white/5">
              <label className="text-sm font-medium text-gray-400">
                Language:
              </label>
              <select
                className="bg-transparent text-white border-none outline-none text-sm cursor-pointer ml-3 font-medium"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang} className="bg-gray-900">
                    {lang}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 group">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-900/80 border-r border-white/5 font-mono text-center text-gray-500/50 text-xs py-3 select-none flex flex-col pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div key={i} className="leading-[1.4rem]">
                    {i + 1}
                  </div>
                ))}
              </div>
              <textarea
                className="absolute inset-0 w-full h-full pl-14 pr-4 py-3 bg-transparent text-gray-300 font-mono text-sm leading-[1.4rem] resize-none outline-none focus:ring-1 focus:ring-primary-500/50"
                placeholder="Paste your code here..."
                value={code}
                spellCheck="false"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 shrink-0"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" /> Analyzing Code...
                </>
              ) : (
                <>
                  <BugPlay size={18} /> Debug Code
                </>
              )}
            </button>
          </form>
        </GlassCard>

        <div className="flex flex-col h-[600px] overflow-y-auto w-full custom-scrollbar pr-2 space-y-6">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-2xl glass">
              <TerminalSquare size={48} className="text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">
                Awaiting Code Output
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Hit debug and the AI will scan every line for syntax anomalies
                and logical flaws.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center glass rounded-2xl">
              <LoadingSpinner size="lg" />
              <p className="text-primary-400 mt-4 animate-pulse text-sm font-medium">
                Compiling trace matrix...
              </p>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 pb-4"
            >
              <GlassCard className="border-l-4 border-red-500/80 bg-red-950/10">
                <h3 className="flex items-center gap-2 font-semibold text-white mb-2">
                  <AlertOctagon size={18} className="text-red-500" /> Detected
                  Error
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed font-mono bg-black/20 p-3 rounded-lg border border-red-500/10">
                  {result.error}
                </p>
              </GlassCard>

              <GlassCard className="border-l-4 border-blue-500/80 bg-blue-950/10">
                <h3 className="flex items-center gap-2 font-semibold text-white mb-2">
                  <Lightbulb size={18} className="text-blue-500" /> Explanation
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed text-justify">
                  {result.explanation}
                </p>
              </GlassCard>

              <GlassCard className="flex flex-col !p-0 overflow-hidden border-l-4 border-green-500/80">
                <div className="flex justify-between items-center bg-gray-900/80 px-4 py-3 border-b border-white/5">
                  <h3 className="flex items-center gap-2 font-semibold text-white text-sm">
                    <CheckCircle2 size={16} className="text-green-500" />{" "}
                    Corrected Code
                  </h3>
                  <button
                    onClick={() => handleCopy(result.correctedCode)}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Copy size={14} /> Copy Fix
                  </button>
                </div>
                <div className="p-4 bg-[#1e1e1e] overflow-x-auto text-sm leading-[1.4rem]">
                  <pre className="font-mono text-green-300/90 whitespace-pre-wrap">
                    {result.correctedCode}
                  </pre>
                </div>
              </GlassCard>

              <GlassCard className="bg-primary-950/10 border-l-4 border-primary-500/80">
                <h3 className="font-semibold text-white text-sm mb-2 opacity-80 uppercase tracking-widest text-xs">
                  Best Practice Suggestion
                </h3>
                <p className="text-sm text-gray-400 italic">
                  " {result.bestPractice} "
                </p>
              </GlassCard>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
