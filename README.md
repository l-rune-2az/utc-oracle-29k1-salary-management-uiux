## Hệ Thống Quản Lý Lương (UI + API)

Ứng dụng Next.js 14 cung cấp cả giao diện quản trị và lớp API trung gian để kết nối Oracle Database của hệ thống tính lương (theo tài liệu `README-Schema.md`). FE sử dụng React 18 + Tailwind design tokens; BE là Next.js Route Handler, sẵn sàng chuyển từ mock data sang Oracle thông qua service đồng nhất.

### 1. Kiến Trúc & Công Nghệ
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind design tokens.
- **Backend API**: Next.js Route Handlers (`app/api/*`) triển khai REST, gọi Service Oracle.
- **Database**: Oracle Database 19c+ (schema & procedure theo folder `../utc-oracle-29k1-salary-management/sql`).
- **Service Layer**: `services/oracleService.ts` bao bọc CRUD (`SELECT/INSERT/UPDATE/DELETE`) với async/await + connection pooling (`lib/oracle.ts`).

### 2. Chuẩn Bị Môi Trường
1. **Node.js** ≥ 18.17 (Next 14 yêu cầu).
2. **Oracle Instant Client** (64-bit) trên máy chạy API để cài driver `oracledb` khi cần.
3. **Biến môi trường** (`.env.local`):
   ```ini
   # API (client) – cho phép trỏ tới domain khác nếu cần
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
   NEXT_PUBLIC_API_TIMEOUT=15000

   # Oracle – server side only
   ORACLE_USER=salary_app
   ORACLE_PASSWORD=changeme
   ORACLE_CONNECTION_STRING=localhost:1521/XEPDB1
   ORACLE_POOL_MIN=1
   ORACLE_POOL_MAX=5
   ORACLE_POOL_INCREMENT=1

   # Bật/tắt mock data (true để không cần DB)
   USE_MOCK_DATA=true
   ```
4. **SQL Scripts**: có trong repo backend `../utc-oracle-29k1-salary-management/sql`.

### 3. Cài Đặt & Chạy
```bash
# 1. Cài đặt phụ thuộc
npm install

# 2. Chạy development server
npm run dev

# 3. Build + start production
npm run build
npm run start
```
> Frontend và Backend API cùng nằm trong ứng dụng Next.js, nên chỉ cần chạy một server duy nhất.

### 4. Kết Nối Oracle
1. Đảm bảo đã cài Oracle Instant Client và cấu hình biến môi trường hệ thống (PATH, LD_LIBRARY_PATH hoặc OCI_LIB_DIR tuỳ HĐH).
2. Điền giá trị ORACLE_* trong `.env.local`.
3. Mặc định `USE_MOCK_DATA=true`. Khi chuyển sang Oracle thật, đặt `USE_MOCK_DATA=false`. Các API sẽ tự động:
   - Tạo connection pool qua `lib/oracle.ts`.
   - Thực thi truy vấn qua `services/oracleService.ts` với async/await.
   - Tự động commit khi INSERT/UPDATE/DELETE.

### 5. Import SQL
1. Mở SQL*Plus hoặc SQLcl, kết nối user `sys` hoặc user được phân quyền.
2. Thực thi tuần tự (theo README-Schema):
   ```
   @000-create-tablespace.sql
   @001-create-salary-table.sql
   @002-insert-master-data.sql
   @003-insert-sample-data.sql
   @004-create-attendance-triggers.sql
   @005-create-insert-attendance-procedure.sql
   @006-calculate-working-salary-procedure.sql
   @007-calculate-ot-salary-procedure.sql
   @008-calculate-insurance-tax-procedure.sql
   @009-calculate-payroll-procedure.sql
   @010-create-salary-payment-procedure.sql
   ```
3. Sau khi import, chỉnh `.env.local` để tắt mock.

