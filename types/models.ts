// ===========================
// 1. MASTER TABLES (DANH MUC)
// ===========================

export interface Department {
  deptId: string;
  deptName: string;
  location?: string;
}

export interface Position {
  positionId: string;
  positionName: string;
  baseSalary?: number;
}

// ===========================
// 2. EMPLOYEE & CONTRACT
// ===========================

export interface Employee {
  empId: string;
  fullName: string;
  birthDate?: Date | string;
  gender?: number; // 1=Nam, 0=Nu
  deptId?: string;
  positionId?: string;
  joinDate?: Date | string;
  status?: string; // ACTIVE/INACTIVE
}

export interface EmployeeDependent {
  dependentId: string;
  empId: string;
  fullName: string;
  relationship?: string; // Vợ/Chồng/Con/Cha/Mẹ
  birthDate?: Date | string;
  gender?: number; // 1=Nam, 0=Nữ
  idNumber?: string; // Số CMND/CCCD
}

export interface Contract {
  contractId: string;
  empId: string;
  empCode?: string;
  startDate: Date | string;
  endDate?: Date | string;
  salaryFactor?: number;
  contractType?: string;
}

export interface EmployeeAllowance {
  allowanceId: string;
  empId: string;
  allowanceType?: string; // Loại phụ cấp
  amount: number;
  startDate?: Date | string;
  endDate?: Date | string;
  description?: string;
  status?: string; // ACTIVE/INACTIVE
}

// ===========================
// 3. ATTENDANCE & SALARY BASE
// ===========================

export interface Attendance {
  attendId: string;
  empId: string;
  monthNum: number;
  yearNum: number;
  workDays: number;
  leaveDays: number;
  otHours: number;
}

// ===========================
// 4. REWARD & PENALTY
// ===========================

export interface Reward {
  rewardId: string;
  rewardCode?: string;
  empId?: string;
  deptId?: string;
  rewardType?: string;
  rewardDate?: Date | string;
  amount: number;
  description?: string;
  approvedBy?: string;
}

export interface Penalty {
  penaltyId: string;
  penaltyCode?: string;
  empId: string;
  penaltyType?: string;
  penaltyDate?: Date | string;
  amount: number;
  reason?: string;
}

// ===========================
// 5. PAYROLL & PAYMENT
// ===========================

export interface Payroll {
  payrollId: string;
  payrollCode?: string;
  empId: string;
  monthNum: number;
  yearNum: number;
  basicSalary: number;
  allowance: number;
  rewardAmount: number;
  penaltyAmount: number;
  otSalary: number;
  totalSalary: number;
  status?: string; // UNPAID/PAID
}

export interface SalaryPayment {
  paymentId: string;
  paymentCode?: string;
  payrollId: string;
  payrollCode?: string;
  paymentDate?: Date | string;
  approvedBy?: string;
  note?: string;
}

