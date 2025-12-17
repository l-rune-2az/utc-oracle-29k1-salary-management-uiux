import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockDepartments } from '@/data/mockData';
import { Department } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const departments = await OracleService.select<Department>(
        SQL_QUERIES.DEPARTMENT.SELECT_ALL,
      );
      return NextResponse.json(departments);
    }

    return NextResponse.json(mockDepartments);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng ban', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phòng ban' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Department = await request.json();
    if (!payload.deptId || !payload.deptName) {
      return NextResponse.json(
        { error: 'Thiếu mã hoặc tên phòng ban' },
        { status: 400 },
      );
    }

    const newDepartment: Department = {
      deptId: payload.deptId.trim(),
      deptName: payload.deptName.trim(),
      location: payload.location?.trim(),
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        SQL_QUERIES.DEPARTMENT.INSERT,
        {
          id: randomUUID(),
          code: newDepartment.deptId,
          name: newDepartment.deptName,
          location: newDepartment.location ?? null,
        },
      );
    } else {
      mockDepartments.push(newDepartment);
    }

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phòng ban mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phòng ban mới' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload: Department = await request.json();
    if (!payload.deptId || !payload.deptName) {
      return NextResponse.json(
        { error: 'Thiếu mã hoặc tên phòng ban' },
        { status: 400 },
      );
    }

    const updatedDepartment: Department = {
      deptId: payload.deptId.trim(),
      deptName: payload.deptName.trim(),
      location: payload.location?.trim(),
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.DEPARTMENT.UPDATE,
        {
          name: updatedDepartment.deptName,
          location: updatedDepartment.location ?? null,
          code: updatedDepartment.deptId,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phòng ban để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockDepartments.findIndex(
        (dept) => dept.deptId === updatedDepartment.deptId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phòng ban để cập nhật' },
          { status: 404 },
        );
      }
      mockDepartments[index] = updatedDepartment;
    }

    return NextResponse.json(updatedDepartment);
  } catch (error) {
    console.error('Lỗi khi cập nhật phòng ban', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật phòng ban' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { deptId } = await request.json();
    if (!deptId) {
      return NextResponse.json({ error: 'Thiếu mã phòng ban' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.DEPARTMENT.DELETE,
        { code: deptId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy phòng ban để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockDepartments.findIndex((dept) => dept.deptId === deptId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy phòng ban để xóa' },
          { status: 404 },
        );
      }
      mockDepartments.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa phòng ban', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa phòng ban' },
      { status: 500 },
    );
  }
}

