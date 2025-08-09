"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewById = exports.deleteReviewById = exports.getReviewById = exports.createReview = exports.getReview = void 0;
const client_1 = __importDefault(require("../client"));
// Lấy danh sách review
const getReview = async (req, res) => {
    try {
        const reviews = await client_1.default.review.findMany();
        res.status(200).json({
            message: "Lấy danh sách review thành công",
            data: reviews,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi lấy danh sách review",
            error: error,
        });
    }
};
exports.getReview = getReview;
// Tạo mới review
const createReview = async (req, res) => {
    try {
        const { productId, userId, rating, comment } = req.body;
        const newReview = await client_1.default.review.create({
            data: {
                productId,
                userId,
                rating,
                comment,
            },
        });
        res.json({
            message: "Tạo review thành công",
            data: newReview,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi tạo review",
            error: error,
        });
    }
};
exports.createReview = createReview;
// Lấy review theo id
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const review = await client_1.default.review.findUnique({
            where: { id: parseInt(id) },
        });
        if (review) {
            res.status(200).json({
                message: "Lấy review thành công",
                data: review,
            });
        }
        else {
            res.status(404).json({
                message: "Review not found",
                data: null,
            });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi lấy review",
            error: error,
        });
    }
};
exports.getReviewById = getReviewById;
// Xóa review theo id
const deleteReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        // Kiểm tra xem review có tồn tại không
        const review = await client_1.default.review.findUnique({
            where: { id: parseInt(id) },
        });
        if (!review) {
            res.status(404).json({
                message: "Review not found",
                data: null,
            });
            return;
        }
        // Kiểm tra quyền xóa review (chỉ admin hoặc người tạo review mới được xóa)
        if (req.user.role !== "admin" && review.userId !== userId) {
            res.status(404).json({
                // Changed to 404 for unauthorized access
                message: "You do not have permission to delete this review",
                data: null,
            });
            return;
        }
        await client_1.default.review.delete({
            where: { id: parseInt(id) },
        });
        res
            .status(200)
            .json({ message: "Review deleted successfully", data: null });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Lỗi khi xóa review",
            error: error,
        });
    }
};
exports.deleteReviewById = deleteReviewById;
// Cập nhật review theo id
const updateReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;
        const updatedReview = await client_1.default.review.update({
            where: { id: parseInt(id), userId: userId },
            data: {
                rating,
                comment,
            },
        });
        res
            .status(200)
            .json({ message: "Review updated successfully", data: updatedReview });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Lỗi khi cập nhật review", error: error });
    }
};
exports.updateReviewById = updateReviewById;
