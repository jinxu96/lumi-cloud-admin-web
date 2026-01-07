<template>
  <div class="tab-panel-content">
    <el-form-item :label="$t('templateLibrary.edit_instruction_steps')">
      <div v-if="!form.instructionSteps.length" class="instruction-editor-empty">
        {{ $t('templateLibrary.edit_instruction_empty') }}
      </div>

      <div v-else class="instruction-step-list">
        <div
          v-for="(step, stepIndex) in form.instructionSteps"
          :key="step.__key"
          class="instruction-step-card"
        >
          <div class="instruction-step-header">
            <span class="instruction-step-index">#{{ stepIndex + 1 }}</span>
            <span class="instruction-step-title">{{ step.title || $t('templateLibrary.edit_instruction_untitled') }}</span>
            <div class="instruction-step-actions">
              <el-button type="text" icon="el-icon-top" @click.prevent="moveInstructionStep(stepIndex, -1)">
                {{ $t('templateLibrary.edit_instruction_move_up') }}
              </el-button>
              <el-button type="text" icon="el-icon-bottom" @click.prevent="moveInstructionStep(stepIndex, 1)">
                {{ $t('templateLibrary.edit_instruction_move_down') }}
              </el-button>
              <el-button type="text" icon="el-icon-delete" @click.prevent="removeInstructionStep(stepIndex)">
                {{ $t('templateLibrary.edit_instruction_remove_step') }}
              </el-button>
            </div>
          </div>

          <div class="instruction-step-body">
            <div class="instruction-step-field">
              <span class="instruction-step-label">{{ $t('templateLibrary.edit_instruction_title') }}</span>
              <el-input v-model="step.title" maxlength="150" show-word-limit />
            </div>

            <div class="instruction-step-field">
              <span class="instruction-step-label">{{ $t('templateLibrary.edit_instruction_description') }}</span>
              <tinymce
                :id="`instruction-description-${step.__key}`"
                v-model="step.description"
                :height="240"
                :toolbar="instructionDescriptionToolbar"
                :menubar="false"
                :show-upload="false"
              />
            </div>

            <div class="instruction-step-field">
              <span class="instruction-step-label">{{ $t('templateLibrary.edit_instruction_sort_order') }}</span>
              <el-input-number v-model="step.sort_order" :min="0" :step="1" />
            </div>

            <div class="instruction-step-field">
              <div class="instruction-step-settings-header">
                <span class="instruction-step-label">{{ $t('templateLibrary.edit_instruction_settings') }}</span>
                <el-button type="primary" icon="el-icon-plus" plain @click.prevent="addInstructionSetting(stepIndex)">
                  {{ $t('templateLibrary.edit_instruction_settings_add') }}
                </el-button>
              </div>

              <div v-if="!step.settingsPairs.length" class="instruction-settings-empty">
                {{ $t('templateLibrary.edit_instruction_settings_empty') }}
              </div>

              <div v-else class="instruction-settings-list">
                <div
                  v-for="(pair, pairIndex) in step.settingsPairs"
                  :key="pair.__key"
                  class="instruction-settings-row"
                >
                  <el-input
                    v-model="pair.name"
                    :placeholder="$t('templateLibrary.edit_instruction_settings_name_placeholder')"
                    class="instruction-settings-name"
                  />
                  <el-input
                    v-model="pair.value"
                    :placeholder="$t('templateLibrary.edit_instruction_settings_value_placeholder')"
                    class="instruction-settings-value"
                  />
                  <el-button type="text" class="instruction-settings-remove" @click.prevent="removeInstructionSetting(stepIndex, pairIndex)">
                    {{ $t('templateLibrary.edit_instruction_settings_remove') }}
                  </el-button>
                </div>
              </div>
            </div>

            <div class="instruction-step-field">
              <span class="instruction-step-label">{{ $t('templateLibrary.edit_instruction_media_list') }}</span>

              <div v-if="!step.media.length" class="instruction-media-empty">
                {{ $t('templateLibrary.edit_instruction_media_empty') }}
              </div>

              <div v-else class="instruction-media-list">
                <div
                  v-for="(media, mediaIndex) in step.media"
                  :key="media.__key"
                  class="instruction-media-card"
                >
                  <div class="instruction-media-header">
                    <span class="instruction-media-index">#{{ mediaIndex + 1 }}</span>
                    <el-button type="text" icon="el-icon-delete" @click.prevent="removeInstructionMedia(stepIndex, mediaIndex)">
                      {{ $t('templateLibrary.edit_instruction_media_remove') }}
                    </el-button>
                  </div>

                  <div class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_media_type') }}</span>
                    <el-select v-model="media.media_type" style="width: 160px;" @change="handleInstructionMediaTypeChange(stepIndex, mediaIndex)">
                      <el-option
                        v-for="option in instructionMediaTypeOptions"
                        :key="option.value"
                        :label="option.label"
                        :value="option.value"
                      />
                    </el-select>
                  </div>

                  <div v-if="media.media_type !== 'youtube'" class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_instruction_media_url') }}</span>
                    <el-input
                      v-model="media.media_url"
                      :placeholder="$t('templateLibrary.edit_instruction_media_url_placeholder')"
                    />
                  </div>

                  <div v-else class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_instruction_media_youtube') }}</span>
                    <el-input
                      v-model="media.external_url"
                      :placeholder="$t('templateLibrary.edit_instruction_media_youtube_placeholder')"
                    />
                  </div>

                  <div class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_instruction_media_sort_order') }}</span>
                    <el-input-number v-model="media.sort_order" :min="0" :step="1" />
                  </div>

                  <!-- <div class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_metadata_label') }}</span>
                    <el-input
                      v-model="media.metadataText"
                      type="textarea"
                      :rows="3"
                      :placeholder="$t('templateLibrary.edit_metadata_placeholder')"
                    />
                  </div> -->

                  <div class="instruction-media-field">
                    <span class="instruction-media-label">{{ $t('templateLibrary.edit_media_file') }}</span>
                    <div class="instruction-media-upload">
                      <template v-if="canUpload && media.media_type !== 'youtube'">
                        <el-upload
                          class="upload-trigger"
                          action="#"
                          :show-file-list="false"
                          :disabled="media._uploading"
                          :http-request="options => handleInstructionMediaUpload(options, stepIndex, mediaIndex)"
                          :accept="getInstructionMediaAccept(media)"
                        >
                          <el-button type="primary" plain :loading="media._uploading">
                            {{ media._uploading
                              ? $t('templateLibrary.edit_uploading_file')
                              : $t('templateLibrary.edit_instruction_media_upload')
                            }}
                          </el-button>
                        </el-upload>
                        <div v-if="media._uploading" class="upload-progress-wrapper">
                          <el-progress
                            class="upload-progress-bar"
                            :percentage="media._uploadProgress"
                            :stroke-width="4"
                            :show-text="false"
                          />
                          <span class="upload-progress-text">{{ media._uploadProgress }}%</span>
                        </div>
                      </template>
                      <template v-else-if="media.media_type !== 'youtube'">
                        <el-button type="primary" plain disabled>
                          {{ $t('templateLibrary.edit_instruction_media_upload') }}
                        </el-button>
                        <div class="upload-disabled-tip">{{ $t('templateLibrary.edit_upload_permission_denied') }}</div>
                      </template>
                      <div class="instruction-media-upload-hint">{{ getInstructionMediaUploadHint(media) }}</div>
                    </div>
                  </div>

                  <div v-if="media.media_type !== 'youtube' && media.media_url" class="instruction-media-preview">
                    <el-image
                      v-if="media.media_type === 'image'"
                      :src="media.media_url"
                      fit="cover"
                      lazy
                    >
                      <div slot="placeholder" class="instruction-media-preview-hint">
                        {{ $t('templateLibrary.edit_media_loading') }}
                      </div>
                      <div slot="error" class="instruction-media-preview-hint">
                        {{ $t('templateLibrary.edit_media_preview_error') }}
                      </div>
                    </el-image>
                    <video
                      v-else-if="media.media_type === 'video'"
                      :src="media.media_url"
                      class="instruction-media-video"
                      controls
                    />
                    <div v-else class="instruction-media-preview-hint">
                      {{ $t('templateLibrary.edit_instruction_media_preview_placeholder') }}
                    </div>
                  </div>

                  <div v-else class="instruction-media-preview-hint">
                    {{ $t('templateLibrary.edit_instruction_media_youtube_hint') }}
                  </div>
                </div>
              </div>

              <el-button type="primary" icon="el-icon-plus" plain @click.prevent="addInstructionMedia(stepIndex)">
                {{ $t('templateLibrary.edit_instruction_media_add') }}
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <el-button type="primary" icon="el-icon-plus" plain @click.prevent="addInstructionStep">
        {{ $t('templateLibrary.edit_instruction_add_step') }}
      </el-button>
    </el-form-item>
  </div>
