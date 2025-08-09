"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteOrderById = exports.updateOrderById = exports.getAllOrders = exports.getOrdersByUserId = exports.getOrderById = exports.createOrder = void 0;
const client_1 = __importDefault(require("../client"));
// Tạo mới đơn hàng
const createOrder = async (req, res) => {
    try {
        const { userId, items, shipName, shipAddress, totalPrice, note, shipPhone, shippedDate, status, } = req.body;
        if (!userId || !items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({ message: "Missing order info." });
            return;
        }
        // Tạo order và orderItems cùng lúc
        const order = await client_1.default.order.create({
            data: {
                userId,
                shipName,
                shipAddress,
                totalPrice,
                note,
                shipPhone,
                shippedDate: shippedDate ? new Date(shippedDate) : undefined,
                status: status || "pending",
                orderItems: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { orderItems: true },
        });
        res.status(201).json({
            message: "Order created successfully.",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating order.", error });
    }
};
exports.createOrder = createOrder;
// Lấy đơn hàng theo id
const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await client_1.default.order.findUnique({
            where: { id: Number(id) },
            include: {
                orderItems: {
                    include: { product: true },
                },
                user: {
                    select: { id: true, fullName: true, email: true },
                },
            },
        });
        if (!order) {
            res.status(404).json({ message: "Order not found." });
            return;
        }
        res.json({ message: "Fetched order successfully.", data: order });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching order.", error });
    }
};
exports.getOrderById = getOrderById;
// Lấy tất cả đơn hàng của user
const getOrdersByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const [orders, total] = await Promise.all([
            client_1.default.order.findMany({
                where: { userId: Number(userId) },
                include: {
                    orderItems: {
                        include: { product: true },
                    },
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true,
                            phone: true,
                            address: true,
                        },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            client_1.default.order.count({
                where: { userId: Number(userId) },
            }),
        ]);
        res.json({
            message: "Fetched user's orders successfully.",
            data: orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching user's orders.", error });
    }
};
exports.getOrdersByUserId = getOrdersByUserId;
// Lấy tất cả đơn hàng (admin)
// Lấy tất cả đơn hàng (admin)
const getAllOrders = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const pageSize = Number(req.query.pageSize) || 10;
        const skip = (page - 1) * pageSize;
        const [orders, total] = await Promise.all([
            client_1.default.order.findMany({
                include: {
                    orderItems: {
                        include: { product: true },
                    },
                    user: {
                        select: { id: true, fullName: true, email: true },
                    },
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            client_1.default.order.count(),
        ]);
        res.json({
            message: "Fetched all orders successfully.",
            data: orders,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching all orders.", error });
    }
};
exports.getAllOrders = getAllOrders;
// Cập nhật đơn hàng
const updateOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await client_1.default.order.update({
            where: { id: Number(id) },
            data: { status },
        });
        res.json({ message: "Order updated successfully.", data: order });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Order not found." });
            return;
        }
        res.status(500).json({ message: "Error updating order.", error });
    }
};
exports.updateOrderById = updateOrderById;
// Xoá đơn hàng
const deleteOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await client_1.default.order.delete({
            where: { id: Number(id) },
        });
        res.json({ message: "Order deleted successfully.", data: deleted });
    }
    catch (error) {
        if (error.code === "P2025") {
            res.status(404).json({ message: "Order not found." });
            return;
        }
        res.status(500).json({ message: "Error deleting order.", error });
    }
};
exports.deleteOrderById = deleteOrderById;
