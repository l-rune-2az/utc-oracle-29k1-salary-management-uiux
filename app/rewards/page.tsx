'use client';

import { useEffect, useState } from 'react';
import { Reward } from '@/types/models';
import { FiPlus, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { format } from 'date-fns';
import PageHeader from '@/components/PageHeader';
import DataTable, { Column } from '@/components/DataTable';
import SearchFilter from '@/components/SearchFilter';
import TablePagination from '@/components/TablePagination';
import Modal from '@/components/Modal';
import ConfirmDialog from '@/components/ConfirmDialog';
import RewardForm from '@/components/forms/RewardForm';

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [filteredRewards, setFilteredRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchFilters, setSearchFilters] = useState<Record<string, any>>({});

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [formLoading, setFormLoading] = useState(false);

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

  const handleCreate = () => {
    setSelectedReward(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setIsEditModalOpen(true);
  };

  const handleView = (reward: Reward) => {
    setSelectedReward(reward);
    setIsViewModalOpen(true);
  };

  const handleDelete = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (data: Reward) => {
    setFormLoading(true);
    try {
      const url = '/api/rewards';
      const method = selectedReward ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu thưởng');

      await fetchRewards();
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Lỗi khi lưu thưởng:', error);
      alert('Có lỗi xảy ra khi lưu thưởng');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedReward) return;

    setFormLoading(true);
    try {
      const response = await fetch('/api/rewards', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: selectedReward.rewardId }),
      });

      if (!response.ok) throw new Error('Lỗi khi xóa thưởng');

      await fetchRewards();
      setIsDeleteDialogOpen(false);
      setSelectedReward(null);
    } catch (error) {
      console.error('Lỗi khi xóa thưởng:', error);
      alert('Có lỗi xảy ra khi xóa thưởng');
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

  const searchFields = [
    { name: 'empId', label: 'Mã NV', type: 'text' as const, placeholder: 'Nhập mã NV...', width: 'medium' as const },
    { name: 'rewardType', label: 'Loại Thưởng', type: 'text' as const, placeholder: 'Nhập loại thưởng...', width: 'medium' as const },
  ];

  const columns: Column<Reward>[] = [
    {
      key: 'rewardCode',
      label: 'Mã Thưởng',
      width: '120px',
      render: (value, row) => value || row.rewardId,
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

  const paginatedData = filteredRewards.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <PageHeader
        title="Quản Lý Thưởng"
        actions={
          <button className="btn btn-primary" onClick={handleCreate}>
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

      {/* View Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedReward(null);
        }}
        title="Chi Tiết Thưởng"
        size="md"
      >
        {selectedReward && (
          <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
            <div>
              <strong>Mã Thưởng:</strong>{' '}
              {selectedReward.rewardCode || selectedReward.rewardId}
              {selectedReward.rewardCode && (
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                  ID hệ thống: {selectedReward.rewardId}
                </div>
              )}
            </div>
            <div>
              <strong>Mã NV/Phòng Ban:</strong> {selectedReward.empId || selectedReward.deptId || '-'}
            </div>
            <div>
              <strong>Loại Thưởng:</strong> {selectedReward.rewardType || '-'}
            </div>
            <div>
              <strong>Ngày Thưởng:</strong> {formatDate(selectedReward.rewardDate)}
            </div>
            <div>
              <strong>Số Tiền:</strong> {formatCurrency(selectedReward.amount)}
            </div>
            <div>
              <strong>Lý Do:</strong> {selectedReward.description || '-'}
            </div>
            <div>
              <strong>Người Phê Duyệt:</strong> {selectedReward.approvedBy || '-'}
            </div>
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedReward(null);
        }}
        title="Thêm Thưởng Mới"
        size="lg"
      >
        <RewardForm
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsCreateModalOpen(false);
            setSelectedReward(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedReward(null);
        }}
        title="Chỉnh Sửa Thưởng"
        size="lg"
      >
        {selectedReward && (
          <RewardForm
            reward={selectedReward}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsEditModalOpen(false);
              setSelectedReward(null);
            }}
            loading={formLoading}
          />
        )}
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedReward(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Xác Nhận Xóa"
        message={`Bạn có chắc chắn muốn xóa thưởng "${selectedReward?.rewardCode || selectedReward?.rewardId
          }"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </>
  );
}
