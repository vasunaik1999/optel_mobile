<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="bg-white text-grey-9" height-hint="64">
      <q-toolbar class="q-py-sm">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
          class="q-mr-sm"
        />

        <q-toolbar-title class="text-weight-bold row items-center">
          <q-icon name="palette" size="28px" color="primary" class="q-mr-sm" />
          <span class="text-primary">Painter</span>
        </q-toolbar-title>

        <q-space />

        <!-- Desktop User Actions -->
        <div class="q-gutter-sm row items-center no-wrap gt-xs">
          <template v-if="authStore.user && authStore.isAuthenticated">
            <div class="q-mr-md text-body2 text-grey-7">
              <div class="text-weight-medium text-grey-9">{{ authStore.user.name }}</div>
              <div class="text-caption">{{ authStore.user.email }}</div>
            </div>
            <q-btn
              unelevated
              rounded
              color="grey-3"
              text-color="grey-9"
              icon="logout"
              label="Logout"
              @click="handleLogout"
              class="q-px-md"
            />
          </template>
          <template v-else>
            <q-btn
              unelevated
              rounded
              color="primary"
              icon="login"
              label="Sign In"
              to="/"
              class="q-px-lg"
            />
          </template>
        </div>

        <!-- Mobile User Actions -->
        <div class="lt-sm">
          <template v-if="authStore.user && authStore.isAuthenticated">
            <q-btn flat round dense icon="logout" @click="handleLogout">
              <q-tooltip>Logout</q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-btn flat round dense icon="login" to="/">
              <q-tooltip>Sign In</q-tooltip>
            </q-btn>
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Sidebar Drawer -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="1024"
      class="bg-grey-1"
    >
      <!-- User Profile Section -->
      <div v-if="authStore.user && authStore.isAuthenticated" class="q-pa-lg bg-gradient">
        <div class="row items-center">
          <q-avatar size="64px" class="shadow-2">
            <img v-if="authStore.user.avatar" :src="authStore.user.avatar" alt="User Avatar" />
            <q-icon v-else name="person" size="36px" color="white" />
          </q-avatar>
          <div class="q-ml-md text-white">
            <div class="text-h6 text-weight-bold q-mb-xs">
              {{ authStore.user.name }}
            </div>
            <div class="text-caption" style="opacity: 0.9">
              {{ authStore.user.email }}
            </div>
          </div>
        </div>
      </div>

      <!-- Guest Banner -->
      <div v-else class="q-pa-lg bg-gradient text-center">
        <q-avatar size="80px" class="q-mb-md shadow-2">
          <q-icon name="person_outline" size="40px" color="white" />
        </q-avatar>
        <div class="text-h6 text-white text-weight-medium q-mb-xs">Welcome!</div>
        <div class="text-body2 text-white q-mb-md" style="opacity: 0.9">
          Sign in to access all features
        </div>
        <q-btn
          unelevated
          rounded
          color="white"
          text-color="primary"
          label="Sign In"
          to="/"
          class="full-width q-py-sm"
        />
      </div>

      <q-separator />

      <!-- Navigation Menu -->
      <q-scroll-area class="fit" style="height: calc(100% - 270px) !important">
        <q-list padding class="q-pa-md">
          <q-item
            v-if="authStore.isAuthenticated"
            clickable
            v-ripple
            to="/home"
            active-class="active-link"
            class="rounded-borders q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="home" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Home</q-item-label>
              <q-item-label caption lines="1" class="active-link-caption"
                >Dashboard overview</q-item-label
              >
            </q-item-section>
          </q-item>

          <q-item
            clickable
            v-ripple
            to="/settings"
            active-class="active-link"
            class="rounded-borders q-mb-xs"
          >
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-weight-medium">Settings</q-item-label>
              <q-item-label caption lines="1" class="active-link-caption"
                >Configure preferences</q-item-label
              >
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <!-- Footer -->
      <div class="absolute-bottom bg-white q-pa-md text-center border-top">
        <div class="text-caption text-grey-6">
          <div class="text-weight-medium">Quasar v{{ $q.version }}</div>
          <div class="q-mt-xs">&copy; 2025 Painter. All rights reserved.</div>
        </div>
      </div>
    </q-drawer>

    <!-- Main Content -->
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
import { useAuthStore } from 'src/stores/authStore'

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      leftDrawerOpen: false,
    }
  },

  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    handleLogout() {
      this.$q.notify({
        color: 'positive',
        message: 'Logged out successfully',
        icon: 'check_circle',
        position: 'top',
      })
      this.authStore.logout()
      this.$router.push('/')
    },

    onProfile() {
      this.$q.notify({
        message: 'Opening profile...',
        icon: 'account_circle',
        position: 'top',
      })
    },

    onHelp() {
      this.$q.notify({
        message: 'Help & Support coming soon',
        icon: 'help',
        position: 'top',
      })
    },
  },
})
</script>

<style scoped>
/* Header Styling */
.q-header {
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.12),
    0 1px 2px rgba(0, 0, 0, 0.04);
}

/* Gradient Background */
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Drawer Styling */
.q-drawer {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08);
}

/* Navigation Items */
.q-item {
  border-radius: 12px;
  margin: 2px 0;
  transition: all 0.2s ease;
}

.q-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
  transform: translateX(4px);
}

.q-item.q-router-link--active {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.25);
}

/* Border Top */
.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.active-link {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
}

.active-link .active-link-caption {
  color: white !important;
}

/* Rounded borders utility */
.rounded-borders {
  border-radius: 12px;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .q-toolbar-title {
    font-size: 16px;
  }
}

/* Scroll area customization */
.q-scrollarea__thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.q-scrollarea__thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>
