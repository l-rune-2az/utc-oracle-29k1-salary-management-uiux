import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { EmployeeDependent } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

// Mock data for development
const mockDependents: EmployeeDependent[] = [];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const empCode = searchParams.get('empCode');
    
    if (!empCode) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên' },
        { status: 400 },
      );
    }

    if (shouldUseOracle()) {
      const dependents = await OracleService.select<EmployeeDependent>(
        SQL_QUERIES.EMPLOYEE_DEPENDENT.SELECT_BY_EMP,
        { empCode },
      );
      return NextResponse.json(dependents);
    }

    const filtered = mockDependents.filter((dep) => dep.empId === empCode);
    return NextResponse.json(filtered);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người phụ thuộc', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách người phụ thuộc' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: EmployeeDependent = await request.json();
    if (!payload.empId || !payload.fullName) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên hoặc họ tên người phụ thuộc' },
        { status: 400 },
      );
    }

    const newDependent: EmployeeDependent = {
      dependentId: payload.dependentId || randomUUID(),
      empId: payload.empId.trim(),
      fullName: payload.fullName.trim(),
      relationship: payload.relationship?.trim(),
      birthDate: payload.birthDate,
      gender: payload.gender,
      idNumber: payload.idNumber?.trim(),
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        SQL_QUERIES.EMPLOYEE_DEPENDENT.INSERT,
        {
          id: newDependent.dependentId,
          empCode: newDependent.empId,
          fullName: newDependent.fullName,
          relationship: newDependent.relationship ?? null,
          birthDate: newDependent.birthDate ? new Date(newDependent.birthDate) : null,
          gender: newDependent.gender ?? null,
          idNumber: newDependent.idNumber ?? null,
        },
      );
    } else {
      mockDependents.push(newDependent);
    }

    return NextResponse.json(newDependent, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo người phụ thuộc mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo người phụ thuộc mới' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload: EmployeeDependent = await request.json();
    if (!payload.dependentId || !payload.fullName) {
      return NextResponse.json(
        { error: 'Thiếu ID hoặc họ tên người phụ thuộc' },
        { status: 400 },
      );
    }

    const updatedDependent: EmployeeDependent = {
      dependentId: payload.dependentId,
      empId: payload.empId,
      fullName: payload.fullName.trim(),
      relationship: payload.relationship?.trim(),
      birthDate: payload.birthDate,
      gender: payload.gender,
      idNumber: payload.idNumber?.trim(),
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.EMPLOYEE_DEPENDENT.UPDATE,
        {
          id: updatedDependent.dependentId,
          fullName: updatedDependent.fullName,
          relationship: updatedDependent.relationship ?? null,
          birthDate: updatedDependent.birthDate ? new Date(updatedDependent.birthDate) : null,
          gender: updatedDependent.gender ?? null,
          idNumber: updatedDependent.idNumber ?? null,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy người phụ thuộc để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockDependents.findIndex(
        (dep) => dep.dependentId === updatedDependent.dependentId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy người phụ thuộc để cập nhật' },
          { status: 404 },
        );
      }
      mockDependents[index] = updatedDependent;
    }

    return NextResponse.json(updatedDependent);
  } catch (error) {
    console.error('Lỗi khi cập nhật người phụ thuộc', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật người phụ thuộc' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { dependentId } = await request.json();
    if (!dependentId) {
      return NextResponse.json({ error: 'Thiếu ID người phụ thuộc' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.EMPLOYEE_DEPENDENT.DELETE,
        { id: dependentId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy người phụ thuộc để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockDependents.findIndex((dep) => dep.dependentId === dependentId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy người phụ thuộc để xóa' },
          { status: 404 },
        );
      }
      mockDependents.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa người phụ thuộc', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa người phụ thuộc' },
      { status: 500 },
    );
  }
}

