import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockContracts } from '@/data/mockData';
import { Contract } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

const resolveFactorId = async (salaryFactor?: number) => {
  if (!shouldUseOracle() || salaryFactor === undefined || salaryFactor === null) {
    return null;
  }

  const factorRecords = await OracleService.select<{ id: string }>(
    SQL_QUERIES.CONTRACT.SELECT_FACTOR_BY_VALUE,
    { value: salaryFactor },
  );
  return factorRecords[0]?.id ?? null;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const contracts = await OracleService.select<Contract>(
        SQL_QUERIES.CONTRACT.SELECT_ALL,
      );
      return NextResponse.json(contracts);
    }

    return NextResponse.json(mockContracts);
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
        SQL_QUERIES.CONTRACT.INSERT,
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

