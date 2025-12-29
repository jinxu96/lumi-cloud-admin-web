<template>
  <el-dialog
    :title="dialogTitle"
    :visible="visible"
    width="520px"
    :close-on-click-modal="false"
    @close="handleCancel"
    @closed="handleDialogClosed"
  >
    <el-form ref="scenarioForm" :model="localForm" :rules="rules" label-width="120px">
      <el-form-item :label="$t('applicationScenario.form_name')" prop="name">
        <el-input v-model="localForm.name" maxlength="120" show-word-limit />
      </el-form-item>
      <el-form-item :label="$t('applicationScenario.form_code')" prop="code">
        <el-input v-model="localForm.code" maxlength="60" />
      </el-form-item>
      <el-form-item :label="$t('applicationScenario.form_icon_url')">
        <el-input v-model="localForm.icon_url" maxlength="255" />
      </el-form-item>
      <el-form-item :label="$t('applicationScenario.form_description')">
        <el-input v-model="localForm.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item :label="$t('applicationScenario.form_is_active')">
        <el-switch v-model="localForm.is_active" />
      </el-form-item>
      <el-form-item :label="$t('applicationScenario.form_sort_order')">
        <el-input-number v-model="localForm.sort_order" :min="0" :max="9999" :step="1" controls-position="right" />
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">
        {{ isEdit ? $t('common.save') : $t('common.confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
// 生成干净的表单数据
const createDefaultForm = () => ({
  name: '',
  code: '',
  icon_url: '',
  description: '',
  is_active: true,
  sort_order: 0
})

export default {
  name: 'ScenarioDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    scenario: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localForm: createDefaultForm(),
      rules: {
        name: [{ required: true, message: this.$t('applicationScenario.form_rules_name'), trigger: 'blur' }],
        code: [{ required: true, message: this.$t('applicationScenario.form_rules_code'), trigger: 'blur' }]
      }
    }
  },
  computed: {
    dialogTitle() {
      return this.isEdit
        ? this.$t('applicationScenario.dialog_edit_title')
        : this.$t('applicationScenario.dialog_create_title')
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        if (value) {
          this.syncForm()
        }
      }
    },
    scenario: {
      deep: true,
      handler() {
        if (this.visible) {
          this.syncForm()
        }
      }
    }
  },
  methods: {
    // 将外部传入的数据同步到本地表单
    syncForm() {
      const base = createDefaultForm()
      this.localForm = {
        ...base,
        ...this.scenario,
        is_active: this.scenario && this.scenario.is_active !== undefined
          ? Boolean(this.scenario.is_active)
          : base.is_active,
        sort_order: this.scenario && this.scenario.sort_order !== undefined
          ? Number(this.scenario.sort_order) || 0
          : base.sort_order
      }
    },
    // 关闭弹窗
    handleCancel() {
      this.$emit('update:visible', false)
    },
    // 弹窗关闭后清理表单
    handleDialogClosed() {
      this.$refs.scenarioForm && this.$refs.scenarioForm.resetFields()
      this.localForm = createDefaultForm()
      this.$emit('closed')
    },
    // 表单提交
    handleSubmit() {
      if (!this.$refs.scenarioForm) {
        return
      }
      this.$refs.scenarioForm.validate(valid => {
        if (!valid) {
          return
        }
        this.$emit('submit', { ...this.localForm })
      })
    }
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
