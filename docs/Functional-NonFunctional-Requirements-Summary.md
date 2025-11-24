# TỔNG HỢP YÊU CẦU CHỨC NĂNG VÀ PHI CHỨC NĂNG
## HỆ THỐNG QUẢN LÝ LƯƠNG

**Phiên bản:** 1.0  
**Ngày tạo:** 2025-01-XX

---

## 1. DANH SÁCH CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 1.1. Quản lý Dữ liệu Cơ bản
- **Quản lý Phòng Ban**: CRUD phòng ban (tạo, đọc, cập nhật, xóa)
- **Quản lý Chức Vụ**: CRUD chức vụ
- **Quản lý Nhân Viên**: Quản lý thông tin nhân viên và người phụ thuộc

### 1.2. Quản lý Hợp Đồng
- **Quản lý Hợp Đồng**: Tạo và quản lý hợp đồng lao động
- **Quản lý Phụ Cấp**: Gán phụ cấp cho nhân viên

### 1.3. Quản lý Chấm Công và Hoạt Động
- **Quản lý Chấm Công**: Xem và quản lý dữ liệu chấm công (tự động tính giờ làm việc và OT)
- **Quản lý Thưởng**: Tạo và quản lý các khoản thưởng
- **Quản lý Phạt**: Tạo và quản lý các khoản phạt

### 1.4. Tính Toán và Thanh Toán Lương
- **Tính Bảng Lương**: Tính toán bảng lương tự động (lương làm việc, OT, bảo hiểm, thuế)
- **Tạo Phiếu Chi**: Tạo phiếu chi lương từ bảng lương chưa thanh toán

### 1.5. Báo Cáo và Tra Cứu
- **Xem Báo Cáo**: Xem các báo cáo về lương, chấm công, thanh toán

---

## 2. DANH SÁCH YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 2.1. Kiến trúc Hệ thống
- **Mô hình 3 lớp**: Presentation Layer, Business Logic Layer, Data Layer
- **Tách biệt trách nhiệm**: Mỗi lớp có trách nhiệm riêng biệt
- **Tính mở rộng**: Dễ dàng thêm tính năng mới
- **Tính bảo trì**: Code có cấu trúc rõ ràng, dễ bảo trì

### 2.2. Công nghệ và Framework
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Oracle Database (tất cả dữ liệu lưu trữ trong Oracle DB)
- **Connection Management**: Oracle Connection Pooling

### 2.3. Hiệu năng (Performance)
- **Connection Pooling**: Quản lý kết nối Oracle Database hiệu quả
- **Query Optimization**: Tối ưu truy vấn với Oracle Database engine
- **Indexing**: Sử dụng indexing trong Oracle Database
- **Partitioning**: Bảng ATTENDANCE được partition theo tháng

### 2.4. Bảo mật (Security)
- **Validation**: Validate dữ liệu đầu vào
- **Error Handling**: Xử lý lỗi đầy đủ
- **ACID Properties**: Oracle Database đảm bảo tính toàn vẹn dữ liệu
- **Configuration Management**: Quản lý cấu hình an toàn (credentials, connection strings)

### 2.5. Độ tin cậy (Reliability)
- **Transaction Management**: Hỗ trợ transaction với Oracle Database
- **Error Recovery**: Xử lý và phục hồi lỗi
- **Data Consistency**: Tất cả dữ liệu tập trung trong Oracle Database, đảm bảo tính nhất quán

### 2.6. Khả năng sử dụng (Usability)
- **UI/UX**: Giao diện hiện đại với Tailwind CSS và Design System
- **Type Safety**: TypeScript đảm bảo type safety
- **Responsive Design**: Giao diện responsive

### 2.7. Khả năng kiểm thử (Testability)
- **Tách biệt lớp**: Có thể test từng lớp độc lập
- **Mock Dependencies**: Dễ dàng mock dependencies để testing

### 2.8. Tự động hóa (Automation)
- **Database Triggers**: Oracle Database triggers tự động tính toán (ví dụ: tính giờ làm việc và OT)
- **Stored Procedures**: PL/SQL stored procedures xử lý logic nghiệp vụ phức tạp

---

## 3. TỔNG KẾT

### Chức năng chính: 9 nhóm
1. Quản lý Phòng Ban
2. Quản lý Chức Vụ
3. Quản lý Nhân Viên
4. Quản lý Hợp Đồng
5. Quản lý Chấm Công
6. Quản lý Thưởng/Phạt
7. Tính Bảng Lương
8. Tạo Phiếu Chi
9. Xem Báo Cáo

### Yêu cầu phi chức năng: 8 nhóm
1. Kiến trúc Hệ thống (3 lớp, tách biệt trách nhiệm)
2. Công nghệ (Next.js, React, TypeScript, Oracle DB)
3. Hiệu năng (Connection pooling, Query optimization)
4. Bảo mật (Validation, Error handling, ACID)
5. Độ tin cậy (Transaction, Data consistency)
6. Khả năng sử dụng (UI/UX, Type safety)
7. Khả năng kiểm thử (Tách biệt lớp, Mock)
8. Tự động hóa (Triggers, Stored procedures)

