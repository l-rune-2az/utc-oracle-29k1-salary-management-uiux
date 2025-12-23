'use client';

import { useEffect, useState } from 'react';

interface PayrollCalculationFormProps {
    onSubmit: (data: { monthNum: number; yearNum: number; empId?: string }) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function PayrollCalculationForm({
    onSubmit,
    onCancel,
    loading = false,
}: PayrollCalculationFormProps) {
    const currentDate = new Date();
    const [formData, setFormData] = useState({
        monthNum: currentDate.getMonth() + 1,
        yearNum: currentDate.getFullYear(),
        empId: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.monthNum || formData.monthNum < 1 || formData.monthNum > 12) {
            newErrors.monthNum = 'Tháng phải từ 1 đến 12';
        }

        if (!formData.yearNum || formData.yearNum < 2000 || formData.yearNum > 2100) {
            newErrors.yearNum = 'Năm không hợp lệ';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            const payload: { monthNum: number; yearNum: number; empId?: string } = {
                monthNum: formData.monthNum,
                yearNum: formData.yearNum,
            };

            // Only include empId if it's not empty
            if (formData.empId.trim()) {
                payload.empId = formData.empId.trim();
            }

            onSubmit(payload);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label">Tháng *</label>
                    <select
                        className={`form-input ${errors.monthNum ? 'error' : ''}`}
                        value={formData.monthNum}
                        onChange={(e) => handleChange('monthNum', Number(e.target.value))}
                    >
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                            <option key={month} value={month}>
                                Tháng {month}
                            </option>
                        ))}
                    </select>
                    {errors.monthNum && <span className="form-error">{errors.monthNum}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Năm *</label>
                    <input
                        type="number"
                        className={`form-input ${errors.yearNum ? 'error' : ''}`}
                        value={formData.yearNum}
                        onChange={(e) => handleChange('yearNum', Number(e.target.value))}
                        min="2000"
                        max="2100"
                    />
                    {errors.yearNum && <span className="form-error">{errors.yearNum}</span>}
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Mã Nhân Viên (Tùy chọn)</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.empId}
                    onChange={(e) => handleChange('empId', e.target.value)}
                    placeholder="VD: NV001, NV002... (để trống tính cho tất cả)"
                />
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)', marginTop: 'var(--space-1)' }}>
                    Nhập mã nhân viên (CODE) để tính lương cho 1 nhân viên cụ thể, hoặc để trống để tính cho tất cả nhân viên đang làm việc
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
                    {loading ? 'Đang tính...' : 'Tính Bảng Lương'}
                </button>
            </div>
        </form>
    );
}
