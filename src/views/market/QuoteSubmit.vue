<template>
  <div class="quote-submit-page">
    <div class="container">
      <div class="page-header">
        <a-button @click="router.back()">返回</a-button>
        <h1 class="page-title">提交报价</h1>
        <a-button type="link" @click="router.push('/market/inquiries')">
          浏览更多询价单
        </a-button>
      </div>

      <a-spin :spinning="loading">
        <template v-if="inquiry">
          <!-- 询价单概要 -->
          <a-card class="inquiry-summary-card" title="询价单信息">
            <div class="summary-content">
              <div class="summary-item">
                <span class="label">询价单号：</span>
                <span class="value">{{ inquiry.id }}</span>
              </div>
              <div class="summary-item">
                <span class="label">发布企业：</span>
                <span class="value">{{ inquiry.buyerCompany }}</span>
              </div>
              <div class="summary-item">
                <span class="label">期望交期：</span>
                <span class="value">{{ inquiry.expectedDelivery || '-' }}</span>
              </div>
              <div class="summary-item">
                <span class="label">报价截止：</span>
                <span class="value">{{ formatDate(inquiry.expiresAt) }}</span>
              </div>
            </div>
          </a-card>

          <!-- 报价表单 -->
          <a-form
            :model="form"
            layout="vertical"
            class="quote-form"
            @finish="handleSubmit"
          >
            <!-- 产品报价 -->
            <a-card title="产品报价" class="products-card">
              <a-table
                :dataSource="inquiry.items"
                :columns="itemColumns"
                :pagination="false"
                rowKey="id"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'product'">
                    <div class="product-cell">
                      <div class="product-brand">{{ record.product.brand }}</div>
                      <div class="product-model">{{ record.product.model }}</div>
                    </div>
                  </template>
                  <template v-else-if="column.key === 'spec'">
                    {{ record.product.innerDiameter }}×{{ record.product.outerDiameter }}×{{ record.product.width }}mm
                  </template>
                  <template v-else-if="column.key === 'unitPrice'">
                    <a-form-item
                      :name="['items', record.id, 'unitPrice']"
                      :rules="[{ required: true, message: '请输入单价' }]"
                      style="margin-bottom: 0"
                    >
                      <a-input-number
                        v-model:value="form.items[record.id].unitPrice"
                        :min="0.01"
                        :precision="2"
                        style="width: 120px"
                        addon-before="¥"
                        @change="calculateSubtotal(record.id, record.quantity)"
                      />
                    </a-form-item>
                  </template>
                  <template v-else-if="column.key === 'subtotal'">
                    <span class="subtotal">
                      ¥{{ form.items[record.id]?.subtotal?.toLocaleString() || 0 }}
                    </span>
                  </template>
                  <template v-else-if="column.key === 'remark'">
                    <a-input
                      v-model:value="form.items[record.id].remark"
                      placeholder="备注（可选）"
                    />
                  </template>
                </template>
              </a-table>

              <div class="total-section">
                <div class="total-row">
                  <span class="label">报价总额：</span>
                  <span class="value">¥{{ totalAmount.toLocaleString() }}</span>
                </div>
              </div>
            </a-card>

            <!-- 报价条件 -->
            <a-card title="报价条件" class="conditions-card">
              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item
                    label="报价有效期"
                    name="validUntil"
                    :rules="[{ required: true, message: '请选择报价有效期' }]"
                  >
                    <a-date-picker
                      v-model:value="form.validUntil"
                      style="width: 100%"
                      :disabledDate="disabledDate"
                      showTime
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    label="交货周期（天）"
                    name="deliveryDays"
                    :rules="[{ required: true, message: '请输入交货周期' }]"
                  >
                    <a-input-number
                      v-model:value="form.deliveryDays"
                      :min="1"
                      :max="365"
                      style="width: 100%"
                      addon-after="天"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="24">
                <a-col :span="12">
                  <a-form-item
                    label="付款条款"
                    name="paymentTerms"
                  >
                    <a-select
                      v-model:value="form.paymentTerms"
                      placeholder="选择付款条款"
                      allowClear
                    >
                      <a-select-option value="款到发货">款到发货</a-select-option>
                      <a-select-option value="货到付款">货到付款</a-select-option>
                      <a-select-option value="月结30天">月结30天</a-select-option>
                      <a-select-option value="月结60天">月结60天</a-select-option>
                      <a-select-option value="月结90天">月结90天</a-select-option>
                    </a-select>
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item
                    label="联系人"
                    name="contactName"
                  >
                    <a-input
                      v-model:value="form.contactName"
                      placeholder="请输入联系人姓名"
                    />
                  </a-form-item>
                </a-col>
              </a-row>

              <a-form-item
                label="报价备注"
                name="remark"
              >
                <a-textarea
                  v-model:value="form.remark"
                  :rows="3"
                  placeholder="请输入备注信息（如特殊说明、优惠政策等）"
                />
              </a-form-item>
            </a-card>

            <!-- 提交按钮 -->
            <div class="submit-section">
              <a-button
                type="primary"
                size="large"
                html-type="submit"
                :loading="submitting"
              >
                提交报价
              </a-button>
              <a-button size="large" @click="router.back()">
                取消
              </a-button>
            </div>
          </a-form>
        </template>

        <a-result
          v-else-if="!loading"
          status="404"
          title="询价单不存在"
          sub-title="抱歉，您访问的询价单不存在或已停止接收报价"
        >
          <template #extra>
            <a-button type="primary" @click="router.push('/market/inquiries')">
              返回市场
            </a-button>
          </template>
        </a-result>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { marketApi, quoteApi } from '../../api'
