"use strict";
/**
 * @fileoverview Payment Controller
 * @description Xử lý logic thanh toán VNPay và các giao dịch liên quan với cache management
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVNPayReturn = exports.createVNPayPayment = void 0;
const vnpay_1 = require("vnpay");
const vnpay_2 = require("vnpay");
const vnpay_3 = __importDefault(require("../config/vnpay"));
const client_1 = __importDefault(require("../client"));
const Cache_1 = require("../config/Cache");
/**
 * @function createVNPayPayment
 * @description Tạo URL thanh toán VNPay cho đơn hàng với cache management
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // Request body
 * {
 *   "orderInfo": "Thanh toan don hang #123",
 *   "amount": 1000000,
 *   "orderData": {
 *     "userId": 1,
 *     "items": [...],
 *     "shipName": "Nguyen Van A",
 *     "shipAddress": "123 ABC Street",
 *     "totalPrice": 1000000
 *   }
 * }
 *
 * @example
 * // Response
 * {
 *   "success": true,
 *   "paymentUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?...",
 *   "message": "Tạo URL thanh toán thành công"
 * }
 */
const createVNPayPayment = async (req, res) => {
    const { orderInfo, amount, orderData } = req.body;
    console.log("orderData: ", orderData);
    // Lưu orderData vào cache tạm thời để sử dụng khi VNPay callback
    Cache_1.tempCache.set("orderData", orderData);
    try {
        // Tạo mã giao dịch duy nhất dựa trên timestamp
        const vnp_TxnRef = Date.now().toString();
        // Tạo URL thanh toán VNPay với các thông tin cần thiết
        const paymentUrl = await vnpay_3.default.buildPaymentUrl({
            vnp_Amount: amount * 100, // VNPay yêu cầu số tiền nhân với 100 (đơn vị VND)
            vnp_IpAddr: (req.headers["x-forwarded-for"] ||
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                req.ip ||
                "127.0.0.1"), // Lấy IP của client
            vnp_TxnRef: vnp_TxnRef, // Mã giao dịch duy nhất
            vnp_OrderInfo: orderInfo, // Thông tin đơn hàng
            vnp_OrderType: vnpay_2.ProductCode.Other, // Loại hàng hóa
            vnp_ReturnUrl: "http://localhost:3000/vnpay-return", // URL callback
            vnp_Locale: vnpay_2.VnpLocale.VN, // Ngôn ngữ tiếng Việt
            vnp_CreateDate: (0, vnpay_1.dateFormat)(new Date()), // Thời gian tạo giao dịch
        });
        res.json({
            success: true,
            paymentUrl,
            message: "Tạo URL thanh toán thành công",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo đơn hàng",
            error: error.message,
        });
    }
};
exports.createVNPayPayment = createVNPayPayment;
/**
 * @function handleVNPayReturn
 * @description Xử lý callback từ VNPay sau khi thanh toán hoàn tất với validation và database operations
 * @param {Request} req - Express request object với query params từ VNPay
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // VNPay sẽ gọi đến endpoint này với query params
 * // GET /vnpay-return?vnp_ResponseCode=00&vnp_TxnRef=1234567890&...
 *
 * @example
 * // Response khi thành công
 * {
 *   "success": true,
 *   "message": "✅ Thanh toán thành công và xác thực chữ ký hợp lệ!",
 *   "data": {
 *     "verify": {...},
 *     "items": [...],
 *     "shipName": "Nguyen Van A",
 *     "shipAddress": "123 ABC Street",
 *     "totalPrice": 1000000
 *   }
 * }
 */
const handleVNPayReturn = async (req, res) => {
    try {
        // Xác thực chữ ký từ VNPay để đảm bảo tính toàn vẹn dữ liệu
        const verify = vnpay_3.default.verifyReturnUrl(req.query);
        const { vnp_OrderInfo } = req.query;
        const orderInfo = JSON.parse(vnp_OrderInfo || "{}");
        // Kiểm tra xác thực chữ ký có hợp lệ không
        if (!verify.isVerified) {
            res.status(400).json({
                success: false,
                message: "❌ Xác thực chữ ký không hợp lệ!",
                data: verify,
            });
            return;
        }
        // Kiểm tra kết quả thanh toán có thành công không
        if (!verify.isSuccess) {
            res.status(400).json({
                success: false,
                message: "❌ Thanh toán thất bại!",
                data: verify,
            });
            return;
        }
        // Lấy thông tin đơn hàng từ cache đã lưu trước đó
        const orderData = Cache_1.tempCache.get("orderData");
        if (!orderData) {
            res.status(400).json({
                success: false,
                message: "❌ Không tìm thấy thông tin đơn hàng trong cache!",
            });
            return;
        }
        const { userId, items, shipName, shipAddress, totalPrice, note, shipPhone, shippedDate, } = orderData;
        // Kiểm tra tính hợp lệ của dữ liệu đơn hàng trước khi lưu vào database
        if (typeof userId !== "number" ||
            !Array.isArray(items) ||
            typeof shipName !== "string" ||
            typeof shipAddress !== "string" ||
            typeof totalPrice !== "number") {
            res.status(400).json({
                success: false,
                message: "❌ Thiếu hoặc sai kiểu dữ liệu đơn hàng!",
            });
            return;
        }
        // Tạo dữ liệu đơn hàng cho database với nested create cho orderItems
        const data = {
            userId,
            shipName,
            shipAddress,
            totalPrice,
            note: note ?? "", // Sử dụng nullish coalescing
            shipPhone: shipPhone ?? "",
            shippedDate: shippedDate ? new Date(shippedDate) : undefined,
            status: "paid", // Đánh dấu đã thanh toán thành công
            orderItems: {
                create: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            },
        };
        // Tạo đơn hàng trong database với transaction để đảm bảo tính nhất quán
        await client_1.default.orderList.create({
            data,
            include: { orderItems: true },
        });
        // Xóa các sản phẩm đã mua khỏi giỏ hàng của user
        await client_1.default.cartItem.deleteMany({
            where: {
                userId,
                productId: {
                    in: items.map((item) => item.productId),
                },
            },
        });
        // Chuẩn bị dữ liệu trả về cho client
        const data_success = {
            verify,
            items,
            shipName,
            shipAddress,
            shipPhone,
            shippedDate,
            totalPrice,
            note,
        };
        // Xóa cache sau khi tạo đơn hàng thành công để giải phóng bộ nhớ
        Cache_1.tempCache.del("orderData");
        res.status(200).json({
            success: true,
            message: "✅ Thanh toán thành công và xác thực chữ ký hợp lệ!",
            data: data_success,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "❌ Dữ liệu trả về không hợp lệ!",
            error: error?.message || "Unknown error",
        });
    }
};
exports.handleVNPayReturn = handleVNPayReturn;
