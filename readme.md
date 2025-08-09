# Laptop Shop API (Node.js/TypeScript)

Một dự án API cho hệ thống quản lý cửa hàng laptop: người dùng, sản phẩm, danh mục, giỏ hàng, đánh giá, tin tức, đơn hàng, phân quyền (RBAC), upload file và thanh toán VNPay.

## Mục lục

- Giới thiệu
- Kiến trúc & Công nghệ
- Cấu trúc thư mục (tham khảo)
- Yêu cầu hệ thống
- Cài đặt & Chạy dự án
- Biến môi trường (.env)
- Luồng nghiệp vụ chính
- Bảo mật & Phân quyền
- Phụ lục: Danh sách API (được giữ nguyên từ backup.routes.ts)

---

## Giới thiệu

Dự án cung cấp các API RESTful để xây dựng hệ thống thương mại điện tử cho laptop shop. Các chức năng chính:

- Quản lý người dùng, đăng ký/đăng nhập, cập nhật thông tin
- Quản lý danh mục và sản phẩm
- Giỏ hàng và đánh giá sản phẩm
- Tin tức/bài viết
- Đơn hàng và tích hợp thanh toán VNPay
- Phân quyền theo vai trò (Role) và quyền (Permission)
- Upload file (multipart/form-data)

Base path ví dụ khi mount router dự phòng:

```ts
import userRouter from "./mockTest/backup.routes";
app.use("/api/v1/api", userRouter);
```

---

## Kiến trúc & Công nghệ

- Runtime: Node.js (TypeScript)
- Framework: Express (REST API)
- Auth: JWT cho xác thực người dùng
- RBAC: Role/Permission để phân quyền endpoint
- Thanh toán: VNPay (tạo URL thanh toán và xử lý callback vnpay-return)
- Upload: multipart/form-data với trường file
- CSDL: sử dụng cơ sở dữ liệu quan hệ (MySQL/PostgreSQL) – cấu hình qua biến môi trường

Lưu ý: Tên thư mục/chi tiết triển khai có thể khác tùy branch. README này mang tính định hướng tổng quan.

---

## Cấu trúc thư mục (tham khảo)

```
.
├─ src/
│  ├─ controllers/        # Xử lý logic request/response (vd: cart.controllers.ts)
│  ├─ routes/             # Khai báo route Express
│  ├─ services/           # Xử lý nghiệp vụ
│  ├─ models/             # Định nghĩa model/schema DB
│  ├─ middlewares/        # verifyToken, authorize("admin") ...
│  ├─ utils/              # Helper, constants, validators
│  └─ app.ts / server.ts  # Khởi tạo app/server
├─ mockTest/
│  └─ backup.routes.ts    # Router tổng hợp dùng thử nghiệm/tài liệu
├─ readme.md               # Tài liệu dự án
└─ package.json
```

---

## Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn/pnpm
- Một CSDL quan hệ (MySQL/PostgreSQL)
- Tài khoản VNPay (sandbox/production) nếu dùng thanh toán

---

## Cài đặt & Chạy dự án

1. Cài dependencies

```bash
npm install
# hoặc: yarn install / pnpm install
```

2. Tạo file .env dựa trên mục "Biến môi trường" bên dưới

3. Chạy môi trường phát triển

```bash
npm run dev
```

4. Build và chạy production (nếu có script tương ứng)

```bash
npm run build && npm start
```

5. Kiểm tra nhanh API (ví dụ liệt kê sản phẩm)

- Gọi GET tới: {BASE_API_PREFIX}/product (xem BASE_API_PREFIX trong .env hoặc cấu hình route)

---

## Biến môi trường (.env)

Tùy dự án, tên biến có thể khác. Tham khảo danh sách phổ biến:

```
# Server
PORT=3000
BASE_API_PREFIX=/api/v1/api

# Database (chọn 1 trong 2 kiểu)
DATABASE_URL=postgresql://user:pass@localhost:5432/laptop_shop
# hoặc dạng tách nhỏ
DB_HOST=localhost
DB_PORT=5432
DB_USER=user
DB_PASS=pass
DB_NAME=laptop_shop

# Auth
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_DIR=uploads

# VNPay
VNP_TMN_CODE=your_tmn_code
VNP_HASH_SECRET=your_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_RETURN_URL=http://localhost:3000/api/v1/api/vnpay-return
VNP_LOCALE=vn
VNP_VERSION=2.1.0
```

---

## Luồng nghiệp vụ chính

- Xác thực (Auth)

  - Đăng ký tài khoản: POST /create-account
  - Đăng nhập nhận JWT: (endpoint tùy triển khai)
  - Đính kèm JWT qua header Authorization: Bearer <token>

- Sản phẩm & Danh mục

  - Admin tạo/cập nhật/xóa sản phẩm và danh mục
  - Người dùng duyệt danh sách, xem chi tiết

- Giỏ hàng

  - Thêm/xóa/cập nhật số lượng sản phẩm trong giỏ hàng
  - Lấy danh sách giỏ hàng theo user

- Đánh giá

  - Người dùng đã đăng nhập tạo/cập nhật/xóa đánh giá

- Tin tức

  - Quản lý bài viết tin tức, lọc theo user

- Đơn hàng & Thanh toán VNPay
  - Tạo URL thanh toán (POST /payment-vnpay)
  - VNPay redirect về hệ thống (GET /vnpay-return)
  - Xác minh chữ ký, cập nhật trạng thái và tạo đơn hàng

---

## Bảo mật & Phân quyền

