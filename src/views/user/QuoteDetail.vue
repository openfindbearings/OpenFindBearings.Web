<template>
  <div class="quote-detail-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.back()">返回</a-button>
        <h1 class="page-title">报价详情</h1>
        <a-button type="primary" @click="router.push('/user/quotes')">
          我的报价
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <template v-if="quote">
          <!-- Quote status card -->
          <a-card class="status-card">
            <div class="status-content">
              <div class="status-left">
                <div class="status-label">报价状态</div>
                <a-tag :color="getStatusColor(quote.status)" class="status-tag">
                  {{ getStatusText(quote.status) }}
                </a-tag>
              </div>
              <div class="status-right">
                <div class="quote-id">报价单号：{{ quote.id }}</div>
                <div class="quote-date">
                  提交时间：{{ formatDate(quote.createdAt) }}
                </div>
              </div>
            </div>
          </a-card>

          <!-- Inquiry info card -->
          <a-card class="inquiry-card" title="关联询价单">
            <div class="inquiry-content">
              <div class="inquiry-row">
                <span class="label">询价单号：</span>
                <a @click="viewInquiry(quote.inquiryId)" class="inquiry-link">
                  {{ quote.inquiryId }}
                </a>
              </div>
              <div class="inquiry-row">
                <span class="label">发布企业：</span>
                <span class="value">{{ quote.inquiry?.buyerCompany || quote.supplierCompany }}</span>
              </div>
              <div class="inquiry-row">
                <span class="label">询价状态：</span>
                <a-tag :color="getInquiryStatusColor(quote.inquiry?.status)">
                  {{ getInquiryStatusText(quote.inquiry?.status) }}
                </a-tag>
              </div>
            </div>
          </a-card>

          <!-- Products quote card -->
          <a-card class="products-card" title="报价明细">
            <a-table
              :dataSource="quote.items"
              :columns="itemColumns"
              :pagination="false"
              rowKey="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'product'">
                  <div class="product-cell">
                    <div class="product-brand">{{ quote.inquiry?.items?.find((i: any) => i.product.brand)?.product?.brand || '-' }}</div>
                    <div class="product-model">
                      {{ quote.inquiry?.items?.[quote.items.indexOf(record)]?.product?.model || '-' }}
                    </div>
                  </div>
                </template>
                <template v-else-if="column.key === 'unitPrice'">
                  <span class="price">¥{{ record.unitPrice.toLocaleString() }}</span>
                </template>
                <template v-else-if="column.key === 'subtotal'">
                  <span class="subtotal">¥{{ record.subtotal.toLocaleString() }}</span>
                </template>
              </template>
            </a-table>

            <div class="quote-summary">
              <div class="summary-row total">
                <span class="label">报价总额：</span>
                <span class="value">¥{{ quote.totalAmount.toLocaleString() }}</span>
              </div>
            </div>
          </a-card>

          <!-- Quote conditions card -->
          <a-card class="conditions-card" title="报价条件">
            <div class="conditions-grid">
              <div class="condition-item">
                <span class="label">报价有效期：</span>
                <span class="value">{{ formatDate(quote.validUntil) }}</span>
              </div>
              <div class="condition-item">
                <span class="label">交货周期：</span>
                <span class="value">{{ quote.deliveryDays }} 天</span>
              </div>
              <div class="condition-item" v-if="quote.paymentTerms">
                <span class="label">付款条款：</span>
                <span class="value">{{ quote.paymentTerms }}</span>
              </div>
              <div class="condition-item">
                <span class="label">联系人：</span>
                <span class="value">{{ quote.supplierContact }}</span>
              </div>
              <div class="condition-item">
                <span class="label">联系电话：</span>
                <span class="value">{{ quote.supplierPhone }}</span>
              </div>
            </div>
            <div v-if="quote.remark" class="quote-remark">
              <span class="label">报价备注：</span>
              <p class="value">{{ quote.remark }}</p>
            </div>
          </a-card>

          <!-- Action buttons -->
          <div class="action-section" v-if="quote.status === 'submitted'">
            <a-button
              type="primary"
              danger
              size="large"
              @click="handleWithdraw"
              :loading="withdrawing"
            >
              撤回报价
            </a-button>
          </div>
        </template>

        <a-result
          v-else-if="!loading"
          status="404"
          title="报价单不存在"
          sub-title="抱歉，您访问的报价单不存在或无权查看"
        >
          <template #extra>
            <a-button type="primary" @click="router.push('/user/quotes')">
              返回我的报价
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
import { quoteApi } from '../../api'
import type { InquiryQuote, QuoteStatus } from '../../types/quote'
import type { InquiryStatus } from '../../types/inquiry'

