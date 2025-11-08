import {
  Department,
  Position,
  Employee,
  Contract,
  Attendance,
  Reward,
  Penalty,
  Payroll,
  SalaryPayment,
} from '@/types/models';

// ===========================
// 1. MASTER TABLES
// ===========================

export const mockDepartments: Department[] = [
  { deptId: 'DEPT001', deptName: 'Phòng Nhân Sự', location: 'Tầng 3' },
  { deptId: 'DEPT002', deptName: 'Phòng Kế Toán', location: 'Tầng 2' },
  { deptId: 'DEPT003', deptName: 'Phòng IT', location: 'Tầng 4' },
  { deptId: 'DEPT004', deptName: 'Phòng Kinh Doanh', location: 'Tầng 1' },
  { deptId: 'DEPT005', deptName: 'Phòng Marketing', location: 'Tầng 2' },
];

export const mockPositions: Position[] = [
  { positionId: 'POS001', positionName: 'Giám Đốc', baseSalary: 50000000 },
  { positionId: 'POS002', positionName: 'Trưởng Phòng', baseSalary: 30000000 },
  { positionId: 'POS003', positionName: 'Phó Phòng', baseSalary: 25000000 },
  { positionId: 'POS004', positionName: 'Nhân Viên', baseSalary: 15000000 },
  { positionId: 'POS005', positionName: 'Thực Tập Sinh', baseSalary: 5000000 },
];

// ===========================
// 2. EMPLOYEE & CONTRACT
// ===========================

export const mockEmployees: Employee[] = [
  {
    empId: 'EMP001',
    fullName: 'Nguyễn Văn A',
    birthDate: '1990-05-15',
    gender: 1,
    deptId: 'DEPT001',
    positionId: 'POS002',
    joinDate: '2020-01-15',
    status: 'ACTIVE',
  },
  {
    empId: 'EMP002',
    fullName: 'Trần Thị B',
    birthDate: '1992-08-20',
    gender: 0,
    deptId: 'DEPT002',
    positionId: 'POS004',
    joinDate: '2021-03-10',
    status: 'ACTIVE',
  },
  {
    empId: 'EMP003',
    fullName: 'Lê Văn C',
    birthDate: '1988-12-05',
    gender: 1,
    deptId: 'DEPT003',
    positionId: 'POS002',
    joinDate: '2019-06-01',
    status: 'ACTIVE',
  },
  {
    empId: 'EMP004',
    fullName: 'Phạm Thị D',
    birthDate: '1995-03-25',
    gender: 0,
    deptId: 'DEPT004',
    positionId: 'POS004',
    joinDate: '2022-01-20',
    status: 'ACTIVE',
  },
  {
    empId: 'EMP005',
    fullName: 'Hoàng Văn E',
    birthDate: '1993-07-10',
    gender: 1,
    deptId: 'DEPT003',
    positionId: 'POS004',
    joinDate: '2021-09-15',
    status: 'ACTIVE',
  },
];

export const mockContracts: Contract[] = [
  {
    contractId: 'CT001',
    empId: 'EMP001',
    startDate: '2020-01-15',
    endDate: '2025-01-14',
    salaryFactor: 1.5,
    contractType: 'Chính thức',
  },
  {
    contractId: 'CT002',
    empId: 'EMP002',
    startDate: '2021-03-10',
    endDate: '2024-03-09',
    salaryFactor: 1.2,
    contractType: 'Chính thức',
  },
  {
    contractId: 'CT003',
    empId: 'EMP003',
    startDate: '2019-06-01',
    endDate: '2024-05-31',
    salaryFactor: 1.5,
    contractType: 'Chính thức',
  },
  {
    contractId: 'CT004',
    empId: 'EMP004',
    startDate: '2022-01-20',
    endDate: '2023-01-19',
    salaryFactor: 1.0,
    contractType: 'Thử việc',
  },
  {
    contractId: 'CT005',
    empId: 'EMP005',
    startDate: '2021-09-15',
    endDate: '2024-09-14',
    salaryFactor: 1.2,
    contractType: 'Chính thức',
  },
];

// ===========================
// 3. ATTENDANCE
// ===========================

