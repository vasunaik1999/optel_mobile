<template>
  <q-page class="home-page">
    <!-- Floating QR Scanner -->
    <QrScanner />

    <div class="page-container">
      <!-- Welcome Header -->
      <div class="welcome-header q-mb-lg">
        <div class="text-h3 text-weight-bold text-grey-9 q-mb-xs">Welcome Back!</div>
        <div class="text-h5 text-primary text-weight-medium">
          {{ authStore.user?.name || 'Painter' }}
        </div>
        <div class="text-body2 text-grey-6 q-mt-sm">What would you like to do today?</div>
      </div>

      <!-- Stats Cards (Optional) -->
      <div class="row q-col-gutter-md">
        <div class="col-6">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <q-icon name="shopping_bag" size="32px" color="primary" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ stats.purchases }}</div>
              <div class="text-caption text-grey-6">Total Purchases</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card flat bordered class="stat-card">
            <q-card-section class="text-center">
              <q-icon name="stars" size="32px" color="accent" class="q-mb-sm" />
              <div class="text-h6 text-weight-bold">{{ stats.points }}</div>
              <div class="text-caption text-grey-6">Available Points</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Action Cards -->
      <div class="action-cards">
        <q-card flat bordered class="action-card primary-card" @click="goTo('markBought')">
          <q-card-section class="row items-center no-wrap">
            <div class="col-shrink">
              <div class="card-icon-wrapper bg-primary">
                <q-icon name="shopping_cart" size="32px" color="white" />
              </div>
            </div>
            <div class="col-grow q-ml-md">
              <div class="text-h6 text-weight-bold text-grey-9">Mark as Bought</div>
              <div class="text-body2 text-grey-6">Record your purchases</div>
            </div>
            <div class="col-auto">
              <q-icon name="chevron_right" size="24px" color="grey-5" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="action-card accent-card" @click="goTo('redeem')">
          <q-card-section class="row items-center no-wrap">
            <div class="col-shrink">
              <div class="card-icon-wrapper bg-accent">
                <q-icon name="redeem" size="32px" color="white" />
              </div>
            </div>
            <div class="col-grow q-ml-md">
              <div class="text-h6 text-weight-bold text-grey-9">Redeem Points</div>
              <div class="text-body2 text-grey-6">Use your rewards</div>
            </div>
            <div class="col-auto">
              <q-icon name="chevron_right" size="24px" color="grey-5" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="action-card accent-card" @click="goTo('aiInsights')">
          <q-card-section class="row items-center no-wrap">
            <div class="col-shrink">
              <div class="card-icon-wrapper bg-accent">
                <q-icon name="ai" size="32px" color="white" />
              </div>
            </div>
            <div class="col-grow q-ml-md">
              <div class="text-h6 text-weight-bold text-grey-9">AI Insights</div>
              <div class="text-body2 text-grey-6">Insights of current user</div>
            </div>
            <div class="col-auto">
              <q-icon name="chevron_right" size="24px" color="grey-5" />
            </div>
          </q-card-section>
        </q-card>

        <q-card flat bordered class="action-card secondary-card" @click="goTo('settings')">
          <q-card-section class="row items-center no-wrap">
            <div class="col-shrink">
              <div class="card-icon-wrapper bg-grey-4">
                <q-icon name="settings" size="32px" color="grey-9" />
              </div>
            </div>
            <div class="col-grow q-ml-md">
              <div class="text-h6 text-weight-bold text-grey-9">Settings</div>
              <div class="text-body2 text-grey-6">Manage preferences</div>
            </div>
            <div class="col-auto">
              <q-icon name="chevron_right" size="24px" color="grey-5" />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions q-mt-lg">
        <div class="text-subtitle2 text-weight-medium text-grey-7 q-mb-md">Quick Actions</div>
        <div class="row q-col-gutter-sm">
          <div class="col-4">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="showComingSoonNotify('Purchase History')"
            >
              <div class="column items-center">
                <q-icon name="history" size="24px" class="q-mb-xs" />
                <div class="text-caption">History</div>
              </div>
            </q-btn>
          </div>
          <div class="col-4">
            <q-btn
              flat
              class="quick-action-btn full-width"
              @click="showComingSoonNotify('Profile')"
            >
              <div class="column items-center">
                <q-icon name="person" size="24px" class="q-mb-xs" />
                <div class="text-caption">Profile</div>
              </div>
            </q-btn>
          </div>
          <div class="col-4">
            <q-btn flat class="quick-action-btn full-width" @click="showComingSoonNotify('Help')">
              <div class="column items-center">
                <q-icon name="help_outline" size="24px" class="q-mb-xs" />
                <div class="text-caption">Help</div>
              </div>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useAuthStore } from 'src/stores/authStore'
import QrScanner from 'src/components/QrScanner.vue'

export default {
  name: 'HomePage',

  components: {
    QrScanner,
  },

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      stats: {
        purchases: 24,
        points: 1250,
      },
    }
  },

  methods: {
    goTo(page) {
      const routes = {
        markBought: '/mark-bought',
        redeem: '/redeem',
        settings: '/settings',
        aiInsights: '/ai-insights',
      }

      if (routes[page]) {
        this.$router.push(routes[page])
      }
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
.home-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  padding: 24px;
}

.page-container {
  max-width: 600px;
  margin: 0 auto;
  width: 100%;
}

/* Welcome Header */
.welcome-header {
  text-align: center;
  animation: fadeInDown 0.6s ease;
}

/* Stats Cards */
.stat-card {
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  background: white;
  margin-bottom: 16px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Action Cards */
.action-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-card {
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
  background: white;
  overflow: hidden;
}

.action-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.action-card:active {
  transform: translateX(4px);
}

.primary-card:hover {
  border-color: var(--q-primary);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.accent-card:hover {
  border-color: var(--q-accent);
  box-shadow: 0 8px 24px rgba(255, 152, 0, 0.2);
}

.secondary-card:hover {
  border-color: #9e9e9e;
}

/* Card Icon Wrapper */
.card-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.action-card:hover .card-icon-wrapper {
  transform: scale(1.1) rotate(5deg);
}

/* Quick Actions */
.quick-actions {
  padding: 24px;
  background: white;
  border-radius: 16px;
  border: 1px solid #e0e0e0;
}

.quick-action-btn {
  border-radius: 12px;
  padding: 16px 8px;
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  background: #f5f5f5;
  transform: translateY(-2px);
}

.quick-action-btn .q-icon {
  color: #666;
}

.quick-action-btn:hover .q-icon {
  color: var(--q-primary);
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

/* Responsive Design */
@media (max-width: 600px) {
  .home-page {
    padding: 16px;
  }

  .welcome-header .text-h3 {
    font-size: 28px !important;
  }

  .welcome-header .text-h5 {
    font-size: 20px !important;
  }

  .stat-card {
    border-radius: 12px;
  }

  .action-card {
    border-radius: 12px;
  }

  .card-icon-wrapper {
    width: 56px;
    height: 56px;
  }

  .card-icon-wrapper .q-icon {
    font-size: 28px !important;
  }

  .action-card .text-h6 {
    font-size: 16px !important;
  }

  .quick-actions {
    padding: 16px;
    border-radius: 12px;
  }
}

@media (max-width: 400px) {
  .welcome-header .text-h3 {
    font-size: 24px !important;
  }

  .card-icon-wrapper {
    width: 48px;
    height: 48px;
  }

  .card-icon-wrapper .q-icon {
    font-size: 24px !important;
  }
}

/* Utility */
.full-width {
  width: 100%;
}
</style>
