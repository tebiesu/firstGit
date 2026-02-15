import { createRouter, createWebHistory } from 'vue-router'

import AdminProvidersPage from './pages/AdminProvidersPage.vue'
import DashboardPage from './pages/DashboardPage.vue'
import LoginPage from './pages/LoginPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/dashboard' },
    { path: '/login', component: LoginPage },
    { path: '/dashboard', component: DashboardPage },
    { path: '/admin/providers', component: AdminProvidersPage }
  ]
})

export default router
