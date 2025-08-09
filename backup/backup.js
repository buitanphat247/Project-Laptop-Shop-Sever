const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function backup() {
  try {
    console.log('🔄 Đang tạo backup...');

    const users = await prisma.user.findMany();
    const categories = await prisma.category.findMany();
    const products = await prisma.product.findMany();
    const news = await prisma.news.findMany();
    const cartItems = await prisma.cartItem.findMany();
    const orders = await prisma.order.findMany();
    const orderItems = await prisma.orderItem.findMany();
    const reviews = await prisma.review.findMany();
    const roles = await prisma.role.findMany();
    const permissions = await prisma.permission.findMany();
    const rolePermissions = await prisma.rolePermission.findMany();
    const favoriteProducts = await prisma.favoriteProduct.findMany();
    const backupData = {
      users,
      categories,
      products,
      news,
      cartItems,
      orders,
      orderItems,
      reviews,
      roles,
      permissions,
      rolePermissions,
      favoriteProducts,
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    const filename = `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(filename, JSON.stringify(backupData, null, 2));

    console.log(`✅ Backup thành công: ${filename}`);
    console.log(`📊 Dữ liệu backup:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - News: ${news.length}`);
    console.log(`   - Cart Items: ${cartItems.length}`);
    console.log(`   - Orders: ${orders.length}`);
    console.log(`   - Order Items: ${orderItems.length}`);
    console.log(`   - Reviews: ${reviews.length}`);
    console.log(`   - Roles: ${roles.length}`);
    console.log(`   - Permissions: ${permissions.length}`);
    console.log(`   - RolePermissions: ${rolePermissions.length}`);

  } catch (error) {
    console.error('❌ Backup thất bại:', error);
  } finally {
    await prisma.$disconnect();
  }
}

backup();