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
- [x] PUT - Cập nhật chức vụ
- [x] DELETE - Xóa chức vụ
- [x] UI - Trang quản lý chức vụ

**Trạng thái:** ✅ **HOÀN THÀNH**

### 1.3. Quản lý Nhân Viên
- [x] GET - Lấy danh sách nhân viên
- [x] POST - Tạo nhân viên mới
- [x] PUT - Cập nhật nhân viên
- [x] DELETE - Xóa nhân viên
- [x] UI - Trang quản lý nhân viên
- [x] Quản lý người phụ thuộc (EMPLOYEE_DEPENDENT)

**Trạng thái:** ✅ **HOÀN THÀNH**

---

## 2. QUẢN LÝ HỢP ĐỒNG

### 2.1. Quản lý Hợp Đồng
- [x] GET - Lấy danh sách hợp đồng
- [x] POST - Tạo hợp đồng mới
- [x] PUT - Cập nhật hợp đồng
- [x] DELETE - Xóa hợp đồng
- [x] UI - Trang quản lý hợp đồng

**Trạng thái:** ✅ **HOÀN THÀNH**

### 2.2. Quản lý Phụ Cấp
- [x] GET - Lấy danh sách phụ cấp nhân viên
- [x] POST - Gán phụ cấp cho nhân viên
- [x] PUT - Cập nhật phụ cấp
- [x] DELETE - Xóa phụ cấp
- [x] UI - Trang quản lý phụ cấp

**Trạng thái:** ✅ **HOÀN THÀNH**

---

## 3. QUẢN LÝ CHẤM CÔNG VÀ HOẠT ĐỘNG

### 3.1. Quản lý Chấm Công
- [x] GET - Xem danh sách chấm công (tổng hợp theo tháng)
- [x] POST - Tạo dữ liệu chấm công (khuyến nghị dùng procedure INSERT_ATTENDANCE_DATA)
- [x] PUT - Cập nhật chấm công
- [x] DELETE - Xóa chấm công
- [x] UI - Trang quản lý chấm công
- [x] Oracle Trigger tự động tính giờ làm việc và OT

**Trạng thái:** ✅ **HOÀN THÀNH** (POST có thể dùng mock data, khuyến nghị dùng procedure cho production)

### 3.2. Quản lý Thưởng
- [x] GET - Lấy danh sách thưởng
- [x] POST - Tạo thưởng mới
- [x] PUT - Cập nhật thưởng
- [x] DELETE - Xóa thưởng
- [x] UI - Trang quản lý thưởng

**Trạng thái:** ✅ **HOÀN THÀNH**

### 3.3. Quản lý Phạt
- [x] GET - Lấy danh sách phạt
- [x] POST - Tạo phạt mới
- [x] PUT - Cập nhật phạt
- [x] DELETE - Xóa phạt
- [x] UI - Trang quản lý phạt

**Trạng thái:** ✅ **HOÀN THÀNH**

---

## 4. TÍNH TOÁN VÀ THANH TOÁN LƯƠNG

### 4.1. Tính Bảng Lương
- [x] GET - Xem danh sách bảng lương
- [x] POST - Tính bảng lương (đã thay thế procedure bằng query trực tiếp)
- [x] UI - Trang xem bảng lương
- [x] Tính toán từ các nguồn dữ liệu:
  - [x] BASIC_SALARY từ Contract
  - [x] ALLOWANCE từ Employee_Allowance
  - [x] REWARD_AMOUNT từ Reward
  - [x] PENALTY_AMOUNT từ Penalty
  - [x] OT_SALARY từ Attendance

**Trạng thái:** ✅ **HOÀN THÀNH** (Đã thay thế procedure bằng query trực tiếp)

### 4.2. Tạo Phiếu Chi
- [x] GET - Xem danh sách phiếu chi
- [x] POST - Tạo phiếu chi (đã thay thế procedure bằng INSERT query trực tiếp)
- [x] UI - Trang quản lý phiếu chi
- [x] Tự động cập nhật trạng thái PAYROLL thành PAID

**Trạng thái:** ✅ **HOÀN THÀNH** (Đã thay thế procedure bằng query trực tiếp)

---

## 5. BÁO CÁO VÀ TRA CỨU

### 5.1. Xem Báo Cáo
- [x] Báo cáo lương
- [x] Báo cáo chấm công
- [x] Báo cáo thanh toán
- [ ] Xuất báo cáo (Excel/PDF) - **BỎ QUA** (không yêu cầu)
- [x] UI - Trang báo cáo

**Trạng thái:** ✅ **HOÀN THÀNH** (Bỏ qua export Excel/PDF)

---

## TỔNG KẾT

### Đã hoàn thành: 10/10 nhóm chức năng chính
1. ✅ Quản lý Phòng Ban - **HOÀN THÀNH**
2. ✅ Quản lý Chức Vụ - **HOÀN THÀNH**
3. ✅ Quản lý Nhân Viên - **HOÀN THÀNH**
4. ✅ Quản lý Hợp Đồng - **HOÀN THÀNH**
5. ✅ Quản lý Phụ Cấp - **HOÀN THÀNH**
6. ✅ Quản lý Chấm Công - **HOÀN THÀNH**
7. ✅ Quản lý Thưởng - **HOÀN THÀNH**
8. ✅ Quản lý Phạt - **HOÀN THÀNH**
9. ✅ Tính Bảng Lương - **HOÀN THÀNH**
10. ✅ Tạo Phiếu Chi - **HOÀN THÀNH**
11. ✅ Xem Báo Cáo - **HOÀN THÀNH**

### Các chức năng đã bỏ qua (không yêu cầu):
- [ ] Xuất báo cáo ra Excel/PDF - **BỎ QUA** (không yêu cầu)

### Ghi chú:
- ✅ Đã thay thế procedure CREATE_SALARY_PAYMENT bằng INSERT query trực tiếp
- ✅ Đã thay thế procedure CALCULATE_PAYROLL bằng query trực tiếp (tính toán từ Contract, Allowance, Reward, Penalty, Attendance)
- ✅ Chấm Công: POST đã có thể dùng query trực tiếp (có thể dùng mock data hoặc query, khuyến nghị dùng procedure INSERT_ATTENDANCE_DATA cho production để đảm bảo tính toán chính xác)
- ✅ Tất cả các module đã có đầy đủ CRUD operations
- ✅ Báo Cáo đã có đầy đủ 3 loại: Lương, Chấm Công, Thanh Toán với filter đầy đủ

