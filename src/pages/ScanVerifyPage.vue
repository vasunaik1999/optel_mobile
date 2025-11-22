<template>
  <q-page class="q-pa-md flex flex-center column">
    <q-btn label="Scan QR" color="primary" @click="startScan" class="q-mb-md" />

    <div v-if="loading" class="q-mt-md">
      <q-spinner />
      <div class="text-grey q-mt-sm">Scanning...</div>
    </div>

    <div v-if="scannedValue && !loading" class="q-mt-lg">
      ✅ Scanned QR Code: <strong>{{ scannedValue }}</strong>
    </div>

    <div v-if="logMessages.length" class="q-mt-md q-pa-sm bg-grey-2">
      <strong>Logs:</strong>
      <div v-for="(msg, i) in logMessages" :key="i">{{ msg }}</div>
    </div>
  </q-page>
</template>

<script>
import { Capacitor } from '@capacitor/core'
import {
  CapacitorBarcodeScanner as BarcodeScanner,
  CapacitorBarcodeScannerTypeHint,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
} from '@capacitor/barcode-scanner'
import { LocalStorage, Notify } from 'quasar'
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

const authStore = useAuthStore()
export default {
  name: 'ScanVerifyPage',

  data() {
    return {
      scannedValue: '',
      loading: false,
      logMessages: [],
      verifiedSerial: false,
      message: '',
      messageType: '',
      authStore,
      consumedSerials: LocalStorage.getItem('consumedSerials') || [],
    }
  },

  methods: {
    log(msg) {
      console.log(msg)
      this.logMessages.push(msg)
    },

    async startScan() {
      this.log('--- startScan called ---')
      this.loading = true
      this.scannedValue = ''

      try {
        // Platform check
        if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
          this.log('Native platform detected; plugin will handle camera permissions.')
        }

        // Scan options
        const options = {
          hint: CapacitorBarcodeScannerTypeHint.ALL,
          scanInstructions: 'Place QR inside frame',
          scanButton: false,
          scanText: 'Scanning...',
          cameraDirection: CapacitorBarcodeScannerCameraDirection.BACK,
          scanOrientation: CapacitorBarcodeScannerScanOrientation.PORTRAIT,
          android: { scanningLibrary: 'ZXING' },
          web: { showCameraSelection: true, scannerFPS: 10 },
        }

        // Start scanning
        const result = await BarcodeScanner.scanBarcode(options)
        this.log('Raw scan result: ' + JSON.stringify(result))
        const scanned = result?.ScanResult || ''

        if (!scanned) {
          this.log('No QR code detected')
          this.loading = false
          return
        }

        // Check content type
        if (scanned.startsWith('S')) {
          // Detected a serial number
          this.scannedValue = scanned
          this.log('Detected serial number, converted to URL: ' + this.scannedValue)
        } else if (scanned.startsWith('http')) {
          // Detected URL
          this.scannedValue = scanned
          this.log('Detected URL: ' + this.scannedValue)
        } else {
          // Unknown type
          this.scannedValue = scanned
          this.log('Detected unknown QR content: ' + this.scannedValue)
        }
        // Immediately verify with backend
        await this.verifySerial(this.scannedValue)
      } catch (err) {
        this.log('Scan failed: ' + err)
      } finally {
        this.loading = false
      }
    },

    async verifySerial(serial) {
      if (!serial) return

      // Check local consumed list first
      if (this.consumedSerials.includes(serial)) {
        this.verifiedSerial = false
        this.message = 'Serial already marked as bought locally'
        this.messageType = 'negative'
        Notify.create({ type: 'negative', message: this.message })
        return
      }

      this.loading = true
      try {
        const res = await axios.get(`${this.authStore.baseUrl}/verify/serial-numbers/${serial}`, {
          headers: {
            Authorization: `Bearer ${this.authStore.token}`,
          },
        })

        if (res.data.exists) {
          this.verifiedSerial = true
          this.message = `Serial verified successfully! MRP: ${res.data.mrp ?? 'N/A'}`
          this.messageType = 'success'
          Notify.create({ type: 'positive', message: 'Serial verified successfully' })
        } else {
          this.verifiedSerial = false
          this.message = 'Serial not found in backend'
          this.messageType = 'negative'
          Notify.create({ type: 'negative', message: this.message })
        }
      } catch (err) {
        this.verifiedSerial = false
        this.message = err.response?.data?.message || 'Verification failed'
        this.messageType = 'negative'
        Notify.create({ type: 'negative', message: this.message })
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
            serialNumber: this.scannedValue,
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
          this.consumedSerials.push(this.scannedValue)
          LocalStorage.set('consumedSerials', this.consumedSerials)

          this.message = 'Marked as bought successfully!'
          this.messageType = 'success'
          this.scannedValue = ''
          this.verifiedSerial = false
          Notify.create({ type: 'positive', message: 'Marked as bought successfully' })
        } else {
          this.message = res.data.message || 'Failed to mark as bought'
          this.messageType = 'negative'
          Notify.create({ type: 'negative', message: this.message })
        }
      } catch (err) {
        this.message = err.response?.data?.message || 'Error marking as bought'
        this.messageType = 'negative'
        Notify.create({ type: 'negative', message: this.message })
      }
    },
  },
}
</script>
