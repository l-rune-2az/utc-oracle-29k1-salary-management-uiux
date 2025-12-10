import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockEmployees } from '@/data/mockData';
import { Employee } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const employees = await OracleService.select<Employee>(
        SQL_QUERIES.EMPLOYEE.SELECT_ALL,
      );
      return NextResponse.json(employees);
    }

    return NextResponse.json(mockEmployees);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách nhân viên' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Employee = await request.json();
    if (!payload.empId || !payload.fullName) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên hoặc họ tên' },
        { status: 400 },
      );
    }

    const newEmployee: Employee = {
      empId: payload.empId.trim(),
      fullName: payload.fullName.trim(),
      birthDate: payload.birthDate,
      gender: payload.gender,
      deptId: payload.deptId,
      positionId: payload.positionId,
      joinDate: payload.joinDate,
      status: payload.status || 'ACTIVE',
    };

    if (shouldUseOracle()) {
      await OracleService.insert(
        SQL_QUERIES.EMPLOYEE.INSERT,
        {
          id: randomUUID(),
          code: newEmployee.empId,
          fullName: newEmployee.fullName,
          birthDate: newEmployee.birthDate ? new Date(newEmployee.birthDate) : null,
          gender: newEmployee.gender ?? null,
          deptId: newEmployee.deptId ?? null,
          positionId: newEmployee.positionId ?? null,
          joinDate: newEmployee.joinDate ? new Date(newEmployee.joinDate) : null,
          status: newEmployee.status,
        },
      );
    } else {
      mockEmployees.push(newEmployee);
    }

    return NextResponse.json(newEmployee, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo nhân viên mới' },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload: Employee = await request.json();
    if (!payload.empId || !payload.fullName) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên hoặc họ tên' },
        { status: 400 },
      );
    }

    const updatedEmployee: Employee = {
      empId: payload.empId.trim(),
      fullName: payload.fullName.trim(),
      birthDate: payload.birthDate,
      gender: payload.gender,
      deptId: payload.deptId,
      positionId: payload.positionId,
      joinDate: payload.joinDate,
      status: payload.status || 'ACTIVE',
    };

    if (shouldUseOracle()) {
      const affected = await OracleService.update(
        SQL_QUERIES.EMPLOYEE.UPDATE,
        {
          fullName: updatedEmployee.fullName,
          birthDate: updatedEmployee.birthDate ? new Date(updatedEmployee.birthDate) : null,
          gender: updatedEmployee.gender ?? null,
          deptId: updatedEmployee.deptId ?? null,
          positionId: updatedEmployee.positionId ?? null,
          joinDate: updatedEmployee.joinDate ? new Date(updatedEmployee.joinDate) : null,
          status: updatedEmployee.status,
          code: updatedEmployee.empId,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy nhân viên để cập nhật' },
          { status: 404 },
        );
      }
    } else {
      const index = mockEmployees.findIndex(
        (emp) => emp.empId === updatedEmployee.empId,
      );
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy nhân viên để cập nhật' },
          { status: 404 },
        );
      }
      mockEmployees[index] = updatedEmployee;
    }

    return NextResponse.json(updatedEmployee);
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật nhân viên' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { empId } = await request.json();
    if (!empId) {
      return NextResponse.json({ error: 'Thiếu mã nhân viên' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.EMPLOYEE.DELETE,
        { code: empId },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy nhân viên để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockEmployees.findIndex((emp) => emp.empId === empId);
      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy nhân viên để xóa' },
          { status: 404 },
        );
      }
      mockEmployees.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa nhân viên' },
      { status: 500 },
    );
  }
}

