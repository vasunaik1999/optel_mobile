<template>
  <q-page class="redeem-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="back-btn" />
        <div class="flex-grow">
          <div class="text-h4 text-weight-bold text-grey-9">Redeem Rewards</div>
          <div class="text-body2 text-grey-6">Cash out your hard-earned points</div>
        </div>
      </div>

      <!-- Balance Card with Animation -->
      <q-card flat class="balance-card q-mb-lg">
        <div class="balance-decoration">
          <div class="decoration-circle circle-1"></div>
          <div class="decoration-circle circle-2"></div>
          <div class="decoration-circle circle-3"></div>
        </div>
        <q-card-section class="q-pa-xl text-center position-relative">
          <div class="text-overline text-white q-mb-sm" style="opacity: 0.9">Your Balance</div>
          <div class="balance-display">
            <q-icon name="account_balance_wallet" size="40px" color="white" class="balance-icon" />
            <div class="balance-amount text-white">
              {{ pendingPoints.toLocaleString() }}
            </div>
          </div>
          <div class="text-body2 text-white q-mt-sm" style="opacity: 0.85">
            Commission Points Available
          </div>

          <!-- Mini Stats -->
          <div class="row q-mt-lg q-col-gutter-sm">
            <div class="col-6">
              <div class="mini-stat">
                <q-icon name="trending_up" size="20px" class="q-mb-xs" />
                <div class="text-caption">This Month</div>
                <div class="text-weight-bold">+{{ (pendingPoints * 0.3).toFixed(0) }}</div>
              </div>
            </div>
            <div class="col-6">
              <div class="mini-stat">
                <q-icon name="emoji_events" size="20px" class="q-mb-xs" />
                <div class="text-caption">Rank</div>
                <div class="text-weight-bold">Gold Tier</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Redeem Form Card -->
      <q-card flat bordered class="redeem-card q-mb-lg">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-mb-lg">
            <q-icon name="redeem" size="28px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold text-grey-9">Redeem Points</div>
              <div class="text-caption text-grey-6">Choose amount to withdraw</div>
            </div>
          </div>

          <!-- Points Input with Visual Feedback -->
          <div class="q-mb-lg">
            <label class="input-label">Redeem Amount</label>
            <div class="amount-input-wrapper">
              <q-input
                v-model.number="pointsToRedeem"
                type="number"
                outlined
                placeholder="0"
                class="custom-input"
                @update:model-value="calculateEquivalent"
              >
                <template v-slot:prepend>
                  <q-avatar size="25px" class="bg-primary">
                    <q-icon name="toll" color="white" size="16px" />
                  </q-avatar>
                </template>
                <template v-slot:append>
                  <div class="text-weight-medium text-primary">
                    <q-icon name="currency_rupee" size="20px" />
                  </div>
                </template>
              </q-input>

              <!-- Equivalent Amount Display -->
              <div v-if="pointsToRedeem > 0" class="equivalent-display">
                <!-- <q-icon name="currency_rupee" size="16px" color="positive" /> -->
                <!-- <span class="text-positive text-weight-bold">
                  ≈ ₹{{ (pointsToRedeem * 0.1).toFixed(2) }}
                </span> -->
              </div>
            </div>

            <!-- Progress Bar -->
            <q-linear-progress
              :value="pointsToRedeem / pendingPoints"
              color="primary"
              class="q-mt-md"
              rounded
              size="8px"
            />
            <div class="text-caption text-grey-6 q-mt-xs">
              {{ ((pointsToRedeem / pendingPoints) * 100).toFixed(1) }}% of balance
            </div>
          </div>

          <!-- Quick Amount Buttons -->
          <div class="quick-amounts-section q-mb-lg">
            <div class="text-caption text-grey-7 text-weight-medium q-mb-sm">Quick Select</div>
            <div class="quick-amounts">
              <q-btn
                v-for="amount in quickAmounts"
                :key="amount"
                unelevated
                rounded
                no-caps
                class="quick-btn"
                :class="{ 'quick-btn-active': pointsToRedeem === amount }"
                @click="pointsToRedeem = amount"
                :disable="amount > pendingPoints"
              >
                <div class="flex items-center no-wrap">
                  <q-icon name="bolt" size="14px" class="q-mr-xs" />
                  <span>{{ amount.toLocaleString() }}</span>
                </div>
              </q-btn>

              <q-btn
                unelevated
                rounded
                no-caps
                class="quick-btn quick-btn-max"
                :class="{ 'quick-btn-active': pointsToRedeem === pendingPoints }"
                @click="pointsToRedeem = pendingPoints"
                :disable="pendingPoints <= 0"
              >
                <div class="flex items-center no-wrap">
                  <q-icon name="all_inclusive" size="16px" class="q-mr-xs" />
                  <span>All</span>
                </div>
              </q-btn>
            </div>
          </div>

          <!-- Redeem Button with Weather Effect -->
          <div class="redeem-button-wrapper">
            <q-btn
              unelevated
              rounded
              no-caps
              :class="['full-width', 'redeem-btn', redeemButtonClass]"
              size="lg"
              @click="handleRedeem"
              :loading="loading"
              :disable="!pointsToRedeem || pointsToRedeem <= 0 || pointsToRedeem > pendingPoints"
            >
              <div class="button-content">
                <q-icon name="check_circle" size="24px" class="q-mr-sm" />
                <div>
                  <div class="button-label">Redeem Now</div>
                  <div v-if="pointsToRedeem > 0" class="button-sublabel">
                    ₹{{ (pointsToRedeem * 0.1).toFixed(2) }} to your wallet
                  </div>
                </div>
              </div>
              <template v-slot:loading>
                <q-spinner-dots size="28px" />
              </template>
            </q-btn>

            <!-- Weather Badge on Button -->
            <div class="weather-badge">
              <q-icon :name="weatherIcon" size="16px" />
              <span class="text-caption">{{ weatherCondition }}</span>
            </div>
          </div>

          <!-- Success/Error Message -->
          <transition name="fade-slide">
            <q-banner
              v-if="message"
              rounded
              class="q-mt-lg message-banner"
              :class="success ? 'success-banner' : 'error-banner'"
            >
              <template v-slot:avatar>
                <q-avatar :color="success ? 'positive' : 'negative'" text-color="white">
                  <q-icon :name="success ? 'check_circle' : 'error'" />
                </q-avatar>
              </template>
              <div>
                <div class="text-weight-bold">{{ success ? 'Success!' : 'Error' }}</div>
                <div class="text-body2">{{ message }}</div>
              </div>
            </q-banner>
          </transition>
        </q-card-section>
      </q-card>

      <!-- Weather Info Card - Redesigned -->
      <q-card flat bordered class="weather-card">
        <div class="weather-header" :style="{ background: weatherGradient }">
          <div class="row items-center">
            <q-icon :name="weatherIcon" size="48px" color="white" class="weather-icon-large" />
            <div class="q-ml-md text-white">
              <div class="text-h5 text-weight-bold">{{ weatherCondition }}</div>
              <div class="text-caption" style="opacity: 0.9">
                {{ isRealWeather ? 'Live Weather' : 'Demo Mode' }}
              </div>
            </div>
            <q-space />
            <q-chip
              :color="isRealWeather ? 'white' : 'grey-3'"
              :text-color="isRealWeather ? 'primary' : 'grey-7'"
              icon="sensors"
            >
              {{ isRealWeather ? 'Live' : 'Demo' }}
            </q-chip>
          </div>
        </div>

        <q-card-section class="q-pa-lg">
          <!-- Weather Stats Grid -->
          <div class="weather-stats">
            <div class="weather-stat-item">
              <q-icon name="water_drop" size="32px" color="blue-6" />
              <div class="q-ml-sm">
                <div class="text-caption text-grey-6">Humidity</div>
                <div class="text-h6 text-weight-bold">{{ humidity }}%</div>
              </div>
            </div>

            <div class="weather-stat-item" v-if="isRealWeather && lat && lon">
              <q-icon name="my_location" size="32px" color="red-6" />
              <div class="q-ml-sm">
                <div class="text-caption text-grey-6">Coordinates</div>
                <div class="text-weight-bold text-body2">
                  {{ lat.toFixed(2) }}°, {{ lon.toFixed(2) }}°
                </div>
              </div>
            </div>
          </div>

          <!-- Button Style Indicator -->
          <q-separator class="q-my-md" />

          <div class="button-style-info">
            <div class="text-subtitle2 text-weight-medium text-grey-8 q-mb-md">
              <q-icon name="palette" size="20px" class="q-mr-xs" />
              Button Style Effect
            </div>

            <div class="style-indicators">
              <div
                class="style-indicator"
                :class="{ 'style-active': redeemButtonClass === 'shimmer-gold' }"
              >
                <div class="style-preview shimmer-gold-preview"></div>
                <div class="q-ml-sm">
                  <div class="text-caption text-weight-medium">Golden Shimmer</div>
                  <div class="text-caption text-grey-6">Clear & Low Humidity</div>
                </div>
              </div>

              <div
                class="style-indicator"
                :class="{ 'style-active': redeemButtonClass === 'pulse-grey' }"
              >
                <div class="style-preview pulse-grey-preview"></div>
                <div class="q-ml-sm">
                  <div class="text-caption text-weight-medium">Rainy Pulse</div>
                  <div class="text-caption text-grey-6">Rain or High Humidity</div>
                </div>
              </div>

              <div
                class="style-indicator"
                :class="{ 'style-active': redeemButtonClass === 'static-purple' }"
              >
                <div class="style-preview static-purple-preview"></div>
                <div class="q-ml-sm">
                  <div class="text-caption text-weight-medium">Default Purple</div>
                  <div class="text-caption text-grey-6">Other Conditions</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Transaction History Preview -->
      <q-card flat bordered class="history-card q-mt-lg">
        <q-card-section class="q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle2 text-weight-medium text-grey-8">Recent Activity</div>
            <q-btn flat dense no-caps color="primary" label="View All" size="sm" />
          </div>

          <q-list separator>
            <q-item v-for="i in 3" :key="i" class="transaction-item">
              <q-item-section avatar>
                <q-avatar color="positive" text-color="white" icon="add" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">Commission Earned</q-item-label>
                <q-item-label caption>{{ Math.floor(Math.random() * 24) }} hours ago</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="text-positive text-weight-bold">
                  +{{ Math.floor(Math.random() * 500) + 50 }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { Geolocation } from '@capacitor/geolocation'
import { useAuthStore } from 'src/stores/authStore'
import axios from 'axios'

export default {
  name: 'RedeemPage',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      pendingPoints: 0,
      pointsToRedeem: 0,
      message: '',
      success: false,
      loading: false,
      weatherCondition: 'Sunny',
      humidity: 50,
      redeemButtonClass: '',
      intervalId: null,
      weatherApiKey: 'ab84ab2a5ad5a0c1f09c72a400a2d3a2',
      isRealWeather: false,
      lat: null,
      lon: null,
      quickAmounts: [10, 50, 100, 250, 500],
    }
  },

  computed: {
    weatherIcon() {
      const icons = {
        Clear: 'wb_sunny',
        Sunny: 'wb_sunny',
        Rain: 'water_drop',
        Clouds: 'cloud',
        Fog: 'foggy',
        Storm: 'thunderstorm',
      }
      return icons[this.weatherCondition] || 'wb_sunny'
    },

    weatherGradient() {
      const gradients = {
        Clear: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        Sunny: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
        Rain: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        Clouds: 'linear-gradient(135deg, #c2e9fb 0%, #a1c4fd 100%)',
        Fog: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
        Storm: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      }
      return gradients[this.weatherCondition] || gradients.Sunny
    },
  },

  methods: {
    calculateEquivalent() {
      // Could add more logic here for different conversion rates
    },

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
          position: 'top',
        })
      }
    },

    async handleRedeem() {
      if (!this.pointsToRedeem || this.pointsToRedeem <= 0) {
        this.$q.notify({
          type: 'negative',
          message: 'Enter valid points to redeem',
          position: 'top',
        })
        return
      }

      if (this.pointsToRedeem > this.pendingPoints) {
        this.$q.notify({
          type: 'negative',
          message: 'Cannot redeem more than available balance',
          position: 'top',
        })
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
          this.message = `Successfully redeemed ${res.data.redeemedAmount} points! Amount credited to your wallet.`
          this.success = true
          this.pendingPoints -= this.pointsToRedeem
          this.pointsToRedeem = 0

          this.$q.notify({
            type: 'positive',
            message: `₹${(res.data.redeemedAmount * 0.1).toFixed(2)} credited!`,
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
          })
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

    updateButtonStyle() {
      if (this.weatherCondition === 'Clear' && this.humidity < 60) {
        this.redeemButtonClass = 'shimmer-gold'
      } else if (this.weatherCondition === 'Rain' || this.humidity > 80) {
        this.redeemButtonClass = 'pulse-grey'
      } else {
        this.redeemButtonClass = 'static-purple'
      }
    },

    async requestGeolocation() {
      try {
        let perm = await Geolocation.checkPermissions()

        if (perm.location !== 'granted') {
          await Geolocation.requestPermissions()
          perm = await Geolocation.checkPermissions()

          if (perm.location !== 'granted') {
            this.setDummyWeather()
            return
          }
        }

        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        })

        const { latitude, longitude } = position.coords
        this.fetchWeatherFromAPI(latitude, longitude)
      } catch (err) {
        if (String(err).includes('not enabled')) {
          this.$q.notify({
            type: 'warning',
            message: 'Please enable GPS / Location',
            position: 'top',
          })
        }
        this.setDummyWeather()
      }
    },

    setDummyWeather() {
      const conditions = ['Clear', 'Rain', 'Clouds', 'Fog', 'Storm', 'Sunny']
      const randomCond = conditions[Math.floor(Math.random() * conditions.length)]
      const randomHumidity = Math.floor(Math.random() * 60) + 30

      this.weatherCondition = randomCond
      this.humidity = randomHumidity
      this.lat = null
      this.lon = null
      this.isRealWeather = false

      this.updateButtonStyle()
    },

    async fetchWeatherFromAPI(lat, lon) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.weatherApiKey}`,
        )
        const data = res.data
        this.weatherCondition = data.weather[0].main
        this.humidity = data.main.humidity
        this.isRealWeather = true
        this.lat = lat
        this.lon = lon
        this.updateButtonStyle()
      } catch (err) {
        console.warn('Weather API error:', err)
        this.setDummyWeather()
      }
    },
  },

  mounted() {
    this.fetchPending()
    this.requestGeolocation()
    this.intervalId = setInterval(this.requestGeolocation, 15000)
  },

  beforeUnmount() {
    clearInterval(this.intervalId)
  },
}
</script>

<style scoped>
/* Page Layout */
.redeem-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e8eaf6 100%);
  padding: 24px;
}

.page-container {
  max-width: 650px;
  margin: 0 auto;
  width: 100%;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  animation: fadeInDown 0.5s ease;
}

.back-btn {
  margin-right: 12px;
}

.flex-grow {
  flex-grow: 1;
}

/* Balance Card */
.balance-card {
  border-radius: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 12px 32px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;
}

.balance-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -80px;
  right: -60px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -50px;
  left: -40px;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  left: 20%;
  opacity: 0.5;
  animation: float 10s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.position-relative {
  position: relative;
  z-index: 1;
}

.balance-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  animation: scaleIn 0.6s ease;
}

.balance-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.balance-amount {
  font-size: 56px;
  font-weight: 800;
  letter-spacing: -2px;
}

.mini-stat {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 12px;
  color: white;
  transition: all 0.3s ease;
}

.mini-stat:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
}

/* Redeem Card */
.redeem-card,
.weather-card,
.history-card {
  border-radius: 24px;
  border: 1px solid #e0e0e0;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

/* Amount Input */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 12px;
}

.amount-input-wrapper {
  position: relative;
}

.custom-input :deep(.q-field__control) {
  border-radius: 16px;
  height: 64px;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 2px solid #e0e0e0;
  transition: all 0.3s ease;
  align-items: center;
}

.custom-input :deep(.q-field__control:hover) {
  border-color: #c0c0c0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.custom-input :deep(.q-field--focused .q-field__control) {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Quick Amounts */
.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  min-width: 90px;
  height: 44px;
  background: #f5f5f5;
  color: #424242;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  font-weight: 600;
}

.quick-btn:hover:not(:disabled) {
  background: #e8eaf6;
  border-color: var(--q-primary);
  transform: translateY(-2px);
}

.quick-btn-active {
  background: var(--q-primary) !important;
  color: white !important;
  border-color: var(--q-primary);
}

.quick-btn-max {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Redeem Button */
.redeem-button-wrapper {
  position: relative;
}

.redeem-btn {
  height: 72px;
  font-size: 18px;
  font-weight: 700;
  transition: all 0.3s ease;
  overflow: hidden;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.button-label {
  font-size: 18px;
  font-weight: 700;
}

.button-sublabel {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 2px;
}

.weather-badge {
  position: absolute;
  top: -12px;
  right: 16px;
  background: white;
  padding: 6px 12px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  color: #666;
  font-weight: 600;
}

/* Button Animations - Enhanced */
.shimmer-gold {
  background: linear-gradient(
    90deg,
    #ffd700 0%,
    #ffed4e 25%,
    #ffd700 50%,
    #ffed4e 75%,
    #ffd700 100%
  ) !important;
  background-size: 200% 100% !important;
  animation: shimmer 2s infinite linear;
  color: #333 !important;
  box-shadow:
    0 8px 24px rgba(255, 215, 0, 0.6),
    0 0 40px rgba(255, 215, 0, 0.3) !important;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    box-shadow:
      0 8px 24px rgba(85, 85, 85, 0.6),
      0 0 0 0 rgba(85, 85, 85, 0);
  }
}

.static-purple {
  background: linear-gradient(135deg, #8a2be2 0%, #9b59b6 100%) !important;
  color: white !important;
  box-shadow: 0 8px 24px rgba(138, 43, 226, 0.5) !important;
}

.static-purple:hover:not(:disabled) {
  box-shadow: 0 12px 32px rgba(138, 43, 226, 0.6) !important;
}

/* Message Banner */
.message-banner {
  border-left: 4px solid;
  animation: slideInLeft 0.4s ease;
}

.success-banner {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-left-color: #4caf50;
}

.error-banner {
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left-color: #f44336;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Weather Card */
.weather-header {
  padding: 24px;
  border-radius: 24px 24px 0 0;
  position: relative;
  overflow: hidden;
}

.weather-icon-large {
  animation: weatherFloat 3s ease-in-out infinite;
}

@keyframes weatherFloat {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.weather-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.weather-stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e8eaf6 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.weather-stat-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Button Style Indicators */
.button-style-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
}

.style-indicators {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.style-indicator {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.style-indicator:hover {
  border-color: var(--q-primary);
}

.style-active {
  border-color: var(--q-primary);
  background: #e8eaf6;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.style-preview {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  flex-shrink: 0;
}

.shimmer-gold-preview {
  background: linear-gradient(90deg, #ffd700 0%, #fffacd 50%, #ffd700 100%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite linear;
}

.pulse-grey-preview {
  background-color: #555;
  animation: pulse 2s infinite;
}

.static-purple-preview {
  background: linear-gradient(135deg, #8a2be2 0%, #9b59b6 100%);
}

/* Transaction History */
.transaction-item {
  border-radius: 12px;
  margin: 4px 0;
  transition: all 0.2s ease;
}

.transaction-item:hover {
  background: #f8f9fa;
}

/* {
    background-position: 200% 0;
  }
}

.pulse-grey {
  background: linear-gradient(135deg, #555 0%, #333 100%) !important;
  animation: pulse 2s infinite, ripple 3s infinite;
  color: white !important;
  box-shadow: 0 8px 24px rgba(85, 85, 85, 0.6) !important;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

@keyframes ripple {
  0% {
    box-shadow: 0 8px 24px rgba(85, 85, 85, 0.6), 0 0 0 0 rgba(85, 85, 85, 0.4);
  }
  50% {
    box-shadow: 0 8px 24px rgba(85, 85, 85, 0.6), 0 0 0 20px rgba(85, 85, 85, 0);
  }
  100%
 */

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 600px) {
  .redeem-page {
    padding: 16px;
  }

  .page-header .text-h4 {
    font-size: 24px !important;
  }

  .balance-amount {
    font-size: 44px;
  }

  .balance-card,
  .redeem-card,
  .weather-card,
  .history-card {
    border-radius: 20px;
  }

  .q-card-section.q-pa-lg {
    padding: 20px !important;
  }

  .q-card-section.q-pa-xl {
    padding: 24px !important;
  }

  .custom-input :deep(.q-field__control) {
    height: 56px;
    font-size: 20px;
  }

  .redeem-btn {
    height: 64px;
    font-size: 16px;
  }

  .button-label {
    font-size: 16px;
  }

  .button-sublabel {
    font-size: 11px;
  }

  .quick-btn {
    min-width: 70px;
    height: 40px;
    font-size: 13px;
  }

  .weather-stats {
    grid-template-columns: 1fr;
  }

  .style-indicators {
    gap: 8px;
  }

  .style-indicator {
    padding: 12px;
  }

  .style-preview {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 400px) {
  .balance-amount {
    font-size: 36px;
  }

  .balance-display {
    gap: 12px;
  }

  .balance-icon {
    font-size: 32px !important;
  }
}

/* Utility */
.full-width {
  width: 100%;
}
</style>
