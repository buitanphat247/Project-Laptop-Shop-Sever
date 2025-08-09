"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vnpay_1 = require("vnpay");
// Khởi tạo cấu hình VNPay
const vnpay = new vnpay_1.VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE || "DACIZRT0",
    secureSecret: process.env.VNPAY_SECRET || "JMVJEO8BY0NML8ACKCHJ9TLG43XURTEJ",
    vnpayHost: "https://sandbox.vnpayment.vn",
    queryDrAndRefundHost: "https://sandbox.vnpayment.vn", // tùy chọn, trường hợp khi url của querydr và refund khác với url khởi tạo thanh toán (thường sẽ sử dụng cho production)
    testMode: true, // tùy chọn, ghi đè vnpayHost thành sandbox nếu là true
    hashAlgorithm: vnpay_1.HashAlgorithm.SHA512, // tùy chọn
    /**
     * Bật/tắt ghi log
     * Nếu enableLog là false, loggerFn sẽ không được sử dụng trong bất kỳ phương thức nào
     */
    enableLog: true, // tùy chọn
    /**
     * Hàm `loggerFn` sẽ được gọi để ghi log khi enableLog là true
     * Mặc định, loggerFn sẽ ghi log ra console
     * Bạn có thể cung cấp một hàm khác nếu muốn ghi log vào nơi khác
     *
     * `ignoreLogger` là một hàm không làm gì cả
     */
    loggerFn: vnpay_1.ignoreLogger, // tùy chọn
    /**
     * Tùy chỉnh các đường dẫn API của VNPay
     * Thường không cần thay đổi trừ khi:
     * - VNPay cập nhật đường dẫn của họ
     * - Có sự khác biệt giữa môi trường sandbox và production
     */
    endpoints: {
        paymentEndpoint: "paymentv2/vpcpay.html",
        queryDrRefundEndpoint: "merchant_webapi/api/transaction",
        getBankListEndpoint: "qrpayauth/api/merchant/get_bank_list",
    }, // tùy chọn
});
exports.default = vnpay;
