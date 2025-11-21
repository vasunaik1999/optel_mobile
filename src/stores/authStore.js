import { defineStore } from 'pinia'
import { LocalStorage } from 'quasar'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
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
    },
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      LocalStorage.remove('authToken')
      LocalStorage.remove('authUser')
    },
    loadFromStorage() {
      const token = LocalStorage.getItem('authToken')
      const user = LocalStorage.getItem('authUser')
      if (token && user) {
        this.token = token
        this.user = user
      }
    },
  },
})
