'use client';

import { useEffect, useState } from 'react';
import { FiUsers, FiDollarSign, FiAward, FiAlertCircle } from 'react-icons/fi';
import { apiFetch } from '@/lib/apiClient';
import type { Employee, Payroll, Reward, Penalty } from '@/types/models';

interface DashboardStats {
  totalEmployees: number;
  totalPayrolls: number;
  totalRewards: number;
  totalPenalties: number;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    totalPayrolls: 0,
    totalRewards: 0,
    totalPenalties: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [employees, payrolls, rewards, penalties] = await Promise.all([
          apiFetch<Employee[]>('/api/employees'),
          apiFetch<Payroll[]>('/api/payrolls'),
          apiFetch<Reward[]>('/api/rewards'),
          apiFetch<Penalty[]>('/api/penalties'),
        ]);

        setStats({
          totalEmployees: employees.length,
          totalPayrolls: payrolls.length,
          totalRewards: rewards.length,
          totalPenalties: penalties.length,
        });
      } catch (error) {
        console.error('Lỗi khi tải thống kê:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Tổng Nhân Viên',
      value: stats.totalEmployees,
      icon: FiUsers,
      color: 'var(--primary-500)',
    },
    {
      title: 'Bảng Lương',
      value: stats.totalPayrolls,
      icon: FiDollarSign,
      color: 'var(--success-500)',
    },
    {
      title: 'Thưởng',
      value: stats.totalRewards,
      icon: FiAward,
      color: 'var(--warning-500)',
    },
    {
      title: 'Phạt',
      value: stats.totalPenalties,
      icon: FiAlertCircle,
      color: 'var(--error-500)',
    },
  ];


  return (
    <>
      <h1 style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 'var(--font-weight-bold)',
        color: 'var(--gray-800)',
        marginBottom: 'var(--space-8)',
      }}>
        Trang Chủ - Dashboard
      </h1>
      <div className="grid grid-4">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="card">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{
                      color: 'var(--gray-600)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                      marginBottom: 'var(--space-2)',
                    }}>
                      {card.title}
                    </p>
                    <p style={{
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: 'var(--font-weight-bold)',
                      color: 'var(--gray-800)',
                    }}>
                      {card.value}
                    </p>
                  </div>
                  <div style={{
                    background: card.color,
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-full)',
                    color: 'var(--white)',
                  }}>
                    <Icon style={{ fontSize: 'var(--font-size-2xl)' }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

