'use client';

import { Penalty } from '@/types/models';
import { useEffect, useState } from 'react';

interface PenaltyFormProps {
    penalty?: Penalty;
    onSubmit: (data: Penalty) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function PenaltyForm({
    penalty,
    onSubmit,
    onCancel,
    loading = false,
}: PenaltyFormProps) {
    const [formData, setFormData] = useState<Partial<Penalty>>({
        penaltyId: '',
        empId: '',
        penaltyType: '',
        penaltyDate: '',
        amount: 0,
        reason: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (penalty) {
            setFormData({
                penaltyId: penalty.penaltyId || '',
                empId: penalty.empId || '',
                penaltyType: penalty.penaltyType || '',
                penaltyDate: penalty.penaltyDate ? new Date(penalty.penaltyDate).toISOString().split('T')[0] : '',
                amount: penalty.amount || 0,
                reason: penalty.reason || '',
            });
        }
    }, [penalty]);

    const handleChange = (field: keyof Penalty, value: any) => {
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
            newErrors.amount = 'Số tiền phạt là bắt buộc và phải lớn hơn 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData as Penalty);
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
                    disabled={!!penalty}
                />
                {errors.empId && <span className="form-error">{errors.empId}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label">Loại Phạt</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.penaltyType}
                        onChange={(e) => handleChange('penaltyType', e.target.value)}
                        placeholder="Nhập loại phạt"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Ngày Phạt</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.penaltyDate as string}
                        onChange={(e) => handleChange('penaltyDate', e.target.value)}
                    />
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Số Tiền *</label>
                <input
                    type="number"
                    className={`form-input ${errors.amount ? 'error' : ''}`}
                    value={formData.amount}
                    onChange={(e) => handleChange('amount', Number(e.target.value))}
                    min="0"
                    step="1000"
                />
                {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            <div className="form-group">
                <label className="form-label">Lý Do</label>
                <textarea
                    className="form-input"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    placeholder="Nhập lý do phạt"
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
                    {loading ? 'Đang lưu...' : penalty ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
        </form>
    );
}
