import { NextRequest, NextResponse } from 'next/server';
import { mockSalaryPayments } from '@/data/mockData';
import { SalaryPayment } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

const formatDateCode = (value?: Date | string) => {
  if (!value) return '00000000';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '00000000';
  }
  return parsed.toISOString().slice(0, 10).replace(/-/g, '');
};

const buildPaymentCode = (payment: Pick<SalaryPayment, 'paymentId' | 'paymentDate'>) => {
  const idSegment = String(payment.paymentId ?? '000000')
    .replace(/[^A-Za-z0-9]/g, '')
    .padEnd(6, '0')
    .slice(0, 6)
    .toUpperCase();
  return `PM-${formatDateCode(payment.paymentDate)}-${idSegment}`;
};

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const payments = await OracleService.select<SalaryPayment>(
        `SELECT
            sp.ID AS "paymentId",
            'PM-' || NVL(TO_CHAR(sp.PAYMENT_DATE, 'YYYYMMDD'), '00000000') || '-' ||
              SUBSTR(sp.ID, 1, 6) AS "paymentCode",
            sp.PAYROLL_ID AS "payrollId",
            CASE
              WHEN pr.ID IS NOT NULL THEN
                'PR-' || TO_CHAR(pr.YEAR_NUM) || LPAD(TO_CHAR(pr.MONTH_NUM), 2, '0') || '-' ||
                  COALESCE(e.CODE, SUBSTR(pr.EMP_ID, 1, 6), SUBSTR(pr.ID, 1, 6))
              ELSE NULL
            END AS "payrollCode",
            sp.PAYMENT_DATE AS "paymentDate",
            sp.APPROVED_BY AS "approvedBy",
            sp.NOTE AS "note"
         FROM SALARY_PAYMENT sp
         LEFT JOIN PAYROLL pr ON pr.ID = sp.PAYROLL_ID
         LEFT JOIN EMPLOYEE e ON e.ID = pr.EMP_ID
         ORDER BY sp.PAYMENT_DATE DESC NULLS LAST`,
      );
      return NextResponse.json(payments);
    }

    const mapped = mockSalaryPayments.map((item) => ({
      ...item,
      paymentCode: item.paymentCode ?? buildPaymentCode(item),
      payrollCode: item.payrollCode ?? item.payrollId,
    }));

    return NextResponse.json(mapped);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phiếu chi lương', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách phiếu chi lương' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: SalaryPayment = await request.json();

    if (shouldUseOracle()) {
      return NextResponse.json(
        {
          error:
            'Phiếu chi được tạo qua procedure CREATE_SALARY_PAYMENT (file 010). Vui lòng chạy procedure này để đồng bộ dữ liệu.',
        },
        { status: 501 },
      );
    }

    const newPayment: SalaryPayment = {
      paymentId: data.paymentId,
      payrollId: data.payrollId,
      paymentDate: data.paymentDate,
      approvedBy: data.approvedBy,
      note: data.note,
    };

    mockSalaryPayments.push(newPayment);
    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phiếu chi lương mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phiếu chi lương mới' },
      { status: 500 },
    );
  }
}

