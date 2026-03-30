<template>
  <div class="inquiry-detail-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.push('/user/profile')">返回</a-button>
      </div>
      <div class="detail-content">
        <a-result status="info" title="功能开发中" sub-title="询价单详情页将在后续版本推出">
          <template #extra>
            <a-button type="primary" @click="router.push('/user/profile')">返回用户中心</a-button>
          </template>
        </a-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
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
  margin-bottom: 24px;
}

.detail-content {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}
</style>
