<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6 q-mb-md">Backend Configuration</div>

        <q-input v-model="baseUrl" label="Backend URL" outlined dense />

        <q-input v-model="apiKey" label="API Key (optional)" outlined dense class="q-mt-sm" />

        <q-btn label="Save" color="primary" class="q-mt-md" @click="saveConfig" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { LocalStorage, Notify } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()
export default {
  name: 'SettingsPage',
  data() {
    return {
      authStore,
      baseUrl: '', // default value
      apiKey: '',
    }
  },
  mounted() {
    // Load stored values if present
    this.baseUrl = this.authStore.baseUrl
    this.apiKey = this.authStore.apiKey || ''
  },
  methods: {
    saveConfig() {
      this.authStore.baseUrl = this.baseUrl
      this.authStore.apiKey = this.apiKey

      // Persist locally
      LocalStorage.set('baseUrl', this.baseUrl)
      LocalStorage.set('apiKey', this.apiKey)

      Notify.create({
        type: 'positive',
        message: 'Configuration saved successfully!',
      })
    },
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}
</style>
