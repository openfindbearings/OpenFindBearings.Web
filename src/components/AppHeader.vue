<template>
  <a-layout-header class="header">
    <div class="header-content">
      <router-link to="/home" class="logo">
        <span class="logo-icon">B</span>
        <span class="logo-text">轴承商城</span>
      </router-link>

      <nav class="nav-links">
        <router-link to="/products">产品列表</router-link>
        <router-link to="/market/inquiries">报价市场</router-link>
        <router-link to="/inquiry">询价单</router-link>
      </nav>

      <div class="header-actions">
        <a-badge :count="inquiryCount" :offset="[-5, 5]">
          <router-link to="/inquiry" class="inquiry-btn">
            <a-button type="primary">询价单</a-button>
          </router-link>
        </a-badge>

        <template v-if="user">
          <span class="user-name" @click="router.push('/user/profile')">{{ user.username }}</span>
          <a @click="handleLogout" class="logout-link">退出</a>
        </template>
        <router-link v-else to="/user/login" class="login-link">登录</router-link>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInquiryStore } from '../composables/useInquiry'
import { tokenStorage } from '../api/auth'

const router = useRouter()
const route = useRoute()
const { items } = useInquiryStore()
const inquiryCount = computed(() => items.value.length)

const user = ref<{ username: string } | null>(null)

const checkLoginStatus = () => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    const userData = localStorage.getItem('openfindbearings_user')
    if (userData) {
      try {
        user.value = JSON.parse(userData)
        return
      } catch {
        // ignore
      }
    }
  }
  user.value = null
}

// 监听路由变化，每次路由切换时检查登录状态
watch(() => route.path, () => {
  checkLoginStatus()
})

const handleLogout = () => {
  tokenStorage.clearTokens()
  user.value = null
  router.push('/user/login')
}

// 监听 storage 变化（多标签页同步）
const handleStorageChange = () => {
  checkLoginStatus()
}

onMounted(() => {
  checkLoginStatus()
  window.addEventListener('storage', handleStorageChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
})
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 0 24px;
  height: 64px;
  line-height: 64px;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: #1890ff;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
}

.nav-links {
  display: flex;
  gap: 24px;
}

.nav-links a {
  color: #333;
  text-decoration: none;
  font-size: 15px;
  transition: color 0.3s;
}

.nav-links a:hover,
.nav-links a.router-link-active {
  color: #1890ff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.inquiry-btn {
  text-decoration: none;
}

.login-link,
.logout-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
}

.login-link:hover,
.logout-link:hover {
  color: #1890ff;
}

.user-name {
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.user-name:hover {
  color: #1890ff;
}
</style>
