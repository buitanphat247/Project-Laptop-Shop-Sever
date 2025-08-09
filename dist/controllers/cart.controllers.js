"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCartItemById = exports.deleteCartItemById = exports.getCartItemOfUserById = exports.createCartItem = void 0;
const client_1 = __importDefault(require("../client"));
// Create a new cart item
const createCartItem = async (req, res) => {
    try {
        const { productId, quantity, userId } = req.body;
        // Kiểm tra dữ liệu đầu vào
        if (!productId || !quantity || isNaN(userId)) {
            res.status(400).json({
                message: "Thiếu thông tin cần thiết.",
                data: null,
            });
            return;
        }
        // Sử dụng transaction để đảm bảo tính nhất quán dữ liệu
        const result = await client_1.default.$transaction(async (tx) => {
            // Kiểm tra sản phẩm có tồn tại và đủ số lượng không
            const product = await tx.product.findUnique({
                where: { id: Number(productId) },
            });
            if (!product) {
                throw new Error("PRODUCT_NOT_FOUND");
            }
            if (product.stock < Number(quantity)) {
                throw new Error(`INSUFFICIENT_STOCK:${product.stock}`);
            }
            // Kiểm tra xem sản phẩm đã có trong giỏ chưa
            const existingCartItem = await tx.cartItem.findFirst({
                where: {
                    userId,
                    productId: Number(productId),
                },
            });
            if (existingCartItem) {
                // Kiểm tra tổng số lượng sau khi cộng thêm
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
                // Trừ stock của sản phẩm (chỉ trừ số lượng mới thêm)
                await tx.product.update({
                    where: { id: Number(productId) },
                    data: {
                        stock: product.stock - Number(quantity),
                    },
                });
                return { type: "update", data: updatedCartItem };
            }
            else {
                // Tạo mới cart item
                const newCartItem = await tx.cartItem.create({
                    data: {
                        userId,
                        productId: Number(productId),
                        quantity: Number(quantity),
                    },
                });
                // Trừ stock của sản phẩm
                await tx.product.update({
                    where: { id: Number(productId) },
                    data: {
                        stock: product.stock - Number(quantity),
                    },
                });
                return { type: "create", data: newCartItem };
            }
        });
        // Trả về response tương ứng
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
        // Xử lý các lỗi custom
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
// Get a specific cart item by ID
const getCartItemOfUserById = async (req, res) => {
    try {
        const { id: userId } = req.params;
        // Tìm người dùng và lấy các cart item cùng với thông tin sản phẩm
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
        if (!userWithCart) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Chuyển đổi cấu trúc để nhóm sản phẩm lại
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
// Delete a cart item
const deleteCartItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id: parseInt(id) },
        });
        await client_1.default.cartItem.delete({ where: { id: parseInt(id) } });
        res.status(200).json({ message: "Cart item deleted successfully" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete cart item", error });
    }
};
exports.deleteCartItemById = deleteCartItemById;
// Update a cart item
const updateCartItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, userId } = req.body;
        const cartItem = await client_1.default.cartItem.findUnique({
            where: { id: parseInt(id) },
        });
        if (!cartItem || cartItem.userId !== userId) {
            res.status(404).json({ message: "Cart item not found", data: null });
            return;
        }
        // Lấy thông tin sản phẩm
        const product = await client_1.default.product.findUnique({
            where: { id: cartItem.productId },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found", data: null });
            return;
        }
        // Tính lại số lượng stock: cộng lại số lượng cũ, trừ số lượng mới
        const stockAfterUpdate = product.stock + cartItem.quantity - Number(quantity);
        if (stockAfterUpdate < 0) {
            res.status(400).json({
                message: `Không đủ số lượng trong kho. Chỉ còn ${product.stock + cartItem.quantity} sản phẩm.`,
                data: null,
            });
            return;
        }
        // Transaction: cập nhật product và cart item
        const result = await client_1.default.$transaction(async (tx) => {
            // Cập nhật lại stock của sản phẩm
            await tx.product.update({
                where: { id: cartItem.productId },
                data: { stock: stockAfterUpdate },
            });
            // Cập nhật lại cart item
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
