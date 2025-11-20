import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const nfcKey = searchParams.get('nfcKey')
    const nfcUserid = searchParams.get('nfcUserid')
    const nfcUsername = searchParams.get('nfcUsername')
    const dateStart = searchParams.get('dateStart')
    const dateEnd = searchParams.get('dateEnd')

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)
    const skip = (page - 1) * limit

    const sortBy = searchParams.get('sortBy') || 'nfc_reg_date'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const where: any = {}

    if (nfcKey) {
      where.nfc_key = {
        contains: nfcKey,
      }
    }

    if (nfcUserid) {
      where.nfc_userid = {
        contains: nfcUserid,
      }
    }

    if (nfcUsername) {
      where.nfc_username = {
        contains: nfcUsername,
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
        where.nfc_reg_date = dateFilter
      }
    }

    const total = await prisma.tB_NFC_LOGIN.count({ where })

    // 통계
    const totalStats = {
      total: await prisma.tB_NFC_LOGIN.count(),
    }

    // NFC 로그인 로그 조회
    const logs = await prisma.tB_NFC_LOGIN.findMany({
      where,
      select: {
        nfc_idx: true,
        nfc_key: true,
        nfc_userid: true,
        nfc_username: true,
        nfc_reg_ip: true,
        nfc_reg_date: true,
      },
      orderBy: [
        {
          [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc',
        },
        {
          nfc_idx: 'desc',
        },
      ],
      skip,
      take: limit,
    })

    // 데이터 변환
    const result = logs.map((log) => {
      return {
        id: log.nfc_idx,
        nfcKey: log.nfc_key || '-',
        nfcUserid: log.nfc_userid || '-',
        nfcUsername: log.nfc_username || '-',
        registeredIp: log.nfc_reg_ip || '-',
        registeredDate: log.nfc_reg_date.toISOString().replace('T', ' ').substring(0, 19),
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
    console.error('NFC 로그인 로그 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

