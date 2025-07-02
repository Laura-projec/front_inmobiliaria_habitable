import { defineStore } from 'pinia'
import { fetchPermissions } from '@/views/js/permissions'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    permissions: [],
  }),
  actions: {
    async loadPermissions() {
      this.permissions = await fetchPermissions()
    },
  },
})
