/**
 * @fileoverview Role Management Controller
 * @description Xử lý logic quản lý vai trò (roles) trong hệ thống RBAC
 * @author Your Name
 * @version 1.0.0
 */

// controllers/role.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

/**
 * @function getAllRoles
 * @description Lấy danh sách tất cả vai trò trong hệ thống
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /roles
 * // Response
 * {
 *   "message": "Fetched all roles successfully.",
 *   "data": [
 *     { "id": 1, "name": "admin" },
 *     { "id": 2, "name": "user" },
 *     { "id": 3, "name": "moderator" }
 *   ]
 * }
 */
export const getAllRoles = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả vai trò từ database không cần phân trang
    const roles = await prisma.role.findMany();
    res.json({ message: "Fetched all roles successfully.", data: roles });
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles.", error });
  }
};

/**
 * @function getRoleById
 * @description Lấy thông tin chi tiết của một vai trò theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /get-role/1
 * // Response
 * {
 *   "message": "Fetched role successfully.",
 *   "data": { "id": 1, "name": "admin" }
 * }
 */
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tìm vai trò theo ID trong database
    const role = await prisma.role.findUnique({ where: { id: Number(id) } });
    
    // Kiểm tra vai trò có tồn tại không
    if (!role) {
      res.status(404).json({ message: "Role not found." });
      return;
    }
    
    res.json({ message: "Fetched role successfully.", data: role });
  } catch (error) {
    res.status(500).json({ message: "Error fetching role.", error });
  }
};

/**
 * @function createRole
 * @description Tạo vai trò mới trong hệ thống với validation trùng lặp
 * @param {Request} req - Express request object với body.name
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // POST /create-role
 * // Request body
 * {
 *   "name": "editor"
 * }
 * 
 * // Response
 * {
 *   "message": "Role created successfully.",
 *   "data": { "id": 4, "name": "editor" }
 * }
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    
    // Kiểm tra vai trò đã tồn tại chưa (case-insensitive để tránh trùng lặp)
    const existingRole = await prisma.role.findUnique({
      where: { name: name.toLowerCase() }
    });
    
    if (existingRole) {
      res.status(400).json({ 
        message: "Role already exists with this name.",
        data: null 
      });
      return;
    }
    
    // Tạo vai trò mới với tên được chuyển thành lowercase để chuẩn hóa
    const newRole = await prisma.role.create({ 
      data: { name: name.toLowerCase() } 
    });
    
    res.status(201).json({ 
      message: "Role created successfully.", 
      data: newRole 
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating role.", error });
  }
};

/**
 * @function updateRole
 * @description Cập nhật thông tin vai trò với validation trùng lặp
 * @param {Request} req - Express request object với params.id và body.name
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // PUT /update-role/1
 * // Request body
 * {
 *   "name": "super_admin"
 * }
 * 
 * // Response
 * {
 *   "message": "Role updated successfully.",
 *   "data": { "id": 1, "name": "super_admin" }
 * }
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Kiểm tra vai trò có tồn tại không trước khi cập nhật
    const existingRole = await prisma.role.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingRole) {
      res.status(404).json({ 
        message: "Role not found.",
        data: null 
      });
      return;
    }
    
    // Kiểm tra tên mới đã tồn tại chưa (trừ vai trò hiện tại để cho phép giữ nguyên tên)
    const duplicateRole = await prisma.role.findFirst({
      where: { 
        name: name.toLowerCase(),
        id: { not: Number(id) } // Loại trừ vai trò hiện tại khỏi việc kiểm tra trùng lặp
      }
    });
    
    if (duplicateRole) {
      res.status(400).json({ 
        message: "Role name already exists.",
        data: null 
      });
      return;
    }
    
    // Cập nhật vai trò với tên mới (lowercase để chuẩn hóa)
    const updatedRole = await prisma.role.update({
      where: { id: Number(id) },
      data: { name: name.toLowerCase() },
    });
    
    res.json({ message: "Role updated successfully.", data: updatedRole });
  } catch (error) {
    res.status(500).json({ message: "Error updating role.", error });
  }
};

/**
 * @function deleteRole
 * @description Xóa vai trò khỏi hệ thống với kiểm tra ràng buộc và cascade delete
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // DELETE /delete-role/3
 * // Response
 * {
 *   "message": "Role deleted successfully.",
 *   "data": { "id": 3, "name": "moderator" }
 * }
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra vai trò có tồn tại không trước khi xóa
    const existingRole = await prisma.role.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingRole) {
      res.status(404).json({ 
        message: "Role not found.",
        data: null 
      });
      return;
    }
    
    // Kiểm tra có user nào đang sử dụng vai trò này không (referential integrity)
    const usersWithRole = await prisma.user.findMany({
      where: { roleId: Number(id) }
    });
    
    if (usersWithRole.length > 0) {
      res.status(400).json({ 
        message: "Cannot delete role. There are users assigned to this role.",
        data: null 
      });
      return;
    }
    
    // Xóa tất cả role permissions trước khi xóa role (cascade delete để tránh lỗi foreign key)
    await prisma.rolePermission.deleteMany({
      where: { roleId: Number(id) }
    });
    
    // Xóa vai trò sau khi đã xóa các ràng buộc
    const deletedRole = await prisma.role.delete({
      where: { id: Number(id) },
    });
    
    res.json({
      message: "Role deleted successfully.",
      data: deletedRole,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting role.",
      data: null,
      error,
    });
  }
};
