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
          :class="redeemButtonClass"
          label="Redeem"
          color="primary"
          class="q-mt-md"
          :loading="loading"
          @click="handleRedeem"
        />

        <div class="q-mt-md">
          <strong>Weather:</strong> {{ weatherCondition }}, Humidity: {{ humidity }}%
        </div>

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
import { Geolocation } from '@capacitor/geolocation'
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
      weatherCondition: 'Sunny', // dummy default for demo
      humidity: 50, // dummy default for demo
      redeemButtonClass: '',
      intervalId: null,
      weatherApiKey: 'ab84ab2a5ad5a0c1f09c72a400a2d3a2', // replace with your key
    }
  },
  methods: {
    // Fetch Pending Commission
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

    // Redeem Commission
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

    // Update Redeem Button Style
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
        console.log('Checking permissions...')

        // 1. Check permissions
        let perm = await Geolocation.checkPermissions()

        if (perm.location !== 'granted') {
          console.log('Requesting permissions...')

          await Geolocation.requestPermissions()

          perm = await Geolocation.checkPermissions()

          if (perm.location !== 'granted') {
            console.warn('Permission denied, using defaults')
            this.setDummyWeather()
            return
          }
        }

        console.log('Getting location...')

        // 2. Try get location
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 0,
        })

        const { latitude, longitude } = position.coords
        console.log('Location:', latitude, longitude)

        this.fetchWeatherFromAPI(latitude, longitude)
      } catch (err) {
        console.error('Geolocation failed:', err)

        // GPS OFF case (Android)
        if (String(err).includes('not enabled')) {
          this.$q.notify({
            type: 'warning',
            message: 'Please enable GPS / Location on your phone',
          })
        }

        this.setDummyWeather()
      }
    },

    // Set dummy weather if geolocation fails
    setDummyWeather() {
      console.log('SET DUMMY WEATHER CALLED')
      this.weatherCondition = 'Clear'
      this.humidity = 50
      this.updateButtonStyle()
    },

    // Fetch weather from OpenWeatherMap API
    async fetchWeatherFromAPI(lat, lon) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${this.weatherApiKey}`,
        )
        console.log('FETCH WEATHER RESPONSE:', res)
        const data = res.data
        this.weatherCondition = data.weather[0].main // Clear, Rain, Clouds etc.
        this.humidity = data.main.humidity
        this.updateButtonStyle()
      } catch (err) {
        console.warn('Weather API failed, using defaults', err)
        this.setDummyWeather()
      }
    },
  },

  mounted() {
    this.fetchPending()
    this.requestGeolocation()
    // Refresh every 15 seconds
    this.intervalId = setInterval(this.requestGeolocation, 15000)
  },

  beforeUnmount() {
    clearInterval(this.intervalId)
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
}

/* Button Animations */
.shimmer-gold {
  background: linear-gradient(90deg, #ffd700 0%, #fffacd 50%, #ffd700 100%);
  background-size: 200% 100%;
  animation: shimmer 1s infinite linear;
  color: black !important;
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
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.static-purple {
  background-color: #8a2be2 !important;
  color: white !important;
}
</style>
