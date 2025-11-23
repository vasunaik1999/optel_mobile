<template>
  <q-page class="insights-page">
    <!-- Animated Background -->
    <div class="animated-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="page-content">
      <div class="insights-container">
        <!-- Main Card -->
        <q-card flat bordered class="insights-card">
          <!-- Header Section -->
          <q-card-section class="header-section">
            <div class="icon-container">
              <div class="icon-wrapper">
                <q-icon name="psychology" size="56px" color="white" />
              </div>
              <div class="icon-pulse" style="margin-top: -72px"></div>
            </div>

            <div class="text-h4 text-weight-bold text-grey-9 q-mt-lg">Painter AI Insights</div>
            <div class="text-body1 text-grey-6 q-mt-sm">
              Get intelligent recommendations powered by AI
            </div>
          </q-card-section>

          <!-- Input Section -->
          <q-card-section class="input-section">
            <div class="input-label text-weight-medium text-grey-8 q-mb-sm">
              <q-icon name="badge" size="18px" class="q-mr-xs" />
              Painter User ID
            </div>

            <q-input
              v-model="userId"
              type="number"
              outlined
              class="custom-input"
              placeholder="Enter user ID (e.g., 123)"
              :rules="[(val) => !!val || 'User ID is required']"
            >
              <template v-slot:prepend>
                <q-icon name="person" color="primary" />
              </template>
              <template v-slot:append v-if="userId">
                <q-icon name="clear" color="grey-6" class="cursor-pointer" @click="userId = ''" />
              </template>
            </q-input>

            <q-btn
              unelevated
              rounded
              no-caps
              color="primary"
              class="generate-btn q-mt-lg"
              :loading="loading"
              @click="getInsights"
              :disable="!userId"
            >
              <div class="button-content">
                <q-icon name="auto_awesome" size="24px" class="q-mr-sm" />
                <span class="text-weight-bold">Generate Insights</span>
              </div>
              <template v-slot:loading>
                <q-spinner-dots size="28px" />
              </template>
            </q-btn>
          </q-card-section>

          <!-- Loading State -->
          <transition name="fade">
            <div v-if="loading" class="loading-section">
              <q-spinner-gears size="80px" color="primary" />
              <div class="text-h6 text-weight-medium text-grey-8 q-mt-lg">
                Analyzing Painter Data
              </div>
              <div class="text-body2 text-grey-6 q-mt-sm">AI is processing insights...</div>
            </div>
          </transition>

          <!-- Insights Display -->
          <transition name="slide-up">
            <q-card-section v-if="insights && !loading" class="insights-section">
              <q-separator class="q-mb-lg" />

              <!-- Summary Card -->
              <div class="insight-card summary-card">
                <div class="card-header">
                  <q-icon name="summarize" size="24px" color="primary" />
                  <span class="card-title">Summary</span>
                </div>
                <div class="card-content">
                  {{ insights.summary }}
                </div>
              </div>

              <!-- Metrics Grid -->
              <div class="metrics-grid q-mt-md">
                <!-- Loyalty Level -->
                <div class="metric-card">
                  <div class="metric-icon-wrapper purchase-icon">
                    <q-icon name="emoji_events" size="28px" />
                  </div>
                  <div class="metric-details">
                    <div class="metric-label">Loyalty Level</div>
                    <div class="metric-value">{{ insights.loyaltyLevel }}</div>
                  </div>
                </div>

                <!-- Next Purchase -->
                <div class="metric-card">
                  <div class="metric-icon-wrapper purchase-icon">
                    <q-icon name="shopping_bag" size="28px" />
                  </div>
                  <div class="metric-details">
                    <div class="metric-label">Next Purchase</div>
                    <div class="metric-value">{{ insights.nextPurchaseDays }} days</div>
                  </div>
                </div>

                <!-- Risk Score -->
                <div class="metric-card">
                  <div class="metric-icon-wrapper purchase-icon">
                    <q-icon name="warning" size="28px" />
                  </div>
                  <div class="metric-details">
                    <div class="metric-label">Risk Score</div>
                    <div class="metric-value">{{ insights.riskScore }}/100</div>
                  </div>
                </div>

                <!-- Confidence -->
                <div class="metric-card">
                  <div class="metric-icon-wrapper purchase-icon">
                    <q-icon name="analytics" size="28px" />
                  </div>
                  <div class="metric-details">
                    <div class="metric-label">Confidence</div>
                    <div class="metric-value">
                      {{ (insights.confidenceScore * 100).toFixed(0) }}%
                    </div>
                  </div>
                </div>
              </div>

              <!-- Risk Progress Bar -->
              <div class="risk-meter q-mt-lg">
                <div class="row items-center justify-between q-mb-sm">
                  <span class="text-caption text-weight-medium text-grey-7"> Risk Assessment </span>
                  <span class="text-caption text-weight-bold" :class="getRiskColor()">
                    {{ getRiskLabel() }}
                  </span>
                </div>
                <q-linear-progress
                  :value="insights.riskScore / 100"
                  :color="getRiskProgressColor()"
                  rounded
                  size="12px"
                  class="risk-progress"
                />
              </div>

              <!-- Suggestion Card -->
              <div class="insight-card suggestion-card q-mt-md">
                <div class="card-header">
                  <q-icon name="lightbulb" size="24px" color="orange" />
                  <span class="card-title">Suggestion</span>
                </div>
                <div class="card-content">
                  {{ insights.suggestion }}
                </div>
              </div>

              <!-- Action Card -->
              <div class="insight-card action-card q-mt-md">
                <div class="card-header">
                  <q-icon name="task_alt" size="24px" color="positive" />
                  <span class="card-title">Recommended Action</span>
                </div>
                <div class="card-content">
                  {{ insights.recommendedAction }}
                </div>
              </div>

              <!-- Motivation Card -->
              <div class="insight-card motivation-card q-mt-md">
                <div class="card-header">
                  <q-icon name="volunteer_activism" size="24px" color="deep-purple" />
                  <span class="card-title">Motivation</span>
                </div>
                <div class="card-content">
                  {{ insights.motivation }}
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons q-mt-lg">
                <q-btn
                  flat
                  rounded
                  no-caps
                  color="grey-7"
                  label="Generate Again"
                  icon="refresh"
                  @click="getInsights"
                  class="action-btn"
                />
                <q-btn
                  unelevated
                  rounded
                  no-caps
                  color="primary"
                  label="Export Report"
                  icon="download"
                  class="action-btn"
                  @click="showComingSoonNotify('Export Reports')"
                />
              </div>
            </q-card-section>
          </transition>
        </q-card>
      </div>
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
    getRiskLabel() {
      const score = this.insights?.riskScore || 0
      if (score < 30) return 'Low Risk'
      if (score < 70) return 'Medium Risk'
      return 'High Risk'
    },

    getRiskColor() {
      const score = this.insights?.riskScore || 0
      if (score < 30) return 'text-positive'
      if (score < 70) return 'text-warning'
      return 'text-negative'
    },

    getRiskProgressColor() {
      const score = this.insights?.riskScore || 0
      if (score < 30) return 'positive'
      if (score < 70) return 'warning'
      return 'negative'
    },

    async getInsights() {
      if (!this.userId) {
        this.$q.notify({
          type: 'negative',
          message: 'Please enter a User ID',
          position: 'top',
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
          message: 'Insights generated successfully!',
          icon: 'check_circle',
          position: 'top',
        })
      } catch (err) {
        console.error('AI Insights Error:', err)
        this.$q.notify({
          type: 'negative',
          message: err.response?.data?.message || 'Failed to generate insights',
          icon: 'error',
          position: 'top',
        })
      } finally {
        this.loading = false
      }
    },
    showComingSoonNotify(provider) {
      this.$q.notify({
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} coming soon`,
        icon: 'info',
        position: 'top',
        timeout: 2000,
      })
    },
  },
  mounted() {
    this.userId = this.authStore.user.id
  },
}
</script>

<style scoped>
/* Page Layout */
.insights-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* Animated Background */
.animated-background {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
  animation-delay: 7s;
}

.orb-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: 14s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(50px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-50px, 50px) scale(0.9);
  }
}

/* Page Content */
.page-content {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: center;
}

.insights-container {
  width: 100%;
  max-width: 700px;
  animation: fadeInUp 0.6s ease;
}

/* Main Card */
.insights-card {
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

/* Header Section */
.header-section {
  text-align: center;
  padding: 48px 32px 32px !important;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8eaf6 100%);
}

.icon-container {
  position: relative;
  display: inline-block;
}

.icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  position: relative;
  z-index: 2;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.icon-pulse {
  position: absolute;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  opacity: 0.3;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Input Section */
.input-section {
  padding: 32px !important;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 16px;
  height: 56px;
  font-size: 16px;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control:hover) {
  border-color: #c0c0c0;
  background: #ffffff;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary);
  background: #ffffff;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

.generate-btn {
  width: 100%;
  height: 56px;
  font-size: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.generate-btn:hover:not(:disabled) {
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  transform: translateY(-2px);
}

.button-content {
  display: flex;
  align-items: center;
}

/* Loading Section */
.loading-section {
  padding: 64px 32px !important;
  text-align: center;
}

/* Insights Section */
.insights-section {
  padding: 32px !important;
  animation: fadeIn 0.5s ease;
}

/* Insight Cards */
.insight-card {
  padding: 20px;
  border-radius: 16px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.summary-card {
  background: linear-gradient(135deg, #e8eaf6 0%, #c5cae9 100%);
  border-color: #b0b6e0;
}

.suggestion-card {
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border-color: #ffd93d;
}

.action-card {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-color: #b1dfbb;
}

.motivation-card {
  background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
  border-color: #ba68c8;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #424242;
}

.card-content {
  font-size: 15px;
  line-height: 1.6;
  color: #424242;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.metric-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
}

.metric-card:hover {
  border-color: var(--q-primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.metric-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.loyalty-icon {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #333;
}

.purchase-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.risk-icon {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.confidence-icon {
  background: linear-gradient(135deg, #51cf66 0%, #37b24d 100%);
  color: white;
}

.metric-details {
  flex-grow: 1;
}

.metric-label {
  font-size: 12px;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 20px;
  font-weight: 800;
  color: #212529;
}

/* Risk Meter */
.risk-meter {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 16px;
}

.risk-progress {
  height: 12px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.action-btn {
  flex: 1;
  height: 48px;
  font-size: 14px;
  font-weight: 600;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.5s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .insights-page {
    padding: 16px;
  }

  .header-section {
    padding: 32px 24px 24px !important;
  }

  .icon-wrapper,
  .icon-pulse {
    width: 80px;
    height: 80px;
  }

  .icon-wrapper .q-icon {
    font-size: 48px !important;
  }

  .text-h4 {
    font-size: 24px !important;
  }

  .input-section,
  .insights-section {
    padding: 24px !important;
  }

  .metrics-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .icon-wrapper,
  .icon-pulse {
    width: 72px;
    height: 72px;
  }

  .icon-wrapper .q-icon {
    font-size: 40px !important;
  }

  .text-h4 {
    font-size: 22px !important;
  }

  .metric-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .metric-icon-wrapper .q-icon {
    font-size: 24px !important;
  }

  .metric-value {
    font-size: 18px;
  }
}
</style>
