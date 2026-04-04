import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Copy,
  Printer,
  MessageSquare,
  Target,
  Lightbulb,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function InterviewPrep() {
  const [role, setRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [questionType, setQuestionType] = useState("mixed");
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!role.trim()) return toast.error("Please enter a target job role");

    setLoading(true);
    setQuestions([]);

    try {
      const { data } = await api.post("/api/generators/interview", {
        role,
        experienceLevel,
        questionType,
        count,
      });
      setQuestions(data);
      toast.success("Interview guide generated!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!questions.length) return;
    const textData = questions
      .map(
        (q, i) =>
          `Q${i + 1}: ${q.question}\nAnswer: ${q.sampleAnswer}\nTip: ${q.tip}\n`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(textData.trim());
    toast.success("Copied all questions");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="page-title flex items-center gap-3">
          <Briefcase size={28} /> Interview Question Generator
        </h1>
        <p className="text-gray-500">
          Generate targeted interview questions, sample answers, and tips for
          your specific career role.
        </p>
      </div>

      <GlassCard className="print:hidden">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Target Role
            </label>
            <input
              type="text"
              className="input-field w-full text-lg"
              placeholder="e.g. Frontend Developer, Data Analyst, Product Manager..."
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Experience Level
              </label>
              <select
                className="input-field w-full bg-background"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="fresher">Fresher (0-1 yrs)</option>
                <option value="intermediate">Intermediate (2-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Question Type
              </label>
              <select
                className="input-field w-full bg-background"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value)}
              >
                <option value="mixed">Mixed</option>
                <option value="technical">Technical Only</option>
                <option value="hr">HR / Behavioral</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Question Count
              </label>
              <input
                type="number"
                min="5"
                max="20"
                className="input-field w-full"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !role.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" /> Generating Guide...
              </>
            ) : (
              <>
                <Search size={18} /> Generate Interview Guide
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between items-center print:hidden border-b border-white/10 pb-4">
            <h2 className="text-xl font-display font-medium text-white">
              {role} Prep Guide
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className="btn-secondary py-1.5 px-3 flex items-center gap-2"
              >
                <Copy size={16} /> Copy All
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary py-1.5 px-3 flex items-center gap-2"
              >
                <Printer size={16} /> Print PDF
              </button>
            </div>
          </div>

          <div className="print:block hidden mb-6">
            <h1 className="text-3xl font-bold text-black border-b pb-2 mb-2">
              {role} Prep Guide
            </h1>
            <p className="text-gray-600">
              Generated for {experienceLevel} candidates. ({questionType}{" "}
              questions)
            </p>
          </div>

          <div className="space-y-6 print:space-y-8">
            {questions.map((q, i) => (
              <GlassCard
                key={i}
                className="break-inside-avoid print:bg-white print:border-gray-200"
              >
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center font-display font-bold text-xl shrink-0 print:bg-gray-100 print:text-black">
                    {i + 1}
                  </div>
                  <div className="space-y-4 w-full pt-1.5">
                    <h3 className="text-xl font-semibold text-white leading-relaxed print:text-black">
                      {q.question}
                    </h3>

                    <div className="rounded-xl bg-white/5 p-4 border border-white/5 print:bg-gray-50 print:border-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare
                          size={16}
                          className="text-gray-400 print:text-gray-800"
                        />
                        <span className="text-sm font-semibold text-gray-300 uppercase tracking-widest print:text-gray-800">
                          Sample Answer Concept
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 print:text-gray-900 leading-relaxed text-justify">
                        {q.sampleAnswer}
                      </p>
                    </div>

                    <div className="flex items-start gap-3 bg-primary-950/20 p-4 rounded-xl border border-primary-500/20 print:bg-primary-50 print:border-primary-200">
                      <Lightbulb
                        size={18}
                        className="text-primary-400 shrink-0 mt-0.5 print:text-primary-700"
                      />
                      <div>
                        <span className="text-xs font-semibold text-primary-400/80 uppercase tracking-widest block mb-1 print:text-primary-800">
                          Pro Tip
                        </span>
                        <p className="text-sm text-primary-100 font-medium leading-relaxed print:text-black">
                          {q.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
