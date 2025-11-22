<template>
  <q-page class="flex flex-center bg-gradient main-bg">
    <div class="login-container">
      <!-- Decorative Background Elements -->
      <div class="decoration-circle circle-1"></div>
      <div class="decoration-circle circle-2"></div>
      <div class="decoration-circle circle-3"></div>

      <q-card class="login-card shadow-10" flat bordered>
        <!-- Logo/Header Section -->
        <q-card-section class="text-center q-pt-lg q-pb-md">
          <div class="logo-container q-mb-md">
            <q-avatar size="80px" class="bg-gradient shadow-4">
              <q-icon name="palette" size="48px" color="white" />
            </q-avatar>
          </div>
          <div class="text-h4 text-weight-bold text-grey-9 q-mb-xs">Welcome Back</div>
          <div class="text-body2 text-grey-6">Sign in to continue to Painter</div>
        </q-card-section>

        <!-- Form Section -->
        <q-card-section class="q-px-xl">
          <q-form @submit="handleLogin">
            <!-- User ID Input -->
            <div>
              <label class="input-label">User ID</label>
              <q-input
                v-model="userId"
                type="number"
                outlined
                dense
                class="custom-input"
                placeholder="Enter your user ID"
                :rules="[(val) => !!val || 'User ID is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="grey-6" />
                </template>
              </q-input>
            </div>

            <!-- Password Input -->
            <div class="q-mt-sm">
              <label class="input-label">Password</label>
              <q-input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                outlined
                dense
                class="custom-input"
                placeholder="Enter your password"
                :rules="[(val) => !!val || 'Password is required']"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" color="grey-6" />
                </template>
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    color="grey-6"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>

            <!-- Remember Me & Forgot Password -->
            <div class="row items-center justify-between q-mt-sm">
              <q-checkbox
                v-model="rememberMe"
                label="Remember me"
                dense
                color="primary"
                class="text-body2"
              />
              <a
                @click="showComingSoonNotify('Forgot Password')"
                class="text-primary text-body2 text-weight-medium no-underline"
              >
                Forgot Password?
              </a>
            </div>

            <!-- Login Button -->
            <q-btn
              type="submit"
              label="Sign In"
              color="primary"
              unelevated
              rounded
              no-caps
              size="lg"
              class="full-width q-mt-lg login-btn"
              :loading="loading"
            >
              <template v-slot:loading>
                <q-spinner-dots size="20px" />
              </template>
            </q-btn>
          </q-form>

          <!-- Divider -->
          <div class="row items-center q-my-lg">
            <div class="col divider-line"></div>
            <div class="col-auto q-px-md text-grey-6 text-body2">OR</div>
            <div class="col divider-line"></div>
          </div>

          <!-- Social Login -->
          <div class="row q-gutter-sm">
            <q-btn outline rounded no-caps class="col social-btn" @click="socialLogin('google')">
              <q-icon name="img:https://www.google.com/favicon.ico" size="20px" class="q-mr-sm" />
              Google
            </q-btn>
            <q-btn outline rounded no-caps class="col social-btn" @click="socialLogin('microsoft')">
              <q-icon name="business" size="20px" class="q-mr-sm" />
              Microsoft
            </q-btn>
          </div>
        </q-card-section>

        <!-- Footer -->
        <q-card-section class="text-center q-py-md bg-grey-1">
          <div class="text-body2 text-grey-7">
            Don't have an account?
            <a
              @click="showComingSoonNotify('Sign Up')"
              class="text-primary text-weight-medium no-underline"
            >
              Sign Up
            </a>
          </div>
        </q-card-section>
      </q-card>

      <!-- Footer Note -->
      <div class="text-center q-mt-lg">
        <div class="text-caption text-white" style="opacity: 0.8">
          &copy; 2025 Painter. All rights reserved.
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useAuthStore } from 'src/stores/authStore'
import axios from 'axios'

export default {
  name: 'LoginPage',

  setup() {
    const authStore = useAuthStore()
    return { authStore }
  },

  data() {
    return {
      userId: '',
      password: '',
      showPassword: false,
      rememberMe: false,
      loading: false,
    }
  },

  methods: {
    async handleLogin() {
      if (!this.userId || !this.password) {
        this.$q.notify({
          type: 'negative',
          message: 'Please fill in all fields',
          position: 'top',
          timeout: 2000,
        })
        return
      }

      this.loading = true

      try {
        const res = await axios.post(`${this.authStore.baseUrl}/verify/login`, {
          userId: this.userId,
          password: this.password,
        })

        if (res.data.success) {
          this.authStore.login(res.data.user, res.data.token)

          this.$q.notify({
            type: 'positive',
            message: `Welcome back, ${res.data.user.name}!`,
            position: 'top',
            timeout: 2000,
            icon: 'check_circle',
          })

          // Add slight delay for better UX
          setTimeout(() => {
            this.$router.push('/home')
          }, 300)
        } else {
          this.$q.notify({
            type: 'negative',
            message: res.data.message || 'Login failed',
            position: 'top',
            timeout: 3000,
          })
        }
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: err.response?.data?.message || err.message || 'Network error. Please try again.',
          position: 'top',
          timeout: 3000,
          icon: 'error',
        })
      } finally {
        this.loading = false
      }
    },

    socialLogin(provider) {
      this.$q.notify({
        message: `${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon`,
        icon: 'info',
        position: 'top',
        timeout: 2000,
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
/* Background Gradient */
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.main-bg {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

/* Decorative Circles */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  right: -50px;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 50%;
  left: -75px;
  opacity: 0.5;
}

/* Login Container */
.login-container {
  width: 100%;
  max-width: 480px;
  padding: 20px;
  position: relative;
  z-index: 1;
}

/* Login Card */
.login-card {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}

/* Logo Container */
.logo-container {
  animation: fadeInDown 0.6s ease;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Input Styling */
.input-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #424242;
  margin-bottom: 8px;
}

.custom-input :deep(.q-field__control) {
  border-radius: 12px;
  height: 48px;
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

/* Login Button */
.login-btn {
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.login-btn:hover {
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
  transform: translateY(-2px);
}

/* Divider */
.divider-line {
  height: 1px;
  background: #e0e0e0;
}

/* Social Buttons */
.social-btn {
  height: 44px;
  border-color: #e0e0e0;
  color: #424242;
  font-weight: 500;
  transition: all 0.3s ease;
}

.social-btn:hover {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
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

/* Responsive */
@media (max-width: 600px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    border-radius: 16px;
  }

  .q-card-section.q-px-xl {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }

  .text-h4 {
    font-size: 24px !important;
  }

  .logo-container .q-avatar {
    width: 64px !important;
    height: 64px !important;
  }

  .logo-container .q-icon {
    font-size: 36px !important;
  }
}

@media (max-width: 400px) {
  .row.q-gutter-sm {
    flex-direction: column;
  }

  .social-btn {
    width: 100%;
    margin-bottom: 8px;
  }
}

/* Remove text decoration */
.no-underline {
  text-decoration: none;
}

.no-underline:hover {
  text-decoration: underline;
}
</style>
