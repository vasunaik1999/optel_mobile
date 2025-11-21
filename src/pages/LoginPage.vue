<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-md" style="width: 350px">
      <q-card-section>
        <div class="text-h6 q-mb-md">Painter Login</div>

        <q-input v-model="userId" label="User ID" type="number" outlined dense />
        <q-input
          v-model="password"
          label="Password"
          type="password"
          outlined
          dense
          class="q-mt-sm"
        />

        <q-btn
          label="Login"
          color="primary"
          class="q-mt-md"
          @click="handleLogin"
          :loading="loading"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useAuthStore } from 'src/stores/authStore'
import axios from 'axios'

const authStore = useAuthStore()

export default {
  name: 'LoginPage',
  data() {
    return {
      userId: '',
      password: '',
      loading: false,
      authStore,
    }
  },
  methods: {
    async handleLogin() {
      if (!this.userId || !this.password) {
        this.$q.notify({
          type: 'negative',
          message: 'User ID and password are required',
        })
        return
      }

      this.loading = true
      // const baseUrl = 'http://192.168.1.9:3000' // replace with your PC IP or emulator 10.0.2.2

      try {
        const res = await axios.post(`${this.authStore.baseUrl}/verify/login`, {
          userId: this.userId,
          password: this.password,
        })

        if (res.data.success) {
          this.authStore.login(res.data.user, res.data.token)
          this.$q.notify({
            type: 'positive',
            message: `Welcome, ${res.data.user.name}!`,
          })
          this.$router.push('/home')
        } else {
          this.$q.notify({
            type: 'negative',
            message: res.data.message || 'Login failed',
          })
        }
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.response?.data?.message || err.message || 'Network error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}
</style>