export const mockAttendances: Attendance[] = [
  {
    attendId: 'ATT001',
    empId: 'EMP001',
    monthNum: 11,
    yearNum: 2024,
    workDays: 22,
    leaveDays: 2,
    otHours: 10.5,
  },
  {
    attendId: 'ATT002',
    empId: 'EMP002',
    monthNum: 11,
    yearNum: 2024,
    workDays: 20,
    leaveDays: 4,
    otHours: 5.0,
  },
  {
    attendId: 'ATT003',
    empId: 'EMP003',
    monthNum: 11,
    yearNum: 2024,
    workDays: 23,
    leaveDays: 1,
    otHours: 15.0,
  },
  {
    attendId: 'ATT004',
    empId: 'EMP004',
    monthNum: 11,
    yearNum: 2024,
    workDays: 21,
    leaveDays: 3,
    otHours: 8.0,
  },
  {
    attendId: 'ATT005',
    empId: 'EMP005',
    monthNum: 11,
    yearNum: 2024,
    workDays: 22,
    leaveDays: 2,
    otHours: 12.0,
  },
];

// ===========================
// 4. REWARD & PENALTY
// ===========================

export const mockRewards: Reward[] = [
  {
    rewardId: 'RW001',
    empId: 'EMP001',
    rewardType: 'Thưởng dự án',
    rewardDate: '2024-11-15',
    amount: 5000000,
    description: 'Hoàn thành tốt dự án Q4',
    approvedBy: 'Giám đốc Nguyễn Văn X',
  },
  {
    rewardId: 'RW002',
    empId: 'EMP003',
    rewardType: 'Thưởng cá nhân',
    rewardDate: '2024-11-20',
    amount: 3000000,
    description: 'Nhân viên xuất sắc tháng 11',
    approvedBy: 'Trưởng phòng Lê Văn Y',
  },
  {
    rewardId: 'RW003',
    deptId: 'DEPT003',
    rewardType: 'Thưởng phòng ban',
    rewardDate: '2024-11-25',
    amount: 10000000,
    description: 'Phòng IT hoàn thành tốt nhiệm vụ',
    approvedBy: 'Giám đốc Nguyễn Văn X',
  },
];

export const mockPenalties: Penalty[] = [
  {
    penaltyId: 'PN001',
    empId: 'EMP002',
    penaltyType: 'Đi muộn',
    penaltyDate: '2024-11-10',
    amount: 200000,
    reason: 'Đi muộn 3 lần trong tháng',
  },
  {
    penaltyId: 'PN002',
    empId: 'EMP004',
    penaltyType: 'Nghỉ không phép',
    penaltyDate: '2024-11-18',
    amount: 500000,
    reason: 'Nghỉ 1 ngày không báo trước',
  },
];

// ===========================
// 5. PAYROLL & PAYMENT
// ===========================

export const mockPayrolls: Payroll[] = [
  {
    payrollId: 'PR001',
    empId: 'EMP001',
    monthNum: 11,
    yearNum: 2024,
    basicSalary: 45000000,
    allowance: 2000000,
    rewardAmount: 5000000,
    penaltyAmount: 0,
    otSalary: 3150000,
    totalSalary: 55150000,
    status: 'PAID',
  },
  {
    payrollId: 'PR002',
    empId: 'EMP002',
    monthNum: 11,
    yearNum: 2024,
    basicSalary: 18000000,
    allowance: 1000000,
    rewardAmount: 0,
    penaltyAmount: 200000,
    otSalary: 1050000,
    totalSalary: 18800000,
    status: 'PAID',
  },
  {
    payrollId: 'PR003',
    empId: 'EMP003',
    monthNum: 11,
    yearNum: 2024,
    basicSalary: 45000000,
    allowance: 2000000,
    rewardAmount: 3000000,
    penaltyAmount: 0,
    otSalary: 4725000,
    totalSalary: 54725000,
    status: 'UNPAID',
  },
  {
    payrollId: 'PR004',
    empId: 'EMP004',
    monthNum: 11,
    yearNum: 2024,
    basicSalary: 15000000,
    allowance: 500000,
    rewardAmount: 0,
    penaltyAmount: 500000,
    otSalary: 1400000,
    totalSalary: 15500000,
    status: 'UNPAID',
  },
  {
    payrollId: 'PR005',
    empId: 'EMP005',
    monthNum: 11,
    yearNum: 2024,
    basicSalary: 18000000,
    allowance: 1000000,
    rewardAmount: 0,
    penaltyAmount: 0,
    otSalary: 2520000,
    totalSalary: 21520000,
    status: 'UNPAID',
  },
];

export const mockSalaryPayments: SalaryPayment[] = [
  {
    paymentId: 'PM001',
    payrollId: 'PR001',
    paymentDate: '2024-12-01',
    approvedBy: 'Kế toán trưởng Trần Thị Z',
    note: 'Thanh toán đầy đủ tháng 11/2024',
  },
  {
    paymentId: 'PM002',
    payrollId: 'PR002',
    paymentDate: '2024-12-01',
    approvedBy: 'Kế toán trưởng Trần Thị Z',
    note: 'Thanh toán đầy đủ tháng 11/2024',
  },
];

