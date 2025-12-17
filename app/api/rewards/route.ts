import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockRewards } from '@/data/mockData';
import { Reward } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

const formatDateCode = (value?: Date | string) => {
  if (!value) return '00000000';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '00000000';
  }
  return parsed.toISOString().slice(0, 10).replace(/-/g, '');
};

const buildRewardCode = (reward: Pick<Reward, 'rewardId' | 'rewardDate'>) => {
  const idSegment = String(reward.rewardId ?? '000000')
    .replace(/[^A-Za-z0-9]/g, '')
    .padEnd(6, '0')
    .slice(0, 6)
    .toUpperCase();
  return `RW-${formatDateCode(reward.rewardDate)}-${idSegment}`;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const rewards = await OracleService.select<Reward>(
        SQL_QUERIES.REWARD.SELECT_ALL,
      );
      return NextResponse.json(rewards);
    }

    const mapped = mockRewards.map((item) => ({
      ...item,
      rewardCode: item.rewardCode ?? buildRewardCode(item),
    }));

    return NextResponse.json(mapped);
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

export async function PUT(request: NextRequest) {
  try {
    const payload: Reward = await request.json();
    if (!payload.rewardId || !payload.amount) {
      return NextResponse.json(
        { error: 'Thiếu ID hoặc số tiền thưởng' },
        { status: 400 },
      );
    }

    const updatedReward: Reward = {
      rewardId: payload.rewardId,
      empId: payload.empId,
      deptId: payload.deptId,
      rewardType: payload.rewardType,
      rewardDate: payload.rewardDate,
      amount: payload.amount,
      description: payload.description,
      approvedBy: payload.approvedBy,
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.REWARD.UPDATE,
        {
          id: updatedReward.rewardId,
          empId: updatedReward.empId ?? null,
          deptId: updatedReward.deptId ?? null,
          rewardType: updatedReward.rewardType ?? null,
          rewardDate: updatedReward.rewardDate ? new Date(updatedReward.rewardDate) : null,
          amount: updatedReward.amount,
          description: updatedReward.description ?? null,
          approvedBy: updatedReward.approvedBy ?? null,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy thưởng để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockRewards.findIndex(
        (reward) => reward.rewardId === updatedReward.rewardId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy thưởng để cập nhật' },
          { status: 404 },
        );
      }
      mockRewards[index] = updatedReward;
    }

    return NextResponse.json(updatedReward);
  } catch (error) {
    console.error('Lỗi khi cập nhật thưởng', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật thưởng' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { rewardId } = await request.json();
    if (!rewardId) {
      return NextResponse.json({ error: 'Thiếu ID thưởng' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.REWARD.DELETE,
        { id: rewardId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy thưởng để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockRewards.findIndex((reward) => reward.rewardId === rewardId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy thưởng để xóa' },
          { status: 404 },
        );
      }
      mockRewards.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa thưởng', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa thưởng' },
      { status: 500 },
    );
  }
}

