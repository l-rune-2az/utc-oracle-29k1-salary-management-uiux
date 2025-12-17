'use client';

import { useEffect, useState, useMemo } from 'react';
import { Employee, EmployeeDependent } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import EmployeeForm from '@/components/forms/EmployeeForm';
import DependentForm from '@/components/forms/DependentForm';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Dependent management states
  const [dependents, setDependents] = useState<EmployeeDependent[]>([]);
  const [isDependentsModalOpen, setIsDependentsModalOpen] = useState(false);
  const [isDependentFormModalOpen, setIsDependentFormModalOpen] = useState(false);
  const [isDependentDeleteDialogOpen, setIsDependentDeleteDialogOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<EmployeeDependent | null>(null);
  const [dependentsLoading, setDependentsLoading] = useState(false);

  const itemsPerPage = 10;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, searchFilters]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      
      // Đảm bảo data là array
      if (Array.isArray(data)) {
        setEmployees(data);
        setFilteredEmployees(data);
      } else {
        console.error('API trả về dữ liệu không hợp lệ:', data);
        setEmployees([]);
        setFilteredEmployees([]);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách nhân viên:', error);
      setEmployees([]);
      setFilteredEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    // Đảm bảo employees là array
    if (!Array.isArray(employees)) {
      setFilteredEmployees([]);
      return;
    }

    let filtered = [...employees];

    if (searchFilters.fullName) {
      const searchTerm = searchFilters.fullName.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.fullName?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((emp) =>
        emp.empId?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.status) {
      filtered = filtered.filter((emp) => emp.status === searchFilters.status);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
  };

  const handleView = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsViewModalOpen(true);
  };

  const handleManageDependents = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDependentsModalOpen(true);
    await fetchDependents(employee.empId);
  };

  const fetchDependents = async (empId: string) => {
    setDependentsLoading(true);
    try {
      const response = await fetch(`/api/employees/dependents?empCode=${empId}`);
      if (response.ok) {
        const data = await response.json();
        setDependents(data);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách người phụ thuộc:', error);
    } finally {
      setDependentsLoading(false);
    }
  };

  const handleAddDependent = () => {
    setSelectedDependent(null);
    setIsDependentFormModalOpen(true);
  };

  const handleEditDependent = (dependent: EmployeeDependent) => {
    setSelectedDependent(dependent);
    setIsDependentFormModalOpen(true);
  };

  const handleDeleteDependent = (dependent: EmployeeDependent) => {
    setSelectedDependent(dependent);
    setIsDependentDeleteDialogOpen(true);
  };

  const handleDependentSubmit = async (data: EmployeeDependent) => {
    setFormLoading(true);
    try {
      const url = '/api/employees/dependents';
      const method = selectedDependent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu người phụ thuộc');
      
      if (selectedEmployee) {
        await fetchDependents(selectedEmployee.empId);
      }
      setIsDependentFormModalOpen(false);
      setSelectedDependent(null);
    } catch (error) {
      console.error('Lỗi khi lưu người phụ thuộc:', error);
      alert('Có lỗi xảy ra khi lưu người phụ thuộc');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDependentDeleteConfirm = async () => {
    if (!selectedDependent) return;
    
    setFormLoading(true);
    try {
      const response = await fetch('/api/employees/dependents', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dependentId: selectedDependent.dependentId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa người phụ thuộc');
      
      if (selectedEmployee) {
        await fetchDependents(selectedEmployee.empId);
      }
      setIsDependentDeleteDialogOpen(false);
      setSelectedDependent(null);
    } catch (error) {
      console.error('Lỗi khi xóa người phụ thuộc:', error);
      alert('Có lỗi xảy ra khi xóa người phụ thuộc');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Employee) => {
    setFormLoading(true);
    try {
      const url = '/api/employees';
      const method = selectedEmployee ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu nhân viên');
      
      await fetchEmployees();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Lỗi khi lưu nhân viên:', error);
      alert(error.message || 'Có lỗi xảy ra khi lưu nhân viên');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedEmployee) return;
    
    setFormLoading(true);
    try {
      const response = await fetch('/api/employees', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empId: selectedEmployee.empId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa nhân viên');
      
      await fetchEmployees();
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      console.error('Lỗi khi xóa nhân viên:', error);
      alert(error.message || 'Có lỗi xảy ra khi xóa nhân viên');
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

  const getGenderText = (gender?: number) => {
    if (gender === 1) return 'Nam';
    if (gender === 0) return 'Nữ';
    return '-';
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
          Đang làm việc
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
        Nghỉ việc
      </span>
    );
  };

  const searchFields = [
    { name: 'fullName', label: 'Họ Tên', type: 'text' as const, placeholder: 'Nhập họ tên...', width: 'medium' as const },
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
    {
      name: 'status',
      label: 'Trạng Thái',
      type: 'select' as const,
      width: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Hoạt động' },
        { value: 'INACTIVE', label: 'Nghỉ việc' },
      ],
    },
  ];

  const columns: Column<Employee>[] = [
    {
      key: 'empId',
      label: 'Mã NV',
      width: '100px',
    },
    {
      key: 'fullName',
      label: 'Họ Tên',
    },
    {
      key: 'birthDate',
      label: 'Ngày Sinh',
      render: (value) => formatDate(value),
    },
    {
      key: 'gender',
      label: 'Giới Tính',
      align: 'center',
      render: (value) => getGenderText(value),
    },
    {
      key: 'joinDate',
      label: 'Ngày Vào Làm',
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
      width: '180px',
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
            className="action-btn action-btn--view"
            title="Quản lý người phụ thuộc"
            onClick={() => handleManageDependents(row)}
            style={{ color: '#3b82f6' }}
          >
            <FiUsers />
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

  const paginatedData = useMemo(() => {
    // Đảm bảo filteredEmployees là array trước khi slice
    if (!Array.isArray(filteredEmployees)) {
      return [];
    }
    return filteredEmployees.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredEmployees, currentPage, itemsPerPage]);

  const handleSearch = (values: Record<string, any>) => {
    setSearchFilters(values);
  };

  const handleReset = () => {
    setSearchFilters({});
  };

  return (
    <>
      <PageHeader
        title="Quản Lý Nhân Viên"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Nhân Viên
          </button>
        }
      />

      <SearchFilter
        fields={searchFields}
        onSearch={handleSearch}
        onReset={handleReset}
        realTime={true}
      />

      <DataTable
        columns={columns}
        data={paginatedData}
        loading={loading}
      />

      {filteredEmployees.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredEmployees.length / itemsPerPage)}
          totalItems={filteredEmployees.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Thêm Nhân Viên Mới"
        size="lg"
      >
        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedEmployee(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEmployee(null);
        }}
        title="Chỉnh Sửa Nhân Viên"
        size="lg"
      >
        {selectedEmployee && (
          <EmployeeForm
            employee={selectedEmployee}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedEmployee(null);
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
          setSelectedEmployee(null);
        }}
        title="Chi Tiết Nhân Viên"
        size="md"
      >
        {selectedEmployee && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Nhân Viên:</strong> {selectedEmployee.empId}
            </div>
            <div>
              <strong>Họ Tên:</strong> {selectedEmployee.fullName}
            </div>
            <div>
              <strong>Ngày Sinh:</strong> {formatDate(selectedEmployee.birthDate)}
            </div>
            <div>
              <strong>Giới Tính:</strong> {getGenderText(selectedEmployee.gender)}
            </div>
            <div>
              <strong>Phòng Ban:</strong> {selectedEmployee.deptId || '-'}
            </div>
            <div>
              <strong>Chức Vụ:</strong> {selectedEmployee.positionId || '-'}
            </div>
            <div>
              <strong>Ngày Vào Làm:</strong> {formatDate(selectedEmployee.joinDate)}
            </div>
            <div>
              <strong>Trạng Thái:</strong> {getStatusBadge(selectedEmployee.status)}
            </div>
            <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-border)' }}>
              <button
                className="btn btn-secondary"
                onClick={() => handleManageDependents(selectedEmployee)}
                style={{ width: '100%' }}
              >
                <FiUsers style={{ marginRight: 'var(--space-2)' }} />
                Quản Lý Người Phụ Thuộc
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Dependents Management Modal */}
      <Modal
        isOpen={isDependentsModalOpen}
        onClose={() => {
          setIsDependentsModalOpen(false);
          setSelectedEmployee(null);
          setDependents([]);
        }}
        title={`Quản Lý Người Phụ Thuộc - ${selectedEmployee?.fullName}`}
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleAddDependent}>
              <FiPlus style={{ marginRight: 'var(--space-2)' }} />
              Thêm Người Phụ Thuộc
            </button>
          </div>

          {dependentsLoading ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>Đang tải...</div>
          ) : dependents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--color-text-secondary)' }}>
              Chưa có người phụ thuộc
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
              {dependents.map((dep) => (
                <div
                  key={dep.dependentId}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>{dep.fullName}</div>
                    <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {dep.relationship && `Quan hệ: ${dep.relationship}`}
                      {dep.birthDate && ` • Ngày sinh: ${formatDate(dep.birthDate)}`}
                      {dep.idNumber && ` • CMND/CCCD: ${dep.idNumber}`}
                    </div>
                  </div>
                  <div className="action-buttons-container">
                    <button
                      className="action-btn action-btn--edit"
                      title="Chỉnh sửa"
                      onClick={() => handleEditDependent(dep)}
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      className="action-btn action-btn--delete"
                      title="Xóa"
                      onClick={() => handleDeleteDependent(dep)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Dependent Form Modal */}
      <Modal
        isOpen={isDependentFormModalOpen}
        onClose={() => {
          setIsDependentFormModalOpen(false);
          setSelectedDependent(null);
        }}
        title={selectedDependent ? 'Chỉnh Sửa Người Phụ Thuộc' : 'Thêm Người Phụ Thuộc Mới'}
        size="md"
      >
        {selectedEmployee && (
          <DependentForm
            dependent={selectedDependent || undefined}
            empId={selectedEmployee.empId}
            onSubmit={handleDependentSubmit}
            onCancel={() => {
              setIsDependentFormModalOpen(false);
              setSelectedDependent(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Dependent Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDependentDeleteDialogOpen}
        onClose={() => {
          setIsDependentDeleteDialogOpen(false);
          setSelectedDependent(null);
        }}
        onConfirm={handleDependentDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa người phụ thuộc "${selectedDependent?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEmployee(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa nhân viên "${selectedEmployee?.fullName}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
