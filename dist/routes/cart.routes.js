"use strict";
/**
 * @fileoverview Shopping Cart Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý giỏ hàng
 * @author Your Name
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
// routes/cart.routes.ts
const express_1 = require("express");
const cart_controllers_1 = require("../controllers/cart.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const cartRouter = (0, express_1.Router)();
/**
 * @route POST /create-cart-items
 * @description Thêm sản phẩm vào giỏ hàng của người dùng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể thêm vào giỏ hàng
 * @middleware verifyToken, checkPermission
 * @body {productId: number, quantity: number, userId: number}
 * @returns {message: string, data: CartItem}
 */
cartRouter.post("/create-cart-items", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, cart_controllers_1.createCartItem);
/**
 * @route GET /get-cart-items-of-user/:id
 * @description Lấy tất cả sản phẩm trong giỏ hàng của một người dùng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể xem giỏ hàng
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của người dùng cần lấy giỏ hàng
 * @returns {message: string, data: CartItem[]}
 */
cartRouter.get("/get-cart-items-of-user/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, cart_controllers_1.getCartItemOfUserById);
/**
 * @route DELETE /delete-cart-items/:id
 * @description Xóa một sản phẩm khỏi giỏ hàng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể xóa
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của item trong giỏ hàng cần xóa
 * @returns {message: string, data: CartItem}
 */
cartRouter.delete("/delete-cart-items/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, cart_controllers_1.deleteCartItemById);
/**
 * @route PUT /update-cart-items/:id
 * @description Cập nhật số lượng sản phẩm trong giỏ hàng
 * @access Private - Chỉ người dùng đã đăng nhập mới có thể cập nhật
 * @middleware verifyToken, checkPermission
 * @param {number} id - ID của item trong giỏ hàng cần cập nhật
 * @body {quantity: number}
 * @returns {message: string, data: CartItem}
 */
cartRouter.put("/update-cart-items/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, cart_controllers_1.updateCartItemById);
exports.default = cartRouter;
