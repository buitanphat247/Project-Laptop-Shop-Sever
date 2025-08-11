/**
 * @fileoverview Main Router - Central Route Management
 * @description File tổng hợp tất cả các routes con và mount chúng vào ứng dụng chính
 * @author Your Name
 * @version 1.0.0
 */

// routes/index.routes.ts
import { Router } from "express";
import authRouter from "./auth.routes";
import userRouter from "./user.routes";
import productRouter from "./product.routes";
import cartRouter from "./cart.routes";
import reviewRouter from "./review.routes";
import newsRouter from "./news.routes";
import orderRouter from "./order.routes";
import permissionRouter from "./permission.routes";
import fileRouter from "./file.routes";
import favoriteProductRouter from "./favoriteProduct.routes";
import conversationRouter from "./conversation.routes";
import messageRouter from "./message.routes";

/**
 * @constant mainRouter
 * @description Router chính của ứng dụng, tổng hợp tất cả các routes con
 */
const mainRouter = Router();

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
mainRouter.use("/auth", authRouter);

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
mainRouter.use("/", userRouter);

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
mainRouter.use("/", productRouter);

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
mainRouter.use("/", cartRouter);

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
mainRouter.use("/", reviewRouter);

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
mainRouter.use("/", newsRouter);

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
mainRouter.use("/", orderRouter);

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
mainRouter.use("/", permissionRouter);

/**
 * @description Mount file upload routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - POST /api/v1/upload-file
 */
mainRouter.use("/", fileRouter);

/**
 * @description Mount favorite product management routes
 * @path /
 * @example
 * // Các routes sẽ có prefix: /api/v1
 * // - GET /api/v1/favorite-products
 * // - POST /api/v1/add-favorite-product
 * // - DELETE /api/v1/remove-favorite-product/:id
 */
mainRouter.use("/", favoriteProductRouter);

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
mainRouter.use("/", conversationRouter);

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
mainRouter.use("/", messageRouter);

/**
 * @description Export main router để sử dụng trong app.ts
 * @example
 * // Trong app.ts
 * import mainRouter from "./routes/index.routes";
 * app.use("/api/v1", mainRouter);
 */

export default mainRouter;
