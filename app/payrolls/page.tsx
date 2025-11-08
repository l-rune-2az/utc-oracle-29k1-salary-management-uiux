'use client';

import { useEffect, useState } from 'react';
import { Payroll } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function PayrollsPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayrolls();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payrolls, searchFilters]);

  const fetchPayrolls = async () => {
    try {
      const response = await fetch('/api/payrolls');
      const data = await response.json();
      setPayrolls(data);
      setFilteredPayrolls(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bảng lương:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payrolls];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((payroll) =>
        payroll.empId?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.status) {
      filtered = filtered.filter((payroll) => payroll.status === searchFilters.status);
    }

    setFilteredPayrolls(filtered);
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status?: string) => {
    if (status === 'PAID') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: 'var(--font-weight-semibold)',
          background: '#dcfce7',
          color: '#166534',
        }}>
          Đã thanh toán
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--font-size-xs)',
        fontWeight: 'var(--font-weight-semibold)',
        background: '#fef3c7',
        color: '#92400e',
      }}>
        Chưa thanh toán
      </span>
    );
  };

  const searchFields = [
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
    {
      name: 'status',
      label: 'Trạng Thái',
      type: 'select' as const,
      width: 'select' as const,
      options: [
        { value: 'PAID', label: 'Đã thanh toán' },
        { value: 'UNPAID', label: 'Chưa thanh toán' },
      ],
    },
  ];

  const columns: Column<Payroll>[] = [
    {
      key: 'payrollId',
      label: 'Mã BL',
      width: '100px',
    },
    {
      key: 'empId',
      label: 'Mã NV',
      width: '100px',
    },
    {
      key: 'monthYear',
      label: 'Tháng/Năm',
      align: 'center',
      render: (_, row) => `${row.monthNum}/${row.yearNum}`,
    },
    {
      key: 'basicSalary',
      label: 'Lương Cơ Bản',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'allowance',
      label: 'Phụ Cấp',
      align: 'right',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'rewardAmount',
      label: 'Thưởng',
      align: 'right',
      render: (value) => (
        <span style={{ color: 'var(--success-500)' }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'penaltyAmount',
      label: 'Phạt',
      align: 'right',
      render: (value) => (
        <span style={{ color: 'var(--error-500)' }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'totalSalary',
      label: 'Tổng Lương',
      align: 'right',
      render: (value) => (
        <span style={{
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--primary-600)',
        }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Trạng Thái',
      align: 'center',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'actions',
      label: 'Thao Tác',
      align: 'center',
      width: '140px',
      render: (_, row) => (
        <div className="action-buttons-container">
          <button className="action-btn action-btn--view" title="Xem chi tiết">
            <FiEye />
          </button>
          <button className="action-btn action-btn--edit" title="Chỉnh sửa">
            <FiEdit2 />
          </button>
          <button className="action-btn action-btn--delete" title="Xóa">
            <FiTrash2 />
          </button>
        </div>
      ),
    },
  ];

  const paginatedData = filteredPayrolls.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Bảng Lương"
        actions={
          <button className="btn btn-primary">
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Tạo Bảng Lương
          </button>
        }
      />

      <SearchFilter
        fields={searchFields}
        onSearch={(values) => setSearchFilters(values)}
        onReset={() => setSearchFilters({})}
        realTime={true}
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
      />

      {filteredPayrolls.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPayrolls.length / itemsPerPage)}
          totalItems={filteredPayrolls.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
