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
import {
  CapacitorBarcodeScanner as BarcodeScanner,
  CapacitorBarcodeScannerCameraDirection,
  CapacitorBarcodeScannerScanOrientation,
  CapacitorBarcodeScannerTypeHint,
} from '@capacitor/barcode-scanner'
import { Notify } from 'quasar'

export default {
  name: 'QrScanner',
  methods: {
    async startScan() {
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
        const scannedValue = result?.ScanResult || ''

        if (!scannedValue) {
          Notify.create({ type: 'negative', message: 'No QR code detected' })
          return
        }

        if (!scannedValue.startsWith('S')) {
          Notify.create({ type: 'negative', message: 'Scanned QR is not a serial number' })
          return
        }

        // Redirect to mark-bought page with query param
        this.$router.push({ path: '/mark-bought', query: { serial: scannedValue } })
      } catch (err) {
        console.error(err)
        Notify.create({ type: 'negative', message: 'Error scanning QR code' })
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
