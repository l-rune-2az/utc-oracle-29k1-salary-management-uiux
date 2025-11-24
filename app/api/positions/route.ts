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
         ORDER BY CREATED_AT DESC, NAME`,
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

export async function PUT(request: NextRequest) {
  try {
    const payload: Position = await request.json();
    if (!payload.positionId || !payload.positionName) {
      return NextResponse.json(
        { error: 'Thiếu mã hoặc tên chức vụ' },
        { status: 400 },
      );
    }

    const updatedPosition: Position = {
      positionId: payload.positionId.trim(),
      positionName: payload.positionName.trim(),
      baseSalary: payload.baseSalary,
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        `UPDATE POSITION
         SET NAME = :name,
             UPDATED_BY = 'system',
             UPDATED_AT = SYSTIMESTAMP
         WHERE CODE = :code`,
        {
          name: updatedPosition.positionName,
          code: updatedPosition.positionId,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy chức vụ để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockPositions.findIndex(
        (pos) => pos.positionId === updatedPosition.positionId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy chức vụ để cập nhật' },
          { status: 404 },
        );
      }
      mockPositions[index] = updatedPosition;
    }

    return NextResponse.json(updatedPosition);
  } catch (error) {
    console.error('Lỗi khi cập nhật chức vụ', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật chức vụ' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const positionId = body.positionId;
    
    if (!positionId) {
      return NextResponse.json({ error: 'Thiếu mã chức vụ' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        'DELETE FROM POSITION WHERE CODE = :code',
        { code: positionId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy chức vụ để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockPositions.findIndex((pos) => pos.positionId === positionId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy chức vụ để xóa' },
          { status: 404 },
        );
      }
      mockPositions.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa chức vụ', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa chức vụ' },
      { status: 500 },
    );
  }
}

