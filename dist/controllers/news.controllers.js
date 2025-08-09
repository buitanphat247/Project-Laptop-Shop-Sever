"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNewsById = exports.updateNewsById = exports.createNews = exports.getNewsById = exports.getNews = exports.getNewsByUserId = void 0;
const client_1 = __importDefault(require("../client"));
const slugify_1 = __importDefault(require("slugify"));
/**
 * Lấy danh sách bài viết theo id user (authorId)
 * GET /news-of-user/:userId
 */
const getNewsByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (isNaN(userId)) {
            res.status(400).json({
                message: "Invalid userId",
                data: null,
            });
            return;
        }
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
// Lấy danh sách news kèm thông tin user (author) + hỗ trợ phân trang (page, limit)
const getNews = async (req, res) => {
    try {
        // Lấy page và limit từ query, mặc định page=1, limit=10
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Lấy tổng số bản ghi
        const total = await client_1.default.news.count();
        // Lấy danh sách news với phân trang
        const newsList = await client_1.default.news.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
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
// Lấy news theo id
const getNewsById = async (req, res) => {
    try {
        const news = await client_1.default.news.findUnique({
            where: { id: Number(req.params.id) },
        });
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
// Tạo mới news
const createNews = async (req, res) => {
    try {
        const { title, content, thumbnail, desc, userId: authorId } = req.body;
        // Tự động tạo slug từ title sử dụng slugify
        const slug = (0, slugify_1.default)(title, {
            lower: true, // chuyển về chữ thường
            strict: true, // loại bỏ ký tự đặc biệt
            locale: "vi", // hỗ trợ tiếng Việt
        });
        // Mặc định published = true khi tạo mới
        const published = true;
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
// Cập nhật news
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
        // Mặc định published = true khi tạo mới
        const published = true;
        const updatedNews = await client_1.default.news.update({
            where: { id: Number(req.params.id) },
            data: {
                ...(title && { title, slug }),
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
// Xoá news
const deleteNewsById = async (req, res) => {
    try {
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
