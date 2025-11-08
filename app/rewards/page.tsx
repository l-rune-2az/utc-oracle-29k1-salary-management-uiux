'use client';

import { useEffect, useState } from 'react';
import { Reward } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRewards();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [rewards, searchFilters]);

  const fetchRewards = async () => {
    try {
      const response = await fetch('/api/rewards');
      const data = await response.json();
      setRewards(data);
      setFilteredRewards(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách thưởng:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...rewards];

    if (searchFilters.empId) {
      const searchTerm = searchFilters.empId.toLowerCase();
      filtered = filtered.filter((reward) =>
        reward.empId?.toLowerCase().includes(searchTerm)
      );
    }

    if (searchFilters.rewardType) {
      const searchTerm = searchFilters.rewardType.toLowerCase();
      filtered = filtered.filter((reward) =>
        reward.rewardType?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredRewards(filtered);
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
    { name: 'rewardType', label: 'Loại Thưởng', type: 'text' as const, placeholder: 'Nhập loại thưởng...', width: 'medium' as const },
  ];

  const columns: Column<Reward>[] = [
    {
      key: 'rewardId',
      label: 'Mã Thưởng',
      width: '120px',
    },
    {
      key: 'empDept',
      label: 'Mã NV/Phòng Ban',
      render: (_, row) => row.empId || row.deptId || '-',
    },
    {
      key: 'rewardType',
      label: 'Loại Thưởng',
    },
    {
      key: 'rewardDate',
      label: 'Ngày Thưởng',
      render: (value) => formatDate(value),
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
      key: 'description',
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

  const paginatedData = filteredRewards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Thưởng"
        actions={
          <button className="btn btn-primary">
            <FiPlus style={{ marginRight: 'var(--space-2)' }} />
            Thêm Thưởng
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

      {filteredRewards.length > 0 && (
        <TablePagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredRewards.length / itemsPerPage)}
          totalItems={filteredRewards.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}
