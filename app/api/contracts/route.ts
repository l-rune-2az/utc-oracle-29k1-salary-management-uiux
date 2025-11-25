import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockContracts } from '@/data/mockData';
import { Contract } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

const resolveFactorId = async (salaryFactor?: number) => {
  if (!shouldUseOracle() || salaryFactor === undefined || salaryFactor === null) {
    return null;
  }

  const factorRecords = await OracleService.select<{ id: string }>(
    `SELECT ID AS "id"
     FROM SALARY_FACTOR_CONFIG
     WHERE VALUE = :value
     FETCH FIRST 1 ROWS ONLY`,
    { value: salaryFactor },
  );
  return factorRecords[0]?.id ?? null;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const contracts = await OracleService.select<Contract>(
        `SELECT
            c.CODE AS "contractId",
            c.EMP_ID AS "empId",
            e.CODE AS "empCode",
            c.START_DATE AS "startDate",
            c.END_DATE AS "endDate",
            f.VALUE AS "salaryFactor",
            c.CONTRACT_TYPE AS "contractType"
         FROM CONTRACT c
         LEFT JOIN EMPLOYEE e ON e.ID = c.EMP_ID
         LEFT JOIN SALARY_FACTOR_CONFIG f ON c.FACTOR_ID = f.ID
         ORDER BY c.START_DATE DESC`,
      );
      return NextResponse.json(contracts);
    }

    const mapped = mockContracts.map((item) => ({
      ...item,
      empCode: item.empCode ?? item.empId,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách hợp đồng', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách hợp đồng' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: Contract = await request.json();
    if (!payload.contractId || !payload.empId || !payload.startDate) {
      return NextResponse.json(
        { error: 'Thiếu mã hợp đồng, nhân viên hoặc ngày bắt đầu' },
        { status: 400 },
      );
    }

    const newContract: Contract = {
      contractId: payload.contractId.trim(),
      empId: payload.empId.trim(),
      startDate: payload.startDate,
      endDate: payload.endDate,
      salaryFactor: payload.salaryFactor,
      contractType: payload.contractType,
    };

    if (shouldUseOracle()) {
      const factorId = await resolveFactorId(newContract.salaryFactor);
      await OracleService.insert(
        `INSERT INTO CONTRACT (
            ID, CODE, EMP_ID, START_DATE, END_DATE,
            SALARY_TYPE, BASE_SALARY, OFFER_SALARY,
            FACTOR_ID, CONTRACT_TYPE, STATUS,
            CREATED_BY, CREATED_AT
         ) VALUES (
            :id, :code, :empId, :startDate, :endDate,
            :salaryType, :baseSalary, :offerSalary,
            :factorId, :contractType, 'ACTIVE',
            'system', SYSTIMESTAMP
         )`,
        {
          id: randomUUID(),
          code: newContract.contractId,
          empId: newContract.empId,
          startDate: newContract.startDate ? new Date(newContract.startDate) : null,
          endDate: newContract.endDate ? new Date(newContract.endDate) : null,
          salaryType: 'GROSS',
          baseSalary: 0,
          offerSalary: 0,
          factorId,
          contractType: newContract.contractType ?? 'Chính thức',
        },
      );
    } else {
      mockContracts.push(newContract);
    }

    return NextResponse.json(newContract, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo hợp đồng mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo hợp đồng mới' },
      { status: 500 },
    );
  }
}

