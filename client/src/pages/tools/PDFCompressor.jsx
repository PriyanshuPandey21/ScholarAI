import { useState, useCallback } from "react";
import api from "../../api";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { FileDown, Download, HardDrive } from "lucide-react";
import GlassCard from "../../components/ui/GlassCard";
import FileDropzone from "../../components/ui/FileDropzone";
import {
  LoadingSpinner,
  ProgressBar,
} from "../../components/ui/LoadingSpinner";
export default function PDFCompressor() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const onDrop = useCallback((accepted) => {
    setFile(accepted[0]);
    setResult(null);
  }, []);
  const handleCompress = async () => {
    if (!file) return toast.error("Please upload a PDF file");
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/api/pdf/compress", form);
      setResult(data);
      toast.success(`Reduced by ${data.reduction}%!`);
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Compression failed. Is Ghostscript installed?",
      );
    } finally {
      setLoading(false);
    }
  };
  const fmt = (b) =>
    b > 1024 * 1024
      ? `${(b / 1024 / 1024).toFixed(2)} MB`
      : `${(b / 1024).toFixed(1)} KB`;
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="page-title flex items-center gap-3">
          <FileDown size={28} /> PDF Compressor
        </h1>
        <p className="text-gray-500">
          Reduce PDF file size using Ghostscript on the server.
        </p>
      </div>
      <GlassCard>
        <FileDropzone
          onDrop={onDrop}
          accept={{ "application/pdf": [".pdf"] }}
          label="Drop your PDF here"
        />
        <button
          onClick={handleCompress}
          disabled={loading || !file}
          className="btn-primary flex items-center gap-2 mt-4"
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              Compressing...
            </>
          ) : (
            <>
              <FileDown size={16} />
              Compress PDF
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
              <div className="flex items-center gap-2 mb-6">
                <HardDrive size={18} className="text-primary-400" />
                <h2 className="font-semibold text-white">Compression Result</h2>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                <div className="p-4 rounded-xl bg-white/3">
                  <p className="text-xs text-gray-500 mb-1">Original</p>
                  <p className="text-xl font-bold text-gray-300">
                    {fmt(result.originalSize)}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-1">Reduction</p>
                  <p className="text-xl font-bold text-green-400">
                    {result.reduction}%
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/3">
                  <p className="text-xs text-gray-500 mb-1">Compressed</p>
                  <p className="text-xl font-bold text-primary-400">
                    {fmt(result.compressedSize)}
                  </p>
                </div>
              </div>
              <ProgressBar
                value={result.reduction}
                label="Size Reduction"
                color="green"
              />
              <a
                href={result.downloadUrl}
                download
                className="btn-primary flex items-center gap-2 mt-4 justify-center"
              >
                <Download size={16} />
                Download Compressed PDF
              </a>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
