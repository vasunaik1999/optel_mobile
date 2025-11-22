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
} from '@capacitor/barcode-scanner' // plugin exports `CapacitorBarcodeScanner` and enums

export default {
  name: 'ScanVerifyPage',

  data() {
    return {
      scannedValue: '',
      loading: false,
      logMessages: [],
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
        // Request permission
        // On native platforms the native implementation should handle permissions.
        // For web the browser will prompt for camera access when the scanner starts.
        if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
          this.log('Native platform detected; native plugin will handle camera permissions.')
        }

        // Scan options
        const options = {
          // Use the exported enums/numeric hints — web implementation expects these values
          hint: CapacitorBarcodeScannerTypeHint.ALL, // allow all formats for best detection
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
        this.log('Scan result: ' + JSON.stringify(result))

        if (!result || !result.ScanResult) {
          this.log('No QR code detected')
          this.loading = false
          return
        }

        this.scannedValue = result.ScanResult
        this.log('Scanned value: ' + this.scannedValue)
      } catch (err) {
        this.log('Scan failed: ' + err)
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
