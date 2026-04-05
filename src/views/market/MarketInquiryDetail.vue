<template>
  <div class="market-detail-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.back()">返回</a-button>
        <h1 class="page-title">询价单详情</h1>
        <a-button type="primary" @click="router.push('/market/inquiries')">
          浏览更多
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <template v-if="inquiry">
          <!-- 警告提示 -->
          <a-alert
            v-if="inquiry.buyerId === currentUserId"
            type="warning"
            message="这是您自己发布的询价单"
            description="您不能对自己的询价单进行报价。"
            show-icon
            class="warning-alert"
          />

          <a-alert
            v-else-if="inquiry.hasQuoted"
            type="info"
            message="您已提交报价"
            :description="`报价单号：${myQuoteId}`"
            show-icon
            class="info-alert"
          >
            <template #action>
              <a-button type="primary" @click="viewMyQuote">
                查看我的报价
              </a-button>
            </template>
          </a-alert>

          <!-- 询价单信息 -->
          <a-card class="info-card" title="询价单信息">
            <div class="info-grid">
              <div class="info-item">
                <span class="label">询价单号：</span>
                <span class="value">{{ inquiry.id }}</span>
              </div>
              <div class="info-item">
                <span class="label">状态：</span>
                <a-tag :color="getStatusColor(inquiry.status)">
                  {{ getStatusText(inquiry.status) }}
                </a-tag>
              </div>
              <div class="info-item">
                <span class="label">发布企业：</span>
                <span class="value">{{ inquiry.buyerCompany }}</span>
              </div>
              <div class="info-item">
                <span class="label">发布时间：</span>
                <span class="value">{{ formatDate(inquiry.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">报价截止：</span>
                <span class="value">{{ formatDate(inquiry.expiresAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">期望交期：</span>
                <span class="value">{{ inquiry.expectedDelivery || '-' }}</span>
              </div>
              <div class="info-item full-width" v-if="inquiry.remark">
                <span class="label">备注：</span>
                <span class="value">{{ inquiry.remark }}</span>
              </div>
            </div>
          </a-card>

          <!-- 产品清单 -->
          <a-card class="products-card" title="产品清单">
            <a-table
              :dataSource="inquiry.items"
              :columns="itemColumns"
              :pagination="false"
              rowKey="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'product'">
                  <div class="product-cell">
                    <div class="product-brand">{{ record.product.brand }}</div>
                    <div class="product-model">{{ record.product.model }}</div>
                  </div>
                </template>
                <template v-else-if="column.key === 'spec'">
                  {{ record.product.innerDiameter }}×{{ record.product.outerDiameter }}×{{ record.product.width }}mm
                </template>
              </template>
            </a-table>

            <div class="products-summary">
              <span class="total-count">共 {{ inquiry.items.length }} 件产品</span>
              <span class="total-quantity">
                总数量：{{ inquiry.items.reduce((sum, item) => sum + item.quantity, 0) }} 个
              </span>
            </div>
          </a-card>

          <!-- 操作按钮 -->
          <div class="action-section">
            <a-button
              v-if="!inquiry.hasQuoted && inquiry.buyerId !== currentUserId"
              type="primary"
              size="large"
              @click="handleQuote"
            >
              我要报价
            </a-button>
            <a-button
              v-else-if="inquiry.hasQuoted"
              type="primary"
              size="large"
              @click="viewMyQuote"
            >
              查看我的报价
            </a-button>
            <a-button size="large" @click="router.push('/market/inquiries')">
              返回列表
            </a-button>
          </div>
        </template>

        <a-result
          v-else-if="!loading"
          status="404"
          title="询价单不存在"
          sub-title="抱歉，您访问的询价单不存在或已停止接收报价"
        >
          <template #extra>
            <a-button type="primary" @click="router.push('/market/inquiries')">
              返回市场
            </a-button>
          </template>
        </a-result>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { marketApi } from '../../api'
import type { Inquiry, InquiryStatus } from '../../types/inquiry'
import { mockStorage } from '../../api/mock/data'

const router = useRouter()
const route = useRoute()

const inquiry = ref<(Inquiry & { hasQuoted?: boolean }) | null>(null)
const loading = ref(false)
const myQuoteId = ref('')

const currentUserId = computed(() => mockStorage.getCurrentUserId())

const itemColumns = [
  { title: '品牌', dataIndex: ['product', 'brand'], width: '15%' },
  { title: '型号', key: 'product', width: '25%' },
  { title: '规格', key: 'spec', width: '25%' },
  { title: '数量', dataIndex: 'quantity', width: '15%' },
  { title: '备注', dataIndex: 'remark', width: '20%' },
]

const getStatusColor = (status: InquiryStatus) => {
  const colors: Record<string, string> = {
    published: 'processing',
    quoting: 'warning',
  }
  return colors[status] || 'default'
}

const getStatusText = (status: InquiryStatus) => {
  const texts: Record<string, string> = {
    published: '待报价',
    quoting: '报价中',
  }
  return texts[status] || status
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadInquiry = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    const result = await marketApi.getMarketInquiry(id)
    inquiry.value = result

    // 如果已报价，查找我的报价单号
    if (result.hasQuoted) {
      const { mockStorage } = await import('../../api/mock/data')
      const myQuote = mockStorage.quotes.find(
        q => q.inquiryId === id && q.supplierId === mockStorage.getCurrentUserId()
      )
      if (myQuote) {
        myQuoteId.value = myQuote.id
      }
    }
  } catch (error: any) {
    message.error(error.message || '加载失败')
    inquiry.value = null
  } finally {
    loading.value = false
  }
}

const handleQuote = () => {
  if (!inquiry.value) return
  router.push(`/market/inquiries/${inquiry.value.id}/quote`)
}

const viewMyQuote = () => {
  router.push('/user/quotes')
}

onMounted(() => {
  loadInquiry()
})
</script>

<style scoped>
.market-detail-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.warning-alert,
.info-alert {
  margin-bottom: 16px;
  border-radius: 8px;
}

.info-card,
.products-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
}

.info-item.full-width {
  grid-column: span 2;
}

.info-item .label {
  color: #666;
  margin-right: 8px;
}

.info-item .value {
  font-weight: 500;
}

.product-cell .product-brand {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.product-cell .product-model {
  font-size: 14px;
  font-weight: 500;
}

.products-summary {
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.total-count,
.total-quantity {
  font-weight: 500;
  color: #333;
}

.action-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
