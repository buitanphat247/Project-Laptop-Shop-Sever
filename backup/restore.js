const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process'); // Thêm dòng này

const prisma = new PrismaClient();

function parseValidDate(val) {
    const date = new Date(val);
    return date instanceof Date && !isNaN(date.getTime()) ? date : undefined;
}

// Xử lý các trường ngày tháng cho từng model nếu cần
function transformData(model, item) {
    switch (model) {
        case 'user':
            return { ...item, createdAt: parseValidDate(item.createdAt) };
        case 'category':
            return { ...item, createdAt: parseValidDate(item.createdAt) };
        case 'product':
            return { ...item, createdAt: parseValidDate(item.createdAt) };
        case 'news':
            return { ...item, createdAt: parseValidDate(item.createdAt), updatedAt: parseValidDate(item.updatedAt) };
        case 'cartItem':
            return { ...item, createdAt: parseValidDate(item.createdAt) };
        case 'permission':
            return { ...item, createdAt: parseValidDate(item.createdAt) };
        default:
            return item;
    }
}

// Map key trong file backup sang tên model Prisma
const modelMap = {
    categories: 'category',
    products: 'product',
    news: 'news',
    cartItems: 'cartItem',
    orders: 'order',
    orderItems: 'orderItem',
    reviews: 'review',
    permissions: 'permission',
    rolePermissions: 'rolePermission',
    favoriteProducts: 'favoriteProduct' // <-- Thêm dòng này

};

async function restoreAll() {
    try {
        // Reset và push lại database trước khi restore
        console.log('🔄 Đang reset và push lại database bằng Prisma...');
        execSync('npx prisma db push --force-reset', { stdio: 'inherit' });

        const filePath = path.join(__dirname, 'backup_2025-08-07T07-31-04-529Z.json');

        if (!fs.existsSync(filePath)) {
            console.error(`❌ File backup không tồn tại: ${filePath}`);
            return;
        }

        console.log('🔄 Đang đọc file backup...');
        const backupData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        // 1. Khôi phục bảng roles
        if (Array.isArray(backupData.roles)) {
            // await prisma.role.deleteMany();
            console.log('📥 Đang khôi phục bảng roles...');
            for (const role of backupData.roles) {
                try {
                    await prisma.role.create({
                        data: {
                            id: role.id,
                            name: role.name
                        }
                    });
                } catch (error) {
                    console.error(`❌ Lỗi tạo role:`, error.message);
                }
            }
            console.log(`✅ Khôi phục ${backupData.roles.length} roles`);
        }

        // 2. Khôi phục bảng users
        if (Array.isArray(backupData.users)) {
            // await prisma.user.deleteMany();
            console.log('📥 Đang khôi phục bảng users...');
            for (const user of backupData.users) {
                try {
                    await prisma.user.create({
                        data: transformData('user', user)
                    });
                } catch (error) {
                    console.error(`❌ Lỗi tạo user:`, error.message);
                }
            }
            console.log(`✅ Khôi phục ${backupData.users.length} users`);
        }

        // 3. Khôi phục các bảng còn lại
        for (const key of Object.keys(backupData)) {
            if (key === 'roles' || key === 'users') continue;
            const model = modelMap[key];
            const items = backupData[key];
            if (!model || !Array.isArray(items) || items.length === 0) continue;

            console.log(`📥 Đang khôi phục bảng ${key}...`);
            for (const item of items) {
                try {
                    await prisma[model].create({
                        data: transformData(model, item)
                    });
                } catch (error) {
                    console.error(`❌ Lỗi tạo ${model}:`, error.message);
                }
            }
            console.log(`✅ Khôi phục ${items.length} ${key}`);
        }

        console.log('🎉 Khôi phục dữ liệu hoàn tất!');

    } catch (error) {
        console.error('❌ Lỗi trong quá trình khôi phục:', error);
    } finally {
        await prisma.$disconnect();
    }
}

restoreAll();