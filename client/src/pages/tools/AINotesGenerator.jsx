import { useState, useCallback } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FileText,
  Copy,
  Printer,
  Search,
  BookOpen,
  Hash,
  Edit3,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import FileDropzone from "../../components/ui/FileDropzone";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

const STYLES = [
  "concise notes",
  "detailed notes",
  "bullet points",
  "exam revision notes",
];

export default function AINotesGenerator() {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [style, setStyle] = useState(STYLES[1]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => setFile(accepted[0]), []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file)
      return toast.error("Please provide some text or upload a file");

    setLoading(true);
    setResult(null);
    const form = new FormData();
    if (file) form.append("file", file);
    if (text) form.append("text", text);
    form.append("topic", topic);
    form.append("style", style);

    try {
      const { data } = await api.post("/api/generators/notes", form);
      setResult(data);
      toast.success("Notes generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const textData = `
Title: ${result.title}

Summary: ${result.summary}

Key Concepts:
${result.keyConcepts?.map((c) => "- " + c).join("\n")}

Definitions:
${result.definitions?.map((d) => "- " + d.term + ": " + d.definition).join("\n")}

Important Points:
${result.importantPoints?.map((p) => "- " + p).join("\n")}

Examples:
${result.examples?.map((e) => "- " + e).join("\n")}

Key Terms: ${result.keyTerms?.join(", ")}
    `.trim();
    navigator.clipboard.writeText(textData);
    toast.success("Copied to clipboard");
  };

  const wordCount = result
    ? Object.values(result).flat().join(" ").split(/\s+/).length
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="page-title flex items-center gap-3">
          <FileText size={28} /> AI Notes Generator
        </h1>
        <p className="text-gray-500">
          Convert your study materials into structured, easy-to-read academic
          notes.
        </p>
      </div>

      <GlassCard className="print:hidden">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Topic (Optional)
              </label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Quantum Physics"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Output Style
              </label>
              <select
                className="input-field w-full bg-background"
                value={style}
                onChange={(e) => setStyle(e.target.value)}
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Paste Material Document Content
            </label>
            <textarea
              className="input-field w-full h-32 py-3 resize-none"
              placeholder="Paste chapters, articles, or lecture transcripts here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Or Upload a Document
            </label>
            <FileDropzone
              onDrop={onDrop}
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                  [".docx"],
                "text/plain": [".txt"],
              }}
              label={file ? file.name : "Drop PDF, DOCX, or TXT file here"}
            />
          </div>

          <button
            type="submit"
            disabled={loading || (!text && !file)}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" /> Generating Notes...
              </>
            ) : (
              <>
                <Search size={18} /> Generate Notes
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center print:hidden">
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Hash size={14} /> {wordCount} words
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary py-1.5 px-3 flex items-center gap-2"
              >
                <Copy size={16} /> Copy Text
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary py-1.5 px-3 flex items-center gap-2"
              >
                <Printer size={16} /> Print PDF
              </button>
            </div>
          </div>

          {/* Academic Notes Output Document */}
          <div className="glass !bg-white/5 rounded-2xl p-8 print:p-0 print:bg-white print:text-black space-y-8">
            <div className="text-center border-b border-white/10 print:border-black/10 pb-6 mb-6">
              <h2 className="text-3xl font-display font-bold text-white print:text-black mb-2">
                {result.title}
              </h2>
              <p className="text-primary-400 print:text-gray-600 font-medium tracking-wide uppercase text-sm">
                Generated Academic Notes
              </p>
            </div>

            {result.summary && (
              <section>
                <h3 className="flex items-center gap-2 text-xl font-semibold text-white print:text-black mb-3">
                  <BookOpen size={20} className="text-primary-500" /> Summary
                </h3>
                <p className="text-gray-300 print:text-gray-800 leading-relaxed text-justify">
                  {result.summary}
                </p>
              </section>
            )}

            <div className="grid md:grid-cols-2 gap-8 print:block print:space-y-8">
              {result.keyConcepts?.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-accent-400 print:text-black mb-3 border-b border-white/5 pb-2">
                    Key Concepts
                  </h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-300 print:text-gray-800">
                    {result.keyConcepts.map((item, i) => (
                      <li key={i} className="pl-1 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {result.importantPoints?.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-accent-400 print:text-black mb-3 border-b border-white/5 pb-2">
                    Important Points
                  </h3>
                  <ul className="space-y-2 list-disc pl-5 text-gray-300 print:text-gray-800">
                    {result.importantPoints.map((item, i) => (
                      <li key={i} className="pl-1 leading-relaxed">
                        {item}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {result.definitions?.length > 0 && (
              <section>
                <h3 className="flex items-center gap-2 text-xl font-semibold text-white print:text-black mb-4">
                  <Edit3 size={20} className="text-primary-500" /> Definitions
                </h3>
                <div className="grid gap-3">
                  {result.definitions.map((def, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-white/5 print:bg-gray-50 border border-white/5 print:border-gray-200"
                    >
                      <strong className="text-white print:text-black block mb-1 text-lg">
                        {def.term}
                      </strong>
                      <p className="text-gray-400 print:text-gray-700 text-sm leading-relaxed">
                        {def.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.examples?.length > 0 && (
              <section>
                <h3 className="text-xl font-semibold text-white print:text-black mb-3">
                  Examples
                </h3>
                <ul className="space-y-3">
                  {result.examples.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-gray-300 print:text-gray-800"
                    >
                      <span className="text-primary-500 mt-0.5 font-bold">
                        »
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {result.keyTerms?.length > 0 && (
              <section className="pt-6 border-t border-white/10 print:border-gray-300">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Key Terms
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.keyTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-primary-500/10 text-primary-300 print:bg-gray-100 print:text-gray-800 text-xs font-medium rounded-lg border border-primary-500/20"
                    >
                      {term}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
