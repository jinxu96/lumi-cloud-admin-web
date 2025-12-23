<template>
  <el-dialog
    :title="dialogTitle"
    :visible.sync="visible"
    width="640px"
    :close-on-click-modal="false"
    @closed="handleClosed"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="140px">
      <el-form-item :label="$t('machineModule.profile_dialog_module')" prop="processing_module">
        <el-input
          v-model="form.processing_module"
          maxlength="60"
          show-word-limit
          clearable
          placeholder="蓝光/红外/激光"
        />
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_mode')">
        <el-input
          v-model="form.processing_mode"
          maxlength="60"
          show-word-limit
          clearable
          placeholder="平面/曲面"
        />
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_type')">
        <el-input
          v-model="form.process_type"
          maxlength="60"
          show-word-limit
          clearable
          placeholder="切割/雕刻"
        />
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_power')">
        <!-- 功率固定沿用模块设定，仅用于展示 -->
        <el-input-number
          v-model="form.power_watt"
          :min="0"
          :max="200000"
          :step="10"
          controls-position="right"
          :disabled="true"
        />
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_sort')">
        <el-input-number
          v-model="form.sort_order"
          :min="0"
          :max="9999"
          :step="1"
          controls-position="right"
        />
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="cancel">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">
        {{ $t('common.save') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'ProfileSchemeDialog',
  props: {
    machineModuleId: {
      type: [String, Number],
      required: true
    },
    visible: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      default: 'create'
    },
    profile: {
      type: Object,
      default: null
    },
    defaultPower: {
      type: [Number, String, null],
      default: null
    }
  },
  data() {
    return {
      submitting: false,
      form: this.createDefaultForm(),
      rules: {
        processing_module: [
          { required: true, message: this.$t('machineModule.profile_dialog_rules_module'), trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.mode === 'edit'
        ? this.$t('machineModule.profile_dialog_title_edit')
        : this.$t('machineModule.profile_dialog_title')
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.$nextTick(() => {
            this.resetForm()
          })
        }
      }
    },
    defaultPower(newVal, oldVal) {
      if (newVal === oldVal) {
        return
      }
      if (this.mode !== 'edit') {
        this.form.power_watt = this.normalizePower(this.defaultPower) // 同步最新模块功率
      }
    },
    profile: {
      immediate: true,
      deep: true,
      handler() {
        if (this.mode === 'edit' && this.visible) {
          this.$nextTick(() => {
            this.syncProfileToForm()
          })
        }
      }
    },
    mode: {
      immediate: true,
      handler() {
        if (this.visible) {
          this.$nextTick(() => {
            this.resetForm()
          })
        }
      }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        processing_module: '',
        processing_mode: '',
        process_type: '',
        power_watt: this.normalizePower(this.defaultPower),
        sort_order: 0
      }
    },
    resetForm() {
      if (this.mode === 'edit' && this.profile) {
        this.syncProfileToForm()
      } else {
        this.form = this.createDefaultForm()
        if (this.$refs.formRef) {
          this.$refs.formRef.clearValidate()
        }
      }
    },
    normalizePower(value) {
      if (value === null || value === undefined || value === '') {
        return null
      }
      const numeric = Number(value)
      return Number.isNaN(numeric) ? null : numeric
    },
    syncProfileToForm() {
      const source = this.profile || {}
      this.form = {
        processing_module: source.processing_module || '',
        processing_mode: source.processing_mode || '',
        process_type: source.process_type || '',
        power_watt: this.normalizePower(
          source.power_watt !== undefined ? source.power_watt : this.defaultPower
        ),
        sort_order: typeof source.sort_order === 'number'
          ? source.sort_order
          : Number(source.sort_order) || 0
      }
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },
    cancel() {
      this.$emit('update:visible', false)
    },
    handleClosed() {
      this.resetForm()
      this.submitting = false
      this.$emit('closed')
    },
    buildPayload() {
      const payload = {
        machine_module_id: Number(this.machineModuleId),
        processing_module: this.form.processing_module.trim(),
        processing_mode: this.form.processing_mode ? this.form.processing_mode.trim() : '',
        process_type: this.form.process_type ? this.form.process_type.trim() : '',
        power_watt: this.normalizePower(
          this.form.power_watt !== undefined ? this.form.power_watt : this.defaultPower
        ),
        sort_order: Number(this.form.sort_order) || 0
      }
      return payload
    },
    submit() {
      if (this.submitting) {
        return
      }
      this.$refs.formRef.validate(valid => {
        if (!valid) {
          return
        }
        const payload = this.buildPayload()
        if (!payload.processing_module) {
          return
        }
        this.submitting = true
        // 由父组件负责实际提交，并通知是否需要关闭弹窗
        this.$emit('submit', {
          mode: this.mode,
          payload,
          profileId: this.profile && this.profile.id ? this.profile.id : null
        }, (shouldClose = true) => {
          this.submitting = false
          if (shouldClose) {
            this.$emit('update:visible', false)
          }
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-footer {
  text-align: right;
}
</style>
