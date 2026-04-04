import { useState, useCallback } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FileOutput, Download } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import FileDropzone from "../../components/ui/FileDropzone";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
const FORMATS = [
  { value: "txt", label: "Plain Text (.txt)", desc: "Extract text content" },
  { value: "docx", label: "Word (.docx)", desc: "Extract text to Word" },
];
export default function PDFConverter() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState("txt");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setResult(null);
    setExtractedText("");
  }, []);
  const handleConvert = async () => {
    if (!file) return toast.error("Please upload a file");
    setLoading(true);
    setExtractedText("");
    try {
      if (format === "txt") {
        const form = new FormData();
        form.append("file", file);
        const { data } = await api.post("/api/pdf/totext", form);
        setExtractedText(data.text);
        toast.success(`Extracted ${data.pages} page(s)`);
      } else {
        const form = new FormData();
        form.append("file", file);
        form.append("format", format);
        const { data } = await api.post("/api/pdf/convert", form);
        setResult(data);
        toast.success("Converted!");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Conversion failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <FileOutput size={28} /> PDF Converter
        </h1>
        <p className="text-gray-500">Convert PDFs to text, Word, and more.</p>
      </div>
      <GlassCard>
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Output format:</p>
          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all text-left ${format === f.value ? "bg-gradient-to-r from-primary-600 to-accent-600 text-white" : "glass text-gray-400 hover:text-white"}`}
              >
                {f.label}
                <span className="block text-xs opacity-60 font-normal">
                  {f.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
        <FileDropzone
          onDrop={onDrop}
          accept={{ "application/pdf": [".pdf"] }}
          label="Drop your PDF here"
        />
        <button
          onClick={handleConvert}
          disabled={loading || !file}
          className="btn-primary flex items-center gap-2 mt-4"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Converting...
            </>
          ) : (
            <>
              <FileOutput size={16} />
              Convert
            </>
          )}
        </button>
      </GlassCard>
      {extractedText && (
        <GlassCard animate={false}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-white">Extracted Text</h2>
            <button
              onClick={() => {
                navigator.clipboard.writeText(extractedText);
                toast.success("Copied!");
              }}
              className="btn-secondary text-sm py-1.5 px-3"
            >
              Copy
            </button>
          </div>
          <div className="p-4 rounded-xl bg-white/3 text-sm text-gray-400 max-h-64 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
            {extractedText}
          </div>
        </GlassCard>
      )}
      {result?.downloadUrl && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard animate={false}>
            <a
              href={result.downloadUrl}
              download
              className="btn-primary flex items-center gap-2 justify-center"
            >
              <Download size={16} />
              Download {format.toUpperCase()} File
            </a>
          </GlassCard>
        </motion.div>
      )}
    </div>
  );
}
