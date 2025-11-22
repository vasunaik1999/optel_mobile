<template>
  <q-page class="redeem-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="q-mr-md" />
        <div>
          <div class="text-h4 text-weight-bold text-grey-9">Redeem Points</div>
          <div class="text-body2 text-grey-6">Convert your commission to rewards</div>
        </div>
      </div>

      <!-- Points Balance Card -->
      <q-card flat bordered class="balance-card q-mb-lg">
        <q-card-section class="q-pa-xl text-center">
          <div class="text-caption text-grey-6 q-mb-sm">Available Balance</div>
          <div class="balance-amount text-weight-bold">
            <q-icon name="stars" size="32px" color="amber-8" class="q-mr-sm" />
            {{ pendingPoints.toLocaleString() }}
          </div>
          <div class="text-caption text-grey-6">Commission Points</div>
        </q-card-section>
      </q-card>

      <!-- Redeem Form Card -->
      <q-card flat bordered class="redeem-card q-mb-lg">
        <q-card-section class="q-pa-lg">
          <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">Redeem Amount</div>

          <!-- Points Input -->
          <div class="q-mb-lg">
            <label class="input-label">Points to Redeem</label>
            <q-input
              v-model.number="pointsToRedeem"
              type="number"
              outlined
              placeholder="Enter points amount"
              class="custom-input"
              :rules="[
                (val) => !!val || 'Amount is required',
                (val) => val > 0 || 'Must be greater than 0',
                (val) => val <= pendingPoints || 'Exceeds available balance',
              ]"
            >
              <template v-slot:prepend>
                <q-icon name="toll" color="primary" />
              </template>
            </q-input>

            <!-- Quick Amount Buttons -->
            <div class="quick-amounts q-mt-md">
              <q-btn
                v-for="amount in quickAmounts"
                :key="amount"
                outline
                rounded
                no-caps
                :label="`${amount}`"
                size="sm"
                class="quick-btn"
                @click="pointsToRedeem = amount"
                :disable="amount > pendingPoints"
              />
              <q-btn
                outline
                rounded
                no-caps
                label="Max"
                size="sm"
                class="quick-btn"
                @click="pointsToRedeem = pendingPoints"
                :disable="pendingPoints <= 0"
              />
            </div>
          </div>

          <!-- Redeem Button -->
          <q-btn
            unelevated
            rounded
            no-caps
            :class="['full-width', 'redeem-btn', redeemButtonClass]"
            label="Redeem Now"
            icon="redeem"
            size="lg"
            @click="handleRedeem"
            :loading="loading"
            :disable="!pointsToRedeem || pointsToRedeem <= 0 || pointsToRedeem > pendingPoints"
          >
            <template v-slot:loading>
              <q-spinner-dots size="24px" />
            </template>
          </q-btn>

          <!-- Success/Error Message -->
          <transition name="fade-slide">
            <q-banner
              v-if="message"
              rounded
              class="q-mt-lg message-banner"
              :class="success ? 'success-banner' : 'error-banner'"
            >
              <template v-slot:avatar>
                <q-icon
                  :name="success ? 'check_circle' : 'error'"
                  :color="success ? 'positive' : 'negative'"
                  size="24px"
                />
              </template>
              <div class="text-weight-medium">{{ message }}</div>
            </q-banner>
          </transition>
        </q-card-section>
      </q-card>

      <!-- Weather Info Card -->
      <q-card flat bordered class="weather-card">
        <q-card-section class="q-pa-lg">
          <div class="row items-center q-mb-md">
            <q-icon :name="weatherIcon" size="32px" :color="weatherColor" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold text-grey-9">
                {{ weatherCondition }}
              </div>
              <div class="text-caption text-grey-6">
                {{ isRealWeather ? 'Live Weather Data' : 'Demo Weather Data' }}
              </div>
            </div>
          </div>

          <q-separator class="q-mb-md" />

          <!-- Weather Details -->
          <div class="weather-details">
            <div class="detail-row">
              <div class="detail-item">
                <q-icon name="water_drop" size="20px" color="blue-6" />
                <div class="q-ml-sm">
                  <div class="text-caption text-grey-6">Humidity</div>
                  <div class="text-weight-bold">{{ humidity }}%</div>
                </div>
              </div>
              <div class="detail-item" v-if="isRealWeather && lat && lon">
                <q-icon name="location_on" size="20px" color="red-6" />
                <div class="q-ml-sm">
                  <div class="text-caption text-grey-6">Location</div>
                  <div class="text-weight-bold text-caption">
                    {{ lat.toFixed(2) }}, {{ lon.toFixed(2) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Weather Status -->
            <q-chip
              :color="isRealWeather ? 'positive' : 'grey-4'"
              :text-color="isRealWeather ? 'white' : 'grey-8'"
              class="q-mt-md"
              icon="public"
            >
              {{ isRealWeather ? 'Real-time Data' : 'Test Mode' }}
            </q-chip>
          </div>

          <!-- Weather Info -->
          <div class="weather-info q-mt-md">
            <q-banner rounded dense class="bg-blue-1">
              <template v-slot:avatar>
                <q-icon name="info" color="blue-6" />
              </template>
              <div class="text-caption text-grey-8">
                Button style changes based on weather conditions
              </div>
            </q-banner>
          </div>
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
      quickAmounts: [100, 500, 1000, 2500],
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

    weatherColor() {
      const colors = {
        Clear: 'amber-8',
        Sunny: 'amber-8',
        Rain: 'blue-6',
        Clouds: 'grey-6',
        Fog: 'grey-5',
        Storm: 'purple-8',
      }
      return colors[this.weatherCondition] || 'grey-6'
    },
  },

  methods: {
    async fetchPending() {
      try {
        const res = await axios.get(
          `${this.authStore.baseUrl}/verify/users/${this.authStore.user.id}/commission/pending`,
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        )
        this.pendingPoints = res.data.pendingCommission + 100
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
          this.message = `Successfully redeemed ${res.data.redeemedAmount} points!`
          this.success = true
          this.pendingPoints -= this.pointsToRedeem
          this.pointsToRedeem = 0

          this.$q.notify({
            type: 'positive',
            message: 'Points redeemed successfully!',
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
        console.error('Error fetching weather data:', err)
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
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  padding: 24px;
}

.page-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  animation: fadeInDown 0.5s ease;
}

/* Balance Card */
.balance-card {
  border-radius: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
}

.balance-card .q-card-section {
  color: white;
}

.balance-amount {
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.8s ease;
}

/* Cards */
.redeem-card,
.weather-card {
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
}

/* Input Styling */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 8px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
  font-size: 18px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control:hover) {
  background: #ffffff;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Quick Amount Buttons */
.quick-amounts {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-btn {
  flex: 1;
  min-width: 70px;
  border-color: #e0e0e0;
  transition: all 0.3s ease;
}

.quick-btn:hover:not(:disabled) {
  border-color: var(--q-primary);
  background: rgba(102, 126, 234, 0.05);
}

/* Redeem Button */
.redeem-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.redeem-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

/* Button Animations */
.shimmer-gold {
  background: linear-gradient(90deg, #ffd700 0%, #fffacd 50%, #ffd700 100%) !important;
  background-size: 200% 100% !important;
  animation: shimmer 1.5s infinite linear;
  color: black !important;
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.5) !important;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.pulse-grey {
  background-color: #555 !important;
  animation: pulse 2s infinite;
  color: white !important;
  box-shadow: 0 4px 16px rgba(85, 85, 85, 0.4) !important;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
}

.static-purple {
  background-color: #8a2be2 !important;
  color: white !important;
  box-shadow: 0 4px 16px rgba(138, 43, 226, 0.4) !important;
}

/* Message Banner */
.message-banner {
  border-left: 4px solid;
}

.success-banner {
  background: #e8f5e9;
  border-left-color: #4caf50;
}

.error-banner {
  background: #ffebee;
  border-left-color: #f44336;
}

/* Weather Details */
.weather-details {
  display: flex;
  flex-direction: column;
}

.detail-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.detail-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 12px;
  flex: 1;
  min-width: 140px;
}

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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
    font-size: 40px;
  }

  .balance-card,
  .redeem-card,
  .weather-card {
    border-radius: 16px;
  }

  .q-card-section.q-pa-lg {
    padding: 20px !important;
  }

  .q-card-section.q-pa-xl {
    padding: 24px !important;
  }

  .custom-input :deep(.q-field__control) {
    height: 52px;
    font-size: 16px;
  }

  .redeem-btn {
    height: 52px;
    font-size: 15px;
  }

  .detail-item {
    min-width: 100%;
  }
}

/* Utility */
.full-width {
  width: 100%;
}
</style>
