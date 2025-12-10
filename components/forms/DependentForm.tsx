'use client';

import { EmployeeDependent } from '@/types/models';
import { useEffect, useState } from 'react';

interface DependentFormProps {
  dependent?: EmployeeDependent;
  empId: string;
  onSubmit: (data: EmployeeDependent) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DependentForm({
  dependent,
  empId,
  onSubmit,
  onCancel,
  loading = false,
}: DependentFormProps) {
  const [formData, setFormData] = useState<Partial<EmployeeDependent>>({
    dependentId: '',
    empId: empId,
    fullName: '',
    relationship: '',
    birthDate: '',
    gender: undefined,
    idNumber: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (dependent) {
      setFormData({
        dependentId: dependent.dependentId || '',
        empId: dependent.empId || empId,
        fullName: dependent.fullName || '',
        relationship: dependent.relationship || '',
        birthDate: dependent.birthDate ? new Date(dependent.birthDate).toISOString().split('T')[0] : '',
        gender: dependent.gender,
        idNumber: dependent.idNumber || '',
      });
    } else {
      setFormData((prev) => ({ ...prev, empId }));
    }
  }, [dependent, empId]);

  const handleChange = (field: keyof EmployeeDependent, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as EmployeeDependent);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Họ Tên *</label>
        <input
          type="text"
          className={`form-input ${errors.fullName ? 'error' : ''}`}
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
        />
        {errors.fullName && <span className="form-error">{errors.fullName}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Quan Hệ</label>
          <select
            className="form-input"
            value={formData.relationship ?? ''}
            onChange={(e) => handleChange('relationship', e.target.value || undefined)}
          >
            <option value="">Chọn quan hệ</option>
            <option value="Vợ">Vợ</option>
            <option value="Chồng">Chồng</option>
            <option value="Con">Con</option>
            <option value="Cha">Cha</option>
            <option value="Mẹ">Mẹ</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Giới Tính</label>
          <select
            className="form-input"
            value={formData.gender ?? ''}
            onChange={(e) => handleChange('gender', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Chọn giới tính</option>
            <option value="1">Nam</option>
            <option value="0">Nữ</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Ngày Sinh</label>
          <input
            type="date"
            className="form-input"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value || undefined)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Số CMND/CCCD</label>
          <input
            type="text"
            className="form-input"
            value={formData.idNumber}
            onChange={(e) => handleChange('idNumber', e.target.value || undefined)}
            placeholder="Nhập số CMND/CCCD"
          />
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
          {loading ? 'Đang lưu...' : dependent ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

