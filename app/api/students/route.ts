import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const status = searchParams.get('status')
    const groupIdx = searchParams.get('groupIdx')
    const joinDateStart = searchParams.get('joinDate_start')
    const joinDateEnd = searchParams.get('joinDate_end')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'member_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 학생만 필터링 (member_gubun = 'S')
    const where: any = {
      member_del_YN: 'N',
      member_gubun: 'S', // 학생만
    }

    // 검색 조건 추가
    if (name) {
      where.member_name = {
        contains: name,
      }
    }

    if (email) {
      where.member_email = {
        contains: email,
      }
    }

    // 상태 필터링 (member_used_YN)
    if (status) {
      if (status === '활성') {
        where.member_used_YN = 'Y'
      } else if (status === '비활성') {
        where.member_used_YN = 'N'
      }
    }

    // 그룹 필터링
    if (groupIdx) {
      where.group_idx = parseInt(groupIdx, 10)
    }

    // 가입일 범위 필터링
    if (joinDateStart || joinDateEnd) {
      const dateFilter: any = {}
      if (joinDateStart) {
        const start = new Date(joinDateStart)
        start.setHours(0, 0, 0, 0)
        dateFilter.gte = start
      }
      if (joinDateEnd) {
        const end = new Date(joinDateEnd)
        end.setHours(23, 59, 59, 999)
        dateFilter.lte = end
      }
      if (Object.keys(dateFilter).length > 0) {
        where.member_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_MEMBER.count({ where })

    // 전체 통계 (학생만)
    const totalStats = {
      total: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_gubun: 'S',
        },
      }),
      active: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_gubun: 'S',
          member_used_YN: 'Y',
        },
      }),
      inactive: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_gubun: 'S',
          member_used_YN: 'N',
        },
      }),
    }

    // 수강생 목록 조회
    const members = await prisma.tB_MEMBER.findMany({
      where,
      select: {
        member_idx: true,
        member_id: true,
        member_name: true,
        member_nicname: true,
        member_email: true,
        member_phone: true,
        member_gubun: true,
        member_used_YN: true,
        member_reg_date: true,
        member_login_date: true,
        member_login_cnt: true,
        member_grade: true,
        group_idx: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          member_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 그룹 정보 조회
    const groupIdxList = members
      .map(m => m.group_idx)
      .filter((idx): idx is number => idx !== null && idx > 0)

    let groups: any[] = []
    if (groupIdxList.length > 0) {
      groups = await prisma.tB_GROUP.findMany({
        where: {
          group_idx: { in: groupIdxList },
        },
        select: {
          group_idx: true,
          group_name: true,
        },
      })
    }

    const groupMap = new Map(groups.map(g => [g.group_idx, g]))

    // 데이터 변환
    const result = members.map((member, index) => {
      const group = member.group_idx ? groupMap.get(member.group_idx) : null

      return {
        id: member.member_idx,
        sequence: (page - 1) * limit + index + 1,
        memberId: member.member_id || '',
        name: member.member_name || '이름없음',
        nicname: member.member_nicname || '',
        email: member.member_email || '',
        phone: member.member_phone || '-',
        role: '학생',
        status: member.member_used_YN === 'Y' ? '활성' : '비활성',
        grade: member.member_grade || 1,
        groupIdx: member.group_idx,
        groupName: group?.group_name || '-',
        registeredDate: member.member_reg_date.toISOString().split('T')[0],
        lastLoginDate: member.member_login_date
          ? member.member_login_date.toISOString().replace('T', ' ').substring(0, 19)
          : '-',
        loginCount: member.member_login_cnt || 0,
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
    console.error('수강생 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

