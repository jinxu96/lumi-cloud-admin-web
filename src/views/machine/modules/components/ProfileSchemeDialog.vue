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
/**
 * 加工模块选项值映射
 * 用于构建加工模块下拉列表选项
 */
const PROCESSING_MODULE_OPTION_VALUES = {
  profile_dialog_module_option_combo: '蓝光/红外/激光',
  profile_dialog_module_option_blue: '蓝光',
  profile_dialog_module_option_infrared: '红外',
  profile_dialog_module_option_laser: '激光',
  profile_dialog_module_option_fiber: '光纤',
  profile_dialog_module_option_co2: 'CO₂',
  profile_dialog_module_option_co2_plain: 'CO2'
}

/**
 * 加工模式选项值映射
 * 用于构建加工模式下拉列表选项
 */
const PROCESSING_MODE_OPTION_VALUES = {
  profile_dialog_mode_option_flat_curved: '平面/曲面',
  profile_dialog_mode_option_flat: '平面',
  profile_dialog_mode_option_curved: '曲面',
  profile_dialog_mode_option_rotary: '旋转',
  profile_dialog_mode_option_switch: '模块切换'
}

/**
 * 加工类型选项值映射
 * 用于构建加工类型下拉列表选项
 */
const PROCESS_TYPE_OPTION_VALUES = {
  profile_dialog_type_option_cut_fill_line: '线条切割/填充雕刻/线条雕刻',
  profile_dialog_type_option_cut: '线条切割',
  profile_dialog_type_option_fill: '填充雕刻',
  profile_dialog_type_option_line: '线条雕刻',
  profile_dialog_type_option_color_print: '彩雕',
  profile_dialog_type_option_marking: '标记',
  profile_dialog_type_option_engrave: '雕刻'
}

export default {
  name: 'ProfileSchemeDialog',
  props: {
    /**
     * 所属机器模块ID
     * 用于提交时构建关联关系
     */
    machineModuleId: {
      type: [String, Number],
      required: true
    },
    /**
     * 对话框是否显示
     */
    visible: {
      type: Boolean,
      default: false
    },
    /**
     * 对话框模式（create:新增/edit:编辑）
     */
    mode: {
      type: String,
      default: 'create'
    },
    /**
     * 编辑时的加工方案数据对象
     */
    profile: {
      type: Object,
      default: null
    },
    /**
     * 模块默认功率值
     * 用于新增模式或编辑模式中的功率显示
     */
    defaultPower: {
      type: [Number, String, null],
      default: null
    }
  },
  data() {
    return {
      submitting: false, // 提交中状态
      form: this.createDefaultForm(), // 表单数据对象
      rules: { // 表单验证规则
        processing_module: [
          { required: true, message: this.$t('machineModule.profile_dialog_rules_module'), trigger: 'change' }
        ]
      },
      processingModuleOptions: this.createProcessingModuleOptions(), // 加工模块下拉选项列表
      processingModeOptions: this.createProcessingModeOptions(), // 加工模式下拉选项列表
      processTypeOptions: this.createProcessTypeOptions() // 加工类型下拉选项列表
    }
  },
  computed: {
    /**
     * 对话框标题
     * 根据当前模式（新增/编辑）返回对应的标题
     */
    dialogTitle() {
      return this.mode === 'edit'
        ? this.$t('machineModule.profile_dialog_title_edit')
        : this.$t('machineModule.profile_dialog_title')
    }
  },
  watch: {
    /**
     * 监听对话框显示状态
     * 显示时重新加载选项和重置表单
     */
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
    /**
     * 监听模块默认功率变化
     * 在新增模式下自动同步最新的模块功率
     */
    defaultPower(newVal, oldVal) {
      if (newVal === oldVal) {
        return
      }
      if (this.mode !== 'edit') {
        this.form.power_watt = this.normalizePower(this.defaultPower) // 同步最新模块功率
      }
    },
    /**
     * 监听加工方案数据变化
     * 编辑模式下检测到数据变化时刷新选项并同步到表单
     */
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
    /**
     * 监听对话框模式变化
     * 模式切换时重新刷新选项和重置表单
     */
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
    /**
     * 创建默认表单对象
     * @returns {Object} 包含所有表单字段的默认值对象
     */
    createDefaultForm() {
      return {
        processing_module: '',
        processing_mode: '',
        process_type: '',
        power_watt: this.normalizePower(this.defaultPower),
        sort_order: 0
      }
    },
    /**
     * 创建加工模块选项列表
     * 根据常量映射构建下拉列表选项
     * @returns {Array} 加工模块选项数组
     */
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
    /**
     * 创建加工模式选项列表
     * 根据常量映射构建下拉列表选项
     * @returns {Array} 加工模式选项数组
     */
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
    /**
     * 创建加工类型选项列表
     * 根据常量映射构建下拉列表选项
     * @returns {Array} 加工类型选项数组
     */
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
    /**
     * 构建选项列表
     * 将翻译键值和常量值映射转换为下拉列表选项
     * 自动去重并过滤无效选项
     * @param {Array} keys - i18n翻译键数组
     * @param {Object} valueMap - 值映射对象
     * @returns {Array} 格式化后的选项数组
     */
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
    /**
     * 确保指定值存在于选项列表中
     * 如果值不存在则添加到列表末尾
     * @param {String} listKey - data中选项列表的属性名
     * @param {String} value - 要确保存在的值
     */
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
    /**
     * 刷新所有选项列表
     * 重新生成所有下拉列表的选项
     * 并确保表单当前值在选项中存在
     */
    refreshSelectOptions() {
      this.processingModuleOptions = this.createProcessingModuleOptions()
      this.processingModeOptions = this.createProcessingModeOptions()
      this.processTypeOptions = this.createProcessTypeOptions()
      this.ensureSelectOption('processingModuleOptions', this.form.processing_module)
      this.ensureSelectOption('processingModeOptions', this.form.processing_mode)
      this.ensureSelectOption('processTypeOptions', this.form.process_type)
    },
    /**
     * 重置表单
     * 编辑模式下同步profile数据到表单
     * 新增模式下重置为默认值
     */
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
    /**
     * 规范化功率值
     * 将字符串/null等值转换为有效的数值或null
     * @param {Number|String|null} value - 输入的功率值
     * @returns {Number|null} 规范化后的功率值
     */
    normalizePower(value) {
      if (value === null || value === undefined || value === '') {
        return null
      }
      const numeric = Number(value)
      return Number.isNaN(numeric) ? null : numeric
    },
    /**
     * 同步加工方案数据到表单
     * 用于编辑模式下将profile对象的值填充到form中
     * 并确保所有值的有效性和选项的完整性
     */
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
    /**
     * 取消对话框
     * 关闭对话框但不提交任何数据
     */
    cancel() {
      this.$emit('update:visible', false)
    },
    /**
     * 处理对话框关闭事件
     * 重置表单、清除提交状态并触发closed事件
     */
    handleClosed() {
      this.resetForm()
      this.submitting = false
      this.$emit('closed')
    },
    /**
     * 构建提交数据对象
     * 从表单数据中提取并规范化各字段，构建API提交所需的payload
     * @returns {Object} 提交数据对象
     */
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
    /**
     * 提交表单数据
     * 验证表单、构建payload、触发submit事件
     * 由父组件决定是否关闭对话框
     */
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
