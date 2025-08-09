/**
 * @fileoverview Product Management Controller
 * @description Xử lý logic quản lý sản phẩm (CRUD operations) với phân trang và liên kết dữ liệu
 * @author Your Name
 * @version 1.0.0
 */

// controllers/product.controllers.ts
import { Request, Response } from "express";
import prisma from "../client";

/**
 * @function getProduct
 * @description Lấy danh sách tất cả sản phẩm với phân trang và thông tin liên quan
 * @param {Request} req - Express request object với query params
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /product?page=1&limit=10
 * // Response
 * {
 *   "message": "Fetched products successfully.",
 *   "data": [
 *     {
 *       "id": 1,
 *       "name": "Laptop Gaming",
 *       "price": 25000000,
 *       "description": "Laptop gaming hiệu năng cao",
 *       "category": { "id": 1, "name": "Laptop" },
 *       "reviews": [
 *         {
 *           "id": 1,
 *           "rating": 5,
 *           "comment": "Sản phẩm rất tốt",
 *           "user": { "id": 1, "fullName": "John Doe" }
 *         }
 *       ]
 *     }
 *   ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 50,
 *     "totalPages": 5
 *   }
 * }
 */
export const getProduct = async (req: Request, res: Response) => {
  console.log("GET PRODUCT URL:", req.originalUrl);
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = (req.query.search as string) || "";
    const minPrice = Number(req.query.minPrice) || 0;
    const maxPrice = Number(req.query.maxPrice) || 1000000000;
    const sortBy = req.query.sortBy as string;
    const category = (req.query.category as string) || "";
    const minRating = Number(req.query.minRating) || 0;

    const where: any = {
      price: { gte: minPrice, lte: maxPrice },
    };

    if (search && search.trim() !== "") {
      where.name = {
        contains: search.trim(),
      };
    }

    if (category) where.categoryId = Number(category);

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "name_asc") {
      orderBy = { name: "asc" };
    } else if (sortBy === "name_desc") {
      orderBy = { name: "desc" };
    }

    // Đếm tổng số sản phẩm phù hợp
    const total = (
      await prisma.product.findMany({
        where,
      })
    ).length;
    console.log(typeof total); // nên là "number"

    // Truy vấn sản phẩm
    let products = await prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    // Gắn inStock
    products = products.map((p) => ({
      ...p,
      inStock: p.stock > 0,
    }));

    // Lọc theo minRating nếu có
    if (minRating > 0) {
      products = products.filter((p) => {
        if (!Array.isArray(p.reviews) || p.reviews.length === 0) return false;
        const avg = p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length;
        return avg >= minRating;
      });
    }

    res.json({
      message: "Fetched products successfully.",
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products.", error });
  }
};

/**
 * @function createProduct
 * @description Tạo sản phẩm mới trong hệ thống với validation dữ liệu
 * @param {Request} req - Express request object với body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // POST /create-product
 * // Request body
 * {
 *   "name": "Laptop Gaming RTX 4080",
 *   "price": 45000000,
 *   "description": "Laptop gaming hiệu năng cao với RTX 4080",
 *   "content": "Chi tiết sản phẩm...",
 *   "categoryId": 1,
 *   "stock": 10,
 *   "imageUrls": ["url1.jpg", "url2.jpg"]
 * }
 *
 * // Response
 * {
 *   "message": "Product created successfully.",
 *   "data": {
 *     "id": 5,
 *     "name": "Laptop Gaming RTX 4080",
 *     "price": 45000000,
 *     "categoryId": 1,
 *     "stock": 10
 *   }
 * }
 */
export const createProduct = async (req: Request, res: Response) => {
  const { name, price, description, content, categoryId, stock, imageUrls } = req.body;

  // Kiểm tra các trường bắt buộc trước khi tạo sản phẩm
  if (!name || !price || !categoryId || stock === undefined || !imageUrls) {
    res.status(400).json({ message: "Missing required fields." });
    return;
  }

  try {
    // Tạo sản phẩm mới với dữ liệu đã validate và chuyển đổi kiểu dữ liệu
    const newProduct = await prisma.product.create({
      data: {
        name,
        price: Number(price), // Chuyển đổi sang number
        description: description || "", // Mặc định empty string nếu không có
        content: content || "", // Mặc định empty string nếu không có
        categoryId: Number(categoryId), // Chuyển đổi sang number
        stock: Number(stock), // Chuyển đổi sang number
        imageUrls, // Array của image URLs
      },
    });

    res.status(201).json({
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating product.",
      data: null,
      error,
    });
  }
};

/**
 * @function getProductById
 * @description Lấy thông tin chi tiết của một sản phẩm theo ID với thông tin category
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /get-product/1
 * // Response
 * {
 *   "message": "Product fetched successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop Gaming",
 *     "price": 25000000,
 *     "description": "Laptop gaming hiệu năng cao",
 *     "category": {
 *       "id": 1,
 *       "name": "Laptop",
 *       "slug": "laptop"
 *     }
 *   }
 * }
 */
