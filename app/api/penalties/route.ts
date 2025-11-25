import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockPenalties } from '@/data/mockData';
import { Penalty } from '@/types/models';
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

const buildPenaltyCode = (penalty: Pick<Penalty, 'penaltyId' | 'penaltyDate'>) => {
  const idSegment = String(penalty.penaltyId ?? '000000')
    .replace(/[^A-Za-z0-9]/g, '')
    .padEnd(6, '0')
    .slice(0, 6)
    .toUpperCase();
  return `PN-${formatDateCode(penalty.penaltyDate)}-${idSegment}`;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const penalties = await OracleService.select<Penalty>(
        `SELECT
            pn.ID AS "penaltyId",
            'PN-' || NVL(TO_CHAR(pn.PENALTY_DATE, 'YYYYMMDD'), '00000000') || '-' ||
              SUBSTR(pn.ID, 1, 6) AS "penaltyCode",
            COALESCE(e.CODE, pn.EMP_ID) AS "empId",
            pn.PENALTY_TYPE AS "penaltyType",
            pn.PENALTY_DATE AS "penaltyDate",
            pn.AMOUNT AS "amount",
            pn.REASON AS "reason"
         FROM PENALTY pn
         LEFT JOIN EMPLOYEE e ON e.ID = pn.EMP_ID
         ORDER BY pn.PENALTY_DATE DESC NULLS LAST`,
      );
      return NextResponse.json(penalties);
    }

    const mapped = mockPenalties.map((item) => ({
      ...item,
      penaltyCode: item.penaltyCode ?? buildPenaltyCode(item),
    }));

    return NextResponse.json(mapped);
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

