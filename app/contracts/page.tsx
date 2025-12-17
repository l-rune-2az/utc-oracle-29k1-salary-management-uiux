'use client';

import { useEffect, useState } from 'react';
import { Contract } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import ContractForm from '@/components/forms/ContractForm';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchContracts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [contracts, searchFilters]);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/contracts');
      const data = await response.json();
      setContracts(data);
      setFilteredContracts(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách hợp đồng:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...contracts];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((contract) => {
        const code = contract.empCode ?? contract.empId;
        return code?.toLowerCase().includes(searchTerm);
      });
    }

    setFilteredContracts(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedContract(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setIsEditModalOpen(true);
  };

  const handleSubmit = async (data: Contract) => {
    setFormLoading(true);
    try {
      const url = '/api/contracts';
      const method = selectedContract ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu hợp đồng');
      
      await fetchContracts();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Lỗi khi lưu hợp đồng:', error);
      alert('Có lỗi xảy ra khi lưu hợp đồng');
    } finally {
      setFormLoading(false);
    }
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  const handleDelete = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedContract) return;
    
    setFormLoading(true);
    try {
      const response = await fetch('/api/contracts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: selectedContract.contractId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa hợp đồng');
      
      await fetchContracts();
      setIsDeleteDialogOpen(false);
      setSelectedContract(null);
    } catch (error) {
      console.error('Lỗi khi xóa hợp đồng:', error);
      alert('Có lỗi xảy ra khi xóa hợp đồng');
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
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
  ];

  const columns: Column<Contract>[] = [
    {
      key: 'contractId',
      label: 'Mã HĐ',
      width: '100px',
    },
    {
      key: 'empCode',
      label: 'Mã NV',
      width: '100px',
      render: (value, row) => value || row.empId,
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
      key: 'salaryFactor',
      label: 'Hệ Số Lương',
      align: 'center',
    },
    {
      key: 'contractType',
      label: 'Loại HĐ',
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

  const paginatedData = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Hợp Đồng"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Hợp Đồng
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

      {filteredContracts.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredContracts.length / itemsPerPage)}
          totalItems={filteredContracts.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedContract(null);
        }}
        title="Thêm Hợp Đồng Mới"
        size="md"
      >
        <ContractForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedContract(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContract(null);
        }}
        title="Chỉnh Sửa Hợp Đồng"
        size="md"
      >
        {selectedContract && (
          <ContractForm
            contract={selectedContract}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedContract(null);
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
          setSelectedContract(null);
        }}
        title="Chi Tiết Hợp Đồng"
        size="md"
      >
        {selectedContract && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Hợp Đồng:</strong> {selectedContract.contractId}
            </div>
            <div>
              <strong>Mã NV:</strong> {selectedContract.empCode || selectedContract.empId}
              {selectedContract.empCode && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                  ID hệ thống: {selectedContract.empId}
                </div>
              )}
            </div>
            <div>
              <strong>Ngày Bắt Đầu:</strong> {formatDate(selectedContract.startDate)}
            </div>
            <div>
              <strong>Ngày Kết Thúc:</strong> {formatDate(selectedContract.endDate) || '-'}
            </div>
            <div>
              <strong>Hệ Số Lương:</strong> {selectedContract.salaryFactor || '-'}
            </div>
            <div>
              <strong>Loại Hợp Đồng:</strong> {selectedContract.contractType || '-'}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedContract(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa hợp đồng "${selectedContract?.contractId}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
