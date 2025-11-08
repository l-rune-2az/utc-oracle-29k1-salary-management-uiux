'use client';

import { useEffect, useState } from 'react';
import { Position } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import PositionForm from '@/components/forms/PositionForm';

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [filteredPositions, setFilteredPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchPositions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [positions, searchFilters]);

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      setPositions(data);
      setFilteredPositions(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chức vụ:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...positions];

    if (searchFilters.positionName) {
      const searchTerm = searchFilters.positionName.toLowerCase();
      filtered = filtered.filter((pos) =>
        pos.positionName?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredPositions(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedPosition(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (position: Position) => {
    setSelectedPosition(position);
    setIsEditModalOpen(true);
  };

  const handleView = (position: Position) => {
    setSelectedPosition(position);
    setIsViewModalOpen(true);
  };

  const handleDelete = (position: Position) => {
    setSelectedPosition(position);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Position) => {
    setFormLoading(true);
    try {
      if (selectedPosition) {
        setPositions((prev) =>
          prev.map((pos) => (pos.positionId === data.positionId ? data : pos))
        );
      } else {
        setPositions((prev) => [...prev, data]);
      }
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Lỗi khi lưu chức vụ:', error);
      alert('Có lỗi xảy ra khi lưu chức vụ');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedPosition) return;
    
    setFormLoading(true);
    try {
      setPositions((prev) =>
        prev.filter((pos) => pos.positionId !== selectedPosition.positionId)
      );
      
      setIsDeleteDialogOpen(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Lỗi khi xóa chức vụ:', error);
      alert('Có lỗi xảy ra khi xóa chức vụ');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const searchFields = [
    { name: 'positionName', label: 'Tên Chức Vụ', type: 'text' as const, placeholder: 'Nhập tên chức vụ...', width: 'full' as const },
  ];

  const columns: Column<Position>[] = [
    {
      key: 'positionId',
      label: 'Mã Chức Vụ',
      width: '150px',
    },
    {
      key: 'positionName',
      label: 'Tên Chức Vụ',
    },
    {
      key: 'baseSalary',
      label: 'Lương Cơ Bản',
      align: 'right',
      render: (value) => formatCurrency(value),
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

  const paginatedData = filteredPositions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Chức Vụ"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Chức Vụ
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

      {filteredPositions.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredPositions.length / itemsPerPage)}
          totalItems={filteredPositions.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPosition(null);
        }}
        title="Thêm Chức Vụ Mới"
        size="md"
      >
        <PositionForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedPosition(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPosition(null);
        }}
        title="Chỉnh Sửa Chức Vụ"
        size="md"
      >
        {selectedPosition && (
          <PositionForm
            position={selectedPosition}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedPosition(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPosition(null);
        }}
        title="Chi Tiết Chức Vụ"
        size="sm"
      >
        {selectedPosition && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Chức Vụ:</strong> {selectedPosition.positionId}
            </div>
            <div>
              <strong>Tên Chức Vụ:</strong> {selectedPosition.positionName}
            </div>
            <div>
              <strong>Lương Cơ Bản:</strong> {formatCurrency(selectedPosition.baseSalary)}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPosition(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa chức vụ "${selectedPosition?.positionName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
