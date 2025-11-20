'use client'

import { useState } from 'react'
import styles from './AdvancedSearch.module.css'

interface SearchField {
  type: 'text' | 'select' | 'date' | 'dateRange'
  name: string
  label: string
  placeholder?: string
  options?: { value: string; label: string }[]
}

interface AdvancedSearchProps {
  fields: SearchField[]
  onSearch: (values: Record<string, string>) => void
  onReset: () => void
}

export default function AdvancedSearch({ fields, onSearch, onReset }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValues, setSearchValues] = useState<Record<string, string>>({})

  const handleChange = (name: string, value: string) => {
    setSearchValues(prev => ({ ...prev, [name]: value }))
  }

  const handleSearch = () => {
    onSearch(searchValues)
  }

  const handleReset = () => {
    setSearchValues({})
    onReset()
  }

  return (
    <div className={styles.searchContainer}>
      <div className={styles.searchHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>고급 검색</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className={styles.searchContent}>
          <div className={styles.searchFields}>
            {fields.map((field) => {
              if (field.type === 'text') {
                return (
                  <div key={field.name} className={styles.field}>
                    <label>{field.label}</label>
                    <input
                      type="text"
                      placeholder={field.placeholder || field.label}
                      value={searchValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  </div>
                )
              }

              if (field.type === 'select') {
                return (
                  <div key={field.name} className={styles.field}>
                    <label>{field.label}</label>
                    <select
                      value={searchValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                      <option value="">전체</option>
                      {field.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )
              }

              if (field.type === 'date') {
                return (
                  <div key={field.name} className={styles.field}>
                    <label>{field.label}</label>
                    <input
                      type="date"
                      value={searchValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  </div>
                )
              }

              if (field.type === 'dateRange') {
                return (
                  <div key={field.name} className={styles.field}>
                    <label>{field.label}</label>
                    <div className={styles.dateRange}>
                      <input
                        type="date"
                        placeholder="시작일"
                        value={searchValues[`${field.name}_start`] || ''}
                        onChange={(e) => handleChange(`${field.name}_start`, e.target.value)}
                      />
                      <span>~</span>
                      <input
                        type="date"
                        placeholder="종료일"
                        value={searchValues[`${field.name}_end`] || ''}
                        onChange={(e) => handleChange(`${field.name}_end`, e.target.value)}
                      />
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
          <div className={styles.searchActions}>
            <button className={styles.searchButton} onClick={handleSearch}>
              검색
            </button>
            <button className={styles.resetButton} onClick={handleReset}>
              초기화
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

