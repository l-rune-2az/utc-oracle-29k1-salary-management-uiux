import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockDepartments } from '@/data/mockData';
import { Department } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const departments = await OracleService.select<Department>(
        `SELECT 
            CODE AS "deptId",
            NAME AS "deptName",
            LOCATION AS "location"
         FROM DEPARTMENT
         ORDER BY CREATED_AT DESC, NAME`,
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
        `INSERT INTO DEPARTMENT (
            ID, CODE, NAME, LOCATION, CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :code, :name, :location, 'system', SYSTIMESTAMP
         )`,
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
        `UPDATE DEPARTMENT
         SET NAME = :name,
             LOCATION = :location,
             UPDATED_BY = 'system',
             UPDATED_AT = SYSTIMESTAMP
         WHERE CODE = :code`,
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
        'DELETE FROM DEPARTMENT WHERE CODE = :code',
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

