'use client';

import { useEffect, useState } from 'react';
import { Attendance } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  
  // Modal states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAttendances();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [attendances, searchFilters]);

  const fetchAttendances = async () => {
    try {
      const response = await fetch('/api/attendances');
      const data = await response.json();
      setAttendances(data);
      setFilteredAttendances(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách chấm công:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendances];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((att) =>
        att.empId?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredAttendances(filtered);
    setCurrentPage(1);
  };

  const handleCreate = () => {
    alert('Chức năng thêm chấm công sẽ được triển khai sau');
  };

  const handleEdit = (attendance: Attendance) => {
    alert('Chức năng chỉnh sửa chấm công sẽ được triển khai sau');
  };

  const handleView = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsViewModalOpen(true);
  };

  const handleDelete = (attendance: Attendance) => {
    setSelectedAttendance(attendance);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAttendance) return;
    
    setFormLoading(true);
    try {
      const response = await fetch(`/api/attendances/${selectedAttendance.attendId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Lỗi khi xóa chấm công');
      
      await fetchAttendances();
      setIsDeleteDialogOpen(false);
      setSelectedAttendance(null);
    } catch (error) {
      console.error('Lỗi khi xóa chấm công:', error);
      alert('Có lỗi xảy ra khi xóa chấm công');
    } finally {
      setFormLoading(false);
    }
  };

  const searchFields = [
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
  ];

  const columns: Column<Attendance>[] = [
    {
      key: 'attendId',
      label: 'Mã CC',
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
      key: 'workDays',
      label: 'Ngày Công',
      align: 'center',
      render: (value) => `${value} ngày`,
    },
    {
      key: 'leaveDays',
      label: 'Ngày Nghỉ',
      align: 'center',
      render: (value) => `${value} ngày`,
    },
    {
      key: 'otHours',
      label: 'Giờ OT',
      align: 'center',
      render: (value) => `${value} giờ`,
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

  const paginatedData = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Chấm Công"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Chấm Công
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

      {filteredAttendances.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredAttendances.length / itemsPerPage)}
          totalItems={filteredAttendances.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedAttendance(null);
        }}
        title="Chi Tiết Chấm Công"
        size="md"
      >
        {selectedAttendance && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Chấm Công:</strong> {selectedAttendance.attendId}
            </div>
            <div>
              <strong>Mã NV:</strong> {selectedAttendance.empId}
            </div>
            <div>
              <strong>Tháng/Năm:</strong> {selectedAttendance.monthNum}/{selectedAttendance.yearNum}
            </div>
            <div>
              <strong>Ngày Công:</strong> {selectedAttendance.workDays} ngày
            </div>
            <div>
              <strong>Ngày Nghỉ:</strong> {selectedAttendance.leaveDays} ngày
            </div>
            <div>
              <strong>Giờ OT:</strong> {selectedAttendance.otHours} giờ
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedAttendance(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa chấm công "${selectedAttendance?.attendId}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
