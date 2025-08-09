"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProductById = exports.updateProductById = exports.getProductById = exports.createProduct = exports.getProduct = void 0;
const client_1 = __importDefault(require("../client"));
// Lấy danh sách tất cả product
const getProduct = async (req, res) => {
    try {
        // Lấy page và limit từ query, mặc định page=1, limit=10
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        // Lấy tổng số bản ghi
        const total = await client_1.default.product.count();
        // Lấy danh sách sản phẩm với phân trang và liên kết category, reviews
        const products = await client_1.default.product.findMany({
            skip,
            take: limit,
            orderBy: { id: "asc" },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
        res.json({
            message: "Fetched products successfully.",
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
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products.", error });
    }
};
exports.getProduct = getProduct;
// Tạo product mới
const createProduct = async (req, res) => {
    const { name, price, description, content, categoryId, stock, imageUrls } = req.body;
    if (!name || !price || !categoryId || stock === undefined || !imageUrls) {
        res.status(400).json({ message: "Missing required fields." });
        return;
    }
    try {
        const newProduct = await client_1.default.product.create({
            data: {
                name,
                price: Number(price),
                description: description || "",
                content: content || "",
                categoryId: Number(categoryId),
                stock: Number(stock),
                imageUrls,
            },
        });
        res.status(201).json({
            message: "Product created successfully.",
            data: newProduct
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error creating product.",
            data: null,
            error
        });
    }
};
exports.createProduct = createProduct;
// Lấy product theo id
const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await client_1.default.product.findUnique({
            where: { id: Number(id) },
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
        if (!product) {
            res.status(404).json({
                message: "Product not found.",
                data: null
            });
            return;
        }
        res.json({
            message: "Product fetched successfully.",
            data: product
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error fetching product.",
            data: null,
            error
        });
    }
};
exports.getProductById = getProductById;
// Cập nhật product theo id
const updateProductById = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, content, categoryId, stock, imageUrls } = req.body;
    try {
        // Tạo object data chỉ với những trường được gửi lên
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (price !== undefined)
            updateData.price = Number(price);
        if (description !== undefined)
            updateData.description = description;
        if (content !== undefined)
            updateData.content = content;
        if (categoryId !== undefined)
            updateData.categoryId = Number(categoryId);
        if (stock !== undefined)
            updateData.stock = Number(stock);
        if (imageUrls !== undefined)
            updateData.imageUrls = imageUrls;
        const updatedProduct = await client_1.default.product.update({
            where: { id: Number(id) },
            data: updateData,
        });
        res.json({
            message: "Product updated successfully.",
            data: updatedProduct,
        });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        res.status(500).json({ message: "Error updating product.", error });
    }
};
exports.updateProductById = updateProductById;
// Xóa product theo id
const deleteProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await client_1.default.product.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Product deleted successfully.", data: deleted });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        res.status(500).json({ message: "Error deleting product.", error });
    }
};
exports.deleteProductById = deleteProductById;
