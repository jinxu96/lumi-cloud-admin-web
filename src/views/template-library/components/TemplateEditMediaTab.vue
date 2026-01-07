<template>
  <div class="tab-panel-content">
    <el-form-item :label="$t('templateLibrary.edit_form_cover_url')">
      <el-input
        v-model="form.coverUrl"
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
                : (form.coverUrl
                  ? $t('templateLibrary.edit_cover_reupload')
                  : $t('templateLibrary.edit_cover_upload'))
              }}
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
          <div slot="error" class="cover-preview-placeholder">
            {{ $t('templateLibrary.edit_media_preview_error') }}
          </div>
          <div slot="placeholder" class="cover-preview-placeholder">
            {{ $t('templateLibrary.edit_media_loading') }}
          </div>
        </el-image>
      </div>
    </el-form-item>

    <el-form-item :label="$t('templateLibrary.edit_form_media_list')">
      <div v-if="!form.media.length" class="media-editor-empty">
        {{ $t('templateLibrary.edit_media_empty') }}
      </div>

      <div v-else class="media-editor-list">
        <div
          v-for="(item, index) in form.media"
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
              <span class="media-editor-label">{{ $t('templateLibrary.edit_media_type') }}</span>
              <el-select v-model="item.media_type" style="width: 160px;" :disabled="item._uploading">
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
              <el-input
                v-model="item.url"
                :disabled="item._uploading"
                :placeholder="$t('templateLibrary.edit_media_url_placeholder')"
              />
            </div>

            <div v-if="item.url" class="media-editor-preview">
              <el-image
                v-if="item.media_type === 'image'"
                :src="item.url"
                fit="cover"
                lazy
              >
                <div slot="placeholder" class="media-preview-placeholder">
                  {{ $t('templateLibrary.edit_media_loading') }}
                </div>
                <div slot="error" class="media-preview-placeholder">
                  {{ $t('templateLibrary.edit_media_preview_error') }}
                </div>
              </el-image>
              <video
                v-else-if="item.media_type === 'video'"
                :src="item.url"
                class="media-editor-video"
                controls
              />
              <div v-else class="media-preview-placeholder">
                {{ $t('templateLibrary.edit_media_preview_unsupported') }}
              </div>
            </div>

            <div class="media-editor-field">
              <span class="media-editor-label">{{ $t('templateLibrary.edit_media_sort_order') }}</span>
              <el-input-number v-model="item.sort_order" :min="0" :step="1" :disabled="item._uploading" />
            </div>

            <div class="media-editor-field">
              <span class="media-editor-label">{{ $t('templateLibrary.edit_media_file') }}</span>
              <div class="media-upload-actions">
                <template v-if="canUpload">
                  <el-upload
                    class="upload-trigger"
                    action="#"
                    :show-file-list="false"
                    :disabled="item._uploading"
                    :http-request="options => handleMediaUpload(options, index)"
                    :accept="getMediaAcceptValue(item)"
                  >
                    <el-button type="primary" plain :loading="item._uploading">
                      {{ item._uploading
                        ? $t('templateLibrary.edit_uploading_file')
                        : $t('templateLibrary.edit_media_upload')
                      }}
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
            </div>
          </div>
        </div>
      </div>

      <el-button type="primary" icon="el-icon-plus" plain @click.prevent="addMediaItem">
        {{ $t('templateLibrary.edit_media_add') }}
      </el-button>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TemplateEditMediaTab',
  inject: ['templateEditDialogContext'],
  computed: {
    // 直接复用父组件上下文，保持状态一致
    context() {
      return this.templateEditDialogContext
    },
    form() {
      return this.context.localForm
    },
    canUpload() {
      return this.context.canUpload
    },
    uploadingCover() {
      return this.context.uploadingCover
    },
    coverUploadProgress() {
      return this.context.coverUploadProgress
    },
    coverAcceptValue() {
      return this.context.coverAcceptValue
    },
    coverUploadHintText() {
      return this.context.coverUploadHintText
    },
    coverPreviewUrl() {
      return this.context.coverPreviewUrl
    },
    mediaTypeOptions() {
      return this.context.mediaTypeOptions
    }
  },
  methods: {
    handleCoverUpload(options) {
      return this.context.handleCoverUpload(options)
    },
    addMediaItem() {
      this.context.addMediaItem()
    },
    removeMediaItem(index) {
      this.context.removeMediaItem(index)
    },
    handleMediaUpload(options, index) {
      return this.context.handleMediaUpload(options, index)
    },
    getMediaAcceptValue(item) {
      return this.context.getMediaAcceptValue(item)
    },
    getMediaUploadHint(item) {
      return this.context.getMediaUploadHint(item)
    }
  }
}
</script>

<style scoped>
.tab-panel-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  text-align:center;
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
.media-editor-video {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.media-editor-video {
  background: #000;
}
</style>
