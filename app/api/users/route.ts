import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const email = searchParams.get('email')
    const role = searchParams.get('role')
    const status = searchParams.get('status')
    const joinDateStart = searchParams.get('joinDate_start')
    const joinDateEnd = searchParams.get('joinDate_end')
    
    // 페이징 파라미터
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit
    
    // 정렬 파라미터 (기본: member_idx 내림차순 - 최신 가입 순)
    const sortBy = searchParams.get('sortBy') || 'member_idx'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 기본 쿼리 조건: 삭제되지 않은 회원만 조회
    const where: any = {
      member_del_YN: 'N',
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

    // member_gubun을 역할로 매핑하여 필터링
    if (role) {
      const roleToGubun: Record<string, string> = {
        '학생': 'S',
        '교사': 'T',
        '일반': 'N',
        '기관': 'I',
      }
      const gubun = roleToGubun[role]
      if (gubun) {
        where.member_gubun = gubun
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

    // 가입일 범위 필터링
    if (joinDateStart || joinDateEnd) {
      where.member_reg_date = {}
      if (joinDateStart) {
        where.member_reg_date.gte = new Date(joinDateStart)
      }
      if (joinDateEnd) {
        const endDate = new Date(joinDateEnd)
        endDate.setHours(23, 59, 59, 999)
        where.member_reg_date.lte = endDate
      }
    }

    // 총 개수 조회
    const total = await prisma.tB_MEMBER.count({
      where,
    })

    // 전체 통계 조회 (검색 조건과 무관하게 전체 데이터 기준)
    const totalStats = {
      total: await prisma.tB_MEMBER.count({
        where: { member_del_YN: 'N' },
      }),
      active: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_used_YN: 'Y',
        },
      }),
      inactive: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_used_YN: 'N',
        },
      }),
      newMembers: await prisma.tB_MEMBER.count({
        where: {
          member_del_YN: 'N',
          member_reg_date: {
            gte: new Date(new Date().setDate(new Date().getDate() - 30)),
          },
        },
      }),
    }

    // 회원 데이터 조회 (페이징 적용)
    const members = await prisma.tB_MEMBER.findMany({
      where,
      select: {
        member_idx: true,
        member_id: true,
        member_name: true,
        member_email: true,
        member_phone: true,
        member_gubun: true,
        member_used_YN: true,
        member_reg_date: true,
        member_login_date: true,
        member_login_cnt: true,
        member_grade: true,
      },
      orderBy: {
        [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
      },
      skip,
      take: limit,
    })

    // 데이터 변환 (프론트엔드 형식에 맞게)
    const result = members.map((member) => {
      // member_gubun을 역할로 변환
      const roleMap: Record<string, string> = {
        S: '학생',
        T: '교사',
        N: '일반',
        I: '기관',
      }

      // member_used_YN을 상태로 변환
      const status = member.member_used_YN === 'Y' ? '활성' : '비활성'

      return {
        id: member.member_idx,
        memberId: member.member_id || '',
        name: member.member_name,
        email: member.member_email,
        phone: member.member_phone || '',
        role: roleMap[member.member_gubun] || '일반',
        roleCode: member.member_gubun,
        status: status,
        joinDate: member.member_reg_date.toISOString().split('T')[0],
        loginDate: member.member_login_date
          ? member.member_login_date.toISOString().split('T')[0]
          : null,
        loginCount: member.member_login_cnt,
        grade: member.member_grade,
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
    console.error('회원 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

