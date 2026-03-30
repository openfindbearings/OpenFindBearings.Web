<template>
  <div class="product-detail-page">
    <div class="container">
      <div v-if="product" class="product-detail">
        <div class="product-main">
          <div class="product-image">
            <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.model" class="detail-img"/>
            <div v-else class="image-placeholder">
              <span>{{ product.brand }}</span>
            </div>
          </div>
          
          <div class="product-info">
            <div class="product-brand">{{ product.brand }}</div>
            <h1 class="product-model">{{ product.model }}</h1>
            <div class="product-tags">
              <a-tag color="blue">{{ product.type }}</a-tag>
              <a-tag>{{ product.category }}</a-tag>
              <a-tag>精度: {{ product.precision }}</a-tag>
              <a-tag>密封: {{ product.sealType }}</a-tag>
            </div>
            <div class="product-desc">{{ product.description }}</div>
          </div>
        </div>

        <aside class="product-sidebar">
          <div class="price-section">
            <div class="price-label">参考价格</div>
            <div class="price-value">
              <template v-if="product.price">
                ¥{{ product.price }}
              </template>
              <template v-else>
                面议
              </template>
            </div>
            <div class="stock-info">
              库存: {{ product.stock > 0 ? `${product.stock} 件` : '缺货' }}
            </div>
          </div>

          <a-divider />

          <div class="inquiry-section">
            <div class="quantity-input">
              <span class="label">需求数量:</span>
              <a-input-number v-model:value="quantity" :min="1" :max="product.stock" />
            </div>
            <a-button type="primary" size="large" block @click="handleAddToInquiry">
              加入询价单
            </a-button>
          </div>
        </aside>

        <div class="spec-section">
          <h2 class="section-title">技术参数</h2>
          <a-table 
            :dataSource="specData" 
            :columns="specColumns" 
            :pagination="false"
            size="small"
            bordered
          />
        </div>
      </div>

      <div v-else class="not-found">
        <a-result status="404" title="产品不存在" sub-title="抱歉，您查找的产品不存在">
          <template #extra>
            <a-button type="primary" @click="router.push('/products')">返回产品列表</a-button>
          </template>
        </a-result>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { Product } from '../api/products'
import { getProductById } from '../api/index'
import { useInquiryStore } from '../composables/useInquiry'

const router = useRouter()
const route = useRoute()
const { addToInquiry } = useInquiryStore()

const product = ref<Product | undefined>()
const quantity = ref(1)

const specData = computed(() => {
  if (!product.value) return []
  return [
    { key: '型号', value: product.value.model },
    { key: '品牌', value: product.value.brand },
    { key: '类型', value: product.value.type },
    { key: '内径 (d)', value: `${product.value.innerDiameter} mm` },
    { key: '外径 (D)', value: `${product.value.outerDiameter} mm` },
    { key: '宽度 (B)', value: `${product.value.width} mm` },
    { key: '额定动载荷 (C)', value: `${product.value.loadRatingDynamic} kN` },
    { key: '额定静载荷 (C0)', value: `${product.value.loadRatingStatic} kN` },
    { key: '极限转速', value: `${product.value.speedLimit} rpm` },
    { key: '精度等级', value: product.value.precision },
    { key: '密封形式', value: product.value.sealType },
    { key: '材质', value: product.value.material }
  ]
})

const specColumns = [
  { title: '参数', dataIndex: 'key', width: '40%' },
  { title: '数值', dataIndex: 'value' }
]

const handleAddToInquiry = () => {
  if (product.value) {
    addToInquiry(product.value, quantity.value)
    message.success('已加入询价单')
  }
}

onMounted(async () => {
  const id = route.params.id as string
  product.value = await getProductById(id)
})
</script>

<style scoped>
.product-detail-page {
  min-height: 100%;
  background: #f5f5f5;
  padding-bottom: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 24px;
}

.product-main {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
}

.product-image {
  width: 100%;
  height: 300px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}

.detail-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 20px;
}

.image-placeholder {
  color: #ccc;
  font-size: 24px;
  font-weight: 500;
}

.product-brand {
  font-size: 14px;
  color: #1890ff;
  margin-bottom: 8px;
}

.product-model {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.product-tags {
  margin-bottom: 16px;
}

.product-tags :deep(.ant-tag) {
  margin-right: 8px;
}

.product-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
}

.product-sidebar {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.price-section {
  text-align: center;
}

.price-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.price-value {
  font-size: 32px;
  font-weight: 600;
  color: #ff4d4f;
  margin-bottom: 8px;
}

.stock-info {
  font-size: 14px;
  color: #666;
}

.inquiry-section {
  margin-top: 24px;
}

.quantity-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.quantity-input .label {
  font-size: 14px;
  color: #333;
}

.spec-section {
  grid-column: 1 / -1;
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  margin-top: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.not-found {
  background: #fff;
  border-radius: 8px;
  padding: 60px;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
  
  .product-sidebar {
    position: static;
  }
}
</style>
