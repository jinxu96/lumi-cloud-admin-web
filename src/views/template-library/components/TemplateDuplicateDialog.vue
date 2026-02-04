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

      <el-form-item :label="$t('templateLibrary.duplicate_form_target_file')" prop="fileIds">
        <el-select
          v-model="localForm.fileIds"
          filterable
          remote
          clearable
          multiple
          collapse-tags
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

/**
 * 模板复制对话框组件
 * 用于收集模板复制时的额外参数(标题、目标用户、目标文件等)，并通过 submit 事件将数据传递给父组件
 */
export default {
  name: 'TemplateDuplicateDialog',
  props: {
    // 对话框是否可见
    visible: {
      type: Boolean,
      default: false
    },
    // 提交按钮的加载状态
    submitting: {
      type: Boolean,
      default: false
    },
    // 表单初始数据
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      // 对话框内部可见状态
      innerVisible: this.visible,
      // 本地表单数据
      localForm: this.createLocalForm(this.formData),
      // 表单验证规则
      rules: {
        title: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_title'), trigger: 'blur' }],
        status: [{ required: true, message: this.$t('templateLibrary.duplicate_rule_status'), trigger: 'change' }],
        fileIds: [{ type: 'array', required: true, message: this.$t('templateLibrary.duplicate_rule_file'), trigger: 'change' }]
      },
      // 文件选项列表
      fileOptions: [],
      // 文件加载状态
      fileLoading: false,
      // 文件搜索关键词
      fileSearchQuery: '',
      // 基础目标用户ID(从formData中解析)
      baseTargetUserId: null,
      // 抑制目标用户变更时的文件重新加载
      suppressTargetUserReload: false
    }
  },
  computed: {
    // 状态选项列表(目前仅支持草稿状态)
    statusOptions() {
      return [
        { value: 'draft', label: this.$t('templateLibrary.status_draft') }
      ]
    },
    // 有效的目标用户ID(优先使用用户输入的，否则使用基础值)
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
    // 是否可以选择目标文件(需要有效的目标用户ID)
    canSelectTargetFile() {
      return Number.isInteger(this.effectiveTargetUserId) && this.effectiveTargetUserId > 0
    }
  },
  watch: {
    // 同步外部visible prop到内部状态
    visible(newVal) {
      this.innerVisible = newVal
    },
    // 同步内部visible状态到外部(实现v-model)
    innerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    // 监听formData变化，更新本地表单数据
    formData: {
      deep: true,
      handler(newVal) {
        // 从多种可能的字段中提取目标用户ID
        const fallbackIdRaw = newVal
          ? (newVal.target_user_id || newVal.targetUserId || (newVal.user && newVal.user.id) || newVal.user_id || newVal.userId)
          : ''
        const normalizedFallback = this.normalizeUserId(fallbackIdRaw)
        this.baseTargetUserId = Number.isInteger(normalizedFallback) && normalizedFallback > 0 ? normalizedFallback : null
        // 防止formData更新时触发targetUserId的watch重新加载文件
        this.suppressTargetUserReload = true
        this.localForm = this.createLocalForm(newVal)
        this.$nextTick(() => {
          // 清除表单验证状态
          if (this.$refs.duplicateForm) {
            this.$refs.duplicateForm.clearValidate()
          }
          // 重置文件选择状态
          this.resetFileState()
          // 如果可以选择文件，则加载文件列表
          if (this.canSelectTargetFile) {
            this.fetchUserFiles()
          }
        })
      }
    },
    // 监听目标用户ID变化，重新加载文件列表
    'localForm.targetUserId'(newVal, oldVal) {
      // 如果是由formData更新触发的，跳过此次处理
      if (this.suppressTargetUserReload) {
        this.suppressTargetUserReload = false
        return
      }
      if (newVal === oldVal) {
        return
      }
      // 清空已选择的文件
      this.localForm.fileIds = []
      // 重置文件相关状态
      this.resetFileState()
      // 如果有有效的用户ID，重新加载该用户的文件列表
      if (this.canSelectTargetFile) {
        this.fetchUserFiles()
      }
    }
  },
  methods: {
    /**
     * 创建本地表单数据对象
     * @param {Object} source - 源数据对象
     * @returns {Object} 标准化后的表单数据
     */
    createLocalForm(source = {}) {
      return {
        title: source.title || '',
        status: 'draft',
        targetUserId: source.target_user_id || source.targetUserId || '',
        copyMedia: typeof source.copy_media === 'boolean' ? source.copy_media : !!source.copyMedia,
        fileIds: this.normalizeFileIds(source.file_ids || source.fileIds || source.file_id || source.fileId)
      }
    },
    /**
     * 标准化用户ID(转换为整数)
     * @param {*} value - 待标准化的值
     * @returns {number} 标准化后的整数或NaN
     */
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
    /**
     * 标准化文件ID列表(确保返回有效的ID数组)
     * @param {Array|number|string} value - 待标准化的文件ID(单个或数组)
     * @returns {Array<number>} 有效的文件ID数组
     */
    normalizeFileIds(value) {
      if (Array.isArray(value)) {
        return value
          .map(item => this.normalizeUserId(item))
          .filter(item => Number.isInteger(item) && item > 0)
      }
      const single = this.normalizeUserId(value)
      return Number.isInteger(single) && single > 0 ? [single] : []
    },
    /**
     * 获取指定用户的文件列表
     * @param {string} query - 搜索关键词
     */
    async fetchUserFiles(query = '') {
      const userId = this.effectiveTargetUserId
      // 确保有有效的用户ID
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
        // 防止用户ID在请求期间发生变化导致数据错乱
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
    /**
     * 处理文件搜索(远程搜索)
     * @param {string} query - 搜索关键词
     */
    handleFileSearch(query) {
      if (!this.canSelectTargetFile) {
        return
      }
      this.fileSearchQuery = query
      this.fetchUserFiles(query)
    },
    /**
     * 处理文件下拉框显示/隐藏事件
     * @param {boolean} visible - 是否可见
     */
    handleFileDropdownVisible(visible) {
      if (!visible || !this.canSelectTargetFile) {
        return
      }
      if (!this.fileOptions.length || this.fileSearchQuery) {
        this.fileSearchQuery = ''
        this.fetchUserFiles()
      }
    },
    /**
     * 重置文件相关状态
     */
    resetFileState() {
      this.fileOptions = []
      this.fileSearchQuery = ''
      this.fileLoading = false
    },
    /**
     * 格式化文件选项的显示标签
     * @param {Object} file - 文件对象
     * @returns {string} 格式化后的标签文本(文件名 + 文件大小)
     */
    formatFileOptionLabel(file) {
      if (!file) {
        return ''
      }
      const name = file.original_name || file.name || `#${file.id}`
      const sizeValue = Number(file.size)
      const size = Number.isFinite(sizeValue) && sizeValue >= 0 ? this.formatBytes(sizeValue) : ''
      return size ? `${name} (${size})` : name
    },
    /**
     * 格式化字节大小为可读格式
     * @param {number} bytes - 字节数
     * @returns {string} 格式化后的大小字符串(B/KB/MB/GB)
     */
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
    /**
     * 关闭对话框(触发visible更新)
     */
    handleClose() {
      this.$emit('update:visible', false)
    },
    /**
     * 对话框关闭后的清理操作
     */
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
    /**
     * 提交表单数据
     * 验证通过后将数据转换为API所需格式并触发submit事件
     */
    handleSubmit() {
      if (!this.$refs.duplicateForm) {
        return
      }
      this.$refs.duplicateForm.validate(valid => {
        if (!valid) {
          return
        }
        // 构建提交数据(使用下划线命名以匹配API格式)
        const payload = {
          title: this.localForm.title,
          status: this.localForm.status,
          copy_media: !!this.localForm.copyMedia,
          file_ids: this.normalizeFileIds(this.localForm.fileIds)
        }
        // 如果指定了目标用户ID，添加到payload中
        const targetId = this.localForm.targetUserId
        if (targetId !== '' && targetId !== null && targetId !== undefined) {
          const parsed = Number(targetId)
          if (!Number.isNaN(parsed)) {
            payload.target_user_id = parsed
          }
        }
        // 触发submit事件，将数据传递给父组件
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
