/**
 * @fileoverview Authentication Routes
 * @description Xử lý tất cả các routes liên quan đến xác thực người dùng
 * @author Your Name
 * @version 1.0.0
 */

// routes/auth.routes.ts
import { Router } from "express";
import { changePassword, forgotPassword, login, logout, refreshAccessToken, resetPassword } from "../controllers/auth.controllers";

const authRouter = Router();

/**
 * @route POST /auth/login
 * @description Đăng nhập người dùng với email và password
 * @access Public - Ai cũng có thể truy cập
 * @body {email: string, password: string}
 * @returns {message: string, data: {id, email, fullName, role, accessToken, refreshToken}}
 */
authRouter.post("/login", login);

/**
 * @route POST /auth/logout
 * @description Đăng xuất - xóa refreshToken của user trong database
 * @access Public - Ai cũng có thể truy cập
 * @body {userId: number} hoặc từ req.user nếu đã xác thực
 * @returns {message: string}
 */
authRouter.post("/logout", logout);

/**
 * @route POST /auth/refresh-token
 * @description Làm mới accessToken từ refreshToken
 * @access Public - Ai cũng có thể truy cập
 * @body {userId: number}
 * @returns {message: string, data: {accessToken}}
 */
authRouter.post("/refresh-token", refreshAccessToken);
/**
 * @route POST /auth/forgot-password
 * @description Gửi OTP reset password về email người dùng
 * @access Public
 * @body {email: string}
 * @returns {message: string}
 */
authRouter.post("/forgot-password", forgotPassword);

/**
 * @route POST /auth/reset-password
 * @description Đặt lại mật khẩu mới bằng OTP
 * @access Public
 * @body {email: string, otp: string, newPassword: string}
 * @returns {message: string}
 */
authRouter.post("/reset-password", resetPassword);


/**
 * @route POST /auth/change-password
 * @description Đổi mật khẩu khi biết mật khẩu cũ
 * @access Public (nên bảo vệ bằng xác thực nếu có)
 * @body {email: string, oldPassword: string, newPassword: string}
 * @returns {success: boolean, message: string, data: any}
 */
authRouter.post("/change-password", changePassword);
export default authRouter;
