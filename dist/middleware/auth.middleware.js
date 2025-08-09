"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkSpecificPermission = exports.checkPermission = exports.authorize = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../client"));
/**
 * Middleware xác thực JWT:
 * - Nếu accessToken hợp lệ: giải mã và cho phép request tiếp tục.
 * - Nếu accessToken hết hạn hoặc không hợp lệ:
 *    + Kiểm tra refreshToken (từ header x-refresh-token hoặc body refreshToken).
 *    + Nếu refreshToken hợp lệ: tạo accessToken mới, trả về trong header x-access-token và tiếp tục request.
 *    + Nếu refreshToken không hợp lệ: trả về lỗi.
 */
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) {
        res.status(401).json({ message: "Access token is missing", data: null });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
        return;
    }
    catch (err) {
        res
            .status(403)
            .json({ message: "Invalid or expired access token", data: null });
        return;
    }
};
exports.verifyToken = verifyToken;
// Middleware phân quyền theo role (giữ nguyên)
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({
                message: "User authentication failed",
                data: null,
            });
            return;
        }
        if (!roles.includes(user.role)) {
            res.status(403).json({
                message: "Access denied: insufficient permissions",
                data: null,
            });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
/**
 * Middleware kiểm tra permission dựa trên role:
 * - Lấy roleId từ token đã decode.
 * - Sử dụng Prisma để lấy danh sách permissions của role đó.
 * - Kiểm tra xem route hiện tại có nằm trong danh sách quyền của role không.
 * - Nếu có thì next(), nếu không thì trả về 403.
 */
const checkPermission = () => {
    return async (req, res, next) => {
        const user = req.user || req.user;
        console.log('user: ', user);
        if (!user) {
            res
                .status(401)
                .json({ message: "User authentication failed", data: null });
            return;
        }
        try {
            // Lấy role name từ token đã decode
            const roleName = user.role;
            console.log('Role name from token:', roleName);
            if (!roleName) {
                res
                    .status(400)
                    .json({ message: "Role not found in token", data: null });
                return;
            }
            // Sử dụng Prisma để lấy roleId từ role name
            const roleData = await client_1.default.role.findUnique({
                where: {
                    name: roleName,
                },
            });
            if (!roleData) {
                res
                    .status(400)
                    .json({ message: "Role not found in database", data: null });
                return;
            }
            const roleId = roleData.id;
            console.log('Role ID from database:', roleId);
            // Sử dụng Prisma để lấy danh sách permissions của role
            const rolePermissions = await client_1.default.rolePermission.findMany({
                where: {
                    roleId: roleId,
                    active: true, // Chỉ lấy những permission đang active
                },
                include: {
                    permission: true,
                },
            });
            // Lấy danh sách routes được phép truy cập
            const allowedRoutes = rolePermissions.map(rp => rp.permission.route);
            // Lấy route hiện tại và method
            const currentRoute = req.route?.path || req.originalUrl;
            const currentMethod = req.method;
            // Kiểm tra quyền truy cập route và method
            const hasPermission = rolePermissions.some(rp => rp.permission.route === currentRoute &&
                rp.permission.method.toUpperCase() === currentMethod.toUpperCase());
            if (!hasPermission) {
                res
                    .status(403)
                    .json({ message: "Bạn không có quyền truy cập route này!" });
                return;
            }
            next();
        }
        catch (err) {
            console.error("Error checking permissions:", err);
            res
                .status(500)
                .json({ message: "Lỗi kiểm tra quyền truy cập", data: null });
        }
    };
};
exports.checkPermission = checkPermission;
/**
 * Middleware kiểm tra permission theo tên cụ thể:
 * - Sử dụng khi bạn muốn kiểm tra một permission cụ thể theo tên
 * - Ví dụ: checkSpecificPermission('user:create')
 */
const checkSpecificPermission = (permissionName) => {
    return async (req, res, next) => {
        const user = req.user || req.user;
        if (!user) {
            res
                .status(401)
                .json({ message: "User authentication failed", data: null });
            return;
        }
        try {
            // Lấy role name từ token đã decode
            const roleName = user.role;
            if (!roleName) {
                res
                    .status(400)
                    .json({ message: "Role not found in token", data: null });
                return;
            }
            // Sử dụng Prisma để lấy roleId từ role name
            const roleData = await client_1.default.role.findUnique({
                where: {
                    name: roleName,
                },
            });
            if (!roleData) {
                res
                    .status(400)
                    .json({ message: "Role not found in database", data: null });
                return;
            }
            const roleId = roleData.id;
            // Kiểm tra permission cụ thể theo tên
            const hasPermission = await client_1.default.rolePermission.findFirst({
                where: {
                    roleId: roleId,
                    active: true,
                    permission: {
                        name: permissionName,
                    },
                },
            });
            if (!hasPermission) {
                res
                    .status(403)
                    .json({ message: `Bạn không có quyền: ${permissionName}` });
                return;
            }
            next();
        }
        catch (err) {
            console.error("Error checking specific permission:", err);
            res
                .status(500)
                .json({ message: "Lỗi kiểm tra quyền truy cập", data: null });
        }
    };
};
exports.checkSpecificPermission = checkSpecificPermission;
/*
Ghi chú:
- Middleware checkPermission sẽ lấy role name từ token đã decode (user.role).
- Sử dụng Prisma để fetch roleId từ database dựa trên role name.
- Sau đó truy vấn permissions của role đó từ RolePermission table.
- Kiểm tra cả route và HTTP method để đảm bảo quyền truy cập chính xác.
- Chỉ lấy những permission có active = true.
- Nếu có quyền thì cho phép truy cập, nếu không thì trả về 403.
- JWT token chỉ cần chứa role name, không cần roleId.
*/
