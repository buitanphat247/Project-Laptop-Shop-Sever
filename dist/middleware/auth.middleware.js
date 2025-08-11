"use strict";
/**
 * @fileoverview Authentication Middleware
 * @description Xử lý xác thực và phân quyền cho các routes
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.checkPermission = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
/**
 * @description Middleware xác thực JWT token
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * // Sử dụng trong route
 * router.get('/protected', verifyToken, (req, res) => {
 *   // req.user sẽ chứa thông tin người dùng đã xác thực
 * });
 */
const verifyToken = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN
        if (!token) {
            res.status(401).json({
                message: "Access token không được cung cấp",
                data: null,
            });
            return;
        }
        // Xác thực token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Lấy thông tin user từ database
        const user = await client_1.default.user.findUnique({
            where: { id: decoded.userId },
            include: { role: true },
        });
        if (!user) {
            res.status(401).json({
                message: "Token không hợp lệ hoặc user không tồn tại",
                data: null,
            });
            return;
        }
        // Thêm thông tin user vào request
        req.user = {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role.name,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn",
            data: null,
        });
        return;
    }
};
exports.verifyToken = verifyToken;
/**
 * @description Middleware kiểm tra quyền truy cập dựa trên role permissions
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 *
 * @example
 * // Sử dụng trong route
 * router.get('/admin-only', verifyToken, checkPermission, (req, res) => {
 *   // Chỉ user có quyền mới có thể truy cập
 * });
 */
const checkPermission = async (req, res, next) => {
    try {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                message: "Chưa xác thực người dùng",
                data: null,
            });
            return;
        }
        // Lấy thông tin route hiện tại
        const method = req.method;
        const route = req.route?.path || req.path;
        // Kiểm tra quyền truy cập
        const hasPermission = await client_1.default.rolePermission.findFirst({
            where: {
                role: {
                    name: user.role,
                },
                permission: {
                    method: method,
                    route: route,
                },
                active: true,
            },
        });
        if (!hasPermission) {
            res.status(403).json({
                message: "Không có quyền truy cập",
                data: null,
            });
            return;
        }
        next();
    }
    catch (error) {
        res.status(500).json({
            message: "Lỗi khi kiểm tra quyền truy cập",
            data: null,
        });
        return;
    }
};
exports.checkPermission = checkPermission;
/**
 * @description Middleware kiểm tra vai trò cụ thể
 * @param {string} role - Vai trò cần kiểm tra
 * @returns {Function} Middleware function
 *
 * @example
 * // Sử dụng trong route
 * router.get('/admin-only', verifyToken, authorize("admin"), (req, res) => {
 *   // Chỉ admin mới có thể truy cập
 * });
 */
const authorize = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                message: "Chưa xác thực người dùng",
                data: null,
            });
            return;
        }
        if (user.role !== role) {
            res.status(403).json({
                message: `Chỉ ${role} mới có quyền truy cập`,
                data: null,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
