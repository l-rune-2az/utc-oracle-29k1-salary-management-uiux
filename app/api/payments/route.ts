import { NextRequest, NextResponse } from 'next/server';
import { mockSalaryPayments } from '@/data/mockData';
import { SalaryPayment } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const payments = await OracleService.select<SalaryPayment>(
        `SELECT
            ID AS "paymentId",
            PAYROLL_ID AS "payrollId",
            PAYMENT_DATE AS "paymentDate",
            APPROVED_BY AS "approvedBy",
            NOTE AS "note"
         FROM SALARY_PAYMENT
         ORDER BY PAYMENT_DATE DESC NULLS LAST`,
      );
      return NextResponse.json(payments);
    }

    return NextResponse.json(mockSalaryPayments);
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

