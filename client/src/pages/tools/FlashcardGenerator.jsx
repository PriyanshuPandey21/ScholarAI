import { useState } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  Copy,
  Printer,
} from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";

export default function FlashcardGenerator() {
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!text.trim() && !topic.trim())
      return toast.error("Please provide a topic or text");

    setLoading(true);
    setFlashcards([]);
    setCurrentIndex(0);
    setIsFlipped(false);

    try {
      const { data } = await api.post("/api/generators/flashcards", {
        text,
        topic,
        count,
        difficulty,
      });
      setFlashcards(data);
      toast.success(`Generated ${data.length} flashcards!`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!flashcards.length) return;
    const textData = flashcards
      .map((f, i) => `Card ${i + 1}\nQ: ${f.q}\nA: ${f.a}\n`)
      .join("\n");
    navigator.clipboard.writeText(textData.trim());
    toast.success("Copied all flashcards");
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(
      () => setCurrentIndex((prev) => (prev + 1) % flashcards.length),
      150,
    );
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(
      () =>
        setCurrentIndex(
          (prev) => (prev - 1 + flashcards.length) % flashcards.length,
        ),
      150,
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="print:hidden">
        <h1 className="page-title flex items-center gap-3">
          <Layers size={28} /> Flashcard Generator
        </h1>
        <p className="text-gray-500">
          Convert your notes or topics into interactive flashcards for quick
          revision.
        </p>
      </div>

      <GlassCard className="print:hidden">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Topic</label>
              <input
                type="text"
                className="input-field w-full"
                placeholder="e.g. Mitochondria"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">
                Card Count
              </label>
              <input
                type="number"
                min="5"
                max="30"
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">
              Or Paste Source Material
            </label>
            <textarea
              className="input-field w-full h-24 py-3 resize-none"
              placeholder="Paste study text here..."
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
                <LoadingSpinner size="sm" /> Generating Cards...
              </>
            ) : (
              <>
                <Search size={18} /> Generate Flashcards
              </>
            )}
          </button>
        </form>
      </GlassCard>

      {flashcards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="flex justify-end gap-3 print:hidden">
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
              <Printer size={16} /> Print List
            </button>
          </div>

          {/* Interactive Flashcard UI */}
          <div className="relative h-96 w-full max-w-2xl mx-auto perspective-1000 print:hidden">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentIndex + (isFlipped ? "-flipped" : "")}
                initial={{ rotateX: isFlipped ? -180 : 0, opacity: 0 }}
                animate={{ rotateX: 0, opacity: 1 }}
                exit={{ rotateX: isFlipped ? 180 : 0, opacity: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
                onClick={() => setIsFlipped(!isFlipped)}
                className={`absolute inset-0 w-full h-full rounded-2xl cursor-pointer flex flex-col items-center justify-center p-8 text-center shadow-xl border ${isFlipped ? "bg-gradient-to-br from-primary-900/40 to-accent-900/20 border-primary-500/50" : "bg-white/5 border-white/10 backdrop-blur-md"}`}
              >
                <span className="absolute top-4 left-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {isFlipped ? "Answer" : "Question"}
                </span>
                <span className="absolute top-4 right-6 text-xs text-gray-500">
                  {currentIndex + 1} / {flashcards.length}
                </span>

                <h3
                  className={`text-2xl font-display leading-relaxed ${isFlipped ? "text-primary-100 font-medium" : "text-white font-bold"}`}
                >
                  {isFlipped
                    ? flashcards[currentIndex].a
                    : flashcards[currentIndex].q}
                </h3>

                <span className="absolute bottom-6 text-xs text-gray-500 flex items-center gap-1 animate-pulse">
                  Click card to flip
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex justify-center items-center gap-6 print:hidden">
            <button
              onClick={prevCard}
              className="glass p-4 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <span className="text-gray-400 font-medium tracking-wide">
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <button
              onClick={nextCard}
              className="glass p-4 rounded-full hover:bg-white/10 transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>

          {/* Print Layout */}
          <div className="hidden print:block space-y-6">
            <h2 className="text-2xl font-bold text-black border-b pb-2">
              Flashcard List
            </h2>
            {flashcards.map((f, i) => (
              <div
                key={i}
                className="border border-gray-300 p-4 rounded-lg break-inside-avoid"
              >
                <p className="font-bold text-lg mb-2">Q: {f.q}</p>
                <p className="text-gray-800">A: {f.a}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
