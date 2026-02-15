<template>
  <section class="providers page-enter">
    <el-row :gutter="18">
      <el-col :xs="24" :xl="9">
        <el-card class="page-card form-card">
          <template #header>
            <div class="card-head">
              <h3>新增 Provider</h3>
              <span>统一配置接入策略与模型映射</span>
            </div>
          </template>

          <el-form label-position="top">
            <el-form-item label="类型">
              <el-select v-model="form.provider_type" @change="onProviderTypeChange" style="width: 100%">
                <el-option label="OpenAI Compatible" value="openai_compatible" />
                <el-option label="New API" value="new_api" />
                <el-option label="Gemini" value="gemini" />
                <el-option label="Claude" value="claude" />
              </el-select>
            </el-form-item>

            <el-form-item label="名称">
              <el-input v-model="form.name" placeholder="例如: openai-main" />
            </el-form-item>

            <el-form-item label="Base URL">
              <el-input v-model="form.base_url" placeholder="https://..." />
            </el-form-item>

            <el-form-item label="API Key">
              <el-input v-model="form.api_key" type="password" show-password />
            </el-form-item>

            <el-form-item label="优先级">
              <el-input-number v-model="form.priority" :min="1" :max="9999" />
            </el-form-item>

            <el-form-item label="任务模型映射(model_map)">
              <el-input
                v-model="modelMapText"
                type="textarea"
                :rows="8"
                placeholder='{"default":"...","emotion":"...","vision":"...","recommend":"..."}'
              />
            </el-form-item>

            <div class="action-row">
              <el-button class="action-btn" type="primary" :loading="creating" @click="onCreate">创建</el-button>
              <el-button class="action-btn" @click="fillTemplate">套用推荐模板</el-button>
            </div>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :xl="15">
        <el-card class="page-card list-card">
          <template #header>
            <div class="table-head">
              <div>
                <h3>Provider 配置列表</h3>
                <span>当前已接入模型服务与状态</span>
              </div>
              <el-button type="primary" :loading="loading" @click="loadProviders">刷新</el-button>
            </div>
          </template>

          <el-table :data="providers" border stripe class="provider-table" :header-cell-style="headerCellStyle">
            <el-table-column prop="id" label="ID" width="80" />
            <el-table-column prop="name" label="名称" min-width="160" />
            <el-table-column prop="provider_type" label="类型" min-width="140" />
            <el-table-column prop="priority" label="优先级" width="96" />
            <el-table-column label="状态" width="96">
              <template #default="scope">
                <el-tag :type="scope.row.enabled ? 'success' : 'info'" effect="light">
                  {{ scope.row.enabled ? '启用' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="base_url" label="Base URL" show-overflow-tooltip min-width="240" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="scope">
                <el-button link type="primary" @click="onTest(scope.row.id)">测试</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { createProvider, getProviderTemplates, getProviders, testProvider } from '../api'

type ProviderType = 'openai_compatible' | 'new_api' | 'gemini' | 'claude'

const loading = ref(false)
const creating = ref(false)
const providers = ref<any[]>([])
const templates = ref<Record<string, Record<string, string>>>({})

const headerCellStyle = {
  background: '#f3eee3',
  color: '#3c3428',
  fontWeight: 600
}

const form = reactive({
  provider_type: 'openai_compatible' as ProviderType,
  name: '',
  base_url: '',
  api_key: '',
  priority: 100,
  enabled: true
})

const modelMapText = ref('{\n  "default": "",\n  "emotion": "",\n  "vision": "",\n  "recommend": ""\n}')

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

const loadTemplates = async () => {
  try {
    const data = await getProviderTemplates()
    templates.value = Object.fromEntries(data.map((item: any) => [item.provider_type, item.recommended_model_map]))
    fillTemplate()
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '模板加载失败')
  }
}

const fillTemplate = () => {
  const tpl = templates.value[form.provider_type]
  if (!tpl) return
  modelMapText.value = JSON.stringify(tpl, null, 2)
}

const onProviderTypeChange = () => {
  fillTemplate()
}

const onCreate = async () => {
  creating.value = true
  try {
    const model_map = JSON.parse(modelMapText.value)
    await createProvider({
      provider_type: form.provider_type,
      name: form.name,
      base_url: form.base_url,
      api_key: form.api_key,
      priority: form.priority,
      enabled: form.enabled,
      model_map
    })
    ElMessage.success('创建成功')
    form.name = ''
    form.base_url = ''
    form.api_key = ''
    await loadProviders()
  } catch (error: any) {
    if (error instanceof SyntaxError) {
      ElMessage.error('model_map JSON 格式错误')
    } else {
      ElMessage.error(error?.response?.data?.detail || '创建失败')
    }
  } finally {
    creating.value = false
  }
}

const onTest = async (providerId: number) => {
  try {
    const result = await testProvider(providerId)
    if (result.ok) {
      ElMessage.success(`Provider ${providerId} 可用: ${result.detail}`)
    } else {
      ElMessage.warning(`Provider ${providerId} 不可用: ${result.detail}`)
    }
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '测试失败')
  }
}

onMounted(async () => {
  await Promise.all([loadProviders(), loadTemplates()])
})
</script>

<style scoped>
.providers {
  animation-delay: 0.08s;
}

.card-head h3,
.table-head h3 {
  margin: 0;
  font-size: 22px;
  font-family: var(--font-display);
}

.card-head span,
.table-head span {
  margin-top: 4px;
  display: inline-block;
  font-size: 13px;
  color: var(--color-text-muted);
}

.table-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.action-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.action-btn {
  width: 100%;
  border-radius: 12px;
}

.provider-table :deep(.el-table__cell) {
  padding: 11px 0;
}

.provider-table :deep(.el-button.is-link) {
  font-weight: 600;
}

@media (max-width: 1280px) {
  .form-card {
    margin-bottom: 14px;
  }
}

@media (max-width: 640px) {
  .table-head {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
