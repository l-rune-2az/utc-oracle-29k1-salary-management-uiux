import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { mockSalaryPayments } from '@/data/mockData';
import { SalaryPayment } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

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
        SQL_QUERIES.SALARY_PAYMENT.SELECT_ALL,
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

