# Routes Structure

Dự án đã được chia tách thành các module routes riêng biệt để dễ quản lý và bảo trì.

## Cấu trúc Routes

### 1. `auth.routes.ts`

- **Chức năng**: Xử lý authentication (đăng nhập, đăng ký, refresh token)
- **Prefix**: `/api/v1/auth`
- **Routes**:
  - `POST /login` - Đăng nhập
  - `POST /register` - Đăng ký
  - `POST /refresh-token` - Refresh token

### 2. `user.routes.ts`

- **Chức năng**: Quản lý user
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `GET /user` - Lấy danh sách user
  - `POST /create-account` - Tạo tài khoản mới
  - `GET /get-user/:id` - Lấy user theo ID
  - `DELETE /delete-user/:id` - Xóa user (admin only)
  - `PUT /update-user/:id` - Cập nhật user

### 3. `product.routes.ts`

- **Chức năng**: Quản lý sản phẩm và danh mục
- **Prefix**: `/api/v1/api`
- **Routes**:
  - **Category**:
    - `GET /category` - Lấy danh sách category
    - `POST /create-category` - Tạo category (admin only)
    - `GET /get-category/:id` - Lấy category theo ID
    - `DELETE /delete-category/:id` - Xóa category (admin only)
    - `PUT /update-category/:id` - Cập nhật category (admin only)
  - **Product**:
    - `GET /product` - Lấy danh sách sản phẩm
    - `GET /get-list-product-by-category-id/:categoryId` - Lấy sản phẩm theo category
    - `POST /create-product` - Tạo sản phẩm (admin only)
    - `GET /get-product/:id` - Lấy sản phẩm theo ID
    - `DELETE /delete-product/:id` - Xóa sản phẩm (admin only)
    - `PUT /update-product/:id` - Cập nhật sản phẩm (admin only)

### 4. `cart.routes.ts`

- **Chức năng**: Quản lý giỏ hàng
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `POST /create-cart-items` - Tạo item trong giỏ hàng
  - `GET /get-cart-items-of-user/:id` - Lấy giỏ hàng của user
  - `DELETE /delete-cart-items/:id` - Xóa item trong giỏ hàng
  - `PUT /update-cart-items/:id` - Cập nhật item trong giỏ hàng

### 5. `review.routes.ts`

- **Chức năng**: Quản lý đánh giá sản phẩm
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `GET /review` - Lấy danh sách đánh giá
  - `POST /create-review` - Tạo đánh giá mới
  - `GET /get-review/:id` - Lấy đánh giá theo ID
  - `DELETE /delete-review/:id` - Xóa đánh giá (admin only)
  - `PUT /update-review/:id` - Cập nhật đánh giá

### 6. `news.routes.ts`

- **Chức năng**: Quản lý tin tức
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `GET /news` - Lấy danh sách tin tức
  - `GET /get-news/:id` - Lấy tin tức theo ID
  - `POST /create-news` - Tạo tin tức mới (admin only)
  - `PUT /update-news/:id` - Cập nhật tin tức (admin only)
  - `DELETE /delete-news/:id` - Xóa tin tức (admin only)
  - `GET /news-of-user/:userId` - Lấy tin tức theo user ID

### 7. `order.routes.ts`

- **Chức năng**: Quản lý đơn hàng và thanh toán VNPay
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `POST /create-order` - Tạo đơn hàng mới
  - `GET /get-order/:id` - Lấy đơn hàng theo ID
  - `GET /orders-of-user/:userId` - Lấy đơn hàng của user
  - `GET /orders` - Lấy tất cả đơn hàng (admin only)
  - `PUT /update-order/:id` - Cập nhật đơn hàng (admin only)
  - `DELETE /delete-order/:id` - Xóa đơn hàng (admin only)
  - `POST /payment-vnpay` - Tạo URL thanh toán VNPay
  - `GET /vnpay-return` - Callback từ VNPay

### 8. `permission.routes.ts`

- **Chức năng**: Quản lý vai trò và quyền hạn
- **Prefix**: `/api/v1/api`
- **Routes**:
  - **Role**:
    - `GET /roles` - Lấy danh sách roles
    - `GET /get-role/:id` - Lấy role theo ID
    - `POST /create-role` - Tạo role mới (admin only)
    - `PUT /update-role/:id` - Cập nhật role (admin only)
    - `DELETE /delete-role/:id` - Xóa role (admin only)
  - **Permission**:
    - `GET /permissions` - Lấy danh sách permissions
    - `GET /permissions/:id` - Lấy permission theo ID
    - `POST /create-permissions` - Tạo permission mới (admin only)
    - `PUT /permissions/:id` - Cập nhật permission (admin only)
    - `DELETE /permissions/:id` - Xóa permission (admin only)
  - **RolePermission**:
    - `GET /role-permissions` - Lấy danh sách role permissions
    - `GET /check-role-permissions/:roleId/:permissionId` - Kiểm tra role permission
    - `POST /create-role-permissions` - Tạo role permission (admin only)
    - `PUT /update-role-permissions` - Cập nhật role permission (admin only)
    - `DELETE /delete-role-permissions` - Xóa role permission (admin only)

### 9. `file.routes.ts`

- **Chức năng**: Upload file
- **Prefix**: `/api/v1/api`
- **Routes**:
  - `POST /upload-file` - Upload file

### 10. `index.routes.ts`

- **Chức năng**: Tổng hợp tất cả routes
- **Prefix**: `/api/v1`
- **Mô tả**: File này import và mount tất cả các routes con

## Cách sử dụng

Trong file `app.ts`, chỉ cần import và sử dụng `mainRouter`:

```typescript
import mainRouter from "./routes/index.routes";

// Mount tất cả routes
app.use("/api/v1", mainRouter);
```

## Lợi ích của việc chia tách

1. **Dễ bảo trì**: Mỗi file chỉ chứa routes liên quan đến một chức năng cụ thể
2. **Dễ mở rộng**: Có thể thêm routes mới mà không ảnh hưởng đến các routes khác
3. **Code sạch hơn**: Mỗi file có kích thước nhỏ, dễ đọc và hiểu
4. **Tái sử dụng**: Có thể import từng router riêng lẻ nếu cần
5. **Quản lý version**: Dễ dàng quản lý version cho từng module
6. **Tách biệt logic**: Business logic được tách ra khỏi routes và đặt trong controllers

## Cấu trúc Controllers

### Controllers đã tạo:

- `payment.controllers.ts` - Xử lý thanh toán VNPay
- `role.controllers.ts` - Quản lý role
- `permission.controllers.ts` - Quản lý permission
- `rolePermission.controllers.ts` - Quản lý role permission

### Controllers có sẵn:

- `user.controllers.ts` - Quản lý user
- `product.controllers.ts` - Quản lý sản phẩm
- `category.controllers.ts` - Quản lý danh mục
- `cart.controllers.ts` - Quản lý giỏ hàng
- `order.controllers.ts` - Quản lý đơn hàng
- `review.controllers.ts` - Quản lý đánh giá
- `news.controllers.ts` - Quản lý tin tức
- `file.controllers.ts` - Upload file

## Lưu ý

- Tất cả routes đều có prefix `/api/v1` để tránh xung đột
- Middleware authentication được áp dụng ở từng route cụ thể
- Các routes admin có middleware `authorize("admin")` để kiểm tra quyền
- Business logic được tách ra khỏi routes và đặt trong controllers riêng biệt
