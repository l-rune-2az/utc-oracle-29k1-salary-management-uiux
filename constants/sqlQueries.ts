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

    UPDATE: `
      UPDATE POSITION
       SET NAME = :name,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE CODE = :code
    `,

    DELETE: `
      DELETE FROM POSITION WHERE CODE = :code
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

    UPDATE: `
      UPDATE EMPLOYEE
       SET FULL_NAME = :fullName,
           BIRTH_DATE = :birthDate,
           GENDER = :gender,
           DEPT_ID = :deptId,
           POSITION_ID = :positionId,
           JOIN_DATE = :joinDate,
           STATUS = :status,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE CODE = :code
    `,

    DELETE: `
      DELETE FROM EMPLOYEE WHERE CODE = :code
    `,
  },

  // ============================================
  // EMPLOYEE_DEPENDENT - Người Phụ Thuộc
  // ============================================
  EMPLOYEE_DEPENDENT: {
    SELECT_BY_EMP: `
      SELECT
          ID AS "dependentId",
          EMP_ID AS "empId",
          FULL_NAME AS "fullName",
          RELATIONSHIP AS "relationship",
          BIRTH_DATE AS "birthDate",
          GENDER AS "gender",
          ID_NUMBER AS "idNumber"
       FROM EMPLOYEE_DEPENDENT
       WHERE EMP_ID = (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode)
       ORDER BY FULL_NAME
    `,

    INSERT: `
      INSERT INTO EMPLOYEE_DEPENDENT (
          ID, EMP_ID, FULL_NAME, RELATIONSHIP, BIRTH_DATE,
          GENDER, ID_NUMBER, CREATED_BY, CREATED_AT
       ) VALUES (
          :id, 
          (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode),
          :fullName, :relationship, :birthDate,
          :gender, :idNumber, 'system', SYSTIMESTAMP
       )
    `,

    UPDATE: `
      UPDATE EMPLOYEE_DEPENDENT
       SET FULL_NAME = :fullName,
           RELATIONSHIP = :relationship,
           BIRTH_DATE = :birthDate,
           GENDER = :gender,
           ID_NUMBER = :idNumber,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id
    `,

    DELETE: `
      DELETE FROM EMPLOYEE_DEPENDENT WHERE ID = :id
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

    UPDATE: `
      UPDATE CONTRACT
       SET EMP_ID = :empId,
           START_DATE = :startDate,
           END_DATE = :endDate,
           FACTOR_ID = :factorId,
           CONTRACT_TYPE = :contractType,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE CODE = :code
    `,

    DELETE: `
      DELETE FROM CONTRACT WHERE CODE = :code
    `,
  },

  // ============================================
  // EMPLOYEE_ALLOWANCE - Phụ Cấp Nhân Viên
  // ============================================
  EMPLOYEE_ALLOWANCE: {
    SELECT_ALL: `
      SELECT
          ea.ID AS "allowanceId",
          e.CODE AS "empId",
          ea.ALLOWANCE_TYPE AS "allowanceType",
          ea.AMOUNT AS "amount",
          NULL AS "startDate",
          NULL AS "endDate",
          ea.DESCRIPTION AS "description",
          'ACTIVE' AS "status"
       FROM EMPLOYEE_ALLOWANCE ea
       INNER JOIN EMPLOYEE e ON ea.EMP_ID = e.ID
       ORDER BY ea.AMOUNT DESC
    `,

    INSERT: `
      INSERT INTO EMPLOYEE_ALLOWANCE (
          ID, EMP_ID, ALLOWANCE_TYPE, AMOUNT,
          DESCRIPTION, CREATED_BY, CREATED_AT
       ) VALUES (
          :id,
          (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode),
          :allowanceType, :amount,
          :description, 'system', SYSTIMESTAMP
       )
    `,

    UPDATE: `
      UPDATE EMPLOYEE_ALLOWANCE
       SET ALLOWANCE_TYPE = :allowanceType,
           AMOUNT = :amount,
           DESCRIPTION = :description,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id
    `,

    DELETE: `
      DELETE FROM EMPLOYEE_ALLOWANCE WHERE ID = :id
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

    SELECT_BY_ID: `
      SELECT
          MIN(ID) AS "attendId",
          EMP_ID AS "empId",
          EXTRACT(MONTH FROM ATTENDANCE_DATE) AS "monthNum",
          EXTRACT(YEAR FROM ATTENDANCE_DATE) AS "yearNum",
          SUM(CASE WHEN IS_WORKING_DAY = 1 THEN 1 ELSE 0 END) AS "workDays",
          SUM(CASE WHEN IS_WORKING_DAY = 0 THEN 1 ELSE 0 END) AS "leaveDays",
          NVL(SUM(OT_HOURS), 0) AS "otHours"
       FROM ATTENDANCE
       WHERE ID = :id
       GROUP BY EMP_ID,
                EXTRACT(YEAR FROM ATTENDANCE_DATE),
                EXTRACT(MONTH FROM ATTENDANCE_DATE)
    `,

    INSERT: `
      INSERT INTO ATTENDANCE (
          ID, EMP_ID, ATTENDANCE_DATE, CHECK_IN_TIME, CHECK_OUT_TIME,
          IS_WORKING_DAY, WORKING_HOURS, OT_HOURS, CREATED_BY, CREATED_AT
       ) VALUES (
          :id,
          (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode),
          :attendanceDate,
          :checkInTime,
          :checkOutTime,
          :isWorkingDay,
          :workingHours,
          :otHours,
          'system',
          SYSTIMESTAMP
       )
    `,

    UPDATE: `
      UPDATE ATTENDANCE
       SET CHECK_IN_TIME = :checkInTime,
           CHECK_OUT_TIME = :checkOutTime,
           IS_WORKING_DAY = :isWorkingDay,
           WORKING_HOURS = :workingHours,
           OT_HOURS = :otHours,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id
    `,

    DELETE_BY_MONTH: `
      DELETE FROM ATTENDANCE
       WHERE EMP_ID = (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode)
         AND EXTRACT(YEAR FROM ATTENDANCE_DATE) = :yearNum
         AND EXTRACT(MONTH FROM ATTENDANCE_DATE) = :monthNum
    `,

    // Note: INSERT được thực hiện qua procedure INSERT_ATTENDANCE_DATA (khuyến nghị)
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

    UPDATE: `
      UPDATE REWARD
       SET EMP_ID = :empId,
           DEPT_ID = :deptId,
           REWARD_TYPE = :rewardType,
           REWARD_DATE = :rewardDate,
           AMOUNT = :amount,
           DESCRIPTION = :description,
           APPROVED_BY = :approvedBy,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id
    `,

    DELETE: `
      DELETE FROM REWARD WHERE ID = :id
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

    UPDATE: `
      UPDATE PENALTY
       SET EMP_ID = :empId,
           PENALTY_TYPE = :penaltyType,
           PENALTY_DATE = :penaltyDate,
           AMOUNT = :amount,
           REASON = :reason,
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :id
    `,

    DELETE: `
      DELETE FROM PENALTY WHERE ID = :id
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

    INSERT_OR_UPDATE: `
      MERGE INTO PAYROLL p
      USING (
        SELECT
          :id AS id,
          (SELECT ID FROM EMPLOYEE WHERE CODE = :empCode) AS emp_id,
          :monthNum AS month_num,
          :yearNum AS year_num,
          :basicSalary AS basic_salary,
          :allowance AS allowance,
          :rewardAmount AS reward_amount,
          :penaltyAmount AS penalty_amount,
          :otSalary AS ot_salary,
          :totalSalary AS total_salary
        FROM DUAL
      ) src
      ON (p.EMP_ID = src.emp_id AND p.MONTH_NUM = src.month_num AND p.YEAR_NUM = src.year_num)
      WHEN MATCHED THEN
        UPDATE SET
          BASIC_SALARY = src.basic_salary,
          ALLOWANCE = src.allowance,
          REWARD_AMOUNT = src.reward_amount,
          PENALTY_AMOUNT = src.penalty_amount,
          OT_SALARY = src.ot_salary,
          TOTAL_SALARY = src.total_salary,
          STATUS = 'UNPAID',
          UPDATED_BY = 'system',
          UPDATED_AT = SYSTIMESTAMP
      WHEN NOT MATCHED THEN
        INSERT (
          ID, EMP_ID, MONTH_NUM, YEAR_NUM,
          BASIC_SALARY, ALLOWANCE, REWARD_AMOUNT, PENALTY_AMOUNT,
          OT_SALARY, TOTAL_SALARY, STATUS,
          CREATED_BY, CREATED_AT
        ) VALUES (
          src.id, src.emp_id, src.month_num, src.year_num,
          src.basic_salary, src.allowance, src.reward_amount, src.penalty_amount,
          src.ot_salary, src.total_salary, 'UNPAID',
          'system', SYSTIMESTAMP
        )
    `,

    CALCULATE_FOR_EMPLOYEE: `
      SELECT
        e.ID AS "empId",
        e.CODE AS "empCode",
        :monthNum AS "monthNum",
        :yearNum AS "yearNum",
        -- Basic Salary từ Contract
        NVL((
          SELECT c.BASE_SALARY * NVL(sf.VALUE, 1)
          FROM CONTRACT c
          LEFT JOIN SALARY_FACTOR_CONFIG sf ON c.FACTOR_ID = sf.ID
          WHERE c.EMP_ID = e.ID
            AND c.STATUS = 'ACTIVE'
            AND (:yearNum * 12 + :monthNum) >= (EXTRACT(YEAR FROM c.START_DATE) * 12 + EXTRACT(MONTH FROM c.START_DATE))
            AND ((:yearNum * 12 + :monthNum) <= (EXTRACT(YEAR FROM c.END_DATE) * 12 + EXTRACT(MONTH FROM c.END_DATE)) OR c.END_DATE IS NULL)
          ORDER BY c.START_DATE DESC
          FETCH FIRST 1 ROWS ONLY
        ), 0) AS "basicSalary",
        -- Allowance
        NVL((
          SELECT SUM(ea.AMOUNT)
          FROM EMPLOYEE_ALLOWANCE ea
          WHERE ea.EMP_ID = e.ID
            AND ea.STATUS = 'ACTIVE'
            AND (:yearNum * 12 + :monthNum) >= (EXTRACT(YEAR FROM ea.START_DATE) * 12 + EXTRACT(MONTH FROM ea.START_DATE))
        ), 0) AS "allowance",
        -- Reward Amount
        NVL((
          SELECT SUM(r.AMOUNT)
          FROM REWARD r
          WHERE (r.EMP_ID = e.ID OR r.DEPT_ID = e.DEPT_ID)
            AND EXTRACT(YEAR FROM r.REWARD_DATE) = :yearNum
            AND EXTRACT(MONTH FROM r.REWARD_DATE) = :monthNum
        ), 0) AS "rewardAmount",
        -- Penalty Amount
        NVL((
          SELECT SUM(p.AMOUNT)
          FROM PENALTY p
          WHERE p.EMP_ID = e.ID
            AND EXTRACT(YEAR FROM p.PENALTY_DATE) = :yearNum
            AND EXTRACT(MONTH FROM p.PENALTY_DATE) = :monthNum
        ), 0) AS "penaltyAmount",
        -- OT Salary từ Attendance
        NVL((
          SELECT SUM(a.OT_HOURS) * (
            SELECT c.BASE_SALARY * NVL(sf.VALUE, 1) / 176
            FROM CONTRACT c
            LEFT JOIN SALARY_FACTOR_CONFIG sf ON c.FACTOR_ID = sf.ID
            WHERE c.EMP_ID = e.ID
              AND c.STATUS = 'ACTIVE'
            ORDER BY c.START_DATE DESC
            FETCH FIRST 1 ROWS ONLY
          ) * 1.5
          FROM ATTENDANCE a
          WHERE a.EMP_ID = e.ID
            AND EXTRACT(YEAR FROM a.ATTENDANCE_DATE) = :yearNum
            AND EXTRACT(MONTH FROM a.ATTENDANCE_DATE) = :monthNum
        ), 0) AS "otSalary"
      FROM EMPLOYEE e
      WHERE e.STATUS = 'ACTIVE'
    `,
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

    INSERT: `
      INSERT INTO SALARY_PAYMENT (
          ID, PAYROLL_ID, PAYMENT_DATE, APPROVED_BY, NOTE,
          CREATED_BY, CREATED_AT
       ) VALUES (
          :id, :payrollId, :paymentDate, :approvedBy, :note,
          'system', SYSTIMESTAMP
       )
    `,

    UPDATE_PAYROLL_STATUS: `
      UPDATE PAYROLL
       SET STATUS = 'PAID',
           UPDATED_BY = 'system',
           UPDATED_AT = SYSTIMESTAMP
       WHERE ID = :payrollId
    `,
  },

  // ============================================
  // REPORTS - Báo Cáo
  // ============================================
  REPORTS: {
    SALARY_REPORT: `
      SELECT
          p.ID AS "payrollId",
          e.CODE AS "empId",
          e.FULL_NAME AS "empName",
          d.NAME AS "deptName",
          pos.NAME AS "positionName",
          p.MONTH_NUM AS "monthNum",
          p.YEAR_NUM AS "yearNum",
          p.BASIC_SALARY AS "basicSalary",
          p.ALLOWANCE AS "allowance",
          p.REWARD_AMOUNT AS "rewardAmount",
          p.PENALTY_AMOUNT AS "penaltyAmount",
          p.OT_SALARY AS "otSalary",
          p.TOTAL_SALARY AS "totalSalary",
          p.STATUS AS "status"
       FROM PAYROLL p
       INNER JOIN EMPLOYEE e ON p.EMP_ID = e.ID
       LEFT JOIN DEPARTMENT d ON e.DEPT_ID = d.ID
       LEFT JOIN POSITION pos ON e.POSITION_ID = pos.ID
       WHERE (:yearNum IS NULL OR p.YEAR_NUM = :yearNum)
         AND (:monthNum IS NULL OR p.MONTH_NUM = :monthNum)
         AND (:empCode IS NULL OR e.CODE = :empCode)
         AND (:deptId IS NULL OR d.CODE = :deptId)
       ORDER BY p.YEAR_NUM DESC, p.MONTH_NUM DESC, e.FULL_NAME
    `,

    ATTENDANCE_REPORT: `
      SELECT
          e.CODE AS "empId",
          e.FULL_NAME AS "empName",
          d.NAME AS "deptName",
          EXTRACT(MONTH FROM a.ATTENDANCE_DATE) AS "monthNum",
          EXTRACT(YEAR FROM a.ATTENDANCE_DATE) AS "yearNum",
          SUM(CASE WHEN a.IS_WORKING_DAY = 1 THEN 1 ELSE 0 END) AS "workDays",
          SUM(CASE WHEN a.IS_WORKING_DAY = 0 THEN 1 ELSE 0 END) AS "leaveDays",
          NVL(SUM(a.OT_HOURS), 0) AS "otHours",
          COUNT(DISTINCT a.ATTENDANCE_DATE) AS "totalDays"
       FROM ATTENDANCE a
       INNER JOIN EMPLOYEE e ON a.EMP_ID = e.ID
       LEFT JOIN DEPARTMENT d ON e.DEPT_ID = d.ID
       WHERE (:yearNum IS NULL OR EXTRACT(YEAR FROM a.ATTENDANCE_DATE) = :yearNum)
         AND (:monthNum IS NULL OR EXTRACT(MONTH FROM a.ATTENDANCE_DATE) = :monthNum)
         AND (:empCode IS NULL OR e.CODE = :empCode)
         AND (:deptId IS NULL OR d.CODE = :deptId)
       GROUP BY e.CODE, e.FULL_NAME, d.NAME,
                EXTRACT(YEAR FROM a.ATTENDANCE_DATE),
                EXTRACT(MONTH FROM a.ATTENDANCE_DATE)
       ORDER BY "yearNum" DESC, "monthNum" DESC, e.FULL_NAME
    `,

    PAYMENT_REPORT: `
      SELECT
          sp.ID AS "paymentId",
          e.CODE AS "empId",
          e.FULL_NAME AS "empName",
          d.NAME AS "deptName",
          p.MONTH_NUM AS "monthNum",
          p.YEAR_NUM AS "yearNum",
          p.TOTAL_SALARY AS "totalSalary",
          sp.PAYMENT_DATE AS "paymentDate",
          sp.APPROVED_BY AS "approvedBy",
          sp.NOTE AS "note"
       FROM SALARY_PAYMENT sp
       INNER JOIN PAYROLL p ON sp.PAYROLL_ID = p.ID
       INNER JOIN EMPLOYEE e ON p.EMP_ID = e.ID
       LEFT JOIN DEPARTMENT d ON e.DEPT_ID = d.ID
       WHERE (:yearNum IS NULL OR p.YEAR_NUM = :yearNum)
         AND (:monthNum IS NULL OR p.MONTH_NUM = :monthNum)
         AND (:empCode IS NULL OR e.CODE = :empCode)
         AND (:deptId IS NULL OR d.CODE = :deptId)
       ORDER BY sp.PAYMENT_DATE DESC NULLS LAST, e.FULL_NAME
    `,
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

