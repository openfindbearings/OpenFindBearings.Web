<template>
  <div class="product-compare-page">
    <div class="container">
      <h1 class="page-title">产品对比</h1>
      <div class="compare-content">
        <a-result status="info" title="功能开发中" sub-title="产品对比功能将在后续版本推出">
          <template #extra>
            <a-button type="primary" @click="router.push('/products')">去选购</a-button>
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
.product-compare-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.compare-content {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}
</style>