import type { Inquiry } from '../../types/inquiry'

const router = useRouter()
const route = useRoute()

const inquiry = ref<Inquiry | null>(null)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  items: {} as Record<string, {
    inquiryItemId: string
    unitPrice: number | null
    subtotal: number
    remark: string
  }>,
  validUntil: null as dayjs.Dayjs | null,
  deliveryDays: 7,
  paymentTerms: undefined as string | undefined,
  contactName: '',
  remark: '',
})

const itemColumns = [
  { title: '产品信息', key: 'product', width: '25%' },
  { title: '规格', key: 'spec', width: '20%' },
  { title: '数量', dataIndex: 'quantity', width: '12%' },
  { title: '单价', key: 'unitPrice', width: '18%' },
  { title: '小计', key: 'subtotal', width: '15%' },
  { title: '备注', key: 'remark', width: '10%' },
]

const totalAmount = computed(() => {
  return Object.values(form.value.items).reduce((sum, item) => sum + (item.subtotal || 0), 0)
})

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current < dayjs().endOf('day')
}

const loadInquiry = async () => {
  const id = route.params.id as string
  if (!id) return

  loading.value = true
  try {
    const result = await marketApi.getMarketInquiry(id)
    inquiry.value = result

    // 初始化表单
    const items: Record<string, any> = {}
    result.items.forEach((item: { id: string }) => {
      items[item.id] = {
        inquiryItemId: item.id,
        unitPrice: null,
        subtotal: 0,
        remark: '',
      }
    })
    form.value.items = items

    // 设置默认有效期（7天后）
    form.value.validUntil = dayjs().add(7, 'day')
  } catch (error: any) {
    message.error(error.message || '加载失败')
    inquiry.value = null
  } finally {
    loading.value = false
  }
}

const calculateSubtotal = (itemId: string, quantity: number) => {
  const item = form.value.items[itemId]
  if (item && item.unitPrice) {
    item.subtotal = item.unitPrice * quantity
  }
}

const handleSubmit = async () => {
  if (!inquiry.value) return

  // 验证所有产品都填写了单价
  const items = Object.values(form.value.items)
  const invalidItems = items.filter(item => !item.unitPrice || item.unitPrice <= 0)
  if (invalidItems.length > 0) {
    message.error('请为所有产品填写有效的单价')
    return
  }

  submitting.value = true
  try {
    await quoteApi.submitQuote({
      inquiryId: inquiry.value.id,
      validUntil: form.value.validUntil!.toISOString(),
      deliveryDays: form.value.deliveryDays,
      paymentTerms: form.value.paymentTerms,
      remark: form.value.remark,
      items: items.map(item => ({
        inquiryItemId: item.inquiryItemId,
        unitPrice: item.unitPrice!,
        remark: item.remark,
      })),
    })

    message.success('报价提交成功！')
    router.push('/user/quotes')
  } catch (error: any) {
    message.error(error.message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadInquiry()
})
</script>

<style scoped>
.quote-submit-page {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.inquiry-summary-card,
.products-card,
.conditions-card {
  margin-bottom: 16px;
  border-radius: 8px;
}

.summary-content {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
}

.summary-item .label {
  color: #666;
  margin-right: 8px;
}

.summary-item .value {
  font-weight: 500;
}

.product-cell .product-brand {
  font-size: 12px;
  color: #1890ff;
  margin-bottom: 4px;
}

.product-cell .product-model {
  font-size: 14px;
  font-weight: 500;
}

.subtotal {
  font-weight: 600;
  color: #ff4d4f;
}

.total-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
}

.total-row .label {
  font-size: 16px;
  color: #666;
}

.total-row .value {
  font-size: 24px;
  font-weight: 600;
  color: #ff4d4f;
  margin-left: 12px;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}
</style>
