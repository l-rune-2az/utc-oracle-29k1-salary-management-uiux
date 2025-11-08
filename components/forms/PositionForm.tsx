'use client';

import { Position } from '@/types/models';
import { useEffect, useState } from 'react';

interface PositionFormProps {
  position?: Position;
  onSubmit: (data: Position) => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function PositionForm({
  position,
  onSubmit,
  onCancel,
  loading = false,
}: PositionFormProps) {
  const [formData, setFormData] = useState<Partial<Position>>({
    positionId: '',
    positionName: '',
    baseSalary: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (position) {
      setFormData({
        positionId: position.positionId || '',
        positionName: position.positionName || '',
        baseSalary: position.baseSalary,
      });
    }
  }, [position]);

  const handleChange = (field: keyof Position, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.positionId?.trim()) {
      newErrors.positionId = 'Mã chức vụ là bắt buộc';
    }
    if (!formData.positionName?.trim()) {
      newErrors.positionName = 'Tên chức vụ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData as Position);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">Mã Chức Vụ *</label>
        <input
          type="text"
          className={`form-input ${errors.positionId ? 'error' : ''}`}
          value={formData.positionId}
          onChange={(e) => handleChange('positionId', e.target.value)}
          disabled={!!position}
        />
        {errors.positionId && <span className="form-error">{errors.positionId}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Tên Chức Vụ *</label>
        <input
          type="text"
          className={`form-input ${errors.positionName ? 'error' : ''}`}
          value={formData.positionName}
          onChange={(e) => handleChange('positionName', e.target.value)}
        />
        {errors.positionName && <span className="form-error">{errors.positionName}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Lương Cơ Bản (VND)</label>
        <input
          type="number"
          className="form-input"
          value={formData.baseSalary || ''}
          onChange={(e) => handleChange('baseSalary', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Nhập lương cơ bản"
          min="0"
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
          {loading ? 'Đang lưu...' : position ? 'Cập nhật' : 'Tạo mới'}
        </button>
      </div>
    </form>
  );
}

