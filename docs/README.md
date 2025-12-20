# HỆ THỐNG QUẢN LÝ LƯƠNG - SALARY MANAGEMENT SYSTEM

## 1. GIỚI THIỆU

Hệ thống quản lý lương được xây dựng trên Oracle Database, hỗ trợ tính toán lương tự động cho nhân viên dựa trên:
- Chấm công hàng ngày
- Hợp đồng lao động (thử việc/chính thức)
- Phụ cấp, thưởng, phạt
- Bảo hiểm xã hội (BHXH, BHTN, BHYT)
- Thuế thu nhập cá nhân (TNCN) theo bậc lũy kế
- Tăng ca (OT) với hệ số khác nhau theo ngày

## 2. KIẾN TRÚC VÀ THIẾT KẾ

### 2.1. Kiến trúc tổng quan

Hệ thống được chia thành các module chính:

1. **Master Data Module**: Quản lý dữ liệu cấu hình (phòng ban, chức vụ, hệ số lương, thuế, bảo hiểm, ngày lễ)
2. **Employee & Contract Module**: Quản lý nhân viên và hợp đồng lao động
3. **Attendance Module**: Quản lý chấm công hàng ngày với tính toán tự động
4. **Payroll Calculation Module**: Tính toán lương theo 3 giai đoạn
5. **Payment Module**: Tạo phiếu chi lương

### 2.2. Cấu trúc file SQL

Các file SQL được đánh số thứ tự để thực thi theo đúng thứ tự:

```
000-create-tablespace.sql          # Tạo tablespace
001-create-salary-table.sql        # Tạo tất cả các bảng
002-insert-master-data.sql         # Insert dữ liệu master (config, ngày lễ)
003-insert-sample-data.sql         # Insert dữ liệu mẫu (nhân viên, hợp đồng, phụ cấp, thưởng/phạt)
004-create-attendance-triggers.sql # Trigger tự động tính giờ làm việc và OT
005-create-insert-attendance-procedure.sql # Procedure tạo dữ liệu chấm công
006-calculate-working-salary-procedure.sql # Procedure tính lương theo công và phụ cấp
007-calculate-ot-salary-procedure.sql      # Procedure tính lương OT
008-calculate-insurance-tax-procedure.sql  # Procedure tính bảo hiểm và thuế
009-calculate-payroll-procedure.sql        # Procedure chính tính lương (gọi 3 procedure con)
010-create-salary-payment-procedure.sql    # Procedure tạo phiếu chi lương
```

## 3. ERD - MỐI QUAN HỆ GIỮA CÁC BẢNG

### 3.1. Sơ đồ quan hệ

```
┌─────────────────┐
│   DEPARTMENT    │
│  (Phòng ban)    │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐         ┌─────────────────┐
│    EMPLOYEE     │────────▶│    POSITION     │
│   (Nhân viên)   │    N    │    (Chức vụ)    │
└────────┬────────┘   1      └─────────────────┘
         │ 1
         │
         │ N
┌────────▼────────┐
│    CONTRACT     │
│   (Hợp đồng)    │
└────────┬────────┘
         │ 1
         │
         │ N
┌────────▼────────┐         ┌─────────────────┐
│  EMPLOYEE_      │────────▶│ ALLOWANCE_CONFIG │
│  ALLOWANCE      │    N    │  (Cấu hình      │
│  (Phụ cấp NV)   │   1    │   phụ cấp)      │
└─────────────────┘         └─────────────────┘

┌────────┬────────┐
│EMPLOYEE│        │
└───┬────┘        │
    │ 1           │
    │             │
    │ N           │
┌───▼─────────────▼───┐
│   EMPLOYEE_         │
│   DEPENDENT         │
│   (Người phụ thuộc)  │
└─────────────────────┘

┌────────┬────────┐
│EMPLOYEE│        │
└───┬────┘        │
    │ 1           │
    │             │
    │ N           │
┌───▼─────────────▼───┐
│     ATTENDANCE       │
│     (Chấm công)      │
│  [Partitioned by     │
│   ATTENDANCE_DATE]   │
└─────────────────────┘

┌────────┬────────┐
│EMPLOYEE│        │
└───┬────┘        │
    │ 1           │
    │             │
    │ N           │
┌───▼─────────────▼───┐         ┌──────────────┐
│      REWARD          │         │  DEPARTMENT  │
│      (Thưởng)        │────────▶│  (Phòng ban) │
└─────────────────────┘    N    └──────────────┘

┌────────┬────────┐
│EMPLOYEE│        │
└───┬────┘        │
    │ 1           │
    │             │
    │ N           │
┌───▼─────────────▼───┐
│      PENALTY         │
│      (Phạt)          │
└─────────────────────┘

┌────────┬────────┐
│EMPLOYEE│        │
└───┬────┘        │
    │ 1           │
    │             │
    │ N           │
┌───▼─────────────▼───┐         ┌─────────────────┐
│      PAYROLL         │────────▶│ SALARY_PAYMENT  │
│    (Bảng lương)      │   1:1  │  (Phiếu chi)    │
└─────────────────────┘         └─────────────────┘

┌─────────────────────┐
│ SALARY_FACTOR_CONFIG │
│  (Cấu hình hệ số)    │
└─────────────────────┘

┌─────────────────────┐
│    TAX_CONFIG        │
│  (Cấu hình thuế)     │
└─────────────────────┘

┌─────────────────────┐
│  INSURANCE_CONFIG    │
│  (Cấu hình BH)      │
└─────────────────────┘

┌─────────────────────┐
│      HOLIDAY         │
│     (Ngày lễ)        │
└─────────────────────┘
```

### 3.2. Mối quan hệ chi tiết

#### 3.2.1. Master Tables (Bảng cấu hình)

