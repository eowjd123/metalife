import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: '시작일과 종료일이 필요합니다.' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999) // 종료일의 마지막 시간까지

    // 일별 접속 통계 조회 (고유 사용자 수 기준)
    const loginLogs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where: {
        member_login_reg_date: {
          gte: start,
          lte: end,
        },
        member_idx: {
          not: null, // member_idx가 null이 아닌 경우만 (로그인한 사용자만)
        },
      },
      select: {
        member_login_reg_date: true,
        member_idx: true,
      },
    })

    // 날짜별로 그룹화 (날짜 + 사용자 ID 조합으로 고유 사용자 수 집계)
    const dailyStats: Record<string, Set<number>> = {}
    
    // 날짜 범위의 모든 날짜 초기화
    const currentDate = new Date(start)
    while (currentDate <= end) {
      const dateKey = currentDate.toISOString().split('T')[0]
      dailyStats[dateKey] = new Set()
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 로그인 로그를 날짜별로 집계 (같은 사용자의 중복 로그인은 1회로 카운트)
    loginLogs.forEach((log) => {
      if (log.member_idx !== null) {
        const dateKey = log.member_login_reg_date.toISOString().split('T')[0]
        if (dailyStats[dateKey] !== undefined) {
          dailyStats[dateKey].add(log.member_idx) // Set을 사용하여 중복 제거
        }
      }
    })

    // Set의 크기(고유 사용자 수)로 변환
    const dailyCounts: Record<string, number> = {}
    Object.entries(dailyStats).forEach(([date, userSet]) => {
      dailyCounts[date] = userSet.size
    })

    // 결과 배열로 변환
    const result = Object.entries(dailyCounts)
      .map(([date, count]) => {
        const d = new Date(date)
        return {
          date: `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`,
          day: d.getDate(),
          count: count,
        }
      })
      .sort((a, b) => {
        const dateA = new Date(a.date.split('-').reverse().join('-'))
        const dateB = new Date(b.date.split('-').reverse().join('-'))
        return dateA.getTime() - dateB.getTime()
      })

    const totalAccess = result.reduce((sum, item) => sum + item.count, 0)
    const todayAccess = result[result.length - 1]?.count || 0

    return NextResponse.json({
      data: result,
      totalAccess,
      todayAccess,
    })
  } catch (error) {
    console.error('일별 접속 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

