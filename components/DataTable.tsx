'use client';

import { ReactNode } from 'react';
import { FiInbox } from 'react-icons/fi';

export interface Column<T = any> {
  key: string;
  label: string;
  render?: (value: any, row: T) => ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  sortKey?: string;
  sortDirection?: 'asc' | 'desc';
}

export default function DataTable<T = any>({
  columns,
  data,
  loading = false,
  onSort,
  sortKey,
  sortDirection,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    const direction =
      sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(key, direction);
  };

  const getSortIndicator = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="data-table">
        <div className="data-table__container">
          <div className="p-6 text-center">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="data-table__container">
        <table className="data-table__table">
          <thead className="data-table__header">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`data-table__header-cell ${
                    column.align === 'center'
                      ? 'data-table__header-cell--center'
                      : column.align === 'right'
                      ? 'data-table__header-cell--right'
                      : ''
                  } ${
                    column.sortable ? 'data-table__header-cell--sortable' : ''
                  }`}
                  style={column.width ? { width: column.width } : {}}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <span className="data-table__header-content">
                    {column.label}
                    {column.sortable && getSortIndicator(column.key) && (
                      <span className="data-table__sort-indicator">
                        {getSortIndicator(column.key)}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="data-table__body">
            {data.length === 0 ? (
              <tr className="data-table__row">
                <td
                  className="data-table__cell"
                  colSpan={columns.length}
                  style={{ 
                    textAlign: 'center', 
                    padding: 'var(--space-12)',
                    color: 'var(--gray-500)'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    gap: 'var(--space-3)' 
                  }}>
                    <FiInbox size={48} style={{ opacity: 0.5 }} />
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>
                      Không có dữ liệu
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={index} className="data-table__row">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`data-table__cell ${
                        column.align === 'center'
                          ? 'data-table__cell--center'
                          : column.align === 'right'
                          ? 'data-table__cell--right'
                          : ''
                      }`}
                    >
                      {column.render
                        ? column.render((row as any)[column.key], row)
                        : (row as any)[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

