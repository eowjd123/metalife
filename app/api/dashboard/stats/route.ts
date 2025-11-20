import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // 오늘 날짜 설정
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    const thisMonth = new Date(today)
    thisMonth.setMonth(thisMonth.getMonth() - 1)
    
    const lastMonth = new Date(thisMonth)
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    // 1. 총 회원 수
    const totalMembers = await prisma.tB_MEMBER.count({
      where: {
        member_del_YN: 'N',
      },
    })

    // 이번 달 신규 회원 수
    const newMembersThisMonth = await prisma.tB_MEMBER.count({
      where: {
        member_del_YN: 'N',
        member_reg_date: {
          gte: thisMonth,
        },
      },
    })

    // 지난 달 신규 회원 수
    const newMembersLastMonth = await prisma.tB_MEMBER.count({
      where: {
        member_del_YN: 'N',
        member_reg_date: {
          gte: lastMonth,
          lt: thisMonth,
        },
      },
    })

    // 2. 활성 회원 수
    const activeMembers = await prisma.tB_MEMBER.count({
      where: {
        member_del_YN: 'N',
        member_used_YN: 'Y',
      },
    })

    // 3. 오늘 접속자 수 (고유 회원)
    const todayLoginLogs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where: {
        member_login_reg_date: {
          gte: today,
        },
      },
      select: {
        member_idx: true,
      },
    })

    const uniqueTodayLogins = new Set(
      todayLoginLogs.map(log => log.member_idx).filter((idx): idx is number => idx !== null)
    ).size

    // 어제 접속자 수
    const yesterdayLoginLogs = await prisma.tB_MEMBER_LOGIN_LOG.findMany({
      where: {
        member_login_reg_date: {
          gte: yesterday,
          lt: today,
        },
      },
      select: {
        member_idx: true,
      },
    })

    const uniqueYesterdayLogins = new Set(
      yesterdayLoginLogs.map(log => log.member_idx).filter((idx): idx is number => idx !== null)
    ).size

    // 4. 활성 라이선스 수
    // license_enddate는 String 타입이므로 문자열 비교 필요
    const todayString = today.toISOString().split('T')[0] // YYYY-MM-DD 형식
    
    const allActiveLicenses = await prisma.tB_LICENSE_CODE.findMany({
      where: {
        license_del_YN: 'N',
        license_used_YN: 'Y',
      },
      select: {
        license_enddate: true,
      },
    })

    // 만료일이 없거나 오늘 이후인 라이선스만 카운트
    const activeLicenses = allActiveLicenses.filter((license) => {
      if (!license.license_enddate) return true
      // String 타입이므로 문자열 비교
      return license.license_enddate >= todayString || license.license_enddate === '9999-12-31'
    }).length

    // 5. 미답변 문의 수
    const unansweredInquiries = await prisma.tB_BOARD_USER.count({
      where: {
        board_user_del_YN: 'N',
        board_user_reply_YN: 'N',
      },
    })

    // 6. 총 관리자 수
    const totalAdmins = await prisma.tB_ADMIN.count({
      where: {
        admin_del_YN: 'N',
      },
    })

    // 7. 오늘 관리자 로그인 수
    const todayAdminLogins = await prisma.tB_ADMIN_LOGIN_LOG.count({
      where: {
        admin_login_reg_date: {
          gte: today,
        },
      },
    })

    // 8. 총 그룹 수
    const totalGroups = await prisma.tB_GROUP.count({
      where: {
        group_del_YN: 'N',
      },
    })

    // 증감률 계산
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const memberChange = calculateChange(newMembersThisMonth, newMembersLastMonth)
    const loginChange = calculateChange(uniqueTodayLogins, uniqueYesterdayLogins)

    return NextResponse.json({
      stats: {
        totalMembers: {
          value: totalMembers,
          change: memberChange,
          changeType: memberChange >= 0 ? 'increase' : 'decrease',
        },
        activeMembers: {
          value: activeMembers,
        },
        todayLogins: {
          value: uniqueTodayLogins,
          change: loginChange,
          changeType: loginChange >= 0 ? 'increase' : 'decrease',
        },
        activeLicenses: {
          value: activeLicenses,
        },
        unansweredInquiries: {
          value: unansweredInquiries,
        },
        totalAdmins: {
          value: totalAdmins,
        },
        todayAdminLogins: {
          value: todayAdminLogins,
        },
        totalGroups: {
          value: totalGroups,
        },
      },
    })
  } catch (error) {
    console.error('대시보드 통계 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

