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
    if (shouldUseOracle()) {
      const employees = await OracleService.select<Employee>(
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
         ORDER BY FULL_NAME`,
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

