/**
 * SQL Queries Constants
 * Tổng hợp tất cả các câu SQL được sử dụng trong hệ thống
 * 
 * Sử dụng: import { SQL_QUERIES } from '@/constants/sqlQueries';
 */

export const SQL_QUERIES = {
  // ============================================
  // DEPARTMENT - Phòng Ban
  // ============================================
  DEPARTMENT: {
    SELECT_ALL: `
      SELECT 
          CODE AS "deptId",
          NAME AS "deptName",
          LOCATION AS "location"
       FROM DEPARTMENT
       ORDER BY NAME
    `,
    
    INSERT: `
      INSERT INTO DEPARTMENT (
          ID, CODE, NAME, LOCATION, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :code, :name, :location, 'system', SYSTIMESTAMP
       )
    `,
    
    UPDATE: `
      UPDATE DEPARTMENT
       SET NAME = :name,
           LOCATION = :location,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE CODE = :code
    `,
    
    DELETE: `
      DELETE FROM DEPARTMENT WHERE CODE = :code
    `,
  },

  // ============================================
  // POSITION - Chức Vụ
  // ============================================
  POSITION: {
    SELECT_ALL: `
      SELECT 
          CODE AS "positionId",
          NAME AS "positionName",
          NULL AS "baseSalary"
       FROM POSITION
       ORDER BY NAME
    `,
    
    INSERT: `
      INSERT INTO POSITION (
          ID, CODE, NAME, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :code, :name, 'system', SYSTIMESTAMP
       )
    `,
  },

  // ============================================
  // EMPLOYEE - Nhân Viên
  // ============================================
  EMPLOYEE: {
    SELECT_ALL: `
      SELECT
          CODE AS "empId",
          FULL_NAME AS "fullName",
          BIRTH_DATE AS "birthDate",
          GENDER AS "gender",
          DEPT_ID AS "deptId",
          POSITION_ID AS "positionId",
          TRUNC(JOIN_DATE) AS "joinDate",
          STATUS AS "status"
       FROM EMPLOYEE
       ORDER BY FULL_NAME
    `,
    
    INSERT: `
      INSERT INTO EMPLOYEE (
          ID, CODE, FULL_NAME, BIRTH_DATE, GENDER, DEPT_ID, POSITION_ID,
          JOIN_DATE, STATUS, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :code, :fullName, :birthDate, :gender, :deptId, :positionId,
          :joinDate, :status, 'system', SYSTIMESTAMP
       )
    `,
  },

  // ============================================
  // CONTRACT - Hợp Đồng
  // ============================================
  CONTRACT: {
    SELECT_ALL: `
      SELECT
          c.CODE AS "contractId",
          c.EMP_ID AS "empId",
          c.START_DATE AS "startDate",
          c.END_DATE AS "endDate",
          f.VALUE AS "salaryFactor",
          c.CONTRACT_TYPE AS "contractType"
       FROM CONTRACT c
       LEFT JOIN SALARY_FACTOR_CONFIG f ON c.FACTOR_ID = f.ID
       ORDER BY c.START_DATE DESC
    `,
    
    SELECT_FACTOR_BY_VALUE: `
      SELECT ID AS "id"
       FROM SALARY_FACTOR_CONFIG
       WHERE VALUE = :value
       FETCH FIRST 1 ROWS ONLY
    `,
    
    INSERT: `
      INSERT INTO CONTRACT (
          ID, CODE, EMP_ID, START_DATE, END_DATE,
          SALARY_TYPE, BASE_SALARY, OFFER_SALARY,
          FACTOR_ID, CONTRACT_TYPE, STATUS,
          CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :code, :empId, :startDate, :endDate,
          :salaryType, :baseSalary, :offerSalary,
          :factorId, :contractType, 'ACTIVE',
          'system', SYSTIMESTAMP
       )
    `,
  },

  // ============================================
  // ATTENDANCE - Chấm Công
  // ============================================
  ATTENDANCE: {
    SELECT_SUMMARY: `
      SELECT
          MIN(ID) AS "attendId",
          EMP_ID AS "empId",
          EXTRACT(MONTH FROM ATTENDANCE_DATE) AS "monthNum",
          EXTRACT(YEAR FROM ATTENDANCE_DATE) AS "yearNum",
          SUM(CASE WHEN IS_WORKING_DAY = 1 THEN 1 ELSE 0 END) AS "workDays",
          SUM(CASE WHEN IS_WORKING_DAY = 0 THEN 1 ELSE 0 END) AS "leaveDays",
          NVL(SUM(OT_HOURS), 0) AS "otHours"
       FROM ATTENDANCE
       GROUP BY EMP_ID,
                EXTRACT(YEAR FROM ATTENDANCE_DATE),
                EXTRACT(MONTH FROM ATTENDANCE_DATE)
       ORDER BY "yearNum" DESC, "monthNum" DESC
    `,
    
    // Note: INSERT được thực hiện qua procedure INSERT_ATTENDANCE_DATA
  },

  // ============================================
  // REWARD - Thưởng
  // ============================================
  REWARD: {
    SELECT_ALL: `
      SELECT
          ID AS "rewardId",
          EMP_ID AS "empId",
          DEPT_ID AS "deptId",
          REWARD_TYPE AS "rewardType",
          REWARD_DATE AS "rewardDate",
          AMOUNT AS "amount",
          DESCRIPTION AS "description",
          APPROVED_BY AS "approvedBy"
       FROM REWARD
       ORDER BY REWARD_DATE DESC NULLS LAST
    `,
    
    INSERT: `
      INSERT INTO REWARD (
          ID, EMP_ID, DEPT_ID, REWARD_TYPE, REWARD_DATE,
          AMOUNT, DESCRIPTION, APPROVED_BY, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :empId, :deptId, :rewardType, :rewardDate,
          :amount, :description, :approvedBy, 'system', SYSTIMESTAMP
       )
    `,
  },

  // ============================================
  // PENALTY - Phạt
  // ============================================
  PENALTY: {
    SELECT_ALL: `
      SELECT
          ID AS "penaltyId",
          EMP_ID AS "empId",
          PENALTY_TYPE AS "penaltyType",
          PENALTY_DATE AS "penaltyDate",
          AMOUNT AS "amount",
          REASON AS "reason"
       FROM PENALTY
       ORDER BY PENALTY_DATE DESC NULLS LAST
    `,
    
    INSERT: `
      INSERT INTO PENALTY (
          ID, EMP_ID, PENALTY_TYPE, PENALTY_DATE,
          AMOUNT, REASON, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :empId, :penaltyType, :penaltyDate,
          :amount, :reason, 'system', SYSTIMESTAMP
       )
    `,
  },

  // ============================================
  // PAYROLL - Bảng Lương
  // ============================================
  PAYROLL: {
    SELECT_ALL: `
      SELECT
          ID AS "payrollId",
          EMP_ID AS "empId",
          MONTH_NUM AS "monthNum",
          YEAR_NUM AS "yearNum",
          BASIC_SALARY AS "basicSalary",
          ALLOWANCE AS "allowance",
          REWARD_AMOUNT AS "rewardAmount",
          PENALTY_AMOUNT AS "penaltyAmount",
          OT_SALARY AS "otSalary",
          TOTAL_SALARY AS "totalSalary",
          STATUS AS "status"
       FROM PAYROLL
       ORDER BY YEAR_NUM DESC, MONTH_NUM DESC
    `,
    
    // Note: INSERT/UPDATE được thực hiện qua procedure CALCULATE_PAYROLL
  },

  // ============================================
  // SALARY_PAYMENT - Phiếu Chi
  // ============================================
  SALARY_PAYMENT: {
    SELECT_ALL: `
      SELECT
          ID AS "paymentId",
          PAYROLL_ID AS "payrollId",
          PAYMENT_DATE AS "paymentDate",
          APPROVED_BY AS "approvedBy",
          NOTE AS "note"
       FROM SALARY_PAYMENT
       ORDER BY PAYMENT_DATE DESC NULLS LAST
    `,
    
    // Note: INSERT được thực hiện qua procedure CREATE_SALARY_PAYMENT
  },

  // ============================================
  // STORED PROCEDURES
  // ============================================
  PROCEDURES: {
    INSERT_ATTENDANCE_DATA: 'INSERT_ATTENDANCE_DATA',
    CALCULATE_WORKING_SALARY: 'CALCULATE_WORKING_SALARY',
    CALCULATE_OT_SALARY: 'CALCULATE_OT_SALARY',
    CALCULATE_INSURANCE_TAX: 'CALCULATE_INSURANCE_TAX',
    CALCULATE_PAYROLL: 'CALCULATE_PAYROLL',
    CREATE_SALARY_PAYMENT: 'CREATE_SALARY_PAYMENT',
  },
} as const;

/**
 * Helper function để lấy SQL query theo module và action
 */
export function getSqlQuery(
  module: keyof typeof SQL_QUERIES,
  action: string,
): string {
  const moduleQueries = SQL_QUERIES[module] as Record<string, string>;
  if (!moduleQueries || !moduleQueries[action]) {
    throw new Error(`SQL query not found: ${module}.${action}`);
  }
  return moduleQueries[action];
}

