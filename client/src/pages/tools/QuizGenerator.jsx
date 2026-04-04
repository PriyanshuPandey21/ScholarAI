import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  HelpCircle,
  Search,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [count, setCount] = useState(10);
  const [type, setType] = useState("MCQ");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);

  // Quiz State
  const [questions, setQuestions] = useState([]);
  const [quizMode, setQuizMode] = useState("setup"); // setup | playing | results
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim() && !topic.trim())
      return toast.error("Please provide a topic or text");

    setLoading(true);
    setQuestions([]);
    setUserAnswers({});
    setCurrentIndex(0);

    try {
      const { data } = await axios.post("/api/generators/quiz", {
        text,
        topic,
        count,
        type,
        difficulty,
      });
      setQuestions(data);
      setQuizMode("playing");
      toast.success("Quiz ready!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (opt) => {
    setUserAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1)
      setCurrentIndex((prev) => prev + 1);
    else setQuizMode("results");
  };

  const restartQuiz = () => {
    setUserAnswers({});
    setCurrentIndex(0);
    setQuizMode("playing");
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] && userAnswers[i] === q.correct) score++;
    });
    return score;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <HelpCircle size={28} /> Quiz Generator
        </h1>
        <p className="text-gray-500">
          Generate interactive practice questions for exams.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {quizMode === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <GlassCard>
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-400">
                      Topic
                    </label>
                    <input
                      type="text"
                      className="input-field w-full"
                      placeholder="e.g. World War II"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">
                        Questions
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
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">
                        Difficulty
                      </label>
                      <select
                        className="input-field w-full bg-background"
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-400">
                    Or Paste Study Material
                  </label>
                  <textarea
                    className="input-field w-full h-32 py-3 resize-none"
                    placeholder="Paste notes to generate a specific quiz..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (!text && !topic)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" /> Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Search size={18} /> Generate Quiz
                    </>
                  )}
                </button>
              </form>
            </GlassCard>
          </motion.div>
        )}

        {quizMode === "playing" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GlassCard className="space-y-6 !p-8">
              <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <span className="text-sm font-medium text-gray-400">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <button
                  onClick={() => setQuizMode("setup")}
                  className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Quit
                </button>
              </div>

              <h2 className="text-xl font-display font-medium text-white leading-relaxed">
                {questions[currentIndex].q}
              </h2>

              <div className="space-y-3 pt-4">
                {questions[currentIndex].options?.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-200 ${userAnswers[currentIndex] === opt ? "bg-primary-600/30 border-primary-500/50 text-white shadow-glow" : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"}`}
                  >
                    <span className="font-bold mr-3 text-primary-400">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </button>
                ))}

                {(!questions[currentIndex].options ||
                  questions[currentIndex].options.length === 0) && (
                  <textarea
                    className="input-field w-full h-32 py-3 resize-none"
                    placeholder="Type your answer here..."
                    value={userAnswers[currentIndex] || ""}
                    onChange={(e) => handleSelectOption(e.target.value)}
                  />
                )}
              </div>

              <div className="flex justify-end pt-6 border-t border-white/10 mt-8">
                <button
                  onClick={nextQuestion}
                  disabled={
                    !userAnswers[currentIndex] &&
                    questions[currentIndex].options?.length > 0
                  }
                  className="btn-primary px-8 py-2.5"
                >
                  {currentIndex === questions.length - 1
                    ? "Finish Quiz"
                    : "Next Question"}
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {quizMode === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <GlassCard className="text-center py-10 space-y-4">
              <h2 className="text-3xl font-display font-bold text-white">
                Quiz Completed!
              </h2>
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full border-8 border-primary-500/30 bg-primary-500/10 text-4xl font-bold text-white shadow-glow">
                {calculateScore()}/{questions.length}
              </div>
              <p className="text-gray-400">
                You scored{" "}
                {Math.round((calculateScore() / questions.length) * 100)}% on
                this quiz.
              </p>
              <div className="flex justify-center gap-4 pt-4">
                <button
                  onClick={restartQuiz}
                  className="btn-primary flex items-center gap-2 px-6"
                >
                  <RotateCcw size={16} /> Replay Quiz
                </button>
                <button
                  onClick={() => setQuizMode("setup")}
                  className="btn-secondary flex items-center gap-2 px-6"
                >
                  <Search size={16} /> New Topic
                </button>
              </div>
            </GlassCard>

            <div className="space-y-4">
              <h3 className="text-xl font-medium text-white px-2">
                Detailed Review
              </h3>
              {questions.map((q, i) => {
                const isCorrect = userAnswers[i] === q.correct;
                // If it's a short answer without options, it's manually reviewable.
                const needsManualReview = !q.options || q.options.length === 0;

                return (
                  <GlassCard
                    key={i}
                    className={`border-l-4 ${needsManualReview ? "border-primary-500" : isCorrect ? "border-green-500/70" : "border-red-500/70"}`}
                  >
                    <div className="flex gap-4">
                      {needsManualReview ? (
                        <AlertCircle className="text-primary-500 shrink-0 mt-1" />
                      ) : isCorrect ? (
                        <CheckCircle2 className="text-green-500 shrink-0 mt-1" />
                      ) : (
                        <XCircle className="text-red-500 shrink-0 mt-1" />
                      )}
                      <div className="space-y-3 w-full">
                        <p className="text-white font-medium">{q.q}</p>

                        <div className="grid md:grid-cols-2 gap-4 text-sm mt-3 bg-white/5 p-4 rounded-xl">
                          <div>
                            <span className="text-gray-500 block mb-1">
                              Your Answer:
                            </span>
                            <span
                              className={`font-medium ${needsManualReview ? "text-primary-300" : isCorrect ? "text-green-400" : "text-red-400"}`}
                            >
                              {userAnswers[i] || "Skipped"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 block mb-1">
                              Correct Answer:
                            </span>
                            <span className="text-green-400 font-medium">
                              {q.correct}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-white/10 text-sm text-gray-400 leading-relaxed">
                          <strong className="text-white block mb-1">
                            Explanation:
                          </strong>{" "}
                          {q.explanation}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
