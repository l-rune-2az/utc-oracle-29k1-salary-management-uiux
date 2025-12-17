'use client';

import { useEffect, useState } from 'react';
import { EmployeeAllowance } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import AllowanceForm from '@/components/forms/AllowanceForm';

export default function AllowancesPage() {
  const [allowances, setAllowances] = useState<EmployeeAllowance[]>([]);
  const [filteredAllowances, setFilteredAllowances] = useState<EmployeeAllowance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAllowance, setSelectedAllowance] = useState<EmployeeAllowance | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllowances();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allowances, searchFilters]);

  const fetchAllowances = async () => {
    try {
      const response = await fetch('/api/allowances');
      const data = await response.json();
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAllowances(data);
        setFilteredAllowances(data);
      } else {
        console.error('API returned non-array data:', data);
        setAllowances([]);
        setFilteredAllowances([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách phụ cấp:', error);
      setAllowances([]);
      setFilteredAllowances([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allowances];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((allowance) =>
        allowance.empId?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.allowanceType) {
      const searchTerm = searchFilters.allowanceType.toLowerCase();
      filtered = filtered.filter((allowance) =>
        allowance.allowanceType?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.status) {
      filtered = filtered.filter((allowance) => allowance.status === searchFilters.status);
    }

    setFilteredAllowances(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedAllowance(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (allowance: EmployeeAllowance) => {
    setSelectedAllowance(allowance);
    setIsEditModalOpen(true);
  };

  const handleView = (allowance: EmployeeAllowance) => {
    setSelectedAllowance(allowance);
    setIsViewModalOpen(true);
  };

  const handleDelete = (allowance: EmployeeAllowance) => {
    setSelectedAllowance(allowance);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: EmployeeAllowance) => {
    setFormLoading(true);
    try {
      const url = '/api/allowances';
      const method = selectedAllowance ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu phụ cấp');

      await fetchAllowances();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedAllowance(null);
    } catch (error) {
      console.error('Lỗi khi lưu phụ cấp:', error);
      alert('Có lỗi xảy ra khi lưu phụ cấp');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAllowance) return;

    setFormLoading(true);
    try {
      const response = await fetch('/api/allowances', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowanceId: selectedAllowance.allowanceId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa phụ cấp');

      await fetchAllowances();
      setIsDeleteDialogOpen(false);
      setSelectedAllowance(null);
    } catch (error) {
      console.error('Lỗi khi xóa phụ cấp:', error);
      alert('Có lỗi xảy ra khi xóa phụ cấp');
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

  const getStatusBadge = (status?: string) => {
    if (status === 'ACTIVE') {
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
          Đang áp dụng
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
        background: '#fee2e2',
        color: '#991b1b',
      }}>
        Đã kết thúc
      </span>
    );
  };

  const searchFields = [
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
    { name: 'allowanceType', label: 'Loại Phụ Cấp', type: 'text' as const, placeholder: 'Nhập loại phụ cấp...', width: 'medium' as const },
    {
      name: 'status',
      label: 'Trạng Thái',
      type: 'select' as const,
      width: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Đang áp dụng' },
        { value: 'INACTIVE', label: 'Đã kết thúc' },
      ],
    },
  ];

  const columns: Column<EmployeeAllowance>[] = [
    {
      key: 'allowanceId',
      label: 'Mã Phụ Cấp',
      width: '120px',
    },
    {
      key: 'empId',
      label: 'Mã NV',
      width: '100px',
    },
    {
      key: 'allowanceType',
      label: 'Loại Phụ Cấp',
    },
    {
      key: 'amount',
      label: 'Số Tiền',
      align: 'right',
      render: (value) => (
        <span style={{
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--success-500)',
        }}>
          {formatCurrency(value)}
        </span>
      ),
    },
    {
      key: 'startDate',
      label: 'Ngày Bắt Đầu',
      render: (value) => formatDate(value),
    },
    {
      key: 'endDate',
      label: 'Ngày Kết Thúc',
      render: (value) => formatDate(value),
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

  const paginatedData = filteredAllowances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phụ Cấp"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Phụ Cấp
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

      {filteredAllowances.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredAllowances.length / itemsPerPage)}
          totalItems={filteredAllowances.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedAllowance(null);
        }}
        title="Thêm Phụ Cấp Mới"
        size="md"
      >
        <AllowanceForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedAllowance(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedAllowance(null);
        }}
        title="Chỉnh Sửa Phụ Cấp"
        size="md"
      >
        {selectedAllowance && (
          <AllowanceForm
            allowance={selectedAllowance}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedAllowance(null);
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
          setSelectedAllowance(null);
        }}
        title="Chi Tiết Phụ Cấp"
        size="md"
      >
        {selectedAllowance && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Phụ Cấp:</strong> {selectedAllowance.allowanceId}
            </div>
            <div>
              <strong>Mã NV:</strong> {selectedAllowance.empId}
            </div>
            <div>
              <strong>Loại Phụ Cấp:</strong> {selectedAllowance.allowanceType || '-'}
            </div>
            <div>
              <strong>Số Tiền:</strong> {formatCurrency(selectedAllowance.amount)}
            </div>
            <div>
              <strong>Ngày Bắt Đầu:</strong> {formatDate(selectedAllowance.startDate)}
            </div>
            <div>
              <strong>Ngày Kết Thúc:</strong> {formatDate(selectedAllowance.endDate) || '-'}
            </div>
            <div>
              <strong>Mô Tả:</strong> {selectedAllowance.description || '-'}
            </div>
            <div>
              <strong>Trạng Thái:</strong> {getStatusBadge(selectedAllowance.status)}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAllowance(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa phụ cấp "${selectedAllowance?.allowanceId}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}

