<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <p>© 2026 OpenFindBearings 轴承商城 - 专业的工业轴承采购平台</p>
      <div class="footer-links">
        <a href="#">关于我们</a>
        <a href="#">联系方式</a>
        <a href="#">隐私政策</a>
      </div>
    </div>
  </a-layout-footer>
</template>

<style scoped>
.footer {
  background: #f5f5f5;
  padding: 24px;
  text-align: center;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-content p {
  margin: 0 0 8px;
  color: #666;
  font-size: 14px;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.footer-links a {
  color: #999;
  text-decoration: none;
  font-size: 13px;
}

.footer-links a:hover {
  color: #1890ff;
}
</style>
