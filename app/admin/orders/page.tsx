import Link from 'next/link'
import styles from './orders.module.css'

export default function ServiceAccountsPage() {
  const stats = [
    { label: '전체 계정', value: '482', tone: 'blue' },
    { label: '활성 구독', value: '327', tone: 'green' },
    { label: '갱신 예정', value: '54', tone: 'orange' },
  ]

  const programs = [
    {
      name: '스토리빌더 시니어',
      product: '콘텐츠 제작',
      licenses: 48,
      students: 320,
      renewal: '82%',
      status: '활성',
      path: '/admin/orders/storybuilder-senior/storybooks',
      tags: ['시니어', 'AR', '크리에이터'],
    },
    {
      name: '메타라이프 아카데미',
      product: '학습관리',
      licenses: 30,
      students: 210,
      renewal: '76%',
      status: '활성',
      path: '#',
      tags: ['기관', 'MOOC'],
    },
    {
      name: 'XR 융합캠프',
      product: '실감형 교육',
      licenses: 18,
      students: 96,
      renewal: '64%',
      status: '점검중',
      path: '#',
      tags: ['캠프', '단기 과정'],
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>서비스 계정 관리</h1>
          <p className={styles.subtitle}>스토리빌더 시니어를 포함한 주요 서비스 계정 현황을 확인하고 관리합니다.</p>
        </div>
        <div className={styles.actions}>
          <Link href="/admin/products/new" className={styles.primaryButton}>
            + 라이선스 발급
          </Link>
          <Link href="/admin/products" className={styles.secondaryButton}>
            라이선스 현황
          </Link>
        </div>
      </div>

      <div className={styles.statGrid}>
        {stats.map((item) => (
          <div key={item.label} className={styles.statCard}>
            <span className={styles.statLabel}>{item.label}</span>
            <p className={styles.statValue}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>프로그램</th>
              <th>상품 유형</th>
              <th>보유 라이선스</th>
              <th>활성 수강생</th>
              <th>갱신율</th>
              <th>상태</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {programs.map((program) => (
              <tr key={program.name}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--gray-900)', marginBottom: 4 }}>
                    {program.name}
                  </div>
                  <div className={styles.badgeList}>
                    {program.tags.map((tag) => (
                      <span key={tag} className={`${styles.badge} ${styles.blue}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td>{program.product}</td>
                <td>{program.licenses.toLocaleString()} 개</td>
                <td>{program.students.toLocaleString()} 명</td>
                <td>{program.renewal}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      program.status === '활성'
                        ? styles.active
                        : program.status === '점검중'
                        ? styles.paused
                        : styles.inactive
                    }`}
                  >
                    {program.status}
                  </span>
                </td>
                <td>
                  <div className={styles.tableActions}>
                    <Link
                      href={program.path}
                      className={styles.linkButton}
                      aria-disabled={program.path === '#'}
                    >
                      상세 보기
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

