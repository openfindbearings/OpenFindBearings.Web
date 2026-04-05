/**
 * Mock 数据生成器
 * 用于生成模拟的询价单、报价单等数据
 */

import { faker } from '@faker-js/faker/locale/zh_CN'
import type { Inquiry, InquiryItem, InquiryStatus } from '@/types/inquiry'
import type { InquiryQuote, QuoteItem, QuoteStatus } from '@/types/quote'

// 模拟用户池（用于生成多用户数据）
export const MOCK_USERS = [
  { id: 'user-1', company: '上海轴承有限公司', email: 'user1@example.com', contact: '张先生', phone: '13800138001' },
  { id: 'user-2', company: '北京机械制造厂', email: 'user2@example.com', contact: '李女士', phone: '13800138002' },
  { id: 'user-3', company: '广州工业设备公司', email: 'user3@example.com', contact: '王经理', phone: '13800138003' },
  { id: 'user-4', company: '深圳精密仪器厂', email: 'user4@example.com', contact: '陈总', phone: '13800138004' },
  { id: 'user-5', company: '成都自动化设备公司', email: 'user5@example.com', contact: '刘经理', phone: '13800138005' },
]

// 当前登录用户（模拟）
export const CURRENT_USER = MOCK_USERS[0]

// 轴承品牌
const BRANDS = ['SKF', 'NSK', 'FAG', 'NTN', 'INA', 'TIMKEN', 'KOYO', 'NACHI', 'ZWZ', 'HRB']

// 轴承型号模板
const MODEL_TEMPLATES = [
  '600{0}-2RS',
  '620{0}-ZZ',
  '630{0}-RS',
  'NU{0}04',
  'NJ{0}06',
  '302{0}',
  '303{0}',
  '222{0}',
  '223{0}',
  '511{0}',
]

// 辅助函数：生成延迟
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 辅助函数：生成唯一ID
export const generateId = (prefix: string) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = String(Math.floor(Math.random() * 1000)).padStart(3, '0')
  return `${prefix}-${date}-${random}`
}

// 生成模拟产品
export function generateMockProduct() {
  const brand = faker.helpers.arrayElement(BRANDS)
  const modelTemplate = faker.helpers.arrayElement(MODEL_TEMPLATES)
  const model = modelTemplate.replace('{0}', String(faker.number.int({ min: 0, max: 9 })))

  return {
    id: `prod-${faker.string.alphanumeric(8)}`,
    brand,
    model,
    innerDiameter: faker.number.int({ min: 10, max: 200 }),
    outerDiameter: faker.number.int({ min: 30, max: 400 }),
    width: faker.number.int({ min: 5, max: 80 }),
  }
}

// 生成模拟询价单项
export function generateMockInquiryItem(inquiryId: string): InquiryItem {
  return {
    id: `item-${faker.string.alphanumeric(8)}`,
    inquiryId,
    product: generateMockProduct(),
    quantity: faker.number.int({ min: 1, max: 100 }),
    remark: Math.random() > 0.7 ? faker.commerce.productDescription() : undefined,
  }
}

// 生成模拟询价单
export function generateMockInquiry(overrides?: Partial<Inquiry>): Inquiry {
  // 30% 概率是自己的询价单，70% 是别人的
  const isMine = Math.random() < 0.3
  const buyer = isMine ? CURRENT_USER : faker.helpers.arrayElement(MOCK_USERS.filter(u => u.id !== CURRENT_USER.id))

  const id = generateId('RFQ')
  const itemCount = faker.number.int({ min: 1, max: 5 })
  const items = Array.from({ length: itemCount }, () => generateMockInquiryItem(id))

  const statuses: InquiryStatus[] = ['draft', 'published', 'quoting', 'quoted', 'accepted', 'expired', 'cancelled']
  const status = overrides?.status || faker.helpers.arrayElement(statuses)

  return {
    id,
    buyerId: buyer.id,
    buyerCompany: buyer.company,
    contactEmail: buyer.email,
    contactPhone: buyer.phone,
    expectedDelivery: faker.date.soon({ days: 30 }).toISOString().slice(0, 10),
    status,
    remark: Math.random() > 0.5 ? faker.commerce.productDescription() : undefined,
    isPublic: true,
    createdAt: faker.date.recent({ days: 10 }).toISOString(),
    updatedAt: faker.date.recent({ days: 5 }).toISOString(),
    expiresAt: status === 'published' || status === 'quoting' ? faker.date.soon({ days: 7 }).toISOString() : undefined,
    items,
    quoteCount: status === 'quoting' || status === 'quoted' ? faker.number.int({ min: 1, max: 5 }) : 0,
    ...overrides,
  }
}

