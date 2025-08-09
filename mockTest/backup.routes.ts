// routes/user.routes.ts
import { dateFormat, ReturnQueryFromVNPay } from "vnpay"; // nếu thư viện export type này
import { Request, Response, Router } from "express";
import {
  createUser,
  getUser,
  getUserById,
  deleteUserById,
  updateUserById,
} from "../controllers/user.controllers";
import {
  getReview,
  createReview,
  getReviewById,
  deleteReviewById,
  updateReviewById,
} from "../controllers/review.controllers";

import { upload } from "../config/multer";
import { fileUpload } from "../controllers/file.controllers";
import {
  createCategory,
  deleteCategoryById,
  getCategory,
  getCategoryById,
  getProductByIdCategory,
  updateCategoryById,
} from "../controllers/category.controllers";
import {
  authorize,
  checkPermission,
  verifyToken,
} from "../middleware/auth.middleware";
import {
  createProduct,
  deleteProductById,
  getProduct,
  getProductById,
  updateProductById,
} from "../controllers/product.controllers";
import {
  createCartItem,
  deleteCartItemById,
  getCartItemOfUserById,
  updateCartItemById,
} from "../controllers/cart.controllers";
import {
  // ...existing imports...
  createNews,
  getNews,
  getNewsById,
  updateNewsById,
  deleteNewsById,
  getNewsByUserId,
} from "../controllers/news.controllers";
import vnpay from "../config/vnpay";
const userRouter = Router();
import { ProductCode, VnpLocale } from "vnpay";
import {
  createOrder,
  deleteOrderById,
  getAllOrders,
  getOrderById,
  getOrdersByUserId,
  updateOrderById,
} from "../controllers/order.controllers";
import prisma from "../client";
import { tempCache } from "../config/Cache";

// Route lấy danh sách user – yêu cầu đã login
userRouter.get("/user", verifyToken, checkPermission, getUser);

// Route tạo tài khoản mới – ai cũng tạo được
userRouter.post("/create-account", createUser);

// Route lấy user theo id – chỉ người đã đăng nhập
userRouter.get("/get-user/:id", verifyToken, getUserById);

// Route delete user theo id – chỉ admin được xóa
userRouter.delete(
  "/delete-user/:id",
  // verifyToken,
  // authorize("admin"),
  deleteUserById
);

// Route update user theo id – user đã login mới được update
userRouter.put(
  "/update-user/:id",
  // verifyToken,
  updateUserById
);
/**--------------------------------------------------------------------------------------------------- */
// Upload file – chỉ login mới được upload
userRouter.post("/upload-file", verifyToken, upload.single("file"), fileUpload);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách category – ai cũng xem được
userRouter.get("/category", getCategory);

// Tạo mới category – chỉ admin
userRouter.post(
  "/create-category",
  verifyToken,
  checkPermission,
  createCategory
);

// Lấy theo id – ai cũng xem được
userRouter.get("/get-category/:id", getCategoryById);

// Xoá category – chỉ admin
userRouter.delete(
  "/delete-category/:id",
  // verifyToken,
  // authorize("admin"),
  deleteCategoryById
);

// Update category – chỉ admin
userRouter.put(
  "/update-category/:id",
  verifyToken,
  authorize("admin"),
  updateCategoryById
);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách product – ai cũng xem được
userRouter.get("/product", getProduct);
userRouter.get(
  "/get-list-product-by-category-id/:categoryId",
  getProductByIdCategory
);
// Tạo mới product – chỉ admin
userRouter.post(
  "/create-product",
  // verifyToken,
  // authorize("admin"),
  createProduct
);

// Lấy product theo id – ai cũng xem được
userRouter.get("/get-product/:id", getProductById);
// Xoá product – chỉ admin
userRouter.delete(
  "/delete-product/:id",
  // verifyToken,
  // authorize("admin"),
  deleteProductById
);

// Update product – chỉ admin
userRouter.put(
  "/update-product/:id",
  // verifyToken,
  // authorize("admin"),
  updateProductById
);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách review – ai cũng xem được
userRouter.get("/review", getReview);

// Tạo mới review – user đã login mới được tạo
userRouter.post("/create-review", verifyToken, createReview);

// Lấy review theo id – ai cũng xem được
userRouter.get("/get-review/:id", getReviewById);

// Xoá review – chỉ admin
userRouter.delete(
  "/delete-review/:id",
  verifyToken,
  authorize("admin"),
  deleteReviewById
);

