'use client';

import { useEffect, useState } from 'react';
import { Attendance } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function AttendancesPage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [filteredAttendances, setFilteredAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
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

  const paginatedData = filteredAttendances.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Chấm Công"
        actions={
          <button className="btn btn-primary">
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
    </>
  );
}
