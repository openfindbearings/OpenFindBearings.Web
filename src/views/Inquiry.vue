<template>
  <div class="inquiry-page">
    <div class="container">
      <h1 class="page-title">询价单</h1>
      
      <div v-if="items.length > 0" class="inquiry-content">
        <div class="inquiry-list">
          <a-table :dataSource="items" :columns="columns" :pagination="false" rowKey="product.id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="product-cell">
                  <div class="product-brand">{{ record.product.brand }}</div>
                  <div class="product-model">{{ record.product.model }}</div>
                  <div class="product-spec">
                    {{ record.product.innerDiameter }}×{{ record.product.outerDiameter }}×{{ record.product.width }}mm
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'price'">
                <template v-if="record.product.price">
                  ¥{{ record.product.price * record.quantity }}
                </template>
                <template v-else>
                  面议
                </template>
              </template>
              <template v-else-if="column.key === 'quantity'">
                <a-input-number 
                  v-model:value="record.quantity" 
                  :min="1" 
                  :max="record.product.stock"
                  @change="handleQuantityChange(record.product.id, record.quantity)"
                />
              </template>
              <template v-else-if="column.key === 'remark'">
                <a-input 
                  v-model:value="record.remark" 
                  placeholder="请输入备注" 
                  @change="handleRemarkChange(record.product.id, record.remark)"
                />
              </template>
              <template v-else-if="column.key === 'action'">
                <a-popconfirm
                  title="确定要删除此产品吗？"
                  @confirm="handleRemove(record.product.id)"
                >
                  <a-button type="link" danger>删除</a-button>
                </a-popconfirm>
              </template>
            </template>
          </a-table>
        </div>

        <div class="inquiry-summary">
          <div class="summary-item">
            <span class="label">产品总数:</span>
            <span class="value">{{ totalCount }} 件</span>
          </div>
          <div class="summary-item">
            <span class="label">商品金额:</span>
            <span class="value">¥{{ totalPrice }}</span>
          </div>
          <a-button type="primary" size="large" block @click="handleSubmit">
            提交询价
          </a-button>
          <a-button block style="margin-top: 12px" @click="handleClear">
            清空询价单
          </a-button>
        </div>
      </div>

      <div v-else class="empty-inquiry">
        <a-empty description="询价单为空">
          <template #extra>
            <a-button type="primary" @click="router.push('/products')">去选购</a-button>
          </template>
        </a-empty>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useInquiryStore } from '../composables/useInquiry'

const router = useRouter()
const { items, removeFromInquiry, updateQuantity, updateRemark, clearInquiry } = useInquiryStore()

const columns = [
  { title: '产品信息', key: 'product', width: '30%' },
  { title: '单价', key: 'price', width: '15%' },
  { title: '数量', key: 'quantity', width: '15%' },
  { title: '备注', key: 'remark', width: '25%' },
  { title: '操作', key: 'action', width: '15%' }
]

const totalCount = computed(() => {
  return items.value.reduce((sum, item) => sum + item.quantity, 0)
})

const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => {
    if (item.product.price) {
      return sum + item.product.price * item.quantity
    }
    return sum
  }, 0)
})

const handleQuantityChange = (productId: string, quantity: number) => {
  updateQuantity(productId, quantity)
}

const handleRemarkChange = (productId: string, remark: string) => {
  updateRemark(productId, remark)
}

const handleRemove = (productId: string) => {
  removeFromInquiry(productId)
  message.success('已删除')
}

const handleSubmit = () => {
  message.success('询价单已提交！我们会尽快与您联系。')
  clearInquiry()
  router.push('/user/profile')
}

const handleClear = () => {
  clearInquiry()
  message.success('询价单已清空')
}
</script>

<style scoped>
.inquiry-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.inquiry-content {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
}

.inquiry-list {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.product-cell {
  padding: 8px 0;
}

.product-brand {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.product-model {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.product-spec {
  font-size: 13px;
  color: #999;
}

.inquiry-summary {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 15px;
}

.summary-item .label {
  color: #666;
}

.summary-item .value {
  font-weight: 600;
  color: #333;
}

.empty-inquiry {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}

@media (max-width: 768px) {
  .inquiry-content {
    grid-template-columns: 1fr;
  }
}
</style>
