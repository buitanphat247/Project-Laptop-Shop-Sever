/**
 * @fileoverview User Management Controller
 * @description Xử lý logic quản lý người dùng (CRUD operations)
 * @author Your Name
 * @version 1.0.0
 */

// controllers/user.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";
import { hashPassword } from "../utils/hashPassword";
import { Role } from "@prisma/client";

/**
 * @function getUser
 * @description Lấy danh sách tất cả người dùng với phân trang và thông tin vai trò
 * @param {Request} req - Express request object với query params (page, limit)
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /user?page=1&limit=10
 * // Response
 * {
 *   "message": "Lấy danh sách user thành công",
 *   "data": [
 *     {
 *       "id": 1,
 *       "email": "user@example.com",
 *       "fullName": "John Doe",
 *       "role": { "id": 2, "name": "user" }
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 50,
 *     "totalPages": 5
 *   }
 * }
 */
const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lấy tham số phân trang từ query string
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Đếm tổng số user để tính pagination
    const total = await prisma.user.count();

    // Lấy danh sách user với phân trang và include thông tin vai trò
    const users = await prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { id: "asc" }, // Sắp xếp theo ID tăng dần
      include: { role: true }, // Include thông tin vai trò
    });

    // Trả về response với pagination
    res.json({
      message: "Lấy danh sách user thành công",
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      message: "Lỗi server khi lấy danh sách user.",
      data: null,
      error,
    });
  }
};

/**
 * @function createUser
 * @description Tạo tài khoản người dùng mới với password được mã hóa
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-account
 * // Request body
 * {
 *   "email": "newuser@example.com",
 *   "password": "password123",
 *   "fullName": "Jane Doe",
 *   "phone": "0123456789",
 *   "address": "123 Main St"
 * }
 *
 * // Response
 * {
 *   "message": "User created successfully.",
 *   "data": {
 *     "id": 3,
 *     "email": "newuser@example.com",
 *     "fullName": "Jane Doe",
 *     "roleId": 2
 *   }
 * }
 */
const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, fullName, phone, address } = req.body;

    // Validate các trường bắt buộc
    if (!email || !password) {
      res.status(400).json({ message: "Missing email or password." });
      return;
    }

    // Mã hóa password trước khi lưu vào database để bảo mật
    const hashedPassword = await hashPassword(password);

    // Tạo user mới với roleId mặc định là 2 (user role)
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword, // Lưu password đã mã hóa
        fullName: fullName || null,
        phone: phone || null,
        address: address || null,
        roleId: 2, // Mặc định là user role (không phải admin)
      },
    });

    res.json({ message: "User created successfully.", data: user });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server error while creating user." });
  }
};

/**
 * @function getUserById
 * @description Lấy thông tin chi tiết của một người dùng theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-user/1
 * // Response
 * {
 *   "message": "User fetched successfully.",
 *   "data": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "fullName": "John Doe",
 *     "phone": "0123456789",
 *     "address": "123 Main St",
 *     "roleId": 2
 *   }
 * }
 */
const getUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Tìm user theo ID trong database
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: {
        role: true,
      },
    });

    // Kiểm tra user có tồn tại không
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    res.json({ message: "User fetched successfully.", data: user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error while fetching user." });
  }
};

/**
 * @function deleteUserById
 * @description Xóa người dùng khỏi hệ thống theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-user/1
 * // Response
 * {
 *   "message": "User deleted successfully.",
 *   "data": {
 *     "id": 1,
 *     "email": "user@example.com",
 *     "fullName": "John Doe"
 *   }
 * }
 */
const deleteUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    // Xóa user theo ID từ database
    const user = await prisma.user.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "User deleted successfully.", data: user });
  } catch (error: any) {
    // Xử lý lỗi Prisma khi user không tồn tại (P2025 = Record not found)
    if (error.code === "P2025") {
      res.status(404).json({ message: "User not found." });
      return;
    }

    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server error while deleting user." });
  }
};

/**
 * @function updateUserById
 * @description Cập nhật thông tin người dùng theo ID (partial update)
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-user/1
 * // Request body
 * {
 *   "email": "updated@example.com",
 *   "fullName": "Updated Name",
 *   "phone": "0987654321",
 *   "address": "456 New St",
 *   "roleId": 1
 * }
 *
 * // Response
 * {
 *   "message": "User updated successfully.",
 *   "data": {
 *     "id": 1,
 *     "email": "updated@example.com",
 *     "fullName": "Updated Name",
 *     "roleId": 1
 *   }
 * }
 */
const updateUserById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { email, fullName, phone, address, roleId } = req.body;

  try {
    // Validate email là trường bắt buộc
    if (!email) {
      res.status(400).json({ message: "Missing email." });
      return;
    }

    // Cập nhật thông tin user với partial update
    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        email,
        fullName: fullName || null, // Cho phép null nếu không cung cấp
        phone: phone || null,
        address: address || null,
        roleId, // Có thể cập nhật vai trò
      },
    });

    res.json({ message: "User updated successfully.", data: updatedUser });
  } catch (error: any) {
    // Xử lý lỗi Prisma khi user không tồn tại (P2025 = Record not found)
    if (error.code === "P2025") {
      res.status(404).json({ message: "User not found." });
      return;
    }

    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error while updating user." });
  }
};

export { getUser, createUser, getUserById, deleteUserById, updateUserById };
