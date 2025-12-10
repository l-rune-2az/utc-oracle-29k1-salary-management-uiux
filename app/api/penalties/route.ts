import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockPenalties } from '@/data/mockData';
import { Penalty } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const penalties = await OracleService.select<Penalty>(
        SQL_QUERIES.PENALTY.SELECT_ALL,
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
        SQL_QUERIES.PENALTY.INSERT,
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

export async function PUT(request: NextRequest) {
  try {
    const payload: Penalty = await request.json();
    if (!payload.penaltyId || !payload.empId || !payload.amount) {
      return NextResponse.json(
        { error: 'Thiếu ID, mã nhân viên hoặc số tiền phạt' },
        { status: 400 },
      );
    }

    const updatedPenalty: Penalty = {
      penaltyId: payload.penaltyId,
      empId: payload.empId,
      penaltyType: payload.penaltyType,
      penaltyDate: payload.penaltyDate,
      amount: payload.amount,
      reason: payload.reason,
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.PENALTY.UPDATE,
        {
          id: updatedPenalty.penaltyId,
          empId: updatedPenalty.empId,
          penaltyType: updatedPenalty.penaltyType ?? null,
          penaltyDate: updatedPenalty.penaltyDate ? new Date(updatedPenalty.penaltyDate) : null,
          amount: updatedPenalty.amount,
          reason: updatedPenalty.reason ?? null,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phạt để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockPenalties.findIndex(
        (penalty) => penalty.penaltyId === updatedPenalty.penaltyId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phạt để cập nhật' },
          { status: 404 },
        );
      }
      mockPenalties[index] = updatedPenalty;
    }

    return NextResponse.json(updatedPenalty);
  } catch (error) {
    console.error('Lỗi khi cập nhật phạt', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật phạt' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { penaltyId } = await request.json();
    if (!penaltyId) {
      return NextResponse.json({ error: 'Thiếu ID phạt' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.PENALTY.DELETE,
        { id: penaltyId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phạt để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockPenalties.findIndex((penalty) => penalty.penaltyId === penaltyId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phạt để xóa' },
          { status: 404 },
        );
      }
      mockPenalties.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa phạt', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa phạt' },
      { status: 500 },
    );
  }
}

