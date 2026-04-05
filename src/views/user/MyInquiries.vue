<template>
  <div class="my-inquiries-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">我的询价单</h1>
        <a-button type="primary" @click="router.push('/inquiry')">
          新建询价单
        </a-button>
      </div>

      <!-- 状态筛选 -->
      <div class="filter-bar">
        <a-radio-group v-model:value="filterStatus" @change="handleFilterChange">
          <a-radio-button value="">全部</a-radio-button>
          <a-radio-button value="draft">草稿</a-radio-button>
          <a-radio-button value="published">已发布</a-radio-button>
          <a-radio-button value="quoting">报价中</a-radio-button>
          <a-radio-button value="quoted">报价完成</a-radio-button>
          <a-radio-button value="accepted">已成交</a-radio-button>
        </a-radio-group>
      </div>

      <!-- 询价单列表 -->
      <a-card class="inquiries-card">
        <a-table
          :dataSource="inquiries"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          @change="handleTableChange"
          rowKey="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'id'">
              <a @click="viewDetail(record.id)" class="inquiry-link">
                {{ record.id }}
              </a>
            </template>
            <template v-else-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-else-if="column.key === 'quoteCount'">
              <a-badge
                :count="record.quoteCount || 0"
                :showZero="true"
                :overflowCount="99"
              />
            </template>
            <template v-else-if="column.key === 'action'">
              <div class="action-buttons">
                <a-button
                  v-if="record.status === 'draft'"
                  type="primary"
                  size="small"
                  @click="handlePublish(record.id)"
                  :loading="publishingId === record.id"
                >
                  发布
                </a-button>
                <a-button
                  v-if="['published', 'quoting'].includes(record.status)"
                  type="link"
                  size="small"
                  @click="viewDetail(record.id)"
                >
                  查看报价
                </a-button>
                <a-button
                  v-if="record.status === 'quoting'"
                  size="small"
                  @click="handleClose(record.id)"
                >
                  停止报价
                </a-button>
                <a-button
                  v-if="['draft', 'published'].includes(record.status)"
                  type="link"
                  danger
                  size="small"
                  @click="handleCancel(record.id)"
                >
                  取消
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
import { inquiryApi } from '../../api'
import type { Inquiry, InquiryStatus } from '../../types/inquiry'

const router = useRouter()

const inquiries = ref<Inquiry[]>([])
const loading = ref(false)
const filterStatus = ref<InquiryStatus | ''>('')
const publishingId = ref<string | null>(null)

const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
})

const columns = [
  { title: '询价单号', key: 'id', width: '20%' },
  { title: '产品数量', dataIndex: ['items', 'length'], width: '12%' },
  { title: '状态', key: 'status', width: '12%' },
  { title: '报价数', key: 'quoteCount', width: '10%' },
  { title: '提交日期', dataIndex: 'createdAt', width: '15%' },
  { title: '期望交期', dataIndex: 'expectedDelivery', width: '15%' },
  { title: '操作', key: 'action', width: '16%' },
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

const loadInquiries = async () => {
  loading.value = true
  try {
    const result = await inquiryApi.getMyInquiries({
      status: filterStatus.value || undefined,
      page: pagination.value.current,
      pageSize: pagination.value.pageSize,
    })
    inquiries.value = result.items
    pagination.value.total = result.total
  } catch (error: any) {
    message.error(error.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.current = 1
  loadInquiries()
}

const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
  loadInquiries()
}

const viewDetail = (id: string) => {
  router.push(`/user/inquiries/${id}`)
}

const handlePublish = async (id: string) => {
  publishingId.value = id
  try {
    await inquiryApi.publishInquiry(id)
    message.success('询价单已发布')
    loadInquiries()
  } catch (error: any) {
    message.error(error.message || '发布失败')
  } finally {
    publishingId.value = null
  }
}

const handleClose = async (id: string) => {
  Modal.confirm({
    title: '确认停止接收报价？',
    content: '停止后将不再接收新的报价，已有的报价仍然有效。',
    onOk: async () => {
      try {
        await inquiryApi.closeInquiry(id)
        message.success('已停止接收报价')
        loadInquiries()
      } catch (error: any) {
        message.error(error.message || '操作失败')
      }
    },
  })
}

const handleCancel = async (id: string) => {
  Modal.confirm({
    title: '确认取消询价单？',
    content: '取消后该询价单将不再有效。',
    onOk: async () => {
      try {
        await inquiryApi.cancelInquiry(id)
        message.success('询价单已取消')
        loadInquiries()
      } catch (error: any) {
        message.error(error.message || '取消失败')
      }
    },
  })
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.my-inquiries-page {
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

.inquiries-card {
  border-radius: 8px;
}

.inquiry-link {
  color: #1890ff;
  cursor: pointer;
}

.inquiry-link:hover {
  text-decoration: underline;
}

.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
