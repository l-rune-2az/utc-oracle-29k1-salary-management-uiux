'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiFileText,
  FiClock,
  FiAward,
  FiAlertCircle,
  FiDollarSign,
  FiSettings,
  FiChevronDown,
  FiChevronRight,
  FiTrendingUp,
  FiBarChart2,
} from 'react-icons/fi';

interface MenuItem {
  href: string;
  label: string;
  icon: any;
}

interface MenuGroup {
  label: string;
  items: MenuItem[];
  icon?: any;
  collapsible?: boolean;
}

const menuGroups: MenuGroup[] = [
  {
    label: 'Trang Chủ',
    items: [{ href: '/', label: 'Dashboard', icon: FiHome }],
  },
  {
    label: 'Danh Mục',
    items: [
      { href: '/departments', label: 'Phòng Ban', icon: FiSettings },
      { href: '/positions', label: 'Chức Vụ', icon: FiBriefcase },
    ],
  },
  {
    label: 'Nhân Viên',
    items: [
      { href: '/employees', label: 'Danh Sách NV', icon: FiUsers },
      { href: '/contracts', label: 'Hợp Đồng', icon: FiFileText },
      { href: '/allowances', label: 'Phụ Cấp', icon: FiTrendingUp },
      { href: '/attendances', label: 'Chấm Công', icon: FiClock },
    ],
  },
  {
    label: 'Lương Thưởng',
    items: [
      { href: '/rewards', label: 'Thưởng', icon: FiAward },
      { href: '/penalties', label: 'Phạt', icon: FiAlertCircle },
      { href: '/payrolls', label: 'Bảng Lương', icon: FiDollarSign },
    ],
  },
  {
    label: 'Báo Cáo',
    items: [{ href: '/reports', label: 'Xem Báo Cáo', icon: FiBarChart2 }],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['Danh Mục', 'Nhân Viên', 'Lương Thưởng']);

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupLabel)
        ? prev.filter((g) => g !== groupLabel)
        : [...prev, groupLabel]
    );
  };

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some((item) => pathname === item.href);
  };

  return (
    <aside style={{
      width: '220px',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-md)',
      borderRight: '1px solid var(--gray-200)',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '1px solid var(--gray-200)',
        background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)',
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-xl)',
          fontWeight: 'var(--font-weight-bold)',
          color: 'var(--white)',
          marginBottom: 'var(--space-1)',
        }}>
          Quản Lý Lương
        </h1>
        <p style={{
          fontSize: 'var(--font-size-xs)',
          color: 'rgba(255, 255, 255, 0.9)',
        }}>
          Hệ thống quản lý
        </p>
      </div>
      <nav style={{ padding: 'var(--space-2)', flex: 1 }}>
        {menuGroups.map((group) => {
          const isExpanded = expandedGroups.includes(group.label);
          const isActive = isGroupActive(group);
          const hasMultipleItems = group.items.length > 1;

          return (
            <div key={group.label} style={{ marginBottom: 'var(--space-1)' }}>
              {hasMultipleItems ? (
                <>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      transition: 'all var(--transition-normal)',
                      color: isActive ? 'var(--primary-600)' : 'var(--gray-700)',
                      fontWeight: 'var(--font-weight-semibold)',
                      fontSize: 'var(--font-size-sm)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--gray-100)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{group.label}</span>
                    {isExpanded ? <FiChevronDown size={16} /> : <FiChevronRight size={16} />}
                  </button>
                  {isExpanded && (
                    <div style={{ paddingLeft: 'var(--space-4)' }}>
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const isItemActive = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: 'var(--space-2) var(--space-4)',
                              marginBottom: 'var(--space-1)',
                              borderRadius: 'var(--radius-md)',
                              transition: 'all var(--transition-normal)',
                              textDecoration: 'none',
                              background: isItemActive
                                ? 'var(--primary-50)'
                                : 'transparent',
                              color: isItemActive
                                ? 'var(--primary-600)'
                                : 'var(--gray-700)',
                              fontSize: 'var(--font-size-sm)',
                            }}
                            onMouseEnter={(e) => {
                              if (!isItemActive) {
                                e.currentTarget.style.background = 'var(--gray-100)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isItemActive) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <Icon style={{
                              marginRight: 'var(--space-2)',
                              fontSize: 'var(--font-size-base)',
                            }} />
                            <span style={{ fontWeight: isItemActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-normal)' }}>
                              {item.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                group.items.map((item) => {
                  const Icon = item.icon;
                  const isItemActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: 'var(--space-3) var(--space-4)',
                        marginBottom: 'var(--space-1)',
                        borderRadius: 'var(--radius-md)',
                        transition: 'all var(--transition-normal)',
                        textDecoration: 'none',
                        background: isItemActive
                          ? 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
                          : 'transparent',
                        color: isItemActive ? 'var(--white)' : 'var(--gray-700)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isItemActive) {
                          e.currentTarget.style.background = 'var(--gray-100)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isItemActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <Icon style={{
                        marginRight: 'var(--space-3)',
                        fontSize: 'var(--font-size-lg)',
                      }} />
                      <span style={{ fontWeight: 'var(--font-weight-medium)' }}>
                        {item.label}
                      </span>
                    </Link>
                  );
                })
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
