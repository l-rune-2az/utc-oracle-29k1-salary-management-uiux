import { NextRequest, NextResponse } from 'next/server';
import { mockSalaryPayments } from '@/data/mockData';
import { SalaryPayment } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockSalaryPayments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phiếu chi lương' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: SalaryPayment = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newPayment: SalaryPayment = {
      paymentId: data.paymentId,
      payrollId: data.payrollId,
      paymentDate: data.paymentDate,
      approvedBy: data.approvedBy,
      note: data.note,
    };
    
    mockSalaryPayments.push(newPayment);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo phiếu chi lương mới' },
      { status: 500 }
    );
  }
}

