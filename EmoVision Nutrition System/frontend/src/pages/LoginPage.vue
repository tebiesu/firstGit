<template>
  <el-card style="max-width: 420px; margin: 40px auto">
    <template #header>登录</template>
    <el-form label-position="top" @submit.prevent>
      <el-form-item label="邮箱">
        <el-input v-model="form.email" placeholder="you@example.com" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-button type="primary" :loading="loading" @click="onLogin" style="width: 100%">登录</el-button>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

const form = reactive({
  email: 'admin@example.com',
  password: '123456'
})

const onLogin = async () => {
  loading.value = true
  try {
    await authStore.doLogin(form.email, form.password)
    ElMessage.success('登录成功')
    router.push('/dashboard')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>
