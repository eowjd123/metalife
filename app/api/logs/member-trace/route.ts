import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberIdx = searchParams.get('memberIdx')
    const traceDomain = searchParams.get('traceDomain')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'member_trace_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (memberIdx) {
      where.member_idx = parseInt(memberIdx, 10)
    }

    if (traceDomain) {
      where.member_trace_domain = {
        contains: traceDomain,
      }
    }

    // 날짜 필터링
    if (dateStart || dateEnd) {
      const dateFilter: any = {}
      if (dateStart) {
        const start = new Date(dateStart)
        start.setHours(0, 0, 0, 0)
        dateFilter.gte = start
      }
      if (dateEnd) {
        const end = new Date(dateEnd)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
      if (Object.keys(dateFilter).length > 0) {
        where.member_trace_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_MEMBER_TRACE_LOG.count({ where })

    // 통계
    const totalStats = {
      total: await prisma.tB_MEMBER_TRACE_LOG.count(),
    }

    // 회원 추적 로그 조회
    const logs = await prisma.tB_MEMBER_TRACE_LOG.findMany({
      where,
      select: {
        member_trace_idx: true,
        member_idx: true,
        member_trace_domain: true,
        member_trace_reg_date: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          member_trace_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 회원 정보 조회
    const memberIdxList = logs
      .map(l => l.member_idx)
      .filter((idx): idx is number => idx !== null && idx > 0)

    let members: any[] = []
    if (memberIdxList.length > 0) {
      members = await prisma.tB_MEMBER.findMany({
        where: {
          member_idx: { in: memberIdxList },
        },
        select: {
          member_idx: true,
          member_id: true,
          member_name: true,
          member_email: true,
        },
      })
    }

    const memberMap = new Map(members.map(m => [m.member_idx, m]))

    // 데이터 변환
    const result = logs.map((log) => {
      const member = log.member_idx ? memberMap.get(log.member_idx) : null

      return {
        id: log.member_trace_idx,
        memberIdx: log.member_idx,
        memberId: member?.member_id || null,
        memberName: member?.member_name || null,
        memberEmail: member?.member_email || null,
        traceDomain: log.member_trace_domain || '-',
        registeredDate: log.member_trace_reg_date.toISOString().replace('T', ' ').substring(0, 19),
      }
    })

    return NextResponse.json({
      data: result,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: totalStats,
    })
  } catch (error) {
    console.error('회원 추적 로그 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