**DEPARTMENT** (Phòng ban)
- Quan hệ: 1-N với EMPLOYEE (một phòng ban có nhiều nhân viên)
- Quan hệ: 1-N với REWARD (một phòng ban có thể có nhiều thưởng)

**POSITION** (Chức vụ)
- Quan hệ: 1-N với EMPLOYEE (một chức vụ có nhiều nhân viên)

**SALARY_FACTOR_CONFIG** (Cấu hình hệ số lương)
- Chứa các hệ số: PROBATION (0.85), OFFICIAL (1.00), OT (1.5), OT_SUN (2.0), OT_HOL (3.0)
- Quan hệ: 1-N với CONTRACT (qua FACTOR_ID)

**TAX_CONFIG** (Cấu hình thuế TNCN)
- Chứa 7 bậc thuế với PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION, TAX_RATE
- Được sử dụng trong tính toán thuế

**INSURANCE_CONFIG** (Cấu hình bảo hiểm)
- Chứa tỷ lệ BHXH, BHTN, BHYT theo loại hợp đồng
- Quan hệ: N-1 với CONTRACT (qua CONTRACT_TYPE)

**ALLOWANCE_CONFIG** (Cấu hình phụ cấp)
- Quan hệ: 1-N với EMPLOYEE_ALLOWANCE (qua ALLOWANCE_ID)

**HOLIDAY** (Ngày lễ)
- Được sử dụng trong tính toán OT để xác định hệ số OT ngày lễ

#### 3.2.2. Employee & Contract Tables

**EMPLOYEE** (Nhân viên)
- Quan hệ: N-1 với DEPARTMENT (qua DEPT_ID)
- Quan hệ: N-1 với POSITION (qua POSITION_ID)
- Quan hệ: 1-N với CONTRACT (một nhân viên có nhiều hợp đồng)
- Quan hệ: 1-N với EMPLOYEE_DEPENDENT (một nhân viên có nhiều người phụ thuộc)
- Quan hệ: 1-N với ATTENDANCE (một nhân viên có nhiều bản ghi chấm công)
- Quan hệ: 1-N với EMPLOYEE_ALLOWANCE (một nhân viên có nhiều phụ cấp)
- Quan hệ: 1-N với REWARD (một nhân viên có nhiều thưởng)
- Quan hệ: 1-N với PENALTY (một nhân viên có nhiều phạt)
- Quan hệ: 1-N với PAYROLL (một nhân viên có nhiều bảng lương)

**EMPLOYEE_DEPENDENT** (Người phụ thuộc)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)
- Được sử dụng để tính giảm trừ thuế

**CONTRACT** (Hợp đồng)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)
- Quan hệ: N-1 với SALARY_FACTOR_CONFIG (qua FACTOR_ID)
- Chứa: BASE_SALARY (để tính bảo hiểm), OFFER_SALARY (lương thực tế), SALARY_TYPE (GROSS/NET), CONTRACT_TYPE (Thử việc/Chính thức)

**EMPLOYEE_ALLOWANCE** (Phụ cấp nhân viên)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)
- Quan hệ: N-1 với CONTRACT (qua CONTRACT_ID) - optional
- Quan hệ: N-1 với ALLOWANCE_CONFIG (qua ALLOWANCE_ID)
- Có EFFECTIVE_FROM và EFFECTIVE_TO để xác định thời gian hiệu lực

#### 3.2.3. Attendance Table

**ATTENDANCE** (Chấm công)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)
- **Partitioned by RANGE (ATTENDANCE_DATE) INTERVAL (1 MONTH)**: Phân vùng theo tháng để tối ưu hiệu năng
- **UNIQUE constraint**: (EMP_ID, ATTENDANCE_DATE) - mỗi nhân viên chỉ có 1 bản ghi chấm công trong 1 ngày
- Các trường tự động tính: WORK_HOURS, NORMAL_HOURS, OT_HOURS, IS_WORKING_DAY (qua trigger)
- Logic tính OT:
  - Nếu IS_WORKING_DAY = 0 (thứ 7/chủ nhật): Tất cả giờ làm việc = OT_HOURS
  - Nếu IS_WORKING_DAY = 1 và END_TIME >= 18:00 và WORK_HOURS >= 8: NORMAL_HOURS = 8, OT_HOURS = WORK_HOURS - 8
  - Ngược lại: NORMAL_HOURS = WORK_HOURS, OT_HOURS = 0

#### 3.2.4. Reward & Penalty Tables

**REWARD** (Thưởng)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID) - optional
- Quan hệ: N-1 với DEPARTMENT (qua DEPT_ID) - optional
- Có thể thưởng cho nhân viên hoặc phòng ban

**PENALTY** (Phạt)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)

#### 3.2.5. Payroll & Payment Tables

**PAYROLL** (Bảng lương)
- Quan hệ: N-1 với EMPLOYEE (qua EMP_ID)
- Quan hệ: 1-1 với SALARY_PAYMENT (qua PAYROLL_ID)
- Lưu trữ:
  - BASIC_SALARY: BASE_SALARY từ CONTRACT (dùng để tính bảo hiểm)
  - OFFER_SALARY: OFFER_SALARY từ CONTRACT (lương offer thực tế)
  - WORKING_SALARY: Lương theo công (được tính nhưng không lưu riêng, nằm trong TOTAL_SALARY)
  - OT_HOURS, OT_SALARY: Tổng giờ OT và lương OT
  - ALLOWANCE, REWARD_AMOUNT, PENALTY_AMOUNT
  - BHXH_AMOUNT, BHTN_AMOUNT, BHYT_AMOUNT, TAX_AMOUNT
  - TOTAL_SALARY: Tổng lương thực nhận
  - STATUS: UNPAID/PAID

