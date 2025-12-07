# CHECKLIST CHỨC NĂNG HỆ THỐNG
## HỆ THỐNG QUẢN LÝ LƯƠNG

**Phiên bản:** 1.0  
**Ngày cập nhật:** 2025-01-XX

---

## 1. QUẢN LÝ DỮ LIỆU CƠ BẢN

### 1.1. Quản lý Phòng Ban
- [x] GET - Lấy danh sách phòng ban
- [x] POST - Tạo phòng ban mới
- [x] PUT - Cập nhật phòng ban
- [x] DELETE - Xóa phòng ban
- [x] UI - Trang quản lý phòng ban

**Trạng thái:** ✅ **HOÀN THÀNH**

### 1.2. Quản lý Chức Vụ
- [x] GET - Lấy danh sách chức vụ
- [x] POST - Tạo chức vụ mới
- [ ] PUT - Cập nhật chức vụ
- [ ] DELETE - Xóa chức vụ
- [x] UI - Trang quản lý chức vụ

**Trạng thái:** ⚠️ **MỘT PHẦN** (Thiếu PUT, DELETE)

### 1.3. Quản lý Nhân Viên
- [x] GET - Lấy danh sách nhân viên
- [x] POST - Tạo nhân viên mới
- [ ] PUT - Cập nhật nhân viên
- [ ] DELETE - Xóa nhân viên
- [x] UI - Trang quản lý nhân viên
- [ ] Quản lý người phụ thuộc (EMPLOYEE_DEPENDENT)

**Trạng thái:** ⚠️ **MỘT PHẦN** (Thiếu PUT, DELETE, Quản lý người phụ thuộc)

---

## 2. QUẢN LÝ HỢP ĐỒNG

### 2.1. Quản lý Hợp Đồng
- [x] GET - Lấy danh sách hợp đồng
- [x] POST - Tạo hợp đồng mới
- [ ] PUT - Cập nhật hợp đồng
- [ ] DELETE - Xóa hợp đồng
- [x] UI - Trang quản lý hợp đồng

**Trạng thái:** ⚠️ **MỘT PHẦN** (Thiếu PUT, DELETE)

### 2.2. Quản lý Phụ Cấp
- [ ] GET - Lấy danh sách phụ cấp nhân viên
- [ ] POST - Gán phụ cấp cho nhân viên
- [ ] PUT - Cập nhật phụ cấp
- [ ] DELETE - Xóa phụ cấp
- [ ] UI - Trang quản lý phụ cấp

**Trạng thái:** ❌ **CHƯA HOÀN THÀNH**

---

## 3. QUẢN LÝ CHẤM CÔNG VÀ HOẠT ĐỘNG

### 3.1. Quản lý Chấm Công
- [x] GET - Xem danh sách chấm công (tổng hợp theo tháng)
- [ ] POST - Tạo dữ liệu chấm công (cần procedure INSERT_ATTENDANCE_DATA)
- [ ] PUT - Cập nhật chấm công
- [ ] DELETE - Xóa chấm công
- [x] UI - Trang quản lý chấm công
- [x] Oracle Trigger tự động tính giờ làm việc và OT

**Trạng thái:** ⚠️ **MỘT PHẦN** (POST cần procedure, thiếu PUT, DELETE)

### 3.2. Quản lý Thưởng
- [x] GET - Lấy danh sách thưởng
- [x] POST - Tạo thưởng mới
- [ ] PUT - Cập nhật thưởng
- [ ] DELETE - Xóa thưởng
- [x] UI - Trang quản lý thưởng

**Trạng thái:** ⚠️ **MỘT PHẦN** (Thiếu PUT, DELETE)

### 3.3. Quản lý Phạt
- [x] GET - Lấy danh sách phạt
- [x] POST - Tạo phạt mới
- [ ] PUT - Cập nhật phạt
- [ ] DELETE - Xóa phạt
- [x] UI - Trang quản lý phạt

**Trạng thái:** ⚠️ **MỘT PHẦN** (Thiếu PUT, DELETE)

---

## 4. TÍNH TOÁN VÀ THANH TOÁN LƯƠNG

### 4.1. Tính Bảng Lương
- [x] GET - Xem danh sách bảng lương
- [ ] POST - Tính bảng lương (cần procedure CALCULATE_PAYROLL)
- [x] UI - Trang xem bảng lương
- [ ] Gọi PL/SQL Procedures:
  - [ ] CALCULATE_WORKING_SALARY
  - [ ] CALCULATE_OT_SALARY
  - [ ] CALCULATE_INSURANCE_TAX
  - [ ] CALCULATE_PAYROLL

**Trạng thái:** ⚠️ **MỘT PHẦN** (POST cần procedure)

### 4.2. Tạo Phiếu Chi
- [x] GET - Xem danh sách phiếu chi
- [ ] POST - Tạo phiếu chi (cần procedure CREATE_SALARY_PAYMENT)
- [x] UI - Trang quản lý phiếu chi
- [ ] Gọi procedure CREATE_SALARY_PAYMENT

**Trạng thái:** ⚠️ **MỘT PHẦN** (POST cần procedure)

---

## 5. BÁO CÁO VÀ TRA CỨU

### 5.1. Xem Báo Cáo
- [ ] Báo cáo lương
- [ ] Báo cáo chấm công
- [ ] Báo cáo thanh toán
- [ ] Xuất báo cáo (Excel/PDF)
- [ ] UI - Trang báo cáo

**Trạng thái:** ❌ **CHƯA HOÀN THÀNH**

---

## TỔNG KẾT

### Đã hoàn thành: 8/9 nhóm chức năng chính (một phần)
1. ✅ Quản lý Phòng Ban - **HOÀN THÀNH**
2. ⚠️ Quản lý Chức Vụ - **MỘT PHẦN**
3. ⚠️ Quản lý Nhân Viên - **MỘT PHẦN**
4. ⚠️ Quản lý Hợp Đồng - **MỘT PHẦN**
5. ⚠️ Quản lý Chấm Công - **MỘT PHẦN**
6. ⚠️ Quản lý Thưởng/Phạt - **MỘT PHẦN**
7. ⚠️ Tính Bảng Lương - **MỘT PHẦN**
8. ⚠️ Tạo Phiếu Chi - **MỘT PHẦN**
9. ❌ Xem Báo Cáo - **CHƯA HOÀN THÀNH**

### Các chức năng còn thiếu:
- [ ] Quản lý Phụ Cấp (EMPLOYEE_ALLOWANCE)
- [ ] PUT/DELETE cho Chức Vụ, Nhân Viên, Hợp Đồng, Thưởng, Phạt
- [ ] POST cho Chấm Công (cần procedure INSERT_ATTENDANCE_DATA)
- [ ] POST cho Tính Bảng Lương (cần procedure CALCULATE_PAYROLL)
- [ ] POST cho Tạo Phiếu Chi (cần procedure CREATE_SALARY_PAYMENT)
- [ ] Tất cả chức năng Báo Cáo

### Ghi chú:
- Các chức năng POST cho Chấm Công, Tính Bảng Lương, Tạo Phiếu Chi cần tích hợp với PL/SQL Stored Procedures
- Cần bổ sung các chức năng PUT/DELETE cho các module còn thiếu
- Cần phát triển module Báo Cáo hoàn chỉnh

