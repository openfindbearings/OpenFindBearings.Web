<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">登录</h1>
      <a-form
        :model="formState"
        @finish="handleSubmit"
      >
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="formState.username" placeholder="用户名" size="large">
            <template #prefix>
              <UserOutlined />
            </template>
          </a-input>
        </a-form-item>
        
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="formState.password" placeholder="密码" size="large">
            <template #prefix>
              <LockOutlined />
            </template>
          </a-input-password>
        </a-form-item>
        
        <a-form-item>
          <a-button type="primary" html-type="submit" size="large" block :loading="loading">
            登录
          </a-button>
        </a-form-item>
      </a-form>
      <div class="login-tip">
        <span>提示：输入任意用户名和密码即可登录</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const loading = ref(false)

const formState = reactive({
  username: '',
  password: ''
})

const handleSubmit = () => {
  loading.value = true
  setTimeout(() => {
    localStorage.setItem('openfindbearings_user', JSON.stringify({
      username: formState.username,
      company: '示例公司'
    }))
    message.success('登录成功')
    loading.value = false
    router.push('/user/profile')
  }, 500)
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.login-card {
  background: #fff;
  border-radius: 8px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.login-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32px;
  color: #333;
}

.login-tip {
  text-align: center;
  color: #999;
  font-size: 13px;
  margin-top: 16px;
}
</style>
