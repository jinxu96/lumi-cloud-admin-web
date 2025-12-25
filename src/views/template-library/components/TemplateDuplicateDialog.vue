<template>
  <el-dialog
    :title="$t('templateLibrary.duplicate_dialog_title')"
    :visible.sync="innerVisible"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
    @closed="handleClosed"
  >
    <el-form ref="duplicateForm" :model="localForm" :rules="rules" label-width="120px">
      <el-form-item :label="$t('templateLibrary.duplicate_form_title')" prop="title">
        <el-input v-model="localForm.title" maxlength="150" show-word-limit />
      </el-form-item>

      <el-form-item :label="$t('templateLibrary.duplicate_form_status')" prop="status">
        <el-select
          v-model="localForm.status"
          clearable
          :placeholder="$t('templateLibrary.duplicate_status_placeholder')"
        >
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('templateLibrary.duplicate_form_target_user')">
        <el-input
          v-model="localForm.targetUserId"
          type="number"
          :placeholder="$t('templateLibrary.duplicate_form_target_placeholder')"
        />
      </el-form-item>

      <el-form-item :label="$t('templateLibrary.duplicate_form_copy_media')">
        <div class="copy-media-field">
          <el-switch v-model="localForm.copyMedia" />
          <span class="copy-media-hint">{{ $t('templateLibrary.duplicate_form_copy_media_hint') }}</span>
        </div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('templateLibrary.duplicate_form_cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('templateLibrary.duplicate_form_confirm') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
// 模板复制弹窗，收集额外参数后抛出 submit 事件
export default {
  name: 'TemplateDuplicateDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    submitting: {
      type: Boolean,
      default: false
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      innerVisible: this.visible,
      localForm: this.createLocalForm(this.formData),
      rules: {
        title: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_title'), trigger: 'blur' }],
        status: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_status'), trigger: 'change' }]
      }
    }
  },
  computed: {
    statusOptions() {
      return [
        { value: 'draft', label: this.$t('templateLibrary.status_draft') },
        { value: 'published', label: this.$t('templateLibrary.status_published') }
      ]
    }
  },
  watch: {
    visible(newVal) {
      this.innerVisible = newVal
    },
    innerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    formData: {
      deep: true,
      handler(newVal) {
        this.localForm = this.createLocalForm(newVal)
        this.$nextTick(() => {
          if (this.$refs.duplicateForm) {
            this.$refs.duplicateForm.clearValidate()
          }
        })
      }
    }
  },
  methods: {
    createLocalForm(source = {}) {
      return {
        title: source.title || '',
        status: source.status || '',
        targetUserId: source.target_user_id || source.targetUserId || '',
        copyMedia: typeof source.copy_media === 'boolean' ? source.copy_media : !!source.copyMedia
      }
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleClosed() {
      if (this.$refs.duplicateForm) {
        this.$refs.duplicateForm.resetFields()
      }
      this.localForm = this.createLocalForm()
      this.$emit('closed')
    },
    handleSubmit() {
      if (!this.$refs.duplicateForm) {
        return
      }
      this.$refs.duplicateForm.validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          title: this.localForm.title,
          status: this.localForm.status,
          copy_media: !!this.localForm.copyMedia
        }
        const targetId = this.localForm.targetUserId
        if (targetId !== '' && targetId !== null && targetId !== undefined) {
          const parsed = Number(targetId)
          if (!Number.isNaN(parsed)) {
            payload.target_user_id = parsed
          }
        }
        this.$emit('submit', payload)
      })
    }
  }
}
</script>

<style scoped>
.copy-media-field {
  display: flex;
  align-items: center;
  gap: 12px;
}

.copy-media-hint {
  color: #909399;
  font-size: 12px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
