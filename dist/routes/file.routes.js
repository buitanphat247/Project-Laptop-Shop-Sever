"use strict";
/**
 * @fileoverview File Upload Management Routes
 * @description Xử lý tất cả các routes liên quan đến upload file
 * @author Your Name
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
// routes/file.routes.ts
const express_1 = require("express");
const multer_1 = require("../config/multer");
const file_controllers_1 = require("../controllers/file.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const fileRouter = (0, express_1.Router)();
// ==================== FILE UPLOAD ROUTES ====================
/**
 * @route POST /upload-file
 * @description Upload file lên server (hình ảnh, tài liệu, etc.)
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể upload file
 * @middleware verifyToken, checkPermission, upload.single("file")
 * @body {file: File} - File cần upload (multipart/form-data)
 * @returns {message: string, data: {filename: string, url: string}}
 */
fileRouter.post("/upload-file", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, multer_1.upload.single("file"), file_controllers_1.fileUpload);
exports.default = fileRouter;
