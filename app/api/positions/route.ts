import { NextRequest, NextResponse } from 'next/server';
import { mockPositions } from '@/data/mockData';
import { Position } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockPositions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách chức vụ' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Position = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newPosition: Position = {
      positionId: data.positionId,
      positionName: data.positionName,
      baseSalary: data.baseSalary,
    };
    
    mockPositions.push(newPosition);
    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo chức vụ mới' },
      { status: 500 }
    );
  }
}

