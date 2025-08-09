/**
 * @fileoverview Order & Payment Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý đơn hàng và thanh toán VNPay
 * @author Your Name
 * @version 1.0.0
 */

// routes/order.routes.ts
import { Router } from "express";
import { createOrder, deleteOrderById, getAllOrders, getOrderById, getOrdersByUserId, updateOrderById } from "../controllers/order.controllers";
import { createVNPayPayment, handleVNPayReturn } from "../controllers/payment.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const orderRouter = Router();

// ==================== ORDER MANAGEMENT ROUTES ====================

/**
 * @route POST /create-order
 * @description Tạo đơn hàng mới từ giỏ hàng của người dùng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể tạo đơn hàng
 * @middleware verifyToken, checkPermission
 * @body {userId: number, shipName: string, shipAddress: string, shipPhone?: string, note?: string, items: OrderItem[]}
 * @returns {message: string, data: Order}
 */
orderRouter.post("/create-order", verifyToken, checkPermission, createOrder);

/**
 * @route GET /get-order/:id
 * @description Lấy thông tin chi tiết của một đơn hàng theo ID
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể xem đơn hàng
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của đơn hàng cần lấy thông tin
 * @returns {message: string, data: Order}
 */
orderRouter.get("/get-order/:id", verifyToken, checkPermission, getOrderById);

/**
 * @route GET /orders-of-user/:userId
 * @description Lấy tất cả đơn hàng của một người dùng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể xem đơn hàng của mình
 * @middleware verifyToken, checkPermission
 * @param {number} userId - ID của người dùng cần lấy đơn hàng
 * @returns {message: string, data: Order[]}
 */
orderRouter.get("/orders-of-user/:userId", verifyToken, checkPermission, getOrdersByUserId);

/**
 * @route GET /orders
 * @description Lấy tất cả đơn hàng trong hệ thống (dành cho admin)
 * @access Private - Chỉ admin mới có quyền xem tất cả đơn hàng
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @query {page?: number, limit?: number, status?: string}
 * @returns {message: string, data: Order[], pagination: object}
 */
orderRouter.get("/orders", verifyToken, checkPermission, authorize("admin"), getAllOrders);

/**
 * @route PUT /update-order/:id
 * @description Cập nhật trạng thái đơn hàng (dành cho admin)
 * @access Private - Chỉ admin mới có quyền cập nhật đơn hàng
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của đơn hàng cần cập nhật
 * @body {status?: string, shippedDate?: Date}
 * @returns {message: string, data: Order}
 */
orderRouter.put("/update-order/:id", verifyToken, checkPermission, authorize("admin"), updateOrderById);

/**
 * @route DELETE /delete-order/:id
 * @description Xóa đơn hàng (dành cho admin)
 * @access Private - Chỉ admin mới có quyền xóa đơn hàng
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của đơn hàng cần xóa
 * @returns {message: string, data: Order}
 */
orderRouter.delete("/delete-order/:id", verifyToken, checkPermission, authorize("admin"), deleteOrderById);

// ==================== VNPAY PAYMENT ROUTES ====================

/**
 * @route POST /payment-vnpay
 * @description Tạo URL thanh toán VNPay cho đơn hàng
 * @access Public - Ai cũng có thể tạo thanh toán
 * @body {orderInfo: string, amount: number, orderData: OrderData}
 * @returns {success: boolean, paymentUrl: string, message: string}
 */
orderRouter.post("/payment-vnpay", createVNPayPayment);

/**
 * @route GET /vnpay-return
 * @description Callback từ VNPay sau khi thanh toán hoàn tất
 * @access Public - VNPay sẽ gọi đến endpoint này
 * @query {vnp_ResponseCode: string, vnp_TxnRef: string, vnp_Amount: string, vnp_OrderInfo: string, ...}
 * @returns {success: boolean, message: string, data: object}
 */
orderRouter.get("/vnpay-return", handleVNPayReturn);

export default orderRouter;
