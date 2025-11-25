import { NextRequest, NextResponse } from 'next/server';
import { mockPayrolls } from '@/data/mockData';
import { Payroll } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

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
        `SELECT
            p.ID AS "payrollId",
            'PR-' || TO_CHAR(p.YEAR_NUM) || LPAD(TO_CHAR(p.MONTH_NUM), 2, '0') || '-' ||
              COALESCE(e.CODE, SUBSTR(p.EMP_ID, 1, 6), SUBSTR(p.ID, 1, 6)) AS "payrollCode",
            COALESCE(e.CODE, p.EMP_ID) AS "empId",
            p.MONTH_NUM AS "monthNum",
            p.YEAR_NUM AS "yearNum",
            p.BASIC_SALARY AS "basicSalary",
            p.ALLOWANCE AS "allowance",
            p.REWARD_AMOUNT AS "rewardAmount",
            p.PENALTY_AMOUNT AS "penaltyAmount",
            p.OT_SALARY AS "otSalary",
            p.TOTAL_SALARY AS "totalSalary",
            p.STATUS AS "status"
         FROM PAYROLL p
         LEFT JOIN EMPLOYEE e ON e.ID = p.EMP_ID
         ORDER BY p.YEAR_NUM DESC, p.MONTH_NUM DESC`,
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

