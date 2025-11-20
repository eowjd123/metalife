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
    end.setHours(23, 59, 59, 999)

    // 주별 접속 통계 조회 (고유 사용자 수 기준)
    const loginLogs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where: {
        member_login_reg_date: {
          gte: start,
          lte: end,
        },
        member_idx: {
          not: null,
        },
      },
      select: {
        member_login_reg_date: true,
        member_idx: true,
      },
    })

    // 주별로 그룹화 (주 시작일 기준, 고유 사용자 수 집계)
    const weeklyStats: Record<string, Set<number>> = {}

    loginLogs.forEach((log) => {
      if (log.member_idx !== null) {
        const date = new Date(log.member_login_reg_date)
        // 주의 시작일 계산 (월요일 기준)
        const dayOfWeek = date.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        const weekStart = new Date(date)
        weekStart.setDate(date.getDate() + diff)
        weekStart.setHours(0, 0, 0, 0)
        
        const weekKey = weekStart.toISOString().split('T')[0]
        
        if (!weeklyStats[weekKey]) {
          weeklyStats[weekKey] = new Set()
        }
        weeklyStats[weekKey].add(log.member_idx)
      }
    })

    // Set의 크기(고유 사용자 수)로 변환
    const weeklyCounts: Record<string, number> = {}
    Object.entries(weeklyStats).forEach(([week, userSet]) => {
      weeklyCounts[week] = userSet.size
    })

    // 결과 배열로 변환
    const result = Object.entries(weeklyCounts)
      .map(([weekStart, count]) => {
        const d = new Date(weekStart)
        const month = d.getMonth() + 1
        const weekNum = Math.ceil(d.getDate() / 7)
        return {
          week: `${month}/${weekNum}주`,
          weekNum: weekNum,
          count: count,
          weekStart: weekStart,
        }
      })
      .sort((a, b) => {
        return new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime()
      })

    const totalAccess = result.reduce((sum, item) => sum + item.count, 0)
    const todayAccess = result[result.length - 1]?.count || 0

    return NextResponse.json({
      data: result,
      totalAccess,
      todayAccess,
    })
  } catch (error) {
    console.error('주별 접속 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

