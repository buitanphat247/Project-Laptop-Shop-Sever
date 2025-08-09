/**
 * @fileoverview Review Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý đánh giá sản phẩm
 * @author Your Name
 * @version 1.0.0
 */

// routes/review.routes.ts
import { Router } from "express";
import { getReview, createReview, getReviewById, deleteReviewById, updateReviewById } from "../controllers/review.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const reviewRouter = Router();

// ==================== REVIEW MANAGEMENT ROUTES ====================

/**
 * @route GET /review
 * @description Lấy danh sách tất cả đánh giá sản phẩm trong hệ thống
 * @access Public - Ai cũng có thể xem danh sách đánh giá
 * @returns {message: string, data: Review[]}
 */
reviewRouter.get("/review", getReview);

/**
 * @route POST /create-review
 * @description Tạo đánh giá mới cho sản phẩm
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể tạo đánh giá
 * @middleware verifyToken, checkPermission
 * @body {productId: number, rating: number, comment: string, userId: number}
 * @returns {message: string, data: Review}
 */
reviewRouter.post("/create-review", verifyToken, checkPermission, createReview);

/**
 * @route GET /get-review/:id
 * @description Lấy thông tin chi tiết của một đánh giá theo ID
 * @access Public - Ai cũng có thể xem chi tiết đánh giá
 * @param {number} id - ID của đánh giá cần lấy thông tin
 * @returns {message: string, data: Review}
 */
reviewRouter.get("/get-review/:id", getReviewById);

/**
 * @route DELETE /delete-review/:id
 * @description Xóa đánh giá khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa đánh giá
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của đánh giá cần xóa
 * @returns {message: string, data: Review}
 */
reviewRouter.delete("/delete-review/:id", verifyToken, checkPermission, deleteReviewById);

/**
 * @route PUT /update-review/:id
 * @description Cập nhật thông tin đánh giá
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể cập nhật đánh giá của mình
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của đánh giá cần cập nhật
 * @body {rating?: number, comment?: string}
 * @returns {message: string, data: Review}
 */
reviewRouter.put("/update-review/:id", verifyToken, checkPermission, updateReviewById);

export default reviewRouter;
