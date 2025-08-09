import { Request, Response } from "express";
import prisma from "../client";

// Thêm sản phẩm yêu thích (có kiểm tra tồn tại, update nếu đã có)
export const createFavoriteProduct = async (req: Request, res: Response) => {
  try {
    const { userId, productId } = req.body;
    // Kiểm tra đã tồn tại chưa
    const existing = await prisma.favoriteProduct.findFirst({
      where: { userId, productId },
    });

    let favorite;
    let message;
    if (!existing) {
      // Chưa có, tạo mới
      favorite = await prisma.favoriteProduct.create({
        data: { userId, productId, active: true },
      });
      message = "Đã thêm vào yêu thích";
    } else {
      // Đã có, đảo trạng thái active
      favorite = await prisma.favoriteProduct.update({
        where: { id: existing.id },
        data: { active: !existing.active },
      });
      message = favorite.active ? "Đã thêm vào yêu thích" : "Đã bỏ khỏi yêu thích";
    }

    res.json({ message, data: favorite });
  } catch (error) {
    res.status(500).json({ message: "Lỗi thêm yêu thích", error });
  }
};

// Lấy tất cả sản phẩm yêu thích của user
export const getFavoriteProductsOfUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const favorites = await prisma.favoriteProduct.findMany({
      where: { userId },
      include: { product: true },
    });
    res.json({ message: "Danh sách sản phẩm yêu thích", data: favorites });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách yêu thích", error });
  }
};

// Xóa sản phẩm yêu thích theo id
export const deleteFavoriteProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await prisma.favoriteProduct.delete({ where: { id } });
    res.json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi xóa yêu thích", error });
  }
};

// Lấy tất cả favoriteProduct (admin)
export const getAllFavoriteProducts = async (req: Request, res: Response) => {
  try {
    const favorites = await prisma.favoriteProduct.findMany({
      include: { user: true, product: true },
    });
    res.json({ message: "Tất cả sản phẩm yêu thích", data: favorites });
  } catch (error) {
    res.status(500).json({ message: "Lỗi lấy danh sách", error });
  }
};
