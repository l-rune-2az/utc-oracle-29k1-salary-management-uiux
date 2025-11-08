import { NextRequest, NextResponse } from 'next/server';
import { mockPenalties } from '@/data/mockData';
import { Penalty } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockPenalties);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phạt' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Penalty = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newPenalty: Penalty = {
      penaltyId: data.penaltyId,
      empId: data.empId,
      penaltyType: data.penaltyType,
      penaltyDate: data.penaltyDate,
      amount: data.amount,
      reason: data.reason,
    };
    
    mockPenalties.push(newPenalty);
    return NextResponse.json(newPenalty, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo phạt mới' },
      { status: 500 }
    );
  }
}

