import type { Product } from './products'
import { mockProducts } from '../mock/products'
import * as bearingApi from './bearing'
import { API_MODE } from './config'

export interface ProductListParams {
  keyword?: string
  types?: string[]
  brands?: string[]
  brandIds?: string[]
  minInnerDiameter?: number
  maxInnerDiameter?: number
  minOuterDiameter?: number
  maxOuterDiameter?: number
  precisions?: string[]
  sealTypes?: string[]
  page?: number
  pageSize?: number
}

export interface ProductListResult {
  items: Product[]
  total: number
  page: number
  pageSize: number
}

function transformBearingToProduct(bearing: any): Product {
  return {
    id: bearing.id,
    model: bearing.partNumber,
    brand: bearing.brandName,
    type: bearing.bearingTypeName,
    category: bearing.category,
    innerDiameter: bearing.innerDiameter,
    outerDiameter: bearing.outerDiameter,
    width: bearing.width,
    loadRatingDynamic: bearing.dynamicLoadRating || bearing.staticLoadRating || 0,
    loadRatingStatic: bearing.staticLoadRating || 0,
    speedLimit: bearing.limitingSpeed || 0,
    precision: bearing.precisionGrade || 'P0',
    sealType: bearing.sealType || '开放式',
    material: bearing.material || 'GCr15',
    price: bearing.merchants?.[0]?.price ?? null,
    stock: bearing.merchants?.[0]?.stock ?? 0,
    description: bearing.description || `${bearing.brandName} ${bearing.partNumber} ${bearing.bearingTypeName}`,
    imageUrl: '',
    datasheetUrl: ''
  }
}

export async function getProducts(params: ProductListParams = {}): Promise<ProductListResult> {
  if (API_MODE === 'real') {
    const result = await bearingApi.searchBearings({
      keyword: params.keyword,
      brandId: params.brandIds?.[0],
      minInnerDiameter: params.minInnerDiameter,
      maxInnerDiameter: params.maxInnerDiameter,
      minOuterDiameter: params.minOuterDiameter,
      maxOuterDiameter: params.maxOuterDiameter,
      page: params.page,
      pageSize: params.pageSize
    })

    let items = result.items.map(transformBearingToProduct)

    if (params.types && params.types.length > 0) {
      items = items.filter(p => params.types!.includes(p.type))
    }

    if (params.brands && params.brands.length > 0) {
      items = items.filter(p => params.brands!.includes(p.brand))
    }

    if (params.precisions && params.precisions.length > 0) {
      items = items.filter(p => params.precisions!.includes(p.precision))
    }

    if (params.sealTypes && params.sealTypes.length > 0) {
      items = items.filter(p => params.sealTypes!.includes(p.sealType))
    }

    return {
      items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize
    }
  }
  
  let filtered = [...mockProducts]
  
  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(p => 
      p.model.toLowerCase().includes(kw) || 
      p.brand.toLowerCase().includes(kw) ||
      p.type.includes(kw)
    )
  }
  
  if (params.types && params.types.length > 0) {
    filtered = filtered.filter(p => params.types!.includes(p.type))
  }
  
  if (params.brands && params.brands.length > 0) {
    filtered = filtered.filter(p => params.brands!.includes(p.brand))
  }
  
  if (params.minInnerDiameter !== undefined) {
    filtered = filtered.filter(p => p.innerDiameter >= params.minInnerDiameter!)
  }
  
  if (params.maxInnerDiameter !== undefined) {
    filtered = filtered.filter(p => p.innerDiameter <= params.maxInnerDiameter!)
  }
  
  if (params.minOuterDiameter !== undefined) {
    filtered = filtered.filter(p => p.outerDiameter >= params.minOuterDiameter!)
  }
  
  if (params.maxOuterDiameter !== undefined) {
    filtered = filtered.filter(p => p.outerDiameter <= params.maxOuterDiameter!)
  }
  
  if (params.precisions && params.precisions.length > 0) {
    filtered = filtered.filter(p => params.precisions!.includes(p.precision))
  }
  
  if (params.sealTypes && params.sealTypes.length > 0) {
    filtered = filtered.filter(p => params.sealTypes!.includes(p.sealType))
  }
  
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const items = filtered.slice(start, start + pageSize)
  
  return {
    items,
    total: filtered.length,
    page,
    pageSize
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  if (API_MODE === 'real') {
    const bearing = await bearingApi.getBearingById(id)
    if (bearing) {
      return transformBearingToProduct(bearing)
    }
    return undefined
  }

  return mockProducts.find(p => p.id === id)
}

export async function getRecommendedProducts(count: number = 8): Promise<Product[]> {
  if (API_MODE === 'real') {
    const bearings = await bearingApi.getHotBearings(count)
    return bearings.map(transformBearingToProduct)
  }

  return mockProducts.slice(0, count)
}

export async function getHotCategories(): Promise<{ name: string; count: number }[]> {
  if (API_MODE === 'real') {
    const types = await bearingApi.getBearingTypes()
    return types.map(t => ({ name: t.name, count: t.bearingCount || 0 }))
  }

  const typeCount = new Map<string, number>()
  mockProducts.forEach(p => {
    typeCount.set(p.type, (typeCount.get(p.type) || 0) + 1)
  })

  return Array.from(typeCount.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}
