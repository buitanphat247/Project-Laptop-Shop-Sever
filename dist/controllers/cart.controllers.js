"use strict";
/**
 * @fileoverview Shopping Cart Management Controller
 * @description Xử lý logic quản lý giỏ hàng (thêm, xem, cập nhật, xóa sản phẩm) với stock management và transactions
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemById = exports.deleteCartItemById = exports.getCartItemOfUserById = exports.createCartItem = void 0;
const client_1 = __importDefault(require("../client"));
/**
 * @function createCartItem
 * @description Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại với stock validation
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-cart-items
 * // Request body
 * {
 *   "productId": 1,
 *   "quantity": 2,
 *   "userId": 1
 * }
 *
 * // Response khi tạo mới
 * {
 *   "message": "Đã thêm sản phẩm vào giỏ hàng.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "productId": 1,
 *     "quantity": 2
 *   }
 * }
 *
 * // Response khi cập nhật
 * {
 *   "message": "Đã cập nhật số lượng sản phẩm trong giỏ hàng.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "productId": 1,
 *     "quantity": 5
 *   }
 * }
 */
const createCartItem = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;
        // Kiểm tra dữ liệu đầu vào bắt buộc và validate kiểu dữ liệu
        if (!productId || !quantity || isNaN(userId)) {
            res.status(400).json({
                message: "Thiếu thông tin cần thiết.",
                data: null,
            });
            return;
        }
        // Sử dụng transaction để đảm bảo tính nhất quán dữ liệu giữa cart và stock
        const result = await client_1.default.$transaction(async (tx) => {
            // Kiểm tra sản phẩm có tồn tại và đủ số lượng trong kho không
            const product = await tx.product.findUnique({
                where: { id: Number(productId) },
            });
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            // Kiểm tra stock có đủ cho số lượng yêu cầu không
            if (product.stock < Number(quantity)) {
                throw new Error(`INSUFFICIENT_STOCK:${product.stock}`);
            }
            // Kiểm tra xem sản phẩm đã có trong giỏ hàng của user chưa
            const existingCartItem = await tx.cartItem.findFirst({
                where: {
                    userId,
                    productId: Number(productId),
                },
            });
            if (existingCartItem) {
                // Kiểm tra tổng số lượng sau khi cộng thêm có vượt quá stock không
                const totalQuantity = existingCartItem.quantity + Number(quantity);
                if (product.stock < totalQuantity) {
                    throw new Error(`INSUFFICIENT_STOCK_TOTAL:${existingCartItem.quantity}:${product.stock - existingCartItem.quantity}`);
                }
                // Cập nhật số lượng trong giỏ hàng
                const updatedCartItem = await tx.cartItem.update({
                    where: { id: existingCartItem.id },
                    data: {
                        quantity: totalQuantity,
                    },
                });
                // Trừ stock của sản phẩm (chỉ trừ số lượng mới thêm vào giỏ hàng)
                await tx.product.update({
                    where: { id: Number(productId) },
                    data: {
                        stock: product.stock - Number(quantity),
                    },
                });
                return { type: "update", data: updatedCartItem };
            }
            else {
                // Tạo mới cart item nếu sản phẩm chưa có trong giỏ hàng
                const newCartItem = await tx.cartItem.create({
                    data: {
                        userId,
                        productId: Number(productId),
                        quantity: Number(quantity),
                    },
                });
                // Trừ stock của sản phẩm khi thêm vào giỏ hàng
                await tx.product.update({
                    where: { id: Number(productId) },
                    data: {
                        stock: product.stock - Number(quantity),
                    },
                });
                return { type: "create", data: newCartItem };
            }
        });
        // Trả về response tương ứng với loại operation
        if (result.type === "update") {
            res.status(200).json({
                message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng.",
                data: result.data,
            });
        }
        else {
            res.status(201).json({
                message: "Đã thêm sản phẩm vào giỏ hàng.",
                data: result.data,
            });
        }
        return;
    }
    catch (error) {
        console.error(error);
        // Xử lý các lỗi custom với thông báo chi tiết
        if (error.message === "PRODUCT_NOT_FOUND") {
            res.status(404).json({
                message: "Sản phẩm không tồn tại.",
                data: null,
            });
            return;
        }
        if (error.message.startsWith("INSUFFICIENT_STOCK:")) {
            const stock = error.message.split(":")[1];
            res.status(400).json({
                message: `Không đủ số lượng trong kho. Chỉ còn ${stock} sản phẩm.`,
                data: null,
            });
            return;
        }
        if (error.message.startsWith("INSUFFICIENT_STOCK_TOTAL:")) {
            const [, currentInCart, maxCanAdd] = error.message.split(":");
            res.status(400).json({
                message: `Không đủ số lượng trong kho. Bạn đã có ${currentInCart} sản phẩm trong giỏ hàng, chỉ có thể thêm tối đa ${maxCanAdd} sản phẩm nữa.`,
                data: null,
            });
            return;
        }
        res.status(500).json({
            message: "Lỗi khi thêm/cập nhật sản phẩm vào giỏ hàng.",
            data: null,
            error: error.message,
        });
        return;
    }
};
exports.createCartItem = createCartItem;
/**
 * @function getCartItemOfUserById
 * @description Lấy thông tin giỏ hàng của một người dùng với đầy đủ thông tin sản phẩm và reviews
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-cart-items-of-user/1
 * // Response
 * {
 *   "message": "Cart items fetched successfully",
 *   "data": {
 *     "user": {
 *       "id": 1,
 *       "fullName": "John Doe",
 *       "email": "john@example.com",
 *       "phone": "0123456789",
 *       "address": "123 Main St"
 *     },
 *     "products": [
 *       {
 *         "cartItemId": 1,
 *         "productId": 1,
 *         "name": "Laptop Gaming",
 *         "price": 25000000,
 *         "quantity": 2,
 *         "category": {
 *           "id": 1,
 *           "name": "Laptop",
 *           "slug": "laptop"
 *         },
 *         "reviews": [
 *           {
 *             "reviewId": 1,
 *             "rating": 5,
 *             "comment": "Sản phẩm rất tốt",
 *             "user": { "id": 1, "fullName": "Jane Doe" }
 *           }
 *         ]
 *       }
 *     ]
 *   }
 * }
 */
