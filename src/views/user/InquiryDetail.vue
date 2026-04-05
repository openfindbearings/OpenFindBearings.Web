<template>
  <div class="inquiry-detail-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.back()">返回</a-button>
        <h1 class="page-title">询价单详情</h1>
        <a-button type="primary" @click="router.push('/user/inquiries')">
          我的询价单
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <template v-if="inquiry">
          <!-- 询价单基本信息 -->
          <a-card class="info-card" title="基本信息">
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
                <span class="label">创建时间：</span>
                <span class="value">{{ formatDate(inquiry.createdAt) }}</span>
              </div>
              <div class="info-item">
                <span class="label">报价截止：</span>
                <span class="value">{{ inquiry.expiresAt ? formatDate(inquiry.expiresAt) : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系邮箱：</span>
                <span class="value">{{ inquiry.contactEmail || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ inquiry.contactPhone || '-' }}</span>
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
          </a-card>

          <!-- 收到的报价 -->
          <a-card
            v-if="['quoting', 'quoted', 'accepted'].includes(inquiry.status)"
            class="quotes-card"
            title="收到的报价"
          >
            <template #extra>
              <a-badge :count="quotes.length" :overflowCount="99" />
            </template>

            <a-empty v-if="quotes.length === 0" description="暂无报价" />

            <div v-else class="quote-list">
              <div
                v-for="quote in quotes"
                :key="quote.id"
                class="quote-card"
                :class="{ 'is-accepted': quote.status === 'accepted' }"
              >
                <div class="quote-header">
                  <div class="supplier-info">
                    <h4>{{ quote.supplierCompany }}</h4>
                    <p>{{ quote.supplierContact }} {{ quote.supplierPhone }}</p>
                  </div>
                  <div class="quote-status">
                    <a-tag :color="getQuoteStatusColor(quote.status)">
                      {{ getQuoteStatusText(quote.status) }}
                    </a-tag>
                  </div>
                </div>

                <div class="quote-body">
                  <div class="quote-amount">
                    <span class="label">报价总额：</span>
                    <span class="value">¥{{ quote.totalAmount.toLocaleString() }}</span>
                  </div>
                  <div class="quote-detail">
                    <span>交货周期：{{ quote.deliveryDays }} 天</span>
                    <span v-if="quote.paymentTerms">付款方式：{{ quote.paymentTerms }}</span>
                    <span>有效期至：{{ formatDate(quote.validUntil) }}</span>
                  </div>
                </div>

                <div class="quote-actions" v-if="quote.status === 'submitted'">
                  <a-button type="primary" @click="handleAccept(quote.id)">
                    接受报价
                  </a-button>
                  <a-button @click="handleReject(quote.id)">
                    拒绝
                  </a-button>
                </div>
              </div>
            </div>
          </a-card>

          <!-- 操作按钮 -->
          <div class="page-actions">
            <a-button
              v-if="inquiry.status === 'draft'"
              type="primary"
              size="large"
              @click="handlePublish"
              :loading="publishing"
            >
              发布询价单
            </a-button>
            <a-button
              v-if="['published', 'quoting'].includes(inquiry.status)"
              size="large"
              @click="handleClose"
            >
              停止接收报价
            </a-button>
          </div>
        </template>

        <a-result
          v-else-if="!loading"
          status="404"
          title="询价单不存在"
          sub-title="抱歉，您访问的询价单不存在或已被删除"
        >
          <template #extra>
            <a-button type="primary" @click="router.push('/user/inquiries')">
              返回我的询价单
            </a-button>
          </template>
        </a-result>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { inquiryApi, quoteApi } from '../../api'
import type { Inquiry, InquiryStatus } from '../../types/inquiry'
import type { InquiryQuote, QuoteStatus } from '../../types/quote'

const router = useRouter()
const route = useRoute()

const inquiry = ref<Inquiry | null>(null)
const quotes = ref<InquiryQuote[]>([])
const loading = ref(false)
const publishing = ref(false)

const itemColumns = [
  { title: '品牌', dataIndex: ['product', 'brand'], width: '15%' },
  { title: '型号', key: 'product', width: '25%' },
  { title: '规格', key: 'spec', width: '20%' },
  { title: '数量', dataIndex: 'quantity', width: '15%' },
  { title: '备注', dataIndex: 'remark', width: '25%' },
]

const getStatusColor = (status: InquiryStatus) => {
  const colors: Record<string, string> = {
    draft: 'default',
    published: 'processing',
    quoting: 'warning',
    quoted: 'success',
    accepted: 'green',
    rejected: 'red',
    expired: 'default',
    cancelled: 'default',
  }
  return colors[status] || 'default'
}

const getStatusText = (status: InquiryStatus) => {
  const texts: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    quoting: '报价中',
    quoted: '报价完成',
    accepted: '已成交',
    rejected: '已拒绝',
    expired: '已过期',
    cancelled: '已取消',
  }
  return texts[status] || status
}

const getQuoteStatusColor = (status: QuoteStatus) => {
  const colors: Record<string, string> = {
    submitted: 'blue',
    under_review: 'processing',
    accepted: 'green',
    rejected: 'red',
    expired: 'default',
    withdrawn: 'default',
  }
  return colors[status] || 'default'
}

const getQuoteStatusText = (status: QuoteStatus) => {
  const texts: Record<string, string> = {
    submitted: '待处理',
    under_review: '审核中',
    accepted: '已接受',
    rejected: '已拒绝',
    expired: '已过期',
    withdrawn: '已撤回',
  }
  return texts[status] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

const loadInquiry = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    inquiry.value = await inquiryApi.getInquiry(id)

    // 加载报价列表
    if (inquiry.value && ['quoting', 'quoted', 'accepted'].includes(inquiry.value.status)) {
      quotes.value = await inquiryApi.getInquiryQuotes(id)
    }
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handlePublish = async () => {
  if (!inquiry.value) return

  publishing.value = true
  try {
    await inquiryApi.publishInquiry(inquiry.value.id)
    message.success('询价单已发布')
    loadInquiry()
  } catch (error: any) {
    message.error(error.message || '发布失败')
  } finally {
    publishing.value = false
  }
}

const handleClose = () => {
  if (!inquiry.value) return

  Modal.confirm({
    title: '确认停止接收报价？',
    content: '停止后将不再接收新的报价，已有的报价仍然有效。',
    onOk: async () => {
      try {
        await inquiryApi.closeInquiry(inquiry.value!.id)
        message.success('已停止接收报价')
        loadInquiry()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    },
  })
}

const handleAccept = (quoteId: string) => {
  if (!inquiry.value) return

  Modal.confirm({
    title: '确认接受此报价？',
    content: '接受后将与其他供应商成交，其他报价将自动拒绝。',
    onOk: async () => {
      try {
        await quoteApi.acceptQuote(inquiry.value!.id, quoteId)
        message.success('已接受报价')
        loadInquiry()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    },
  })
}

const handleReject = (quoteId: string) => {
  if (!inquiry.value) return

  Modal.confirm({
    title: '确认拒绝此报价？',
    content: '拒绝后该报价将不再有效。',
    onOk: async () => {
      try {
        await quoteApi.rejectQuote(inquiry.value!.id, quoteId)
        message.success('已拒绝报价')
        loadInquiry()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    },
  })
}

onMounted(() => {
  loadInquiry()
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

.info-card,
.products-card,
.quotes-card {
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

.quote-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quote-card {
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  padding: 16px;
}

.quote-card.is-accepted {
  border-color: #52c41a;
  background: #f6ffed;
}

.quote-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.supplier-info h4 {
  margin: 0 0 4px 0;
}

.supplier-info p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.quote-body {
  margin-bottom: 12px;
}

.quote-amount {
  margin-bottom: 8px;
}

.quote-amount .label {
  color: #666;
}

.quote-amount .value {
  font-size: 20px;
  font-weight: 600;
  color: #ff4d4f;
}

.quote-detail {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 13px;
}

.quote-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.page-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
