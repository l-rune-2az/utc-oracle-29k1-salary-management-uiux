import { NextRequest, NextResponse } from 'next/server';
import { mockPayrolls } from '@/data/mockData';
import { Payroll } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const payrolls = await OracleService.select<Payroll>(
        `SELECT
            ID AS "payrollId",
            EMP_ID AS "empId",
            MONTH_NUM AS "monthNum",
            YEAR_NUM AS "yearNum",
            BASIC_SALARY AS "basicSalary",
            ALLOWANCE AS "allowance",
            REWARD_AMOUNT AS "rewardAmount",
            PENALTY_AMOUNT AS "penaltyAmount",
            OT_SALARY AS "otSalary",
            TOTAL_SALARY AS "totalSalary",
            STATUS AS "status"
         FROM PAYROLL
         ORDER BY YEAR_NUM DESC, MONTH_NUM DESC`,
      );
      return NextResponse.json(payrolls);
    }

    return NextResponse.json(mockPayrolls);
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
    const data: Payroll = await request.json();

    if (shouldUseOracle()) {
      return NextResponse.json(
        {
          error:
            'Bảng lương được tạo thông qua procedure CALCULATE_PAYROLL (file 009). Vui lòng chạy procedure trên Oracle để sinh dữ liệu chính xác.',
        },
        { status: 501 },
      );
    }

    const newPayroll: Payroll = {
      payrollId: data.payrollId,
      empId: data.empId,
      monthNum: data.monthNum,
      yearNum: data.yearNum,
      basicSalary: data.basicSalary,
      allowance: data.allowance,
      rewardAmount: data.rewardAmount,
      penaltyAmount: data.penaltyAmount,
      otSalary: data.otSalary,
      totalSalary: data.totalSalary,
      status: data.status || 'UNPAID',
    };

    mockPayrolls.push(newPayroll);
    return NextResponse.json(newPayroll, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo bảng lương mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bảng lương mới' },
      { status: 500 },
    );
  }
}