// Cập nhật review – user đã login mới được update
userRouter.put("/update-review/:id", verifyToken, updateReviewById);

/**--------------------------------------------------------------------------------------------------- */

// Create a new cart item - requires login
userRouter.post(
  "/create-cart-items",

  // verifyToken,

  createCartItem
);

// Get a specific cart item by ID - requires login
userRouter.get(
  "/get-cart-items-of-user/:id",
  // verifyToken,
  getCartItemOfUserById
);

// Delete a cart item - requires login
userRouter.delete("/delete-cart-items/:id", deleteCartItemById);

// Update a cart item - requires login
userRouter.put(
  "/update-cart-items/:id",
  //  verifyToken,
  updateCartItemById
);

/**--------------------------------------------------------------------------------------------------- */
// News routes

// Lấy danh sách news – ai cũng xem được
userRouter.get("/news", getNews);

// Lấy news theo id – ai cũng xem được
userRouter.get("/get-news/:id", getNewsById);

// Tạo mới news – chỉ admin
userRouter.post("/create-news", createNews);

// Update news – chỉ admin
userRouter.put(
  "/update-news/:id",
  // verifyToken,
  // authorize("admin"),
  updateNewsById
);

// Xoá news – chỉ admin
userRouter.delete(
  "/delete-news/:id",
  // verifyToken,
  // authorize("admin"),
  deleteNewsById
);

// Lấy danh sách bài viết theo id User – ai cũng xem được
userRouter.get("/news-of-user/:userId", getNewsByUserId);
/**--------------------------------------------------------------------------------------------------- */

userRouter.post("/payment-vnpay", async (req: Request, res: Response) => {
  const { orderInfo, amount, orderData } = req.body;
  console.log("orderData: ", orderData);
  tempCache.set("orderData", orderData); // Lưu orderData vào cache tạm thời
  try {
    // tạo mã giao dịch
    const vnp_TxnRef = Date.now().toString(); // Mỗi lần request là 1 giao dịch mới

    // Bước 2: Tạo URL thanh toán VNPAY
    const paymentUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100, // Nhân 100
      vnp_IpAddr: ((req.headers["x-forwarded-for"] as string) ||
        req.connection?.remoteAddress ||
        req.socket?.remoteAddress ||
        req.ip ||
        "127.0.0.1") as string,
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: orderInfo,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: "http://localhost:3000/vnpay-return",
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
    });

    res.json({
      success: true,
      paymentUrl,
      message: "Tạo URL thanh toán thành công",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
});

interface OrderData {
  userId: number;
  items: { productId: number; quantity: number; price: number; name: string }[];
  shipName: string;
  shipAddress: string;
  totalPrice: number;
  note?: string;
  shipPhone?: string;
  shippedDate?: Date;
  status?: string;
}

userRouter.get(
  "/vnpay-return",
  async (req: Request<{}, {}, {}, ReturnQueryFromVNPay>, res: Response) => {
    try {
      const verify = vnpay.verifyReturnUrl(req.query);
      const { vnp_OrderInfo } = req.query;
      const orderInfo = JSON.parse(vnp_OrderInfo || "{}");

      // Xác thực chữ ký
      if (!verify.isVerified) {
        res.status(400).json({
          success: false,
          message: "❌ Xác thực chữ ký không hợp lệ!",
          data: verify,
        });
        return;
      }

      // Thanh toán thất bại
      if (!verify.isSuccess) {
        res.status(400).json({
          success: false,
          message: "❌ Thanh toán thất bại!",
          data: verify,
        });
        return;
      }

      const orderData = tempCache.get<OrderData>("orderData");

      if (!orderData) {
        res.status(400).json({
          success: false,
          message: "❌ Không tìm thấy thông tin đơn hàng trong cache!",
        });
        return;
      }

      const {
        userId,
        items,
        shipName,
        shipAddress,
        totalPrice,
        note,
        shipPhone,
        shippedDate,
      } = orderData;

      // Kiểm tra các trường bắt buộc
      if (
        typeof userId !== "number" ||
        !Array.isArray(items) ||
        typeof shipName !== "string" ||
        typeof shipAddress !== "string" ||
        typeof totalPrice !== "number"
      ) {
        res.status(400).json({
          success: false,
          message: "❌ Thiếu hoặc sai kiểu dữ liệu đơn hàng!",
        });
        return;
      }

      const data: any = {
        userId,
        shipName,
        shipAddress,
        totalPrice,
        note: note ?? "",
        shipPhone: shipPhone ?? "",
        shippedDate: shippedDate ? new Date(shippedDate) : undefined,
        status: "paid",
        orderItems: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      };

      await prisma.order.create({
        data,
        include: { orderItems: true },
      });
      await prisma.cartItem.deleteMany({
        where: {
          userId,
          productId: {
            in: items.map((item) => item.productId),
          },
        },
      });

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
      tempCache.del("orderData"); // Xóa cache sau khi tạo đơn hàng

      res.status(200).json({
        success: true,
        message: "✅ Thanh toán thành công và xác thực chữ ký hợp lệ!",
        data: data_success,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: "❌ Dữ liệu trả về không hợp lệ!",
        error: error?.message || "Unknown error",
      });
    }
  }
);
/**--------------------------------------------------------------------------------------------------- */

// Tạo mới đơn hàng – user đã đăng nhập
userRouter.post("/create-order", verifyToken, createOrder);

// Lấy đơn hàng theo id – user đã đăng nhập
userRouter.get("/get-order/:id", verifyToken, getOrderById);

// Lấy tất cả đơn hàng của user – user đã đăng nhập
userRouter.get("/orders-of-user/:userId", getOrdersByUserId);

// Lấy tất cả đơn hàng (admin) – chỉ admin mới xem được
userRouter.get(
  "/orders",
  //  verifyToken, authorize("admin"),
  getAllOrders
);

// Cập nhật đơn hàng – chỉ admin
userRouter.put(
  "/update-order/:id",
  // verifyToken,
  // authorize("admin"),
  updateOrderById
);

// Xoá đơn hàng – chỉ admin
userRouter.delete(
  "/delete-order/:id",
  verifyToken,
  authorize("admin"),
  deleteOrderById
);

// Lấy tất cả role
userRouter.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.role.findMany();
    res.json({ message: "Fetched all roles successfully.", data: roles });
  } catch (error) {
    res.status(500).json({ message: "Error fetching roles.", error });
  }
});

