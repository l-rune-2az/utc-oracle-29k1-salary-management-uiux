'use client';

import { Attendance } from '@/types/models';
import { useEffect, useState } from 'react';

interface AttendanceFormProps {
  attendance?: Attendance;
  onSubmit: (data: Attendance) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function AttendanceForm({
  attendance,
  onSubmit,
  onCancel,
  loading = false,
}: AttendanceFormProps) {
  const [formData, setFormData] = useState<Partial<Attendance>>({
    attendId: '',
    empId: '',
    monthNum: new Date().getMonth() + 1,
    yearNum: new Date().getFullYear(),
    workDays: 0,
    leaveDays: 0,
    otHours: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (attendance) {
      setFormData({
        attendId: attendance.attendId || '',
        empId: attendance.empId || '',
        monthNum: attendance.monthNum || new Date().getMonth() + 1,
        yearNum: attendance.yearNum || new Date().getFullYear(),
        workDays: attendance.workDays || 0,
        leaveDays: attendance.leaveDays || 0,
        otHours: attendance.otHours || 0,
      });
    }
  }, [attendance]);

  const handleChange = (field: keyof Attendance, value: any) => {
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
    if (!formData.monthNum || formData.monthNum < 1 || formData.monthNum > 12) {
      newErrors.monthNum = 'Tháng phải từ 1 đến 12';
    }
    if (!formData.yearNum || formData.yearNum < 2000 || formData.yearNum > 2100) {
      newErrors.yearNum = 'Năm không hợp lệ';
    }
    if (formData.workDays === undefined || formData.workDays < 0) {
      newErrors.workDays = 'Ngày công phải >= 0';
    }
    if (formData.leaveDays === undefined || formData.leaveDays < 0) {
      newErrors.leaveDays = 'Ngày nghỉ phải >= 0';
    }
    if (formData.otHours === undefined || formData.otHours < 0) {
      newErrors.otHours = 'Giờ OT phải >= 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Attendance);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

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
          disabled={!!attendance}
        />
        {errors.empId && <span className="form-error">{errors.empId}</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Tháng *</label>
          <select
            className={`form-input ${errors.monthNum ? 'error' : ''}`}
            value={formData.monthNum}
            onChange={(e) => handleChange('monthNum', Number(e.target.value))}
            disabled={!!attendance}
          >
            {months.map((month) => (
              <option key={month} value={month}>
                Tháng {month}
              </option>
            ))}
          </select>
          {errors.monthNum && <span className="form-error">{errors.monthNum}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Năm *</label>
          <select
            className={`form-input ${errors.yearNum ? 'error' : ''}`}
            value={formData.yearNum}
            onChange={(e) => handleChange('yearNum', Number(e.target.value))}
            disabled={!!attendance}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.yearNum && <span className="form-error">{errors.yearNum}</span>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
        <div className="form-group">
          <label className="form-label">Ngày Công *</label>
          <input
            type="number"
            className={`form-input ${errors.workDays ? 'error' : ''}`}
            value={formData.workDays || ''}
            onChange={(e) => handleChange('workDays', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0"
            min="0"
          />
          {errors.workDays && <span className="form-error">{errors.workDays}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Ngày Nghỉ *</label>
          <input
            type="number"
            className={`form-input ${errors.leaveDays ? 'error' : ''}`}
            value={formData.leaveDays || ''}
            onChange={(e) => handleChange('leaveDays', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0"
            min="0"
          />
          {errors.leaveDays && <span className="form-error">{errors.leaveDays}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Giờ OT *</label>
          <input
            type="number"
            className={`form-input ${errors.otHours ? 'error' : ''}`}
            value={formData.otHours || ''}
            onChange={(e) => handleChange('otHours', e.target.value ? Number(e.target.value) : 0)}
            placeholder="0"
            min="0"
            step="0.5"
          />
          {errors.otHours && <span className="form-error">{errors.otHours}</span>}
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
          {loading ? 'Đang lưu...' : attendance ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

