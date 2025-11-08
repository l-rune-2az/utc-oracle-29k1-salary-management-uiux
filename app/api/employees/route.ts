import { NextRequest, NextResponse } from 'next/server';
import { mockEmployees } from '@/data/mockData';
import { Employee } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockEmployees);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách nhân viên' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Employee = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newEmployee: Employee = {
      empId: data.empId,
      fullName: data.fullName,
      birthDate: data.birthDate,
      gender: data.gender,
      deptId: data.deptId,
      positionId: data.positionId,
      joinDate: data.joinDate,
      status: data.status || 'ACTIVE',
    };
    
    mockEmployees.push(newEmployee);
    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo nhân viên mới' },
      { status: 500 }
    );
  }
}