// Lấy role theo id
userRouter.get("/get-role/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({ where: { id: Number(id) } });
    if (!role) {
      res.status(404).json({ message: "Role not found." });
    }
    res.json({ message: "Fetched role successfully.", data: role });
  } catch (error) {
    res.status(500).json({ message: "Error fetching role.", error });
  }
});

// Tạo mới role (chỉ admin)
userRouter.post(
  "/create-role",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { name } = req.body;
      const newRole = await prisma.role.create({ data: { name } });
      res
        .status(201)
        .json({ message: "Role created successfully.", data: newRole });
    } catch (error) {
      res.status(500).json({ message: "Error creating role.", error });
    }
  }
);

// Cập nhật role (chỉ admin)
userRouter.put(
  "/update-role/:id",
  // verifyToken,
  // authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updatedRole = await prisma.role.update({
        where: { id: Number(id) },
        data: { name },
      });
      res.json({ message: "Role updated successfully.", data: updatedRole });
    } catch (error) {
      res.status(500).json({ message: "Error updating role.", error });
    }
  }
);

// Xoá role (chỉ admin)
userRouter.delete(
  "/delete-role/:id",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deletedRole = await prisma.role.delete({
        where: { id: Number(id) },
      });
      res.json({
        message: "Role deleted successfully.",
        data: deletedRole,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting role.",
        data: null,
        error,
      });
    }
  }
);

// Lấy tất cả permission
userRouter.get("/permissions", async (req, res) => {
  // GET /permissions - Lấy danh sách tất cả quyền với phân trang
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [permissions, total] = await Promise.all([
      prisma.permission.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" },
      }),
      prisma.permission.count(),
    ]);

    res.json({
      message: "Fetched all permissions successfully.",
      data: permissions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching permissions.", error });
  }
});

// Lấy permission theo id
userRouter.get("/permissions/:id", async (req, res) => {
  // GET /permissions/:id - Lấy quyền theo id
  // description: Lấy thông tin chi tiết một quyền theo id
  try {
    const { id } = req.params;
    const permission = await prisma.permission.findUnique({
      where: { id: Number(id) },
    });
    if (!permission) {
      res.status(404).json({ message: "Permission not found.", data: null });
    }
    res.json({ message: "Fetched permission successfully.", data: permission });
  } catch (error) {
    res.status(500).json({ message: "Error fetching permission.", error });
  }
});

