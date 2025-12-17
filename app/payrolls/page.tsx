'use client';

import { useEffect, useState } from 'react';
import { Payroll } from '@/types/models';
import { FiDollarSign, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import PayrollCalculationForm from '@/components/forms/PayrollCalculationForm';

export default function PayrollsPage() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});

  // Modal states
  const [isCalculateModalOpen, setIsCalculateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleCalculate = () => {
    setIsCalculateModalOpen(true);
  };

  const handleCalculateSubmit = async (data: { monthNum: number; yearNum: number; empId?: string }) => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/payrolls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi tính bảng lương');

      const result = await response.json();
      alert(result.message || 'Tính bảng lương thành công');

      await fetchPayrolls();
      setIsCalculateModalOpen(false);
    } catch (error) {
      console.error('Lỗi khi tính bảng lương:', error);
      alert('Có lỗi xảy ra khi tính bảng lương');
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsViewModalOpen(true);
  };

  const handleDelete = (payroll: Payroll) => {
    setSelectedPayroll(payroll);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayroll) return;

    setFormLoading(true);
    try {
      const response = await fetch(`/api/payrolls/${selectedPayroll.payrollId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Lỗi khi xóa bảng lương');

      await fetchPayrolls();
      setIsDeleteDialogOpen(false);
      setSelectedPayroll(null);
    } catch (error) {
      console.error('Lỗi khi xóa bảng lương:', error);
      alert('Có lỗi xảy ra khi xóa bảng lương');
    } finally {
      setFormLoading(false);
    }
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
      key: 'payrollCode',
      label: 'Mã BL',
      width: '140px',
      render: (value, row) => value || row.payrollId,
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
      width: '100px',
      render: (_, row) => (
        <div className="action-buttons-container">
          <button
            className="action-btn action-btn--view"
            title="Xem chi tiết"
            onClick={() => handleView(row)}
          >
            <FiEye />
          </button>
          <button
            className="action-btn action-btn--delete"
            title="Xóa"
            onClick={() => handleDelete(row)}
          >
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
          <button className="btn btn-primary" onClick={handleCalculate}>
            <FiDollarSign style={{ marginRight: 'var(--space-2)' }} />
            Tính Bảng Lương
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

      {/* Calculate Modal */}
      <Modal
        isOpen={isCalculateModalOpen}
        onClose={() => setIsCalculateModalOpen(false)}
        title="Tính Bảng Lương"
        size="md"
      >
        <PayrollCalculationForm
          onSubmit={handleCalculateSubmit}
          onCancel={() => setIsCalculateModalOpen(false)}
          loading={formLoading}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPayroll(null);
        }}
        title="Chi Tiết Bảng Lương"
        size="lg"
      >
        {selectedPayroll && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Bảng Lương:</strong>{' '}
              {selectedPayroll.payrollCode || selectedPayroll.payrollId}
              {selectedPayroll.payrollCode && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                  ID hệ thống: {selectedPayroll.payrollId}
                </div>
              )}
            </div>
            <div>
              <strong>Mã NV:</strong> {selectedPayroll.empId}
            </div>
            <div>
              <strong>Tháng/Năm:</strong> {selectedPayroll.monthNum}/{selectedPayroll.yearNum}
            </div>
            <div>
              <strong>Lương Cơ Bản:</strong> {formatCurrency(selectedPayroll.basicSalary)}
            </div>
            <div>
              <strong>Phụ Cấp:</strong> {formatCurrency(selectedPayroll.allowance)}
            </div>
            <div>
              <strong>Thưởng:</strong> {formatCurrency(selectedPayroll.rewardAmount)}
            </div>
            <div>
              <strong>Phạt:</strong> {formatCurrency(selectedPayroll.penaltyAmount)}
            </div>
            <div>
              <strong>Lương OT:</strong> {formatCurrency(selectedPayroll.otSalary)}
            </div>
            <div>
              <strong>Tổng Lương:</strong> {formatCurrency(selectedPayroll.totalSalary)}
            </div>
            <div>
              <strong>Trạng Thái:</strong> {getStatusBadge(selectedPayroll.status)}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPayroll(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa bảng lương "${selectedPayroll?.payrollCode || selectedPayroll?.payrollId
          }"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
