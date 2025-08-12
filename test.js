const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
    const connectionString = "mysql://root:siGhSDooSpMmRehfmOmwWAHKJWoLSuIX@centerbeam.proxy.rlwy.net:29559/railway";
    
    console.log('🔄 Đang kiểm tra kết nối database...');
    console.log('📍 Host: sql107.infinityfree.com');
    console.log('👤 User: if0_39691329');
    console.log('🗄️ Database: if0_39691329_laptopshop');
    console.log('─'.repeat(50));

    try {
        // Tạo kết nối
        const connection = await mysql.createConnection(connectionString);
        console.log('✅ Kết nối database thành công!');

        // Test 1: Kiểm tra database hiện tại
        console.log('\n📊 Test 1: Kiểm tra database hiện tại');
        const [dbResult] = await connection.execute('SELECT DATABASE() as current_db');
        console.log('   Current database:', dbResult[0].current_db);

        // Test 2: Hiển thị tất cả tables
        console.log('\n📋 Test 2: Danh sách tables');
        const [tables] = await connection.execute('SHOW TABLES');
        if (tables.length > 0) {
            console.log('   Tables tìm thấy:');
            tables.forEach((table, index) => {
                const tableName = Object.values(table)[0];
                console.log(`   ${index + 1}. ${tableName}`);
            });
        } else {
            console.log('   ⚠️ Không tìm thấy table nào');
        }

        // Test 3: Kiểm tra cấu trúc một table (nếu có)
        if (tables.length > 0) {
            const firstTable = Object.values(tables[0])[0];
            console.log(`\n🔍 Test 3: Cấu trúc table "${firstTable}"`);
            const [columns] = await connection.execute(`DESCRIBE ${firstTable}`);
            console.log('   Columns:');
            columns.forEach(col => {
                console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
            });
        }

        // Test 4: Đếm records trong tables
        if (tables.length > 0) {
            console.log('\n📈 Test 4: Số lượng records');
            for (const table of tables) {
                const tableName = Object.values(table)[0];
                try {
                    const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
                    console.log(`   ${tableName}: ${count[0].count} records`);
                } catch (error) {
                    console.log(`   ${tableName}: Lỗi đếm records - ${error.message}`);
                }
            }
        }

        // Test 5: Kiểm tra version MySQL
        console.log('\n🔧 Test 5: Thông tin server');
        const [version] = await connection.execute('SELECT VERSION() as version');
        console.log(`   MySQL Version: ${version[0].version}`);

        // Test 6: Kiểm tra timezone
        const [timezone] = await connection.execute('SELECT @@time_zone as timezone');
        console.log(`   Timezone: ${timezone[0].timezone}`);

        // Đóng kết nối
        await connection.end();
        console.log('\n✅ Đã đóng kết nối thành công');
        
    } catch (error) {
        console.error('\n❌ Lỗi kết nối database:');
        console.error('   Error code:', error.code);
        console.error('   Error message:', error.message);
        
        if (error.code === 'ENOTFOUND') {
            console.log('\n💡 Gợi ý khắc phục:');
            console.log('   - Kiểm tra lại hostname: sql107.infinityfree.com');
            console.log('   - Kiểm tra kết nối internet');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('\n💡 Gợi ý khắc phục:');
            console.log('   - Kiểm tra lại username: if0_39691329');
            console.log('   - Kiểm tra lại password: 8caTqj5m6pVD');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.log('\n💡 Gợi ý khắc phục:');
            console.log('   - Kiểm tra lại tên database: if0_39691329_laptopshop');
        }
    }
}

// Chạy test
testDatabaseConnection();