</template>

<script>
import Tinymce from '@/components/Tinymce'

export default {
  name: 'TemplateEditInstructionTab',
  components: {
    Tinymce
  },
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
    instructionMediaTypeOptions() {
      return this.context.instructionMediaTypeOptions
    },
    instructionDescriptionToolbar() {
      return this.context.instructionDescriptionToolbar
    }
  },
  methods: {
    addInstructionStep() {
      this.context.addInstructionStep()
    },
    moveInstructionStep(index, offset) {
      this.context.moveInstructionStep(index, offset)
    },
    removeInstructionStep(index) {
      this.context.removeInstructionStep(index)
    },
    addInstructionSetting(stepIndex) {
      this.context.addInstructionSetting(stepIndex)
    },
    removeInstructionSetting(stepIndex, settingIndex) {
      this.context.removeInstructionSetting(stepIndex, settingIndex)
    },
    addInstructionMedia(stepIndex) {
      this.context.addInstructionMedia(stepIndex)
    },
    removeInstructionMedia(stepIndex, mediaIndex) {
      this.context.removeInstructionMedia(stepIndex, mediaIndex)
    },
    handleInstructionMediaTypeChange(stepIndex, mediaIndex) {
      this.context.handleInstructionMediaTypeChange(stepIndex, mediaIndex)
    },
    handleInstructionMediaUpload(options, stepIndex, mediaIndex) {
      return this.context.handleInstructionMediaUpload(options, stepIndex, mediaIndex)
    },
    getInstructionMediaAccept(media) {
      return this.context.getMediaAcceptValue(media)
    },
    getInstructionMediaUploadHint(media) {
      return this.context.getInstructionMediaUploadHint(media)
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

.instruction-editor-empty {
  margin-bottom: 12px;
  padding: 12px;
  border: 1px dashed #c0c4cc;
  border-radius: 6px;
  color: #909399;
  text-align: center;
}

.instruction-step-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.instruction-step-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(31, 45, 61, 0.05);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.instruction-step-header {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.instruction-step-index {
  font-weight: 600;
  color: #409eff;
}

.instruction-step-title {
  font-weight: 600;
  color: #303133;
}

.instruction-step-actions {
  display: flex;
  gap: 8px;
}

.instruction-step-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.instruction-step-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.instruction-step-label {
  font-size: 12px;
  color: #606266;
}

.instruction-step-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.instruction-settings-empty {
  margin-top: 8px;
  padding: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  color: #909399;
  font-size: 13px;
  text-align: center;
}

.instruction-settings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.instruction-settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: center;
}

.instruction-media-empty {
  padding: 12px;
  border: 1px dashed #dcdfe6;
  border-radius: 6px;
  color: #909399;
  text-align: center;
}

.instruction-media-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 12px;
}

.instruction-media-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 12px 14px;
  background: #fdfdff;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.instruction-media-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.instruction-media-index {
  font-weight: 600;
  color: #67c23a;
}

.instruction-media-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.instruction-media-label {
  font-size: 12px;
  color: #606266;
}

.instruction-media-upload {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.instruction-media-upload-hint {
  font-size: 12px;
  color: #909399;
}

.upload-trigger {
  display: inline-block;
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

.instruction-media-preview {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  background: #f5f7fa;
  max-height: 220px;
}

.instruction-media-preview .el-image {
  width: 100%;
  height: 220px;
}

.instruction-media-video {
  width: 100%;
  max-height: 240px;
  background: #000;
}

.instruction-media-preview-hint {
  padding: 16px;
  font-size: 13px;
  color: #909399;
  text-align: center;
}

.instruction-step-field ::v-deep .tinymce-container {
  width: 100%;
}
</style>
