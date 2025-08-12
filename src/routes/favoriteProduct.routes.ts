import { Router } from "express";

import { verifyToken, checkPermission } from "../middleware/auth.middleware";
import {
  createFavoriteProduct,
  deleteFavoriteProduct,
  getAllFavoriteProducts,
  getFavoriteProductsOfUser,
} from "../controllers/favoriteProduct.controllers";

const favoriteProductRouter = Router();

// Thêm sản phẩm vào yêu thích
favoriteProductRouter.post("/create-favorite-product", verifyToken, checkPermission, createFavoriteProduct);

// Lấy tất cả sản phẩm yêu thích của user
favoriteProductRouter.get("/favorite-products/:userId", verifyToken, checkPermission, getFavoriteProductsOfUser);

// Xóa sản phẩm yêu thích theo id
favoriteProductRouter.delete("/favorite-product/:id", verifyToken, checkPermission, deleteFavoriteProduct);

// Lấy tất cả favoriteProduct (admin)
favoriteProductRouter.get("/favorite-products", verifyToken, checkPermission, getAllFavoriteProducts);

export default favoriteProductRouter;
