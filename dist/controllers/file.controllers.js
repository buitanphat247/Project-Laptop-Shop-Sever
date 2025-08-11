"use strict";
/**
 * @fileoverview File Upload Controller
 * @description Xử lý logic upload và quản lý file trong hệ thống
 * @author Your Name
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpload = void 0;
/**
 * @function fileUpload
 * @description Xử lý upload file và trả về thông tin file đã upload
 * @param {Request} req - Express request object với file data từ multer middleware
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /upload-file (với multer middleware)
 * // Request: multipart/form-data với file
 *
 * // Response khi thành công
 * {
 *   "message": "Successfully uploaded file",
 *   "file": {
 *     "filename": "image_1234567890.jpg",
 *     "path": "/uploads/image_1234567890.jpg"
 *   }
 * }
 *
 * // Response khi lỗi
 * {
 *   "message": "No file uploaded."
 * }
 */
const fileUpload = async (req, res) => {
    try {
        // Kiểm tra xem có file được upload không
        if (req.file) {
            // Trả về thông tin file đã upload thành công
            res.json({
                message: "Successfully uploaded file",
                file: {
                    filename: req.file.filename, // Tên file đã được lưu
                    path: `/uploads/${req.file.filename}`, // Đường dẫn truy cập file
                },
            });
        }
        else {
            // Trả về lỗi khi không có file nào được upload
            res.status(400).json({ message: "No file uploaded." });
        }
    }
    catch (error) {
        // Xử lý lỗi khi upload file
        res.status(500).json({ message: "Error uploading file", error });
    }
};
exports.fileUpload = fileUpload;
