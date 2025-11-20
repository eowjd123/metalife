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

    // 월별 접속 통계 조회 (고유 사용자 수 기준)
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

    // 월별로 그룹화 (고유 사용자 수 집계)
    const monthlyStats: Record<string, Set<number>> = {}

    loginLogs.forEach((log) => {
      if (log.member_idx !== null) {
        const date = new Date(log.member_login_reg_date)
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = new Set()
        }
        monthlyStats[monthKey].add(log.member_idx)
      }
    })

    // Set의 크기(고유 사용자 수)로 변환
    const monthlyCounts: Record<string, number> = {}
    Object.entries(monthlyStats).forEach(([month, userSet]) => {
      monthlyCounts[month] = userSet.size
    })

    // 결과 배열로 변환
    const result = Object.entries(monthlyCounts)
      .map(([monthKey, count]) => {
        const [year, month] = monthKey.split('-')
        return {
          month: monthKey,
          monthNum: parseInt(month),
          year: parseInt(year),
          count: count,
        }
      })
      .sort((a, b) => {
        if (a.year !== b.year) {
          return a.year - b.year
        }
        return a.monthNum - b.monthNum
      })

    const totalAccess = result.reduce((sum, item) => sum + item.count, 0)
    const todayAccess = result[result.length - 1]?.count || 0

    return NextResponse.json({
      data: result,
      totalAccess,
      todayAccess,
    })
  } catch (error) {
    console.error('월별 접속 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

