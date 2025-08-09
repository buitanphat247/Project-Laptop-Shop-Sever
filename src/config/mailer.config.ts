import nodemailer from "nodemailer";

// Khởi tạo transporter
const transporter = nodemailer.createTransport({
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
export const sendMail = async ({ to, subject, text, html }: { to: string; subject: string; text?: string; html?: string }) => {
  const mailOptions = {
    from: "buitanphat2747@thpt-vungtau.edu.vn",
    to,
    subject,
    text,
    html,
  };
  return transporter.sendMail(mailOptions);
};
