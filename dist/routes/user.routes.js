"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// routes/user.routes.ts
const vnpay_1 = require("vnpay"); // nếu thư viện export type này
const express_1 = require("express");
const user_controllers_1 = require("../controllers/user.controllers");
const review_controllers_1 = require("../controllers/review.controllers");
const multer_1 = require("../config/multer");
const file_controllers_1 = require("../controllers/file.controllers");
const category_controllers_1 = require("../controllers/category.controllers");
const auth_middleware_1 = require("../middleware/auth.middleware");
const product_controllers_1 = require("../controllers/product.controllers");
const cart_controllers_1 = require("../controllers/cart.controllers");
const news_controllers_1 = require("../controllers/news.controllers");
const vnpay_2 = __importDefault(require("../config/vnpay"));
const userRouter = (0, express_1.Router)();
const vnpay_3 = require("vnpay");
const order_controllers_1 = require("../controllers/order.controllers");
const client_1 = __importDefault(require("../client"));
const Cache_1 = require("../config/Cache");
// Route lấy danh sách user – yêu cầu đã login
userRouter.get("/user", auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)(), user_controllers_1.getUser);
// Route tạo tài khoản mới – ai cũng tạo được
userRouter.post("/create-account", user_controllers_1.createUser);
// Route lấy user theo id – chỉ người đã đăng nhập
userRouter.get("/get-user/:id", auth_middleware_1.verifyToken, user_controllers_1.getUserById);
// Route delete user theo id – chỉ admin được xóa
userRouter.delete("/delete-user/:id", 
// verifyToken,
// authorize("admin"),
user_controllers_1.deleteUserById);
// Route update user theo id – user đã login mới được update
userRouter.put("/update-user/:id", 
// verifyToken,
user_controllers_1.updateUserById);
/**--------------------------------------------------------------------------------------------------- */
// Upload file – chỉ login mới được upload
userRouter.post("/upload-file", auth_middleware_1.verifyToken, multer_1.upload.single("file"), file_controllers_1.fileUpload);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách category – ai cũng xem được
userRouter.get("/category", category_controllers_1.getCategory);
// Tạo mới category – chỉ admin
userRouter.post("/create-category", 
// verifyToken,
// authorize("admin"),
category_controllers_1.createCategory);
// Lấy theo id – ai cũng xem được
userRouter.get("/get-category/:id", category_controllers_1.getCategoryById);
// Xoá category – chỉ admin
userRouter.delete("/delete-category/:id", 
// verifyToken,
// authorize("admin"),
category_controllers_1.deleteCategoryById);
// Update category – chỉ admin
userRouter.put("/update-category/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), category_controllers_1.updateCategoryById);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách product – ai cũng xem được
userRouter.get("/product", product_controllers_1.getProduct);
userRouter.get("/get-list-product-by-category-id/:categoryId", category_controllers_1.getProductByIdCategory);
// Tạo mới product – chỉ admin
userRouter.post("/create-product", 
// verifyToken,
// authorize("admin"),
product_controllers_1.createProduct);
// Lấy product theo id – ai cũng xem được
userRouter.get("/get-product/:id", product_controllers_1.getProductById);
// Xoá product – chỉ admin
userRouter.delete("/delete-product/:id", 
// verifyToken,
// authorize("admin"),
product_controllers_1.deleteProductById);
// Update product – chỉ admin
userRouter.put("/update-product/:id", 
// verifyToken,
// authorize("admin"),
product_controllers_1.updateProductById);
/**--------------------------------------------------------------------------------------------------- */
// Lấy danh sách review – ai cũng xem được
userRouter.get("/review", review_controllers_1.getReview);
// Tạo mới review – user đã login mới được tạo
userRouter.post("/create-review", auth_middleware_1.verifyToken, review_controllers_1.createReview);
// Lấy review theo id – ai cũng xem được
userRouter.get("/get-review/:id", review_controllers_1.getReviewById);
// Xoá review – chỉ admin
userRouter.delete("/delete-review/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), review_controllers_1.deleteReviewById);
// Cập nhật review – user đã login mới được update
userRouter.put("/update-review/:id", auth_middleware_1.verifyToken, review_controllers_1.updateReviewById);
/**--------------------------------------------------------------------------------------------------- */
// Create a new cart item - requires login
userRouter.post("/create-cart-items", 
// verifyToken,
cart_controllers_1.createCartItem);
// Get a specific cart item by ID - requires login
userRouter.get("/get-cart-items-of-user/:id", 
// verifyToken,
cart_controllers_1.getCartItemOfUserById);
// Delete a cart item - requires login
userRouter.delete("/delete-cart-items/:id", cart_controllers_1.deleteCartItemById);
// Update a cart item - requires login
userRouter.put("/update-cart-items/:id", 
//  verifyToken,
cart_controllers_1.updateCartItemById);
/**--------------------------------------------------------------------------------------------------- */
// News routes
// Lấy danh sách news – ai cũng xem được
userRouter.get("/news", news_controllers_1.getNews);
// Lấy news theo id – ai cũng xem được
userRouter.get("/get-news/:id", news_controllers_1.getNewsById);
// Tạo mới news – chỉ admin
userRouter.post("/create-news", news_controllers_1.createNews);
// Update news – chỉ admin
userRouter.put("/update-news/:id", 
// verifyToken,
// authorize("admin"),
news_controllers_1.updateNewsById);
// Xoá news – chỉ admin
userRouter.delete("/delete-news/:id", 
// verifyToken,
// authorize("admin"),
news_controllers_1.deleteNewsById);
// Lấy danh sách bài viết theo id User – ai cũng xem được
userRouter.get("/news-of-user/:userId", news_controllers_1.getNewsByUserId);
/**--------------------------------------------------------------------------------------------------- */
userRouter.post("/payment-vnpay", async (req, res) => {
    const { orderInfo, amount, orderData } = req.body;
    console.log("orderData: ", orderData);
    Cache_1.tempCache.set("orderData", orderData); // Lưu orderData vào cache tạm thời
    try {
        // tạo mã giao dịch
        const vnp_TxnRef = Date.now().toString(); // Mỗi lần request là 1 giao dịch mới
        // Bước 2: Tạo URL thanh toán VNPAY
        const paymentUrl = await vnpay_2.default.buildPaymentUrl({
            vnp_Amount: amount * 100, // Nhân 100
            vnp_IpAddr: (req.headers["x-forwarded-for"] ||
                req.connection?.remoteAddress ||
                req.socket?.remoteAddress ||
                req.ip ||
                "127.0.0.1"),
            vnp_TxnRef: vnp_TxnRef,
            vnp_OrderInfo: orderInfo,
            vnp_OrderType: vnpay_3.ProductCode.Other,
            vnp_ReturnUrl: "http://localhost:3000/vnpay-return",
            vnp_Locale: vnpay_3.VnpLocale.VN,
            vnp_CreateDate: (0, vnpay_1.dateFormat)(new Date()),
        });
        res.json({
            success: true,
            paymentUrl,
            message: "Tạo URL thanh toán thành công",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Lỗi khi tạo đơn hàng",
            error: error.message,
        });
    }
});
userRouter.get("/vnpay-return", async (req, res) => {
    try {
        const verify = vnpay_2.default.verifyReturnUrl(req.query);
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
        const orderData = Cache_1.tempCache.get("orderData");
        if (!orderData) {
            res.status(400).json({
                success: false,
                message: "❌ Không tìm thấy thông tin đơn hàng trong cache!",
            });
            return;
        }
        const { userId, items, shipName, shipAddress, totalPrice, note, shipPhone, shippedDate, } = orderData;
        // Kiểm tra các trường bắt buộc
        if (typeof userId !== "number" ||
            !Array.isArray(items) ||
            typeof shipName !== "string" ||
            typeof shipAddress !== "string" ||
            typeof totalPrice !== "number") {
            res.status(400).json({
                success: false,
                message: "❌ Thiếu hoặc sai kiểu dữ liệu đơn hàng!",
            });
            return;
        }
        const data = {
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
        await client_1.default.order.create({
            data,
            include: { orderItems: true },
        });
        await client_1.default.cartItem.deleteMany({
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
        Cache_1.tempCache.del("orderData"); // Xóa cache sau khi tạo đơn hàng
        res.status(200).json({
            success: true,
            message: "✅ Thanh toán thành công và xác thực chữ ký hợp lệ!",
            data: data_success,
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: "❌ Dữ liệu trả về không hợp lệ!",
            error: error?.message || "Unknown error",
        });
    }
});
/**--------------------------------------------------------------------------------------------------- */
// Tạo mới đơn hàng – user đã đăng nhập
userRouter.post("/create-order", auth_middleware_1.verifyToken, order_controllers_1.createOrder);
// Lấy đơn hàng theo id – user đã đăng nhập
userRouter.get("/get-order/:id", auth_middleware_1.verifyToken, order_controllers_1.getOrderById);
// Lấy tất cả đơn hàng của user – user đã đăng nhập
userRouter.get("/orders-of-user/:userId", order_controllers_1.getOrdersByUserId);
// Lấy tất cả đơn hàng (admin) – chỉ admin mới xem được
userRouter.get("/orders", 
//  verifyToken, authorize("admin"),
order_controllers_1.getAllOrders);
// Cập nhật đơn hàng – chỉ admin
userRouter.put("/update-order/:id", 
// verifyToken,
// authorize("admin"),
order_controllers_1.updateOrderById);
// Xoá đơn hàng – chỉ admin
userRouter.delete("/delete-order/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), order_controllers_1.deleteOrderById);
// Lấy tất cả role
userRouter.get("/roles", async (req, res) => {
    try {
        const roles = await client_1.default.role.findMany();
        res.json({ message: "Fetched all roles successfully.", data: roles });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching roles.", error });
    }
});
// Lấy role theo id
userRouter.get("/get-role/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const role = await client_1.default.role.findUnique({ where: { id: Number(id) } });
        if (!role) {
            res.status(404).json({ message: "Role not found." });
        }
        res.json({ message: "Fetched role successfully.", data: role });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching role.", error });
    }
});
// Tạo mới role (chỉ admin)
userRouter.post("/create-role", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const { name } = req.body;
        const newRole = await client_1.default.role.create({ data: { name } });
        res
            .status(201)
            .json({ message: "Role created successfully.", data: newRole });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating role.", error });
    }
});
// Cập nhật role (chỉ admin)
userRouter.put("/update-role/:id", 
// verifyToken,
// authorize("admin"),
async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedRole = await client_1.default.role.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json({ message: "Role updated successfully.", data: updatedRole });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating role.", error });
    }
});
// Xoá role (chỉ admin)
userRouter.delete("/delete-role/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const { id } = req.params;
        const deletedRole = await client_1.default.role.delete({
            where: { id: Number(id) },
        });
        res.json({
            message: "Role deleted successfully.",
            data: deletedRole,
        });
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting role.",
            data: null,
            error,
        });
    }
});
// Lấy tất cả permission
userRouter.get("/permissions", async (req, res) => {
    // GET /permissions - Lấy danh sách tất cả quyền với phân trang
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const [permissions, total] = await Promise.all([
            client_1.default.permission.findMany({
                skip,
                take: limit,
                orderBy: { id: "asc" },
            }),
            client_1.default.permission.count(),
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
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching permissions.", error });
    }
});
// Lấy permission theo id
userRouter.get("/permissions/:id", async (req, res) => {
    // GET /permissions/:id - Lấy quyền theo id
    // description: Lấy thông tin chi tiết một quyền theo id
    try {
        const { id } = req.params;
        const permission = await client_1.default.permission.findUnique({
            where: { id: Number(id) },
        });
        if (!permission) {
            res.status(404).json({ message: "Permission not found.", data: null });
        }
        res.json({ message: "Fetched permission successfully.", data: permission });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching permission.", error });
    }
});
// Tạo mới permission (chỉ admin)
userRouter.post("/create-permissions", 
// verifyToken,
// authorize("admin"),
async (req, res) => {
    // POST /permissions - Tạo mới quyền
    // description: Tạo mới một quyền trong hệ thống (chỉ admin)
    try {
        const { name, method, route, slug } = req.body;
        const newPermission = await client_1.default.permission.create({
            data: { name, method, route, slug },
        });
        res.status(201).json({
            message: "Permission created successfully.",
            data: newPermission,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error creating permission.", error });
    }
});
// Cập nhật permission (chỉ admin)
userRouter.put("/permissions/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), async (req, res) => {
    // PUT /permissions/:id - Cập nhật quyền
    // description: Cập nhật tên quyền theo id (chỉ admin)
    try {
        const { id } = req.params;
        const { name } = req.body;
        const updatedPermission = await client_1.default.permission.update({
            where: { id: Number(id) },
            data: { name },
        });
        res.json({
            message: "Permission updated successfully.",
            data: updatedPermission,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error updating permission.", error });
    }
});
// Xoá permission (chỉ admin)
userRouter.delete("/permissions/:id", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), async (req, res) => {
    // DELETE /permissions/:id - Xoá quyền
    // description: Xoá một quyền theo id (chỉ admin)
    try {
        const { id } = req.params;
        const deletedPermission = await client_1.default.permission.delete({
            where: { id: Number(id) },
        });
        res.json({
            message: "Permission deleted successfully.",
            data: deletedPermission,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting permission.", error });
    }
});
// Lấy tất cả rolePermission
userRouter.get("/role-permissions", async (req, res) => {
    try {
        const rolePermissions = await client_1.default.rolePermission.findMany({
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
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching rolePermissions.", data: null, error });
    }
});
// Lấy rolePermission theo roleId và permissionId (dạng params)
userRouter.get("/check-role-permissions/:roleId/:permissionId", async (req, res) => {
    try {
        const { roleId, permissionId } = req.params;
        if (!roleId || !permissionId) {
            res.status(400).json({
                message: "Missing roleId or permissionId in params.",
                data: null,
            });
        }
        const rolePermission = await client_1.default.rolePermission.findFirst({
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
    }
    catch (error) {
        res.status(500).json({
            message: "Error checking rolePermission.",
            data: null,
            error,
        });
    }
});
// Tạo mới rolePermission (chỉ admin)
userRouter.post("/create-role-permissions", 
// verifyToken,
// authorize("admin"),
async (req, res) => {
    try {
        const { roleId, permissionId, active } = req.body;
        const newRolePermission = await client_1.default.rolePermission.create({
            data: { roleId, permissionId, active },
        });
        res.status(201).json({
            message: "RolePermission created successfully.",
            data: newRolePermission,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: "Error creating rolePermission.", data: null, error });
    }
});
// Cập nhật rolePermission (chỉ admin)
userRouter.put("/update-role-permissions", 
// verifyToken,
// authorize("admin"),
async (req, res) => {
    try {
        const { roleId, permissionId, active } = req.body;
        const updated = await client_1.default.rolePermission.updateMany({
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
    }
    catch (error) {
        res.status(500).json({
            message: "Error updating rolePermission.",
            data: null,
            error,
        });
    }
});
// Xoá rolePermission theo roleId và permissionId (chỉ admin)
userRouter.delete("/delete-role-permissions", auth_middleware_1.verifyToken, (0, auth_middleware_1.authorize)("admin"), async (req, res) => {
    try {
        const { roleId, permissionId } = req.body;
        const deleted = await client_1.default.rolePermission.deleteMany({
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
    }
    catch (error) {
        res.status(500).json({
            message: "Error deleting rolePermission.",
            data: null,
            error,
        });
    }
});
exports.default = userRouter;
