/**
 * @fileoverview User Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý người dùng
 * @author Your Name
 * @version 1.0.0
 */

// routes/user.routes.ts
import { Router } from "express";
import { createUser, getUser, getUserById, deleteUserById, updateUserById } from "../controllers/user.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const userRouter = Router();

/**
 * @route GET /user
 * @description Lấy danh sách tất cả người dùng trong hệ thống
 * @access Private - Chỉ người dùng đã đăng nhập và có quyền
 * @middleware verifyToken, checkPermission
 * @returns {message: string, data: User[]}
 */
userRouter.get(
  "/user",
  verifyToken, checkPermission,
  getUser
);

/**
 * @route POST /create-account
 * @description Tạo tài khoản mới cho người dùng
 * @access Public - Ai cũng có thể tạo tài khoản
 * @body {email: string, password: string, fullName: string, roleId?: number}
 * @returns {message: string, data: User}
 */
userRouter.post("/create-account", createUser);

/**
 * @route GET /get-user/:id
 * @description Lấy thông tin chi tiết của một người dùng theo ID
 * @access Private - Chỉ người dùng đã đăng nhập và có quyền
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của người dùng cần lấy thông tin
 * @returns {message: string, data: User}
 */
userRouter.get("/get-user/:id", verifyToken, checkPermission, getUserById);

/**
 * @route DELETE /delete-user/:id
 * @description Xóa người dùng khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của người dùng cần xóa
 * @returns {message: string, data: User}
 */
userRouter.delete("/delete-user/:id", verifyToken, checkPermission, authorize("admin"), deleteUserById);

/**
 * @route PUT /update-user/:id
 * @description Cập nhật thông tin người dùng
 * @access Private - Chỉ người dùng đã đăng nhập và có quyền
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của người dùng cần cập nhật
 * @body {email?: string, fullName?: string, roleId?: number}
 * @returns {message: string, data: User}
 */
userRouter.put("/update-user/:id", verifyToken, checkPermission, updateUserById);

export default userRouter;
