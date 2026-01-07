<template>
  <div class="tab-panel-content">
    <el-form-item :label="$t('templateLibrary.edit_instruction_file')">
      <div class="instruction-file-upload-card">
        <div class="instruction-file-upload-body">
          <div class="instruction-file-upload-text">
            <div class="instruction-file-upload-title">
              {{ $t('templateLibrary.edit_instruction_file_upload_title') }}
            </div>
            <div class="instruction-file-upload-desc">
              {{ $t('templateLibrary.edit_instruction_file_upload_desc') }}
            </div>
            <div v-if="form.instructionFile.url" class="instruction-file-current">
              <span class="instruction-file-current-label">
                {{ $t('templateLibrary.edit_instruction_file_current') }}：
              </span>
              <el-link
                type="primary"
                :underline="false"
                :href="form.instructionFile.url"
                target="_blank"
              >
                {{ form.instructionFile.name || form.instructionFile.url }}
              </el-link>
              <el-button type="text" icon="el-icon-delete" @click.prevent="clearInstructionFile">
                {{ $t('templateLibrary.edit_instruction_file_remove') }}
              </el-button>
            </div>
          </div>

          <div class="instruction-file-upload-actions">
            <template v-if="canUpload">
              <el-upload
                class="instruction-file-upload-trigger"
                action="#"
                :show-file-list="false"
                :disabled="form.instructionFile._uploading"
                :http-request="handleInstructionFileUpload"
                :accept="instructionFileAcceptValue"
              >
                <el-button type="primary" plain :loading="form.instructionFile._uploading">
                  {{ form.instructionFile._uploading
                    ? $t('templateLibrary.edit_uploading_file')
                    : $t('templateLibrary.edit_instruction_file_select')
                  }}
                </el-button>
              </el-upload>
              <div v-if="form.instructionFile._uploading" class="upload-progress-wrapper">
                <el-progress
                  class="upload-progress-bar"
                  :percentage="form.instructionFile._uploadProgress"
                  :stroke-width="4"
                  :show-text="false"
                />
                <span class="upload-progress-text">{{ form.instructionFile._uploadProgress }}%</span>
              </div>
            </template>
            <template v-else>
              <el-button type="primary" plain disabled>
                {{ $t('templateLibrary.edit_instruction_file_select') }}
              </el-button>
              <div class="upload-disabled-tip">
                {{ $t('templateLibrary.edit_instruction_file_upload_disabled') }}
              </div>
            </template>
          </div>
        </div>

        <div class="instruction-file-upload-footer">
          <div class="instruction-file-upload-hint">{{ instructionFileUploadHintText }}</div>
        </div>
      </div>

      <div v-if="false" class="instruction-file-fields">
        <div class="instruction-file-field">
          <span class="instruction-file-label">{{ $t('templateLibrary.edit_instruction_file_url_label') }}</span>
          <el-input
            v-model="form.instructionFile.url"
            :placeholder="$t('templateLibrary.edit_instruction_file_url_placeholder')"
            clearable
          />
          <div class="form-item-tip">{{ $t('templateLibrary.edit_instruction_file_url_tip') }}</div>
        </div>

        <div class="instruction-file-field">
          <span class="instruction-file-label">{{ $t('templateLibrary.edit_instruction_file_name') }}</span>
          <el-input v-model="form.instructionFile.name" clearable />
          <div class="form-item-tip">{{ $t('templateLibrary.edit_instruction_file_name_tip') }}</div>
        </div>

        <div class="instruction-file-field">
          <span class="instruction-file-label">{{ $t('templateLibrary.edit_instruction_file_metadata') }}</span>
          <el-input
            v-model="form.instructionFile.metadataText"
            type="textarea"
            :rows="3"
            :placeholder="$t('templateLibrary.edit_metadata_placeholder')"
          />
          <div class="form-item-tip">{{ $t('templateLibrary.edit_metadata_tip') }}</div>
        </div>
      </div>
    </el-form-item>
  </div>
</template>

<script>
export default {
  name: 'TemplateEditAttachmentTab',
  inject: ['templateEditDialogContext'],
  computed: {
    context() {
      return this.templateEditDialogContext
    },
    form() {
      return this.context.localForm
    },
    canUpload() {
      return this.context.canUpload
    },
    instructionFileAcceptValue() {
      return this.context.instructionFileAcceptValue
    },
    instructionFileUploadHintText() {
      return this.context.instructionFileUploadHintText
    }
  },
  methods: {
    handleInstructionFileUpload(options) {
      return this.context.handleInstructionFileUpload(options)
    },
    clearInstructionFile() {
      this.context.clearInstructionFile()
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

.instruction-file-upload-card {
  margin-bottom: 16px;
  padding: 18px 20px;
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  background: #f9fafc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-file-upload-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.instruction-file-upload-text {
  flex: 1;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.instruction-file-upload-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.instruction-file-upload-desc {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
}

.instruction-file-current {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 13px;
  color: #606266;
}

.instruction-file-current-label {
  font-weight: 500;
}

.instruction-file-upload-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 180px;
}

.instruction-file-upload-footer {
  font-size: 12px;
  color: #909399;
}

.instruction-file-upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-disabled-tip {
  font-size: 12px;
  color: #c0c4cc;
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

.instruction-file-fields {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.instruction-file-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item-tip {
  margin-top: 6px;
  font-size: 12px;
  color: #909399;
}
</style>
