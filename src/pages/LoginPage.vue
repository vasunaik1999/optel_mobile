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
      <q-banner v-if="error" class="q-mt-md" color="red-4" text-color="white">{{ error }}</q-banner>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores/authStore'
import axios from 'axios'

export default {
  name: 'LoginPage',
  setup() {
    const userId = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const router = useRouter()
    const auth = useAuthStore()

    const handleLogin = async () => {
      error.value = ''
      if (!userId.value || !password.value) {
        error.value = 'User ID and password are required'
        return
      }

      loading.value = true
      const baseUrl = 'http://192.168.1.9:3000'

      try {
        const res = await axios.post(`${baseUrl}/verify/login`, {
          userId: userId.value,
          password: password.value,
        })

        if (res.data.success) {
          // Store in authStore
          auth.login(res.data.user, res.data.token)
          router.push('/home') // navigate to home page
        } else {
          error.value = res.data.message
        }
      } catch (err) {
        error.value = err.response?.data?.message || err.message
      } finally {
        loading.value = false
      }
    }

    return { userId, password, error, loading, handleLogin }
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}
</style>
