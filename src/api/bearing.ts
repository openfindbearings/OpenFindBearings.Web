import apiClient from './client'
import type { Bearing, BearingDetail, SearchParams, PagedResult, Brand, BearingType } from './types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  errors: string[] | null
  page: number
  pageSize: number
  totalCount: number
}

function transformBearing(item: any): Bearing {
  return {
    id: item.id,
    partNumber: item.partNumber,
    name: item.name,
    description: item.description,
    innerDiameter: Number(item.innerDiameter),
    outerDiameter: Number(item.outerDiameter),
    width: Number(item.width),
    weight: item.weight ? Number(item.weight) : undefined,
    brandId: item.brandId,
    brandName: item.brandName,
    brandCountry: item.brandCountry,
    originCountry: item.originCountry,
    category: item.category,
    bearingTypeId: item.bearingTypeId,
    bearingTypeName: item.bearingTypeName,
    viewCount: item.viewCount || 0,
    favoriteCount: item.favoriteCount || 0
  }
}

function transformBearingDetail(item: any): BearingDetail {
  return {
    ...transformBearing(item),
    precisionGrade: item.precisionGrade,
    material: item.material,
    sealType: item.sealType,
    cageType: item.cageType,
    dynamicLoadRating: item.dynamicLoadRating ? Number(item.dynamicLoadRating) : undefined,
    staticLoadRating: item.staticLoadRating ? Number(item.staticLoadRating) : undefined,
    limitingSpeed: item.limitingSpeed ? Number(item.limitingSpeed) : undefined,
    merchants: (item.merchants || []).map((m: any) => ({
      id: m.id,
      merchantId: m.merchantId,
      merchantName: m.merchantName,
      price: m.price ? Number(m.price) : undefined,
      stock: m.stock,
      isOnSale: m.isOnSale,
      priceVisible: m.priceVisible
    })),
    interchanges: (item.interchanges || []).map(transformBearing)
  }
}

interface SearchResponse {
  items: Bearing[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
}

export async function searchBearings(params: SearchParams): Promise<PagedResult<Bearing>> {
  const response = await apiClient.get('/api/bearings/search', {
    params: {
      keyword: params.keyword,
      partNumber: params.partNumber,
      minInnerDiameter: params.minInnerDiameter,
      maxInnerDiameter: params.maxInnerDiameter,
      minOuterDiameter: params.minOuterDiameter,
      maxOuterDiameter: params.maxOuterDiameter,
      minWidth: params.minWidth,
      maxWidth: params.maxWidth,
      brandId: params.brandId,
      bearingTypeId: params.bearingTypeId,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      page: params.page || 1,
      pageSize: params.pageSize || 20
    }
  }) as ApiResponse<SearchResponse>

  return {
    items: response.data.items.map(transformBearing),
    total: response.data.totalCount,
    page: response.data.page,
    pageSize: response.data.pageSize
  }
}

export async function getBearingById(id: string): Promise<BearingDetail | null> {
  try {
    const response = await apiClient.get(`/api/bearings/${id}`) as ApiResponse<BearingDetail>
    return transformBearingDetail(response.data)
  } catch {
    return null
  }
}

export async function getHotBearings(count: number = 10): Promise<Bearing[]> {
  const response = await apiClient.get('/api/bearings/hot', {
    params: { count }
  }) as ApiResponse<Bearing[]>
  return response.data.map(transformBearing)
}

export async function getBearingByPartNumber(partNumber: string): Promise<Bearing | null> {
  try {
    const response = await apiClient.get(`/api/bearings/by-part/${partNumber}`) as ApiResponse<Bearing>
    return transformBearing(response.data)
  } catch {
    return null
  }
}

export async function getBrands(): Promise<Brand[]> {
  const response = await apiClient.get('/api/brands') as ApiResponse<Brand[]>
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    country: item.country,
    logoUrl: item.logoUrl
  }))
}

export async function getBearingTypes(): Promise<BearingType[]> {
  const response = await apiClient.get('/api/bearing-types') as ApiResponse<BearingType[]>
  return response.data.map((item: any) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    category: item.category,
    bearingCount: item.bearingCount || 0
  }))
}
