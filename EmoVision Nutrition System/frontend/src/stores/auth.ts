import { defineStore } from 'pinia'

import * as api from '../api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    profile: null as any
  }),
  actions: {
    async doLogin(email: string, password: string) {
      const data = await api.login(email, password)
      this.token = data.access_token
      localStorage.setItem('token', this.token)
      await this.fetchProfile()
    },
    async fetchProfile() {
      this.profile = await api.getProfile()
    },
    logout() {
      this.token = ''
      this.profile = null
      localStorage.removeItem('token')
    }
  }
})
