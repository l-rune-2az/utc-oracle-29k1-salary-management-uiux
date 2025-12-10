'use client';

import { useEffect, useState } from 'react';
import { Penalty } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [filteredPenalties, setFilteredPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPenalties();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [penalties, searchFilters]);

  const fetchPenalties = async () => {
    try {
      const response = await fetch('/api/penalties');
      const data = await response.json();
      setPenalties(data);
      setFilteredPenalties(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phạt:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...penalties];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((penalty) =>
        penalty.empId?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.penaltyType) {
      const searchTerm = searchFilters.penaltyType.toLowerCase();
      filtered = filtered.filter((penalty) =>
        penalty.penaltyType?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPenalties(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    alert('Chức năng thêm phạt sẽ được triển khai sau');
  };

  const handleEdit = (penalty: Penalty) => {
    alert('Chức năng chỉnh sửa phạt sẽ được triển khai sau');
  };

  const handleView = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsViewModalOpen(true);
  };

  const handleDelete = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPenalty) return;
    
    setFormLoading(true);
    try {
      const response = await fetch('/api/penalties', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ penaltyId: selectedPenalty.penaltyId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa phạt');
      
      await fetchPenalties();
      setIsDeleteDialogOpen(false);
      setSelectedPenalty(null);
    } catch (error) {
      console.error('Lỗi khi xóa phạt:', error);
      alert('Có lỗi xảy ra khi xóa phạt');
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const searchFields = [
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
    { name: 'penaltyType', label: 'Loại Phạt', type: 'text' as const, placeholder: 'Nhập loại phạt...', width: 'medium' as const },
  ];

  const columns: Column<Penalty>[] = [
    {
      key: 'penaltyId',
      label: 'Mã Phạt',
      width: '120px',
    },
    {
      key: 'empId',
      label: 'Mã NV',
      width: '100px',
    },
    {
      key: 'penaltyType',
      label: 'Loại Phạt',
    },
    {
      key: 'penaltyDate',
      label: 'Ngày Phạt',
      render: (value) => formatDate(value),
    },
    {
      key: 'amount',
      label: 'Số Tiền',
      align: 'right',
      render: (value) => (
        <span style={{
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--error-500)',
        }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'reason',
      label: 'Lý Do',
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

  const paginatedData = filteredPenalties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phạt"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Phạt
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

      {filteredPenalties.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPenalties.length / itemsPerPage)}
          totalItems={filteredPenalties.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPenalty(null);
        }}
        title="Chi Tiết Phạt"
        size="md"
      >
        {selectedPenalty && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Phạt:</strong> {selectedPenalty.penaltyId}
            </div>
            <div>
              <strong>Mã NV:</strong> {selectedPenalty.empId}
            </div>
            <div>
              <strong>Loại Phạt:</strong> {selectedPenalty.penaltyType || '-'}
            </div>
            <div>
              <strong>Ngày Phạt:</strong> {formatDate(selectedPenalty.penaltyDate)}
            </div>
            <div>
              <strong>Số Tiền:</strong> {formatCurrency(selectedPenalty.amount)}
            </div>
            <div>
              <strong>Lý Do:</strong> {selectedPenalty.reason || '-'}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPenalty(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa phạt "${selectedPenalty?.penaltyId}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
