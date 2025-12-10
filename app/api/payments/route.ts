import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockSalaryPayments } from '@/data/mockData';
import { SalaryPayment } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const payments = await OracleService.select<SalaryPayment>(
        SQL_QUERIES.SALARY_PAYMENT.SELECT_ALL,
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
    const payload: SalaryPayment = await request.json();
    if (!payload.payrollId) {
      return NextResponse.json(
        { error: 'Thiếu ID bảng lương' },
        { status: 400 },
      );
    }

    const newPayment: SalaryPayment = {
      paymentId: payload.paymentId || randomUUID(),
      payrollId: payload.payrollId,
      paymentDate: payload.paymentDate || new Date().toISOString(),
      approvedBy: payload.approvedBy,
      note: payload.note,
    };

    if (shouldUseOracle()) {
      // Insert phiếu chi
      await OracleService.insert(
        SQL_QUERIES.SALARY_PAYMENT.INSERT,
        {
          id: newPayment.paymentId,
          payrollId: newPayment.payrollId,
          paymentDate: newPayment.paymentDate ? new Date(newPayment.paymentDate) : new Date(),
          approvedBy: newPayment.approvedBy ?? null,
          note: newPayment.note ?? null,
        },
      );

      // Cập nhật trạng thái bảng lương thành PAID
      await OracleService.update(
        SQL_QUERIES.SALARY_PAYMENT.UPDATE_PAYROLL_STATUS,
        { payrollId: newPayment.payrollId },
      );
    } else {
      mockSalaryPayments.push(newPayment);
    }

    return NextResponse.json(newPayment, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo phiếu chi lương mới', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo phiếu chi lương mới' },
      { status: 500 },
    );
  }
}

