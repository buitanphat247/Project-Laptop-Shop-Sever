"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Khởi tạo transporter
const transporter = nodemailer_1.default.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "buitanphat2747@thpt-vungtau.edu.vn",
        pass: "ujkz dzfb otaq wkwi",
    },
});
/**
 * Gửi email với template động
 * @param to - Email người nhận
 * @param subject - Tiêu đề email
 * @param text - Nội dung text thuần (tùy chọn)
 * @param html - Nội dung HTML (tùy chọn, dùng cho template)
 */
const sendMail = async ({ to, subject, text, html }) => {
    const mailOptions = {
        from: "buitanphat2747@thpt-vungtau.edu.vn",
        to,
        subject,
        text,
        html,
    };
    return transporter.sendMail(mailOptions);
};
exports.sendMail = sendMail;