**SALARY_PAYMENT** (Phiếu chi lương)
- Quan hệ: 1-1 với PAYROLL (qua PAYROLL_ID, UNIQUE)
- Lưu trữ thông tin thanh toán: PAYMENT_DATE, APPROVED_BY, NOTE

## 4. LUỒNG TÍNH CÔNG VÀ TÍNH LƯƠNG

### 4.1. Luồng tính công (Attendance Flow)

Luồng tính công bắt đầu từ khi nhập dữ liệu chấm công và tự động tính toán các giá trị liên quan.

#### 4.1.1. Nhập dữ liệu chấm công

**Input:**
- `EMP_ID`: ID nhân viên
- `ATTENDANCE_DATE`: Ngày chấm công (có thể NULL, sẽ tự động set từ START_TIME)
- `START_TIME`: Thời gian bắt đầu làm việc (ví dụ: 09:00)
- `END_TIME`: Thời gian kết thúc làm việc (ví dụ: 18:30)
- `LUNCH_BREAK_HOURS`: Số giờ nghỉ trưa (mặc định: 1.5 giờ)

**Ví dụ INSERT:**
```sql
INSERT INTO ATTENDANCE (
    ID, EMP_ID, ATTENDANCE_DATE, START_TIME, END_TIME, LUNCH_BREAK_HOURS,
    CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT
) VALUES (
    SYS_GUID(), 'emp_id', DATE '2025-10-15',
    TIMESTAMP '2025-10-15 09:00:00',
    TIMESTAMP '2025-10-15 18:30:00',
    1.5, 'system', SYSTIMESTAMP, 'system', SYSTIMESTAMP
);
```

#### 4.1.2. Trigger tự động tính toán (TRG_ATTENDANCE_CALCULATE_HOURS)

Trigger được kích hoạt **BEFORE INSERT OR UPDATE** của START_TIME, END_TIME, ATTENDANCE_DATE.

**Bước 1: Tự động set ATTENDANCE_DATE**
- Nếu `ATTENDANCE_DATE IS NULL` → Set = `TRUNC(START_TIME)`

**Bước 2: Tự động tính IS_WORKING_DAY**
- Sử dụng ISO week: `TRUNC(ATTENDANCE_DATE) - TRUNC(ATTENDANCE_DATE, 'IW')`
- Nếu kết quả ≤ 4 → `IS_WORKING_DAY = 1` (Thứ 2-6)
- Nếu kết quả = 5 → `IS_WORKING_DAY = 0` (Thứ 7)
- Nếu kết quả = 6 → `IS_WORKING_DAY = 0` (Chủ nhật)

**Bước 3: Tính WORK_HOURS**
```
WORK_HOURS = (END_TIME - START_TIME) - LUNCH_BREAK_HOURS
```
- Sử dụng EXTRACT để tính chính xác đến phút:
  - `EXTRACT(DAY FROM interval) * 24 + EXTRACT(HOUR FROM interval) + EXTRACT(MINUTE FROM interval) / 60`

**Bước 4: Tính NORMAL_HOURS và OT_HOURS**

Logic phân chia:

```
IF IS_WORKING_DAY = 0 (Thứ 7/Chủ nhật):
    NORMAL_HOURS = 0
    OT_HOURS = WORK_HOURS
    WORK_HOURS = 0  (Không tính vào công)
    
ELSE IF END_HOUR >= 18 AND WORK_HOURS >= 8:
    NORMAL_HOURS = 8  (8 giờ đầu là công bình thường)
    OT_HOURS = WORK_HOURS - 8  (Phần còn lại là OT)
    
ELSE:
    NORMAL_HOURS = WORK_HOURS  (Tất cả là công bình thường)
    OT_HOURS = 0  (Không có OT)
```

**Ví dụ tính toán:**

| Ngày | START_TIME | END_TIME | LUNCH | IS_WORKING_DAY | WORK_HOURS | NORMAL_HOURS | OT_HOURS |
|------|------------|----------|-------|----------------|------------|-------------|----------|
| Thứ 2 | 09:00 | 18:30 | 1.5 | 1 | 8.0 | 8.0 | 0.0 |
| Thứ 3 | 09:00 | 19:30 | 1.5 | 1 | 9.0 | 8.0 | 1.0 |
| Thứ 4 | 09:00 | 17:00 | 1.5 | 1 | 6.5 | 6.5 | 0.0 |
| Thứ 7 | 09:00 | 18:30 | 1.5 | 0 | 8.0 | 0.0 | 8.0 |
| CN | 09:00 | 18:30 | 1.5 | 0 | 8.0 | 0.0 | 8.0 |

#### 4.1.3. Tính số công trong tháng

Khi tính lương, hệ thống sẽ:

**Bước 1: Tính số công chuẩn của tháng**
- Đếm số ngày thứ 2-6 trong tháng
- Sử dụng vòng lặp từ ngày đầu tháng đến ngày cuối tháng
- Với mỗi ngày, kiểm tra: `TRUNC(date) - TRUNC(date, 'IW') <= 4`
- Ví dụ: Tháng 10/2025 có 23 ngày thứ 2-6

**Bước 2: Tính số ngày làm việc thực tế**
- Đếm số bản ghi ATTENDANCE có `IS_WORKING_DAY = 1` trong tháng
- Chỉ tính các ngày thứ 2-6 có chấm công
- Ví dụ: Nhân viên làm 20 ngày thứ 2-6 trong tháng 10/2025

**Bước 3: Tính tỷ lệ công**
```
Tỷ lệ công = Số ngày làm việc / Số công chuẩn
Ví dụ: 20 / 23 = 0.8696 (86.96%)
```

### 4.2. Luồng tính lương (Payroll Calculation Flow)

Luồng tính lương được thực hiện qua procedure `CALCULATE_PAYROLL`, chia thành 3 giai đoạn độc lập.

#### 4.2.1. Đầu vào (Input)

