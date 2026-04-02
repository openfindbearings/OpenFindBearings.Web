export interface Bearing {
  id: string
  partNumber: string
  name: string
  description?: string
  innerDiameter: number
  outerDiameter: number
  width: number
  weight?: number
  brandId: string
  brandName: string
  brandCountry?: string
  originCountry?: string
  category: string
  bearingTypeId: string
  bearingTypeName: string
  viewCount: number
  favoriteCount: number
}

export interface BearingDetail extends Bearing {
  precisionGrade?: string
  material?: string
  sealType?: string
  cageType?: string
  dynamicLoadRating?: number
  staticLoadRating?: number
  limitingSpeed?: number
  merchants: MerchantBearing[]
  interchanges: Bearing[]
}

export interface MerchantBearing {
  id: string
  merchantId: string
  merchantName: string
  price?: number
  stock?: number
  isOnSale: boolean
  priceVisible: boolean
}

export interface Brand {
  id: string
  name: string
  country?: string
  logoUrl?: string
}

export interface BearingType {
  id: string
  name: string
  code?: string
  category?: string
  bearingCount?: number
}

export interface SearchParams {
  keyword?: string
  partNumber?: string
  minInnerDiameter?: number
  maxInnerDiameter?: number
  minOuterDiameter?: number
  maxOuterDiameter?: number
  minWidth?: number
  maxWidth?: number
  brandId?: string
  bearingTypeId?: string
  category?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  success: boolean
  message: string
  errors?: string[]
}
