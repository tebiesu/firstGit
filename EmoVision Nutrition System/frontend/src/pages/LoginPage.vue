<template>
  <section class="login-wrap page-enter">
    <div class="login-shell page-card">
      <aside class="brand-side">
        <p class="eyebrow">EMOVISION SYSTEM</p>
        <h2>情绪驱动的营养决策中枢</h2>
        <p class="intro">统一接入情绪识别、图像分析和推荐引擎，在同一控制台完成分析、回溯和管理。</p>
        <ul>
          <li>多模态餐食输入</li>
          <li>结构化洞察输出</li>
          <li>Provider 灵活切换</li>
        </ul>
      </aside>

      <div class="form-side">
        <div class="form-head">
          <h3>欢迎登录</h3>
          <p>使用管理账号进入工作台</p>
        </div>

        <el-form label-position="top" @submit.prevent>
          <el-form-item label="邮箱">
            <el-input v-model="form.email" placeholder="you@example.com" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password />
          </el-form-item>
          <el-button class="submit-btn" type="primary" :loading="loading" @click="onLogin">登录</el-button>
        </el-form>
      </div>
    </div>
  </section>
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

<style scoped>
.login-wrap {
  min-height: calc(100vh - 160px);
  display: grid;
  place-items: center;
  padding: var(--space-4);
}

.login-shell {
  width: min(980px, 100%);
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  overflow: hidden;
}

.brand-side {
  padding: 34px;
  color: #f5f3ec;
  background:
    linear-gradient(150deg, rgba(15, 75, 70, 0.96), rgba(18, 54, 80, 0.95)),
    radial-gradient(circle at 20% 20%, rgba(255, 206, 144, 0.22), transparent 45%);
}

.eyebrow {
  margin: 0;
  letter-spacing: 1.4px;
  font-size: 12px;
  opacity: 0.85;
}

.brand-side h2 {
  margin: 14px 0;
  font-size: 34px;
  line-height: 1.2;
  font-family: var(--font-display);
}

.intro {
  margin: 0;
  color: rgba(245, 243, 236, 0.88);
  line-height: 1.7;
}

.brand-side ul {
  margin: 24px 0 0;
  padding-left: 18px;
  color: rgba(245, 243, 236, 0.86);
  line-height: 1.9;
}

.form-side {
  padding: 34px;
  background: var(--color-bg-elevated);
}

.form-head h3 {
  margin: 0;
  font-size: 28px;
  font-family: var(--font-display);
}

.form-head p {
  margin: 8px 0 22px;
  color: var(--color-text-muted);
}

.submit-btn {
  width: 100%;
  height: 42px;
  border-radius: 12px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.submit-btn:active {
  transform: scale(0.98);
}

@media (max-width: 860px) {
  .login-wrap {
    min-height: auto;
    padding: 0;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }

  .brand-side,
  .form-side {
    padding: 24px;
  }

  .brand-side h2 {
    font-size: 26px;
  }
}
</style>
