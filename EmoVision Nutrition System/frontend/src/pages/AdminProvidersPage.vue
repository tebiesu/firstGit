<template>
  <el-card>
    <template #header>Provider 配置列表</template>
    <el-button type="primary" @click="loadProviders" :loading="loading">刷新</el-button>
    <el-table :data="providers" style="margin-top: 12px" border>
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="名称" />
      <el-table-column prop="provider_type" label="类型" width="180" />
      <el-table-column prop="base_url" label="Base URL" />
      <el-table-column prop="priority" label="优先级" width="100" />
      <el-table-column prop="enabled" label="启用" width="100" />
    </el-table>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { getProviders } from '../api'

const loading = ref(false)
const providers = ref<any[]>([])

const loadProviders = async () => {
  loading.value = true
  try {
    providers.value = await getProviders()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadProviders)
</script>
