'use client';

import { useEffect, useState } from 'react';
import { FiFileText, FiDownload, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import Modal from '@/components/Modal';

type ReportType = 'salary' | 'attendance';

interface ReportData {
  [key: string]: any;
}

export default function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>('salary');
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    yearNum: number | null;
    monthNum: number | null;
    empCode: string;
    deptId: string;
  }>({
    yearNum: null,
    monthNum: null,
    empCode: '',
    deptId: '',
  });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType, filters]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(filters.yearNum && { yearNum: String(filters.yearNum) }),
        ...(filters.monthNum && { monthNum: String(filters.monthNum) }),
        ...(filters.empCode && { empCode: filters.empCode }),
        ...(filters.deptId && { deptId: filters.deptId }),
      });

      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Lỗi khi tải báo cáo');

      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Lỗi khi tải báo cáo:', error);
      alert('Có lỗi xảy ra khi tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export to Excel/PDF
    alert('Chức năng xuất báo cáo sẽ được triển khai sau');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const getSalaryColumns = (): Column<ReportData>[] => [
    { key: 'empId', label: 'Mã NV', width: '100px' },
    { key: 'empName', label: 'Họ Tên' },
    { key: 'deptName', label: 'Phòng Ban' },
    { key: 'positionName', label: 'Chức Vụ' },
    { key: 'monthYear', label: 'Tháng/Năm', align: 'center', render: (_, row) => `${row.monthNum}/${row.yearNum}` },
    { key: 'basicSalary', label: 'Lương Cơ Bản', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'allowance', label: 'Phụ Cấp', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'rewardAmount', label: 'Thưởng', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'penaltyAmount', label: 'Phạt', align: 'right', render: (v) => formatCurrency(v) },
    { key: 'otSalary', label: 'Lương OT', align: 'right', render: (v) => formatCurrency(v) },
    {
      key: 'totalSalary', label: 'Tổng Lương', align: 'right', render: (v) => (
        <span style={{ fontWeight: 'var(--font-weight-bold)', color: 'var(--primary-600)' }}>
          {formatCurrency(v)}
        </span>
      )
    },
    { key: 'status', label: 'Trạng Thái', align: 'center', render: (v) => v === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán' },
  ];

  const getAttendanceColumns = (): Column<ReportData>[] => [
    { key: 'empId', label: 'Mã NV', width: '100px' },
    { key: 'empName', label: 'Họ Tên' },
    { key: 'deptName', label: 'Phòng Ban' },
    { key: 'monthYear', label: 'Tháng/Năm', align: 'center', render: (_, row) => `${row.monthNum}/${row.yearNum}` },
    { key: 'workDays', label: 'Ngày Công', align: 'center', render: (v) => `${v} ngày` },
    { key: 'leaveDays', label: 'Ngày Nghỉ', align: 'center', render: (v) => `${v} ngày` },
    { key: 'otHours', label: 'Giờ OT', align: 'center', render: (v) => `${v} giờ` },
    { key: 'totalDays', label: 'Tổng Ngày', align: 'center', render: (v) => `${v} ngày` },
  ];



  const getColumns = (): Column<ReportData>[] => {
    switch (reportType) {
      case 'salary':
        return getSalaryColumns();
      case 'attendance':
        return getAttendanceColumns();
      default:
        return [];
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'salary':
        return 'Báo Cáo Lương';
      case 'attendance':
        return 'Báo Cáo Chấm Công';
      default:
        return 'Báo Cáo';
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <>
      <PageHeader
        title={getReportTitle()}
        actions={
          <>
            <button
              className="btn btn-secondary"
              onClick={() => setIsFilterModalOpen(true)}
              style={{ marginRight: 'var(--space-2)' }}
            >
              <FiFilter style={{ marginRight: 'var(--space-2)' }} />
              Lọc
            </button>
            <button className="btn btn-primary" onClick={handleExport}>
              <FiDownload style={{ marginRight: 'var(--space-2)' }} />
              Xuất Báo Cáo
            </button>
          </>
        }
      />

      {/* Report Type Tabs */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
        borderBottom: '2px solid var(--gray-200)',
      }}>
        {(['salary', 'attendance'] as ReportType[]).map((type) => (
          <button
            key={type}
            onClick={() => setReportType(type)}
            style={{
              padding: 'var(--space-3) var(--space-6)',
              border: 'none',
              background: 'transparent',
              borderBottom: reportType === type ? '3px solid var(--primary-500)' : '3px solid transparent',
              color: reportType === type ? 'var(--primary-600)' : 'var(--gray-600)',
              fontWeight: reportType === type ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)',
              cursor: 'pointer',
              transition: 'all var(--transition-normal)',
            }}
          >
            {type === 'salary' && 'Báo Cáo Lương'}
            {type === 'attendance' && 'Báo Cáo Chấm Công'}
          </button>
        ))}
      </div>

      <DataTable columns={getColumns()} data={reportData} loading={loading} />

      {reportData.length === 0 && !loading && (
        <div style={{
          textAlign: 'center',
          padding: 'var(--space-8)',
          color: 'var(--gray-500)',
        }}>
          Không có dữ liệu báo cáo
        </div>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Lọc Báo Cáo"
        size="md"
      >
        <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
          <div className="form-group">
            <label className="form-label">Năm</label>
            <select
              className="form-input"
              value={filters.yearNum ?? ''}
              onChange={(e) => setFilters({ ...filters, yearNum: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Tất cả</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Tháng</label>
            <select
              className="form-input"
              value={filters.monthNum ?? ''}
              onChange={(e) => setFilters({ ...filters, monthNum: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">Tất cả</option>
              {months.map((month) => (
                <option key={month} value={month}>Tháng {month}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Mã Nhân Viên</label>
            <input
              type="text"
              className="form-input"
              value={filters.empCode}
              onChange={(e) => setFilters({ ...filters, empCode: e.target.value })}
              placeholder="Nhập mã nhân viên"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Mã Phòng Ban</label>
            <input
              type="text"
              className="form-input"
              value={filters.deptId}
              onChange={(e) => setFilters({ ...filters, deptId: e.target.value })}
              placeholder="Nhập mã phòng ban"
            />
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-4)',
          }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setFilters({
                  yearNum: null,
                  monthNum: null,
                  empCode: '',
                  deptId: '',
                });
              }}
            >
              Đặt Lại
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsFilterModalOpen(false)}
            >
              Áp Dụng
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