```
CALCULATE_PAYROLL(
    p_employee_code: 'NV001',
    p_month_year: '2025-10',
    p_result: OUT
)
```

#### 4.2.2. Bước 1: Validation và lấy thông tin cơ bản

**1.1. Parse tháng/năm**
- Parse `p_month_year` (format: 'YYYY-MM') → `v_month_num`, `v_year_num`
- Validate: Tháng phải từ 1-12

**1.2. Tìm nhân viên**
```sql
SELECT ID INTO v_emp_id
FROM EMPLOYEE
WHERE CODE = p_employee_code AND STATUS = 'ACTIVE'
```
- Nếu không tìm thấy → Trả về lỗi và kết thúc

**1.3. Lấy hợp đồng ACTIVE trong tháng**
```sql
SELECT ID, BASE_SALARY, OFFER_SALARY, SALARY_TYPE, CONTRACT_TYPE
FROM CONTRACT
WHERE EMP_ID = v_emp_id
  AND STATUS = 'ACTIVE'
  AND START_DATE <= v_month_end
  AND (END_DATE IS NULL OR END_DATE >= v_month_start)
```
- Nếu không tìm thấy → Trả về lỗi và kết thúc
- Lưu: `v_base_salary`, `v_offer_salary`, `v_salary_type`, `v_contract_type`

#### 4.2.3. Bước 2: Giai đoạn 1 - Tính lương trong tháng

**Gọi procedure:** `CALCULATE_WORKING_SALARY`

**2.1. Tính số công chuẩn**
```
v_standard_work_days = 0
FOR mỗi ngày từ đầu tháng đến cuối tháng:
    IF (TRUNC(date) - TRUNC(date, 'IW')) <= 4:
        v_standard_work_days += 1
```
- Ví dụ tháng 10/2025: 23 ngày

**2.2. Tính số ngày làm việc**
```sql
SELECT COUNT(CASE WHEN IS_WORKING_DAY = 1 THEN 1 END)
FROM ATTENDANCE
WHERE EMP_ID = v_emp_id
  AND ATTENDANCE_DATE >= v_month_start
  AND ATTENDANCE_DATE <= v_month_end
```
- Ví dụ: 20 ngày

**2.3. Tính WORKING_SALARY**
```
WORKING_SALARY = OFFER_SALARY × (Số ngày làm việc / Số công chuẩn)
Ví dụ: 10,000,000 × (20 / 23) = 8,695,652 VNĐ
```

**2.4. Tính phụ cấp**
```sql
SELECT SUM(AMOUNT)
FROM EMPLOYEE_ALLOWANCE
WHERE EMP_ID = v_emp_id
  AND EFFECTIVE_FROM <= v_month_end
  AND (EFFECTIVE_TO IS NULL OR EFFECTIVE_TO >= v_month_start)
```
- Chỉ tính phụ cấp có hiệu lực trong tháng
- Ví dụ: 2,000,000 VNĐ (phụ cấp đi lại + ăn trưa)

**2.5. Tính thưởng**
```sql
SELECT SUM(AMOUNT)
FROM REWARD
WHERE EMP_ID = v_emp_id
  AND EXTRACT(MONTH FROM REWARD_DATE) = v_month_num
  AND EXTRACT(YEAR FROM REWARD_DATE) = v_year_num
```
- Ví dụ: 500,000 VNĐ

**2.6. Tính phạt**
```sql
SELECT SUM(AMOUNT)
FROM PENALTY
WHERE EMP_ID = v_emp_id
  AND EXTRACT(MONTH FROM PENALTY_DATE) = v_month_num
  AND EXTRACT(YEAR FROM PENALTY_DATE) = v_year_num
```
- Ví dụ: 0 VNĐ

**Kết quả giai đoạn 1:**
- `v_working_salary` = 8,695,652 VNĐ
- `v_allowance` = 2,000,000 VNĐ
- `v_reward_amount` = 500,000 VNĐ
- `v_penalty_amount` = 0 VNĐ

#### 4.2.4. Bước 3: Giai đoạn 2 - Tính lương OT

**Gọi procedure:** `CALCULATE_OT_SALARY`

**3.1. Tính số công chuẩn** (giống giai đoạn 1)
- 23 ngày

**3.2. Lấy hệ số OT từ config**
```sql
OT = 1.5 (Thứ 2-6 và thứ 7)
OT_SUN = 2.0 (Chủ nhật)
OT_HOL = 3.0 (Ngày lễ)
```

**3.3. Tính lương OT theo giờ**
```
OT_RATE_PER_HOUR = OFFER_SALARY / Số công chuẩn / 8
Ví dụ: 10,000,000 / 23 / 8 = 54,348 VNĐ/giờ
```

**3.4. Tính tổng giờ OT**
```sql
SELECT SUM(OT_HOURS)
FROM ATTENDANCE
WHERE EMP_ID = v_emp_id
  AND ATTENDANCE_DATE >= v_month_start
  AND ATTENDANCE_DATE <= v_month_end
  AND OT_HOURS > 0
```
- Ví dụ: 5 giờ OT (1 giờ thứ 3 + 4 giờ thứ 7)

**3.5. Tính lương OT theo ngày với hệ số**

Với mỗi bản ghi ATTENDANCE có OT_HOURS > 0:

```sql
CASE
    WHEN EXISTS (SELECT 1 FROM HOLIDAY WHERE HOLIDAY_DATE = ATTENDANCE_DATE):
        OT_SALARY_DAY = OT_HOURS × OT_RATE × 3.0  -- Ngày lễ
    WHEN (TRUNC(ATTENDANCE_DATE) - TRUNC(ATTENDANCE_DATE, 'IW')) = 6:
        OT_SALARY_DAY = OT_HOURS × OT_RATE × 2.0  -- Chủ nhật
    ELSE:
        OT_SALARY_DAY = OT_HOURS × OT_RATE × 1.5  -- Thứ 2-6 hoặc thứ 7
END
```

