/**
 * @fileoverview Permission Management Controller
 * @description Xử lý logic quản lý quyền hạn (permissions) trong hệ thống RBAC
 * @author Your Name
 * @version 1.0.0
 */

// controllers/permission.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

/**
 * @function getAllPermissions
 * @description Lấy danh sách tất cả quyền hạn trong hệ thống với phân trang
 * @param {Request} req - Express request object với query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /permissions?page=1&limit=10
 * // Response
 * {
 *   "message": "Fetched all permissions successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "user:read",
 *       "method": "GET",
 *       "route": "/user",
 *       "slug": "user-read"
 *     }
 *   ],
 *   "pagination": {
 *     "total": 50,
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 5
 *   }
 * }
 */
export const getAllPermissions = async (req: Request, res: Response) => {
  try {
    // Lấy tham số phân trang từ query string
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Lấy danh sách permissions và tổng số cùng lúc để tối ưu performance
    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" }, // Sắp xếp theo ID tăng dần
      }),
      prisma.permission.count(), // Đếm tổng số permissions
    ]);

    res.json({
      message: "Fetched all permissions successfully.",
      data: permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching permissions.", error });
  }
};

/**
 * @function getPermissionById
 * @description Lấy thông tin chi tiết của một quyền hạn theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /get-permission/1
 * // Response
 * {
 *   "message": "Fetched permission successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "user:read",
 *     "method": "GET",
 *     "route": "/user",
 *     "slug": "user-read"
 *   }
 * }
 */
export const getPermissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tìm permission theo ID trong database
    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });
    
    // Kiểm tra permission có tồn tại không
    if (!permission) {
      res.status(404).json({ message: "Permission not found.", data: null });
      return;
    }
    
    res.json({ message: "Fetched permission successfully.", data: permission });
  } catch (error) {
    res.status(500).json({ message: "Error fetching permission.", error });
  }
};

/**
 * @function createPermission
 * @description Tạo quyền hạn mới trong hệ thống
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // POST /create-permission
 * // Request body
 * {
 *   "name": "product:create",
 *   "method": "POST",
 *   "route": "/create-product",
 *   "slug": "product-create"
 * }
 * 
 * // Response
 * {
 *   "message": "Permission created successfully.",
 *   "data": {
 *     "id": 5,
 *     "name": "product:create",
 *     "method": "POST",
 *     "route": "/create-product",
 *     "slug": "product-create"
 *   }
 * }
 */
export const createPermission = async (req: Request, res: Response) => {
  try {
    const { name, method, route, slug } = req.body;
    
    // Tạo permission mới trong database
    const newPermission = await prisma.permission.create({
      data: { name, method, route, slug },
    });
    
    res.status(201).json({
      message: "Permission created successfully.",
      data: newPermission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating permission.", error });
  }
};

/**
 * @function updatePermission
 * @description Cập nhật thông tin quyền hạn theo ID
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // PUT /update-permission/1
 * // Request body
 * {
 *   "name": "user:read:all"
 * }
 * 
 * // Response
 * {
 *   "message": "Permission updated successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "user:read:all",
 *     "method": "GET",
 *     "route": "/user",
 *     "slug": "user-read"
 *   }
 * }
 */
export const updatePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Cập nhật permission với tên mới
    const updatedPermission = await prisma.permission.update({
      where: { id: Number(id) },
      data: { name },
    });
    
    res.json({
      message: "Permission updated successfully.",
      data: updatedPermission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating permission.", error });
  }
};

/**
 * @function deletePermission
 * @description Xóa quyền hạn khỏi hệ thống theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // DELETE /delete-permission/1
 * // Response
 * {
 *   "message": "Permission deleted successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "user:read",
 *     "method": "GET",
 *     "route": "/user",
 *     "slug": "user-read"
 *   }
 * }
 */
export const deletePermission = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Xóa permission theo ID từ database
    const deletedPermission = await prisma.permission.delete({
      where: { id: Number(id) },
    });
    
    res.json({
      message: "Permission deleted successfully.",
      data: deletedPermission,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting permission.", error });
  }
};
