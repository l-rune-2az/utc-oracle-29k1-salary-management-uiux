import { NextRequest, NextResponse } from 'next/server';
import { mockContracts } from '@/data/mockData';
import { Contract } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockContracts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách hợp đồng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Contract = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newContract: Contract = {
      contractId: data.contractId,
      empId: data.empId,
      startDate: data.startDate,
      endDate: data.endDate,
      salaryFactor: data.salaryFactor,
      contractType: data.contractType,
    };
    
    mockContracts.push(newContract);
    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo hợp đồng mới' },
      { status: 500 }
    );
  }
}

