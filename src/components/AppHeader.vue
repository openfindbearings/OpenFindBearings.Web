<template>
  <a-layout-header class="header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="logo-icon">B</span>
        <span class="logo-text">轴承商城</span>
      </router-link>
      
      <nav class="nav-links">
        <router-link to="/products">产品列表</router-link>
        <router-link to="/inquiry">询价单</router-link>
        <router-link to="/user/profile">用户中心</router-link>
      </nav>

      <div class="header-actions">
        <a-badge :count="inquiryCount" :offset="[-5, 5]">
          <router-link to="/inquiry" class="inquiry-btn">
            <a-button type="primary">询价单</a-button>
          </router-link>
        </a-badge>
        <router-link to="/user/login" class="login-link">登录</router-link>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInquiryStore } from '../composables/useInquiry'

const { items } = useInquiryStore()
const inquiryCount = computed(() => items.value.length)
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

.login-link {
  color: #666;
  text-decoration: none;
  font-size: 14px;
}

.login-link:hover {
  color: #1890ff;
}
</style>
