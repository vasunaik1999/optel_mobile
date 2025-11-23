<template>
  <q-page class="flex flex-center bg-gradient main-bg">
    <div class="insights-container">
      <q-card class="insights-card shadow-10" flat bordered>
        <!-- Header -->
        <q-card-section class="text-center q-pt-lg q-pb-md">
          <q-avatar size="80px" class="bg-gradient shadow-4">
            <q-icon name="psychology" size="48px" color="white" />
          </q-avatar>

          <div class="text-h5 text-weight-bold text-grey-9 q-mt-md">Painter AI Insights</div>

          <div class="text-body2 text-grey-6">Get smart recommendations for your painter</div>
        </q-card-section>

        <!-- Input -->
        <q-card-section>
          <q-input
            v-model="userId"
            type="number"
            outlined
            dense
            class="custom-input q-mb-md"
            placeholder="Enter Painter User ID"
            :rules="[(val) => !!val || 'User ID is required']"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="grey-6" />
            </template>
          </q-input>

          <q-btn
            color="primary"
            label="Generate Insights"
            class="full-width"
            rounded
            size="lg"
            :loading="loading"
            @click="getInsights"
          >
            <template v-slot:loading>
              <q-spinner-dots size="20px" />
            </template>
          </q-btn>
        </q-card-section>

        <!-- Loader -->
        <q-inner-loading :showing="loading">
          <q-spinner-gears size="60px" color="white" />
        </q-inner-loading>

        <!-- Insights Display -->
        <q-card-section v-if="insights" class="q-pt-none">
          <q-separator />

          <div class="q-mt-md">
            <div class="insight-item"><b>Summary:</b> {{ insights.summary }}</div>
            <div class="insight-item"><b>Suggestion:</b> {{ insights.suggestion }}</div>
            <div class="insight-item"><b>Action:</b> {{ insights.recommendedAction }}</div>
            <div class="insight-item"><b>Loyalty Level:</b> {{ insights.loyaltyLevel }}</div>
            <div class="insight-item">
              <b>Next Purchase:</b> {{ insights.nextPurchaseDays }} days
            </div>
            <div class="insight-item"><b>Motivation:</b> {{ insights.motivation }}</div>

            <q-linear-progress :value="insights.riskScore / 100" color="negative" class="q-mt-sm" />
            <div class="text-caption text-grey-7">Risk Score: {{ insights.riskScore }} / 100</div>

            <div class="text-caption text-grey-7 q-mt-xs">
              Confidence: {{ (insights.confidenceScore * 100).toFixed(0) }}%
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

export default {
  name: 'PainterInsightsPage',

  data() {
    return {
      userId: '',
      insights: null,
      loading: false,
    }
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  methods: {
    async getInsights() {
      if (!this.userId) {
        this.$q.notify({
          type: 'negative',
          message: 'User ID required',
        })
        return
      }

      this.loading = true
      this.insights = null

      try {
        const res = await axios.post(
          `${this.authStore.baseUrl}/verify/ai/insights`,
          { userId: this.userId },
          {
            headers: {
              Authorization: `Bearer ${this.authStore.token}`,
            },
          },
        )

        this.insights = res.data.insights

        this.$q.notify({
          type: 'positive',
          message: 'Insights loaded successfully',
          icon: 'check_circle',
        })
      } catch (err) {
        console.log(err)
        this.$q.notify({
          type: 'negative',
          message: err.response?.data?.message || 'AI failed',
          icon: 'error',
        })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.insights-container {
  width: 100%;
  max-width: 500px;
  padding: 20px;
}

.insights-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.insights-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

.insight-item {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}
</style>
