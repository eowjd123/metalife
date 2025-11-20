import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberName = searchParams.get('memberName')
    const email = searchParams.get('email')
    const ip = searchParams.get('ip')
    const loginTimeStart = searchParams.get('loginTime_start')
    const loginTimeEnd = searchParams.get('loginTime_end')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'member_login_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    // Filter by login time range
    if (loginTimeStart || loginTimeEnd) {
      where.member_login_reg_date = {}
      if (loginTimeStart) {
        where.member_login_reg_date.gte = new Date(loginTimeStart)
      }
      if (loginTimeEnd) {
        const endDate = new Date(loginTimeEnd)
        endDate.setHours(23, 59, 59, 999)
        where.member_login_reg_date.lte = endDate
      }
    }

    if (ip) {
      where.member_login_reg_ip = {
        contains: ip,
      }
    }

    // First, get the total count for pagination
    const total = await prisma.tB_MEMBER_LOGIN_LOG.count({
      where,
    })

    // Get overall stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const totalStats = {
      total: await prisma.tB_MEMBER_LOGIN_LOG.count(),
      today: await prisma.tB_MEMBER_LOGIN_LOG.count({
        where: {
          member_login_reg_date: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    }

    // Fetch login logs with pagination
    const loginLogs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where,
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

    // Extract unique member_idx from login logs
    const memberIdxList = loginLogs
      .map(log => log.member_idx)
      .filter((idx): idx is number => idx !== null)

    // Fetch member details for the extracted member_idx list
    const members = await prisma.tB_MEMBER.findMany({
      where: {
        member_idx: {
          in: memberIdxList,
        },
      },
      select: {
        member_idx: true,
        member_name: true,
        member_email: true,
        member_id: true,
      },
    })

    // Create a map for quick lookup of member details
    const memberMap = new Map(members.map(member => [member.member_idx, member]))

    // Transform data for frontend
    const result = loginLogs.map((log) => {
      const member = log.member_idx ? memberMap.get(log.member_idx) : undefined
      const memberName = member?.member_name || '알 수 없음'
      const memberEmail = member?.member_email || '-'
      const memberId = member?.member_id || '-'

      return {
        id: log.member_login_idx,
        memberIdx: log.member_idx,
        memberId: memberId,
        memberName: memberName,
        email: memberEmail,
        loginTime: log.member_login_reg_date.toISOString().replace('T', ' ').substring(0, 19),
        ip: log.member_login_reg_ip || '-',
        domain: log.member_login_domain || '-',
      }
    })

    // Apply name and email filters after joining with member data
    const filteredResult = result.filter(item => {
      let match = true
      if (memberName && !item.memberName.includes(memberName)) match = false
      if (email && !item.email.includes(email)) match = false
      return match
    })

    return NextResponse.json({
      data: filteredResult,
      total: total, // Use original total for pagination
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: totalStats,
    })
  } catch (error) {
    console.error('사용자 접속 이력 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

