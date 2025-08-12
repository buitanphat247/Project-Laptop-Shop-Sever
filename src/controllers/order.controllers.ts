/**
 * @fileoverview Order Management Controller
 * @description Xử lý logic quản lý đơn hàng (CRUD operations)
 * @author Your Name
 * @version 1.0.0
 */

// controllers/order.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

/**
 * @function createOrder
 * @description Tạo đơn hàng mới từ giỏ hàng của người dùng
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // POST /create-order
 * // Request body
 * {
 *   "userId": 1,
 *   "items": [
 *     {
 *       "productId": 1,
 *       "quantity": 2,
 *       "price": 25000000
 *     }
 *   ],
 *   "shipName": "Nguyen Van A",
 *   "shipAddress": "123 ABC Street",
 *   "totalPrice": 50000000,
 *   "note": "Giao hàng giờ hành chính",
 *   "shipPhone": "0123456789",
 *   "status": "pending"
 * }
 * 
 * // Response
 * {
 *   "message": "Order created successfully.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "shipName": "Nguyen Van A",
 *     "totalPrice": 50000000,
 *     "status": "pending",
 *     "orderItems": [...]
 *   }
 * }
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { userId, items, shipName, shipAddress, totalPrice, note, shipPhone, shippedDate, status } = req.body;

    // Kiểm tra dữ liệu đầu vào bắt buộc
    if (!userId || !items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: "Missing order info." });
      return;
    }

    // Tạo order và orderItems cùng lúc sử dụng nested create
    const order = await prisma.orderList.create({
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
          create: items.map((item: any) => ({
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
  } catch (error) {
    res.status(500).json({ message: "Error creating order.", error });
  }
};

/**
 * @function getOrderById
 * @description Lấy thông tin chi tiết của một đơn hàng theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /get-order/1
 * // Response
 * {
 *   "message": "Fetched order successfully.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "shipName": "Nguyen Van A",
 *     "totalPrice": 50000000,
 *     "status": "pending",
 *     "orderItems": [
 *       {
 *         "id": 1,
 *         "productId": 1,
 *         "quantity": 2,
 *         "price": 25000000,
 *         "product": {
 *           "id": 1,
 *           "name": "Laptop Gaming",
 *           "price": 25000000
 *         }
 *       }
 *     ],
 *     "user": {
 *       "id": 1,
 *       "fullName": "John Doe",
 *       "email": "john@example.com"
 *     }
 *   }
 * }
 */
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Tìm đơn hàng với thông tin chi tiết
    const order = await prisma.orderList.findUnique({
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
  } catch (error) {
    res.status(500).json({ message: "Error fetching order.", error });
  }
};

/**
 * @function getOrdersByUserId
 * @description Lấy tất cả đơn hàng của một người dùng với phân trang
 * @param {Request} req - Express request object với params.userId và query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /orders-of-user/1?page=1&pageSize=10
 * // Response
 * {
 *   "message": "Fetched user's orders successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "userId": 1,
 *       "shipName": "Nguyen Van A",
 *       "totalPrice": 50000000,
 *       "status": "pending",
 *       "orderItems": [...],
 *       "user": {
 *         "id": 1,
 *         "fullName": "John Doe",
 *         "email": "john@example.com"
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "pageSize": 10,
 *     "total": 25,
 *     "totalPages": 3
 *   }
 * }
 */
export const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // Lấy đơn hàng và tổng số đơn hàng cùng lúc
    const [orders, total] = await Promise.all([
      prisma.orderList.findMany({
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
      prisma.orderList.count({
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
  } catch (error) {
    res.status(500).json({ message: "Error fetching user's orders.", error });
  }
};

/**
 * @function getAllOrders
 * @description Lấy tất cả đơn hàng trong hệ thống (dành cho admin) với phân trang
 * @param {Request} req - Express request object với query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // GET /orders?page=1&pageSize=10
 * // Response
 * {
 *   "message": "Fetched all orders successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "userId": 1,
 *       "shipName": "Nguyen Van A",
 *       "totalPrice": 50000000,
 *       "status": "pending",
 *       "orderItems": [...],
 *       "user": {
 *         "id": 1,
 *         "fullName": "John Doe",
 *         "email": "john@example.com"
 *       }
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "pageSize": 10,
 *     "total": 100,
 *     "totalPages": 10
 *   }
 * }
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const skip = (page - 1) * pageSize;

    // Lấy tất cả đơn hàng và tổng số đơn hàng
    const [orders, total] = await Promise.all([
      prisma.orderList.findMany({
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
      prisma.orderList.count(),
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
  } catch (error) {
    res.status(500).json({ message: "Error fetching all orders.", error });
  }
};

/**
 * @function updateOrderById
 * @description Cập nhật trạng thái đơn hàng (dành cho admin)
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // PUT /update-order/1
 * // Request body
 * {
 *   "status": "shipped"
 * }
 * 
 * // Response
 * {
 *   "message": "Order updated successfully.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "status": "shipped"
 *   }
 * }
 */
export const updateOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Cập nhật trạng thái đơn hàng
    const order = await prisma.orderList.update({
      where: { id: Number(id) },
      data: { status },
    });
    
    res.json({ message: "Order updated successfully.", data: order });
  } catch (error: any) {
    // Xử lý lỗi khi đơn hàng không tồn tại
    if (error.code === "P2025") {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    res.status(500).json({ message: "Error updating order.", error });
  }
};

/**
 * @function deleteOrderById
 * @description Xóa đơn hàng khỏi hệ thống (dành cho admin)
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 * 
 * @example
 * // DELETE /delete-order/1
 * // Response
 * {
 *   "message": "Order deleted successfully.",
 *   "data": {
 *     "id": 1,
 *     "userId": 1,
 *     "shipName": "Nguyen Van A",
 *     "totalPrice": 50000000
 *   }
 * }
 */
export const deleteOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Xóa đơn hàng theo ID
    const deleted = await prisma.orderList.delete({
      where: { id: Number(id) },
    });
    
    res.json({ message: "Order deleted successfully.", data: deleted });
  } catch (error: any) {
    // Xử lý lỗi khi đơn hàng không tồn tại
    if (error.code === "P2025") {
      res.status(404).json({ message: "Order not found." });
      return;
    }
    res.status(500).json({ message: "Error deleting order.", error });
  }
};
