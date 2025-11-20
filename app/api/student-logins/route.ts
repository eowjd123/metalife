import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')
    const memberName = searchParams.get('memberName')
    const loginDomain = searchParams.get('loginDomain')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'member_login_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 학생 회원 IDX 목록 조회 (member_gubun = 'S')
    const studentMembers = await prisma.tB_MEMBER.findMany({
      where: {
        member_del_YN: 'N',
        member_gubun: 'S',
      },
      select: {
        member_idx: true,
        member_id: true,
        member_name: true,
      },
    })

    const studentIdxList = studentMembers.map(m => m.member_idx)

    if (studentIdxList.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 0,
        stats: {
          total: 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0,
        },
      })
    }

    const where: any = {
      member_idx: { in: studentIdxList },
    }

    // 회원 ID로 필터링
    if (memberId) {
      const filteredStudents = studentMembers.filter(
        m => m.member_id && m.member_id.includes(memberId)
      )
      if (filteredStudents.length > 0) {
        where.member_idx = { in: filteredStudents.map(m => m.member_idx) }
      } else {
        // 매칭되는 학생이 없으면 빈 결과
        return NextResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
          stats: {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
        })
      }
    }

    // 회원명으로 필터링
    if (memberName) {
      const filteredStudents = studentMembers.filter(
        m => m.member_name && m.member_name.includes(memberName)
      )
      if (filteredStudents.length > 0) {
        where.member_idx = { in: filteredStudents.map(m => m.member_idx) }
      } else {
        return NextResponse.json({
          data: [],
          total: 0,
          page: 1,
          limit,
          totalPages: 0,
          stats: {
            total: 0,
            today: 0,
            thisWeek: 0,
            thisMonth: 0,
          },
        })
      }
    }

    if (loginDomain) {
      where.member_login_domain = {
        contains: loginDomain,
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
        where.member_login_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_MEMBER_LOGIN_LOG.count({ where })

    // 통계 계산
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const thisWeek = new Date(today)
    thisWeek.setDate(today.getDate() - 7)
    const thisMonth = new Date(today)
    thisMonth.setMonth(today.getMonth() - 1)

    const totalStats = {
      total: await prisma.tB_MEMBER_LOGIN_LOG.count({
        where: {
          member_idx: { in: studentIdxList },
        },
      }),
      today: await prisma.tB_MEMBER_LOGIN_LOG.count({
        where: {
          member_idx: { in: studentIdxList },
          member_login_reg_date: { gte: today },
        },
      }),
      thisWeek: await prisma.tB_MEMBER_LOGIN_LOG.count({
        where: {
          member_idx: { in: studentIdxList },
          member_login_reg_date: { gte: thisWeek },
        },
      }),
      thisMonth: await prisma.tB_MEMBER_LOGIN_LOG.count({
        where: {
          member_idx: { in: studentIdxList },
          member_login_reg_date: { gte: thisMonth },
        },
      }),
    }

    // 수강생 로그인 로그 조회
    const logs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where,
      select: {
        member_login_idx: true,
        member_idx: true,
        member_login_domain: true,
        member_login_reg_ip: true,
        member_login_reg_date: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          member_login_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 회원 정보 매핑
    const memberMap = new Map(studentMembers.map(m => [m.member_idx, m]))

    // 데이터 변환
    const result = logs.map((log) => {
      const member = log.member_idx ? memberMap.get(log.member_idx) : null

      return {
        id: log.member_login_idx,
        memberIdx: log.member_idx,
        memberId: member?.member_id || '-',
        memberName: member?.member_name || '-',
        loginDomain: log.member_login_domain || '-',
        registeredIp: log.member_login_reg_ip || '-',
        registeredDate: log.member_login_reg_date.toISOString().replace('T', ' ').substring(0, 19),
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
    console.error('수강생 로그인 이력 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

