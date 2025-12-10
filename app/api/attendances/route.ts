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
    if (!data.empId || !data.monthNum || !data.yearNum) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên, tháng hoặc năm' },
        { status: 400 },
      );
    }

    if (shouldUseOracle()) {
      // Note: Khuyến nghị sử dụng procedure INSERT_ATTENDANCE_DATA để đảm bảo tính toán chính xác
      // Tuy nhiên, có thể insert dữ liệu cơ bản nếu cần
      return NextResponse.json(
        {
          error:
            'Khuyến nghị sử dụng procedure INSERT_ATTENDANCE_DATA để tạo dữ liệu chấm công. Vui lòng import file 005 và chạy procedure trên Oracle.',
          note: 'Có thể sử dụng mock data để test',
        },
        { status: 501 },
      );
    }

    const newAttendance: Attendance = {
      attendId: data.attendId || `ATT_${data.empId}_${data.yearNum}_${data.monthNum}`,
      empId: data.empId,
      monthNum: data.monthNum,
      yearNum: data.yearNum,
      workDays: data.workDays || 0,
      leaveDays: data.leaveDays || 0,
      otHours: data.otHours || 0,
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

export async function PUT(request: NextRequest) {
  try {
    const payload: Attendance = await request.json();
    if (!payload.empId || !payload.monthNum || !payload.yearNum) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên, tháng hoặc năm' },
        { status: 400 },
      );
    }

    // Note: Cập nhật chấm công thực tế phức tạp vì đây là dữ liệu tổng hợp
    // Trong thực tế, nên sử dụng procedure để tính lại
    if (shouldUseOracle()) {
      return NextResponse.json(
        {
          error:
            'Cập nhật chấm công nên được thực hiện qua procedure INSERT_ATTENDANCE_DATA để đảm bảo tính toán chính xác.',
        },
        { status: 501 },
      );
    }

    const index = mockAttendances.findIndex(
      (att) =>
        att.empId === payload.empId &&
        att.monthNum === payload.monthNum &&
        att.yearNum === payload.yearNum,
    );

    if (index === -1) {
      return NextResponse.json(
        { error: 'Không tìm thấy bản ghi chấm công để cập nhật' },
        { status: 404 },
      );
    }

    mockAttendances[index] = {
      ...mockAttendances[index],
      workDays: payload.workDays ?? mockAttendances[index].workDays,
      leaveDays: payload.leaveDays ?? mockAttendances[index].leaveDays,
      otHours: payload.otHours ?? mockAttendances[index].otHours,
    };

    return NextResponse.json(mockAttendances[index]);
  } catch (error) {
    console.error('Lỗi khi cập nhật chấm công', error);
    return NextResponse.json(
      { error: 'Lỗi khi cập nhật chấm công' },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { empId, monthNum, yearNum } = await request.json();
    if (!empId || !monthNum || !yearNum) {
      return NextResponse.json(
        { error: 'Thiếu mã nhân viên, tháng hoặc năm' },
        { status: 400 },
      );
    }

    if (shouldUseOracle()) {
      const affected = await OracleService.delete(
        SQL_QUERIES.ATTENDANCE.DELETE_BY_MONTH,
        {
          empCode: empId,
          monthNum,
          yearNum,
        },
      );

      if (affected === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy bản ghi chấm công để xóa' },
          { status: 404 },
        );
      }
    } else {
      const index = mockAttendances.findIndex(
        (att) =>
          att.empId === empId &&
          att.monthNum === monthNum &&
          att.yearNum === yearNum,
      );

      if (index === -1) {
        return NextResponse.json(
          { error: 'Không tìm thấy bản ghi chấm công để xóa' },
          { status: 404 },
        );
      }

      mockAttendances.splice(index, 1);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi xóa chấm công', error);
    return NextResponse.json(
      { error: 'Lỗi khi xóa chấm công' },
      { status: 500 },
    );
  }
}

