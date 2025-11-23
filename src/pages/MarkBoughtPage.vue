<template>
  <q-page class="mark-bought-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="q-mr-md" />
        <div>
          <div class="text-h4 text-weight-bold text-grey-9">Mark Product</div>
          <div class="text-body2 text-grey-6">Verify and register your purchase</div>
        </div>
      </div>

      <!-- Main Card -->
      <q-card flat bordered class="main-card q-mb-lg">
        <q-card-section class="q-pa-lg">
          <!-- Serial Number Input -->
          <div class="q-mb-lg">
            <label class="input-label">Serial Number</label>
            <q-input
              v-model="serialNumber"
              outlined
              placeholder="Enter product serial number"
              class="custom-input"
              :readonly="verifiedSerial"
            >
              <!-- QR scanner icon -->
              <template v-slot:prepend>
                <q-icon name="qr_code_scanner" color="primary" />
              </template>

              <!-- Show cross button only when verified -->
              <template v-slot:append>
                <q-icon
                  v-if="verifiedSerial"
                  name="close"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="clearInput"
                />
              </template>
            </q-input>
          </div>

          <!-- Status Message -->
          <q-banner
            v-if="message"
            rounded
            class="q-mb-lg status-banner"
            :class="messageType === 'success' ? 'success-banner' : 'error-banner'"
          >
            <template v-slot:avatar>
              <q-icon
                :name="messageType === 'success' ? 'check_circle' : 'error'"
                :color="messageType === 'success' ? 'positive' : 'negative'"
                size="24px"
              />
            </template>
            <div class="text-weight-medium">{{ message }}</div>
          </q-banner>

          <!-- Action Buttons -->
          <div class="action-buttons">
            <q-btn
              unelevated
              rounded
              no-caps
              label="Verify Serial"
              icon="verified"
              class="full-width verify-btn q-mb-md"
              @click="verifySerial"
              :loading="loading"
              :disable="!serialNumber || loading || verifiedSerial || !validateSerial(serialNumber)"
            >
              <template v-slot:loading>
                <q-spinner-dots size="24px" />
              </template>
            </q-btn>

            <q-btn
              unelevated
              rounded
              no-caps
              label="Mark as Bought"
              icon="shopping_cart_checkout"
              class="full-width mark-bought-btn"
              @click="showConfirmDialog = true"
              :disable="!verifiedSerial"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Last Consumed Serial Info -->
      <transition name="fade-slide">
        <q-card v-if="lastConsumedSerial" flat bordered class="result-card">
          <q-card-section class="q-pa-lg">
            <div class="row items-center q-mb-md">
              <q-icon name="receipt_long" size="32px" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6 text-weight-bold text-grey-9">Purchase Registered!</div>
                <div class="text-caption text-grey-6">Your commission has been credited</div>
              </div>
            </div>

            <q-separator class="q-mb-md" />

            <!-- Serial Details -->
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Serial Number</div>
                <div class="detail-value">
                  <q-chip
                    square
                    color="grey-3"
                    text-color="grey-9"
                    class="text-weight-bold q-ml-none"
                  >
                    {{ lastConsumedSerial.serialNumber }}
                  </q-chip>
                </div>
              </div>

              <!-- <div class="detail-item">
                <div class="detail-label">Product MRP</div>
                <div class="detail-value text-weight-bold">
                  <span class="text-grey-8"> ₹500 </span>
                </div>
              </div> -->

              <div
                v-if="lastConsumedSerial.commissionAmount !== undefined"
                class="detail-item highlight"
              >
                <div class="detail-label">Commission Earned</div>
                <div class="detail-value text-positive text-weight-bold text-h6">
                  +₹{{ lastConsumedSerial.commissionAmount }}
                </div>
              </div>
            </div>

            <!-- Success Animation -->
            <div class="text-center q-mt-md">
              <q-btn
                flat
                rounded
                no-caps
                color="primary"
                label="Register Another"
                icon-right="arrow_forward"
                @click="resetForm"
              />
            </div>
          </q-card-section>
        </q-card>
      </transition>

      <!-- Quick Tips -->
      <q-card flat bordered class="tips-card q-mt-lg">
        <q-card-section class="q-pa-md">
          <div class="row items-center q-mb-sm">
            <q-icon name="lightbulb" color="amber-8" size="20px" class="q-mr-sm" />
            <div class="text-subtitle2 text-weight-medium text-grey-8">Quick Tips</div>
          </div>
          <ul class="tips-list">
            <li>Scan QR code for instant serial entry</li>
            <li>Verify before marking to ensure validity</li>
            <li>Commission is credited immediately</li>
          </ul>
        </q-card-section>
      </q-card>

      <!-- Confirm Dialog -->
      <confirm-dialog
        v-model="showConfirmDialog"
        @confirmed="markAsBought"
        @cancelled="onDialogCancelled"
      />
    </div>
  </q-page>
</template>

<script>
import { LocalStorage, Notify } from 'quasar'
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'
import ConfirmDialog from 'components/ConfirmDialog.vue'

