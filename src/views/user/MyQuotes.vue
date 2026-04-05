<template>
  <div class="my-quotes-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我的报价</h1>
        <a-button type="primary" @click="router.push('/market/inquiries')">
          去报价市场
        </a-button>
      </div>

      <!-- Status filter -->
      <div class="filter-bar">
        <a-radio-group v-model:value="filterStatus" @change="handleFilterChange">
          <a-radio-button value="">全部</a-radio-button>
          <a-radio-button value="submitted">已提交</a-radio-button>
          <a-radio-button value="under_review">审核中</a-radio-button>
          <a-radio-button value="accepted">已接受</a-radio-button>
          <a-radio-button value="rejected">已拒绝</a-radio-button>
          <a-radio-button value="withdrawn">已撤回</a-radio-button>
        </a-radio-group>
      </div>

      <!-- Quotes list -->
      <a-card class="quotes-card">
        <a-table
          :dataSource="quotes"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'id'">
              <a @click="viewDetail(record.id)" class="quote-link">
                {{ record.id }}
              </a>
            </template>

            <template v-else-if="column.key === 'inquiry'">
              <div class="inquiry-info">
                <div class="inquiry-id">{{ record.inquiry?.id || record.inquiryId }}</div>
                <div class="buyer-company">{{ record.inquiry?.buyerCompany || '-' }}</div>
              </div>
            </template>

            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>

            <template v-else-if="column.key === 'amount'">
              <span class="amount">¥{{ record.totalAmount.toLocaleString() }}</span>
            </template>

            <template v-else-if="column.key === 'products'">
              <span>{{ record.items?.length || 0 }} 件产品</span>
            </template>

            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button type="link" size="small" @click="viewDetail(record.id)">
                  查看
                </a-button>
                <a-button
                  v-if="record.status === 'submitted'"
                  size="small"
                  danger
                  @click="handleWithdraw(record.id)"
                  :loading="withdrawingId === record.id"
                >
                  撤回
                </a-button>
              </div>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message, Modal } from 'ant-design-vue'
import { quoteApi } from '../../api'
import type { InquiryQuote, QuoteStatus } from '../../types/quote'

const router = useRouter()

const quotes = ref<InquiryQuote[]>([])
const loading = ref(false)
const filterStatus = ref<QuoteStatus | ''>('')
const withdrawingId = ref<string | null>(null)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

const columns = [
  { title: '报价单号', key: 'id', width: '18%' },
  { title: '询价单', key: 'inquiry', width: '22%' },
  { title: '状态', key: 'status', width: '12%' },
  { title: '报价金额', key: 'amount', width: '14%' },
  { title: '产品数', key: 'products', width: '10%' },
  { title: '提交日期', dataIndex: 'createdAt', width: '14%' },
  { title: '操作', key: 'action', width: '10%' },
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

const loadQuotes = async () => {
  loading.value = true
  try {
    const result = await quoteApi.getMyQuotes({
      status: filterStatus.value || undefined,
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    })
    quotes.value = result.items
    pagination.value.total = result.total
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.current = 1
  loadQuotes()
}

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadQuotes()
}

const viewDetail = (id: string) => {
  router.push(`/user/quotes/${id}`)
}

const handleWithdraw = (id: string) => {
  Modal.confirm({
    title: '确认撤回报价？',
    content: '撤回后该报价将不再有效，买家将无法查看。',
    onOk: async () => {
      withdrawingId.value = id
      try {
        await quoteApi.withdrawQuote(id)
        message.success('报价已撤回')
        loadQuotes()
      } catch (error: any) {
        message.error(error.message || '撤回失败')
      } finally {
        withdrawingId.value = null
      }
    },
  })
}

onMounted(() => {
  loadQuotes()
})
</script>

<style scoped>
.my-quotes-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.container {
  max-width: 1200px;
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
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.filter-bar {
  margin-bottom: 16px;
}

.quotes-card {
  border-radius: 8px;
}

.quote-link {
  color: #1890ff;
  cursor: pointer;
}

.quote-link:hover {
  text-decoration: underline;
}

.inquiry-info .inquiry-id {
  font-family: monospace;
  font-size: 13px;
  color: #666;
}

.inquiry-info .buyer-company {
  font-size: 13px;
  color: #333;
  margin-top: 4px;
}

.amount {
  font-weight: 600;
  color: #ff4d4f;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>