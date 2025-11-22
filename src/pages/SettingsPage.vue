<template>
  <q-page class="settings-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="$router.back()" class="q-mr-md" />
        <div>
          <div class="text-h4 text-weight-bold text-grey-9">Settings</div>
          <div class="text-body2 text-grey-6">Configure your application</div>
        </div>
      </div>

      <!-- Backend Configuration Card -->
      <q-card flat bordered class="settings-card q-mb-md">
        <q-card-section class="card-header">
          <div class="row items-center">
            <q-icon name="dns" size="28px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold text-grey-9">Backend Configuration</div>
              <div class="text-caption text-grey-6">Configure your API connection settings</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <!-- Backend URL Input -->
          <div class="q-mb-lg">
            <label class="input-label">Backend URL *</label>
            <q-input
              v-model="baseUrl"
              outlined
              placeholder="https://api.example.com"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="link" color="primary" />
              </template>
              <template v-slot:append v-if="baseUrl">
                <q-icon
                  :name="isValidUrl(baseUrl) ? 'check_circle' : 'error'"
                  :color="isValidUrl(baseUrl) ? 'positive' : 'negative'"
                />
              </template>
            </q-input>

            <!-- Fixed height hint/error container -->
            <div
              class="input-hint"
              :class="{ 'text-negative': baseUrl && !isValidUrl(baseUrl) }"
              style="min-height: 20px"
            >
              <q-icon name="info" size="14px" class="q-mr-xs" />
              <span v-if="!baseUrl || isValidUrl(baseUrl)">
                Enter the complete URL including https://
              </span>
              <span v-else>Invalid URL format</span>
            </div>
          </div>

          <!-- API Key Input -->
          <div class="q-mb-lg">
            <label class="input-label">
              API Key
              <q-chip dense size="sm" color="grey-3" text-color="grey-7" class="q-ml-xs">
                Optional
              </q-chip>
            </label>
            <q-input
              v-model="apiKey"
              :type="showApiKey ? 'text' : 'password'"
              outlined
              placeholder="Enter your API key"
              class="custom-input"
            >
              <template v-slot:prepend>
                <q-icon name="key" color="grey-6" />
              </template>
              <template v-slot:append>
                <q-icon
                  :name="showApiKey ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-6"
                  @click="showApiKey = !showApiKey"
                />
              </template>
            </q-input>
            <div class="input-hint">
              <q-icon name="security" size="14px" class="q-mr-xs" />
              Your API key is stored securely on your device
            </div>
          </div>

          <!-- Save Button -->
          <q-btn
            unelevated
            rounded
            no-caps
            color="primary"
            label="Save Configuration"
            icon="save"
            class="full-width save-btn"
            @click="saveConfig"
            :disable="!baseUrl"
          />

          <!-- Connection Status -->
          <div v-if="connectionStatus" class="connection-status q-mt-md">
            <q-banner
              rounded
              :class="connectionStatus.type === 'success' ? 'success-banner' : 'warning-banner'"
            >
              <template v-slot:avatar> </template>
              <div class="text-weight-medium">
                <q-icon
                  :name="connectionStatus.type === 'success' ? 'check_circle' : 'warning'"
                  :color="connectionStatus.type === 'success' ? 'positive' : 'warning'"
                  size="24px"
                  class="q-mr-sm"
                />
                {{ connectionStatus.message }}
              </div>
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Account Section -->
      <q-card flat bordered class="settings-card q-mb-md">
        <q-card-section class="card-header">
          <div class="row items-center">
            <q-icon name="account_circle" size="28px" color="primary" class="q-mr-md" />
            <div>
              <div class="text-h6 text-weight-bold text-grey-9">Account</div>
              <div class="text-caption text-grey-6">Manage your account settings</div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-list padding>
          <q-item
            clickable
            v-ripple
            class="settings-item"
            @click="showComingSoonNotify('Profile section')"
          >
            <q-item-section avatar>
              <q-icon name="person" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Profile</q-item-label>
              <q-item-label caption>Edit your personal information</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            class="settings-item"
            @click="showComingSoonNotify('Notification section')"
          >
            <q-item-section avatar>
              <q-icon name="notifications" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Notifications</q-item-label>
              <q-item-label caption>Manage notification preferences</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-toggle v-model="notificationsEnabled" color="primary" />
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            class="settings-item"
            @click="showComingSoonNotify('Privacy & Policy section')"
          >
            <q-item-section avatar>
              <q-icon name="security" color="grey-7" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Privacy & Security</q-item-label>
              <q-item-label caption>Manage security settings</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon name="chevron_right" color="grey-5" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

      <!-- App Info Card -->
      <q-card flat bordered class="settings-card">
        <q-card-section class="q-pa-md text-center">
          <q-icon name="palette" size="48px" color="primary" class="q-mb-sm" />
          <div class="text-subtitle2 text-weight-medium text-grey-8 q-mb-xs">Painter App</div>
          <div class="text-caption text-grey-6">Version 1.0.0</div>
          <div class="q-mt-md">
            <q-btn flat dense no-caps color="primary" label="About" size="sm" @click="showAbout" />
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              label="Help"
              size="sm"
              @click="showComingSoonNotify('Help')"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { LocalStorage, Notify } from 'quasar'
