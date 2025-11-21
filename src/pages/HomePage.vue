<template>
  <q-page padding class="flex flex-center">
    <q-card class="q-pa-md" style="width: 400px">
      <q-card-section>
        <div class="text-h5 q-mb-md">Welcome, {{ authStore.user?.name || 'Painter' }}</div>

        <!-- Navigation Buttons -->
        <q-btn
          label="Verification Scanner"
          color="primary"
          class="q-mb-sm full-width"
          @click="goTo('scanner')"
        />
        <q-btn
          label="Mark as Bought"
          color="secondary"
          class="q-mb-sm full-width"
          @click="goTo('markBought')"
        />
        <q-btn
          label="Redeem Points"
          color="accent"
          class="q-mb-sm full-width"
          @click="goTo('redeem')"
        />
        <q-btn label="Settings" color="grey" class="q-mb-sm full-width" @click="goTo('settings')" />
        <q-btn label="Logout" color="negative" class="full-width" @click="logout" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useAuthStore } from 'src/stores/authStore'

export default {
  name: 'HomePage',
  data() {
    return {
      authStore: useAuthStore(),
    }
  },
  methods: {
    goTo(page) {
      switch (page) {
        case 'scanner':
          this.$router.push('/scan-verify')
          break
        case 'markBought':
          this.$router.push('/mark-bought')
          break
        case 'redeem':
          this.$router.push('/redeem')
          break
        case 'settings':
          this.$router.push('/settings')
          break
      }
    },
    logout() {
      this.authStore.logout()
      this.$router.push('/')

      this.$q.notify({
        type: 'positive',
        message: 'Logged out successfully',
      })
    },
  },
}
</script>

<style scoped>
.q-page {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.full-width {
  width: 100%;
}
</style>
