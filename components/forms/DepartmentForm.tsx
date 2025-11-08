'use client';

import { Department } from '@/types/models';
import { useEffect, useState } from 'react';

interface DepartmentFormProps {
  department?: Department;
  onSubmit: (data: Department) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DepartmentForm({
  department,
  onSubmit,
  onCancel,
  loading = false,
}: DepartmentFormProps) {
  const [formData, setFormData] = useState<Partial<Department>>({
    deptId: '',
    deptName: '',
    location: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (department) {
      setFormData({
        deptId: department.deptId || '',
        deptName: department.deptName || '',
        location: department.location || '',
      });
    }
  }, [department]);

  const handleChange = (field: keyof Department, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.deptId?.trim()) {
      newErrors.deptId = 'Mã phòng ban là bắt buộc';
    }
    if (!formData.deptName?.trim()) {
      newErrors.deptName = 'Tên phòng ban là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Department);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Mã Phòng Ban *</label>
        <input
          type="text"
          className={`form-input ${errors.deptId ? 'error' : ''}`}
          value={formData.deptId}
          onChange={(e) => handleChange('deptId', e.target.value)}
          disabled={!!department}
        />
        {errors.deptId && <span className="form-error">{errors.deptId}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Tên Phòng Ban *</label>
        <input
          type="text"
          className={`form-input ${errors.deptName ? 'error' : ''}`}
          value={formData.deptName}
          onChange={(e) => handleChange('deptName', e.target.value)}
        />
        {errors.deptName && <span className="form-error">{errors.deptName}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Địa Điểm</label>
        <input
          type="text"
          className="form-input"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          placeholder="Nhập địa điểm làm việc"
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
          {loading ? 'Đang lưu...' : department ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

