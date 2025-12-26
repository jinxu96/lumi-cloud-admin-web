<template>
  <el-dialog
    :title="$t('templateLibrary.edit_dialog_title')"
    :visible.sync="innerVisible"
    width="720px"
    :close-on-click-modal="false"
    :destroy-on-close="false"
    @close="handleClose"
    @closed="handleClosed"
  >
    <div v-loading="loading">
      <el-form ref="editForm" :model="localForm" :rules="rules" label-width="110px">
        <el-form-item :label="$t('templateLibrary.edit_form_title')" prop="title">
          <el-input v-model="localForm.title" maxlength="150" show-word-limit />
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_description')">
          <el-input
            v-model="localForm.description"
            type="textarea"
            :rows="4"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_tags')">
          <el-select
            v-model="localForm.tags"
            multiple
            filterable
            allow-create
            default-first-option
            :placeholder="$t('templateLibrary.edit_tags_placeholder')"
            style="width: 100%;"
          >
            <el-option
              v-for="tag in localForm.tags"
              :key="tag"
              :label="tag"
              :value="tag"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_machine_modules')" prop="machineModuleIds">
          <el-select v-model="localForm.machineModuleIds" multiple filterable style="width: 100%;">
            <el-option-group
              v-for="group in moduleOptions"
              :key="group.label"
              :label="group.label"
            >
              <el-option
                v-for="item in group.children"
                :key="item.id"
                :label="item.label"
                :value="item.id"
              />
            </el-option-group>
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_materials')">
          <el-select v-model="localForm.materialIds" multiple filterable style="width: 100%;">
            <el-option
              v-for="item in materialOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_scenarios')">
          <el-select v-model="localForm.scenarioIds" multiple filterable style="width: 100%;">
            <el-option
              v-for="item in scenarioOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_cover_url')">
          <el-input
            v-model="localForm.coverUrl"
            :placeholder="$t('templateLibrary.edit_form_cover_placeholder')"
            clearable
          />
          <div class="upload-actions">
            <template v-if="canUpload">
              <el-upload
                class="upload-trigger"
                action="#"
                :show-file-list="false"
                :disabled="uploadingCover"
                :http-request="handleCoverUpload"
                :accept="coverAcceptValue"
              >
                <el-button type="primary" plain :loading="uploadingCover">
                  {{ uploadingCover
                    ? $t('templateLibrary.edit_uploading_file')
                    : (localForm.coverUrl
                      ? $t('templateLibrary.edit_cover_reupload')
                      : $t('templateLibrary.edit_cover_upload')) }}
                </el-button>
              </el-upload>
              <div v-if="uploadingCover" class="upload-progress-wrapper">
                <el-progress
                  class="upload-progress-bar"
                  :percentage="coverUploadProgress"
                  :stroke-width="4"
                  :show-text="false"
                />
                <span class="upload-progress-text">{{ coverUploadProgress }}%</span>
              </div>
            </template>
            <template v-else>
              <el-button type="primary" plain disabled>
                {{ $t('templateLibrary.edit_cover_upload') }}
              </el-button>
              <div class="upload-disabled-tip">{{ $t('templateLibrary.edit_upload_permission_denied') }}</div>
            </template>
            <div class="upload-hint">{{ coverUploadHintText }}</div>
          </div>
          <div v-if="coverPreviewUrl" class="cover-preview">
            <el-image :src="coverPreviewUrl" fit="cover" class="cover-preview-image" :preview-src-list="[coverPreviewUrl]">
              <div slot="error" class="cover-preview-placeholder">-</div>
            </el-image>
          </div>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_cover_metadata')">
          <el-input
            v-model="localForm.coverMetadataText"
            type="textarea"
            :rows="4"
            :placeholder="$t('templateLibrary.edit_metadata_placeholder')"
          />
          <div class="form-item-tip">{{ $t('templateLibrary.edit_metadata_tip') }}</div>
        </el-form-item>

        <el-form-item :label="$t('templateLibrary.edit_form_media_list')">
          <div v-if="!localForm.media.length" class="media-editor-empty">
            {{ $t('templateLibrary.edit_media_empty') }}
          </div>

          <div v-else class="media-editor-list">
            <div
              v-for="(item, index) in localForm.media"
              :key="item.__key"
              class="media-editor-card"
            >
              <div class="media-editor-header">
                <span class="media-editor-index">#{{ index + 1 }}</span>
                <el-button
                  type="text"
                  icon="el-icon-delete"
                  :disabled="item._uploading"
                  @click.prevent="removeMediaItem(index)"
                >
                  {{ $t('templateLibrary.edit_media_remove') }}
                </el-button>
              </div>

              <div class="media-editor-body">
                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_file') }}</span>
                  <div class="media-upload-actions">
                    <template v-if="canUpload">
                      <el-upload
                        class="upload-trigger"
                        action="#"
                        :show-file-list="false"
                        :disabled="item._uploading"
                        :http-request="uploadOptions => handleMediaUpload(uploadOptions, index)"
                        :accept="getMediaAcceptValue(item)"
                      >
                        <el-button type="primary" plain :loading="item._uploading">
                          {{ item._uploading
                            ? $t('templateLibrary.edit_uploading_file')
                            : (item.url
                              ? $t('templateLibrary.edit_media_replace')
                              : $t('templateLibrary.edit_media_upload')) }}
                        </el-button>
                      </el-upload>
                      <div v-if="item._uploading" class="upload-progress-wrapper">
                        <el-progress
                          class="upload-progress-bar"
                          :percentage="item._uploadProgress"
                          :stroke-width="4"
                          :show-text="false"
                        />
                        <span class="upload-progress-text">{{ item._uploadProgress }}%</span>
                      </div>
                    </template>
                    <template v-else>
                      <el-button type="primary" plain disabled>
                        {{ $t('templateLibrary.edit_media_upload') }}
                      </el-button>
                      <div class="upload-disabled-tip">{{ $t('templateLibrary.edit_upload_permission_denied') }}</div>
                    </template>
                    <div class="upload-hint">{{ getMediaUploadHint(item) }}</div>
                  </div>
                  <div v-if="item.url" class="media-editor-preview">
                    <el-image
                      v-if="item.media_type === 'image'"
                      :src="item.url"
                      fit="cover"
                      :preview-src-list="item.url ? [item.url] : []"
                    >
                      <div slot="error" class="media-preview-placeholder">-</div>
                    </el-image>
                    <video v-else :src="item.url" controls />
                  </div>
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_type') }}</span>
                  <el-select v-model="item.media_type" style="width: 140px;" :disabled="item._uploading">
                    <el-option
                      v-for="option in mediaTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_url') }}</span>
                  <el-input v-model="item.url" :placeholder="$t('templateLibrary.edit_media_url_placeholder')" :disabled="item._uploading" />
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_title') }}</span>
                  <el-input v-model="item.title" :disabled="item._uploading" />
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_caption') }}</span>
                  <el-input v-model="item.caption" type="textarea" :rows="2" :disabled="item._uploading" />
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_sort_order') }}</span>
                  <el-input-number v-model="item.sort_order" :min="0" :step="1" :disabled="item._uploading" />
                </div>

                <div class="media-editor-field">
                  <span class="media-editor-label">{{ $t('templateLibrary.edit_media_metadata') }}</span>
                  <el-input
                    v-model="item.metadataText"
                    type="textarea"
                    :rows="3"
                    :placeholder="$t('templateLibrary.edit_metadata_placeholder')"
                    :disabled="item._uploading"
                  />
                  <div class="form-item-tip">{{ $t('templateLibrary.edit_metadata_tip') }}</div>
                </div>
              </div>
            </div>
          </div>

          <el-button type="primary" icon="el-icon-plus" plain @click.prevent="addMediaItem">
            {{ $t('templateLibrary.edit_media_add') }}
          </el-button>
        </el-form-item>
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
import { getProjectTemplateUploadSignature } from '@/api/projectTemplate'
import { uploadFileToOss, inferMediaTypeByMime } from '@/utils/oss'

