import { initOraclePool, getOracleConnection, closeOraclePool } from '@/lib/oracle';

async function testConnection() {
  try {
    console.log('Đang khởi tạo connection pool...');
    await initOraclePool();
    console.log('✓ Connection pool đã được khởi tạo thành công');

    console.log('Đang lấy connection từ pool...');
    const connection = await getOracleConnection();
    console.log('✓ Đã lấy connection thành công');

    console.log('Đang test query...');
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('✓ Query test thành công:', result.rows);

    await connection.close();
    console.log('✓ Connection đã được đóng');

    await closeOraclePool();
    console.log('✓ Connection pool đã được đóng');
    
    console.log('\n✅ Kết nối database thành công!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Lỗi kết nối database:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();

