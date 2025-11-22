<template>
  <!-- Floating button -->
  <q-btn
    round
    icon="qr_code_scanner"
    color="primary"
    glossy
    size="lg"
    class="fixed-bottom-right q-mb-md q-mr-md"
    @click="startScan"
  />
</template>

<script>
// import { Capacitor } from '@capacitor/core'
import {
  CapacitorBarcodeScanner as BarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { LocalStorage, Notify } from 'quasar'
import axios from 'axios'
import { useAuthStore } from 'src/stores/authStore'

export default {
  // name: 'QrScanner',
  data() {
    return {
      authStore: useAuthStore(),
      consumedSerials: LocalStorage.getItem('consumedSerials') || [],
    }
  },
  methods: {
    async startScan() {
      let scannedValue = ''
      try {
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

        const result = await BarcodeScanner.scanBarcode(options)
        scannedValue = result?.ScanResult || ''

        if (!scannedValue) {
          Notify.create({ type: 'negative', message: 'No QR code detected' })
          return
        }

        if (!scannedValue.startsWith('S')) {
          Notify.create({ type: 'negative', message: 'Scanned QR is not a serial number' })
          return
        }

        if (this.consumedSerials.includes(scannedValue)) {
          Notify.create({ type: 'negative', message: 'Serial already marked as bought locally' })
          return
        }

        // Call backend API to mark as bought
        const res = await axios.post(
          `${this.authStore.baseUrl}/verify/consume`,
          { serialNumber: scannedValue, userId: this.authStore.user.id },
          { headers: { Authorization: `Bearer ${this.authStore.token}` } },
        )

        if (res.data.success) {
          this.consumedSerials.push(scannedValue)
          LocalStorage.set('consumedSerials', this.consumedSerials)
          Notify.create({ type: 'positive', message: 'Marked as bought successfully!' })
        } else {
          Notify.create({
            type: 'negative',
            message: res.data.message || 'Failed to mark as bought',
          })
        }
      } catch (err) {
        console.error(err)
        Notify.create({ type: 'negative', message: 'Error scanning or marking as bought' })
      }
    },
  },
}
</script>

<style scoped>
.fixed-bottom-right {
  position: fixed;
  bottom: 16px;
  right: 16px;
  z-index: 9999;
}
</style>
