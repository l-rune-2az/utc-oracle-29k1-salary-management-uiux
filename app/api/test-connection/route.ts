import { NextResponse } from 'next/server';
import { initOraclePool, getOracleConnection, closeOraclePool } from '@/lib/oracle';
import { serverConfig, isOracleConfigured } from '@/config/serverConfig';

export async function GET() {
  try {
    // Kiểm tra cấu hình
    const configStatus = {
      isConfigured: isOracleConfigured(),
      hasUser: !!serverConfig.oracle.user,
      hasPassword: !!serverConfig.oracle.password,
      hasConnectString: !!serverConfig.oracle.connectString,
      connectString: serverConfig.oracle.connectString,
      user: serverConfig.oracle.user,
    };

    console.log('Oracle Config Status:', configStatus);

    if (!isOracleConfigured()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Cấu hình Oracle chưa đầy đủ',
          configStatus,
        },
        { status: 400 }
      );
    }

    // Khởi tạo connection pool
    console.log('Đang khởi tạo connection pool...');
    await initOraclePool();
    console.log('Connection pool đã được khởi tạo');
    
    // Lấy connection từ pool
    console.log('Đang lấy connection từ pool...');
    const connection = await getOracleConnection();
    console.log('Đã lấy connection thành công');
    
    // Test query đơn giản
    console.log('Đang thực thi test query...');
    const result = await connection.execute('SELECT 1 as test_value, SYSDATE as current_time FROM DUAL');
    console.log('Query thành công');
    
    // Đóng connection
    await connection.close();
    console.log('Connection đã được đóng');
    
    // Đóng pool
    await closeOraclePool();
    console.log('Connection pool đã được đóng');
    
    return NextResponse.json({
      success: true,
      message: 'Kết nối database thành công!',
      data: result.rows,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Lỗi kết nối database:', error);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi kết nối database',
        error: error.message || 'Unknown error',
        details: error.toString(),
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

