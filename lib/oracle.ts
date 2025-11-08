// ==========================================
// ORACLE DATABASE CONNECTION
// ==========================================
// File này sẽ chứa các hàm kết nối và thao tác với Oracle Database
// TODO: Cài đặt package oracledb và cấu hình kết nối

/*
import oracledb from 'oracledb';

// Cấu hình Oracle connection pool
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

export async function getOracleConnection() {
  try {
    const connection = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    });
    return connection;
  } catch (error) {
    console.error('Lỗi kết nối Oracle:', error);
    throw error;
  }
}

// Ví dụ sử dụng:
export async function queryDepartments() {
  const connection = await getOracleConnection();
  try {
    const result = await connection.execute('SELECT * FROM DEPARTMENT');
    return result.rows;
  } finally {
    await connection.close();
  }
}
*/

// Placeholder - sẽ được implement khi kết nối Oracle
export async function getOracleConnection() {
  throw new Error('Oracle connection chưa được cấu hình. Vui lòng cài đặt oracledb package và cấu hình kết nối.');
}

