'use client';

import { Employee } from '@/types/models';
import { useEffect, useState } from 'react';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: Employee) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function EmployeeForm({
  employee,
  onSubmit,
  onCancel,
  loading = false,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    empId: '',
    fullName: '',
    birthDate: '',
    gender: undefined,
    deptId: '',
    positionId: '',
    joinDate: '',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        empId: employee.empId || '',
        fullName: employee.fullName || '',
        birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
        gender: employee.gender,
        deptId: employee.deptId || '',
        positionId: employee.positionId || '',
        joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
        status: employee.status || 'ACTIVE',
      });
    }
  }, [employee]);

  const handleChange = (field: keyof Employee, value: any) => {
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
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Họ tên là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Employee);
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
          disabled={!!employee}
        />
        {errors.empId && <span className="form-error">{errors.empId}</span>}
      </div>

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
          <label className="form-label">Ngày Sinh</label>
          <input
            type="date"
            className="form-input"
            value={formData.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
          />
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
          <label className="form-label">Phòng Ban</label>
          <input
            type="text"
            className="form-input"
            value={formData.deptId}
            onChange={(e) => handleChange('deptId', e.target.value)}
            placeholder="Nhập mã phòng ban"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Chức Vụ</label>
          <input
            type="text"
            className="form-input"
            value={formData.positionId}
            onChange={(e) => handleChange('positionId', e.target.value)}
            placeholder="Nhập mã chức vụ"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Ngày Vào Làm</label>
          <input
            type="date"
            className="form-input"
            value={formData.joinDate}
            onChange={(e) => handleChange('joinDate', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Trạng Thái</label>
          <select
            className="form-input"
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="ACTIVE">Đang làm việc</option>
            <option value="INACTIVE">Nghỉ việc</option>
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
          {loading ? 'Đang lưu...' : employee ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

