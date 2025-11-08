'use client';

import { ReactNode, useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface SearchField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'date' | 'select' | 'daterange';
  placeholder?: string;
  options?: { value: string; label: string }[];
  width?: 'full' | 'medium' | 'date' | 'select' | 'daterange';
}

interface SearchFilterProps {
  fields: SearchField[];
  onSearch?: (values: Record<string, any>) => void;
  onReset?: () => void;
  showAdvanced?: boolean;
  advancedFields?: SearchField[];
  debounceMs?: number;
  realTime?: boolean;
}

export default function SearchFilter({
  fields,
  onSearch,
  onReset,
  showAdvanced = false,
  advancedFields = [],
  debounceMs = 300,
  realTime = false,
}: SearchFilterProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [hasFilters, setHasFilters] = useState(false);

  // Debounce search
  useEffect(() => {
    if (!realTime) return;
    
    const timer = setTimeout(() => {
      if (hasFilters) {
        onSearch?.(formData);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [formData, debounceMs, realTime, hasFilters, onSearch]);

  // Check if has any filters
  useEffect(() => {
    const hasValue = Object.values(formData).some(
      (value) => value !== '' && value !== null && value !== undefined
    );
    setHasFilters(hasValue);
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(formData);
  };

  const handleReset = () => {
    setFormData({});
    setHasFilters(false);
    setIsAdvancedOpen(false);
    onReset?.();
  };

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // Remove empty values
      if (value === '' || value === null || value === undefined) {
        delete newData[name];
      }
      return newData;
    });
  };

  const getFieldWidthClass = (width?: string) => {
    switch (width) {
      case 'full':
        return 'search-filter__field--full';
      case 'medium':
        return 'search-filter__field--medium';
      case 'date':
        return 'search-filter__field--date';
      case 'select':
        return 'search-filter__field--select';
      case 'daterange':
        return 'search-filter__field--daterange';
      default:
        return 'search-filter__field--medium';
    }
  };

  return (
    <div className="search-filter">
      <div className="search-filter__container">
        <form className="search-filter__form" onSubmit={handleSubmit}>
          <div className="search-filter__fields">
            {fields.map((field) => (
              <div
                key={field.name}
                className={`search-filter__field ${getFieldWidthClass(field.width)}`}
              >
                <label className="search-filter__label">{field.label}</label>
                {field.type === 'select' ? (
                  <select
                    className="search-filter__select"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'daterange' ? (
                  <div className="search-filter__daterange">
                    <input
                      type="date"
                      className="search-filter__input"
                      value={formData[`${field.name}_from`] || ''}
                      onChange={(e) => handleChange(`${field.name}_from`, e.target.value)}
                    />
                    <span className="search-filter__daterange-separator">-</span>
                    <input
                      type="date"
                      className="search-filter__input"
                      value={formData[`${field.name}_to`] || ''}
                      onChange={(e) => handleChange(`${field.name}_to`, e.target.value)}
                    />
                  </div>
                ) : (
                  <input
                    type={field.type || 'text'}
                    className="search-filter__input"
                    placeholder={field.placeholder}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  />
                )}
              </div>
            ))}

            <div className="search-filter__actions">
              {hasFilters && (
                <button
                  type="button"
                  className="search-filter__action-btn"
                  onClick={handleReset}
                  title="Xóa bộ lọc"
                  style={{
                    background: 'var(--error-50)',
                    color: 'var(--error-500)',
                  }}
                >
                  <FiX />
                </button>
              )}
              <button
                type="button"
                className="search-filter__action-btn"
                onClick={handleReset}
                title="Làm mới"
              >
                <FiRefreshCw />
              </button>
              <button
                type="submit"
                className="search-filter__action-btn"
                title="Tìm kiếm"
                style={{
                  background: hasFilters ? 'var(--primary-500)' : 'var(--gray-100)',
                  color: hasFilters ? 'var(--white)' : 'var(--gray-600)',
                }}
              >
                <FiSearch />
              </button>
              {showAdvanced && advancedFields.length > 0 && (
                <button
                  type="button"
                  className="search-filter__action-btn"
                  onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                  title="Bộ lọc nâng cao"
                  style={{
                    background: isAdvancedOpen ? 'var(--primary-50)' : 'var(--gray-100)',
                    color: isAdvancedOpen ? 'var(--primary-600)' : 'var(--gray-600)',
                  }}
                >
                  <FiFilter />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {isAdvancedOpen && advancedFields.length > 0 && (
        <div className="advanced-search">
          <div className="advanced-search__container">
            <div className="advanced-search__header">
              <h3 className="advanced-search__title">Tìm kiếm nâng cao</h3>
            </div>
            <form
              className="advanced-search__form"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch?.(formData);
              }}
            >
              <div className="advanced-search__fields">
                {advancedFields.map((field) => (
                  <div key={field.name} className="advanced-search__field">
                    <label className="advanced-search__label">{field.label}</label>
                    {field.type === 'select' ? (
                      <select
                        className="advanced-search__select"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      >
                        <option value="">Tất cả</option>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.type || 'text'}
                        className="advanced-search__input"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="advanced-search__actions">
                <button type="submit" className="btn btn-primary">
                  Tìm kiếm
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setFormData({});
                    setHasFilters(false);
                    onReset?.();
                  }}
                >
                  Xóa bộ lọc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
