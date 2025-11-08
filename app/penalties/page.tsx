'use client';

import { useEffect, useState } from 'react';
import { Penalty } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function PenaltiesPage() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [filteredPenalties, setFilteredPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
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

  const paginatedData = filteredPenalties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Phạt"
        actions={
          <button className="btn btn-primary">
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
    </>
  );
}
