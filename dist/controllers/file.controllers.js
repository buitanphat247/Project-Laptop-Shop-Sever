"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUpload = void 0;
// Hàm xử lý upload file
const fileUpload = async (req, res) => {
    try {
        if (req.file) {
            res.json({
                message: "Successfully uploaded file",
                file: {
                    filename: req.file.filename,
                    path: `/uploads/${req.file.filename}`,
                },
            });
        }
        else {
            res.status(400).json({ message: "No file uploaded." });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Error uploading file", error });
    }
};
exports.fileUpload = fileUpload;
