"use strict";
/**
 * @fileoverview Review Management Controller
 * @description Xử lý logic quản lý đánh giá sản phẩm (CRUD operations)
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateReviewById = exports.deleteReviewById = exports.getReviewById = exports.createReview = exports.getReview = void 0;
const client_1 = __importDefault(require("../client"));
/**
 * @function getReview
 * @description Lấy danh sách tất cả đánh giá sản phẩm trong hệ thống
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /review
 * // Response
 * {
 *   "message": "Lấy danh sách review thành công",
 *   "data": [
 *     {
 *       "id": 1,
 *       "productId": 1,
 *       "userId": 1,
 *       "rating": 5,
 *       "comment": "Sản phẩm rất tốt"
 *     }
 *   ]
 * }
 */
const getReview = async (req, res) => {
    try {
        // Lấy tất cả đánh giá từ database
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
/**
 * @function createReview
 * @description Tạo đánh giá mới cho sản phẩm
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-review
 * // Request body
 * {
 *   "productId": 1,
 *   "userId": 1,
 *   "rating": 5,
 *   "comment": "Sản phẩm chất lượng cao"
 * }
 *
 * // Response
 * {
 *   "message": "Tạo review thành công",
 *   "data": {
 *     "id": 1,
 *     "productId": 1,
 *     "userId": 1,
 *     "rating": 5,
 *     "comment": "Sản phẩm chất lượng cao"
 *   }
 * }
 */
const createReview = async (req, res) => {
    try {
        const { productId, userId, rating, comment } = req.body;
        // Tạo đánh giá mới trong database
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
/**
 * @function getReviewById
 * @description Lấy thông tin chi tiết của một đánh giá theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-review/1
 * // Response
 * {
 *   "message": "Lấy review thành công",
 *   "data": {
 *     "id": 1,
 *     "productId": 1,
 *     "userId": 1,
 *     "rating": 5,
 *     "comment": "Sản phẩm rất tốt"
 *   }
 * }
 */
const getReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        // Tìm đánh giá theo ID trong database
        const review = await client_1.default.review.findUnique({
            where: { id: parseInt(id) },
        });
        // Kiểm tra đánh giá có tồn tại không
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
/**
 * @function deleteReviewById
 * @description Xóa đánh giá khỏi hệ thống theo ID
 * @param {Request} req - Express request object với params.id và body.userId
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-review/1
 * // Request body
 * {
 *   "userId": 1
 * }
 *
 * // Response
 * {
 *   "message": "Review deleted successfully",
 *   "data": null
 * }
 */
const deleteReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.body;
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
        // TODO: Uncomment khi đã implement authentication middleware
        // if (req.user.role !== "admin" && review.userId !== userId) {
        //   res.status(403).json({
        //     message: "You do not have permission to delete this review",
        //     data: null,
        //   });
        //   return;
        // }
        // Xóa đánh giá khỏi database
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
/**
 * @function updateReviewById
 * @description Cập nhật thông tin đánh giá theo ID (chỉ người tạo review mới được cập nhật)
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-review/1
 * // Request body
 * {
 *   "rating": 4,
 *   "comment": "Sản phẩm tốt nhưng giá hơi cao",
 *   "userId": 1
 * }
 *
 * // Response
 * {
 *   "message": "Review updated successfully",
 *   "data": {
 *     "id": 1,
 *     "productId": 1,
 *     "userId": 1,
 *     "rating": 4,
 *     "comment": "Sản phẩm tốt nhưng giá hơi cao"
 *   }
 * }
 */
const updateReviewById = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment, userId } = req.body;
        // Cập nhật đánh giá với điều kiện userId để đảm bảo chỉ người tạo mới được cập nhật
        const updatedReview = await client_1.default.review.update({
            where: { id: parseInt(id), userId: userId }, // Điều kiện kép để bảo mật
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
