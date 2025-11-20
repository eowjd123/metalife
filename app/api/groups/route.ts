import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const status = searchParams.get('status')
    const createdAtStart = searchParams.get('createdAt_start')
    const createdAtEnd = searchParams.get('createdAt_end')
    
    // 페이징 파라미터
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit
    
    // 정렬 파라미터 (기본: group_reg_date 내림차순 - 최신 생성 순)
    const sortBy = searchParams.get('sortBy') || 'group_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // 기본 쿼리 조건: 삭제되지 않은 그룹만 조회
    const where: any = {
      group_del_YN: 'N',
    }

    // 검색 조건 추가
    if (name) {
      where.group_name = {
        contains: name,
      }
    }

    // 상태 필터링 (group_del_YN이 'N'이면 활성, 'Y'면 비활성)
    if (status) {
      if (status === '활성') {
        where.group_del_YN = 'N'
      } else if (status === '비활성') {
        where.group_del_YN = 'Y'
      }
    }

    // 생성일 범위 필터링
    if (createdAtStart || createdAtEnd) {
      where.group_reg_date = {}
      if (createdAtStart) {
        where.group_reg_date.gte = new Date(createdAtStart)
      }
      if (createdAtEnd) {
        const endDate = new Date(createdAtEnd)
        endDate.setHours(23, 59, 59, 999)
        where.group_reg_date.lte = endDate
      }
    }

    // 총 개수 조회
    const total = await prisma.tB_GROUP.count({
      where,
    })

    // 전체 통계 조회 (검색 조건과 무관하게 전체 데이터 기준)
    const totalStats = {
      total: await prisma.tB_GROUP.count({
        where: { group_del_YN: 'N' },
      }),
      active: await prisma.tB_GROUP.count({
        where: { group_del_YN: 'N' },
      }),
      inactive: await prisma.tB_GROUP.count({
        where: { group_del_YN: 'Y' },
      }),
    }

    // 그룹 데이터 조회 (페이징 적용)
    const groups = await prisma.tB_GROUP.findMany({
      where,
      select: {
        group_idx: true,
        group_name: true,
        group_phone: true,
        group_email: true,
        group_address: true,
        group_address_detail: true,
        group_type: true,
        group_reg_date: true,
        group_del_YN: true,
        admin_idx: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          group_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 각 그룹의 멤버 수 계산 (group_idx로 TB_MEMBER 조회)
    const groupIdxList = groups.map(g => g.group_idx)
    const memberCounts = await prisma.tB_MEMBER.groupBy({
      by: ['group_idx'],
      where: {
        group_idx: {
          in: groupIdxList,
        },
        member_del_YN: 'N',
      },
      _count: {
        group_idx: true,
      },
    })

    // 멤버 수를 맵으로 변환
    const memberCountMap = new Map(
      memberCounts.map(item => [item.group_idx, item._count.group_idx])
    )

    // 데이터 변환 (프론트엔드 형식에 맞게)
    const result = groups.map((group) => {
      // group_del_YN을 상태로 변환
      const status = group.group_del_YN === 'N' ? '활성' : '비활성'

      // 멤버 수 가져오기
      const memberCount = memberCountMap.get(group.group_idx) || 0

      // 주소 정보 조합
      const address = [group.group_address, group.group_address_detail]
        .filter(Boolean)
        .join(' ') || '-'

      return {
        id: group.group_idx,
        name: group.group_name,
        description: address, // 주소를 설명으로 사용
        phone: group.group_phone || '-',
        email: group.group_email || '-',
        address: address,
        type: group.group_type,
        memberCount: memberCount,
        createdAt: group.group_reg_date.toISOString().split('T')[0],
        status: status,
        adminIdx: group.admin_idx,
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
    console.error('그룹 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

