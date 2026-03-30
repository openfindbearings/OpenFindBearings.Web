<template>
  <div class="user-center-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">用户中心</h1>
        <a-button @click="handleLogout">退出登录</a-button>
      </div>

      <div v-if="user" class="user-content">
        <div class="user-info-card">
          <div class="user-avatar">
            <UserOutlined />
          </div>
          <div class="user-details">
            <div class="user-name">{{ user.username }}</div>
            <div class="user-company">{{ user.company }}</div>
          </div>
        </div>

        <a-tabs v-model:activeKey="activeTab" class="user-tabs">
          <a-tab-pane key="inquiries" tab="我的询价单">
            <a-table :dataSource="inquiries" :columns="inquiryColumns" :pagination="false">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'status'">
                  <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                  </a-tag>
                </template>
                <template v-else-if="column.key === 'action'">
                  <a-button type="link" @click="router.push(`/inquiry/${record.id}`)">
                    查看详情
                  </a-button>
                </template>
              </template>
            </a-table>
          </a-tab-pane>
          
          <a-tab-pane key="profile" tab="企业信息">
            <a-descriptions title="企业信息" bordered>
              <a-descriptions-item label="企业名称">{{ user.company }}</a-descriptions-item>
              <a-descriptions-item label="用户名">{{ user.username }}</a-descriptions-item>
              <a-descriptions-item label="联系人">张先生</a-descriptions-item>
              <a-descriptions-item label="联系电话">138****8888</a-descriptions-item>
              <a-descriptions-item label="收货地址">上海市浦东新区某某路88号</a-descriptions-item>
            </a-descriptions>
          </a-tab-pane>
        </a-tabs>
      </div>

      <div v-else class="not-logged-in">
        <a-result status="warning" title="未登录" sub-title="请先登录后再访问用户中心">
          <template #extra>
            <a-button type="primary" @click="router.push('/user/login')">去登录</a-button>
          </template>
        </a-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined } from '@ant-design/icons-vue'

const router = useRouter()

const user = ref<{ username: string; company: string } | null>(null)
const activeTab = ref('inquiries')

const inquiries = ref([
  { id: 'RFQ-20260327-001', itemCount: 5, status: 'submitted', createdAt: '2026-03-27' },
  { id: 'RFQ-20260325-002', itemCount: 3, status: 'quoted', createdAt: '2026-03-25' }
])

const inquiryColumns = [
  { title: '询价单号', dataIndex: 'id', key: 'id' },
  { title: '产品数量', dataIndex: 'itemCount', key: 'itemCount' },
  { title: '状态', key: 'status' },
  { title: '提交日期', dataIndex: 'createdAt', key: 'createdAt' },
  { title: '操作', key: 'action' }
]

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

const handleLogout = () => {
  localStorage.removeItem('openfindbearings_user')
  user.value = null
  router.push('/user/login')
}

onMounted(() => {
  const userData = localStorage.getItem('openfindbearings_user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})
</script>

<style scoped>
.user-center-page {
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
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #333;
}

.user-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.user-info-card {
  display: flex;
  align-items: center;
  padding: 24px;
  background: #fafafa;
  border-radius: 8px;
  margin-bottom: 24px;
}

.user-avatar {
  width: 64px;
  height: 64px;
  background: #1890ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 28px;
  margin-right: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.user-company {
  font-size: 14px;
  color: #666;
}

.user-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

.not-logged-in {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}
</style>
