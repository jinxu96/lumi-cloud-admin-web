<template>
  <el-dialog
    :title="$t('templateLibrary.edit_dialog_title')"
    :visible.sync="innerVisible"
    width="860px"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    @close="handleClose"
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <el-form ref="editForm" :model="localForm" :rules="rules" label-width="110px">
        <el-tabs v-model="activeTab" class="template-edit-tabs">
          <el-tab-pane :label="$t('templateLibrary.edit_tab_basic')" name="basic">
            <template-edit-basic-tab />
          </el-tab-pane>
          <el-tab-pane :label="$t('templateLibrary.edit_tab_media')" name="media">
            <template-edit-media-tab />
          </el-tab-pane>
          <el-tab-pane :label="$t('templateLibrary.edit_tab_instruction')" name="instruction">
            <template-edit-instruction-tab />
          </el-tab-pane>
          <el-tab-pane :label="$t('templateLibrary.edit_tab_attachment')" name="attachment">
            <template-edit-attachment-tab />
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('templateLibrary.edit_form_cancel') }}</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">
        {{ $t('templateLibrary.edit_form_save') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import TemplateEditBasicTab from './TemplateEditBasicTab.vue'
import TemplateEditMediaTab from './TemplateEditMediaTab.vue'
import TemplateEditInstructionTab from './TemplateEditInstructionTab.vue'
import TemplateEditAttachmentTab from './TemplateEditAttachmentTab.vue'
import { getProjectTemplateUploadSignature } from '@/api/projectTemplate'
import { uploadFileToOss, inferMediaTypeByMime } from '@/utils/oss'

const MEDIA_ITEM_LIMIT = 20
const IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const VIDEO_ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm']
const IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024
const VIDEO_MAX_FILE_SIZE = 60 * 1024 * 1024
const INSTRUCTION_STEP_LIMIT = 20
const INSTRUCTION_STEP_SETTINGS_LIMIT = 20
const INSTRUCTION_STEP_MEDIA_LIMIT = 10
const INSTRUCTION_FILE_ALLOWED_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx']
const INSTRUCTION_FILE_MAX_FILE_SIZE = 20 * 1024 * 1024

// 生成带有指定前缀的随机 key，便于 v-for 渲染追踪
function createRandomKey(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// 构建媒体条目使用的唯一 key
function createMediaKey() {
  return createRandomKey('media')
}

// 构建步骤条目使用的唯一 key
function createInstructionStepKey() {
  return createRandomKey('instruction-step')
}

// 构建步骤参数使用的唯一 key
function createInstructionSettingKey() {
  return createRandomKey('instruction-setting')
}

// 构建步骤媒体使用的唯一 key
function createInstructionMediaKey() {
  return createRandomKey('instruction-media')
}

// 从后端返回列表中提取 id 集合，统一处理驼峰与下划线字段
function extractRelationIds(items, candidates = []) {
  if (!Array.isArray(items)) {
    return []
  }
  const ids = []
  items.forEach(item => {
    if (!item) {
      return
    }
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(item, key) && item[key] !== undefined && item[key] !== null) {
        ids.push(item[key])
        return
      }
      if (item.pivot && Object.prototype.hasOwnProperty.call(item.pivot, key) && item.pivot[key] !== undefined && item.pivot[key] !== null) {
        ids.push(item.pivot[key])
        return
      }
    }
    if (item.id !== undefined && item.id !== null) {
      ids.push(item.id)
    }
  })
  return Array.from(new Set(ids))
}

// 解析文件扩展名并统一为小写
function getFileExtension(fileName = '') {
  const matched = fileName.split('.').pop()
  if (!matched || matched === fileName) {
    return ''
  }
  return matched.toLowerCase()
}

// 去除文件扩展名，保留原文件名主体
function stripExtension(fileName = '') {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot <= 0) {
    return fileName
  }
  return fileName.slice(0, lastDot)
}

// 将元数据对象安全序列化为 JSON 字符串
function stringifyMetadata(metadata) {
  if (!metadata) {
    return ''
  }
  if (typeof metadata === 'string') {
    return metadata
  }
  try {
    return JSON.stringify(metadata, null, 2)
  } catch (error) {
    return ''
  }
}

// 创建步骤参数对的本地状态
function createInstructionSettingPair(source = {}) {
  return {
    __key: source.__key || createInstructionSettingKey(),
    name: source.label || source.name || '',
    value: source.value || ''
  }
}

// 创建步骤媒体条目的本地状态
function createInstructionMediaItem(source = {}) {
  return {
    __key: source.__key || createInstructionMediaKey(),
    media_type: source.media_type || source.type || 'image',
    media_url: source.media_url || source.mediaUrl || source.url || '',
    external_url: source.external_url || source.externalUrl || '',
    sort_order: Object.prototype.hasOwnProperty.call(source, 'sort_order') ? source.sort_order : (Object.prototype.hasOwnProperty.call(source, 'sortOrder') ? source.sortOrder : null),
    metadataText: stringifyMetadata(source.media_metadata || source.metadata || source.metadataText),
    _uploading: false,
    _uploadProgress: 0
  }
}

