import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_DOWNLOAD_LOG_download_gubun } from '@prisma/client'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const memberId = searchParams.get('memberId')
    const downloadGubun = searchParams.get('downloadGubun') as TB_DOWNLOAD_LOG_download_gubun | null
    const downloadWork = searchParams.get('downloadWork')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'download_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (memberId) {
      where.member_id = {
        contains: memberId,
      }
    }

    if (downloadGubun) {
      where.download_gubun = downloadGubun
    }

    if (downloadWork) {
      where.download_work = {
        contains: downloadWork,
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
        where.download_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_DOWNLOAD_LOG.count({ where })

    // 통계
    const totalStats = {
      total: await prisma.tB_DOWNLOAD_LOG.count(),
      byGubun: {
        A: await prisma.tB_DOWNLOAD_LOG.count({ where: { download_gubun: 'A' } }),
        B: await prisma.tB_DOWNLOAD_LOG.count({ where: { download_gubun: 'B' } }),
        C: await prisma.tB_DOWNLOAD_LOG.count({ where: { download_gubun: 'C' } }),
        D: await prisma.tB_DOWNLOAD_LOG.count({ where: { download_gubun: 'D' } }),
      },
    }

    // 다운로드 로그 조회
    const logs = await prisma.tB_DOWNLOAD_LOG.findMany({
      where,
      select: {
        download_idx: true,
        download_work: true,
        download_gubun: true,
        download_reg_ip: true,
        download_reg_date: true,
        member_id: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          download_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 데이터 변환
    const result = logs.map((log) => {
      const gubunName = {
        A: '타입 A',
        B: '타입 B',
        C: '타입 C',
        D: '타입 D',
      }[log.download_gubun] || log.download_gubun

      return {
        id: log.download_idx,
        downloadWork: log.download_work || '-',
        downloadGubun: log.download_gubun,
        downloadGubunName: gubunName,
        memberId: log.member_id || '-',
        registeredIp: log.download_reg_ip || '-',
        registeredDate: log.download_reg_date.toISOString().replace('T', ' ').substring(0, 19),
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
    console.error('다운로드 로그 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

