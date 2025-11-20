'use client'

import { useState, useEffect } from 'react'
import styles from '../access-status.module.css'

export default function WeeklyAccessStatusPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1개월')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [accessData, setAccessData] = useState<Array<{ week: string; weekNum: number; count: number }>>([])
  const [totalAccess, setTotalAccess] = useState(0)
  const [todayAccess, setTodayAccess] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 초기 날짜 설정
    const today = new Date()
    const end = new Date(today)
    const start = new Date(today)
    start.setDate(today.getDate() - 29) // 기본 1개월
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  // 데이터 로드 함수
  const loadData = async (start: string, end: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `/api/access-statistics/weekly?startDate=${start}&endDate=${end}`
      )
      if (!response.ok) {
        throw new Error('데이터를 불러오는데 실패했습니다.')
      }
      const result = await response.json()
      setAccessData(result.data)
      setTotalAccess(result.totalAccess)
      setTodayAccess(result.todayAccess)
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      console.error('데이터 로드 오류:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (startDate && endDate) {
      loadData(startDate, endDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePeriodClick = (period: string) => {
    setSelectedPeriod(period)
    const today = new Date()
    const end = new Date(today)
    let start = new Date(today)
    
    switch (period) {
      case '오늘':
        start = new Date(today)
        break
      case '3일':
        start.setDate(today.getDate() - 2)
        break
      case '7일':
        start.setDate(today.getDate() - 6)
        break
      case '1개월':
        start.setDate(today.getDate() - 29)
        break
    }
    
    const startStr = start.toISOString().split('T')[0]
    const endStr = end.toISOString().split('T')[0]
    
    setStartDate(startStr)
    setEndDate(endStr)
    
    loadData(startStr, endStr)
  }

  const handleSearch = () => {
    if (startDate && endDate) {
      loadData(startDate, endDate)
    }
  }

  return (
    <div className={styles.accessStatus}>
      <h1 className={styles.title}>주별 접속 현황</h1>

      <div className={styles.filterSection}>
        <div className={styles.periodGroup}>
          <label className={styles.periodLabel}>기간</label>
          <div className={styles.periodButtons}>
            {['오늘', '3일', '7일', '1개월'].map((period) => (
              <button
                key={period}
                className={`${styles.periodButton} ${
                  selectedPeriod === period ? styles.active : ''
                }`}
                onClick={() => handlePeriodClick(period)}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.dateGroup}>
          <div className={styles.dateInputWrapper}>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <span className={styles.dateSeparator}>~</span>
          <div className={styles.dateInputWrapper}>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button className={styles.searchButton} onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      <div className={styles.statsSummary}>
        <span>총 접속 횟수 <strong>{totalAccess.toLocaleString()}회</strong></span>
        <span className={styles.separator}>|</span>
        <span>금일 접속 횟수 <strong>{todayAccess}회</strong></span>
      </div>

      {error && (
        <div style={{ 
          padding: '16px', 
          background: '#fef2f2', 
          border: '1px solid #fecaca', 
          borderRadius: '8px', 
          color: '#dc2626',
          marginBottom: '24px'
        }}>
          {error}
        </div>
      )}

      {isLoading && (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          color: '#64748b'
        }}>
          데이터를 불러오는 중...
        </div>
      )}

      {!isLoading && !error && (
        <div className={styles.chartContainer}>
          <div className={styles.chartTitle}>주별 접속자 수</div>
          {accessData.length > 0 ? (
            <>
              <div className={styles.chart}>
                <div className={styles.chartYAxis}>
                  {(() => {
                    const maxCount = Math.max(...accessData.map(item => item.count), 1)
                    const maxY = Math.ceil(maxCount / 200) * 200
                    const steps = 5
                    const stepValue = maxY / steps
                    return Array.from({ length: steps + 1 }, (_, i) => i * stepValue).map((value) => (
                      <div key={value} className={styles.yAxisLabel}>
                        {Math.round(value)}
                      </div>
                    ))
                  })()}
                </div>
                <div className={styles.chartContent}>
                  <div className={styles.chartBars}>
                    {accessData.map((item, index) => {
                      const maxCount = Math.max(...accessData.map(item => item.count), 1)
                      const chartHeight = 300
                      const height = Math.max((item.count / maxCount) * chartHeight, item.count > 0 ? 4 : 0)
                      const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                      
                      const getBarColor = (pct: number) => {
                        if (pct >= 80) return 'linear-gradient(180deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)'
                        if (pct >= 60) return 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 50%, #2563eb 100%)'
                        if (pct >= 40) return 'linear-gradient(180deg, #93c5fd 0%, #60a5fa 50%, #3b82f6 100%)'
                        if (pct >= 20) return 'linear-gradient(180deg, #bfdbfe 0%, #93c5fd 50%, #60a5fa 100%)'
                        return 'linear-gradient(180deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%)'
                      }
                      
                      return (
                        <div 
                          key={index} 
                          className={styles.barWrapper}
                          style={{ 
                            animationDelay: `${index * 0.03}s` 
                          }}
                        >
                          <div
                            className={styles.bar}
                            style={{ 
                              height: `${height}px`,
                              background: getBarColor(percentage),
                              minHeight: item.count > 0 ? '4px' : '0'
                            }}
                            title={`${item.week}\n접속 횟수: ${item.count}회\n전체 대비: ${percentage.toFixed(1)}%`}
                          >
                            <span className={styles.barValue}>{item.count}</span>
                          </div>
                          <div className={styles.barLabel}>{item.weekNum}주</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className={styles.chartXAxis}>
                {accessData.map((item, index) => (
                  <div key={index} className={styles.xAxisLabel}>
                    {item.weekNum}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
              해당 기간의 데이터가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
}

