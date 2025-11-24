import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockEmployees } from '@/data/mockData';
import { Employee } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    let employees: Employee[] = [];
    
    if (shouldUseOracle()) {
      const result = await OracleService.select<Employee>(
        `SELECT
            CODE AS "empId",
            FULL_NAME AS "fullName",
            BIRTH_DATE AS "birthDate",
            GENDER AS "gender",
            DEPT_ID AS "deptId",
            POSITION_ID AS "positionId",
            TRUNC(JOIN_DATE) AS "joinDate",
            STATUS AS "status"
         FROM EMPLOYEE
         ORDER BY CREATED_AT DESC, FULL_NAME`,
      );
      // Đảm bảo result là array
      employees = Array.isArray(result) ? result : [];
    } else {
      employees = Array.isArray(mockEmployees) ? mockEmployees : [];
    }

    return NextResponse.json(employees);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên', error);
    // Trả về array rỗng thay vì object lỗi
    return NextResponse.json([], { status: 500 });
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
        `INSERT INTO EMPLOYEE (
            ID, CODE, FULL_NAME, BIRTH_DATE, GENDER, DEPT_ID, POSITION_ID,
            JOIN_DATE, STATUS, CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :code, :fullName, :birthDate, :gender, :deptId, :positionId,
            :joinDate, :status, 'system', SYSTIMESTAMP
         )`,
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
        `UPDATE EMPLOYEE
         SET FULL_NAME = :fullName,
             BIRTH_DATE = :birthDate,
             GENDER = :gender,
             DEPT_ID = :deptId,
             POSITION_ID = :positionId,
             JOIN_DATE = :joinDate,
             STATUS = :status,
             UPDATED_BY = 'system',
             UPDATED_AT = SYSTIMESTAMP
         WHERE CODE = :code`,
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
    const body = await request.json();
    const empId = body.empId;
    
    if (!empId) {
      return NextResponse.json({ error: 'Thiếu mã nhân viên' }, { status: 400 });
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        'DELETE FROM EMPLOYEE WHERE CODE = :code',
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

