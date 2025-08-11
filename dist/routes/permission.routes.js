"use strict";
/**
 * @fileoverview Role & Permission Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý vai trò và quyền hạn
 * @author Your Name
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
// routes/permission.routes.ts
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_controllers_1 = require("../controllers/role.controllers");
const permission_controllers_1 = require("../controllers/permission.controllers");
const rolePermission_controllers_1 = require("../controllers/rolePermission.controllers");
const permissionRouter = (0, express_1.Router)();
// ==================== ROLE MANAGEMENT ROUTES ====================
/**
 * @route GET /roles
 * @description Lấy danh sách tất cả vai trò trong hệ thống
 * @access Public - Ai cũng có thể xem danh sách vai trò
 * @returns {message: string, data: Role[]}
 */
permissionRouter.get("/roles", role_controllers_1.getAllRoles);
/**
 * @route GET /get-role/:id
 * @description Lấy thông tin chi tiết của một vai trò theo ID
 * @access Public - Ai cũng có thể xem thông tin vai trò
 * @param {number} id - ID của vai trò cần lấy thông tin
 * @returns {message: string, data: Role}
 */
permissionRouter.get("/get-role/:id", role_controllers_1.getRoleById);
/**
 * @route POST /create-role
 * @description Tạo vai trò mới trong hệ thống
 * @access Private - Chỉ admin mới có quyền tạo vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string}
 * @returns {message: string, data: Role}
 */
permissionRouter.post("/create-role", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), role_controllers_1.createRole);
/**
 * @route PUT /update-role/:id
 * @description Cập nhật thông tin vai trò
 * @access Private - Chỉ admin mới có quyền cập nhật vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của vai trò cần cập nhật
 * @body {name: string}
 * @returns {message: string, data: Role}
 */
permissionRouter.put("/update-role/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), role_controllers_1.updateRole);
/**
 * @route DELETE /delete-role/:id
 * @description Xóa vai trò khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của vai trò cần xóa
 * @returns {message: string, data: Role}
 */
permissionRouter.delete("/delete-role/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), role_controllers_1.deleteRole);
// ==================== PERMISSION MANAGEMENT ROUTES ====================
/**
 * @route GET /permissions
 * @description Lấy danh sách tất cả quyền hạn với phân trang
 * @access Public - Ai cũng có thể xem danh sách quyền hạn
 * @query {page?: number, limit?: number}
 * @returns {message: string, data: Permission[], pagination: object}
 */
permissionRouter.get("/permissions", permission_controllers_1.getAllPermissions);
/**
 * @route GET /permissions/:id
 * @description Lấy thông tin chi tiết của một quyền hạn theo ID
 * @access Public - Ai cũng có thể xem thông tin quyền hạn
 * @param {number} id - ID của quyền hạn cần lấy thông tin
 * @returns {message: string, data: Permission}
 */
permissionRouter.get("/permissions/:id", permission_controllers_1.getPermissionById);
/**
 * @route POST /create-permissions
 * @description Tạo quyền hạn mới trong hệ thống
 * @access Private - Chỉ admin mới có quyền tạo quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, method: string, route: string, slug: string}
 * @returns {message: string, data: Permission}
 */
permissionRouter.post("/create-permissions", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), permission_controllers_1.createPermission);
/**
 * @route PUT /permissions/:id
 * @description Cập nhật thông tin quyền hạn
 * @access Private - Chỉ admin mới có quyền cập nhật quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của quyền hạn cần cập nhật
 * @body {name: string}
 * @returns {message: string, data: Permission}
 */
permissionRouter.put("/permissions/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), permission_controllers_1.updatePermission);
/**
 * @route DELETE /permissions/:id
 * @description Xóa quyền hạn khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của quyền hạn cần xóa
 * @returns {message: string, data: Permission}
 */
permissionRouter.delete("/permissions/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), permission_controllers_1.deletePermission);
// ==================== ROLE PERMISSION MANAGEMENT ROUTES ====================
/**
 * @route GET /role-permissions
 * @description Lấy danh sách tất cả mối quan hệ giữa vai trò và quyền hạn
 * @access Public - Ai cũng có thể xem danh sách role permissions
 * @returns {message: string, data: RolePermission[]}
 */
permissionRouter.get("/role-permissions", rolePermission_controllers_1.getAllRolePermissions);
/**
 * @route GET /check-role-permissions/:roleId/:permissionId
 * @description Kiểm tra xem một vai trò có quyền hạn cụ thể hay không
 * @access Public - Ai cũng có thể kiểm tra quyền hạn
 * @param {number} roleId - ID của vai trò
 * @param {number} permissionId - ID của quyền hạn
 * @returns {message: string, data: boolean}
 */
permissionRouter.get("/check-role-permissions/:roleId/:permissionId", rolePermission_controllers_1.checkRolePermission);
/**
 * @route POST /create-role-permissions
 * @description Gán quyền hạn cho vai trò
 * @access Private - Chỉ admin mới có quyền gán quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number, active: boolean}
 * @returns {message: string, data: RolePermission}
 */
permissionRouter.post("/create-role-permissions", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), rolePermission_controllers_1.createRolePermission);
/**
 * @route PUT /update-role-permissions
 * @description Cập nhật trạng thái quyền hạn của vai trò
 * @access Private - Chỉ admin mới có quyền cập nhật quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number, active: boolean}
 * @returns {message: string, data: object}
 */
permissionRouter.put("/update-role-permissions", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), rolePermission_controllers_1.updateRolePermission);
/**
 * @route DELETE /delete-role-permissions
 * @description Thu hồi quyền hạn của vai trò
 * @access Private - Chỉ admin mới có quyền thu hồi quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number}
 * @returns {message: string, data: object}
 */
permissionRouter.delete("/delete-role-permissions", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), rolePermission_controllers_1.deleteRolePermission);
exports.default = permissionRouter;
