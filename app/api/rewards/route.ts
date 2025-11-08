import { NextRequest, NextResponse } from 'next/server';
import { mockRewards } from '@/data/mockData';
import { Reward } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockRewards);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách thưởng' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Reward = await request.json();
    
    // TODO: Thay bằng insert Oracle
    const newReward: Reward = {
      rewardId: data.rewardId,
      empId: data.empId,
      deptId: data.deptId,
      rewardType: data.rewardType,
      rewardDate: data.rewardDate,
      amount: data.amount,
      description: data.description,
      approvedBy: data.approvedBy,
    };
    
    mockRewards.push(newReward);
    return NextResponse.json(newReward, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi tạo thưởng mới' },
      { status: 500 }
    );
  }
}

