"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = exports.refreshAccessToken = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const client_1 = __importDefault(require("../client"));
const Cache_1 = require("../config/Cache");
const mailer_config_1 = require("../config/mailer.config");
const ui_config_1 = require("../config/ui.config");
const hashPassword_1 = require("../utils/hashPassword");
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await client_1.default.user.findUnique({
        where: { email },
        include: { role: true },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        res.status(400).json({ message: "Invalid credentials" });
        return;
    }
    const accessToken = (0, jwt_1.generateAccessToken)({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role.name,
    });
    const refreshToken = (0, jwt_1.generateRefreshToken)(user.id);
    await client_1.default.user.update({
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
exports.login = login;
/**
 * Đăng xuất: Xóa refreshToken của user trong database
 * - Nhận userId từ req.body (hoặc req.user nếu đã xác thực)
 * - Cập nhật user với id đó, đặt refreshToken = null
 * - Không thao tác với cookie, FE tự xử lý xoá token phía client
 */
const logout = async (req, res) => {
    try {
        const userId = req.body.userId || req.user?.id;
        if (!userId) {
            res.status(400).json({ message: "Missing userId" });
            return;
        }
        await client_1.default.user.update({
            where: { id: Number(userId) },
            data: { refreshToken: null },
        });
        res.json({ message: "Logged out successfully" });
        return;
    }
    catch (error) {
        res.status(500).json({ message: "Logout failed", error });
        return;
    }
};
exports.logout = logout;
/**
 * Refresh accessToken từ userId
 * - Nhận userId từ req.body
 * - Lấy refreshToken từ DB dựa trên userId
 * - Kiểm tra refreshToken hợp lệ và cấp lại accessToken mới
 */
const refreshAccessToken = async (req, res) => {
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
        const user = await client_1.default.user.findUnique({
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
        const decoded = jwt.verify(user.refreshToken, process.env.REFRESH_SECRET);
        // Kiểm tra userId trong token có khớp không
        if (decoded.userId !== user.id) {
            res.status(403).json({
                message: "Invalid refresh token",
                data: null,
            });
            return;
        }
        // Tạo accessToken mới
        const accessToken = (0, jwt_1.generateAccessToken)({
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
    }
    catch (error) {
        res.status(403).json({
            message: "Invalid or expired refresh token",
            data: null,
            error,
        });
        return;
    }
};
exports.refreshAccessToken = refreshAccessToken;
/**
 * @route POST /auth/forgot-password
 * @description Gửi OTP reset password về email người dùng
 * @body {email: string}
 */
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ message: "Email is required" });
        return;
    }
    const user = await client_1.default.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ message: "Email không tồn tại" });
        return;
    }
    // Tạo OTP ngẫu nhiên 6 số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Lưu OTP vào node-cache với key là email, TTL 10 phút (600 giây)
    Cache_1.tempCache.set(`otp_${email}`, otp, 600);
    // Thông tin động
    const appName = "Laptop Shop";
    const otpExpireMinutes = 10;
    // Gửi OTP qua email sử dụng hàm sendMail với template HTML động
    await (0, mailer_config_1.sendMail)({
        to: email,
        subject: "Mã OTP đặt lại mật khẩu",
        html: (0, ui_config_1.forgotPasswordTemplate)({ user, otp, appName, otpExpireMinutes }),
        text: `Mã OTP của bạn là: ${otp}. Có hiệu lực trong ${otpExpireMinutes} phút.`,
    });
    res.json({ message: "OTP đã được gửi về email", success: true });
};
exports.forgotPassword = forgotPassword;
/**
 * @route POST /auth/reset-password
 * @description Đặt lại mật khẩu mới bằng OTP
 * @body {email: string, otp: string, newPassword: string}
 */
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        res.status(400).json({ success: false, message: "Thiếu thông tin", data: null });
        return;
    }
    // Lấy OTP từ cache
    const cachedOtp = Cache_1.tempCache.get(`otp_${email}`);
    if (!cachedOtp || cachedOtp !== otp) {
        res.status(400).json({ success: false, message: "OTP không hợp lệ hoặc đã hết hạn", data: null });
        return;
    }
    // Hash mật khẩu mới
    const hashedPassword = await (0, hashPassword_1.hashPassword)(newPassword);
    // Cập nhật mật khẩu theo email
    const updated = await client_1.default.user.update({
        where: { email },
        data: { password: hashedPassword },
    });
    // Xóa OTP khỏi cache
    Cache_1.tempCache.del(`otp_${email}`);
    res.json({ success: true, message: "Đặt lại mật khẩu thành công", data: { email: updated.email } });
};
exports.resetPassword = resetPassword;
/**
 * @route POST /auth/change-password
 * @description Đổi mật khẩu khi biết mật khẩu cũ
 * @body {email: string, oldPassword: string, newPassword: string}
 * @returns {success: boolean, message: string, data: any}
 */
const changePassword = async (req, res) => {
    try {
        const { email, oldPassword, newPassword } = req.body;
        if (!email || !oldPassword || !newPassword) {
            res.status(400).json({ success: false, message: "Thiếu thông tin", data: null });
            return;
        }
        const user = await client_1.default.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ success: false, message: "Người dùng không tồn tại", data: null });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ success: false, message: "Mật khẩu cũ không đúng", data: null });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await client_1.default.user.update({
            where: { email },
            data: { password: hashedPassword },
        });
        res.json({ success: true, message: "Đổi mật khẩu thành công", data: { email } });
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống", data: null, error });
    }
};
exports.changePassword = changePassword;
