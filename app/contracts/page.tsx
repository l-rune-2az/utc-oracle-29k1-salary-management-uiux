'use client';

import { useEffect, useState } from 'react';
import { Contract } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});
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
      filtered = filtered.filter((contract) =>
        contract.empId?.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredContracts(filtered);
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
      key: 'empId',
      label: 'Mã NV',
      width: '100px',
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

  const paginatedData = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Hợp Đồng"
        actions={
          <button className="btn btn-primary">
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
    </>
  );
}