**Ví dụ tính OT:**
- Thứ 3: 1 giờ OT → 1 × 54,348 × 1.5 = 81,522 VNĐ
- Thứ 7: 4 giờ OT → 4 × 54,348 × 1.5 = 326,088 VNĐ
- **Tổng OT_SALARY** = 407,610 VNĐ

**Kết quả giai đoạn 2:**
- `v_ot_hours` = 5 giờ
- `v_ot_salary` = 407,610 VNĐ

#### 4.2.5. Bước 4: Giai đoạn 3 - Tính bảo hiểm và thuế

**Gọi procedure:** `CALCULATE_INSURANCE_TAX`

**4.1. Tính bảo hiểm (chỉ cho hợp đồng chính thức)**

Nếu `CONTRACT_TYPE = 'Chinh thuc'`:
```sql
SELECT BHXH_RATE, BHTN_RATE, BHYT_RATE
FROM INSURANCE_CONFIG
WHERE CONTRACT_TYPE = 'Chinh thuc'
```
- BHXH_RATE = 10%, BHTN_RATE = 5%, BHYT_RATE = 5%

```
BHXH_AMOUNT = BASE_SALARY × 10% = 8,000,000 × 0.10 = 800,000 VNĐ
BHTN_AMOUNT = BASE_SALARY × 5% = 8,000,000 × 0.05 = 400,000 VNĐ
BHYT_AMOUNT = BASE_SALARY × 5% = 8,000,000 × 0.05 = 400,000 VNĐ
```

Nếu hợp đồng thử việc: Tất cả = 0

**4.2. Tính thuế TNCN**

**Bước 4.2.1: Tính thu nhập chịu thuế**
```
Thu nhập chịu thuế = WORKING_SALARY + OT_SALARY + ALLOWANCE + REWARD - PENALTY
                   = 8,695,652 + 407,610 + 2,000,000 + 500,000 - 0
                   = 11,603,262 VNĐ
```

**Bước 4.2.2: Trừ bảo hiểm (nếu GROSS và hợp đồng chính thức)**
```
IF SALARY_TYPE = 'GROSS' AND CONTRACT_TYPE = 'Chinh thuc':
    Thu nhập chịu thuế = 11,603,262 - 800,000 - 400,000 - 400,000
                       = 10,003,262 VNĐ
```

**Bước 4.2.3: Giảm trừ**
```sql
SELECT COUNT(*) INTO v_dependent_count
FROM EMPLOYEE_DEPENDENT
WHERE EMP_ID = v_emp_id
```
- Ví dụ: 1 người phụ thuộc

```sql
SELECT PERSONAL_DEDUCTION, DEPENDENT_DEDUCTION
FROM TAX_CONFIG
WHERE CODE = 'TAX_B1'
```
- PERSONAL_DEDUCTION = 11,000,000 VNĐ
- DEPENDENT_DEDUCTION = 4,400,000 VNĐ

```
Tổng giảm trừ = 11,000,000 + (4,400,000 × 1) = 15,400,000 VNĐ
```

**Bước 4.2.4: Thu nhập chịu thuế sau giảm trừ**
```
Thu nhập chịu thuế sau giảm trừ = MAX(0, 10,003,262 - 15,400,000)
                                  = 0 VNĐ
```
→ Không phải nộp thuế

**Nếu có thu nhập chịu thuế > 0, tính thuế theo bậc lũy kế:**

Ví dụ: Thu nhập chịu thuế = 25,000,000 VNĐ

```
Bậc 1 (0-5tr): 5,000,000 × 5% = 250,000 VNĐ
Bậc 2 (5-10tr): 5,000,000 × 10% = 500,000 VNĐ
Bậc 3 (10-18tr): 8,000,000 × 15% = 1,200,000 VNĐ
Bậc 4 (18-32tr): 7,000,000 × 20% = 1,400,000 VNĐ
Tổng thuế = 3,350,000 VNĐ
```

**Kết quả giai đoạn 3:**
- `v_bhxh_amount` = 800,000 VNĐ
- `v_bhtn_amount` = 400,000 VNĐ
- `v_bhyt_amount` = 400,000 VNĐ
- `v_tax_amount` = 0 VNĐ (hoặc giá trị tính được)

**4.3. Tính tổng lương thực nhận**

**Nếu GROSS:**
```
TOTAL_SALARY = WORKING_SALARY + OT_SALARY + ALLOWANCE + REWARD - PENALTY
             - BHXH - BHTN - BHYT - TAX
             = 8,695,652 + 407,610 + 2,000,000 + 500,000 - 0
             - 800,000 - 400,000 - 400,000 - 0
             = 10,003,262 VNĐ
```

**Nếu NET:**
```
TOTAL_SALARY = WORKING_SALARY + OT_SALARY + ALLOWANCE + REWARD - PENALTY
             = 8,695,652 + 407,610 + 2,000,000 + 500,000 - 0
             = 11,603,262 VNĐ
```
(BHXH/BHTN/BHYT/TAX chỉ là mô tả, không trừ)

#### 4.2.6. Bước 5: Lưu kết quả vào PAYROLL

**Kiểm tra bản ghi đã tồn tại:**
```sql
SELECT ID INTO v_payroll_id
FROM PAYROLL
WHERE EMP_ID = v_emp_id
  AND MONTH_NUM = v_month_num
  AND YEAR_NUM = v_year_num
```

