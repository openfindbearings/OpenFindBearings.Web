import { ref, watch } from 'vue'
import type { Product, InquiryItem } from '../api/products'

const STORAGE_KEY = 'openfindbearings_inquiry'

function loadFromStorage(): InquiryItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveToStorage(items: InquiryItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

const items = ref<InquiryItem[]>(loadFromStorage())

watch(items, (newItems) => {
  saveToStorage(newItems)
}, { deep: true })

export function useInquiryStore() {
  const addToInquiry = (product: Product, quantity: number = 1) => {
    const existing = items.value.find(item => item.product.id === product.id)
    if (existing) {
      existing.quantity += quantity
    } else {
      items.value.push({
        product,
        quantity,
        remark: ''
      })
    }
  }

  const removeFromInquiry = (productId: string) => {
    const index = items.value.findIndex(item => item.product.id === productId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      item.quantity = Math.max(1, quantity)
    }
  }

  const updateRemark = (productId: string, remark: string) => {
    const item = items.value.find(item => item.product.id === productId)
    if (item) {
      item.remark = remark
    }
  }

  const clearInquiry = () => {
    items.value = []
  }

  const getTotalCount = () => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  }

  return {
    items,
    addToInquiry,
    removeFromInquiry,
    updateQuantity,
    updateRemark,
    clearInquiry,
    getTotalCount
  }
}
