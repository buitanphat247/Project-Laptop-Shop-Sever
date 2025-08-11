"use strict";
/**
 * @fileoverview Category Management Controller
 * @description Xử lý logic quản lý danh mục sản phẩm (CRUD operations) với slug tự động và author tracking
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryById = exports.deleteCategoryById = exports.getProductByIdCategory = exports.getCategoryById = exports.createCategory = exports.getCategory = void 0;
const client_1 = __importDefault(require("../client"));
const slugify_1 = __importDefault(require("slugify"));
/**
 * @function getCategory
 * @description Lấy danh sách tất cả danh mục sản phẩm với thông tin tác giả
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /category
 * // Response
 * {
 *   "message": "Fetched categories successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Laptop",
 *       "slug": "laptop",
 *       "author": {
 *         "id": 1,
 *         "fullName": "Admin User",
 *         "email": "admin@example.com",
 *         "role": { "name": "admin" }
 *       }
 *     }
 *   ]
 * }
 */
const getCategory = async (req, res) => {
    try {
        // Lấy tất cả danh mục và include thông tin tác giả để hiển thị đầy đủ
        const categories = await client_1.default.category.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        role: true,
                        // thêm các trường khác nếu cần
                    },
                },
            },
        });
        res.json({ message: "Fetched categories successfully.", data: categories });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching categories.", error });
    }
};
exports.getCategory = getCategory;
/**
 * @function createCategory
 * @description Tạo danh mục sản phẩm mới với slug tự động từ tên
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-category
 * // Request body
 * {
 *   "name": "Laptop Gaming",
 *   "userId": 1
 * }
 *
 * // Response
 * {
 *   "message": "Category created successfully.",
 *   "data": {
 *     "id": 3,
 *     "name": "Laptop Gaming",
 *     "slug": "laptop-gaming",
 *     "authorId": 1
 *   }
 * }
 */
const createCategory = async (req, res) => {
    const { name, userId: authorId } = req.body;
    console.log("authorId: ", authorId);
    // Kiểm tra tên danh mục bắt buộc trước khi tạo
    if (!name) {
        res.status(400).json({ message: "Missing category name." });
        return;
    }
    // Tạo slug từ name sử dụng slugify để URL thân thiện và SEO-friendly
    const slug = (0, slugify_1.default)(name, {
        lower: true, // Chuyển về chữ thường
        strict: true, // Loại bỏ ký tự đặc biệt
        locale: "vi", // Hỗ trợ tiếng Việt
    });
    try {
        // Tạo danh mục mới với slug tự động và author tracking
        const newCategory = await client_1.default.category.create({
            data: { name, slug, authorId },
        });
        res.json({ message: "Category created successfully.", data: newCategory });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating category.", error });
    }
};
exports.createCategory = createCategory;
/**
 * @function getCategoryById
 * @description Lấy thông tin chi tiết của một danh mục theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-category/1
 * // Response
 * {
 *   "message": "Category fetched successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop",
 *     "slug": "laptop",
 *     "authorId": 1
 *   }
 * }
 */
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        // Tìm danh mục theo ID trong database
        const category = await client_1.default.category.findUnique({
            where: { id: Number(id) },
        });
        // Kiểm tra danh mục có tồn tại không
        if (!category) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        res.json({ message: "Category fetched successfully.", data: category });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching category.", error });
    }
};
exports.getCategoryById = getCategoryById;
/**
 * @function deleteCategoryById
 * @description Xóa danh mục khỏi hệ thống theo ID với error handling
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-category/1
 * // Response
 * {
 *   "message": "Category deleted successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop",
 *     "slug": "laptop"
 *   }
 * }
 */
const deleteCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        // Xóa danh mục theo ID từ database
        const deleted = await client_1.default.category.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Category deleted successfully.", data: deleted });
    }
    catch (error) {
        // Xử lý lỗi khi danh mục không tồn tại (Prisma error code P2025)
        if (error.code === "P2025") {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        res.status(500).json({ message: "Error deleting category.", error });
    }
};
exports.deleteCategoryById = deleteCategoryById;
/**
 * @function updateCategoryById
 * @description Cập nhật thông tin danh mục theo ID với slug tự động
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-category/1
 * // Request body
 * {
 *   "name": "Laptop Updated"
 * }
 *
 * // Response
 * {
 *   "message": "Category updated successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop Updated",
 *     "slug": "laptop-updated"
 *   }
 * }
 */
const updateCategoryById = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    // Kiểm tra tên danh mục bắt buộc trước khi cập nhật
    if (!name) {
        res.status(400).json({ message: "Missing category name." });
        return;
    }
    // Tạo slug mới từ name sử dụng slugify để đảm bảo URL consistency
    const slug = (0, slugify_1.default)(name, {
        lower: true, // Chuyển về chữ thường
        strict: true, // Loại bỏ ký tự đặc biệt
        locale: "vi", // Hỗ trợ tiếng Việt
    });
    try {
        // Cập nhật danh mục với slug mới để đảm bảo SEO consistency
        const updatedCategory = await client_1.default.category.update({
            where: { id: Number(id) },
            data: { name, slug },
        });
        res.json({
            message: "Category updated successfully.",
            data: updatedCategory,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating category.", error });
    }
};
exports.updateCategoryById = updateCategoryById;
/**
 * @function getProductByIdCategory
 * @description Lấy danh sách sản phẩm theo danh mục với phân trang và thông tin chi tiết
 * @param {Request} req - Express request object với params.categoryId và query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-list-product-by-category-id/1?page=1&limit=10
 * // Response
 * {
 *   "message": "Products fetched successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Laptop Gaming",
 *       "price": 25000000,
 *       "category": {
 *         "id": 1,
 *         "name": "Laptop",
 *         "slug": "laptop"
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 25,
 *     "totalPages": 3
 *   }
 * }
 */
const getProductByIdCategory = async (req, res) => {
    const { categoryId } = req.params;
    // Lấy tham số phân trang từ query string với giá trị mặc định
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit; // Tính offset cho pagination
    try {
        // Lấy tổng số sản phẩm trong category để tính pagination
        const total = await client_1.default.product.count({
            where: { categoryId: Number(categoryId) },
        });
        // Lấy danh sách sản phẩm với phân trang và include thông tin category
        const products = await client_1.default.product.findMany({
            where: { categoryId: Number(categoryId) },
            skip,
            take: limit,
            orderBy: { id: "asc" }, // Sắp xếp theo ID tăng dần
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });
        // Trả về response với pagination info
        res.json({
            message: "Products fetched successfully.",
            data: products,
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
            message: "Error fetching products.",
            data: null,
            error,
        });
    }
};
exports.getProductByIdCategory = getProductByIdCategory;
