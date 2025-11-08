'use client';

import { useEffect, useState } from 'react';
import { Department } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import DepartmentForm from '@/components/forms/DepartmentForm';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [departments, searchFilters]);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      setDepartments(data);
      setFilteredDepartments(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách phòng ban:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...departments];

    if (searchFilters.deptName) {
      const searchTerm = searchFilters.deptName.toLowerCase();
      filtered = filtered.filter((dept) =>
        dept.deptName?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.deptId) {
      const searchTerm = searchFilters.deptId.toLowerCase();
      filtered = filtered.filter((dept) =>
        dept.deptId?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredDepartments(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedDepartment(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsEditModalOpen(true);
  };

  const handleView = (department: Department) => {
    setSelectedDepartment(department);
    setIsViewModalOpen(true);
  };

  const handleDelete = (department: Department) => {
    setSelectedDepartment(department);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Department) => {
    setFormLoading(true);
    try {
      if (selectedDepartment) {
        setDepartments((prev) =>
          prev.map((dept) => (dept.deptId === data.deptId ? data : dept))
        );
      } else {
        setDepartments((prev) => [...prev, data]);
      }
      
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Lỗi khi lưu phòng ban:', error);
      alert('Có lỗi xảy ra khi lưu phòng ban');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDepartment) return;
    
    setFormLoading(true);
    try {
      setDepartments((prev) =>
        prev.filter((dept) => dept.deptId !== selectedDepartment.deptId)
      );
      
      setIsDeleteDialogOpen(false);
      setSelectedDepartment(null);
    } catch (error) {
      console.error('Lỗi khi xóa phòng ban:', error);
      alert('Có lỗi xảy ra khi xóa phòng ban');
    } finally {
      setFormLoading(false);
    }
  };

  const searchFields = [
    { name: 'deptName', label: 'Tên Phòng Ban', type: 'text' as const, placeholder: 'Nhập tên phòng ban...', width: 'full' as const },
    { name: 'deptId', label: 'Mã Phòng Ban', type: 'text' as const, placeholder: 'Nhập mã phòng ban...', width: 'medium' as const },
  ];

  const columns: Column<Department>[] = [
    {
      key: 'deptId',
      label: 'Mã Phòng Ban',
      width: '150px',
    },
    {
      key: 'deptName',
      label: 'Tên Phòng Ban',
    },
    {
      key: 'location',
      label: 'Địa Điểm',
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

  const paginatedData = filteredDepartments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phòng Ban"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Phòng Ban
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

      {filteredDepartments.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredDepartments.length / itemsPerPage)}
          totalItems={filteredDepartments.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedDepartment(null);
        }}
        title="Thêm Phòng Ban Mới"
        size="md"
      >
        <DepartmentForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedDepartment(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDepartment(null);
        }}
        title="Chỉnh Sửa Phòng Ban"
        size="md"
      >
        {selectedDepartment && (
          <DepartmentForm
            department={selectedDepartment}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedDepartment(null);
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
          setSelectedDepartment(null);
        }}
        title="Chi Tiết Phòng Ban"
        size="sm"
      >
        {selectedDepartment && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Phòng Ban:</strong> {selectedDepartment.deptId}
            </div>
            <div>
              <strong>Tên Phòng Ban:</strong> {selectedDepartment.deptName}
            </div>
            <div>
              <strong>Địa Điểm:</strong> {selectedDepartment.location || '-'}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedDepartment(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa phòng ban "${selectedDepartment?.deptName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