const MEDIA_ITEM_LIMIT = 20
const IMAGE_ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const VIDEO_ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm']
const IMAGE_MAX_FILE_SIZE = 20 * 1024 * 1024
const VIDEO_MAX_FILE_SIZE = 60 * 1024 * 1024

// 生成媒体列表项使用的临时唯一标识
const createMediaKey = () => `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

// 提取后端返回的关联对象 ID 列表
const extractRelationIds = (items, candidates = []) => {
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

// 解析文件名中的扩展名并统一为小写
const getFileExtension = (fileName = '') => {
  const matched = fileName.split('.').pop()
  if (!matched || matched === fileName) {
    return ''
  }
  return matched.toLowerCase()
}

// 去除文件名中的扩展名部分
const stripExtension = (fileName = '') => {
  const lastDot = fileName.lastIndexOf('.')
  if (lastDot <= 0) {
    return fileName
  }
  return fileName.slice(0, lastDot)
}

export default {
  name: 'TemplateEditDialog',
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

      return {
        title: source.title || '',
        description: source.description || '',
        tags: Array.isArray(source.tags) ? [...source.tags] : [],
        machineModuleIds,
        materialIds,
        scenarioIds,
        coverUrl,
        coverMetadataText: coverMetadata ? JSON.stringify(coverMetadata, null, 2) : '',
        media
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

.cover-preview-image {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  overflow: hidden;
}

.cover-preview-placeholder,
.media-preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  background: #f5f7fa;
}

.form-item-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}

.upload-actions,
.media-upload-actions {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.upload-trigger {
  display: inline-block;
}

.upload-disabled-tip {
  font-size: 12px;
  color: #c0c4cc;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-progress-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 180px;
}

.upload-progress-bar {
  flex: 1;
}

.upload-progress-text {
  font-size: 12px;
  color: #606266;
  min-width: 34px;
  text-align: right;
}

.cover-preview {
  margin-top: 12px;
}

.media-editor-empty {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  color: #909399;
  text-align: center;
}

.media-editor-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 12px;
}

.media-editor-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.05);
}

.media-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.media-editor-index {
  font-weight: 600;
  color: #409eff;
}

.media-editor-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.media-editor-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.media-editor-label {
  font-size: 12px;
  color: #606266;
}

.media-editor-preview {
  width: 100%;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  background: #000;
}

.media-editor-preview .el-image,
.media-editor-preview video {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.media-editor-preview video {
  background: #000;
}
</style>
