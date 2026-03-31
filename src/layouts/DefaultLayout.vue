<template>
  <!-- 全屏着陆页：不使用布局容器 -->
  <router-view v-if="isLandingPage" />

  <!-- 普通页面：使用默认布局 -->
  <a-layout v-else class="default-layout">
    <AppHeader />
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'

const route = useRoute()
const isLandingPage = computed(() => route.name === 'Landing')
</script>

<style scoped>
.default-layout {
  min-height: 100vh;
}

.main-content {
  background: #f5f5f5;
  min-height: calc(100vh - 64px - 80px);
}
</style>
