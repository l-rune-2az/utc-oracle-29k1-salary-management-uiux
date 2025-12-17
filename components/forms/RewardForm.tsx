'use client';

import { Reward } from '@/types/models';
import { useEffect, useState } from 'react';

interface RewardFormProps {
    reward?: Reward;
    onSubmit: (data: Reward) => void;
    onCancel: () => void;
    loading?: boolean;
}

export default function RewardForm({
    reward,
    onSubmit,
    onCancel,
    loading = false,
}: RewardFormProps) {
    const [formData, setFormData] = useState<Partial<Reward>>({
        rewardId: '',
        empId: '',
        deptId: '',
        rewardType: '',
        rewardDate: '',
        amount: 0,
        description: '',
        approvedBy: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (reward) {
            setFormData({
                rewardId: reward.rewardId || '',
                empId: reward.empId || '',
                deptId: reward.deptId || '',
                rewardType: reward.rewardType || '',
                rewardDate: reward.rewardDate ? new Date(reward.rewardDate).toISOString().split('T')[0] : '',
                amount: reward.amount || 0,
                description: reward.description || '',
                approvedBy: reward.approvedBy || '',
            });
        }
    }, [reward]);

    const handleChange = (field: keyof Reward, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount || formData.amount <= 0) {
            newErrors.amount = 'Số tiền thưởng là bắt buộc và phải lớn hơn 0';
        }

        if (!formData.empId?.trim() && !formData.deptId?.trim()) {
            newErrors.empId = 'Phải nhập mã nhân viên hoặc mã phòng ban';
            newErrors.deptId = 'Phải nhập mã nhân viên hoặc mã phòng ban';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData as Reward);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label">Mã Nhân Viên</label>
                    <input
                        type="text"
                        className={`form-input ${errors.empId ? 'error' : ''}`}
                        value={formData.empId}
                        onChange={(e) => handleChange('empId', e.target.value)}
                        placeholder="Nhập mã nhân viên"
                    />
                    {errors.empId && <span className="form-error">{errors.empId}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Mã Phòng Ban</label>
                    <input
                        type="text"
                        className={`form-input ${errors.deptId ? 'error' : ''}`}
                        value={formData.deptId}
                        onChange={(e) => handleChange('deptId', e.target.value)}
                        placeholder="Nhập mã phòng ban"
                    />
                    {errors.deptId && <span className="form-error">{errors.deptId}</span>}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                <div className="form-group">
                    <label className="form-label">Loại Thưởng</label>
                    <input
                        type="text"
                        className="form-input"
                        value={formData.rewardType}
                        onChange={(e) => handleChange('rewardType', e.target.value)}
                        placeholder="Nhập loại thưởng"
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Ngày Thưởng</label>
                    <input
                        type="date"
                        className="form-input"
                        value={formData.rewardDate as string}
                        onChange={(e) => handleChange('rewardDate', e.target.value)}
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
                <label className="form-label">Mô Tả</label>
                <textarea
                    className="form-input"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Nhập mô tả"
                    rows={3}
                />
            </div>

            <div className="form-group">
                <label className="form-label">Người Phê Duyệt</label>
                <input
                    type="text"
                    className="form-input"
                    value={formData.approvedBy}
                    onChange={(e) => handleChange('approvedBy', e.target.value)}
                    placeholder="Nhập người phê duyệt"
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
                    {loading ? 'Đang lưu...' : reward ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
        </form>
    );
}
