import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TB_LICENSE_CODE_license_type, TB_LICENSE_CODE_license_level, TB_LICENSE_CODE_license_used_YN } from '@prisma/client'

// 라이선스 상세 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = parseInt(params.id, 10)

    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: '유효하지 않은 라이선스 ID입니다.' },
        { status: 400 }
      )
    }

    // 라이선스 정보 조회
    const license = await prisma.tB_LICENSE_CODE.findUnique({
      where: {
        license_idx: licenseId,
      },
      select: {
        license_idx: true,
        license_code: true,
        license_name: true,
        license_type: true,
        license_level: true,
        license_period: true,
        license_limit: true,
        license_startdate: true,
        license_enddate: true,
        license_used_YN: true,
        license_reg_date: true,
        admin_idx: true,
      },
    })

    if (!license) {
      return NextResponse.json(
        { error: '라이선스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자 수 계산
    const userCount = await prisma.tB_LICENSE_HST.count({
      where: {
        license_idx: licenseId,
        license_hst_del_YN: 'N',
      },
    })

    // 타입 매핑
    const typeMap: Record<string, string> = {
      school: '스쿨',
      metaware: '메타웨어',
      storybuilder: '스토리빌더',
    }

    // 레벨 매핑
    const levelMap: Record<string, string> = {
      home: '홈',
      class: '클래스',
      storybuilder: '스토리빌더',
      tutor: '튜터',
    }

    const endDate = license.license_enddate || ''
    const todayStr = new Date().toISOString().split('T')[0]
    const isExpired = endDate < todayStr || license.license_used_YN === 'N'
    const status = isExpired ? '만료' : '활성'

    return NextResponse.json({
      id: license.license_idx,
      licenseCode: license.license_code || '',
      licenseName: license.license_name,
      type: license.license_type,
      typeLabel: typeMap[license.license_type] || license.license_type,
      level: license.license_level,
      levelLabel: levelMap[license.license_level] || license.license_level,
      period: license.license_period,
      limit: license.license_limit,
      startDate: license.license_startdate || '',
      endDate: endDate,
      usedYN: license.license_used_YN,
      status: status,
      currentUsers: userCount,
      createdAt: license.license_reg_date.toISOString().split('T')[0],
      adminIdx: license.admin_idx,
    })
  } catch (error) {
    console.error('라이선스 상세 조회 오류:', error)
    return NextResponse.json(
      { error: '데이터 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 라이선스 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = parseInt(params.id, 10)

    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: '유효하지 않은 라이선스 ID입니다.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      licenseName,
      licenseType,
      licenseLevel,
      period,
      limit,
      startDate,
      endDate,
      usedYN,
    } = body

    // 업데이트할 데이터 구성
    const updateData: any = {}

    if (licenseName !== undefined) updateData.license_name = licenseName
    if (licenseType !== undefined) {
      updateData.license_type = licenseType as TB_LICENSE_CODE_license_type
    }
    if (licenseLevel !== undefined) {
      updateData.license_level = licenseLevel as TB_LICENSE_CODE_license_level
    }
    if (period !== undefined) updateData.license_period = period
    if (limit !== undefined) updateData.license_limit = limit
    if (startDate !== undefined) updateData.license_startdate = startDate || null
    if (endDate !== undefined) updateData.license_enddate = endDate || null
    if (usedYN !== undefined) {
      updateData.license_used_YN = usedYN as TB_LICENSE_CODE_license_used_YN
    }

    // 라이선스 업데이트
    const updatedLicense = await prisma.tB_LICENSE_CODE.update({
      where: {
        license_idx: licenseId,
      },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: '라이선스 정보가 수정되었습니다.',
      data: {
        id: updatedLicense.license_idx,
        name: updatedLicense.license_name,
        status: updatedLicense.license_used_YN === 'Y' ? '활성' : '비활성',
      },
    })
  } catch (error) {
    console.error('라이선스 수정 오류:', error)
    return NextResponse.json(
      { error: '라이선스 수정 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 라이선스 삭제 (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const licenseId = parseInt(params.id, 10)

    if (isNaN(licenseId)) {
      return NextResponse.json(
        { error: '유효하지 않은 라이선스 ID입니다.' },
        { status: 400 }
      )
    }

    // 라이선스가 존재하는지 확인
    const license = await prisma.tB_LICENSE_CODE.findUnique({
      where: {
        license_idx: licenseId,
      },
    })

    if (!license) {
      return NextResponse.json(
        { error: '라이선스를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 사용자 수 확인
    const userCount = await prisma.tB_LICENSE_HST.count({
      where: {
        license_idx: licenseId,
        license_hst_del_YN: 'N',
      },
    })

    // Soft delete: license_del_YN을 'Y'로 변경
    await prisma.tB_LICENSE_CODE.update({
      where: {
        license_idx: licenseId,
      },
      data: {
        license_del_YN: 'Y',
      },
    })

    return NextResponse.json({
      success: true,
      message: '라이선스가 삭제되었습니다.',
      userCount: userCount,
    })
  } catch (error) {
    console.error('라이선스 삭제 오류:', error)
    return NextResponse.json(
      { error: '라이선스 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

