<template>
  <div class="product-list-page">
    <div class="container">
      <div class="page-header">
        <a-input-search
          v-model:value="keyword"
          placeholder="输入轴承型号或品牌搜索"
          style="width: 300px"
          @search="handleSearch"
        />
        <span class="result-count">共 {{ total }} 个产品</span>
      </div>

      <div class="page-content">
        <aside class="filter-sidebar">
          <div class="filter-section">
            <div class="filter-title">轴承类型</div>
            <a-checkbox-group v-model:value="selectedTypes" :options="typeOptions" />
          </div>

          <a-divider />

          <div class="filter-section">
            <div class="filter-title">品牌</div>
            <a-checkbox-group v-model:value="selectedBrands" :options="brandOptions" />
          </div>

          <a-divider />

          <div class="filter-section">
            <div class="filter-title">内径范围 (mm)</div>
            <a-slider v-model:value="innerDiameterRange" range :min="0" :max="200" />
            <div class="range-values">
              <span>{{ innerDiameterRange[0] }}</span>
              <span>{{ innerDiameterRange[1] }}</span>
            </div>
          </div>

          <a-divider />

          <div class="filter-section">
            <div class="filter-title">外径范围 (mm)</div>
            <a-slider v-model:value="outerDiameterRange" range :min="0" :max="300" />
            <div class="range-values">
              <span>{{ outerDiameterRange[0] }}</span>
              <span>{{ outerDiameterRange[1] }}</span>
            </div>
          </div>

          <a-divider />

          <div class="filter-section">
            <div class="filter-title">精度等级</div>
            <a-checkbox-group v-model:value="selectedPrecisions" :options="precisionOptions" />
          </div>

          <a-divider />

          <div class="filter-section">
            <div class="filter-title">密封形式</div>
            <a-checkbox-group v-model:value="selectedSealTypes" :options="sealTypeOptions" />
          </div>

          <a-divider />

          <a-button type="primary" block @click="handleSearch">应用筛选</a-button>
          <a-button block style="margin-top: 8px" @click="resetFilters">重置</a-button>
        </aside>

        <main class="product-main">
          <div class="product-grid">
            <div v-for="product in products" :key="product.id" class="product-card" @click="goToDetail(product.id)">
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
                  内径 {{ product.innerDiameter }}mm · 外径 {{ product.outerDiameter }}mm · 宽度 {{ product.width }}mm
                </div>
                <div class="product-meta">
                  <a-tag>{{ product.type }}</a-tag>
                  <a-tag>{{ product.precision }}</a-tag>
                </div>
                <div class="product-bottom">
                  <div class="product-price">
                    <template v-if="product.price">
                      ¥{{ product.price }}
                    </template>
                    <template v-else>
                      面议
                    </template>
                  </div>
                  <a-button type="primary" size="small" @click.stop="handleAddToInquiry(product)">
                    加入询价单
                  </a-button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="products.length === 0" class="empty-result">
            <a-empty description="未找到匹配的产品" />
          </div>

          <div v-if="total > 0" class="pagination">
            <a-pagination
              v-model:current="currentPage"
              :total="total"
              :page-size="pageSize"
              show-quick-jumper
              @change="handlePageChange"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Product } from '../api/products'
import { brands, bearingTypes, precisionGrades, sealTypes } from '../api/products'
import { getProducts } from '../api/index'
import { useInquiryStore } from '../composables/useInquiry'

const router = useRouter()
const route = useRoute()
const { addToInquiry } = useInquiryStore()

const keyword = ref('')
const products = ref<Product[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)

const selectedTypes = ref<string[]>([])
const selectedBrands = ref<string[]>([])
const selectedPrecisions = ref<string[]>([])
const selectedSealTypes = ref<string[]>([])
const innerDiameterRange = ref<[number, number]>([0, 200])
const outerDiameterRange = ref<[number, number]>([0, 300])

const typeOptions = bearingTypes.map(t => ({ label: t, value: t }))
const brandOptions = brands.map(b => ({ label: b, value: b }))
const precisionOptions = precisionGrades.map(p => ({ label: p, value: p }))
const sealTypeOptions = sealTypes.map(s => ({ label: s, value: s }))

const fetchProducts = async () => {
  const result = await getProducts({
    keyword: keyword.value || undefined,
    types: selectedTypes.value.length > 0 ? selectedTypes.value : undefined,
    brands: selectedBrands.value.length > 0 ? selectedBrands.value : undefined,
    precisions: selectedPrecisions.value.length > 0 ? selectedPrecisions.value : undefined,
    sealTypes: selectedSealTypes.value.length > 0 ? selectedSealTypes.value : undefined,
    minInnerDiameter: innerDiameterRange.value[0] > 0 ? innerDiameterRange.value[0] : undefined,
    maxInnerDiameter: innerDiameterRange.value[1] < 200 ? innerDiameterRange.value[1] : undefined,
    minOuterDiameter: outerDiameterRange.value[0] > 0 ? outerDiameterRange.value[0] : undefined,
    maxOuterDiameter: outerDiameterRange.value[1] < 300 ? outerDiameterRange.value[1] : undefined,
    page: currentPage.value,
    pageSize: pageSize.value
  })
  
  products.value = result.items
  total.value = result.total
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchProducts()
}

const resetFilters = async () => {
  selectedTypes.value = []
  selectedBrands.value = []
  selectedPrecisions.value = []
  selectedSealTypes.value = []
  innerDiameterRange.value = [0, 200]
  outerDiameterRange.value = [0, 300]
  keyword.value = ''
  currentPage.value = 1
  await fetchProducts()
}

const goToDetail = (id: string) => {
  router.push(`/products/${id}`)
}

const handleAddToInquiry = (product: Product) => {
  addToInquiry(product)
  message.success('已加入询价单')
}

onMounted(async () => {
  if (route.query.keyword) {
    keyword.value = route.query.keyword as string
  }
  if (route.query.type) {
    selectedTypes.value = [route.query.type as string]
  }
  await fetchProducts()
})
</script>

<style scoped>
.product-list-page {
  min-height: 100%;
  background: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.result-count {
  color: #666;
  font-size: 14px;
}

.page-content {
  display: flex;
  gap: 24px;
}

.filter-sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.filter-section {
  margin-bottom: 8px;
}

.filter-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
}

.range-values {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.product-main {
  flex: 1;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
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
  font-size: 16px;
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
  margin-bottom: 8px;
}

.product-spec {
  font-size: 13px;
  color: #999;
  margin-bottom: 8px;
}

.product-meta {
  margin-bottom: 12px;
}

.product-meta :deep(.ant-tag) {
  margin-right: 4px;
}

.product-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-price {
  font-size: 18px;
  font-weight: 600;
  color: #ff4d4f;
}

.empty-result {
  padding: 60px 0;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

@media (max-width: 992px) {
  .product-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-sidebar {
    display: none;
  }
}

@media (max-width: 576px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
</style>
