<template>
  <el-container style="min-height: 100vh">
    <el-header style="display:flex;align-items:center;justify-content:space-between;background:#f5f7fa">
      <div style="font-weight:700">EmoVision Nutrition System</div>
      <el-space>
        <el-button text @click="$router.push('/dashboard')">Dashboard</el-button>
        <el-button text @click="$router.push('/admin/providers')">Providers</el-button>
        <el-button text @click="$router.push('/login')">Login</el-button>
      </el-space>
    </el-header>
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup lang="ts"></script>
