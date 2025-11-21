import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAuthStore = defineStore('authStore', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    baseUrl: LocalStorage.getItem('baseUrl') || 'http://192.168.1.9:3000',
    apiKey: LocalStorage.getItem('apiKey') || '',
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
  },
  actions: {
    login(user, token) {
      this.user = user
      this.token = token
      this.isAuthenticated = true
      LocalStorage.set('authToken', token)
      LocalStorage.set('authUser', user)
      LocalStorage.set('isAuthenticated', true)
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      LocalStorage.remove('authToken')
      LocalStorage.remove('authUser')
      LocalStorage.remove('isAuthenticated')
    },
    loadFromStorage() {
      this.baseUrl = LocalStorage.getItem('baseUrl') || this.baseUrl
      this.apiKey = LocalStorage.getItem('apiKey') || this.apiKey
      const token = LocalStorage.getItem('authToken')
      const user = LocalStorage.getItem('authUser')
      const isAuthenticated = LocalStorage.getItem('isAuthenticated')
      if (token && user) {
        this.token = token
        this.user = user
        this.isAuthenticated = isAuthenticated === 'true' // LocalStorage stores strings
      }
    },
  },
})
