<template>
  <div class="app-shell">
    <header class="topbar page-enter">
      <div class="brand-block" @click="router.push('/dashboard')">
        <span class="brand-dot"></span>
        <div>
          <h1>EmoVision</h1>
          <p>Nutrition Intelligence Console</p>
        </div>
      </div>

      <nav class="nav-group">
        <button
          v-for="item in navItems"
          :key="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
          @click="router.push(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Providers', path: '/admin/providers' },
  { label: 'Login', path: '/login' }
]
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  padding: var(--space-5);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: 12px 18px;
  border: 1px solid rgba(217, 208, 193, 0.75);
  border-radius: var(--radius-lg);
  background: rgba(255, 253, 248, 0.78);
  backdrop-filter: blur(6px);
  box-shadow: var(--shadow-soft);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.brand-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  box-shadow: 0 0 0 6px rgba(27, 111, 106, 0.14);
}

.brand-block h1 {
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
  font-family: var(--font-display);
  letter-spacing: 0.3px;
}

.brand-block p {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  border: 1px solid transparent;
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  color: var(--color-text);
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item:hover {
  border-color: var(--color-border);
  background: rgba(27, 111, 106, 0.08);
}

.nav-item.active {
  border-color: rgba(27, 111, 106, 0.32);
  background: rgba(27, 111, 106, 0.12);
  color: var(--color-primary-strong);
  font-weight: 600;
}

.app-main {
  margin-top: var(--space-4);
}

@media (max-width: 900px) {
  .app-shell {
    padding: var(--space-3);
  }

  .topbar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-group {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .nav-item {
    text-align: center;
  }
}
</style>
