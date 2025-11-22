<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6 q-mb-md">Mark Product as Bought</div>

        <!-- Input for Serial Number -->
        <q-input v-model="serialNumber" label="Serial Number" outlined dense class="q-mb-sm" />

        <!-- Buttons -->
        <div class="q-mb-sm">
          <q-btn
            label="Verify"
            color="primary"
            class="q-mb-sm full-width"
            @click="verifySerial"
            :loading="loading"
            :disable="!serialNumber || loading || verifiedSerial"
          />
          <q-btn
            label="Mark as Bought"
            color="secondary"
            class="full-width"
            @click="markAsBought"
            :disable="!verifiedSerial"
          />
        </div>

        <!-- Display messages -->
        <q-banner
          v-if="message"
          :color="messageType === 'success' ? 'green' : 'red'"
          class="q-mt-sm"
          text-color="white"
        >
          {{ message }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { LocalStorage, Notify } from 'quasar'
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

export default {
  name: 'MarkBoughtPage',
  data() {
    return {
      serialNumber: '',
      verifiedSerial: false,
      message: '',
      messageType: '',
      loading: false,
      authStore: useAuthStore(),
      consumedSerials: LocalStorage.getItem('consumedSerials') || [],
    }
  },
  watch: {
    serialNumber(newVal, oldVal) {
      // Reset verification state if input changes
      if (newVal !== oldVal) {
        this.verifiedSerial = false
        this.message = ''
        this.messageType = ''
      }
    },
  },
  async mounted() {
    // Check if a serial is passed via query param
    const serialFromScan = this.$route.query.serial
    if (serialFromScan) {
      this.serialNumber = serialFromScan
      await this.verifySerial() // automatically verify
    }
  },
  methods: {
    async verifySerial() {
      if (!this.serialNumber) {
        Notify.create({ type: 'negative', message: 'Please enter a serial number' })
        return
      }

      // Check if already consumed locally
      if (this.consumedSerials.includes(this.serialNumber)) {
        this.message = 'Serial already marked as bought locally'
        this.messageType = 'negative'
        return
      }

      this.loading = true
      try {
        const res = await axios.get(
          `${this.authStore.baseUrl}/verify/serial-numbers/${this.serialNumber}`,
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`,
            },
          },
        )

        if (res.data.exists) {
          this.verifiedSerial = true
          this.message = `Serial verified successfully! MRP: ${res.data.mrp ?? 'N/A'}`
          this.messageType = 'success'
        } else {
          this.verifiedSerial = false
          this.message = 'Serial not found in backend'
          this.messageType = 'negative'
        }
      } catch (err) {
        this.verifiedSerial = false
        this.message = err.response?.data?.message || 'Verification failed'
        this.messageType = 'negative'
      } finally {
        this.loading = false
      }
    },
    async markAsBought() {
      if (!this.verifiedSerial) return

      try {
        const res = await axios.post(
          `${this.authStore.baseUrl}/verify/consume`,
          {
            serialNumber: this.serialNumber,
            userId: this.authStore.user.id,
          },
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`,
            },
          },
        )

        if (res.data.success) {
          // Store locally
          this.consumedSerials.push(this.serialNumber)
          LocalStorage.set('consumedSerials', this.consumedSerials)

          this.message = 'Marked as bought successfully!'
          this.messageType = 'success'
          this.serialNumber = ''
          this.verifiedSerial = false
        } else {
          this.message = res.data.message || 'Failed to mark as bought'
          this.messageType = 'negative'
        }
      } catch (err) {
        this.message = err.response?.data?.message || 'Error marking as bought'
        this.messageType = 'negative'
      }
    },
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}
.full-width {
  width: 100%;
}
</style>
