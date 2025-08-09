/**
 * @fileoverview Role Permission Management Controller
 * @description Xử lý logic quản lý mối quan hệ giữa vai trò và quyền hạn (RBAC)
 * @author Your Name
 * @version 1.0.0
 */

// controllers/rolePermission.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

/**
 * @function getAllRolePermissions
 * @description Lấy tất cả mối quan hệ vai trò-quyền hạn với thông tin chi tiết
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /role-permissions
 * // Response
 * {
 *   "message": "Fetched all rolePermissions successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "roleId": 1,
 *       "permissionId": 1,
 *       "active": true,
 *       "role": { "id": 1, "name": "admin" },
 *       "permission": { "id": 1, "name": "user:read" }
 *     }
 *   ]
 * }
 */
export const getAllRolePermissions = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả role permissions với thông tin role và permission
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true, // Include thông tin vai trò
        permission: true, // Include thông tin quyền hạn
      },
      orderBy: { id: "asc" }, // Sắp xếp theo ID tăng dần
    });
    
    res.json({
      message: "Fetched all rolePermissions successfully.",
      data: rolePermissions,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching rolePermissions.", data: null, error });
  }
};

/**
 * @function checkRolePermission
 * @description Kiểm tra xem một vai trò có quyền hạn cụ thể hay không
 * @param {Request} req - Express request object với params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /check-role-permission/1/2
 * // Response khi có quyền
 * {
 *   "message": "RolePermission exists.",
 *   "data": true
 * }
 * 
 * // Response khi không có quyền
 * {
 *   "message": "RolePermission does not exist.",
 *   "data": false
 * }
 */
export const checkRolePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.params;
    
    // Validate tham số đầu vào
    if (!roleId || !permissionId) {
      res.status(400).json({
        message: "Missing roleId or permissionId in params.",
        data: null,
      });
      return;
    }
    
    // Tìm role permission theo roleId và permissionId
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId: Number(roleId),
        permissionId: Number(permissionId),
      },
    });

    // Kiểm tra sự tồn tại và trả về kết quả boolean
    const exists = !!rolePermission;
    res.json({
      message: exists ? "RolePermission exists." : "RolePermission does not exist.",
      data: exists,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error checking rolePermission.",
      data: null,
      error,
    });
  }
};

/**
 * @function createRolePermission
 * @description Tạo mối quan hệ mới giữa vai trò và quyền hạn
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // POST /create-role-permission
 * // Request body
 * {
 *   "roleId": 1,
 *   "permissionId": 2,
 *   "active": true
 * }
 * 
 * // Response
 * {
 *   "message": "RolePermission created successfully.",
 *   "data": {
 *     "id": 3,
 *     "roleId": 1,
 *     "permissionId": 2,
 *     "active": true
 *   }
 * }
 */
export const createRolePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, active } = req.body;
    
    // Tạo mối quan hệ role-permission mới
    const newRolePermission = await prisma.rolePermission.create({
      data: { roleId, permissionId, active },
    });
    
    res.status(201).json({
      message: "RolePermission created successfully.",
      data: newRolePermission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating rolePermission.", data: null, error });
  }
};

/**
 * @function updateRolePermission
 * @description Cập nhật trạng thái active của mối quan hệ vai trò-quyền hạn
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // PUT /update-role-permission
 * // Request body
 * {
 *   "roleId": 1,
 *   "permissionId": 2,
 *   "active": false
 * }
 * 
 * // Response
 * {
 *   "message": "RolePermission updated successfully.",
 *   "data": { "count": 1 }
 * }
 */
export const updateRolePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId, active } = req.body;
    
    // Cập nhật trạng thái active của role permission
    const updated = await prisma.rolePermission.updateMany({
      where: { roleId: Number(roleId), permissionId: Number(permissionId) },
      data: { active },
    });
    
    // Kiểm tra xem có bản ghi nào được cập nhật không
    if (updated.count === 0) {
      res.status(404).json({
        message: "RolePermission not found.",
        data: null,
      });
      return;
    }
    
    res.json({
      message: "RolePermission updated successfully.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating rolePermission.",
      data: null,
      error,
    });
  }
};

/**
 * @function deleteRolePermission
 * @description Xóa mối quan hệ giữa vai trò và quyền hạn
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // DELETE /delete-role-permission
 * // Request body
 * {
 *   "roleId": 1,
 *   "permissionId": 2
 * }
 * 
 * // Response
 * {
 *   "message": "RolePermission deleted successfully.",
 *   "data": { "count": 1 }
 * }
 */
export const deleteRolePermission = async (req: Request, res: Response) => {
  try {
    const { roleId, permissionId } = req.body;
    
    // Xóa mối quan hệ role-permission
    const deleted = await prisma.rolePermission.deleteMany({
      where: { roleId: Number(roleId), permissionId: Number(permissionId) },
    });
    
    // Kiểm tra xem có bản ghi nào được xóa không
    if (deleted.count === 0) {
      res.status(404).json({
        message: "RolePermission not found.",
        data: null,
      });
      return;
    }
    
    res.json({
      message: "RolePermission deleted successfully.",
      data: deleted,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting rolePermission.",
      data: null,
      error,
    });
  }
};
