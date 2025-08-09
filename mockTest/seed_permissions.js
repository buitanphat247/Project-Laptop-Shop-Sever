const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const permissions = [
    {
        name: "Lấy danh sách user",
        method: "GET",
        route: "/user",
        slug: "lay-danh-sach-user"
    },
    {
        name: "Tạo tài khoản mới",
        method: "POST",
        route: "/create-account",
        slug: "tao-tai-khoan-moi"
    },
    {
        name: "Lấy user theo id",
        method: "GET",
        route: "/get-user/:id",
        slug: "lay-user-theo-id"
    },
    {
        name: "Xoá user theo id",
        method: "DELETE",
        route: "/delete-user/:id",
        slug: "xoa-user-theo-id"
    },
    {
        name: "Cập nhật user theo id",
        method: "PUT",
        route: "/update-user/:id",
        slug: "cap-nhat-user-theo-id"
    },
    {
        name: "Upload file",
        method: "POST",
        route: "/upload-file",
        slug: "upload-file"
    },
    {
        name: "Lấy danh sách category",
        method: "GET",
        route: "/category",
        slug: "lay-danh-sach-category"
    },
    {
        name: "Tạo mới category",
        method: "POST",
        route: "/create-category",
        slug: "tao-moi-category"
    },
    {
        name: "Lấy category theo id",
        method: "GET",
        route: "/get-category/:id",
        slug: "lay-category-theo-id"
    },
    {
        name: "Xoá category",
        method: "DELETE",
        route: "/delete-category/:id",
        slug: "xoa-category"
    },
    {
        name: "Cập nhật category",
        method: "PUT",
        route: "/update-category/:id",
        slug: "cap-nhat-category"
    },
    {
        name: "Lấy danh sách product",
        method: "GET",
        route: "/product",
        slug: "lay-danh-sach-product"
    },
    {
        name: "Lấy sản phẩm theo category",
        method: "GET",
        route: "/get-list-product-by-category-id/:categoryId",
        slug: "lay-san-pham-theo-category"
    },
    {
        name: "Tạo mới product",
        method: "POST",
        route: "/create-product",
        slug: "tao-moi-product"
    },
    {
        name: "Lấy product theo id",
        method: "GET",
        route: "/get-product/:id",
        slug: "lay-product-theo-id"
    },
    {
        name: "Xoá product",
        method: "DELETE",
        route: "/delete-product/:id",
        slug: "xoa-product"
    },
    {
        name: "Cập nhật product",
        method: "PUT",
        route: "/update-product/:id",
        slug: "cap-nhat-product"
    },
    {
        name: "Lấy danh sách review",
        method: "GET",
        route: "/review",
        slug: "lay-danh-sach-review"
    },
    {
        name: "Tạo mới review",
        method: "POST",
        route: "/create-review",
        slug: "tao-moi-review"
    },
    {
        name: "Lấy review theo id",
        method: "GET",
        route: "/get-review/:id",
        slug: "lay-review-theo-id"
    },
    {
        name: "Xoá review",
        method: "DELETE",
        route: "/delete-review/:id",
        slug: "xoa-review"
    },
    {
        name: "Cập nhật review",
        method: "PUT",
        route: "/update-review/:id",
        slug: "cap-nhat-review"
    },
    {
        name: "Tạo mới cart item",
        method: "POST",
        route: "/create-cart-items",
        slug: "tao-moi-cart-item"
    },
    {
        name: "Lấy cart items theo user",
        method: "GET",
        route: "/get-cart-items-of-user/:id",
        slug: "lay-cart-items-theo-user"
    },
    {
        name: "Xoá cart item",
        method: "DELETE",
        route: "/delete-cart-items/:id",
        slug: "xoa-cart-item"
    },
    {
        name: "Cập nhật cart item",
        method: "PUT",
        route: "/update-cart-items/:id",
        slug: "cap-nhat-cart-item"
    },
    {
        name: "Lấy danh sách news",
        method: "GET",
        route: "/news",
        slug: "lay-danh-sach-news"
    },
    {
        name: "Lấy news theo id",
        method: "GET",
        route: "/get-news/:id",
        slug: "lay-news-theo-id"
    },
    {
        name: "Tạo mới news",
        method: "POST",
        route: "/create-news",
        slug: "tao-moi-news"
    },
    {
        name: "Cập nhật news",
        method: "PUT",
        route: "/update-news/:id",
        slug: "cap-nhat-news"
    },
    {
        name: "Xoá news",
        method: "DELETE",
        route: "/delete-news/:id",
        slug: "xoa-news"
    },
    {
        name: "Lấy bài viết theo user",
        method: "GET",
        route: "/news-of-user/:userId",
        slug: "lay-bai-viet-theo-user"
    },
    {
        name: "Tạo URL thanh toán VNPAY",
        method: "POST",
        route: "/payment-vnpay",
        slug: "tao-url-thanh-toan-vnpay"
    },
    {
        name: "Xử lý kết quả thanh toán VNPAY",
        method: "GET",
        route: "/vnpay-return",
        slug: "xu-ly-ket-qua-thanh-toan-vnpay"
    },
    {
        name: "Tạo mới đơn hàng",
        method: "POST",
        route: "/create-order",
        slug: "tao-moi-don-hang"
    },
    {
        name: "Lấy đơn hàng theo id",
        method: "GET",
        route: "/get-order/:id",
        slug: "lay-don-hang-theo-id"
    },
    {
        name: "Lấy đơn hàng của user",
        method: "GET",
        route: "/orders-of-user/:userId",
        slug: "lay-don-hang-cua-user"
    },
    {
        name: "Lấy tất cả đơn hàng",
        method: "GET",
        route: "/orders",
        slug: "lay-tat-ca-don-hang"
    },
    {
        name: "Cập nhật đơn hàng",
        method: "PUT",
        route: "/update-order/:id",
        slug: "cap-nhat-don-hang"
    },
    {
        name: "Xoá đơn hàng",
        method: "DELETE",
        route: "/delete-order/:id",
        slug: "xoa-don-hang"
    },
    {
        name: "Lấy tất cả role",
        method: "GET",
        route: "/roles",
        slug: "lay-tat-ca-role"
    },
    {
        name: "Lấy role theo id",
        method: "GET",
        route: "/get-role/:id",
        slug: "lay-role-theo-id"
    },
    {
        name: "Tạo mới role",
        method: "POST",
        route: "/create-role",
        slug: "tao-moi-role"
    },
    {
        name: "Cập nhật role",
        method: "PUT",
        route: "/update-role/:id",
        slug: "cap-nhat-role"
    },
    {
        name: "Xoá role",
        method: "DELETE",
        route: "/delete-role/:id",
        slug: "xoa-role"
    },
    {
        name: "Lấy tất cả permission",
        method: "GET",
        route: "/permissions",
        slug: "lay-tat-ca-permission"
    },
    {
        name: "Lấy permission theo id",
        method: "GET",
        route: "/permissions/:id",
        slug: "lay-permission-theo-id"
    },
    {
        name: "Tạo mới permission",
        method: "POST",
        route: "/create-permissions",
        slug: "tao-moi-permission"
    },
    {
        name: "Cập nhật permission",
        method: "PUT",
        route: "/permissions/:id",
        slug: "cap-nhat-permission"
    },
    {
        name: "Xoá permission",
        method: "DELETE",
        route: "/permissions/:id",
        slug: "xoa-permission"
    },
    {
        name: "Lấy tất cả role-permission",
        method: "GET",
        route: "/role-permissions",
        slug: "lay-tat-ca-role-permission"
    },
    {
        name: "Kiểm tra role-permission",
        method: "GET",
        route: "/check-role-permissions/:roleId/:permissionId",
        slug: "kiem-tra-role-permission"
    },
    {
        name: "Tạo mới role-permission",
        method: "POST",
        route: "/create-role-permissions",
        slug: "tao-moi-role-permission"
    },
    {
        name: "Cập nhật role-permission",
        method: "PUT",
        route: "/update-role-permissions",
        slug: "cap-nhat-role-permission"
    },
    {
        name: "Xoá role-permission",
        method: "DELETE",
        route: "/delete-role-permissions",
        slug: "xoa-role-permission"
    }
]


async function main() {
    for (const perm of permissions) {
        const existing = await prisma.permission.findFirst({
            where: {
                method: perm.method,
                route: perm.route
            }
        });

        if (existing) {
            console.log(`✅ Đã tồn tại: ${perm.method} ${perm.route}`);
            continue;
        }

        const created = await prisma.permission.create({
            data: {
                name: perm.name,
                method: perm.method,
                route: perm.route,
                slug: perm.slug
            }
        });
        console.log(`➕ Đã tạo mới: ${created.method} ${created.route}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });