<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">登录</h1>
      <a-form
        :model="formState"
        @finish="handleSubmit"
      >
        <a-form-item name="email" :rules="[{ required: true, type: 'email', message: '请输入正确的邮箱' }]">
          <a-input v-model:value="formState.email" placeholder="邮箱" size="large">
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

      <div class="login-links">
        <a @click="showRegister = true">注册账号</a>
      </div>
    </div>

    <!-- 注册弹窗 -->
    <a-modal
      v-model:visible="showRegister"
      title="用户注册"
      :footer="null"
      @cancel="showRegister = false"
    >
      <a-form :model="registerState" @finish="handleRegister">
        <a-form-item name="email" :rules="[{ required: true, type: 'email', message: '请输入正确的邮箱' }]">
          <a-input v-model:value="registerState.email" placeholder="邮箱" />
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="registerState.password" placeholder="密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="registerLoading">
            注册
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { loginWithPassword, registerUser, parseJwt, tokenStorage } from '../api/auth'

const router = useRouter()
const loading = ref(false)
const showRegister = ref(false)
const registerLoading = ref(false)

const formState = reactive({
  email: '',
  password: ''
})

const registerState = reactive({
  email: '',
  password: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    const data = await loginWithPassword(formState.email, formState.password)

    // 保存 token
    tokenStorage.setTokens(data.access_token, data.refresh_token)

    // 解析 token 获取用户信息
    const payload = parseJwt(data.access_token)
    const user = {
      username: payload?.preferred_username || payload?.name || formState.email,
      email: formState.email,
      company: payload?.company || ''
    }
    localStorage.setItem('openfindbearings_user', JSON.stringify(user))

    message.success('登录成功')
    router.push('/user/profile')
  } catch (error: any) {
    console.error('登录失败:', error)
    message.error(error.response?.data?.error_description || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  registerLoading.value = true
  try {
    await registerUser({
      email: registerState.email,
      password: registerState.password
    })
    message.success('注册成功，请登录')
    showRegister.value = false
    // 填充登录表单
    formState.email = registerState.email
    formState.password = ''
  } catch (error: any) {
    console.error('注册失败:', error)
    message.error(error.response?.data?.errors?.[0]?.description || error.response?.data?.message || '注册失败')
  } finally {
    registerLoading.value = false
  }
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

.login-links {
  text-align: center;
  margin-top: 16px;
}

.login-links a {
  color: #1890ff;
  cursor: pointer;
}
</style>