// Tạo mới permission (chỉ admin)
userRouter.post(
  "/create-permissions",
  // verifyToken,
  // authorize("admin"),
  async (req, res) => {
    // POST /permissions - Tạo mới quyền
    // description: Tạo mới một quyền trong hệ thống (chỉ admin)
    try {
      const { name, method, route, slug } = req.body;
      const newPermission = await prisma.permission.create({
        data: { name, method, route, slug },
      });
      res.status(201).json({
        message: "Permission created successfully.",
        data: newPermission,
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating permission.", error });
    }
  }
);

// Cập nhật permission (chỉ admin)
userRouter.put(
  "/permissions/:id",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    // PUT /permissions/:id - Cập nhật quyền
    // description: Cập nhật tên quyền theo id (chỉ admin)
    try {
      const { id } = req.params;
      const { name } = req.body;
      const updatedPermission = await prisma.permission.update({
        where: { id: Number(id) },
        data: { name },
      });
      res.json({
        message: "Permission updated successfully.",
        data: updatedPermission,
      });
    } catch (error) {
      res.status(500).json({ message: "Error updating permission.", error });
    }
  }
);

// Xoá permission (chỉ admin)
userRouter.delete(
  "/permissions/:id",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    // DELETE /permissions/:id - Xoá quyền
    // description: Xoá một quyền theo id (chỉ admin)
    try {
      const { id } = req.params;
      const deletedPermission = await prisma.permission.delete({
        where: { id: Number(id) },
      });
      res.json({
        message: "Permission deleted successfully.",
        data: deletedPermission,
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting permission.", error });
    }
  }
);
// Lấy tất cả rolePermission
userRouter.get("/role-permissions", async (req, res) => {
  try {
    const rolePermissions = await prisma.rolePermission.findMany({
      include: {
        role: true,
        permission: true,
      },
      orderBy: { id: "asc" },
    });
    res.json({
      message: "Fetched all rolePermissions successfully.",
      data: rolePermissions,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching rolePermissions.", data: null, error });
  }
});
// Lấy rolePermission theo roleId và permissionId (dạng params)
userRouter.get(
  "/check-role-permissions/:roleId/:permissionId",
  async (req, res) => {
    try {
      const { roleId, permissionId } = req.params;
      if (!roleId || !permissionId) {
        res.status(400).json({
          message: "Missing roleId or permissionId in params.",
          data: null,
        });
      }
      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: Number(roleId),
          permissionId: Number(permissionId),
        },
      });

      const exists = !!rolePermission;
      res.json({
        message: exists
          ? "RolePermission exists."
          : "RolePermission does not exist.",
        data: exists,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error checking rolePermission.",
        data: null,
        error,
      });
    }
  }
);

// Tạo mới rolePermission (chỉ admin)
userRouter.post(
  "/create-role-permissions",
  // verifyToken,
  // authorize("admin"),
  async (req, res) => {
    try {
      const { roleId, permissionId, active } = req.body;
      const newRolePermission = await prisma.rolePermission.create({
        data: { roleId, permissionId, active },
      });
      res.status(201).json({
        message: "RolePermission created successfully.",
        data: newRolePermission,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error creating rolePermission.", data: null, error });
    }
  }
);

// Cập nhật rolePermission (chỉ admin)
userRouter.put(
  "/update-role-permissions",
  // verifyToken,
  // authorize("admin"),
  async (req, res) => {
    try {
      const { roleId, permissionId, active } = req.body;
      const updated = await prisma.rolePermission.updateMany({
        where: { roleId: Number(roleId), permissionId: Number(permissionId) },
        data: { active },
      });
      if (updated.count === 0) {
        res.status(404).json({
          message: "RolePermission not found.",
          data: null,
        });
      }
      res.json({
        message: "RolePermission updated successfully.",
        data: updated,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error updating rolePermission.",
        data: null,
        error,
      });
    }
  }
);

// Xoá rolePermission theo roleId và permissionId (chỉ admin)
userRouter.delete(
  "/delete-role-permissions",
  verifyToken,
  authorize("admin"),
  async (req, res) => {
    try {
      const { roleId, permissionId } = req.body;
      const deleted = await prisma.rolePermission.deleteMany({
        where: { roleId: Number(roleId), permissionId: Number(permissionId) },
      });
      if (deleted.count === 0) {
        res.status(404).json({
          message: "RolePermission not found.",
          data: null,
        });
      }
      res.json({
        message: "RolePermission deleted successfully.",
        data: deleted,
      });
    } catch (error) {
      res.status(500).json({
        message: "Error deleting rolePermission.",
        data: null,
        error,
      });
    }
  }
);
export default userRouter;
