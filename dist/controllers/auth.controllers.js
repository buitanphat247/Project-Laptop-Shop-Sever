"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessToken = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwt_1 = require("../utils/jwt");
const client_1 = __importDefault(require("../client"));
const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await client_1.default.user.findUnique({
        where: { email },
        include: { role: true },
    });
    if (!user || !(await bcryptjs_1.default.compare(password, user.password))) {
        return res.status(400).json({ message: "Invalid credentials" });
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
