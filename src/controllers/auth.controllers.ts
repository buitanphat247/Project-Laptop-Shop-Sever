import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import prisma from "../client";
import { tempCache } from "../config/Cache";
import { sendMail } from "../config/mailer.config";
import { forgotPasswordTemplate } from "../config/ui.config";
import { hashPassword } from "../utils/hashPassword";

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true },
  });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = generateAccessToken({
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role.name,
  });
  const refreshToken = generateRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  res.json({
    message: "Đăng nhập thành công",
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
      accessToken,
      refreshToken,
    },
  });
};

/**
 * Đăng xuất: Xóa refreshToken của user trong database
 * - Nhận userId từ req.body (hoặc req.user nếu đã xác thực)
 * - Cập nhật user với id đó, đặt refreshToken = null
 * - Không thao tác với cookie, FE tự xử lý xoá token phía client
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || (req as any).user?.id;
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { refreshToken: null },
    });

    res.json({ message: "Logged out successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: "Logout failed", error });
    return;
  }
};

/**
 * Refresh accessToken từ userId
 * - Nhận userId từ req.body
 * - Lấy refreshToken từ DB dựa trên userId
 * - Kiểm tra refreshToken hợp lệ và cấp lại accessToken mới
 */
export const refreshAccessToken = async (req: Request, res: Response) => {
  const { userId } = req.body;
  if (!userId) {
    res.status(400).json({
      message: "Missing userId",
      data: null,
    });
    return;
  }

  try {
    // Lấy user và refreshToken từ DB dựa trên userId
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      include: { role: true },
    });

    if (!user || !user.refreshToken) {
      res.status(403).json({
        message: "User not found or no refresh token",
        data: null,
      });
      return;
    }

    // Xác thực refreshToken
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(user.refreshToken, process.env.REFRESH_SECRET!);

    // Kiểm tra userId trong token có khớp không
    if (decoded.userId !== user.id) {
      res.status(403).json({
        message: "Invalid refresh token",
        data: null,
      });
      return;
    }

    // Tạo accessToken mới
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name,
    });

    res.json({
      message: "Refresh token thành công",
      data: { accessToken },
    });
    return;
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired refresh token",
      data: null,
      error,
    });
    return;
  }
};
/**
 * @route POST /auth/forgot-password
 * @description Gửi OTP reset password về email người dùng
 * @body {email: string}
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: "Email is required" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(404).json({ message: "Email không tồn tại" });
    return;
  }

  // Tạo OTP ngẫu nhiên 6 số
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Lưu OTP vào node-cache với key là email, TTL 10 phút (600 giây)
  tempCache.set(`otp_${email}`, otp, 600);

  // Thông tin động
  const appName = "Laptop Shop";
  const otpExpireMinutes = 10;

  // Gửi OTP qua email sử dụng hàm sendMail với template HTML động
  await sendMail({
    to: email,
    subject: "Mã OTP đặt lại mật khẩu",
    html: forgotPasswordTemplate({ user, otp, appName, otpExpireMinutes }),
    text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong ${otpExpireMinutes} phút.`,
  });

  res.json({ message: "OTP đã được gửi về email", success: true });
};
/**
 * @route POST /auth/reset-password
 * @description Đặt lại mật khẩu mới bằng OTP
 * @body {email: string, otp: string, newPassword: string}
 */

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    res.status(400).json({ success: false, message: "Thiếu thông tin", data: null });
    return;
  }

  // Lấy OTP từ cache
  const cachedOtp = tempCache.get(`otp_${email}`);
  if (!cachedOtp || cachedOtp !== otp) {
    res.status(400).json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn", data: null });
    return;
  }

  // Hash mật khẩu mới
  const hashedPassword = await hashPassword(newPassword);

  // Cập nhật mật khẩu theo email
  const updated = await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  // Xóa OTP khỏi cache
  tempCache.del(`otp_${email}`);

  res.json({ success: true, message: "Đặt lại mật khẩu thành công", data: { email: updated.email } });
};

/**
 * @route POST /auth/change-password
 * @description Đổi mật khẩu khi biết mật khẩu cũ
 * @body {email: string, oldPassword: string, newPassword: string}
 * @returns {success: boolean, message: string, data: any}
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: "Thiếu thông tin", data: null });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ success: false, message: "Người dùng không tồn tại", data: null });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng", data: null });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: "Đổi mật khẩu thành công", data: { email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi hệ thống", data: null, error });
  }
};
