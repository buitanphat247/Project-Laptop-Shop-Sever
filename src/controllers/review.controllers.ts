/**
 * @fileoverview Review Management Controller
 * @description Xử lý logic quản lý đánh giá sản phẩm (CRUD operations)
 * @author Your Name
 * @version 1.0.0
 */

// controllers/review.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

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
export const getReview = async (req: Request, res: Response) => {
  try {
    // Lấy tất cả đánh giá từ database
    const reviews = await prisma.review.findMany();
    res.status(200).json({
      message: "Lấy danh sách review thành công",
      data: reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách review",
      error: error,
    });
  }
};

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
export const createReview = async (req: Request, res: Response) => {
  try {
    const { productId, userId, rating, comment } = req.body;
    
    // Tạo đánh giá mới trong database
    const newReview = await prisma.review.create({
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi tạo review",
      error: error,
    });
  }
};

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
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tìm đánh giá theo ID trong database
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
    });
    
    // Kiểm tra đánh giá có tồn tại không
    if (review) {
      res.status(200).json({
        message: "Lấy review thành công",
        data: review,
      });
    } else {
      res.status(404).json({
        message: "Review not found",
        data: null,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi lấy review",
      error: error,
    });
  }
};

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
export const deleteReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Kiểm tra xem review có tồn tại không
    const review = await prisma.review.findUnique({
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
    await prisma.review.delete({
      where: { id: parseInt(id) },
    });

    res
      .status(200)
      .json({ message: "Review deleted successfully", data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Lỗi khi xóa review",
      error: error,
    });
  }
};

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
export const updateReviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rating, comment, userId } = req.body;

    // Cập nhật đánh giá với điều kiện userId để đảm bảo chỉ người tạo mới được cập nhật
    const updatedReview = await prisma.review.update({
      where: { id: parseInt(id), userId: userId }, // Điều kiện kép để bảo mật
      data: {
        rating,
        comment,
      },
    });
    
    res
      .status(200)
      .json({ message: "Review updated successfully", data: updatedReview });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật review", error: error });
  }
};