- Middleware xác thực: `verifyToken`
- Phân quyền theo vai trò: `authorize("admin")` hoặc theo permission cụ thể
- Một số route yêu cầu quyền admin hoặc phải đăng nhập mới truy cập
- Truyền token qua header: `Authorization: Bearer <token>`

---

## Phụ lục: Danh sách API (từ mockTest/backup.routes.ts)

### 1. User Management

- GET `/user` – Lấy danh sách user (yêu cầu đăng nhập + quyền)
- POST `/create-account` – Tạo tài khoản mới
- GET `/get-user/:id` – Lấy thông tin user theo ID (yêu cầu đăng nhập)
- DELETE `/delete-user/:id` – Xóa user theo ID (chỉ admin)
- PUT `/update-user/:id` – Cập nhật thông tin user (yêu cầu đăng nhập)

### 2. File Upload

- POST `/upload-file` – Upload file lên server (yêu cầu đăng nhập)

### 3. Category Management

- GET `/category` – Lấy danh sách category
- POST `/create-category` – Tạo mới category (chỉ admin)
- GET `/get-category/:id` – Lấy category theo ID
- DELETE `/delete-category/:id` – Xóa category (chỉ admin)
- PUT `/update-category/:id` – Cập nhật category (chỉ admin)

### 4. Product Management

- GET `/product` – Lấy danh sách sản phẩm
- GET `/get-list-product-by-category-id/:categoryId` – Lấy sản phẩm theo category
- POST `/create-product` – Tạo mới sản phẩm (chỉ admin)
- GET `/get-product/:id` – Lấy sản phẩm theo ID
- DELETE `/delete-product/:id` – Xóa sản phẩm (chỉ admin)
- PUT `/update-product/:id` – Cập nhật sản phẩm (chỉ admin)

### 5. Review Management

- GET `/review` – Lấy danh sách đánh giá
- POST `/create-review` – Tạo đánh giá mới (yêu cầu đăng nhập)
- GET `/get-review/:id` – Lấy đánh giá theo ID
- DELETE `/delete-review/:id` – Xóa đánh giá (chỉ admin)
- PUT `/update-review/:id` – Cập nhật đánh giá (yêu cầu đăng nhập)

### 6. Cart Management

- POST `/create-cart-items` – Thêm sản phẩm vào giỏ hàng (yêu cầu đăng nhập)
- GET `/get-cart-items-of-user/:id` – Lấy giỏ hàng của user (yêu cầu đăng nhập)
- DELETE `/delete-cart-items/:id` – Xóa sản phẩm khỏi giỏ hàng (yêu cầu đăng nhập)
- PUT `/update-cart-items/:id` – Cập nhật sản phẩm trong giỏ hàng (yêu cầu đăng nhập)

### 7. News Management

- GET `/news` – Lấy danh sách tin tức
- GET `/get-news/:id` – Lấy tin tức theo ID
- POST `/create-news` – Tạo tin tức mới (chỉ admin)
- PUT `/update-news/:id` – Cập nhật tin tức (chỉ admin)
- DELETE `/delete-news/:id` – Xóa tin tức (chỉ admin)
- GET `/news-of-user/:userId` – Lấy tin tức theo user

### 8. Order & Payment (VNPay)

- POST `/payment-vnpay` – Tạo URL thanh toán VNPay
- GET `/vnpay-return` – Xử lý callback từ VNPay, xác thực và tạo đơn hàng
- POST `/create-order` – Tạo đơn hàng (yêu cầu đăng nhập)
- GET `/get-order/:id` – Lấy đơn hàng theo ID (yêu cầu đăng nhập)
- GET `/orders-of-user/:userId` – Lấy tất cả đơn hàng của user (yêu cầu đăng nhập)
- GET `/orders` – Lấy tất cả đơn hàng (chỉ admin)
- PUT `/update-order/:id` – Cập nhật đơn hàng (chỉ admin)
- DELETE `/delete-order/:id` – Xóa đơn hàng (chỉ admin)

### 9. Role Management

- GET `/roles` – Lấy tất cả role
- GET `/get-role/:id` – Lấy role theo ID
- POST `/create-role` – Tạo role mới (chỉ admin)
- PUT `/update-role/:id` – Cập nhật role (chỉ admin)
- DELETE `/delete-role/:id` – Xóa role (chỉ admin)

### 10. Permission Management

- GET `/permissions` – Lấy tất cả permission (có phân trang)
- GET `/permissions/:id` – Lấy permission theo ID
- POST `/create-permissions` – Tạo permission mới (chỉ admin)
- PUT `/permissions/:id` – Cập nhật permission (chỉ admin)
- DELETE `/permissions/:id` – Xóa permission (chỉ admin)

### 11. RolePermission Management

- GET `/role-permissions` – Lấy tất cả role-permission
- GET `/check-role-permissions/:roleId/:permissionId` – Kiểm tra role-permission tồn tại
- POST `/create-role-permissions` – Tạo role-permission mới (chỉ admin)
- PUT `/update-role-permissions` – Cập nhật role-permission (chỉ admin)
- DELETE `/delete-role-permissions` – Xóa role-permission (chỉ admin)

---

## Góp ý & Phát triển thêm

- Bổ sung Postman/Insomnia collection
- Thêm ví dụ request/response chi tiết cho từng nhóm API
- Viết unit/integration tests và hướng dẫn chạy test
- CI/CD, linting, formatting (ESLint/Prettier) nếu chưa có

Nếu bạn muốn mình bổ sung các phần trên theo hiện trạng mã nguồn, hãy cho mình biết để cập nhật README chi tiết hơn.
