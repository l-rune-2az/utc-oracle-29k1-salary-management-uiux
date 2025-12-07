import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockRewards } from '@/data/mockData';
import { Reward } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const rewards = await OracleService.select<Reward>(
        SQL_QUERIES.REWARD.SELECT_ALL,
      );
      return NextResponse.json(rewards);
    }

    return NextResponse.json(mockRewards);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách thưởng', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách thưởng' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Reward = await request.json();
    if (!payload.amount) {
      return NextResponse.json(
        { error: 'Số tiền thưởng là bắt buộc' },
        { status: 400 },
      );
    }

    const newReward: Reward = {
      rewardId: payload.rewardId || randomUUID(),
      empId: payload.empId,
      deptId: payload.deptId,
      rewardType: payload.rewardType,
      rewardDate: payload.rewardDate,
      amount: payload.amount,
      description: payload.description,
      approvedBy: payload.approvedBy,
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        SQL_QUERIES.REWARD.INSERT,
        {
          id: newReward.rewardId,
          empId: newReward.empId ?? null,
          deptId: newReward.deptId ?? null,
          rewardType: newReward.rewardType ?? null,
          rewardDate: newReward.rewardDate ? new Date(newReward.rewardDate) : null,
          amount: newReward.amount,
          description: newReward.description ?? null,
          approvedBy: newReward.approvedBy ?? null,
        },
      );
    } else {
      mockRewards.push(newReward);
    }

    return NextResponse.json(newReward, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo thưởng mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo thưởng mới' },
      { status: 500 },
    );
  }
}

