import { NextRequest, NextResponse } from 'next/server';
import { mockAttendances } from '@/data/mockData';
import { Attendance } from '@/types/models';
import { OracleService } from '@/services/oracleService';
import { serverConfig } from '@/config/serverConfig';
import { isOracleConfigured } from '@/lib/oracle';
import { SQL_QUERIES } from '@/constants/sqlQueries';

const shouldUseOracle = () => !serverConfig.useMockData && isOracleConfigured();

export async function GET() {
  try {
    if (shouldUseOracle()) {
      const attendanceSummary = await OracleService.select<Attendance>(
        SQL_QUERIES.ATTENDANCE.SELECT_SUMMARY,
      );
      return NextResponse.json(attendanceSummary);
    }

    return NextResponse.json(mockAttendances);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chấm công', error);
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách chấm công' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Attendance = await request.json();

    if (shouldUseOracle()) {
      return NextResponse.json(
        {
          error:
            'API chấm công đang chờ kết nối trực tiếp với procedure INSERT_ATTENDANCE_DATA. Vui lòng import file 005 và chạy procedure trên Oracle.',
        },
        { status: 501 },
      );
    }

    const newAttendance: Attendance = {
      attendId: data.attendId,
      empId: data.empId,
      monthNum: data.monthNum,
      yearNum: data.yearNum,
      workDays: data.workDays,
      leaveDays: data.leaveDays,
      otHours: data.otHours,
    };

    mockAttendances.push(newAttendance);
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    console.error('Lỗi khi tạo bản ghi chấm công', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bản ghi chấm công' },
      { status: 500 },
    );
  }
}

