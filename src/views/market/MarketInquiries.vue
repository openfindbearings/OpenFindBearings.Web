<template>
  <div class="market-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">报价市场</h1>
        <p class="page-subtitle">浏览可报价的询价单，抢占商机</p>
      </div>

      <!-- 搜索筛选栏 -->
      <a-card class="filter-card">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-input
              v-model:value="searchKeyword"
              placeholder="搜索询价单号、型号、品牌"
              @pressEnter="handleSearch"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
          </a-col>
          <a-col :span="6">
            <a-select
              v-model:value="selectedBrand"
              placeholder="选择品牌"
              style="width: 100%"
              allowClear
              @change="handleSearch"
            >
              <a-select-option v-for="brand in brands" :key="brand" :value="brand">
                {{ brand }}
              </a-select-option>
            </a-select>
          </a-col>
          <a-col :span="4">
            <a-button type="primary" @click="handleSearch">搜索</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-col>
        </a-row>
      </a-card>

      <!-- 询价单列表 -->
      <a-spin :spinning="loading">
        <div v-if="inquiries.length > 0" class="inquiry-list">
          <a-row :gutter="16">
            <a-col :span="8" v-for="inquiry in inquiries" :key="inquiry.id">
              <a-card class="inquiry-card" hoverable @click="viewDetail(inquiry.id)">
                <div class="card-header">
                  <span class="inquiry-id">{{ inquiry.id }}</span>
                  <a-tag :color="getStatusColor(inquiry.status)">
                    {{ getStatusText(inquiry.status) }}
                  </a-tag>
                </div>

                <div class="buyer-info">
                  <h4>{{ inquiry.buyerCompany }}</h4>
                  <p>联系人：{{ inquiry.contactPhone || inquiry.contactEmail }}</p>
                </div>

                <div class="product-summary">
                  <div class="summary-item">
                    <span class="label">产品数量：</span>
                    <span class="value">{{ inquiry.items.length }} 件</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">期望交期：</span>
                    <span class="value">{{ inquiry.expectedDelivery || '-' }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="label">报价截止：</span>
                    <span class="value">{{ formatDate(inquiry.expiresAt) }}</span>
                  </div>
                </div>

                <div class="product-preview">
                  <div class="preview-title">需求产品：</div>
                  <div class="preview-list">
                    <a-tag v-for="(item, index) in inquiry.items.slice(0, 3)" :key="index">
                      {{ item.product.brand }} {{ item.product.model }}
                    </a-tag>
                    <span v-if="inquiry.items.length > 3" class="more">
                      +{{ inquiry.items.length - 3 }}
                    </span>
                  </div>
                </div>

                <div class="card-footer">
                  <span class="publish-time">{{ formatRelativeTime(inquiry.createdAt) }}</span>
                  <a-button type="primary" size="small">查看详情</a-button>
                </div>
              </a-card>
            </a-col>
          </a-row>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <a-pagination
              v-model:current="pagination.current"
              v-model:pageSize="pagination.pageSize"
              :total="pagination.total"
              :showSizeChanger="true"
              :pageSizeOptions="['12', '24', '48']"
              showTotal
              @change="handlePageChange"
            />
          </div>
        </div>

        <a-empty
          v-else
          class="empty-state"
          description="暂无符合条件的询价单"
        >
          <template #extra>
            <a-button @click="handleReset">重置筛选</a-button>
          </template>
        </a-empty>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { marketApi } from '../../api'
import type { Inquiry, InquiryStatus } from '../../types/inquiry'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const router = useRouter()

const inquiries = ref<Inquiry[]>([])
const loading = ref(false)
const searchKeyword = ref('')
const selectedBrand = ref<string | undefined>(undefined)

const brands = ['SKF', 'NSK', 'FAG', 'NTN', 'INA', 'TIMKEN', 'KOYO', 'NACHI', 'ZWZ', 'HRB']

const pagination = ref({
  current: 1,
  pageSize: 12,
  total: 0,
})

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
  return dayjs(date).format('MM-DD HH:mm')
}

const formatRelativeTime = (date: string) => {
  return dayjs(date).fromNow()
}

const loadInquiries = async () => {
  loading.value = true
  try {
    const result = await marketApi.getAvailableInquiries({
      keyword: searchKeyword.value || undefined,
      brand: selectedBrand.value,
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

const handleSearch = () => {
  pagination.value.current = 1
  loadInquiries()
}

const handleReset = () => {
  searchKeyword.value = ''
  selectedBrand.value = undefined
  pagination.value.current = 1
  loadInquiries()
}

const handlePageChange = () => {
  loadInquiries()
}

const viewDetail = (id: string) => {
  router.push(`/market/inquiries/${id}`)
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.market-page {
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
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.page-subtitle {
  color: #666;
  margin: 0;
}

.filter-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.inquiry-list {
  min-height: 400px;
}

.inquiry-card {
  margin-bottom: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
}

.inquiry-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.inquiry-id {
  font-family: monospace;
  color: #666;
  font-size: 13px;
}

.buyer-info {
  margin-bottom: 12px;
}

.buyer-info h4 {
  margin: 0 0 4px 0;
  font-size: 15px;
}

.buyer-info p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.product-summary {
  background: #fafafa;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 12px;
}

.summary-item {
  display: flex;
  margin-bottom: 4px;
  font-size: 13px;
}

.summary-item:last-child {
  margin-bottom: 0;
}

.summary-item .label {
  color: #666;
  width: 70px;
}

.summary-item .value {
  color: #333;
}

.product-preview {
  margin-bottom: 12px;
}

.preview-title {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.preview-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preview-list .more {
  color: #999;
  font-size: 12px;
  padding: 2px 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.publish-time {
  color: #999;
  font-size: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.empty-state {
  padding: 60px 0;
}
</style>
