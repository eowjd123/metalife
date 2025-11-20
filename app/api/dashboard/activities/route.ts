import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10)

    const activities: Array<{
      type: string
      message: string
      time: string
      timestamp: Date
    }> = []

    // 1. 최근 회원 가입
    const recentMembers = await prisma.tB_MEMBER.findMany({
      where: {
        member_del_YN: 'N',
      },
      select: {
        member_idx: true,
        member_name: true,
        member_id: true,
        member_reg_date: true,
      },
      orderBy: {
        member_reg_date: 'desc',
      },
      take: 5,
    })

    recentMembers.forEach((member) => {
      activities.push({
        type: 'member_register',
        message: `새로운 회원이 가입했습니다: ${member.member_name}${member.member_id ? ` (${member.member_id})` : ''}`,
        time: formatTimeAgo(member.member_reg_date),
        timestamp: member.member_reg_date,
      })
    })

    // 2. 최근 로그인
    const recentLogins = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      select: {
        member_login_reg_date: true,
        member_idx: true,
      },
      orderBy: {
        member_login_reg_date: 'desc',
      },
      take: 5,
    })

    const memberIds = recentLogins
      .map(log => log.member_idx)
      .filter((idx): idx is number => idx !== null)

    const members = await prisma.tB_MEMBER.findMany({
      where: {
        member_idx: { in: memberIds },
      },
      select: {
        member_idx: true,
        member_name: true,
        member_id: true,
      },
    })

    const memberMap = new Map(members.map(m => [m.member_idx, m]))

    recentLogins.forEach((login) => {
      const member = login.member_idx ? memberMap.get(login.member_idx) : null
      if (member) {
        activities.push({
          type: 'member_login',
          message: `${member.member_name}${member.member_id ? ` (${member.member_id})` : ''}님이 로그인했습니다`,
          time: formatTimeAgo(login.member_login_reg_date),
          timestamp: login.member_login_reg_date,
        })
      }
    })

    // 3. 최근 문의
    const recentInquiries = await prisma.tB_BOARD_USER.findMany({
      where: {
        board_user_del_YN: 'N',
      },
      select: {
        board_user_idx: true,
        board_user_title: true,
        board_user_name: true,
        board_user_reg_date: true,
        board_user_reply_YN: true,
      },
      orderBy: {
        board_user_reg_date: 'desc',
      },
      take: 5,
    })

    recentInquiries.forEach((inquiry) => {
      activities.push({
        type: 'inquiry',
        message: `새로운 문의가 접수되었습니다: ${inquiry.board_user_title}${inquiry.board_user_reply_YN === 'N' ? ' (미답변)' : ''}`,
        time: formatTimeAgo(inquiry.board_user_reg_date),
        timestamp: inquiry.board_user_reg_date,
      })
    })

    // 4. 최근 관리자 로그인
    const recentAdminLogins = await prisma.tB_ADMIN_LOGIN_LOG.findMany({
      select: {
        admin_login_reg_date: true,
        admin_idx: true,
      },
      orderBy: {
        admin_login_reg_date: 'desc',
      },
      take: 3,
    })

    const adminIds = recentAdminLogins
      .map(log => log.admin_idx)
      .filter((idx): idx is number => idx !== null)

    const admins = await prisma.tB_ADMIN.findMany({
      where: {
        admin_idx: { in: adminIds },
      },
      select: {
        admin_idx: true,
        admin_name: true,
        admin_id: true,
      },
    })

    const adminMap = new Map(admins.map(a => [a.admin_idx, a]))

    recentAdminLogins.forEach((login) => {
      const admin = login.admin_idx ? adminMap.get(login.admin_idx) : null
      if (admin) {
        activities.push({
          type: 'admin_login',
          message: `관리자 ${admin.admin_name}${admin.admin_id ? ` (${admin.admin_id})` : ''}님이 로그인했습니다`,
          time: formatTimeAgo(login.admin_login_reg_date),
          timestamp: login.admin_login_reg_date,
        })
      }
    })

    // 시간순으로 정렬하고 최신순으로 제한
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    const limitedActivities = activities.slice(0, limit)

    return NextResponse.json({
      activities: limitedActivities,
    })
  } catch (error) {
    console.error('최근 활동 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}일 전`
  } else if (hours > 0) {
    return `${hours}시간 전`
  } else if (minutes > 0) {
    return `${minutes}분 전`
  } else {
    return '방금 전'
  }
}

