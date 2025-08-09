/**
 * @fileoverview News Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý tin tức/bài viết
 * @author Your Name
 * @version 1.0.0
 */

// routes/news.routes.ts
import { Router } from "express";
import { createNews, getNews, getNewsById, updateNewsById, deleteNewsById, getNewsByUserId } from "../controllers/news.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const newsRouter = Router();

// ==================== NEWS MANAGEMENT ROUTES ====================

/**
 * @route GET /news
 * @description Lấy danh sách tất cả tin tức/bài viết trong hệ thống
 * @access Public - Ai cũng có thể xem danh sách tin tức
 * @returns {message: string, data: News[]}
 */
newsRouter.get("/news", getNews);

/**
 * @route GET /get-news/:id
 * @description Lấy thông tin chi tiết của một tin tức theo ID
 * @access Public - Ai cũng có thể xem chi tiết tin tức
 * @param {number} id - ID của tin tức cần lấy thông tin
 * @returns {message: string, data: News}
 */
newsRouter.get("/get-news/:id", getNewsById);

/**
 * @route POST /create-news
 * @description Tạo tin tức/bài viết mới
 * @access Private - Chỉ admin mới có quyền tạo tin tức
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {title: string, content: string, summary?: string, imageUrl?: string, authorId: number}
 * @returns {message: string, data: News}
 */
newsRouter.post("/create-news", verifyToken, checkPermission, authorize("admin"), createNews);

/**
 * @route PUT /update-news/:id
 * @description Cập nhật thông tin tin tức
 * @access Private - Chỉ admin mới có quyền cập nhật tin tức
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của tin tức cần cập nhật
 * @body {title?: string, content?: string, summary?: string, imageUrl?: string}
 * @returns {message: string, data: News}
 */
newsRouter.put("/update-news/:id", verifyToken, checkPermission, authorize("admin"), updateNewsById);

/**
 * @route DELETE /delete-news/:id
 * @description Xóa tin tức khỏi hệ thống
 * @access Private - Chỉ admin mới có quyền xóa tin tức
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của tin tức cần xóa
 * @returns {message: string, data: News}
 */
newsRouter.delete("/delete-news/:id", verifyToken, checkPermission, authorize("admin"), deleteNewsById);

/**
 * @route GET /news-of-user/:userId
 * @description Lấy danh sách tin tức theo tác giả (user ID)
 * @access Public - Ai cũng có thể xem tin tức của tác giả
 * @param {number} userId - ID của tác giả cần lấy tin tức
 * @returns {message: string, data: News[]}
 */
newsRouter.get("/news-of-user/:userId", getNewsByUserId);

export default newsRouter;
