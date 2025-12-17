import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { EmployeeAllowance } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

// Mock data for development
const mockAllowances: EmployeeAllowance[] = [];

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const allowances = await OracleService.select<EmployeeAllowance>(
        SQL_QUERIES.EMPLOYEE_ALLOWANCE.SELECT_ALL,
      );
      return NextResponse.json(allowances);
    }

    return NextResponse.json(mockAllowances);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phụ cấp', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phụ cấp' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: EmployeeAllowance = await request.json();
    if (!payload.empId || !payload.amount) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên hoặc số tiền phụ cấp' },
        { status: 400 },
      );
    }

    const newAllowance: EmployeeAllowance = {
      allowanceId: payload.allowanceId || randomUUID(),
      empId: payload.empId.trim(),
      allowanceType: payload.allowanceType?.trim(),
      amount: payload.amount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      description: payload.description?.trim(),
      status: payload.status || 'ACTIVE',
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        SQL_QUERIES.EMPLOYEE_ALLOWANCE.INSERT,
        {
          id: newAllowance.allowanceId,
          empCode: newAllowance.empId,
          allowanceType: newAllowance.allowanceType ?? null,
          amount: newAllowance.amount,
          description: newAllowance.description ?? null,
        },
      );
    } else {
      mockAllowances.push(newAllowance);
    }

    return NextResponse.json(newAllowance, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phụ cấp mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phụ cấp mới' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload: EmployeeAllowance = await request.json();
    if (!payload.allowanceId || !payload.amount) {
      return NextResponse.json(
        { error: 'Thiếu ID hoặc số tiền phụ cấp' },
        { status: 400 },
      );
    }

    const updatedAllowance: EmployeeAllowance = {
      allowanceId: payload.allowanceId,
      empId: payload.empId,
      allowanceType: payload.allowanceType?.trim(),
      amount: payload.amount,
      startDate: payload.startDate,
      endDate: payload.endDate,
      description: payload.description?.trim(),
      status: payload.status || 'ACTIVE',
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.EMPLOYEE_ALLOWANCE.UPDATE,
        {
          id: updatedAllowance.allowanceId,
          allowanceType: updatedAllowance.allowanceType ?? null,
          amount: updatedAllowance.amount,
          description: updatedAllowance.description ?? null,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phụ cấp để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockAllowances.findIndex(
        (allowance) => allowance.allowanceId === updatedAllowance.allowanceId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phụ cấp để cập nhật' },
          { status: 404 },
        );
      }
      mockAllowances[index] = updatedAllowance;
    }

    return NextResponse.json(updatedAllowance);
  } catch (error) {
    console.error('Lỗi khi cập nhật phụ cấp', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật phụ cấp' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { allowanceId } = await request.json();
    if (!allowanceId) {
      return NextResponse.json({ error: 'Thiếu ID phụ cấp' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.EMPLOYEE_ALLOWANCE.DELETE,
        { id: allowanceId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phụ cấp để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockAllowances.findIndex((allowance) => allowance.allowanceId === allowanceId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phụ cấp để xóa' },
          { status: 404 },
        );
      }
      mockAllowances.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa phụ cấp', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa phụ cấp' },
      { status: 500 },
    );
  }
}

