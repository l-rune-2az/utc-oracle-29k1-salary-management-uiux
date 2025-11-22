import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockPenalties } from '@/data/mockData';
import { Penalty } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const penalties = await OracleService.select<Penalty>(
        `SELECT
            ID AS "penaltyId",
            EMP_ID AS "empId",
            PENALTY_TYPE AS "penaltyType",
            PENALTY_DATE AS "penaltyDate",
            AMOUNT AS "amount",
            REASON AS "reason"
         FROM PENALTY
         ORDER BY PENALTY_DATE DESC NULLS LAST`,
      );
      return NextResponse.json(penalties);
    }

    return NextResponse.json(mockPenalties);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phạt', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phạt' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Penalty = await request.json();
    if (!payload.empId || !payload.amount) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên hoặc số tiền phạt' },
        { status: 400 },
      );
    }

    const newPenalty: Penalty = {
      penaltyId: payload.penaltyId || randomUUID(),
      empId: payload.empId,
      penaltyType: payload.penaltyType,
      penaltyDate: payload.penaltyDate,
      amount: payload.amount,
      reason: payload.reason,
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        `INSERT INTO PENALTY (
            ID, EMP_ID, PENALTY_TYPE, PENALTY_DATE,
            AMOUNT, REASON, CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :empId, :penaltyType, :penaltyDate,
            :amount, :reason, 'system', SYSTIMESTAMP
         )`,
        {
          id: newPenalty.penaltyId,
          empId: newPenalty.empId,
          penaltyType: newPenalty.penaltyType ?? null,
          penaltyDate: newPenalty.penaltyDate ? new Date(newPenalty.penaltyDate) : null,
          amount: newPenalty.amount,
          reason: newPenalty.reason ?? null,
        },
      );
    } else {
      mockPenalties.push(newPenalty);
    }

    return NextResponse.json(newPenalty, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phạt mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phạt mới' },
      { status: 500 },
    );
  }
}

