'use client';

import { EmployeeAllowance } from '@/types/models';
import { useEffect, useState } from 'react';

interface AllowanceFormProps {
  allowance?: EmployeeAllowance;
  onSubmit: (data: EmployeeAllowance) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AllowanceForm({
  allowance,
  onSubmit,
  onCancel,
  loading = false,
}: AllowanceFormProps) {
  const [formData, setFormData] = useState<Partial<EmployeeAllowance>>({
    allowanceId: '',
    empId: '',
    allowanceType: '',
    amount: 0,
    startDate: '',
    endDate: '',
    description: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (allowance) {
      setFormData({
        allowanceId: allowance.allowanceId || '',
        empId: allowance.empId || '',
        allowanceType: allowance.allowanceType || '',
        amount: allowance.amount || 0,
        startDate: allowance.startDate ? new Date(allowance.startDate).toISOString().split('T')[0] : '',
        endDate: allowance.endDate ? new Date(allowance.endDate).toISOString().split('T')[0] : '',
        description: allowance.description || '',
        status: allowance.status || 'ACTIVE',
      });
    }
  }, [allowance]);

  const handleChange = (field: keyof EmployeeAllowance, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.empId?.trim()) {
      newErrors.empId = 'Mã nhân viên là bắt buộc';
    }
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Số tiền phụ cấp phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as EmployeeAllowance);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
          <label className="form-label">Loại Phụ Cấp</label>
          <select
            className="form-input"
            value={formData.allowanceType || ''}
            onChange={(e) => handleChange('allowanceType', e.target.value || undefined)}
          >
            <option value="">Chọn loại phụ cấp</option>
            <option value="Phụ cấp ăn trưa">Phụ cấp ăn trưa</option>
            <option value="Phụ cấp xăng xe">Phụ cấp xăng xe</option>
            <option value="Phụ cấp điện thoại">Phụ cấp điện thoại</option>
            <option value="Phụ cấp nhà ở">Phụ cấp nhà ở</option>
            <option value="Phụ cấp đi lại">Phụ cấp đi lại</option>
            <option value="Phụ cấp khác">Phụ cấp khác</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Số Tiền (VND) *</label>
          <input
            type="number"
            className={`form-input ${errors.amount ? 'error' : ''}`}
            value={formData.amount || ''}
            onChange={(e) => handleChange('amount', e.target.value ? Number(e.target.value) : 0)}
            placeholder="Nhập số tiền"
            min="0"
            step="1000"
          />
          {errors.amount && <span className="form-error">{errors.amount}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Ngày Bắt Đầu</label>
          <input
            type="date"
            className="form-input"
            value={formData.startDate}
            onChange={(e) => handleChange('startDate', e.target.value || undefined)}
          />
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

      <div className="form-group">
        <label className="form-label">Trạng Thái</label>
        <select
          className="form-input"
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value)}
        >
          <option value="ACTIVE">Đang áp dụng</option>
          <option value="INACTIVE">Đã kết thúc</option>
        </select>
      </div>

      <div className="form-group">
        <label className="form-label">Mô Tả</label>
        <textarea
          className="form-input"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value || undefined)}
          placeholder="Nhập mô tả (nếu có)"
          rows={3}
        />
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
          {loading ? 'Đang lưu...' : allowance ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

