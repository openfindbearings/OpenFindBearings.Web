<template>
  <div class="user-center-page">
    <div class="container">
      <div class="page-header">
        <h1 class="page-title">用户中心</h1>
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
          <!-- My Procurement -->
          <a-tab-pane key="inquiries" tab="我的采购">
            <div class="section-intro">
              <h3>我的询价单</h3>
              <p>管理您发布的询价需求，查看收到的报价</p>
            </div>
            <a-card class="action-card" @click="router.push('/user/inquiries')">
              <div class="action-content">
                <div class="action-icon" style="background: #e6f7ff; color: #1890ff;">
                  <FileTextOutlined />
                </div>
                <div class="action-info">
                  <h4>我的询价单</h4>
                  <p>共 {{ inquiryStats.total }} 个询价单</p>
                </div>
                <RightOutlined class="action-arrow" />
              </div>
            </a-card>
          </a-tab-pane>

          <!-- My Sales -->
          <a-tab-pane key="sales" tab="我的销售">
            <div class="section-intro">
              <h3>我的销售</h3>
              <p>浏览市场询价单，管理您的报价</p>
            </div>
            <div class="action-cards">
              <a-card class="action-card" @click="router.push('/market/inquiries')">
                <div class="action-content">
                  <div class="action-icon" style="background: #f6ffed; color: #52c41a;">
                    <ShopOutlined />
                  </div>
                  <div class="action-info">
                    <h4>可报价市场</h4>
                    <p>浏览可报价的询价单，抢占商机</p>
                  </div>
                  <RightOutlined class="action-arrow" />
                </div>
              </a-card>

              <a-card class="action-card" @click="router.push('/user/quotes')">
                <div class="action-content">
                  <div class="action-icon" style="background: #fff7e6; color: #fa8c16;">
                    <FormOutlined />
                  </div>
                  <div class="action-info">
                    <h4>我的报价</h4>
                    <p>查看已提交的报价状态</p>
                  </div>
                  <RightOutlined class="action-arrow" />
                </div>
              </a-card>
            </div>
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
import { UserOutlined, FileTextOutlined, ShopOutlined, FormOutlined, RightOutlined } from '@ant-design/icons-vue'
import { inquiryApi } from '../api'

const router = useRouter()

const user = ref<{ username: string; company: string } | null>(null)
const activeTab = ref('inquiries')

const inquiryStats = ref({
  total: 0,
  draft: 0,
  published: 0,
  quoting: 0,
})

const loadStats = async () => {
  try {
    const result = await inquiryApi.getMyInquiries({ pageSize: 100 })
    inquiryStats.value.total = result.total
  } catch (error) {
    console.error('Failed to load stats:', error)
  }
}

onMounted(() => {
  const userData = localStorage.getItem('openfindbearings_user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
      loadStats()
    } catch {
      // ignore
    }
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

.section-intro {
  margin-bottom: 16px;
}

.section-intro h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.section-intro p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.action-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.action-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.action-info {
  flex: 1;
}

.action-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
}

.action-info p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.action-arrow {
  color: #999;
}

.not-logged-in {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}
</style>
