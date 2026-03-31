import { useDropzone } from 'react-dropzone';
import { Upload, File } from 'lucide-react';
import { motion } from 'framer-motion';
export default function FileDropzone({ onDrop, accept, label = 'Drop your file here', maxSize = 20 }) {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({ onDrop, accept, maxSize: maxSize*1024*1024, multiple: false });
  return (
    <div {...getRootProps()} className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragActive ? 'border-primary-500 bg-primary-500/10 shadow-glow' : 'border-white/10 hover:border-primary-500/50 hover:bg-white/5'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        {acceptedFiles.length > 0 ? (
          <><div className="w-14 h-14 rounded-2xl bg-primary-500/20 flex items-center justify-center"><File size={28} className="text-primary-400" /></div>
          <p className="text-white font-medium">{acceptedFiles[0].name}</p><p className="text-gray-500 text-sm">{(acceptedFiles[0].size/1024).toFixed(1)} KB</p></>
        ) : (
          <><motion.div animate={{ y: isDragActive ? -8 : 0 }} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
            <Upload size={28} className={isDragActive ? 'text-primary-400' : 'text-gray-500'} /></motion.div>
          <p className="text-gray-300 font-medium">{label}</p><p className="text-gray-600 text-sm">or click to browse · Max {maxSize}MB</p></>
        )}
      </div>
    </div>
  );
}
