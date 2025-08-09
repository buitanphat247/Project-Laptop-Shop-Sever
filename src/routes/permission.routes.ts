/**
 * @fileoverview Role & Permission Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý vai trò và quyền hạn
 * @author Your Name
 * @version 1.0.0
 */

// routes/permission.routes.ts
import { Router } from "express";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";
import { getAllRoles, getRoleById, createRole, updateRole, deleteRole } from "../controllers/role.controllers";
import { getAllPermissions, getPermissionById, createPermission, updatePermission, deletePermission } from "../controllers/permission.controllers";
import {
  getAllRolePermissions,
  checkRolePermission,
  createRolePermission,
  updateRolePermission,
  deleteRolePermission,
} from "../controllers/rolePermission.controllers";

const permissionRouter = Router();

// ==================== ROLE MANAGEMENT ROUTES ====================

/**
 * @route GET /roles
 * @description Lấy danh sách tất cả vai trò trong hệ thống
 * @access Public - Ai cũng có thể xem danh sách vai trò
 * @returns {message: string, data: Role[]}
 */
permissionRouter.get("/roles", getAllRoles);

/**
 * @route GET /get-role/:id
 * @description Lấy thông tin chi tiết của một vai trò theo ID
 * @access Public - Ai cũng có thể xem thông tin vai trò
 * @param {number} id - ID của vai trò cần lấy thông tin
 * @returns {message: string, data: Role}
 */
permissionRouter.get("/get-role/:id", getRoleById);

/**
 * @route POST /create-role
 * @description Tạo vai trò mới trong hệ thống
 * @access Private - Chỉ admin mới có quyền tạo vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string}
 * @returns {message: string, data: Role}
 */
permissionRouter.post("/create-role", verifyToken, checkPermission, authorize("admin"), createRole);

/**
 * @route PUT /update-role/:id
 * @description Cập nhật thông tin vai trò
 * @access Private - Chỉ admin mới có quyền cập nhật vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của vai trò cần cập nhật
 * @body {name: string}
 * @returns {message: string, data: Role}
 */
permissionRouter.put("/update-role/:id", verifyToken, checkPermission, authorize("admin"), updateRole);

/**
 * @route DELETE /delete-role/:id
 * @description Xóa vai trò khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa vai trò
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của vai trò cần xóa
 * @returns {message: string, data: Role}
 */
permissionRouter.delete("/delete-role/:id", verifyToken, checkPermission, authorize("admin"), deleteRole);

// ==================== PERMISSION MANAGEMENT ROUTES ====================

/**
 * @route GET /permissions
 * @description Lấy danh sách tất cả quyền hạn với phân trang
 * @access Public - Ai cũng có thể xem danh sách quyền hạn
 * @query {page?: number, limit?: number}
 * @returns {message: string, data: Permission[], pagination: object}
 */
permissionRouter.get("/permissions", getAllPermissions);

/**
 * @route GET /permissions/:id
 * @description Lấy thông tin chi tiết của một quyền hạn theo ID
 * @access Public - Ai cũng có thể xem thông tin quyền hạn
 * @param {number} id - ID của quyền hạn cần lấy thông tin
 * @returns {message: string, data: Permission}
 */
permissionRouter.get("/permissions/:id", getPermissionById);

/**
 * @route POST /create-permissions
 * @description Tạo quyền hạn mới trong hệ thống
 * @access Private - Chỉ admin mới có quyền tạo quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, method: string, route: string, slug: string}
 * @returns {message: string, data: Permission}
 */
permissionRouter.post("/create-permissions", verifyToken, checkPermission, authorize("admin"), createPermission);

/**
 * @route PUT /permissions/:id
 * @description Cập nhật thông tin quyền hạn
 * @access Private - Chỉ admin mới có quyền cập nhật quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của quyền hạn cần cập nhật
 * @body {name: string}
 * @returns {message: string, data: Permission}
 */
permissionRouter.put("/permissions/:id", verifyToken, checkPermission, authorize("admin"), updatePermission);

/**
 * @route DELETE /permissions/:id
 * @description Xóa quyền hạn khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của quyền hạn cần xóa
 * @returns {message: string, data: Permission}
 */
permissionRouter.delete("/permissions/:id", verifyToken, checkPermission, authorize("admin"), deletePermission);

// ==================== ROLE PERMISSION MANAGEMENT ROUTES ====================

/**
 * @route GET /role-permissions
 * @description Lấy danh sách tất cả mối quan hệ giữa vai trò và quyền hạn
 * @access Public - Ai cũng có thể xem danh sách role permissions
 * @returns {message: string, data: RolePermission[]}
 */
permissionRouter.get("/role-permissions", getAllRolePermissions);

/**
 * @route GET /check-role-permissions/:roleId/:permissionId
 * @description Kiểm tra xem một vai trò có quyền hạn cụ thể hay không
 * @access Public - Ai cũng có thể kiểm tra quyền hạn
 * @param {number} roleId - ID của vai trò
 * @param {number} permissionId - ID của quyền hạn
 * @returns {message: string, data: boolean}
 */
permissionRouter.get("/check-role-permissions/:roleId/:permissionId", checkRolePermission);

/**
 * @route POST /create-role-permissions
 * @description Gán quyền hạn cho vai trò
 * @access Private - Chỉ admin mới có quyền gán quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number, active: boolean}
 * @returns {message: string, data: RolePermission}
 */
permissionRouter.post("/create-role-permissions", verifyToken, checkPermission, authorize("admin"), createRolePermission);

/**
 * @route PUT /update-role-permissions
 * @description Cập nhật trạng thái quyền hạn của vai trò
 * @access Private - Chỉ admin mới có quyền cập nhật quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number, active: boolean}
 * @returns {message: string, data: object}
 */
permissionRouter.put("/update-role-permissions", verifyToken, checkPermission, authorize("admin"), updateRolePermission);

/**
 * @route DELETE /delete-role-permissions
 * @description Thu hồi quyền hạn của vai trò
 * @access Private - Chỉ admin mới có quyền thu hồi quyền hạn
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {roleId: number, permissionId: number}
 * @returns {message: string, data: object}
 */
permissionRouter.delete("/delete-role-permissions", verifyToken, checkPermission, authorize("admin"), deleteRolePermission);

export default permissionRouter;
