'use client';

import { useEffect, useState } from 'react';
import { SalaryPayment } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<SalaryPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<SalaryPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
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

  const handleCreate = () => {
    alert('Chức năng tạo phiếu chi sẽ được triển khai sau');
  };

  const handleEdit = (payment: SalaryPayment) => {
    alert('Chức năng chỉnh sửa phiếu chi sẽ được triển khai sau');
  };

  const handleView = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleDelete = (payment: SalaryPayment) => {
    setSelectedPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPayment) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/payments/${selectedPayment.paymentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Lỗi khi xóa phiếu chi');
      
      await fetchPayments();
      setIsDeleteDialogOpen(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error('Lỗi khi xóa phiếu chi:', error);
      alert('Có lỗi xảy ra khi xóa phiếu chi');
    } finally {
      setFormLoading(false);
    }
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
      key: 'paymentCode',
      label: 'Mã Phiếu Chi',
      width: '160px',
      render: (value, row) => value || row.paymentId,
    },
    {
      key: 'payrollCode',
      label: 'Mã Bảng Lương',
      width: '160px',
      render: (value, row) => value || row.payrollId,
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
          <button
            className="action-btn action-btn--view"
            title="Xem chi tiết"
            onClick={() => handleView(row)}
          >
            <FiEye />
          </button>
          <button
            className="action-btn action-btn--edit"
            title="Chỉnh sửa"
            onClick={() => handleEdit(row)}
          >
            <FiEdit2 />
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

  const paginatedData = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phiếu Chi Lương"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
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

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPayment(null);
        }}
        title="Chi Tiết Phiếu Chi"
        size="md"
      >
        {selectedPayment && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Phiếu Chi:</strong>{' '}
              {selectedPayment.paymentCode || selectedPayment.paymentId}
              {selectedPayment.paymentCode && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                  ID hệ thống: {selectedPayment.paymentId}
                </div>
              )}
            </div>
            <div>
              <strong>Mã Bảng Lương:</strong>{' '}
              {selectedPayment.payrollCode || selectedPayment.payrollId}
            </div>
            <div>
              <strong>Ngày Thanh Toán:</strong> {formatDate(selectedPayment.paymentDate)}
            </div>
            <div>
              <strong>Người Phê Duyệt:</strong> {selectedPayment.approvedBy || '-'}
            </div>
            <div>
              <strong>Ghi Chú:</strong> {selectedPayment.note || '-'}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPayment(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa phiếu chi "${
          selectedPayment?.paymentCode || selectedPayment?.paymentId
        }"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
