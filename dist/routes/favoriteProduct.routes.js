"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const favoriteProduct_controllers_1 = require("../controllers/favoriteProduct.controllers");
const favoriteProductRouter = (0, express_1.Router)();
// Thêm sản phẩm vào yêu thích
favoriteProductRouter.post("/create-favorite-product", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, favoriteProduct_controllers_1.createFavoriteProduct);
// Lấy tất cả sản phẩm yêu thích của user
favoriteProductRouter.get("/favorite-products/:userId", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, favoriteProduct_controllers_1.getFavoriteProductsOfUser);
// Xóa sản phẩm yêu thích theo id
favoriteProductRouter.delete("/favorite-product/:id", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, favoriteProduct_controllers_1.deleteFavoriteProduct);
// Lấy tất cả favoriteProduct (admin)
favoriteProductRouter.get("/favorite-products", auth_middleware_1.verifyToken, auth_middleware_1.checkPermission, favoriteProduct_controllers_1.getAllFavoriteProducts);
exports.default = favoriteProductRouter;