**Nếu chưa có (INSERT):**
```sql
INSERT INTO PAYROLL (
    ID, EMP_ID, MONTH_NUM, YEAR_NUM,
    BASIC_SALARY, OFFER_SALARY, ALLOWANCE, REWARD_AMOUNT, PENALTY_AMOUNT,
    OT_HOURS, OT_SALARY,
    BHXH_AMOUNT, BHTN_AMOUNT, BHYT_AMOUNT, TAX_AMOUNT,
    TOTAL_SALARY, GROSS_NET, STATUS
) VALUES (
    SYS_GUID(), v_emp_id, v_month_num, v_year_num,
    v_base_salary, v_offer_salary, v_allowance, v_reward_amount, v_penalty_amount,
    v_ot_hours, v_ot_salary,
    v_bhxh_amount, v_bhtn_amount, v_bhyt_amount, v_tax_amount,
    v_total_salary, v_salary_type, 'UNPAID'
)
```

**Nếu đã có (UPDATE):**
```sql
UPDATE PAYROLL SET
    BASIC_SALARY = v_base_salary,
    OFFER_SALARY = v_offer_salary,
    ALLOWANCE = v_allowance,
    ...
WHERE ID = v_payroll_id
```

### 4.3. Sơ đồ luồng tính lương

```
┌─────────────────────────────────────────────────────────────┐
│ INPUT: employeeCode, monthYear                              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Validation & Lấy thông tin                               │
│    - Parse monthYear → month_num, year_num                  │
│    - Tìm EMP_ID từ employeeCode                             │
│    - Lấy CONTRACT ACTIVE trong tháng                        │
│    - Lấy: BASE_SALARY, OFFER_SALARY, SALARY_TYPE,           │
│           CONTRACT_TYPE                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. GIAI ĐOẠN 1: CALCULATE_WORKING_SALARY                   │
│    ┌──────────────────────────────────────────┐            │
│    │ 2.1. Tính số công chuẩn (Thứ 2-6)        │            │
│    │      → v_standard_work_days = 23        │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 2.2. Tính số ngày làm việc               │            │
│    │      → v_work_days = 20                  │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 2.3. WORKING_SALARY =                    │            │
│    │      OFFER_SALARY × (20/23)             │            │
│    │      → 8,695,652 VNĐ                     │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 2.4. Tính phụ cấp (EFFECTIVE_FROM/TO)   │            │
│    │      → 2,000,000 VNĐ                     │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 2.5. Tính thưởng → 500,000 VNĐ           │            │
│    │ 2.6. Tính phạt → 0 VNĐ                   │            │
│    └──────────────────────────────────────────┘            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. GIAI ĐOẠN 2: CALCULATE_OT_SALARY                        │
│    ┌──────────────────────────────────────────┐            │
│    │ 3.1. Tính số công chuẩn (23 ngày)        │            │
│    │ 3.2. Lấy hệ số OT (1.5, 2.0, 3.0)        │            │
│    │ 3.3. OT_RATE = OFFER_SALARY/23/8         │            │
│    │      → 54,348 VNĐ/giờ                     │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 3.4. Tính tổng giờ OT → 5 giờ            │            │
│    │ 3.5. Tính OT theo ngày với hệ số:       │            │
│    │      - Thứ 3: 1h × 54,348 × 1.5          │            │
│    │      - Thứ 7: 4h × 54,348 × 1.5          │            │
│    │      → OT_SALARY = 407,610 VNĐ           │            │
│    └──────────────────────────────────────────┘            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. GIAI ĐOẠN 3: CALCULATE_INSURANCE_TAX                    │
│    ┌──────────────────────────────────────────┐            │
│    │ 4.1. Tính bảo hiểm (nếu chính thức):     │            │
│    │      BHXH = BASE_SALARY × 10%            │            │
│    │      BHTN = BASE_SALARY × 5%             │            │
│    │      BHYT = BASE_SALARY × 5%             │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 4.2. Tính thuế TNCN:                     │            │
│    │      - Thu nhập chịu thuế =              │            │
│    │        WORKING + OT + ALLOWANCE + REWARD  │            │
│    │      - Trừ BH (nếu GROSS)                │            │
│    │      - Giảm trừ: 11tr + 4.4tr × số người │            │
│    │      - Tính thuế theo 7 bậc lũy kế       │            │
│    └──────────────────────────────────────────┘            │
│    ┌──────────────────────────────────────────┐            │
│    │ 4.3. TOTAL_SALARY:                       │            │
│    │      - GROSS: Trừ BH + TAX               │            │
│    │      - NET: Không trừ                    │            │
│    └──────────────────────────────────────────┘            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. INSERT/UPDATE PAYROLL                                    │
│    - BASIC_SALARY = BASE_SALARY (từ CONTRACT)              │
│    - OFFER_SALARY = OFFER_SALARY (từ CONTRACT)             │
│    - Các giá trị từ 3 giai đoạn                            │
│    - STATUS = 'UNPAID'                                      │
└─────────────────────────────────────────────────────────────┘
```

## 5. CÁC BẢNG CHÍNH VÀ CHỨC NĂNG

### 5.1. Master Tables

| Bảng | Mô tả | Chức năng |
|------|-------|-----------|
| DEPARTMENT | Phòng ban | Quản lý phòng ban trong công ty |
| POSITION | Chức vụ | Quản lý chức vụ nhân viên |
| SALARY_FACTOR_CONFIG | Cấu hình hệ số lương | Lưu hệ số: thử việc (0.85), chính thức (1.00), OT (1.5), OT_SUN (2.0), OT_HOL (3.0) |
| TAX_CONFIG | Cấu hình thuế TNCN | Lưu 7 bậc thuế với giảm trừ và thuế suất |
| INSURANCE_CONFIG | Cấu hình bảo hiểm | Lưu tỷ lệ BHXH (10%), BHTN (5%), BHYT (5%) |
| ALLOWANCE_CONFIG | Cấu hình phụ cấp | Lưu các loại phụ cấp (đi lại, ăn trưa, ...) |
| HOLIDAY | Ngày lễ | Lưu danh sách ngày lễ trong năm (dùng để tính OT) |

