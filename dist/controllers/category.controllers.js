"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategoryById = exports.deleteCategoryById = exports.getProductByIdCategory = exports.getCategoryById = exports.createCategory = exports.getCategory = void 0;
const client_1 = __importDefault(require("../client"));
const slugify_1 = __importDefault(require("slugify"));
// Lấy danh sách tất cả category
const getCategory = async (req, res) => {
    try {
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
// Tạo category mới
const createCategory = async (req, res) => {
    const { name, userId: authorId } = req.body;
    console.log("authorId: ", authorId);
    if (!name) {
        res.status(400).json({ message: "Missing category name." });
        return;
    }
    // Tạo slug từ name sử dụng slugify
    const slug = (0, slugify_1.default)(name, {
        lower: true,
        strict: true,
        locale: "vi",
    });
    try {
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
// Lấy category theo id
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await client_1.default.category.findUnique({
            where: { id: Number(id) },
        });
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
// Xóa category theo id
const deleteCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await client_1.default.category.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Category deleted successfully.", data: deleted });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        res.status(500).json({ message: "Error deleting category.", error });
    }
};
exports.deleteCategoryById = deleteCategoryById;
const updateCategoryById = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        res.status(400).json({ message: "Missing category name." });
        return;
    }
    // Tạo slug từ name sử dụng slugify
    const slug = (0, slugify_1.default)(name, {
        lower: true,
        strict: true,
        locale: "vi",
    });
    try {
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
const getProductByIdCategory = async (req, res) => {
    const { categoryId } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    try {
        // Lấy tổng số sản phẩm trong category
        const total = await client_1.default.product.count({
            where: { categoryId: Number(categoryId) },
        });
        // Lấy danh sách sản phẩm với phân trang
        const products = await client_1.default.product.findMany({
            where: { categoryId: Number(categoryId) },
            skip,
            take: limit,
            orderBy: { id: "asc" },
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
