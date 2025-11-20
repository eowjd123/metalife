import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_STORYBOOK_storybook_shared } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const keyword = searchParams.get('keyword')
    const keywordType = searchParams.get('keywordType') // '전체', '제목', '아이디' 등
    const usageStatus = searchParams.get('usageStatus') // '전체', '사용중', '사용중지'
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'storybook_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {
      storybook_del_YN: 'N',
    }

    // 키워드 검색
    if (keyword) {
      if (keywordType === '제목' || !keywordType || keywordType === '전체') {
        where.storybook_title = {
          contains: keyword,
        }
      } else if (keywordType === '아이디') {
        where.storybook_id = {
          contains: keyword,
        }
      }
    }

    // 사용 여부 필터링
    if (usageStatus && usageStatus !== '전체') {
      if (usageStatus === '사용중') {
        where.storybook_shared = 'Y'
      } else if (usageStatus === '사용중지') {
        where.storybook_shared = 'N'
      }
    }

    // 제작기간 필터링
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
        where.storybook_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_STORYBOOK.count({
      where,
    })

    // 전체 통계 (검색 조건과 무관하게 전체 데이터 기준)
    const totalStats = {
      total: await prisma.tB_STORYBOOK.count({
        where: { storybook_del_YN: 'N' },
      }),
      active: await prisma.tB_STORYBOOK.count({
        where: {
          storybook_del_YN: 'N',
          storybook_shared: 'Y',
        },
      }),
      suspended: await prisma.tB_STORYBOOK.count({
        where: {
          storybook_del_YN: 'N',
          storybook_shared: 'N',
        },
      }),
    }

    // 스토리북 목록 조회
    const storybooks = await prisma.tB_STORYBOOK.findMany({
      where,
      select: {
        storybook_idx: true,
        storybook_id: true,
        storybook_title: true,
        storybook_image_url: true,
        storybook_thumbnail_url: true,
        storybook_shared: true,
        storybook_reg_date: true,
        storybook_modify_date: true,
        member_idx: true,
        member_id: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          storybook_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 등록자 정보 조회 (member_id 또는 member_idx로)
    const memberIdList = storybooks
      .map(s => s.member_id)
      .filter((id): id is string => id !== null && id !== '')
    const memberIdxList = storybooks
      .map(s => s.member_idx)
      .filter((idx): idx is number => idx !== null && idx > 0)

    let members: any[] = []
    if (memberIdList.length > 0 || memberIdxList.length > 0) {
      const whereConditions: any[] = []
      if (memberIdList.length > 0) {
        whereConditions.push({ member_id: { in: memberIdList } })
      }
      if (memberIdxList.length > 0) {
        whereConditions.push({ member_idx: { in: memberIdxList } })
      }

      members = await prisma.tB_MEMBER.findMany({
        where: {
          OR: whereConditions,
        },
        select: {
          member_idx: true,
          member_id: true,
          member_name: true,
          member_email: true,
        },
      })
    }

    // member_id와 member_idx 모두로 매핑
    const memberMapById = new Map(
      members
        .map(m => [m.member_id || '', m] as [string, typeof m])
        .filter(([id]) => id !== '')
    )
    const memberMapByIdx = new Map(
      members.map(m => [m.member_idx.toString(), m] as [string, typeof m])
    )

    // 데이터 변환
    const result = storybooks.map((storybook) => {
      // 사용 여부 결정 (shared가 Y면 사용중, N이면 사용중지)
      const usageStatus = storybook.storybook_shared === 'Y' ? '사용중' : '사용중지'
      
      // 등록자 정보
      const member = storybook.member_id
        ? memberMapById.get(storybook.member_id)
        : storybook.member_idx
        ? memberMapByIdx.get(storybook.member_idx.toString())
        : null
      
      const registrant = storybook.member_id || member?.member_id || '-'

      return {
        id: storybook.storybook_idx,
        storybookId: storybook.storybook_id || '',
        title: storybook.storybook_title || '',
        thumbnailUrl: storybook.storybook_thumbnail_url,
        imageUrl: storybook.storybook_image_url,
        registrant: registrant,
        registrantName: member?.member_name,
        registrantEmail: member?.member_email,
        registeredDate: storybook.storybook_reg_date.toISOString().replace('T', ' ').substring(0, 19),
        usageStatus: usageStatus,
        shared: storybook.storybook_shared,
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
    console.error('스토리북 목록 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

