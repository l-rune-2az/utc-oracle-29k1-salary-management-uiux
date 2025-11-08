import { NextRequest, NextResponse } from 'next/server';
import { mockAttendances } from '@/data/mockData';
import { Attendance } from '@/types/models';

// TODO: Thay thế mock data bằng Oracle database calls

export async function GET(request: NextRequest) {
  try {
    // TODO: Thay bằng query Oracle
    return NextResponse.json(mockAttendances);
  } catch (error) {
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách chấm công' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: Attendance = await request.json();
    
    // TODO: Thay bằng insert Oracle
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
    return NextResponse.json(
      { error: 'Lỗi khi tạo bản ghi chấm công' },
      { status: 500 }
    );
  }
}

