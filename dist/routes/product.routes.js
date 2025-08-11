"use strict";
/**
 * @fileoverview Product & Category Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý sản phẩm và danh mục
 * @author Your Name
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
// routes/product.routes.ts
const express_1 = require("express");
const category_controllers_1 = require("../controllers/category.controllers");
const product_controllers_1 = require("../controllers/product.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const productRouter = (0, express_1.Router)();
// ==================== CATEGORY ROUTES ====================
/**
 * @route GET /category
 * @description Lấy danh sách tất cả danh mục sản phẩm
 * @access Public - Ai cũng có thể xem danh mục
 * @returns {message: string, data: Category[]}
 */
productRouter.get("/category", category_controllers_1.getCategory);
/**
 * @route POST /create-category
 * @description Tạo danh mục sản phẩm mới
 * @access Private - Chỉ admin mới có quyền tạo
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, description?: string}
 * @returns {message: string, data: Category}
 */
productRouter.post("/create-category", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), category_controllers_1.createCategory);
/**
 * @route GET /get-category/:id
 * @description Lấy thông tin chi tiết của một danh mục theo ID
 * @access Public - Ai cũng có thể xem
 * @param {number} id - ID của danh mục cần lấy thông tin
 * @returns {message: string, data: Category}
 */
productRouter.get("/get-category/:id", category_controllers_1.getCategoryById);
/**
 * @route DELETE /delete-category/:id
 * @description Xóa danh mục sản phẩm
 * @access Private - Chỉ admin mới có quyền xóa
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của danh mục cần xóa
 * @returns {message: string, data: Category}
 */
productRouter.delete("/delete-category/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), category_controllers_1.deleteCategoryById);
/**
 * @route PUT /update-category/:id
 * @description Cập nhật thông tin danh mục sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của danh mục cần cập nhật
 * @body {name?: string, description?: string}
 * @returns {message: string, data: Category}
 */
productRouter.put("/update-category/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), category_controllers_1.updateCategoryById);
// ==================== PRODUCT ROUTES ====================
/**
 * @route GET /product
 * @description Lấy danh sách tất cả sản phẩm
 * @access Public - Ai cũng có thể xem sản phẩm
 * @query {page?: number, limit?: number, search?: string, categoryId?: number}
 * @returns {message: string, data: Product[], pagination: object}
 */
productRouter.get("/product", product_controllers_1.getProduct);
/**
 * @route GET /get-list-product-by-category-id/:categoryId
 * @description Lấy danh sách sản phẩm theo danh mục
 * @access Public - Ai cũng có thể xem
 * @param {number} categoryId - ID của danh mục
 * @returns {message: string, data: Product[]}
 */
productRouter.get("/get-list-product-by-category-id/:categoryId", category_controllers_1.getProductByIdCategory);
/**
 * @route POST /create-product
 * @description Tạo sản phẩm mới
 * @access Private - Chỉ admin mới có quyền tạo
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, description?: string, price: number, categoryId: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.post("/create-product", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), product_controllers_1.createProduct);
/**
 * @route GET /get-product/:id
 * @description Lấy thông tin chi tiết của một sản phẩm theo ID
 * @access Public - Ai cũng có thể xem
 * @param {number} id - ID của sản phẩm cần lấy thông tin
 * @returns {message: string, data: Product}
 */
productRouter.get("/get-product-double-id/:id/:userId", product_controllers_1.getProductById);
productRouter.get("/get-product/:id", product_controllers_1.getProductById);
/**
 * @route DELETE /delete-product/:id
 * @description Xóa sản phẩm
 * @access Private - Chỉ admin mới có quyền xóa
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần xóa
 * @returns {message: string, data: Product}
 */
productRouter.delete("/delete-product/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), product_controllers_1.deleteProductById);
/**
 * @route PUT /update-product/:id
 * @description Cập nhật thông tin sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần cập nhật
 * @body {name?: string, description?: string, price?: number, categoryId?: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.put("/update-product/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, (0, auth_middleware_1.authorize)("admin"), product_controllers_1.updateProductById);
/**
 * @route GET /favorite-products/:id
 * @description Cập nhật thông tin sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần cập nhật
 * @body {name?: string, description?: string, price?: number, categoryId?: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.get("/favorite-products/:userId", product_controllers_1.getFavoriteProductsOfUser);
exports.default = productRouter;
