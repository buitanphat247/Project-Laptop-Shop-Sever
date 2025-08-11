"use strict";
/**
 * @fileoverview News Management Controller
 * @description Xử lý logic quản lý tin tức/bài viết (CRUD operations) với slug tự động
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNewsById = exports.updateNewsById = exports.createNews = exports.getNewsById = exports.getNews = exports.getNewsByUserId = void 0;
const client_1 = __importDefault(require("../client"));
const slugify_1 = __importDefault(require("slugify"));
/**
 * @function getNewsByUserId
 * @description Lấy danh sách bài viết theo ID người dùng (authorId)
 * @param {Request} req - Express request object với params.userId
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /news-of-user/1
 * // Response
 * {
 *   "message": "Lấy danh sách news theo user thành công",
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Tin tức mới nhất",
 *       "slug": "tin-tuc-moi-nhat",
 *       "content": "Nội dung bài viết...",
 *       "author": {
 *         "id": 1,
 *         "fullName": "John Doe",
 *         "email": "john@example.com"
 *       }
 *     }
 *   ]
 * }
 */
const getNewsByUserId = async (req, res) => {
    try {
        // Validate userId từ params
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({
                message: "Invalid userId",
                data: null,
            });
            return;
        }
        // Lấy danh sách bài viết của user cụ thể với thông tin author
        const newsList = await client_1.default.news.findMany({
            where: { authorId: userId },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        // thêm các trường khác nếu cần
                    },
                },
            },
        });
        res.json({
            message: "Lấy danh sách news theo user thành công",
            data: newsList,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching news by user",
            data: null,
            error,
        });
    }
};
exports.getNewsByUserId = getNewsByUserId;
/**
 * @function getNews
 * @description Lấy danh sách tất cả bài viết với phân trang và thông tin tác giả
 * @param {Request} req - Express request object với query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /news?page=1&limit=10
 * // Response
 * {
 *   "message": "Lấy danh sách news thành công",
 *   "data": [
 *     {
 *       "id": 1,
 *       "title": "Tin tức mới nhất",
 *       "slug": "tin-tuc-moi-nhat",
 *       "content": "Nội dung bài viết...",
 *       "author": {
 *         "id": 1,
 *         "fullName": "John Doe",
 *         "email": "john@example.com"
 *       }
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
const getNews = async (req, res) => {
    try {
        // Lấy tham số phân trang từ query string
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Lấy tổng số bài viết để tính pagination
        const total = await client_1.default.news.count();
        // Lấy danh sách bài viết với phân trang và thông tin tác giả
        const newsList = await client_1.default.news.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" }, // Sắp xếp theo thời gian tạo mới nhất
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        // thêm các trường khác nếu cần
                    },
                },
            },
        });
        res.json({
            message: "Lấy danh sách news thành công",
            data: newsList,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching news",
            data: null,
            error,
        });
    }
};
exports.getNews = getNews;
/**
 * @function getNewsById
 * @description Lấy thông tin chi tiết của một bài viết theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-news/1
 * // Response
 * {
 *   "message": "Lấy news thành công",
 *   "data": {
 *     "id": 1,
 *     "title": "Tin tức mới nhất",
 *     "slug": "tin-tuc-moi-nhat",
 *     "content": "Nội dung chi tiết bài viết...",
 *     "thumbnail": "image.jpg",
 *     "published": true
 *   }
 * }
 */
const getNewsById = async (req, res) => {
    try {
        // Tìm bài viết theo ID trong database
        const news = await client_1.default.news.findUnique({
            where: { id: Number(req.params.id) },
        });
        // Kiểm tra bài viết có tồn tại không
        if (!news) {
            res.status(404).json({ message: "News not found", data: null });
            return;
        }
        res.json({
            message: "Lấy news thành công",
            data: news,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching news by id",
            data: null,
            error,
        });
    }
};
exports.getNewsById = getNewsById;
/**
 * @function createNews
 * @description Tạo bài viết mới với slug tự động từ title
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-news
 * // Request body
 * {
 *   "title": "Tin tức mới nhất về công nghệ",
 *   "content": "Nội dung bài viết chi tiết...",
 *   "thumbnail": "tech-news.jpg",
 *   "desc": "Mô tả ngắn gọn",
 *   "userId": 1
 * }
 *
 * // Response
 * {
 *   "message": "News created",
 *   "data": {
 *     "id": 1,
 *     "title": "Tin tức mới nhất về công nghệ",
 *     "slug": "tin-tuc-moi-nhat-ve-cong-nghe",
 *     "content": "Nội dung bài viết chi tiết...",
 *     "published": true
 *   }
 * }
 */
const createNews = async (req, res) => {
    try {
        const { title, content, thumbnail, desc, userId: authorId } = req.body;
        // Tự động tạo slug từ title sử dụng slugify để tạo URL thân thiện
        const slug = (0, slugify_1.default)(title, {
            lower: true, // chuyển về chữ thường
            strict: true, // loại bỏ ký tự đặc biệt
            locale: "vi", // hỗ trợ tiếng Việt
        });
        // Mặc định published = true khi tạo mới bài viết
        const published = true;
        // Tạo bài viết mới trong database
        const newNews = await client_1.default.news.create({
            data: { title, slug, content, thumbnail, published, authorId, desc },
        });
        res.status(201).json({
            message: "News created",
            data: newNews,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error creating news",
            data: null,
            error,
        });
    }
};
exports.createNews = createNews;
/**
 * @function updateNewsById
 * @description Cập nhật thông tin bài viết theo ID với slug tự động
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-news/1
 * // Request body
 * {
 *   "title": "Tin tức cập nhật về công nghệ",
 *   "content": "Nội dung cập nhật...",
 *   "thumbnail": "updated-tech.jpg",
 *   "desc": "Mô tả cập nhật",
 *   "authorId": 1
 * }
 *
 * // Response
 * {
 *   "message": "News updated",
 *   "data": {
 *     "id": 1,
 *     "title": "Tin tức cập nhật về công nghệ",
 *     "slug": "tin-tuc-cap-nhat-ve-cong-nghe",
 *     "content": "Nội dung cập nhật..."
 *   }
 * }
 */
const updateNewsById = async (req, res) => {
    try {
        const { title, content, thumbnail, authorId, desc } = req.body;
        // Tự động tạo slug từ title nếu có title mới
        const slug = title
            ? (0, slugify_1.default)(title, {
                lower: true,
                strict: true,
                locale: "vi",
            })
            : undefined;
        // Mặc định published = true khi cập nhật
        const published = true;
        // Cập nhật bài viết với conditional updates
        const updatedNews = await client_1.default.news.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(title && { title, slug }), // Chỉ cập nhật nếu có title
                ...(content && { content }),
                ...(thumbnail && { thumbnail }),
                ...(published !== undefined && { published }),
                ...(authorId && { authorId }),
                ...(desc && { desc }),
            },
        });
        res.json({
            message: "News updated",
            data: updatedNews,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating news",
            data: null,
            error,
        });
    }
};
exports.updateNewsById = updateNewsById;
/**
 * @function deleteNewsById
 * @description Xóa bài viết khỏi hệ thống theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-news/1
 * // Response
 * {
 *   "message": "News deleted",
 *   "data": null
 * }
 */
const deleteNewsById = async (req, res) => {
    try {
        // Xóa bài viết theo ID từ database
        await client_1.default.news.delete({
            where: { id: Number(req.params.id) },
        });
        res.json({
            message: "News deleted",
            data: null,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting news",
            data: null,
            error,
        });
    }
};
exports.deleteNewsById = deleteNewsById;
