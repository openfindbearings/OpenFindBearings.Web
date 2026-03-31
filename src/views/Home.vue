<template>
  <div class="home">
    <div class="hero-section">
      <h1 class="hero-title">专业的工业轴承采购平台</h1>
      <p class="hero-subtitle">海量的轴承型号，便捷的询价流程，助力企业高效采购</p>
      
      <div class="search-box">
        <a-input-search
          v-model:value="searchKeyword"
          placeholder="输入轴承型号、品牌或类型..."
          size="large"
          enter-button
          @search="handleSearch"
        >
          <template #enterButton>
            <SearchOutlined /> 搜索
          </template>
        </a-input-search>
      </div>
      
      <div class="hot-searches">
        <span class="hot-label">热门搜索：</span>
        <a-tag v-for="kw in hotKeywords" :key="kw" class="hot-tag" @click="searchWithKeyword(kw)">
          {{ kw }}
        </a-tag>
      </div>
    </div>

    <div class="container">
      <section class="categories-section">
        <h2 class="section-title">热门分类</h2>
        <div class="category-grid">
          <router-link 
            v-for="cat in categories" 
            :key="cat.name" 
            :to="`/products?type=${cat.name}`"
            class="category-card"
          >
            <div class="category-icon">{{ cat.name[0] }}</div>
            <div class="category-name">{{ cat.name }}</div>
            <div class="category-count">{{ cat.count }} 个产品</div>
          </router-link>
        </div>
      </section>

      <section class="products-section">
        <h2 class="section-title">推荐产品</h2>
        <div class="product-grid">
          <div v-for="product in recommendedProducts" :key="product.id" class="product-card">
            <div class="product-image">
              <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.model" class="product-img"/>
              <div v-else class="product-placeholder">
                <span>{{ product.brand }}</span>
              </div>
            </div>
            <div class="product-info">
              <div class="product-brand">{{ product.brand }}</div>
              <div class="product-model">{{ product.model }}</div>
              <div class="product-spec">
                {{ product.innerDiameter }}×{{ product.outerDiameter }}×{{ product.width }}mm
              </div>
              <div class="product-price">
                <template v-if="product.price">
                  ¥{{ product.price }}
                </template>
                <template v-else>
                  面议
                </template>
              </div>
              <a-button type="primary" size="small" @click="handleAddToInquiry(product)">
                加入询价单
              </a-button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchOutlined } from '@ant-design/icons-vue'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Product } from '../api/products'
import { getRecommendedProducts, getHotCategories } from '../api/index'
import { useInquiryStore } from '../composables/useInquiry'

const router = useRouter()
const { addToInquiry } = useInquiryStore()

const searchKeyword = ref('')
const recommendedProducts = ref<Product[]>([])
const categories = ref<{ name: string; count: number }[]>([])
const hotKeywords = ['6205', 'SKF', 'NSK', '深沟球轴承', '圆锥滚子']

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value } })
  }
}

const searchWithKeyword = (kw: string) => {
  router.push({ path: '/products', query: { keyword: kw } })
}

const handleAddToInquiry = (product: Product) => {
  addToInquiry(product)
  message.success('已加入询价单')
}

onMounted(async () => {
  recommendedProducts.value = await getRecommendedProducts(8)
  categories.value = await getHotCategories()
})
</script>

<style scoped>
.home {
  min-height: 100%;
}

.hero-section {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  padding: 60px 24px;
  text-align: center;
  color: #fff;
}

.hero-title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 12px;
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.search-box {
  max-width: 600px;
  margin: 0 auto 24px;
}

.search-box :deep(.ant-input-search-button) {
  background: #fff;
  border-color: #fff;
  color: #1890ff;
  font-weight: 500;
}

.hot-searches {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.hot-label {
  color: rgba(255, 255, 255, 0.8);
}

.hot-tag {
  cursor: pointer;
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: #fff;
}

.hot-tag:hover {
  background: rgba(255, 255, 255, 0.3);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
}

.categories-section {
  margin-bottom: 48px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.category-card {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.category-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 12px;
}

.category-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.category-count {
  font-size: 13px;
  color: #999;
}

.products-section {
  margin-bottom: 48px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 140px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.product-placeholder {
  color: #ccc;
  font-size: 18px;
  font-weight: 500;
}

.product-info {
  padding: 16px;
}

.product-brand {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.product-model {
  font-size: 15px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-spec {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 12px;
}

@media (max-width: 768px) {
  .category-grid,
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .hero-title {
    font-size: 24px;
  }
}
</style>
