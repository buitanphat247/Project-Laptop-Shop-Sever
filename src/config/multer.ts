import multer from "multer";
import fs from "fs";
import path from "path";

// Đảm bảo thư mục public/uploads nằm ngoài cùng project
const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Lưu file vào public/uploads ngoài cùng
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = file.originalname.split(".").pop();
    cb(null, uniqueSuffix + (ext ? "." + ext : ""));
  },
});
export const upload = multer({ storage });