import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { SpellCheck } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
export default function GrammarChecker() {
  const [text, setText] = useState("");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleCheck = async () => {
    if (!text.trim()) return toast.error("Please enter some text");
    setLoading(true);
    try {
      const { data } = await api.post("/api/grammar/check", { text });
      setMatches(data.matches);
      toast.success(`Found ${data.errorCount} issue(s)`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Grammar check failed");
    } finally {
      setLoading(false);
    }
  };
  const getHighlighted = () => {
    if (!matches.length) return text;
    let result = text;
    let offset = 0;
    for (const m of [...matches].sort((a, b) => a.offset - b.offset)) {
      const start = m.offset + offset,
        end = start + m.length,
        original = result.substring(start, end);
      const suggestion = m.replacements?.[0]?.value || "";
      const replacement = `<mark class="bg-red-500/30 text-red-300 rounded px-0.5 cursor-help" title="${m.message} → ${suggestion}">${original}</mark>`;
      result = result.substring(0, start) + replacement + result.substring(end);
      offset += replacement.length - original.length;
    }
    return result;
  };
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <SpellCheck size={28} /> Grammar Checker
        </h1>
        <p className="text-gray-500">
          Real-time grammar, spelling, and punctuation checking powered by
          LanguageTool.
        </p>
      </div>
      <GlassCard>
        <textarea
          className="input-field min-h-[200px] resize-none w-full mb-4"
          placeholder="Type or paste text to check..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setMatches([]);
          }}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            disabled={loading}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" /> Checking...
              </>
            ) : (
              <>
                <SpellCheck size={16} /> Check Grammar
              </>
            )}
          </button>
          {matches.length > 0 && (
            <span className="text-sm text-red-400 font-medium">
              {matches.length} issue(s) found
            </span>
          )}
        </div>
      </GlassCard>
      {matches.length > 0 && (
        <GlassCard animate={false}>
          <h2 className="font-semibold text-white mb-4">Highlighted Text</h2>
          <div
            className="p-4 rounded-xl bg-white/3 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: getHighlighted() }}
          />
        </GlassCard>
      )}
      {matches.length > 0 && (
        <GlassCard animate={false}>
          <h2 className="font-semibold text-white mb-4">Error Details</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {matches.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/3 border border-white/5"
              >
                <p className="text-sm text-gray-300">{m.message}</p>
                {m.replacements?.length > 0 && (
                  <p className="text-xs text-primary-400 mt-1">
                    Suggestion:{" "}
                    <span className="font-medium">
                      {m.replacements
                        .slice(0, 3)
                        .map((r) => r.value)
                        .join(", ")}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
