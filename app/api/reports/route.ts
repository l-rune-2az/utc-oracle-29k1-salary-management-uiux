import { NextRequest, NextResponse } from 'next/server';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type'); // salary, attendance, payment
    const yearNum = searchParams.get('yearNum');
    const monthNum = searchParams.get('monthNum');
    const empCode = searchParams.get('empCode');
    const deptId = searchParams.get('deptId');

    if (!reportType) {
      return NextResponse.json(
        { error: 'Thiếu loại báo cáo' },
        { status: 400 },
      );
    }

    if (shouldUseOracle()) {
      let query: string;
      const bindParams: Record<string, any> = {
        yearNum: yearNum ? Number(yearNum) : null,
        monthNum: monthNum ? Number(monthNum) : null,
        empCode: empCode || null,
        deptId: deptId || null,
      };

      switch (reportType) {
        case 'salary':
          query = SQL_QUERIES.REPORTS.SALARY_REPORT;
          break;
        case 'attendance':
          query = SQL_QUERIES.REPORTS.ATTENDANCE_REPORT;
          break;
        case 'payment':
          query = SQL_QUERIES.REPORTS.PAYMENT_REPORT;
          break;
        default:
          return NextResponse.json(
            { error: 'Loại báo cáo không hợp lệ' },
            { status: 400 },
          );
      }

      const results = await OracleService.select(query, bindParams);
      return NextResponse.json(results);
    }

    // Mock data fallback
    return NextResponse.json([]);
  } catch (error) {
    console.error('Lỗi khi lấy báo cáo', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy báo cáo: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}