### 5.2. Employee & Contract Tables

| Bảng | Mô tả | Chức năng |
|------|-------|-----------|
| EMPLOYEE | Nhân viên | Thông tin cơ bản nhân viên |
| EMPLOYEE_DEPENDENT | Người phụ thuộc | Dùng để tính giảm trừ thuế |
| CONTRACT | Hợp đồng | Lưu BASE_SALARY (tính BH), OFFER_SALARY (tính lương), SALARY_TYPE (GROSS/NET), CONTRACT_TYPE (Thử việc/Chính thức) |
| EMPLOYEE_ALLOWANCE | Phụ cấp nhân viên | Phụ cấp theo thời gian hiệu lực (EFFECTIVE_FROM, EFFECTIVE_TO) |

### 5.3. Attendance Table

| Bảng | Mô tả | Đặc điểm |
|------|-------|----------|
| ATTENDANCE | Chấm công | - Partitioned by month (tối ưu hiệu năng)<br>- UNIQUE (EMP_ID, ATTENDANCE_DATE)<br>- Tự động tính WORK_HOURS, NORMAL_HOURS, OT_HOURS, IS_WORKING_DAY qua trigger<br>- Lưu START_TIME, END_TIME, LUNCH_BREAK_HOURS |

### 5.4. Reward & Penalty Tables

| Bảng | Mô tả | Chức năng |
|------|-------|-----------|
| REWARD | Thưởng | Thưởng cho nhân viên hoặc phòng ban |
| PENALTY | Phạt | Phạt nhân viên |

### 5.5. Payroll & Payment Tables

| Bảng | Mô tả | Chức năng |
|------|-------|-----------|
| PAYROLL | Bảng lương | Tổng hợp lương tháng của nhân viên, STATUS: UNPAID/PAID |
| SALARY_PAYMENT | Phiếu chi lương | Ghi nhận thanh toán lương, quan hệ 1-1 với PAYROLL |

## 6. CÁC PROCEDURE VÀ TRIGGER

### 6.1. Triggers

**TRG_ATTENDANCE_CALCULATE_HOURS** (004-create-attendance-triggers.sql)
- **Kích hoạt**: BEFORE INSERT OR UPDATE OF START_TIME, END_TIME, ATTENDANCE_DATE
- **Chức năng**: 
  - Tự động set ATTENDANCE_DATE từ START_TIME nếu NULL
  - Tự động tính IS_WORKING_DAY (1 = thứ 2-6, 0 = thứ 7/chủ nhật)
  - Tự động tính WORK_HOURS = (END_TIME - START_TIME) - LUNCH_BREAK_HOURS
  - Tự động tính NORMAL_HOURS và OT_HOURS:
    - Nếu IS_WORKING_DAY = 0: NORMAL_HOURS = 0, OT_HOURS = WORK_HOURS
    - Nếu END_HOUR >= 18 và WORK_HOURS >= 8: NORMAL_HOURS = 8, OT_HOURS = WORK_HOURS - 8
    - Ngược lại: NORMAL_HOURS = WORK_HOURS, OT_HOURS = 0

### 6.2. Procedures

#### 6.2.1. INSERT_ATTENDANCE_DATA (005-create-insert-attendance-procedure.sql)
- **Chức năng**: Tạo dữ liệu chấm công cho nhân viên
- **Tham số**: `p_month` (format: 'YYYYMM', NULL = tháng hiện tại)
- **Logic**: 
  - Tạo chấm công thứ 2-6 cho tất cả nhân viên
  - Tạo chấm công thứ 7/chủ nhật cho một số nhân viên (theo yêu cầu)
  - Cập nhật END_TIME để tạo OT cho một số nhân viên

#### 6.2.2. CALCULATE_WORKING_SALARY (006-calculate-working-salary-procedure.sql)
- **Chức năng**: Tính lương trong tháng (theo công và phụ cấp)
- Xem chi tiết ở mục 4.1

#### 6.2.3. CALCULATE_OT_SALARY (007-calculate-ot-salary-procedure.sql)
- **Chức năng**: Tính lương OT
- Xem chi tiết ở mục 4.1

#### 6.2.4. CALCULATE_INSURANCE_TAX (008-calculate-insurance-tax-procedure.sql)
- **Chức năng**: Tính bảo hiểm và thuế TNCN
- Xem chi tiết ở mục 4.1

#### 6.2.5. CALCULATE_PAYROLL (009-calculate-payroll-procedure.sql)
- **Chức năng**: Procedure chính tính lương cho nhân viên
- **Tham số**: 
  - `p_employee_code`: Mã nhân viên
  - `p_month_year`: Tháng/Năm (format: 'YYYY-MM')
  - `p_result`: Kết quả
- Xem chi tiết ở mục 4.2

#### 6.2.6. CREATE_SALARY_PAYMENT (010-create-salary-payment-procedure.sql)
- **Chức năng**: Tạo phiếu chi lương cho tất cả PAYROLL có STATUS = 'UNPAID'
- **Tham số**:
  - `p_payment_date`: Ngày trả lương (default: SYSTIMESTAMP)
  - `p_approved_by`: Người phê duyệt (default: 'system')
  - `p_note`: Ghi chú (default: NULL)
  - `p_created_by`: Người tạo (default: 'system')
  - `p_count`: Số lượng phiếu đã tạo (OUT)
  - `p_result`: Thông báo kết quả (OUT)
- **Logic**:
  1. Duyệt tất cả PAYROLL có STATUS = 'UNPAID'
  2. Với mỗi PAYROLL chưa có phiếu chi: Tạo SALARY_PAYMENT và cập nhật STATUS = 'PAID'
  3. Trả về số lượng phiếu đã tạo

## 7. HƯỚNG DẪN SỬ DỤNG

