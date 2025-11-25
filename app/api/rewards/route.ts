import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockRewards } from '@/data/mockData';
import { Reward } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

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
        `SELECT
            r.ID AS "rewardId",
            'RW-' || NVL(TO_CHAR(r.REWARD_DATE, 'YYYYMMDD'), '00000000') || '-' ||
              SUBSTR(r.ID, 1, 6) AS "rewardCode",
            COALESCE(e.CODE, r.EMP_ID) AS "empId",
            COALESCE(d.CODE, r.DEPT_ID) AS "deptId",
            r.REWARD_TYPE AS "rewardType",
            r.REWARD_DATE AS "rewardDate",
            r.AMOUNT AS "amount",
            r.DESCRIPTION AS "description",
            r.APPROVED_BY AS "approvedBy"
         FROM REWARD r
         LEFT JOIN EMPLOYEE e ON e.ID = r.EMP_ID
         LEFT JOIN DEPARTMENT d ON d.ID = r.DEPT_ID
         ORDER BY r.REWARD_DATE DESC NULLS LAST`,
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
        `INSERT INTO REWARD (
            ID, EMP_ID, DEPT_ID, REWARD_TYPE, REWARD_DATE,
            AMOUNT, DESCRIPTION, APPROVED_BY, CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :empId, :deptId, :rewardType, :rewardDate,
            :amount, :description, :approvedBy, 'system', SYSTIMESTAMP
         )`,
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

