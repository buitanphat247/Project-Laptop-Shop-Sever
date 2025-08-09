/**
 * @fileoverview File Upload Management Routes
 * @description Xử lý tất cả các routes liên quan đến upload file
 * @author Your Name
 * @version 1.0.0
 */

// routes/file.routes.ts
import { Router } from "express";
import { upload } from "../config/multer";
import { fileUpload } from "../controllers/file.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const fileRouter = Router();

// ==================== FILE UPLOAD ROUTES ====================

/**
 * @route POST /upload-file
 * @description Upload file lên server (hình ảnh, tài liệu, etc.)
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể upload file
 * @middleware verifyToken, checkPermission, upload.single("file")
 * @body {file: File} - File cần upload (multipart/form-data)
 * @returns {message: string, data: {filename: string, url: string}}
 */
fileRouter.post("/upload-file", verifyToken, checkPermission, upload.single("file"), fileUpload);

export default fileRouter;