### 7.1. Cài đặt

Thực thi các file SQL theo thứ tự:

```sql
-- 1. Tạo tablespace
@000-create-tablespace.sql

-- 2. Tạo tất cả các bảng
@001-create-salary-table.sql

-- 3. Insert dữ liệu master
@002-insert-master-data.sql

-- 4. Insert dữ liệu mẫu
@003-insert-sample-data.sql

-- 5. Tạo trigger chấm công
@004-create-attendance-triggers.sql

-- 6. Tạo procedure insert chấm công
@005-create-insert-attendance-procedure.sql

-- 7-10. Tạo các procedure tính lương
@006-calculate-working-salary-procedure.sql
@007-calculate-ot-salary-procedure.sql
@008-calculate-insurance-tax-procedure.sql
@009-calculate-payroll-procedure.sql

-- 11. Tạo procedure tạo phiếu chi
@010-create-salary-payment-procedure.sql
```

### 7.2. Sử dụng

#### 7.2.1. Tạo dữ liệu chấm công

```sql
-- Tạo chấm công cho tháng hiện tại
EXEC INSERT_ATTENDANCE_DATA(NULL);

-- Tạo chấm công cho tháng cụ thể (ví dụ: 10/2025)
EXEC INSERT_ATTENDANCE_DATA('202510');
```

#### 7.2.2. Tính lương cho nhân viên

```sql
DECLARE
    v_result VARCHAR2(4000);
BEGIN
    CALCULATE_PAYROLL(
        p_employee_code => 'NV001',
        p_month_year => '2025-10',
        p_result => v_result
    );
    DBMS_OUTPUT.PUT_LINE(v_result);
END;
/
```

#### 7.2.3. Tạo phiếu chi lương

```sql
DECLARE
    v_count NUMBER;
    v_result VARCHAR2(4000);
BEGIN
    CREATE_SALARY_PAYMENT(
        p_payment_date => SYSTIMESTAMP,
        p_approved_by => 'admin',
        p_note => 'Thanh toan luong thang 10/2025',
        p_created_by => 'admin',
        p_count => v_count,
        p_result => v_result
    );
    DBMS_OUTPUT.PUT_LINE(v_result);
    DBMS_OUTPUT.PUT_LINE('So phieu chi da tao: ' || v_count);
END;
/
```

## 8. ĐẶC ĐIỂM KỸ THUẬT

### 8.1. Partitioning

Bảng **ATTENDANCE** được phân vùng theo tháng:
- **Type**: RANGE INTERVAL partitioning
- **Partition Key**: ATTENDANCE_DATE
- **Interval**: 1 tháng
- **Lợi ích**: 
  - Tối ưu hiệu năng truy vấn theo tháng
  - Dễ dàng quản lý và xóa dữ liệu cũ
  - Tự động tạo partition mới khi có dữ liệu

### 8.2. Tính toán ngày trong tuần

Sử dụng **ISO week** (`TRUNC(date, 'IW')`) để tính ngày trong tuần:
- **Ưu điểm**: Không phụ thuộc NLS settings, tính toán số học nhanh
- **Logic**: `TRUNC(date) - TRUNC(date, 'IW')` = số ngày từ thứ 2 (0-6)
  - 0-4: Thứ 2-6
  - 5: Thứ 7
  - 6: Chủ nhật

### 8.3. Format ngày thống nhất

Tất cả format ngày sử dụng dấu `-` và thứ tự `YYYY-MM-DD`:
- `TO_DATE('2025-10-01', 'YYYY-MM-DD')`
- `TO_CHAR(date, 'YYYY-MM-DD')`
- Tham số `p_month_year`: Format `'YYYY-MM'`

### 8.4. Exception Handling

Tất cả procedure đều có exception handling:
- Trả về thông báo lỗi rõ ràng
- Rollback khi có lỗi nghiêm trọng
- Tiếp tục xử lý các bản ghi khác khi có lỗi nhỏ (trong CREATE_SALARY_PAYMENT)

## 9. LƯU Ý QUAN TRỌNG

1. **BASE_SALARY vs OFFER_SALARY**:
   - `BASE_SALARY`: Dùng để tính bảo hiểm (BHXH, BHTN, BHYT)
   - `OFFER_SALARY`: Dùng để tính lương theo công và OT

2. **WORKING_SALARY**: 
   - Được tính = `OFFER_SALARY × (số ngày làm việc / số công chuẩn)`
   - Số công chuẩn = tổng số ngày thứ 2-6 trong tháng (thay đổi theo tháng)

3. **OT tính theo OFFER_SALARY**: 
   - `OT_RATE_PER_HOUR = OFFER_SALARY / số công chuẩn / 8`
   - Hệ số OT khác nhau: Ngày lễ (3.0), Chủ nhật (2.0), Thứ 7/Thứ 2-6 (1.5)

4. **Lương NET vs GROSS**:
   - NET: BHXH/BHTN/BHYT/TAX chỉ là mô tả, không trừ vào lương
   - GROSS: Trừ BHXH, BHTN, BHYT, TAX vào lương

5. **Hợp đồng thử việc**: 
   - Không tính bảo hiểm
   - Vẫn tính thuế nếu là GROSS (nhưng không trừ bảo hiểm vì không có)

6. **Phụ cấp**: 
   - Kiểm tra EFFECTIVE_FROM và EFFECTIVE_TO để xác định phụ cấp có hiệu lực trong tháng

7. **Ngày lễ**: 
   - Được lưu trong bảng HOLIDAY
   - Được ưu tiên cao nhất khi tính OT (hệ số 3.0)

## 10. TÀI LIỆU THAM KHẢO

- File `PAYROLL_CALCULATION_SCENARIO.md`: Kịch bản tính lương chi tiết
- Các file SQL trong thư mục `sql/`: Code và comment chi tiết
