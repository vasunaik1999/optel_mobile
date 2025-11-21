<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h6 q-mb-md">Redeem Commission Points</div>

        <div class="q-mb-md"><strong>Pending Points:</strong> {{ pendingPoints }}</div>

        <q-input
          v-model.number="pointsToRedeem"
          label="Points to Redeem"
          type="number"
          outlined
          dense
        />

        <q-btn
          label="Redeem"
          color="primary"
          class="q-mt-md"
          :loading="loading"
          @click="handleRedeem"
        />

        <q-banner
          v-if="message"
          class="q-mt-md"
          :color="success ? 'green' : 'red'"
          text-color="white"
        >
          {{ message }}
        </q-banner>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useAuthStore } from 'src/stores/authStore'
import axios from 'axios'

export default {
  name: 'RedeemPage',
  data() {
    return {
      pendingPoints: 0,
      pointsToRedeem: 0,
      message: '',
      success: false,
      loading: false,
      authStore: useAuthStore(),
    }
  },
  methods: {
    async fetchPending() {
      try {
        const res = await axios.get(
          `${this.authStore.baseUrl}/verify/users/${this.authStore.user.id}/commission/pending`,
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        )
        this.pendingPoints = res.data.pendingCommission
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.response?.data?.message || err.message,
        })
      }
    },
    async handleRedeem() {
      if (!this.pointsToRedeem || this.pointsToRedeem <= 0) {
        this.$q.notify({ type: 'negative', message: 'Enter valid points to redeem' })
        return
      }

      if (this.pointsToRedeem > this.pendingPoints) {
        this.$q.notify({ type: 'negative', message: 'Cannot redeem more than pending points' })
        return
      }

      this.loading = true
      this.message = ''
      this.success = false

      try {
        const res = await axios.post(
          `${this.authStore.baseUrl}/verify/users/${this.authStore.user.id}/commission/redeem`,
          { pointsToRedeem: this.pointsToRedeem },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        )

        if (res.data.success) {
          this.message = `Redeemed successfully: ${res.data.redeemedAmount} points`
          this.success = true
          this.pendingPoints -= this.pointsToRedeem
          this.pointsToRedeem = 0
        } else {
          this.message = res.data.message
        }
      } catch (err) {
        this.message = err.response?.data?.message || err.message
        this.success = false
      } finally {
        this.loading = false
      }
    },
  },
  mounted() {
    this.fetchPending()
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}
</style>
