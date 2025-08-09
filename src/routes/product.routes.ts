/**
 * @fileoverview Product & Category Management Routes
 * @description Xử lý tất cả các routes liên quan đến quản lý sản phẩm và danh mục
 * @author Your Name
 * @version 1.0.0
 */

// routes/product.routes.ts
import { Router } from "express";
import {
  createCategory,
  deleteCategoryById,
  getCategory,
  getCategoryById,
  getProductByIdCategory,
  updateCategoryById,
} from "../controllers/category.controllers";
import { createProduct, deleteProductById,  getFavoriteProductsOfUser,  getProduct, getProductById, updateProductById } from "../controllers/product.controllers";
import { authorize, checkPermission, verifyToken } from "../middleware/auth.middleware";

const productRouter = Router();

// ==================== CATEGORY ROUTES ====================

/**
 * @route GET /category
 * @description Lấy danh sách tất cả danh mục sản phẩm
 * @access Public - Ai cũng có thể xem danh mục
 * @returns {message: string, data: Category[]}
 */
productRouter.get("/category", getCategory);

/**
 * @route POST /create-category
 * @description Tạo danh mục sản phẩm mới
 * @access Private - Chỉ admin mới có quyền tạo
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, description?: string}
 * @returns {message: string, data: Category}
 */
productRouter.post("/create-category", verifyToken, checkPermission, authorize("admin"), createCategory);

/**
 * @route GET /get-category/:id
 * @description Lấy thông tin chi tiết của một danh mục theo ID
 * @access Public - Ai cũng có thể xem
 * @param {number} id - ID của danh mục cần lấy thông tin
 * @returns {message: string, data: Category}
 */
productRouter.get("/get-category/:id", getCategoryById);

/**
 * @route DELETE /delete-category/:id
 * @description Xóa danh mục sản phẩm
 * @access Private - Chỉ admin mới có quyền xóa
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của danh mục cần xóa
 * @returns {message: string, data: Category}
 */
productRouter.delete("/delete-category/:id", verifyToken, checkPermission, authorize("admin"), deleteCategoryById);

/**
 * @route PUT /update-category/:id
 * @description Cập nhật thông tin danh mục sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của danh mục cần cập nhật
 * @body {name?: string, description?: string}
 * @returns {message: string, data: Category}
 */
productRouter.put("/update-category/:id", verifyToken, checkPermission, authorize("admin"), updateCategoryById);

// ==================== PRODUCT ROUTES ====================

/**
 * @route GET /product
 * @description Lấy danh sách tất cả sản phẩm
 * @access Public - Ai cũng có thể xem sản phẩm
 * @query {page?: number, limit?: number, search?: string, categoryId?: number}
 * @returns {message: string, data: Product[], pagination: object}
 */
productRouter.get("/product", getProduct);

/**
 * @route GET /get-list-product-by-category-id/:categoryId
 * @description Lấy danh sách sản phẩm theo danh mục
 * @access Public - Ai cũng có thể xem
 * @param {number} categoryId - ID của danh mục
 * @returns {message: string, data: Product[]}
 */
productRouter.get("/get-list-product-by-category-id/:categoryId", getProductByIdCategory);

/**
 * @route POST /create-product
 * @description Tạo sản phẩm mới
 * @access Private - Chỉ admin mới có quyền tạo
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @body {name: string, description?: string, price: number, categoryId: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.post("/create-product", verifyToken, checkPermission, authorize("admin"), createProduct);

/**
 * @route GET /get-product/:id
 * @description Lấy thông tin chi tiết của một sản phẩm theo ID
 * @access Public - Ai cũng có thể xem
 * @param {number} id - ID của sản phẩm cần lấy thông tin
 * @returns {message: string, data: Product}
 */
productRouter.get("/get-product-double-id/:id/:userId", getProductById);
productRouter.get("/get-product/:id", getProductById);

/**
 * @route DELETE /delete-product/:id
 * @description Xóa sản phẩm
 * @access Private - Chỉ admin mới có quyền xóa
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần xóa
 * @returns {message: string, data: Product}
 */
productRouter.delete("/delete-product/:id", verifyToken, checkPermission, authorize("admin"), deleteProductById);

/**
 * @route PUT /update-product/:id
 * @description Cập nhật thông tin sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần cập nhật
 * @body {name?: string, description?: string, price?: number, categoryId?: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.put("/update-product/:id", verifyToken, checkPermission, authorize("admin"), updateProductById);

/**
 * @route GET /favorite-products/:id
 * @description Cập nhật thông tin sản phẩm
 * @access Private - Chỉ admin mới có quyền cập nhật
 * @middleware verifyToken, checkPermission, authorize("admin")
 * @param {number} id - ID của sản phẩm cần cập nhật
 * @body {name?: string, description?: string, price?: number, categoryId?: number, image?: string}
 * @returns {message: string, data: Product}
 */
productRouter.get("/favorite-products/:userId", getFavoriteProductsOfUser);


export default productRouter;
