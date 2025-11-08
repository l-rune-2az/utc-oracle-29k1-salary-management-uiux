import { NextRequest, NextResponse } from 'next/server';
import { mockDepartments } from '@/data/mockData';
import { Department } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls
// import { getOracleConnection } from '@/lib/oracle';

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    // const connection = await getOracleConnection();
    // const result = await connection.execute('SELECT * FROM DEPARTMENT');
    // return NextResponse.json(result.rows);
    
    return NextResponse.json(mockDepartments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phòng ban' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Department = await request.json();
    
    // TODO: Thay bằng insert Oracle
    // const connection = await getOracleConnection();
    // await connection.execute(
    //   'INSERT INTO DEPARTMENT (DEPT_ID, DEPT_NAME, LOCATION) VALUES (:1, :2, :3)',
    //   [data.deptId, data.deptName, data.location]
    // );
    
    const newDept: Department = {
      deptId: data.deptId,
      deptName: data.deptName,
      location: data.location,
    };
    
    mockDepartments.push(newDept);
    return NextResponse.json(newDept, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo phòng ban mới' },
      { status: 500 }
    );
  }
}

