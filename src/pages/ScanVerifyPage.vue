<template>
  <q-page class="flex flex-center column">
    <div class="text-h4">QR Code Scanner</div>
    <q-btn v-if="!isScanning" label="Start Scanning" color="primary" @click="startContinuousScan" />
    <q-btn v-if="isScanning" label="Stop Scanning" color="negative" @click="stopScanning" />
    <div v-if="scannedDataList.length > 0" class="q-mt-md">
      <p>Scanned QR Codes:</p>
      <ul>
        <li v-for="(data, index) in scannedDataList" :key="index">{{ data }}</li>
      </ul>
    </div>
    <div v-if="errorMessage" class="q-mt-md text-negative">Error: {{ errorMessage }}</div>
  </q-page>
</template>

<script>
import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning'

export default {
  name: 'ScanVerifyPage',
  data() {
    return {
      scannedDataList: [], // Array to store multiple scans
      errorMessage: '',
      isScanning: false,
      scanLoop: null, // To control the loop
    }
  },
  methods: {
    async startContinuousScan() {
      try {
        // Request camera permissions
        const permission = await BarcodeScanner.requestPermissions()
        if (permission.camera !== 'granted') {
          this.errorMessage = 'Camera permission denied.'
          return
        }

        this.isScanning = true
        this.errorMessage = ''
        this.scannedDataList = [] // Reset list

        // Start continuous scanning loop
        this.scanLoop = setInterval(async () => {
          try {
            const result = await BarcodeScanner.startScan()
            if (result && result.barcodes && result.barcodes.length > 0) {
              this.scannedDataList.push(result.barcodes[0].rawValue)
            }
          } catch (error) {
            // Handle individual scan errors (e.g., cancel)
            if (error.message.includes('cancel') || error.message.includes('back')) {
              this.stopScanning() // Stop on cancel
            } else {
              console.error('Scan error:', error)
            }
          }
        }, 1000) // Scan every 1 second; adjust as needed
      } catch (error) {
        console.error('Barcode scan error:', error)
        this.errorMessage = `Scanning failed: ${error.message || 'Unknown error'}`
        this.isScanning = false
      }
    },
    stopScanning() {
      if (this.scanLoop) {
        clearInterval(this.scanLoop)
        this.scanLoop = null
      }
      this.isScanning = false
    },
  },
  beforeUnmount() {
    // Cleanup on component destroy
    this.stopScanning()
  },
}
</script>

<style scoped>
/* Add any custom styles if needed */
</style>
