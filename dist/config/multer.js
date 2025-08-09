"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Đảm bảo thư mục public/uploads nằm ngoài cùng project
const uploadDir = path_1.default.join(__dirname, "..", "..", "public", "uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Lưu file vào public/uploads ngoài cùng
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = file.originalname.split(".").pop();
        cb(null, uniqueSuffix + (ext ? "." + ext : ""));
    },
});
exports.upload = (0, multer_1.default)({ storage });
