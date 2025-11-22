<template>
  <q-dialog v-model="showDialog">
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="row items-center">
          <q-icon name="help_outline" size="32px" color="primary" class="q-mr-md" />
          <div class="text-h6">Confirm Purchase</div>
        </div>
        <q-btn flat round dense icon="close" @click="cancel" />
      </q-card-section>

      <q-card-section> Are you sure you want to mark this product as bought? </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="grey" v-close-popup @click="cancel" />
        <q-btn flat label="Yes, Buy" color="primary" @click="confirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: { modelValue: { type: Boolean, default: false } },
  emits: ['update:modelValue', 'confirmed', 'cancelled'],
  data() {
    return { showDialog: this.modelValue }
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
