import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}-${file.originalname}`),
});
const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf','.docx','.doc','.txt','.png','.jpg','.jpeg'];
  allowed.includes(path.extname(file.originalname).toLowerCase()) ? cb(null,true) : cb(new Error('File type not supported'),false);
};
export const upload = multer({ storage, fileFilter, limits: { fileSize: 20*1024*1024 } });
export const uploadMemory = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 20*1024*1024 } });
