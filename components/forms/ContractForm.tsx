'use client';

import { Contract } from '@/types/models';
import { useEffect, useState } from 'react';

interface ContractFormProps {
  contract?: Contract;
  onSubmit: (data: Contract) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function ContractForm({
  contract,
  onSubmit,
  onCancel,
  loading = false,
}: ContractFormProps) {
  const [formData, setFormData] = useState<Partial<Contract>>({
    contractId: '',
    empId: '',
    startDate: '',
    endDate: '',
    salaryFactor: undefined,
    contractType: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (contract) {
      setFormData({
        contractId: contract.contractId || '',
        empId: contract.empId || '',
        startDate: contract.startDate ? new Date(contract.startDate).toISOString().split('T')[0] : '',
        endDate: contract.endDate ? new Date(contract.endDate).toISOString().split('T')[0] : '',
        salaryFactor: contract.salaryFactor,
        contractType: contract.contractType || '',
      });
    }
  }, [contract]);

  const handleChange = (field: keyof Contract, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contractId?.trim()) {
      newErrors.contractId = 'Mã hợp đồng là bắt buộc';
    }
    if (!formData.empId?.trim()) {
      newErrors.empId = 'Mã nhân viên là bắt buộc';
    }
    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Contract);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Mã Hợp Đồng *</label>
        <input
          type="text"
          className={`form-input ${errors.contractId ? 'error' : ''}`}
          value={formData.contractId}
          onChange={(e) => handleChange('contractId', e.target.value)}
          disabled={!!contract}
        />
        {errors.contractId && <span className="form-error">{errors.contractId}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Mã Nhân Viên *</label>
        <input
          type="text"
          className={`form-input ${errors.empId ? 'error' : ''}`}
          value={formData.empId}
          onChange={(e) => handleChange('empId', e.target.value)}
          placeholder="Nhập mã nhân viên"
        />
        {errors.empId && <span className="form-error">{errors.empId}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Ngày Bắt Đầu *</label>
          <input
            type="date"
            className={`form-input ${errors.startDate ? 'error' : ''}`}
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value || undefined)}
          />
          {errors.startDate && <span className="form-error">{errors.startDate}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Ngày Kết Thúc</label>
          <input
            type="date"
            className="form-input"
            value={formData.endDate}
            onChange={(e) => handleChange('endDate', e.target.value || undefined)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Hệ Số Lương</label>
          <input
            type="number"
            className="form-input"
            value={formData.salaryFactor || ''}
            onChange={(e) => handleChange('salaryFactor', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="Nhập hệ số lương"
            step="0.01"
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Loại Hợp Đồng</label>
          <select
            className="form-input"
            value={formData.contractType || ''}
            onChange={(e) => handleChange('contractType', e.target.value || undefined)}
          >
            <option value="">Chọn loại hợp đồng</option>
            <option value="Chính thức">Chính thức</option>
            <option value="Thử việc">Thử việc</option>
            <option value="Hợp đồng xác định thời hạn">Hợp đồng xác định thời hạn</option>
            <option value="Hợp đồng không xác định thời hạn">Hợp đồng không xác định thời hạn</option>
          </select>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        justifyContent: 'flex-end',
        marginTop: 'var(--space-6)',
      }}>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Đang lưu...' : contract ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

