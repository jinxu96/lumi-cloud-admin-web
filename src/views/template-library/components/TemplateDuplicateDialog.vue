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
          :disabled="true"
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

      <el-form-item :label="$t('templateLibrary.duplicate_form_target_file')" prop="fileId">
        <el-select
          v-model="localForm.fileId"
          filterable
          remote
          clearable
          :disabled="!canSelectTargetFile"
          :remote-method="handleFileSearch"
          :loading="fileLoading"
          :placeholder="$t('templateLibrary.duplicate_form_target_file_placeholder')"
          style="width: 100%;"
          @visible-change="handleFileDropdownVisible"
        >
          <el-option
            v-for="item in fileOptions"
            :key="item.id"
            :label="formatFileOptionLabel(item)"
            :value="item.id"
          />
        </el-select>
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
import { getUserFiles } from '@/api/userManage'
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
        status: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_status'), trigger: 'change' }],
        fileId: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_file'), trigger: 'change' }]
      },
      fileOptions: [],
      fileLoading: false,
      fileSearchQuery: '',
      baseTargetUserId: null,
      suppressTargetUserReload: false
    }
  },
  computed: {
    statusOptions() {
      return [
        { value: 'draft', label: this.$t('templateLibrary.status_draft') }
      ]
    },
    effectiveTargetUserId() {
      const explicit = this.normalizeUserId(this.localForm.targetUserId)
      if (Number.isInteger(explicit) && explicit > 0) {
        return explicit
      }
      if (Number.isInteger(this.baseTargetUserId) && this.baseTargetUserId > 0) {
        return this.baseTargetUserId
      }
      return NaN
    },
    canSelectTargetFile() {
      return Number.isInteger(this.effectiveTargetUserId) && this.effectiveTargetUserId > 0
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
        const fallbackIdRaw = newVal
          ? (newVal.target_user_id || newVal.targetUserId || (newVal.user && newVal.user.id) || newVal.user_id || newVal.userId)
          : ''
        const normalizedFallback = this.normalizeUserId(fallbackIdRaw)
        this.baseTargetUserId = Number.isInteger(normalizedFallback) && normalizedFallback > 0 ? normalizedFallback : null
        this.suppressTargetUserReload = true
        this.localForm = this.createLocalForm(newVal)
        this.$nextTick(() => {
          if (this.$refs.duplicateForm) {
            this.$refs.duplicateForm.clearValidate()
          }
          this.resetFileState()
          if (this.canSelectTargetFile) {
            this.fetchUserFiles()
          }
        })
      }
    },
    'localForm.targetUserId'(newVal, oldVal) {
      if (this.suppressTargetUserReload) {
        this.suppressTargetUserReload = false
        return
      }
      if (newVal === oldVal) {
        return
      }
      this.localForm.fileId = ''
      this.resetFileState()
      if (this.canSelectTargetFile) {
        this.fetchUserFiles()
      }
    }
  },
  methods: {
    createLocalForm(source = {}) {
      return {
        title: source.title || '',
        status: 'draft',
        targetUserId: source.target_user_id || source.targetUserId || '',
        copyMedia: typeof source.copy_media === 'boolean' ? source.copy_media : !!source.copyMedia,
        fileId: source.file_id || source.fileId || ''
      }
    },
    normalizeUserId(value) {
      if (value === '' || value === null || value === undefined) {
        return NaN
      }
      const parsed = Number(value)
      if (Number.isNaN(parsed)) {
        return NaN
      }
      return Math.trunc(parsed)
    },
    async fetchUserFiles(query = '') {
      const userId = this.effectiveTargetUserId
      if (!Number.isInteger(userId) || userId <= 0) {
        return
      }
      this.fileLoading = true
      try {
        const params = { limit: 20 }
        const keyword = (query || '').trim()
        if (keyword) {
          params.search = keyword
        }
        const { data } = await getUserFiles(userId, params)
        if (userId !== this.effectiveTargetUserId) {
          return
        }
        const list = (data && Array.isArray(data.list)) ? data.list : []
        this.fileOptions = list
      } catch (error) {
        this.fileOptions = []
      } finally {
        this.fileLoading = false
      }
    },
    handleFileSearch(query) {
      if (!this.canSelectTargetFile) {
        return
      }
      this.fileSearchQuery = query
      this.fetchUserFiles(query)
    },
    handleFileDropdownVisible(visible) {
      if (!visible || !this.canSelectTargetFile) {
        return
      }
      if (!this.fileOptions.length || this.fileSearchQuery) {
        this.fileSearchQuery = ''
        this.fetchUserFiles()
      }
    },
    resetFileState() {
      this.fileOptions = []
      this.fileSearchQuery = ''
      this.fileLoading = false
    },
    formatFileOptionLabel(file) {
      if (!file) {
        return ''
      }
      const name = file.original_name || file.name || `#${file.id}`
      const sizeValue = Number(file.size)
      const size = Number.isFinite(sizeValue) && sizeValue >= 0 ? this.formatBytes(sizeValue) : ''
      return size ? `${name} (${size})` : name
    },
    formatBytes(bytes) {
      if (!Number.isFinite(bytes) || bytes < 0) {
        return ''
      }
      if (bytes < 1024) {
        return `${bytes} B`
      }
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
      }
      if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
      }
      return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleClosed() {
      if (this.$refs.duplicateForm) {
        this.$refs.duplicateForm.resetFields()
      }
      this.localForm = this.createLocalForm()
      this.baseTargetUserId = null
      this.suppressTargetUserReload = false
      this.resetFileState()
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
          copy_media: !!this.localForm.copyMedia,
          file_id: this.normalizeUserId(this.localForm.fileId)
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
