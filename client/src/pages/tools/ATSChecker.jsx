import { useState, useCallback } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  FileCheck,
  Search,
  AlertCircle,
  CheckCircle2,
  ListMinus,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import FileDropzone from "../../components/ui/FileDropzone";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function ATSChecker() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setResult(null);
  }, []);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please upload your resume file");

    setLoading(true);
    setResult(null);
    const form = new FormData();
    form.append("file", file);
    if (jobDescription.trim()) form.append("jobDescription", jobDescription);

    try {
      const { data } = await api.post("/api/tools/ats", form);
      setResult(data);
      toast.success("ATS Analysis complete!");
    } catch (err) {
      toast.error(
        err.response?.data?.error || "Analysis failed. Check your API key.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <FileCheck size={28} /> ATS Score Checker
        </h1>
        <p className="text-gray-500">
          Analyze your resume against Applicant Tracking Systems to maximize
          call-backs.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleAnalyze} className="space-y-6">
          <FileDropzone
            onDrop={onDrop}
            accept={{
              "application/pdf": [".pdf"],
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                [".docx"],
              "text/plain": [".txt"],
            }}
            label="Drop your Resume here (PDF, DOCX, TXT)"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 block">
              Target Job Description (Optional but Recommended)
            </label>
            <textarea
              className="input-field w-full h-32 py-3 resize-none font-mono text-sm leading-relaxed"
              placeholder="Paste the job requirements here so we can match your skills to the keywords..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !file}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" /> Analyzing Resume...
              </>
            ) : (
              <>
                <Search size={18} /> Calculate ATS Score
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
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="flex flex-col items-center justify-center py-8 text-center row-span-2">
              <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                <svg className="absolute w-full h-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke={
                      result.score >= 80
                        ? "#10b981"
                        : result.score >= 60
                          ? "#f59e0b"
                          : "#ef4444"
                    }
                    strokeWidth="12"
                    strokeDasharray="402"
                    strokeDashoffset={402 - (402 * result.score) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute text-4xl font-display font-bold text-white">
                  {result.score}%
                </div>
              </div>
              <h3 className="font-semibold text-white mb-2">Total Score</h3>
              <p className="text-sm text-gray-400">
                {result.score >= 80
                  ? "Excellent match! You're good to go."
                  : result.score >= 60
                    ? "Good, but could use some targeted keyword optimization."
                    : "Significant improvements needed for ATS approval."}
              </p>
            </GlassCard>

            <div className="md:col-span-2 space-y-6">
              <GlassCard>
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="text-green-400" size={18} />{" "}
                  Executive Summary
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {result.summary}
                </p>
              </GlassCard>

              <GlassCard>
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <ListMinus className="text-yellow-400" size={18} /> Missing
                  Keywords
                </h3>
                {result.missingKeywords?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-yellow-500/10 text-yellow-500/90 text-xs font-medium rounded-lg border border-yellow-500/20"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No major keywords missing!
                  </p>
                )}
              </GlassCard>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircle className="text-red-400" size={18} /> Formatting
                Issues
              </h3>
              {result.formattingIssues?.length > 0 ? (
                <ul className="space-y-2">
                  {result.formattingIssues.map((issue, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-red-400/50 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Resume format looks perfectly ATS-friendly.
                </p>
              )}
            </GlassCard>

            <GlassCard>
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-primary-400" size={18} />{" "}
                Recommendations
              </h3>
              {result.recommendations?.length > 0 ? (
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-gray-300">
                      <span className="text-primary-400/50 mt-0.5">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  Your resume is highly optimized.
                </p>
              )}
            </GlassCard>
          </div>
        </motion.div>
      )}
    </div>
  );
}
