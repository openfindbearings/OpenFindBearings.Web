<template>
  <a-layout class="default-layout">
    <AppHeader />
    <a-layout-content class="main-content">
      <router-view />
    </a-layout-content>
    <AppFooter />
  </a-layout>
</template>

<script setup lang="ts">
import AppHeader from '../components/AppHeader.vue'
import AppFooter from '../components/AppFooter.vue'
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
