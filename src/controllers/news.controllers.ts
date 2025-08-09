/**
 * @fileoverview News Management Controller
 * @description Xử lý logic quản lý tin tức/bài viết (CRUD operations) với slug tự động
 * @author Your Name
 * @version 1.0.0
 */

// controllers/news.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";
import slugify from "slugify";

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
export const getNewsByUserId = async (req: Request, res: Response) => {
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
    const newsList = await prisma.news.findMany({
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
  } catch (error) {
    res.status(500).json({
      message: "Error fetching news by user",
      data: null,
      error,
    });
  }
};

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
export const getNews = async (req: Request, res: Response) => {
  try {
    // Lấy tham số phân trang từ query string
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Lấy tổng số bài viết để tính pagination
    const total = await prisma.news.count();

    // Lấy danh sách bài viết với phân trang và thông tin tác giả
    const newsList = await prisma.news.findMany({
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
  } catch (error) {
    res.status(500).json({
      message: "Error fetching news",
      data: null,
      error,
    });
  }
};

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
export const getNewsById = async (req: Request, res: Response) => {
  try {
    // Tìm bài viết theo ID trong database
    const news = await prisma.news.findUnique({
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
  } catch (error) {
    res.status(500).json({
      message: "Error fetching news by id",
      data: null,
      error,
    });
  }
};

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
export const createNews = async (req: Request, res: Response) => {
  try {
    const { title, content, thumbnail, desc, userId: authorId } = req.body;

    // Tự động tạo slug từ title sử dụng slugify để tạo URL thân thiện
    const slug = slugify(title, {
      lower: true, // chuyển về chữ thường
      strict: true, // loại bỏ ký tự đặc biệt
      locale: "vi", // hỗ trợ tiếng Việt
    });

    // Mặc định published = true khi tạo mới bài viết
    const published = true;

    // Tạo bài viết mới trong database
    const newNews = await prisma.news.create({
      data: { title, slug, content, thumbnail, published, authorId, desc },
    });
    
    res.status(201).json({
      message: "News created",
      data: newNews,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating news",
      data: null,
      error,
    });
  }
};

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
export const updateNewsById = async (req: Request, res: Response) => {
  try {
    const { title, content, thumbnail, authorId, desc } = req.body;

    // Tự động tạo slug từ title nếu có title mới
    const slug = title
      ? slugify(title, {
          lower: true,
          strict: true,
          locale: "vi",
        })
      : undefined;

    // Mặc định published = true khi cập nhật
    const published = true;

    // Cập nhật bài viết với conditional updates
    const updatedNews = await prisma.news.update({
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
  } catch (error) {
    res.status(500).json({
      message: "Error updating news",
      data: null,
      error,
    });
  }
};

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
export const deleteNewsById = async (req: Request, res: Response) => {
  try {
    // Xóa bài viết theo ID từ database
    await prisma.news.delete({
      where: { id: Number(req.params.id) },
    });
    
    res.json({
      message: "News deleted",
      data: null,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting news",
      data: null,
      error,
    });
  }
};
