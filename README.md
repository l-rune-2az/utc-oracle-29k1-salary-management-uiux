# Hệ Thống Quản Lý Lương Thưởng

Hệ thống quản lý lương thưởng được xây dựng với Next.js 14, TypeScript và Tailwind CSS.

## Tính Năng

- ✅ Quản lý Phòng Ban
- ✅ Quản lý Chức Vụ
- ✅ Quản lý Nhân Viên
- ✅ Quản lý Hợp Đồng
- ✅ Quản lý Chấm Công
- ✅ Quản lý Thưởng
- ✅ Quản lý Phạt
- ✅ Quản lý Bảng Lương
- ✅ Quản lý Phiếu Chi Lương
- ✅ Dashboard thống kê

## Công Nghệ Sử Dụng

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Icons** - Icons
- **date-fns** - Date formatting

## Cài Đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Chạy development server:
```bash
npm run dev
```

3. Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

## Cấu Trúc Project

```
├── app/
│   ├── api/              # API routes (hiện tại dùng mock data)
│   ├── departments/      # Trang quản lý phòng ban
│   ├── positions/        # Trang quản lý chức vụ
│   ├── employees/        # Trang quản lý nhân viên
│   ├── contracts/        # Trang quản lý hợp đồng
│   ├── attendances/      # Trang quản lý chấm công
│   ├── rewards/          # Trang quản lý thưởng
│   ├── penalties/        # Trang quản lý phạt
│   ├── payrolls/         # Trang quản lý bảng lương
│   ├── payments/         # Trang quản lý phiếu chi
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Trang chủ/Dashboard
│   └── globals.css       # Global styles
├── components/
│   └── Sidebar.tsx       # Sidebar navigation
├── data/
│   └── mockData.ts       # Mock data cho tất cả các bảng
├── types/
│   └── models.ts         # TypeScript interfaces
└── lib/
    └── oracle.ts         # Oracle connection (placeholder)
```

## Kết Nối Oracle Database

Hiện tại project đang sử dụng **mock data**. Để kết nối với Oracle Database:

1. Cài đặt package `oracledb`:
```bash
npm install oracledb
```

2. Tạo file `.env.local` với cấu hình Oracle:
```env
ORACLE_USER=your_username
ORACLE_PASSWORD=your_password
ORACLE_CONNECTION_STRING=localhost:1521/XE
```

3. Cập nhật file `lib/oracle.ts` với code kết nối Oracle (đã có sẵn comment hướng dẫn)

4. Thay thế mock data trong các API routes (`app/api/*/route.ts`) bằng các hàm query Oracle từ `lib/oracle.ts`

Tất cả các API routes đã có comment `// TODO: Thay bằng query Oracle` để dễ dàng thay thế sau này.

## Build Production

```bash
npm run build
npm start
```

## License

MIT
