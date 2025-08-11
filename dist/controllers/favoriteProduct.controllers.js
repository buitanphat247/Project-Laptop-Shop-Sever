"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllFavoriteProducts = exports.deleteFavoriteProduct = exports.getFavoriteProductsOfUser = exports.createFavoriteProduct = void 0;
const client_1 = __importDefault(require("../client"));
// Thêm sản phẩm yêu thích (có kiểm tra tồn tại, update nếu đã có)
const createFavoriteProduct = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        // Kiểm tra đã tồn tại chưa
        const existing = await client_1.default.favoriteProduct.findFirst({
            where: { userId, productId },
        });
        let favorite;
        let message;
        if (!existing) {
            // Chưa có, tạo mới
            favorite = await client_1.default.favoriteProduct.create({
                data: { userId, productId, active: true },
            });
            message = "Đã thêm vào yêu thích";
        }
        else {
            // Đã có, đảo trạng thái active
            favorite = await client_1.default.favoriteProduct.update({
                where: { id: existing.id },
                data: { active: !existing.active },
            });
            message = favorite.active ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích";
        }
        res.json({ message, data: favorite });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi thêm yêu thích", error });
    }
};
exports.createFavoriteProduct = createFavoriteProduct;
// Lấy tất cả sản phẩm yêu thích của user
const getFavoriteProductsOfUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const favorites = await client_1.default.favoriteProduct.findMany({
            where: { userId },
            include: { product: true },
        });
        res.json({ message: "Danh sách sản phẩm yêu thích", data: favorites });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách yêu thích", error });
    }
};
exports.getFavoriteProductsOfUser = getFavoriteProductsOfUser;
// Xóa sản phẩm yêu thích theo id
const deleteFavoriteProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await client_1.default.favoriteProduct.delete({ where: { id } });
        res.json({ message: "Đã xóa khỏi yêu thích" });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi xóa yêu thích", error });
    }
};
exports.deleteFavoriteProduct = deleteFavoriteProduct;
// Lấy tất cả favoriteProduct (admin)
const getAllFavoriteProducts = async (req, res) => {
    try {
        const favorites = await client_1.default.favoriteProduct.findMany({
            include: { user: true, product: true },
        });
        res.json({ message: "Tất cả sản phẩm yêu thích", data: favorites });
    }
    catch (error) {
        res.status(500).json({ message: "Lỗi lấy danh sách", error });
    }
};
exports.getAllFavoriteProducts = getAllFavoriteProducts;
