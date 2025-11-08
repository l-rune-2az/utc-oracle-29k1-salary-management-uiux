import { NextRequest, NextResponse } from 'next/server';
import { mockPayrolls } from '@/data/mockData';
import { Payroll } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockPayrolls);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bảng lương' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Payroll = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newPayroll: Payroll = {
      payrollId: data.payrollId,
      empId: data.empId,
      monthNum: data.monthNum,
      yearNum: data.yearNum,
      basicSalary: data.basicSalary,
      allowance: data.allowance,
      rewardAmount: data.rewardAmount,
      penaltyAmount: data.penaltyAmount,
      otSalary: data.otSalary,
      totalSalary: data.totalSalary,
      status: data.status || 'UNPAID',
    };
    
    mockPayrolls.push(newPayroll);
    return NextResponse.json(newPayroll, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo bảng lương mới' },
      { status: 500 }
    );
  }
}