const router = useRouter()
const route = useRoute()

const quote = ref<InquiryQuote | null>(null)
const loading = ref(false)
const withdrawing = ref(false)

const itemColumns = [
  { title: '产品信息', key: 'product', width: '30%' },
  { title: '数量', dataIndex: 'quantity', width: '15%' },
  { title: '单价', key: 'unitPrice', width: '20%' },
  { title: '小计', key: 'subtotal', width: '20%' },
  { title: '备注', dataIndex: 'remark', width: '15%' },
]

const getStatusColor = (status: QuoteStatus) => {
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

const getStatusText = (status: QuoteStatus) => {
  const texts: Record<string, string> = {
    submitted: '已提交',
    under_review: '审核中',
    accepted: '已接受',
    rejected: '已拒绝',
    expired: '已过期',
    withdrawn: '已撤回',
  }
  return texts[status] || status
}

const getInquiryStatusColor = (status: InquiryStatus | undefined) => {
  const colors: Record<string, string> = {
    published: 'processing',
    quoting: 'warning',
    quoted: 'success',
    accepted: 'green',
  }
  return colors[status || ''] || 'default'
}

const getInquiryStatusText = (status: InquiryStatus | undefined) => {
  const texts: Record<string, string> = {
    published: '已发布',
    quoting: '报价中',
    quoted: '报价完成',
    accepted: '已成交',
  }
  return texts[status || ''] || status || '-'
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const loadQuote = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    quote.value = await quoteApi.getQuote(id)
  } catch (error: any) {
    message.error(error.message || '加载失败')
    quote.value = null
  } finally {
    loading.value = false
  }
}

const viewInquiry = (id: string) => {
  // Check if this is my inquiry or someone else's
  // For now, just go to market inquiry detail
  router.push(`/market/inquiries/${id}`)
}

const handleWithdraw = () => {
  if (!quote.value) return

  Modal.confirm({
    title: '确认撤回报价？',
    content: '撤回后该报价将不再有效，买家将无法查看。此操作不可撤销。',
    okText: '确认撤回',
    okType: 'danger',
    cancelText: '取消',
    onOk: async () => {
      withdrawing.value = true
      try {
        await quoteApi.withdrawQuote(quote.value!.id)
        message.success('报价已撤回')
        loadQuote()
      } catch (error: any) {
        message.error(error.message || '撤回失败')
      } finally {
        withdrawing.value = false
      }
    },
  })
}

onMounted(() => {
  loadQuote()
})
</script>

<style scoped>
.quote-detail-page {
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

.status-card,
.inquiry-card,
.products-card,
.conditions-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.status-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.status-tag {
  font-size: 16px;
  padding: 4px 12px;
}

.quote-id {
  font-family: monospace;
  font-size: 14px;
  color: #666;
}

.quote-date {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.inquiry-content .inquiry-row {
  margin-bottom: 12px;
}

.inquiry-row .label {
  color: #666;
}

.inquiry-row .value {
  font-weight: 500;
}

.inquiry-link {
  color: #1890ff;
  cursor: pointer;
}

.inquiry-link:hover {
  text-decoration: underline;
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

.price {
  font-weight: 500;
}

.subtotal {
  font-weight: 600;
  color: #ff4d4f;
}

.quote-summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.quote-summary .summary-row.total {
  font-size: 18px;
}

.quote-summary .label {
  color: #666;
}

.quote-summary .value {
  font-weight: 600;
  color: #ff4d4f;
  margin-left: 12px;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.condition-item {
  display: flex;
}

.condition-item .label {
  color: #666;
  margin-right: 8px;
}

.condition-item .value {
  font-weight: 500;
}

.quote-remark {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.quote-remark .label {
  color: #666;
  display: block;
  margin-bottom: 8px;
}

.quote-remark .value {
  color: #333;
  margin: 0;
  line-height: 1.6;
}

.action-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
