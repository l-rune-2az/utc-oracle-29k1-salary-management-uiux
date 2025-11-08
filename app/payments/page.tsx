'use client';

import { useEffect, useState } from 'react';
import { SalaryPayment } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchFilters]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/payments');
      const data = await response.json();
      setPayments(data);
      setFilteredPayments(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phiếu chi:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (searchFilters.payrollId) {
      const searchTerm = searchFilters.payrollId.toLowerCase();
      filtered = filtered.filter((payment) =>
        payment.payrollId?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPayments(filtered);
    setCurrentPage(1);
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy');
    } catch {
      return '-';
    }
  };

  const searchFields = [
    { name: 'payrollId', label: 'Mã Bảng Lương', type: 'text' as const, placeholder: 'Nhập mã bảng lương...', width: 'medium' as const },
  ];

  const columns: Column<SalaryPayment>[] = [
    {
      key: 'paymentId',
      label: 'Mã Phiếu Chi',
      width: '150px',
    },
    {
      key: 'payrollId',
      label: 'Mã Bảng Lương',
      width: '150px',
    },
    {
      key: 'paymentDate',
      label: 'Ngày Thanh Toán',
      render: (value) => formatDate(value),
    },
    {
      key: 'approvedBy',
      label: 'Người Phê Duyệt',
    },
    {
      key: 'note',
      label: 'Ghi Chú',
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

  const paginatedData = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phiếu Chi Lương"
        actions={
          <button className="btn btn-primary">
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Tạo Phiếu Chi
          </button>
        }
      />

      <SearchFilter
        fields={searchFields}
        onSearch={(values) => setSearchFilters(values)}
        onReset={() => setSearchFilters({})}
        realTime={true}
      />

      <DataTable columns={columns} data={paginatedData} loading={loading} />

      {filteredPayments.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPayments.length / itemsPerPage)}
          totalItems={filteredPayments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
