<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="palette" /> Painter
        </q-toolbar-title>

        <q-space />

        <!-- User Info and Actions -->
        <div class="q-gutter-sm row items-center no-wrap">
          <template v-if="authStore.user && authStore.isAuthenticated">
            <q-btn flat icon-right="logout" @click="handleLogout" class="q-px-md" />
          </template>
          <template v-else>
            <q-btn flat label="Sign In" icon-right="login" to="/" class="q-px-md" />
          </template>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="500"
      class="bg-grey-1"
    >
      <!-- User Profile Section -->
      <div v-if="authStore.user && authStore.isAuthenticated" class="q-pa-md bg-primary text-white">
        <div class="row items-center q-mb-sm">
          <q-avatar size="56px" color="white" text-color="primary">
            <q-icon name="person" size="32px" />
          </q-avatar>
          <div class="q-ml-md">
            <div class="text-h6 text-weight-bold">{{ authStore.user.name }}</div>
            <div class="text-caption">{{ authStore.user.email }}</div>
          </div>
        </div>
      </div>

      <!-- Guest Banner -->
      <div v-else class="q-pa-md bg-grey-3 text-center">
        <q-icon name="person_outline" size="48px" color="grey-6" class="q-mb-sm" />
        <div class="text-body2 text-grey-7">Welcome, Guest</div>
        <q-btn outline color="primary" label="Sign In" to="/" class="q-mt-md full-width" />
      </div>

      <q-separator />

      <!-- Navigation Menu -->
      <q-list padding>
        <q-item
          clickable
          v-ripple
          to="/home"
          active-class="text-primary bg-blue-1"
          v-if="this.authStore.isAuthenticated"
        >
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Home</q-item-label>
            <q-item-label caption>Dashboard overview</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/settings" active-class="text-primary bg-blue-1">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Settings</q-item-label>
            <q-item-label caption>Configure your preferences</q-item-label>
          </q-item-section>
        </q-item>

        <!--
          <q-separator spaced />
        <q-item-label header class="text-weight-bold text-grey-8"> Quick Actions </q-item-label>

        <q-item clickable v-ripple @click="onNotifications">
          <q-item-section avatar>
            <q-badge color="red" floating>3</q-badge>
            <q-icon name="notifications" />
          </q-item-section>
          <q-item-section>
            <q-item-label>Notifications</q-item-label>
          </q-item-section>
        </q-item> -->
      </q-list>

      <q-separator />

      <!-- Footer -->
      <div class="absolute-bottom q-pa-sm text-center text-caption text-grey-6">
        <div>Quasar v{{ $q.version }}</div>
        <div class="q-mt-xs">&copy; 2025 Painter</div>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from 'vue'
import { useAuthStore } from 'src/stores/authStore'
const authStore = useAuthStore()
export default defineComponent({
  name: 'MainLayout',

  data() {
    return {
      leftDrawerOpen: false,
      authStore,
    }
  },

  methods: {
    toggleLeftDrawer() {
      this.leftDrawerOpen = !this.leftDrawerOpen
    },

    handleLogout() {
      // Implement your logout logic here
      this.$q.notify({
        color: 'positive',
        message: 'Logged out successfully',
        icon: 'check_circle',
      })
      this.authStore.logout()
      this.$router.push('/')
    },

    // onNotifications() {
    //   this.$q.notify({
    //     message: 'You have 3 new notifications',
    //     icon: 'notifications',
    //   })
    // },

    // onHelp() {
    //   this.$q.notify({
    //     message: 'Help & Support coming soon',
    //     icon: 'help',
    //   })
    // },
  },
})
</script>

<style scoped>
.q-item {
  border-radius: 8px;
  margin: 4px 8px;
}

.q-drawer {
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}
</style>