### 6. API Endpoints
| Module | Endpoint | Method | Mô tả khi kết nối Oracle |
|--------|----------|--------|--------------------------|
| Master Data | `/api/departments` | GET/POST/PUT/DELETE | CRUD phòng ban (CODE ↔ `deptId`). |
| Master Data | `/api/positions` | GET/POST | CRUD chức vụ (mapping `positionId` ↔ CODE). |
| Employee & Contract | `/api/employees` | GET/POST | Danh sách & tạo nhân viên (dùng EMPLOYEE). |
| Employee & Contract | `/api/contracts` | GET/POST | Hợp đồng + join SALARY_FACTOR_CONFIG để lấy hệ số. |
| Attendance | `/api/attendances` | GET | Tổng hợp công theo tháng từ ATTENDANCE (POST mock/procedure TODO). |
| Reward | `/api/rewards` | GET/POST | Quản lý thưởng (REWARD). |
| Penalty | `/api/penalties` | GET/POST | Quản lý phạt (PENALTY). |
| Payroll | `/api/payrolls` | GET | Đọc PAYROLL (POST yêu cầu chạy procedure CALCULATE_PAYROLL). |
| Payment | `/api/payments` | GET | Đọc SALARY_PAYMENT (POST yêu cầu procedure CREATE_SALARY_PAYMENT). |

> Khi `USE_MOCK_DATA=true`, các endpoint trả về mock ở `data/mockData.ts` để hỗ trợ UI mà không cần Oracle.

### 7. Module theo README-Schema
1. **Master Data Module** – quản lý DEPARTMENT, POSITION, SALARY_FACTOR_CONFIG, TAX_CONFIG, INSURANCE_CONFIG, ALLOWANCE_CONFIG, HOLIDAY. UI hiển thị tại Dashboard, API `/api/departments`, `/api/positions`.
2. **Employee & Contract Module** – danh sách nhân viên, phụ thuộc, hợp đồng (`/api/employees`, `/api/contracts`). Map 1-n giữa phòng ban, chức vụ, hợp đồng.
3. **Attendance Module** – `/api/attendances` đọc tổng hợp công; ghi chú rõ cần procedure `INSERT_ATTENDANCE_DATA` để sinh dữ liệu chi tiết và trigger `TRG_ATTENDANCE_CALCULATE_HOURS`.
4. **Payroll Calculation Module** – `/api/payrolls` xem kết quả; tính toán thực hiện qua các procedure 006-009 (được hướng dẫn ở README-Schema) và update PAYROLL table.
5. **Payment Module** – `/api/payments` đọc phiếu chi, procedure `CREATE_SALARY_PAYMENT` chuyển PAYROLL từ UNPAID → PAID.

### 8. Best Practices Đã Áp Dụng
- **Async/Await**: toàn bộ API handlers & service sử dụng async/await + try/catch + finally (đóng connection).
- **Service Layer**: `OracleService` cung cấp `select/insert/update/delete` dùng chung, tránh lặp SQL trong route.
- **Config Centralized**: `config/serverConfig.ts` (Oracle + flag mock), `config/publicConfig.ts` (API base URL). FE dùng `lib/apiClient.ts` để fetch có timeout mặc định.
- **Error Handling**: API trả về thông báo tiếng Việt + ghi log `console.error`.
- **Khóa ngoại**: SQL DDL (001) đã có constraint & index theo README-Schema (xem README-Schema mục 5-6).

### 9. Hướng Dẫn Chạy Oracle Procedure
1. **Tính bảng lương**: `CALL CALCULATE_PAYROLL(p_employee_code => 'NV001', p_month_year => '2025-10', p_result => :outVar);`
2. **Sinh phiếu chi**: `CALL CREATE_SALARY_PAYMENT(p_payment_date => SYSTIMESTAMP, p_approved_by => 'admin', ...)`.
3. **Sinh chấm công**: `CALL INSERT_ATTENDANCE_DATA('202510');`
Sau khi chạy, FE chỉ cần refresh để đọc dữ liệu mới qua API.

### 10. Tài Liệu Liên Quan
- `README-Schema.md`: mô tả chi tiết ERD, logic tính lương, trigger/procedure.
- Folder `../utc-oracle-29k1-salary-management/sql`: chứa toàn bộ script DB.
- `services/oracleService.ts`: nơi triển khai CRUD dùng chung.
- `lib/oracle.ts`: quản lý connection pool, đảm bảo không rò rỉ kết nối.