// 创建步骤条目的本地状态
function createInstructionStepItem(source = {}) {
  const settingsSource = Array.isArray(source.settingsPairs)
    ? source.settingsPairs
    : Array.isArray(source.settings)
      ? source.settings
      : []
  const mediaSource = Array.isArray(source.media) ? source.media : []
  return {
    __key: source.__key || createInstructionStepKey(),
    title: source.title || '',
    description: source.description || '',
    sort_order: Object.prototype.hasOwnProperty.call(source, 'sort_order') ? source.sort_order : (Object.prototype.hasOwnProperty.call(source, 'sortOrder') ? source.sortOrder : null),
    settingsPairs: settingsSource.map(item => createInstructionSettingPair(item)),
    media: mediaSource.map(item => createInstructionMediaItem(item))
  }
}

// 构造空步骤，供新增操作复用
function createEmptyInstructionStep() {
  return {
    __key: createInstructionStepKey(),
    title: '',
    description: '',
    sort_order: null,
    settingsPairs: [],
    media: []
  }
}

// 构造说明文件状态对象
function createInstructionFileState(source = {}) {
  return {
    url: source.url || '',
    name: source.name || '',
    metadataText: stringifyMetadata(source.metadata || source.metadataText),
    _uploading: false,
    _uploadProgress: 0
  }
}

// 构造空的步骤媒体条目
function createEmptyInstructionMedia() {
  return {
    __key: createInstructionMediaKey(),
    media_type: 'image',
    media_url: '',
    external_url: '',
    sort_order: null,
    metadataText: '',
    _uploading: false,
    _uploadProgress: 0
  }
}

