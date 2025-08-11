"use strict";
/**
 * @fileoverview Main Router - Central Route Management
 * @description File tổng hợp tất cả các routes con và mount chúng vào ứng dụng chính
 * @author Your Name
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/index.routes.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const product_routes_1 = __importDefault(require("./product.routes"));
const cart_routes_1 = __importDefault(require("./cart.routes"));
const review_routes_1 = __importDefault(require("./review.routes"));
const news_routes_1 = __importDefault(require("./news.routes"));
const order_routes_1 = __importDefault(require("./order.routes"));
const permission_routes_1 = __importDefault(require("./permission.routes"));
const file_routes_1 = __importDefault(require("./file.routes"));
const favoriteProduct_routes_1 = __importDefault(require("./favoriteProduct.routes"));
const conversation_routes_1 = __importDefault(require("./conversation.routes"));
const message_routes_1 = __importDefault(require("./message.routes"));
/**
 * @constant mainRouter
 * @description Router chính của ứng dụng, tổng hợp tất cả các routes con
 */
const mainRouter = (0, express_1.Router)();
// ==================== ROUTE MOUNTING ====================
/**
 * @description Mount authentication routes
 * @path /auth
 * @example
 * // Các routes sẽ có prefix: /api/v1/auth
 * // - POST /api/v1/auth/login
 * // - POST /api/v1/auth/logout
 * // - POST /api/v1/auth/refresh-token
 */
mainRouter.use("/auth", auth_routes_1.default);
/**
 * @description Mount user management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/user
 * // - POST /api/v1/create-account
 * // - GET /api/v1/get-user/:id
 * // - PUT /api/v1/update-user/:id
 * // - DELETE /api/v1/delete-user/:id
 */
mainRouter.use("/", user_routes_1.default);
/**
 * @description Mount product and category management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/category
 * // - POST /api/v1/create-category
 * // - GET /api/v1/product
 * // - POST /api/v1/create-product
 * // - GET /api/v1/get-product/:id
 */
mainRouter.use("/", product_routes_1.default);
/**
 * @description Mount shopping cart management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/create-cart-items
 * // - GET /api/v1/get-cart-items-of-user/:id
 * // - PUT /api/v1/update-cart-items/:id
 * // - DELETE /api/v1/delete-cart-items/:id
 */
mainRouter.use("/", cart_routes_1.default);
/**
 * @description Mount product review management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/review
 * // - POST /api/v1/create-review
 * // - GET /api/v1/get-review/:id
 * // - PUT /api/v1/update-review/:id
 * // - DELETE /api/v1/delete-review/:id
 */
mainRouter.use("/", review_routes_1.default);
/**
 * @description Mount news/blog management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/news
 * // - POST /api/v1/create-news
 * // - GET /api/v1/get-news/:id
 * // - PUT /api/v1/update-news/:id
 * // - DELETE /api/v1/delete-news/:id
 */
mainRouter.use("/", news_routes_1.default);
/**
 * @description Mount order and payment management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/create-order
 * // - GET /api/v1/get-order/:id
 * // - GET /api/v1/orders
 * // - POST /api/v1/payment-vnpay
 * // - GET /api/v1/vnpay-return
 */
mainRouter.use("/", order_routes_1.default);
/**
 * @description Mount role and permission management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/roles
 * // - POST /api/v1/create-role
 * // - GET /api/v1/permissions
 * // - POST /api/v1/create-permissions
 * // - GET /api/v1/role-permissions
 */
mainRouter.use("/", permission_routes_1.default);
/**
 * @description Mount file upload routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/upload-file
 */
mainRouter.use("/", file_routes_1.default);
/**
 * @description Mount favorite product management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/favorite-products
 * // - POST /api/v1/add-favorite-product
 * // - DELETE /api/v1/remove-favorite-product/:id
 */
mainRouter.use("/", favoriteProduct_routes_1.default);
/**
 * @description Mount conversation management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/create-conversation
 * // - GET /api/v1/conversations/:userId
 * // - GET /api/v1/conversation/:id
 * // - PUT /api/v1/conversation/:id
 * // - DELETE /api/v1/conversation/:id
 */
mainRouter.use("/", conversation_routes_1.default);
/**
 * @description Mount message management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/send-message
 * // - GET /api/v1/messages/:conversationId
 * // - GET /api/v1/message/:id
 * // - PUT /api/v1/message/:id/status
 * // - PUT /api/v1/conversation/:conversationId/read/:userId
 * // - DELETE /api/v1/message/:id
 */
mainRouter.use("/", message_routes_1.default);
/**
 * @description Export main router để sử dụng trong app.ts
 * @example
 * // Trong app.ts
 * import mainRouter from "./routes/index.routes";
 * app.use("/api/v1", mainRouter);
 */
exports.default = mainRouter;
