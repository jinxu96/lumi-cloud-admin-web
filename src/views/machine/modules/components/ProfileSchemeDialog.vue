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
        <el-select
          v-model="form.processing_module"
          clearable
          filterable
          :placeholder="$t('machineModule.profile_dialog_module_placeholder')"
        >
          <el-option
            v-for="option in processingModuleOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_mode')">
        <el-select
          v-model="form.processing_mode"
          clearable
          filterable
          :placeholder="$t('machineModule.profile_dialog_mode_placeholder')"
        >
          <el-option
            v-for="option in processingModeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('machineModule.profile_dialog_type')">
        <el-select
          v-model="form.process_type"
          clearable
          filterable
          :placeholder="$t('machineModule.profile_dialog_type_placeholder')"
        >
          <el-option
            v-for="option in processTypeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
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
const PROCESSING_MODULE_OPTION_VALUES = {
  profile_dialog_module_option_combo: '蓝光/红外/激光',
  profile_dialog_module_option_blue: '蓝光',
  profile_dialog_module_option_infrared: '红外',
  profile_dialog_module_option_laser: '激光',
  profile_dialog_module_option_fiber: '光纤',
  profile_dialog_module_option_co2: 'CO₂',
  profile_dialog_module_option_co2_plain: 'CO2'
}

const PROCESSING_MODE_OPTION_VALUES = {
  profile_dialog_mode_option_flat_curved: '平面/曲面',
  profile_dialog_mode_option_flat: '平面',
  profile_dialog_mode_option_curved: '曲面',
  profile_dialog_mode_option_rotary: '旋转',
  profile_dialog_mode_option_switch: '模块切换'
}

const PROCESS_TYPE_OPTION_VALUES = {
  profile_dialog_type_option_cut_fill_line: '切割/填充雕刻/线条雕刻',
  profile_dialog_type_option_cut: '切割',
  profile_dialog_type_option_fill: '填充雕刻',
  profile_dialog_type_option_line: '线条雕刻',
  profile_dialog_type_option_color_print: '彩打',
  profile_dialog_type_option_marking: '标记',
  profile_dialog_type_option_engrave: '雕刻'
}

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
          { required: true, message: this.$t('machineModule.profile_dialog_rules_module'), trigger: 'change' }
        ]
      },
      processingModuleOptions: this.createProcessingModuleOptions(),
      processingModeOptions: this.createProcessingModeOptions(),
      processTypeOptions: this.createProcessTypeOptions()
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
          this.refreshSelectOptions()
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
          this.refreshSelectOptions()
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
          this.refreshSelectOptions()
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
    createProcessingModuleOptions() {
      const keys = [
        // 'profile_dialog_module_option_combo',
        'profile_dialog_module_option_blue',
        'profile_dialog_module_option_infrared',
        // 'profile_dialog_module_option_laser',
        'profile_dialog_module_option_fiber'
        // 'profile_dialog_module_option_co2',
        // 'profile_dialog_module_option_co2_plain'
      ]
      return this.buildOptionList(keys, PROCESSING_MODULE_OPTION_VALUES)
    },
    createProcessingModeOptions() {
      const keys = [
        // 'profile_dialog_mode_option_flat_curved',
        'profile_dialog_mode_option_flat',
        'profile_dialog_mode_option_curved'
        // 'profile_dialog_mode_option_rotary',
        // 'profile_dialog_mode_option_switch'
      ]
      return this.buildOptionList(keys, PROCESSING_MODE_OPTION_VALUES)
    },
    createProcessTypeOptions() {
      const keys = [
        // 'profile_dialog_type_option_cut_fill_line',
        'profile_dialog_type_option_cut',
        'profile_dialog_type_option_fill',
        'profile_dialog_type_option_line',
        'profile_dialog_type_option_color_print',
        'profile_dialog_type_option_marking'
        // 'profile_dialog_type_option_engrave'
      ]
      return this.buildOptionList(keys, PROCESS_TYPE_OPTION_VALUES)
    },
    buildOptionList(keys = [], valueMap = {}) {
      const seen = new Set()
      return keys.map(key => {
        const label = this.$t(`machineModule.${key}`)
        const rawValue = valueMap[key]
        const normalizedValue = typeof rawValue === 'string' && rawValue.trim() ? rawValue.trim() : ''
        return {
          key,
          label: typeof label === 'string' && label.trim() ? label.trim() : normalizedValue,
          value: normalizedValue || (typeof label === 'string' ? label.trim() : '')
        }
      }).filter(item => {
        if (!item.value || !item.label || item.label === `machineModule.${item.key}`) {
          return false
        }
        if (seen.has(item.value)) {
          return false
        }
        seen.add(item.value)
        return true
      })
    },
    ensureSelectOption(listKey, value) {
      if (!value) {
        return
      }
      const normalized = String(value)
      if (!normalized) {
        return
      }
      const target = this[listKey]
      if (!Array.isArray(target)) {
        return
      }
      const exists = target.some(item => item && item.value === normalized)
      if (!exists) {
        target.push({ value: normalized, label: normalized })
      }
    },
    refreshSelectOptions() {
      this.processingModuleOptions = this.createProcessingModuleOptions()
      this.processingModeOptions = this.createProcessingModeOptions()
      this.processTypeOptions = this.createProcessTypeOptions()
      this.ensureSelectOption('processingModuleOptions', this.form.processing_module)
      this.ensureSelectOption('processingModeOptions', this.form.processing_mode)
      this.ensureSelectOption('processTypeOptions', this.form.process_type)
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
      this.ensureSelectOption('processingModuleOptions', this.form.processing_module)
      this.ensureSelectOption('processingModeOptions', this.form.processing_mode)
      this.ensureSelectOption('processTypeOptions', this.form.process_type)
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
        processing_module: this.form.processing_module ? this.form.processing_module.trim() : '',
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