import { useAuthStore } from 'src/stores/authStore'

export default {
  name: 'SettingsPage',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      baseUrl: '',
      apiKey: '',
      showApiKey: false,
      notificationsEnabled: true,
      connectionStatus: null,
    }
  },

  mounted() {
    // Load stored values if present
    this.baseUrl = this.authStore.baseUrl || ''
    this.apiKey = this.authStore.apiKey || ''
    this.notificationsEnabled = LocalStorage.getItem('notificationsEnabled') ?? true
  },

  methods: {
    isValidUrl(url) {
      try {
        const urlObj = new URL(url)
        return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
      } catch {
        return false
      }
    },

    saveConfig() {
      if (!this.baseUrl) {
        Notify.create({
          type: 'negative',
          message: 'Backend URL is required',
          position: 'top',
        })
        return
      }

      if (!this.isValidUrl(this.baseUrl)) {
        Notify.create({
          type: 'negative',
          message: 'Please enter a valid URL',
          position: 'top',
        })
        return
      }

      // Update store
      this.authStore.baseUrl = this.baseUrl
      this.authStore.apiKey = this.apiKey

      // Persist locally
      LocalStorage.set('baseUrl', this.baseUrl)
      LocalStorage.set('apiKey', this.apiKey)
      LocalStorage.set('notificationsEnabled', this.notificationsEnabled)

      // Show success status
      this.connectionStatus = {
        type: 'success',
        message: 'Configuration saved successfully!',
      }

      Notify.create({
        type: 'positive',
        message: 'Settings saved successfully!',
        icon: 'check_circle',
        position: 'top',
        timeout: 2000,
      })

      // Clear status after 5 seconds
      setTimeout(() => {
        this.connectionStatus = null
      }, 5000)
    },

    showAbout() {
      Notify.create({
        message: 'Painter - Professional painting management',
        icon: 'info',
        position: 'top',
        timeout: 3000,
      })
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
}
</script>

<style scoped>
/* Page Layout */
.settings-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  padding: 24px;
}

.page-container {
  max-width: 700px;
  margin: 0 auto;
  width: 100%;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  animation: fadeInDown 0.5s ease;
}

/* Settings Card */
.settings-card {
  border-radius: 20px;
  border: 1px solid #e0e0e0;
  background: white;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card-header {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px;
}

/* Input Styling */
.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 8px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 56px;
  font-size: 15px;
  background: #f8f9fa;
  transition: all 0.3s ease;
  align-items: center;
}

.custom-input :deep(.q-field__control:hover) {
  background: #ffffff;
}

.custom-input :deep(.q-field--focused .q-field__control) {
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-hint {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #757575;
  margin-top: 8px;
  padding-left: 4px;
}

/* Save Button */
.save-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.save-btn:disabled {
  opacity: 0.5;
}

/* Connection Status */
.connection-status {
  animation: fadeIn 0.4s ease;
}

.success-banner {
  background: #e8f5e9;
  border-left: 4px solid #4caf50;
}

.warning-banner {
  background: #fff3e0;
  border-left: 4px solid #ff9800;
}

/* Settings Items */
.settings-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: all 0.2s ease;
}

.settings-item:hover {
  background: #f8f9fa;
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

/* Responsive */
@media (max-width: 600px) {
  .settings-page {
    padding: 16px;
  }

  .page-header .text-h4 {
    font-size: 24px !important;
  }

  .settings-card {
    border-radius: 16px;
  }

  .card-header {
    padding: 16px;
  }

  .card-header .text-h6 {
    font-size: 18px !important;
  }

  .card-header .q-icon {
    font-size: 24px !important;
  }

  .q-card-section.q-pa-lg {
    padding: 20px !important;
  }

  .custom-input :deep(.q-field__control) {
    height: 52px;
  }

  .save-btn {
    height: 52px;
    font-size: 15px;
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
