import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockPayrolls } from '@/data/mockData';
import { Payroll } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

const buildPayrollCode = (yearNum: number, monthNum: number, identifier?: string) => {
  const monthPart = String(monthNum ?? '').padStart(2, '0');
  const normalizedIdentifier = String(identifier ?? '000000')
    .replace(/[^A-Za-z0-9]/g, '')
    .padEnd(6, '0')
    .slice(0, 6)
    .toUpperCase();
  return `PR-${yearNum}${monthPart}-${normalizedIdentifier}`;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const payrolls = await OracleService.select<Payroll>(
        SQL_QUERIES.PAYROLL.SELECT_ALL,
      );
      return NextResponse.json(payrolls);
    }

    const mapped = mockPayrolls.map((item) => ({
      ...item,
      payrollCode: item.payrollCode ?? buildPayrollCode(item.yearNum, item.monthNum, item.empId),
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách bảng lương', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách bảng lương' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload: { monthNum: number; yearNum: number; empId?: string } = await request.json();

    if (!payload.monthNum || !payload.yearNum) {
      return NextResponse.json(
        { error: 'Thiếu tháng hoặc năm' },
        { status: 400 },
      );
    }

    if (shouldUseOracle()) {
      // Tính toán bảng lương cho tất cả nhân viên hoặc một nhân viên cụ thể
      const calculatedPayrolls = await OracleService.select<{
        empId: string;
        empCode: string;
        monthNum: number;
        yearNum: number;
        basicSalary: number;
        allowance: number;
        rewardAmount: number;
        penaltyAmount: number;
        otSalary: number;
      }>(
        SQL_QUERIES.PAYROLL.CALCULATE_FOR_EMPLOYEE,
        {
          monthNum: payload.monthNum,
          yearNum: payload.yearNum,
        },
      );

      const results: Payroll[] = [];

      for (const calc of calculatedPayrolls) {
        // Lọc theo empId nếu có
        if (payload.empId && calc.empCode !== payload.empId) {
          continue;
        }

        const totalSalary =
          calc.basicSalary +
          calc.allowance +
          calc.rewardAmount -
          calc.penaltyAmount +
          calc.otSalary;

        const payrollId = randomUUID();

        // Insert hoặc Update bảng lương
        await OracleService.execute(
          SQL_QUERIES.PAYROLL.INSERT_OR_UPDATE,
          {
            id: payrollId,
            empCode: calc.empCode,
            monthNum: calc.monthNum,
            yearNum: calc.yearNum,
            basicSalary: calc.basicSalary,
            allowance: calc.allowance,
            rewardAmount: calc.rewardAmount,
            penaltyAmount: calc.penaltyAmount,
            otSalary: calc.otSalary,
            totalSalary: totalSalary,
          },
        );

        results.push({
          payrollId,
          empId: calc.empCode,
          monthNum: calc.monthNum,
          yearNum: calc.yearNum,
          basicSalary: calc.basicSalary,
          allowance: calc.allowance,
          rewardAmount: calc.rewardAmount,
          penaltyAmount: calc.penaltyAmount,
          otSalary: calc.otSalary,
          totalSalary: totalSalary,
          status: 'UNPAID',
        });
      }

      return NextResponse.json(
        {
          message: `Đã tính bảng lương cho ${results.length} nhân viên`,
          payrolls: results,
        },
        { status: 201 },
      );
    }

    // Mock data fallback
    const newPayroll: Payroll = {
      payrollId: randomUUID(),
      empId: payload.empId || 'EMP001',
      monthNum: payload.monthNum,
      yearNum: payload.yearNum,
      basicSalary: 15000000,
      allowance: 2000000,
      rewardAmount: 1000000,
      penaltyAmount: 0,
      otSalary: 500000,
      totalSalary: 18500000,
      status: 'UNPAID',
    };

    mockPayrolls.push(newPayroll);

    return NextResponse.json(
      {
        message: `Đã tính bảng lương cho 1 nhân viên`,
        payrolls: [newPayroll],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Lỗi khi tính bảng lương', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Lỗi khi tính bảng lương: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}

