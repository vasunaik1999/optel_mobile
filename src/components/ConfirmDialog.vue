<template>
  <q-dialog
    v-model="showDialog"
    transition-show="slide-up"
    transition-hide="slide-down"
    position="bottom"
    class="confirm-dialog"
  >
    <q-card class="dialog-card" flat>
      <!-- Header with Icon -->
      <q-card-section class="dialog-header text-center q-pt-xl q-pb-md">
        <div class="icon-wrapper q-mb-md">
          <q-avatar size="80px" class="bg-gradient">
            <q-icon name="shopping_cart_checkout" size="42px" color="white" />
          </q-avatar>
        </div>
        <div class="text-h5 text-weight-bold text-grey-9 q-mb-xs">Confirm Purchase</div>
        <div class="text-body2 text-grey-6">This action cannot be undone</div>
      </q-card-section>

      <!-- Message Content -->
      <q-card-section class="q-px-xl q-pb-md">
        <div class="message-box">
          <q-icon name="info" size="20px" color="primary" class="q-mr-sm" />
          <div class="text-body1 text-grey-8">
            Are you sure you want to mark this product as bought?
          </div>
        </div>
      </q-card-section>

      <!-- Action Buttons -->
      <q-card-section class="q-px-xl q-pb-xl">
        <div class="action-buttons">
          <q-btn
            unelevated
            rounded
            no-caps
            color="primary"
            label="Yes, Confirm Purchase"
            icon="contactless"
            class="full-width q-mb-sm confirm-btn"
            @click="confirm"
          />
          <q-btn
            flat
            rounded
            no-caps
            color="grey-7"
            label="Cancel"
            class="full-width cancel-btn"
            @click="cancel"
          />
        </div>
      </q-card-section>

      <!-- Swipe Indicator (Mobile) -->
      <div class="swipe-indicator">
        <div class="swipe-bar"></div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',

  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'confirmed', 'cancelled'],

  data() {
    return {
      showDialog: this.modelValue,
    }
  },

  watch: {
    modelValue(val) {
      this.showDialog = val
    },
    showDialog(val) {
      this.$emit('update:modelValue', val)
    },
  },

  methods: {
    confirm() {
      this.$emit('confirmed')
      this.showDialog = false
    },
    cancel() {
      this.$emit('cancelled')
      this.showDialog = false
    },
  },
}
</script>

<style scoped>
/* Dialog Card */
.dialog-card {
  width: 100%;
  max-width: 500px;
  border-radius: 24px 24px 0 0;
  background: white;
  position: relative;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
}

/* Header */
.dialog-header {
  animation: fadeInDown 0.4s ease;
}

/* Icon Wrapper */
.icon-wrapper {
  display: inline-block;
  animation: bounceIn 0.6s ease;
}

.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
}

/* Message Box */
.message-box {
  display: flex;
  align-items: flex-start;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 16px;
  border-left: 4px solid var(--q-primary);
  line-height: 1.6;
}

/* Action Buttons */
.action-buttons {
  animation: fadeInUp 0.4s ease;
}

.confirm-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
  transition: all 0.3s ease;
}

.confirm-btn:active {
  transform: scale(0.98);
}

.cancel-btn {
  height: 52px;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #f5f5f5;
}

/* Swipe Indicator */
.swipe-indicator {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.swipe-bar {
  width: 40px;
  height: 4px;
  background: #d0d0d0;
  border-radius: 2px;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

/* Responsive */
@media (max-width: 600px) {
  .dialog-card {
    max-width: 100%;
    border-radius: 24px 24px 0 0;
  }

  .dialog-header {
    padding-top: 48px !important;
  }

  .text-h5 {
    font-size: 22px !important;
  }

  .q-card-section.q-px-xl {
    padding-left: 24px !important;
    padding-right: 24px !important;
  }
}

@media (max-width: 400px) {
  .icon-wrapper .q-avatar {
    width: 70px;
    height: 70px;
  }

  .icon-wrapper .q-icon {
    font-size: 36px !important;
  }

  .confirm-btn {
    height: 52px;
    font-size: 15px;
  }
}

/* Desktop Override */
@media (min-width: 601px) {
  .confirm-dialog :deep(.q-dialog__inner) {
    padding: 0;
  }

  .dialog-card {
    border-radius: 24px;
    margin: auto;
  }

  .swipe-indicator {
    display: none;
  }
}

/* Utility */
.full-width {
  width: 100%;
}
</style>
