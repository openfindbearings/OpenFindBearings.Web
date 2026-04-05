<template>
  <div class="inquiry-detail-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.back()">返回</a-button>
      </div>

      <div v-if="inquiry" class="detail-content">
        <a-card :title="`询价单号: ${inquiry.id}`" class="inquiry-card">
          <a-descriptions :column="2" bordered>
            <a-descriptions-item label="状态">
              <a-tag :color="getStatusColor(inquiry.status)">
                {{ getStatusText(inquiry.status) }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="提交日期">{{ inquiry.createdAt }}</a-descriptions-item>
            <a-descriptions-item label="产品数量">{{ inquiry.itemCount }} 件</a-descriptions-item>
            <a-descriptions-item label="联系邮箱">{{ inquiry.contactEmail || '-' }}</a-descriptions-item>
            <a-descriptions-item label="联系电话">{{ inquiry.contactPhone || '-' }}</a-descriptions-item>
            <a-descriptions-item label="期望交期">{{ inquiry.expectedDelivery || '-' }}</a-descriptions-item>
          </a-descriptions>

          <div class="section-title">产品清单</div>
          <a-table :dataSource="inquiry.items" :columns="itemColumns" :pagination="false" rowKey="product.id">
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'product'">
                <div class="product-cell">
                  <div class="product-brand">{{ record.product.brand }}</div>
                  <div class="product-model">
                    <a @click="router.push(`/products/${record.product.id}`)" class="product-link">
                      {{ record.product.model }}
                    </a>
                  </div>
                </div>
              </template>
              <template v-else-if="column.key === 'spec'">
                {{ record.product.innerDiameter }}×{{ record.product.outerDiameter }}×{{ record.product.width }}mm
              </template>
              <template v-else-if="column.key === 'price'">
                <template v-if="record.quotedPrice">
                  ¥{{ record.quotedPrice }}
                </template>
                <template v-else>
                  待报价
                </template>
              </template>
            </template>
          </a-table>

          <div class="summary-section">
            <div class="summary-row">
              <span class="label">商品总额:</span>
              <span class="value">¥{{ totalAmount }}</span>
            </div>
            <div class="summary-row">
              <span class="label">运费:</span>
              <span class="value">待确认</span>
            </div>
            <div class="summary-row total">
              <span class="label">预估总价:</span>
              <span class="value highlight">¥{{ totalAmount }}</span>
            </div>
          </div>

          <div v-if="inquiry.remark" class="remark-section">
            <div class="section-title">备注</div>
            <p>{{ inquiry.remark }}</p>
          </div>
        </a-card>
      </div>

      <div v-else class="detail-content">
        <a-result status="404" title="询价单不存在" sub-title="抱歉，您访问的询价单不存在或已被删除">
          <template #extra>
            <a-button type="primary" @click="router.push('/user/profile')">返回用户中心</a-button>
          </template>
        </a-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 模拟询价单数据
const inquiry = ref<any>(null)

const itemColumns = [
  { title: '产品信息', key: 'product', width: '35%' },
  { title: '规格', key: 'spec', width: '20%' },
  { title: '数量', dataIndex: 'quantity', width: '15%' },
  { title: '单价', key: 'price', width: '15%' },
  { title: '备注', dataIndex: 'remark', width: '15%' }
]

const totalAmount = computed(() => {
  if (!inquiry.value?.items) return 0
  return inquiry.value.items.reduce((sum: number, item: any) => {
    if (item.quotedPrice) {
      return sum + item.quotedPrice * item.quantity
    }
    return sum
  }, 0)
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    submitted: 'processing',
    quoting: 'blue',
    quoted: 'success',
    accepted: 'green',
    rejected: 'red'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    submitted: '已提交',
    quoting: '报价中',
    quoted: '已报价',
    accepted: '已接受',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

onMounted(() => {
  const inquiryId = route.params.id as string

  // 从 localStorage 加载询价单数据
  const history = JSON.parse(localStorage.getItem('inquiry_history') || '[]')
  inquiry.value = history.find((item: any) => item.id === inquiryId) || null
})
</script>

<style scoped>
.inquiry-detail-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.detail-content {
  background: #fff;
  border-radius: 8px;
}

.inquiry-card {
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 24px 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.product-cell {
  padding: 4px 0;
}

.product-brand {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.product-model {
  font-size: 14px;
  font-weight: 500;
}

.product-link {
  color: #1890ff;
  cursor: pointer;
  text-decoration: none;
}

.product-link:hover {
  text-decoration: underline;
}

.summary-section {
  margin-top: 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
}

.summary-row.total {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
  font-size: 16px;
  font-weight: 600;
}

.summary-row .label {
  color: #666;
}

.summary-row .value {
  color: #333;
  font-weight: 500;
}

.summary-row .value.highlight {
  color: #ff4d4f;
  font-size: 18px;
}

.remark-section {
  margin-top: 24px;
  padding: 16px;
  background: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
}

.remark-section p {
  margin: 0;
  color: #666;
}
</style>