export const getProductById = async (req: Request, res: Response) => {
  const { id, userId } = req.params; // lấy cả id và userId từ params

  try {
    // Tìm sản phẩm theo ID và include thông tin category
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!product) {
      res.status(404).json({
        message: "Product not found.",
        data: null,
      });
      return;
    }

    // Lấy trạng thái đã thích hay chưa (nếu có userId)
    let isFavorite = false;
    if (userId) {
      const favorite = await prisma.favoriteProduct.findFirst({
        where: {
          userId: Number(userId),
          productId: Number(id),
          active: true,
        },
      });
      isFavorite = !!favorite;
    }

    res.json({
      message: "Product fetched successfully.",
      data: {
        ...product,
        isFavorite, // true/false
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product.",
      data: null,
      error,
    });
  }
};

/**
 * @function updateProductById
 * @description Cập nhật thông tin sản phẩm theo ID với partial update
 * @param {Request} req - Express request object với params.id và body data
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // PUT /update-product/1
 * // Request body
 * {
 *   "name": "Laptop Gaming Updated",
 *   "price": 30000000,
 *   "stock": 15
 * }
 *
 * // Response
 * {
 *   "message": "Product updated successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop Gaming Updated",
 *     "price": 30000000,
 *     "stock": 15
 *   }
 * }
 */
export const updateProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, description, content, categoryId, stock, imageUrls } = req.body;

  try {
    // Tạo object data chỉ với những trường được gửi lên (partial update)
    const updateData: any = {};

    // Chỉ cập nhật những trường được cung cấp
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (description !== undefined) updateData.description = description;
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (imageUrls !== undefined) updateData.imageUrls = imageUrls;

    // Cập nhật sản phẩm với dữ liệu đã được lọc
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: updateData,
    });

    res.json({
      message: "Product updated successfully.",
      data: updatedProduct,
    });
  } catch (error: any) {
    // Xử lý lỗi khi sản phẩm không tồn tại (Prisma error code P2025)
    if (error.code === "P2025") {
      res.status(404).json({ message: "Product not found." });
      return;
    }
    res.status(500).json({ message: "Error updating product.", error });
  }
};

/**
 * @function deleteProductById
 * @description Xóa sản phẩm khỏi hệ thống theo ID
 * @param {Request} req - Express request object với params.id
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // DELETE /delete-product/1
 * // Response
 * {
 *   "message": "Product deleted successfully.",
 *   "data": {
 *     "id": 1,
 *     "name": "Laptop Gaming",
 *     "price": 25000000
 *   }
 * }
 */
export const deleteProductById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Xóa sản phẩm theo ID từ database
    const deleted = await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.json({ message: "Product deleted successfully.", data: deleted });
  } catch (error: any) {
    // Xử lý lỗi khi sản phẩm không tồn tại (Prisma error code P2025)
    if (error.code === "P2025") {
      res.status(404).json({ message: "Product not found." });
      return;
    }
    res.status(500).json({ message: "Error deleting product.", error });
  }
};

/**
 * @function getFavoriteProductsOfUser
 * @description Lấy danh sách sản phẩm yêu thích của một user
 * @param {Request} req - Express request object với params.userId
 * @param {Response} res - Express response object
 * @returns {Promise<void>}
 *
 * @example
 * // GET /favorite-products/1
 * // Response
 * {
 *   "message": "Danh sách sản phẩm yêu thích",
 *   "data": [ { ...product... }, ... ]
 * }
 */
export const getFavoriteProductsOfUser = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const search = (req.query.search as string) || "";
  const minPrice = Number(req.query.minPrice) || 0;
  const maxPrice = Number(req.query.maxPrice) || 1000000000;
  const sortBy = req.query.sortBy as string;
  const category = (req.query.category as string) || "";
  const minRating = Number(req.query.minRating) || 0;

  try {
    // Lấy tất cả productId yêu thích của user
    const favoriteProducts = await prisma.favoriteProduct.findMany({
      where: { userId: Number(userId), active: true },
      select: { productId: true },
    });
    const productIds = favoriteProducts.map((f) => f.productId);

    if (productIds.length === 0) {
      res.json({
        message: "Danh sách sản phẩm yêu thích",
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      });
      return;
    }

    // Xây dựng điều kiện where cho product
    const where: any = {
      id: { in: productIds },
      price: { gte: minPrice, lte: maxPrice },
    };
    if (search && search.trim() !== "") {
      where.name = { contains: search.trim(), mode: "insensitive" };
    }
    if (category) where.categoryId = Number(category);

    // Sắp xếp
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "oldest") {
      orderBy = { createdAt: "asc" };
    } else if (sortBy === "price_asc") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price_desc") {
      orderBy = { price: "desc" };
    } else if (sortBy === "name_asc") {
      orderBy = { name: "asc" };
    } else if (sortBy === "name_desc") {
      orderBy = { name: "desc" };
    }

    // Đếm tổng số sản phẩm phù hợp
    const total = await prisma.product.count({ where });

    // Lấy danh sách sản phẩm yêu thích với filter & phân trang
    let products = await prisma.product.findMany({
      skip,
      take: limit,
      where,
      orderBy,
      include: {
        category: { select: { id: true, name: true } },
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    // Gắn inStock và isFavorite
    products = products.map((p) => ({
      ...p,
      inStock: p.stock > 0,
      isFavorite: true,
    }));

    // Lọc theo minRating nếu có
    if (minRating > 0) {
      products = products.filter((p) => {
        if (!Array.isArray(p.reviews) || p.reviews.length === 0) return false;
        const avg = p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length;
        avg >= minRating;
        return;
      });
    }

    res.json({
      message: "Danh sách sản phẩm yêu thích",
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching favorite products.", error });
  }
};