export default {
  name: 'TemplateEditDialog',
  components: {
    TemplateEditBasicTab,
    TemplateEditMediaTab,
    TemplateEditInstructionTab,
    TemplateEditAttachmentTab
  },
  // provide 提供上下文给子标签页复用行为
  provide() {
    // 向子组件暴露当前弹窗上下文，便于读取状态与调用方法
    return {
      templateEditDialogContext: this
    }
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
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
    },
    options: {
      type: Object,
      default: () => ({ machines: [], materials: [], scenarios: [] })
    },
    canUpload: {
      type: Boolean,
      default: true
    }
  },
  data() {
    // 构建弹窗内部使用的状态对象
    return {
      innerVisible: this.visible,
      localForm: this.createLocalForm(this.formData),
      // 默认展示基础信息标签
      activeTab: 'basic',
      rules: {
        title: [{ required: true, message: this.$t('templateLibrary.edit_rule_title'), trigger: 'blur' }],
        machineModuleIds: [{ type: 'array', required: true, message: this.$t('templateLibrary.edit_rule_modules'), trigger: 'change' }]
      },
      uploadingCover: false,
      coverUploadProgress: 0
    }
  },
  computed: {
    // 组合机台模块的下拉选项结构
    moduleOptions() {
      const machines = (this.options && this.options.machines) ? this.options.machines : []
      return machines.map(machine => ({
        label: machine.name,
        children: (machine.modules || []).map(module => ({
          id: module.id,
          label: this.composeModuleLabel(module)
        }))
      })).filter(group => group.children.length)
    },
    // 加工材料选项
    materialOptions() {
      return (this.options && this.options.materials) ? this.options.materials : []
    },
    // 应用场景选项
    scenarioOptions() {
      return (this.options && this.options.scenarios) ? this.options.scenarios : []
    },
    // 媒体类型下拉配置
    mediaTypeOptions() {
      return [
        { value: 'image', label: this.$t('templateLibrary.edit_media_type_image') },
        { value: 'video', label: this.$t('templateLibrary.edit_media_type_video') }
      ]
    },
    // 操作说明媒体类型选项
    instructionMediaTypeOptions() {
      return [
        { value: 'image', label: this.$t('templateLibrary.edit_media_type_image') },
        { value: 'video', label: this.$t('templateLibrary.edit_media_type_video') },
        { value: 'youtube', label: this.$t('templateLibrary.edit_instruction_media_type_youtube') }
      ]
    },
    instructionDescriptionToolbar() {
      return [
        'undo redo | bold italic underline | alignleft aligncenter alignright',
        'bullist numlist | removeformat'
      ]
    },
    // 计算封面展示用的预览地址
    coverPreviewUrl() {
      if (this.localForm.coverUrl) {
        return this.localForm.coverUrl
      }
      const source = this.formData || {}
      if (source.cover_url) {
        return source.cover_url
      }
      if (source.cover && (source.cover.url || source.cover.preview_url)) {
        return source.cover.url || source.cover.preview_url
      }
      if (source.cover_media && (source.cover_media.url || source.cover_media.preview_url)) {
        return source.cover_media.url || source.cover_media.preview_url
      }
      return ''
    },
    // 封面上传控件的 accept 设置
    coverAcceptValue() {
      return IMAGE_ALLOWED_EXTENSIONS
        .map(item => (item.startsWith('.') ? item : `.${item}`))
        .join(',')
    },
    // 封面上传限制提示
    coverUploadHintText() {
      return this.$t('templateLibrary.edit_upload_hint', {
        types: IMAGE_ALLOWED_EXTENSIONS.join(', '),
        size: this.formatBytes(IMAGE_MAX_FILE_SIZE)
      })
    },
    instructionFileAcceptValue() {
      return INSTRUCTION_FILE_ALLOWED_EXTENSIONS
        .map(item => (item.startsWith('.') ? item : `.${item}`))
        .join(',')
    },
    instructionFileUploadHintText() {
      return this.$t('templateLibrary.edit_instruction_file_upload_hint', {
        types: INSTRUCTION_FILE_ALLOWED_EXTENSIONS.join(', '),
        size: this.formatBytes(INSTRUCTION_FILE_MAX_FILE_SIZE)
      })
    }
  },
  watch: {
    // 同步父组件传入的可见状态
    visible(newVal) {
      this.innerVisible = newVal
    },
    // 内部状态变化时通知父组件
    innerVisible(newVal) {
      this.$emit('update:visible', newVal)
    },
    formData: {
      deep: true,
      // 父组件数据变化时重建表单并清空校验
      handler(newVal) {
        this.localForm = this.createLocalForm(newVal)
        this.resetUploadState()
        this.$nextTick(() => {
          if (this.$refs.editForm) {
            this.$refs.editForm.clearValidate()
          }
        })
      }
    }
  },
  methods: {
    // 组装机台模块标签 (名称 + 功率)
    composeModuleLabel(module) {
      const name = module && module.name ? module.name : ''
      const rawPower = module ? module.power_watt : null
      const hasPower = rawPower === 0 || rawPower === '0' || !!rawPower
      if (!hasPower) {
        return name
      }
      const parsed = Number(rawPower)
      if (Number.isNaN(parsed)) {
        return name
      }
      if (!name) {
        return `${parsed}W`
      }
      return `${name} · ${parsed}W`
    },
    // 根据媒体类型动态返回 accept 字符串
    getMediaAcceptValue(item) {
      const isVideo = item && item.media_type === 'video'
      const extensions = isVideo ? VIDEO_ALLOWED_EXTENSIONS : IMAGE_ALLOWED_EXTENSIONS
      return extensions
        .map(ext => (ext.startsWith('.') ? ext : `.${ext}`))
        .join(',')
    },
    // 根据媒体类型生成提示文案
    getMediaUploadHint(item) {
      const isVideo = item && item.media_type === 'video'
      const extensions = isVideo ? VIDEO_ALLOWED_EXTENSIONS : IMAGE_ALLOWED_EXTENSIONS
      const maxSize = isVideo ? VIDEO_MAX_FILE_SIZE : IMAGE_MAX_FILE_SIZE
      return this.$t('templateLibrary.edit_upload_hint', {
        types: extensions.join(', '),
        size: this.formatBytes(maxSize)
      })
    },
    // 将外部数据转换为表单可编辑的本地副本
    createLocalForm(source = {}) {
      const machineModuleIds = Array.isArray(source.machine_module_ids) && source.machine_module_ids.length
        ? [...source.machine_module_ids]
        : Array.isArray(source.machineModuleIds) && source.machineModuleIds.length
          ? [...source.machineModuleIds]
          : extractRelationIds(source.machine_modules || source.machineModules, ['machine_module_id', 'module_id', 'id'])

      const materialIds = Array.isArray(source.material_ids) && source.material_ids.length
        ? [...source.material_ids]
        : Array.isArray(source.materialIds) && source.materialIds.length
          ? [...source.materialIds]
          : extractRelationIds(source.materials || source.materialList, ['material_id', 'id'])

      const scenarioIds = Array.isArray(source.scenario_ids) && source.scenario_ids.length
        ? [...source.scenario_ids]
        : Array.isArray(source.scenarioIds) && source.scenarioIds.length
          ? [...source.scenarioIds]
          : extractRelationIds(source.scenarios || source.scenarioList, ['scenario_id', 'id'])

      const coverUrl = source.cover_url || source.coverUrl || (source.cover && (source.cover.url || source.cover.preview_url)) || (source.cover_media && (source.cover_media.url || source.cover_media.preview_url)) || ''
      const coverMetadata = source.cover_metadata || source.coverMetadata || (source.cover && source.cover.metadata) || null

      const media = Array.isArray(source.media)
        ? source.media.map(item => ({
          __key: createMediaKey(),
          media_type: (item && item.media_type) || '',
          url: (item && item.url) || '',
          title: (item && item.title) || '',
          caption: (item && item.caption) || '',
          sort_order: item && Object.prototype.hasOwnProperty.call(item, 'sort_order') ? item.sort_order : null,
          metadataText: item && item.metadata ? JSON.stringify(item.metadata, null, 2) : '',
          _uploading: false,
          _uploadProgress: 0
        }))
        : []

      const instructionStepsSource = Array.isArray(source.instruction_steps)
        ? source.instruction_steps
        : Array.isArray(source.instructionSteps)
          ? source.instructionSteps
          : []
      const instructionSteps = instructionStepsSource.map(createInstructionStepItem)

      const instructionFileSource = source.instruction_file || source.instructionFile || null
      const instructionFile = createInstructionFileState(instructionFileSource || {})

      return {
        title: source.title || '',
        description: source.description || '',
        tags: Array.isArray(source.tags) ? [...source.tags] : [],
        machineModuleIds,
        materialIds,
        scenarioIds,
        coverUrl,
        coverMetadataText: coverMetadata ? JSON.stringify(coverMetadata, null, 2) : '',
        media,
        instructionSteps,
        instructionFile
      }
    },
    // 关闭对话框
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 弹窗关闭后重置表单
    handleClosed() {
      if (this.$refs.editForm) {
        this.$refs.editForm.resetFields()
      }
      this.localForm = this.createLocalForm()
      this.resetUploadState()
      this.activeTab = 'basic'
      this.$emit('closed')
    },
    // 清空上传中的状态标记
    resetUploadState() {
      this.uploadingCover = false
      this.coverUploadProgress = 0
      this.localForm.media = this.localForm.media.map(item => ({
        ...item,
        _uploading: false,
        _uploadProgress: 0
      }))
      this.localForm.instructionSteps = this.localForm.instructionSteps.map(step => ({
        ...step,
        media: Array.isArray(step.media)
          ? step.media.map(media => ({
            ...media,
            _uploading: false,
            _uploadProgress: 0
          }))
          : []
      }))
      if (this.localForm.instructionFile) {
        this.localForm.instructionFile._uploading = false
        this.localForm.instructionFile._uploadProgress = 0
      }
    },
    // 将字节数格式化为可读字符串
    formatBytes(value) {
      if (!value) {
        return '0 B'
      }
      const units = ['B', 'KB', 'MB', 'GB', 'TB']
      let size = value
      let unitIndex = 0
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024
        unitIndex += 1
      }
      return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`
    },
    // 校验文件的扩展名与大小
    validateSelectedFile(file, allowedExtensions, maxSize) {
      if (!file) {
        const error = new Error(this.$t('templateLibrary.edit_upload_no_file'))
        error.userMessage = error.message
        throw error
      }
      const extension = getFileExtension(file.name)
      const normalizedExtensions = Array.isArray(allowedExtensions)
        ? allowedExtensions.map(item => (item || '').toLowerCase()).filter(Boolean)
        : []
      if (!extension || !normalizedExtensions.includes(extension)) {
        const error = new Error(this.$t('templateLibrary.edit_upload_invalid_type'))
        error.userMessage = error.message
        throw error
      }
      if (maxSize && file.size > maxSize) {
        const error = new Error(this.$t('templateLibrary.edit_upload_invalid_size', { size: this.formatBytes(maxSize) }))
        error.userMessage = error.message
        throw error
      }
      return { extension }
    },
    // 调用后端接口获取 OSS 上传签名
    async requestUploadSignature(file, extension) {
      try {
        const response = await getProjectTemplateUploadSignature({
          file_name: file.name,
          extension,
          size: file.size,
          mime_type: file.type
        })
        const signature = response && response.data ? response.data : null
        if (!signature) {
          const error = new Error(this.$t('templateLibrary.edit_upload_signature_failed'))
          error.userMessage = error.message
          throw error
        }
        signature.extension = extension
        return signature
      } catch (error) {
        const message = error && error.userMessage ? error.userMessage : (error && error.message ? error.message : this.$t('templateLibrary.edit_upload_signature_failed'))
        const wrapped = new Error(message)
        wrapped.userMessage = message
        throw wrapped
      }
    },
    // 构建上传结果写入的元数据 JSON 文本
    buildMetadataText(signature, file) {
      const metadata = {
        object_key: signature.object_key,
        bucket: signature.bucket,
        region: signature.region,
        upload_host: signature.upload_host || '',
        preview_url: signature.preview_url || '',
        thumbnail_url: signature.thumbnail_url || null,
        file_name: file.name,
        size: file.size,
        mime_type: file.type || '',
        uploaded_at: new Date().toISOString()
      }
      return JSON.stringify(metadata, null, 2)
    },
    // 处理封面上传流程
    async handleCoverUpload(options) {
      if (!this.canUpload) {
        const error = new Error(this.$t('templateLibrary.edit_upload_permission_denied'))
        this.$message.error(error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      let extension
      try {
        const result = this.validateSelectedFile(options.file, IMAGE_ALLOWED_EXTENSIONS, IMAGE_MAX_FILE_SIZE)
        extension = result.extension
      } catch (error) {
        this.$message.error(error.userMessage || error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      this.uploadingCover = true
      this.coverUploadProgress = 0
      try {
        const signature = await this.requestUploadSignature(options.file, extension)
        const uploadResult = await uploadFileToOss(signature, options.file, percent => {
          this.coverUploadProgress = percent
          if (options.onProgress) {
            options.onProgress({ percent })
          }
        })
        this.localForm.coverUrl = uploadResult.previewUrl || uploadResult.uploadedUrl
        this.localForm.coverMetadataText = this.buildMetadataText(signature, options.file)
        this.$message.success(this.$t('templateLibrary.edit_upload_success'))
        if (options.onSuccess) {
          options.onSuccess(uploadResult, options.file)
        }
      } catch (error) {
        console.error(error)
        const message = error && error.userMessage ? error.userMessage : (error && error.message ? error.message : this.$t('templateLibrary.edit_upload_failed'))
        this.$message.error(message)
        if (options.onError) {
          options.onError(error)
        }
      } finally {
        this.uploadingCover = false
        this.coverUploadProgress = 0
      }
    },
    // 处理媒体列表单项上传流程
    async handleMediaUpload(options, index) {
      if (!this.canUpload) {
        const error = new Error(this.$t('templateLibrary.edit_upload_permission_denied'))
        this.$message.error(error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }
      const item = this.localForm.media[index]
      if (!item) {
        const error = new Error(this.$t('templateLibrary.edit_upload_no_slot'))
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      let extension
      try {
        const isVideoType = item.media_type === 'video'
        const allowedExtensions = isVideoType ? VIDEO_ALLOWED_EXTENSIONS : IMAGE_ALLOWED_EXTENSIONS
        const maxSize = isVideoType ? VIDEO_MAX_FILE_SIZE : IMAGE_MAX_FILE_SIZE
        const result = this.validateSelectedFile(options.file, allowedExtensions, maxSize)
        extension = result.extension
      } catch (error) {
        this.$message.error(error.userMessage || error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      this.$set(item, '_uploading', true)
      this.$set(item, '_uploadProgress', 0)
      try {
        const signature = await this.requestUploadSignature(options.file, extension)
        const uploadResult = await uploadFileToOss(signature, options.file, percent => {
          this.$set(item, '_uploadProgress', percent)
          if (options.onProgress) {
            options.onProgress({ percent })
          }
        })
        this.$set(item, 'url', uploadResult.previewUrl || uploadResult.uploadedUrl)
        this.$set(item, 'metadataText', this.buildMetadataText(signature, options.file))
        if (!item.title) {
          this.$set(item, 'title', stripExtension(options.file.name))
        }
        const mediaType = inferMediaTypeByMime(options.file.type || '', signature.extension)
        this.$set(item, 'media_type', mediaType)
        this.$message.success(this.$t('templateLibrary.edit_upload_success'))
        if (options.onSuccess) {
          options.onSuccess(uploadResult, options.file)
        }
      } catch (error) {
        console.error(error)
        const message = error && error.userMessage ? error.userMessage : (error && error.message ? error.message : this.$t('templateLibrary.edit_upload_failed'))
        this.$message.error(message)
        if (options.onError) {
          options.onError(error)
        }
      } finally {
        this.$set(item, '_uploading', false)
        this.$set(item, '_uploadProgress', 0)
      }
    },
    // 校验表单并回传编辑结果
    handleSubmit() {
      if (!this.$refs.editForm) {
        return
      }
      this.$refs.editForm.validate(valid => {
        if (!valid) {
          return
        }

        const payload = {
          title: this.localForm.title,
          description: this.localForm.description,
          tags: this.localForm.tags.filter(tag => !!tag && tag.trim()).map(tag => tag.trim()),
          machine_module_ids: [...this.localForm.machineModuleIds],
          material_ids: [...this.localForm.materialIds],
          scenario_ids: [...this.localForm.scenarioIds]
        }

        const coverUrlRaw = typeof this.localForm.coverUrl === 'string' ? this.localForm.coverUrl : ''
        const coverUrl = coverUrlRaw.trim()
        if (coverUrl || coverUrlRaw === '') {
          payload.cover_url = coverUrl
        }

        const coverMetaText = (this.localForm.coverMetadataText || '').trim()
        if (coverMetaText) {
          try {
            payload.cover_metadata = JSON.parse(coverMetaText)
          } catch (error) {
            this.$message.error(this.$t('templateLibrary.edit_metadata_invalid'))
            return
          }
        }

        const mediaPayload = []
        let metadataError = false
        this.localForm.media.forEach(item => {
          const type = item.media_type ? item.media_type.trim() : ''
          const url = item.url ? item.url.trim() : ''
          if (!type || !url) {
            return
          }

          const mediaItem = {
            media_type: type,
            url
          }

          if (item.title && item.title.trim()) {
            mediaItem.title = item.title.trim()
          }
          if (item.caption && item.caption.trim()) {
            mediaItem.caption = item.caption.trim()
          }
          if (item.sort_order !== null && item.sort_order !== undefined && item.sort_order !== '') {
            mediaItem.sort_order = Number(item.sort_order)
          }

          const metaText = (item.metadataText || '').trim()
          if (metaText) {
            try {
              mediaItem.metadata = JSON.parse(metaText)
            } catch (error) {
              metadataError = true
            }
          }

          mediaPayload.push(mediaItem)
        })

        if (metadataError) {
          this.$message.error(this.$t('templateLibrary.edit_metadata_invalid'))
          return
        }

        if (mediaPayload.length) {
          payload.media = mediaPayload
        } else if (!this.localForm.media.length) {
          payload.media = []
        }

        const instructionStepsPayload = []
        let instructionSettingsInvalid = false
        let instructionMediaMissingLink = false
        let instructionMetadataInvalid = false

        this.localForm.instructionSteps.forEach(step => {
          const stepPayload = {}

          const title = step.title && step.title.trim()
          const description = step.description && step.description.trim()
          if (title) {
            stepPayload.title = title
          }
          if (description) {
            stepPayload.description = description
          }
          if (step.sort_order !== null && step.sort_order !== undefined && step.sort_order !== '') {
            stepPayload.sort_order = Number(step.sort_order)
          }

          const settingsPairs = Array.isArray(step.settingsPairs) ? step.settingsPairs : []
          const normalizedSettings = settingsPairs
            .map(pair => ({
              label: pair && pair.name ? pair.name.trim() : '',
              value: pair && pair.value ? pair.value.trim() : ''
            }))
            .filter(item => item.label || item.value)

          if (normalizedSettings.some(item => !item.label || !item.value)) {
            instructionSettingsInvalid = true
          } else if (normalizedSettings.length) {
            stepPayload.settings = normalizedSettings
          }

          if (Array.isArray(step.media)) {
            const mediaList = []
            step.media.forEach(media => {
              const type = media.media_type ? media.media_type.trim() : ''
              const mediaUrl = media.media_url ? media.media_url.trim() : ''
              const externalUrl = media.external_url ? media.external_url.trim() : ''
              if (!type) {
                return
              }
              const mediaItem = {
                media_type: type
              }
              if (type === 'youtube') {
                if (!mediaUrl && !externalUrl) {
                  instructionMediaMissingLink = true
                  return
                }
              } else if (!mediaUrl) {
                instructionMediaMissingLink = true
                return
              }

              if (mediaUrl) {
                mediaItem.media_url = mediaUrl
              }
              if (externalUrl) {
                mediaItem.external_url = externalUrl
              }
              if (media.sort_order !== null && media.sort_order !== undefined && media.sort_order !== '') {
                mediaItem.sort_order = Number(media.sort_order)
              }

              const metadataText = (media.metadataText || '').trim()
              if (metadataText) {
                try {
                  mediaItem.media_metadata = JSON.parse(metadataText)
                } catch (error) {
                  instructionMetadataInvalid = true
                }
              }

              mediaList.push(mediaItem)
            })

            if (mediaList.length) {
              stepPayload.media = mediaList
            } else if (step.media.length) {
              stepPayload.media = []
            }
          }

          if (Object.keys(stepPayload).length) {
            instructionStepsPayload.push(stepPayload)
          }
        })

        if (instructionSettingsInvalid) {
          this.$message.error(this.$t('templateLibrary.edit_instruction_settings_invalid'))
          return
        }
        if (instructionMediaMissingLink) {
          this.$message.error(this.$t('templateLibrary.edit_instruction_media_missing_url'))
          return
        }
        if (instructionMetadataInvalid) {
          this.$message.error(this.$t('templateLibrary.edit_metadata_invalid'))
          return
        }

        if (instructionStepsPayload.length) {
          payload.instruction_steps = instructionStepsPayload
        } else if (!this.localForm.instructionSteps.length) {
          payload.instruction_steps = []
        }

        const instructionFileUrl = (this.localForm.instructionFile.url || '').trim()
        const instructionFileName = (this.localForm.instructionFile.name || '').trim()
        const instructionFileMetadataText = (this.localForm.instructionFile.metadataText || '').trim()
        const hadInstructionFile = !!(this.formData && (this.formData.instruction_file || this.formData.instructionFile))

        if (instructionFileUrl || instructionFileName || instructionFileMetadataText) {
          if (!instructionFileUrl) {
            this.$message.error(this.$t('templateLibrary.edit_instruction_file_url_required'))
            return
          }
          const instructionFilePayload = {
            url: instructionFileUrl
          }
          if (instructionFileName) {
            instructionFilePayload.name = instructionFileName
          }
          if (instructionFileMetadataText) {
            try {
              instructionFilePayload.metadata = JSON.parse(instructionFileMetadataText)
            } catch (error) {
              this.$message.error(this.$t('templateLibrary.edit_metadata_invalid'))
              return
            }
          }
          payload.instruction_file = instructionFilePayload
        } else if (hadInstructionFile) {
          payload.instruction_file = null
        }

        this.$emit('submit', payload)
      })
    },
    // 添加一个新的媒体条目
    addMediaItem() {
      if (this.localForm.media.length >= MEDIA_ITEM_LIMIT) {
        this.$message.warning(this.$t('templateLibrary.edit_media_limit', { limit: MEDIA_ITEM_LIMIT }))
        return
      }
      this.localForm.media.push({
        __key: createMediaKey(),
        media_type: 'image',
        url: '',
        title: '',
        caption: '',
        sort_order: null,
        metadataText: '',
        _uploading: false,
        _uploadProgress: 0
      })
    },
    // 移除指定下标的媒体条目
    removeMediaItem(index) {
      if (index < 0 || index >= this.localForm.media.length) {
        return
      }
      this.localForm.media.splice(index, 1)
    },
    // 新增操作说明步骤
    addInstructionStep() {
      if (this.localForm.instructionSteps.length >= INSTRUCTION_STEP_LIMIT) {
        this.$message.warning(this.$t('templateLibrary.edit_instruction_limit', { limit: INSTRUCTION_STEP_LIMIT }))
        return
      }
      this.localForm.instructionSteps.push(createEmptyInstructionStep())
    },
    addInstructionSetting(stepIndex) {
      const step = this.localForm.instructionSteps[stepIndex]
      if (!step) {
        return
      }
      if (!Array.isArray(step.settingsPairs)) {
        this.$set(step, 'settingsPairs', [])
      }
      if (step.settingsPairs.length >= INSTRUCTION_STEP_SETTINGS_LIMIT) {
        this.$message.warning(this.$t('templateLibrary.edit_instruction_settings_limit', { limit: INSTRUCTION_STEP_SETTINGS_LIMIT }))
        return
      }
      step.settingsPairs.push(createInstructionSettingPair())
    },
    // 删除步骤
    removeInstructionStep(index) {
      if (index < 0 || index >= this.localForm.instructionSteps.length) {
        return
      }
      this.localForm.instructionSteps.splice(index, 1)
    },
    removeInstructionSetting(stepIndex, settingIndex) {
      const step = this.localForm.instructionSteps[stepIndex]
      if (!step || !Array.isArray(step.settingsPairs) || settingIndex < 0 || settingIndex >= step.settingsPairs.length) {
        return
      }
      step.settingsPairs.splice(settingIndex, 1)
    },
    // 调整步骤顺序
    moveInstructionStep(index, offset) {
      const target = index + offset
      if (target < 0 || target >= this.localForm.instructionSteps.length) {
        return
      }
      const steps = [...this.localForm.instructionSteps]
      const [current] = steps.splice(index, 1)
      steps.splice(target, 0, current)
      this.localForm.instructionSteps = steps
    },
    // 添加步骤媒体
    addInstructionMedia(stepIndex) {
      const step = this.localForm.instructionSteps[stepIndex]
      if (!step) {
        return
      }
      if (step.media.length >= INSTRUCTION_STEP_MEDIA_LIMIT) {
        this.$message.warning(this.$t('templateLibrary.edit_instruction_media_limit', { limit: INSTRUCTION_STEP_MEDIA_LIMIT }))
        return
      }
      step.media.push(createEmptyInstructionMedia())
    },
    // 移除步骤媒体
    removeInstructionMedia(stepIndex, mediaIndex) {
      const step = this.localForm.instructionSteps[stepIndex]
      if (!step || mediaIndex < 0 || mediaIndex >= step.media.length) {
        return
      }
      step.media.splice(mediaIndex, 1)
    },
    // 切换媒体类型时重置输入
    handleInstructionMediaTypeChange(stepIndex, mediaIndex) {
      const step = this.localForm.instructionSteps[stepIndex]
      if (!step) {
        return
      }
      const media = step.media[mediaIndex]
      if (!media) {
        return
      }
      if (media.media_type === 'youtube') {
        media.media_url = ''
      }
    },
    // 计算步骤媒体上传提示
    getInstructionMediaUploadHint(media) {
      if (media && media.media_type === 'youtube') {
        return this.$t('templateLibrary.edit_instruction_media_youtube_hint')
      }
      return this.getMediaUploadHint(media)
    },
    // 处理步骤媒体上传
    async handleInstructionMediaUpload(options, stepIndex, mediaIndex) {
      if (!this.canUpload) {
        const error = new Error(this.$t('templateLibrary.edit_upload_permission_denied'))
        this.$message.error(error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      const step = this.localForm.instructionSteps[stepIndex]
      if (!step) {
        return
      }
      const media = step.media[mediaIndex]
      if (!media) {
        return
      }

      let extension
      try {
        const isVideoType = media.media_type === 'video'
        const allowedExtensions = isVideoType ? VIDEO_ALLOWED_EXTENSIONS : IMAGE_ALLOWED_EXTENSIONS
        const maxSize = isVideoType ? VIDEO_MAX_FILE_SIZE : IMAGE_MAX_FILE_SIZE
        const result = this.validateSelectedFile(options.file, allowedExtensions, maxSize)
        extension = result.extension
      } catch (error) {
        this.$message.error(error.userMessage || error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      this.$set(media, '_uploading', true)
      this.$set(media, '_uploadProgress', 0)
      try {
        const signature = await this.requestUploadSignature(options.file, extension)
        const uploadResult = await uploadFileToOss(signature, options.file, percent => {
          this.$set(media, '_uploadProgress', percent)
          if (options.onProgress) {
            options.onProgress({ percent })
          }
        })
        this.$set(media, 'media_url', uploadResult.previewUrl || uploadResult.uploadedUrl)
        this.$set(media, 'metadataText', this.buildMetadataText(signature, options.file))
        if (!media.external_url) {
          this.$set(media, 'external_url', '')
        }
        const mediaType = inferMediaTypeByMime(options.file.type || '', signature.extension)
        this.$set(media, 'media_type', mediaType)
        this.$message.success(this.$t('templateLibrary.edit_upload_success'))
        if (options.onSuccess) {
          options.onSuccess(uploadResult, options.file)
        }
      } catch (error) {
        console.error(error)
        const message = error && error.userMessage ? error.userMessage : (error && error.message ? error.message : this.$t('templateLibrary.edit_upload_failed'))
        this.$message.error(message)
        if (options.onError) {
          options.onError(error)
        }
      } finally {
        this.$set(media, '_uploading', false)
        this.$set(media, '_uploadProgress', 0)
      }
    },

    // 处理说明文件上传
    async handleInstructionFileUpload(options) {
      if (!this.canUpload) {
        const error = new Error(this.$t('templateLibrary.edit_instruction_file_upload_disabled'))
        this.$message.error(error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      let extension
      try {
        const result = this.validateSelectedFile(options.file, INSTRUCTION_FILE_ALLOWED_EXTENSIONS, INSTRUCTION_FILE_MAX_FILE_SIZE)
        extension = result.extension
      } catch (error) {
        this.$message.error(error.userMessage || error.message)
        if (options.onError) {
          options.onError(error)
        }
        return
      }

      const target = this.localForm.instructionFile || createInstructionFileState()
      this.$set(this.localForm, 'instructionFile', target)
      target._uploading = true
      target._uploadProgress = 0

      try {
        const signature = await this.requestUploadSignature(options.file, extension)
        const uploadResult = await uploadFileToOss(signature, options.file, percent => {
          target._uploadProgress = percent
          if (options.onProgress) {
            options.onProgress({ percent })
          }
        })
        const resolvedUrl = uploadResult.previewUrl || uploadResult.uploadedUrl
        this.$set(target, 'url', resolvedUrl)
        this.$set(target, 'metadataText', this.buildMetadataText(signature, options.file))
        if (!target.name) {
          this.$set(target, 'name', stripExtension(options.file.name))
        }
        this.$message.success(this.$t('templateLibrary.edit_upload_success'))
        if (options.onSuccess) {
          options.onSuccess(uploadResult, options.file)
        }
      } catch (error) {
        console.error(error)
        const message = error && error.userMessage ? error.userMessage : (error && error.message ? error.message : this.$t('templateLibrary.edit_upload_failed'))
        this.$message.error(message)
        if (options.onError) {
          options.onError(error)
        }
      } finally {
        const latestTarget = this.localForm.instructionFile
        if (latestTarget) {
          latestTarget._uploading = false
          latestTarget._uploadProgress = 0
        }
      }
    },

    // 清空说明文件信息
    clearInstructionFile() {
      if (!this.localForm.instructionFile) {
        return
      }
      this.localForm.instructionFile.url = ''
      this.localForm.instructionFile.name = ''
      this.localForm.instructionFile.metadataText = ''
      this.localForm.instructionFile._uploading = false
      this.localForm.instructionFile._uploadProgress = 0
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

.template-edit-tabs ::v-deep .el-tabs__content {
  padding-top: 12px;
}
</style>