// 生成模拟报价单项
export function generateMockQuoteItem(inquiryItem: InquiryItem): QuoteItem {
  const unitPrice = faker.number.int({ min: 50, max: 5000 })
  return {
    id: `quote-item-${faker.string.alphanumeric(8)}`,
    inquiryItemId: inquiryItem.id,
    unitPrice,
    quantity: inquiryItem.quantity,
    subtotal: unitPrice * inquiryItem.quantity,
    remark: Math.random() > 0.8 ? faker.commerce.productDescription() : undefined,
  }
}

// 生成模拟报价单
export function generateMockQuote(inquiry: Inquiry, overrides?: Partial<InquiryQuote>): InquiryQuote {
  // 报价者不能是询价单的创建者
  const availableSuppliers = MOCK_USERS.filter(u => u.id !== inquiry.buyerId)
  const isMine = overrides?.supplierId === CURRENT_USER.id
  const supplier = isMine
    ? CURRENT_USER
    : faker.helpers.arrayElement(availableSuppliers)

  const id = generateId('QUO')
  const items = inquiry.items.map((item: InquiryItem) => generateMockQuoteItem(item))
  const totalAmount = items.reduce((sum: number, item: QuoteItem) => sum + item.subtotal, 0)

  const statuses: QuoteStatus[] = ['submitted', 'under_review', 'accepted', 'rejected']
  const status = overrides?.status || faker.helpers.arrayElement(statuses)

  return {
    id,
    inquiryId: inquiry.id,
    supplierId: supplier.id,
    supplierCompany: supplier.company,
    supplierContact: supplier.contact,
    supplierPhone: supplier.phone,
    status,
    validUntil: faker.date.soon({ days: 15 }).toISOString(),
    deliveryDays: faker.number.int({ min: 3, max: 30 }),
    paymentTerms: faker.helpers.arrayElement(['款到发货', '月结30天', '月结60天', '货到付款']),
    totalAmount,
    remark: Math.random() > 0.6 ? faker.commerce.productDescription() : undefined,
    createdAt: faker.date.recent({ days: 5 }).toISOString(),
    updatedAt: faker.date.recent({ days: 2 }).toISOString(),
    items,
    inquiry: {
      id: inquiry.id,
      buyerCompany: inquiry.buyerCompany,
      status: inquiry.status,
      items: inquiry.items.map((item: InquiryItem) => ({
        product: {
          brand: item.product.brand,
          model: item.product.model,
        },
        quantity: item.quantity,
      })),
    },
    ...overrides,
  }
}

// 内存存储
export const mockStorage = {
  inquiries: [] as Inquiry[],
  quotes: [] as InquiryQuote[],

  // 初始化数据
  init() {
    // 生成 20 个询价单
    this.inquiries = Array.from({ length: 20 }, () => generateMockInquiry())

    // 为已发布的询价单生成报价
    this.quotes = []
    this.inquiries.forEach(inquiry => {
      if (inquiry.status === 'quoting' || inquiry.status === 'quoted' || inquiry.status === 'accepted') {
        // 每个询价单 1-3 个报价
        const quoteCount = faker.number.int({ min: 1, max: 3 })
        for (let i = 0; i < quoteCount; i++) {
          // 确保有一个报价是当前用户的（用于测试"我的报价"功能）
          const isMyQuote = i === 0 && Math.random() > 0.5
          const quote = generateMockQuote(inquiry, {
            supplierId: isMyQuote ? CURRENT_USER.id : undefined,
            status: isMyQuote ? 'submitted' : undefined,
          })
          this.quotes.push(quote)
        }
      }
    })
  },

  // 获取当前用户ID
  getCurrentUserId() {
    return CURRENT_USER.id
  },

  // 获取当前用户信息
  getCurrentUser() {
    return CURRENT_USER
  },
}

// 初始化
mockStorage.init()