const getCartItemOfUserById = async (req, res) => {
    try {
        const { id: userId } = req.params;
        // Tìm người dùng và lấy các cart item cùng với thông tin sản phẩm chi tiết
        const userWithCart = await client_1.default.user.findUnique({
            where: { id: parseInt(userId) },
            select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                address: true,
                cartItems: {
                    include: {
                        product: {
                            include: {
                                category: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    },
                                },
                                reviews: {
                                    select: {
                                        id: true,
                                        rating: true,
                                        comment: true,
                                        createdAt: true,
                                        user: {
                                            select: { id: true, fullName: true },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // Kiểm tra user có tồn tại không
        if (!userWithCart) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Chuyển đổi cấu trúc dữ liệu để nhóm sản phẩm lại cho dễ sử dụng
        const cartData = {
            user: {
                id: userWithCart.id,
                fullName: userWithCart.fullName,
                email: userWithCart.email,
                phone: userWithCart.phone,
                address: userWithCart.address,
            },
            products: userWithCart.cartItems.map((item) => ({
                cartItemId: item.id,
                productId: item.product.id,
                ...item.product,
                quantity: item.quantity,
                categoryId: item.product.category.id,
                category: item.product.category,
                reviews: item.product.reviews.map((review) => ({
                    reviewId: review.id,
                    ...review,
                    userId: review.user.id,
                    user: review.user,
                })),
            })),
        };
        res.status(200).json({
            message: "Cart items fetched successfully",
            data: cartData,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch cart items", error });
    }
};
exports.getCartItemOfUserById = getCartItemOfUserById;
/**
 * @function deleteCartItemById
 * @description Xóa một sản phẩm khỏi giỏ hàng và hoàn lại stock
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-cart-items/1
 * // Response
 * {
 *   "message": "Cart item deleted successfully"
 * }
 */
const deleteCartItemById = async (req, res) => {
    try {
        const { id } = req.params;
        // Tìm cart item trước khi xóa để kiểm tra tồn tại và lấy thông tin
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id: parseInt(id) },
        });
        if (!cartItem) {
            res.status(404).json({ message: "Cart item not found" });
            return;
        }
        // Sử dụng transaction để hoàn lại stock khi xóa cart item
        await client_1.default.$transaction(async (tx) => {
            // Cộng lại stock cho sản phẩm
            await tx.product.update({
                where: { id: cartItem.productId },
                data: {
                    stock: {
                        increment: cartItem.quantity,
                    },
                },
            });
            // Xóa cart item khỏi database
            await tx.cartItem.delete({
                where: { id: parseInt(id) },
            });
        });
        res.status(200).json({ message: "Cart item deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete cart item", error });
    }
};
exports.deleteCartItemById = deleteCartItemById;
/**
 * @function updateCartItemById
 * @description Cập nhật số lượng sản phẩm trong giỏ hàng với stock management
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-cart-items/1
 * // Request body
 * {
 *   "quantity": 3,
 *   "userId": 1
 * }
 *
 * // Response
 * {
 *   "message": "Cart item updated successfully",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "productId": 1,
 *     "quantity": 3
 *   }
 * }
 */
const updateCartItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, userId } = req.body;
        // Tìm cart item cần cập nhật và kiểm tra ownership
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id: parseInt(id) },
        });
        if (!cartItem || cartItem.userId !== userId) {
            res.status(404).json({ message: "Cart item not found", data: null });
            return;
        }
        // Lấy thông tin sản phẩm để kiểm tra stock availability
        const product = await client_1.default.product.findUnique({
            where: { id: cartItem.productId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found", data: null });
            return;
        }
        // Tính lại số lượng stock: cộng lại số lượng cũ trong giỏ hàng, trừ số lượng mới
        const stockAfterUpdate = product.stock + cartItem.quantity - Number(quantity);
        if (stockAfterUpdate < 0) {
            res.status(400).json({
                message: `Không đủ số lượng trong kho. Chỉ còn ${product.stock + cartItem.quantity} sản phẩm.`,
                data: null,
            });
            return;
        }
        // Sử dụng transaction để đảm bảo tính nhất quán giữa cart và stock
        const result = await client_1.default.$transaction(async (tx) => {
            // Cập nhật lại stock của sản phẩm
            await tx.product.update({
                where: { id: cartItem.productId },
                data: { stock: stockAfterUpdate },
            });
            // Cập nhật lại cart item với số lượng mới
            const updatedCartItem = await tx.cartItem.update({
                where: { id: parseInt(id) },
                data: { quantity: Number(quantity) },
            });
            return updatedCartItem;
        });
        res.status(200).json({
            message: "Cart item updated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update cart item", error });
    }
};
exports.updateCartItemById = updateCartItemById;