export default {
  name: 'MarkBoughtPage',
  components: { ConfirmDialog },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      serialNumber: '',
      verifiedSerial: false,
      message: '',
      messageType: '',
      loading: false,
      lastConsumedSerial: null,
      consumedSerials: LocalStorage.getItem('consumedSerials') || [],
      showConfirmDialog: false,
    }
  },

  watch: {
    serialNumber(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.serialNumber = newVal.toUpperCase()

        this.verifiedSerial = false
        this.message = ''
        this.messageType = ''

        if (this.serialNumber && !this.validateSerial(this.serialNumber)) {
          this.message = 'Serial must be 3 letters followed by 7 digits (e.g., SNO0000001)'
          this.messageType = 'negative'
        }
      }
    },
  },

  async mounted() {
    const serialFromScan = this.$route.query.serial
    if (serialFromScan) {
      this.serialNumber = serialFromScan
      await this.verifySerial()
    }
  },

  methods: {
    validateSerial(serial) {
      const regex = /^[A-Z]{3}\d{7}$/
      return regex.test(serial)
    },

    clearInput() {
      this.serialNumber = ''
      this.verifiedSerial = false
      this.message = ''
      this.messageType = ''
    },

    resetForm() {
      this.serialNumber = ''
      this.verifiedSerial = false
      this.message = ''
      this.messageType = ''
      this.lastConsumedSerial = null
    },

    onDialogCancelled() {
      this.showConfirmDialog = false
    },

    async verifySerial() {
      if (!this.serialNumber) {
        Notify.create({
          type: 'negative',
          message: 'Please enter a serial number',
          position: 'top',
        })
        return
      }

      if (!this.validateSerial(this.serialNumber)) {
        Notify.create({
          type: 'negative',
          message: 'Invalid serial format. Use 3 letters + 7 numbers (SNO0000001)',
          position: 'top',
        })
        return
      }

      if (this.consumedSerials.includes(this.serialNumber)) {
        this.message = 'This serial has already been marked as bought'
        this.messageType = 'negative'
        return
      }

      this.loading = true
      try {
        const res = await axios.get(
          `${this.authStore.baseUrl}/verify/serial-numbers/${this.serialNumber}`,
          {
            headers: { Authorization: `Bearer ${this.authStore.token}` },
          },
        )

        if (res.data.exists) {
          this.verifiedSerial = true
          this.lastConsumedSerial = null
          this.message = `Serial verified successfully! MRP: ₹${res.data.mrp ?? 'N/A'}`
          this.messageType = 'success'
        } else {
          this.verifiedSerial = false
          this.message = 'Serial number not found in our database'
          this.messageType = 'negative'
        }
      } catch (err) {
        this.verifiedSerial = false
        this.message = err.response?.data?.message || 'Verification failed. Please try again.'
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
          { serialNumber: this.serialNumber, userId: this.authStore.user.id },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        )

        if (res.data.success) {
          // Store locally
          this.consumedSerials.push(this.serialNumber)
          LocalStorage.set('consumedSerials', this.consumedSerials)

          // Save last consumed info for display
          this.lastConsumedSerial = {
            serialNumber: this.serialNumber,
            mrp: res.data.mrp ?? 'N/A',
            commissionAmount: res.data.commissionEarned,
          }

          this.message = 'Purchase registered successfully!'
          this.messageType = 'success'
          this.serialNumber = ''
          this.verifiedSerial = false

          // Show success notification
          Notify.create({
            type: 'positive',
            message: `Commission earned: ₹${res.data.commissionEarned}`,
            icon: 'check_circle',
            position: 'top',
            timeout: 3000,
          })
        } else {
          this.message = res.data.message || 'Failed to register purchase'
          this.messageType = 'negative'
        }
      } catch (err) {
        this.message = err.response?.data?.message || 'Error registering purchase'
        this.messageType = 'negative'
      }
    },
  },
}
</script>

<style scoped>
/* Page Layout */
.mark-bought-page {
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

/* Cards */
.main-card,
.result-card,
.tips-card {
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
}

.main-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.result-card {
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.15);
  border-color: #764ba2;
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
  font-size: 16px;
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

.custom-input :deep(.q-field__control--disabled) {
  opacity: 0.6;
  background: #e0e0e0;
}

/* Status Banner */
.status-banner {
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

/* Action Buttons */
.action-buttons .q-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.action-buttons .verify-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none;
  color: white;
}

.action-buttons .verify-btn:hover {
  background: linear-gradient(135deg, #667eea 20%, #764ba2 120%) !important;
}

.action-buttons .mark-bought-btn {
  /* background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%) !important; */
  background: linear-gradient(135deg, #667eea 0%, #9c27b0 100%) !important;
  border: none;
  color: white;
}

.action-buttons .mark-bought-btn:hover {
  /* background: linear-gradient(135deg, #74b9ff 20%, #0984e3 120%) !important; */
  background: linear-gradient(135deg, #667eea 30%, #9c27b0 130%) !important;
}

.action-buttons .q-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

/* Details Grid */
.details-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.detail-item.highlight {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border: 2px solid #4caf50;
}

.detail-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #757575;
  font-weight: 600;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 18px;
  color: #212121;
}

/* Tips Card */
.tips-card {
  background: #fff8e1;
  border-color: #ffd54f;
}

.tips-list {
  margin: 0;
  padding-left: 20px;
  color: #616161;
  font-size: 14px;
  line-height: 1.8;
}

.tips-list li {
  margin-bottom: 4px;
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive */
@media (max-width: 600px) {
  .mark-bought-page {
    padding: 16px;
  }

  .page-header .text-h4 {
    font-size: 24px !important;
  }

  .main-card,
  .result-card,
  .tips-card {
    border-radius: 16px;
  }

  .q-card-section.q-pa-lg {
    padding: 20px !important;
  }

  .action-buttons .q-btn {
    height: 48px;
    font-size: 15px;
  }

  .detail-value {
    font-size: 16px;
  }
}

/* Utility */
.full-width {
  width: 100%;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
