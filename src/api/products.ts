export interface Product {
  id: string
  model: string
  brand: string
  type: string
  category: string
  innerDiameter: number
  outerDiameter: number
  width: number
  loadRatingDynamic: number
  loadRatingStatic: number
  speedLimit: number
  precision: string
  sealType: string
  material: string
  price: number | null
  stock: number
  description: string
  imageUrl: string
  datasheetUrl: string
}

export interface InquiryItem {
  product: Product
  quantity: number
  remark: string
}

export interface Inquiry {
  id: string
  items: InquiryItem[]
  status: 'draft' | 'submitted' | 'quoting' | 'quoted' | 'accepted' | 'rejected'
  createdAt: string
  quotedAt: string | null
  totalQuotedPrice: number | null
  companyInfo: string
  contactName: string
  contactPhone: string
  deliveryAddress: string
  expectedDeliveryDate: string | null
}

export const brands = ['SKF', 'NSK', 'FAG', 'NTN', 'INA', 'TIMKEN', 'KOYO', 'NACHI'] as const

export const bearingTypes = [
  '深沟球轴承',
  '调心球轴承',
  '圆锥滚子轴承',
  '调心滚子轴承',
  '圆柱滚子轴承',
  '推力球轴承',
  '推力滚子轴承',
  '角接触球轴承'
] as const

export const categories = ['滚动轴承', '滑动轴承', '直线轴承'] as const

export const precisionGrades = ['P0', 'P6', 'P5', 'P4', 'P2'] as const

export const sealTypes = ['开放式', 'RS', '2RS', 'Z', 'ZZ'] as const

export const materials = ['GCr15', '不锈钢', '陶瓷', '碳钢'] as const
