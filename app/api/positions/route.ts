import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockPositions } from '@/data/mockData';
import { Position } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const positions = await OracleService.select<Position>(
        `SELECT 
            CODE AS "positionId",
            NAME AS "positionName",
            NULL AS "baseSalary"
         FROM POSITION
         ORDER BY NAME`,
      );
      return NextResponse.json(positions);
    }

    return NextResponse.json(mockPositions);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chức vụ', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách chức vụ' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Position = await request.json();
    if (!payload.positionId || !payload.positionName) {
      return NextResponse.json(
        { error: 'Thiếu mã hoặc tên chức vụ' },
        { status: 400 },
      );
    }

    const newPosition: Position = {
      positionId: payload.positionId.trim(),
      positionName: payload.positionName.trim(),
      baseSalary: payload.baseSalary,
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        `INSERT INTO POSITION (
            ID, CODE, NAME, CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :code, :name, 'system', SYSTIMESTAMP
         )`,
        {
          id: randomUUID(),
          code: newPosition.positionId,
          name: newPosition.positionName,
        },
      );
    } else {
      mockPositions.push(newPosition);
    }

    return NextResponse.json(newPosition, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo chức vụ mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo chức vụ mới' },
      { status: 500 },
    );
  }
}

