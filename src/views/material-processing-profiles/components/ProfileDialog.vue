<template>
  <el-dialog
    :title="dialog.isEdit ? $t('materialProcessingProfile.dialog_edit_title') : $t('materialProcessingProfile.dialog_create_title')"
    :visible.sync="dialog.visible"
    width="840px"
    :close-on-click-modal="false"
    @closed="resetDialog"
  >
    <el-form ref="profileForm" :model="dialog.form" :rules="dialog.rules" label-width="140px">
      <el-form-item :label="$t('materialProcessingProfile.form_material')" prop="material_id">
        <el-select
          v-model="dialog.form.material_id"
          filterable
          remote
          clearable
          :remote-method="handleMaterialRemote"
          :loading="materialLoading"
          @visible-change="handleMaterialVisible"
        >
          <el-option
            v-for="item in materialOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.search_machine')">
        <el-select
          v-model="dialog.form.machine_id"
          filterable
          remote
          clearable
          :remote-method="handleMachineRemote"
          :loading="machineLoading"
          @visible-change="handleMachineVisible"
          @change="handleDialogMachineChange"
        >
          <el-option
            v-for="item in machineOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.search_machine_module')">
        <el-select
          v-model="dialog.form.machine_module_id"
          filterable
          remote
          clearable
          :remote-method="handleModuleRemote"
          :loading="moduleLoading"
          :disabled="!dialog.form.machine_id"
          @visible-change="handleModuleVisible"
          @change="handleDialogModuleChange"
        >
          <el-option
            v-for="item in moduleOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_machine_module_profile')" prop="machine_module_profile_id">
        <el-select
          v-model="dialog.form.machine_module_profile_id"
          filterable
          remote
          clearable
          :remote-method="handleProfileRemote"
          :loading="profileLoading"
          :disabled="!dialog.form.machine_module_id"
          class="profile-dialog-select--wide"
          @visible-change="handleProfileVisible"
        >
          <el-option
            v-for="item in profileOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_power_percent')" prop="power_percent">
        <el-input-number v-model="dialog.form.power_percent" :min="0" :max="100" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_speed')">
        <el-input-number v-model="dialog.form.speed_mm_per_sec" :min="0" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_passes')">
        <el-input-number v-model="dialog.form.passes" :min="1" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_focus_offset')">
        <el-input-number v-model="dialog.form.focus_offset_mm" :step="0.1" controls-position="right" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_air_assist')">
        <el-select v-model="dialog.form.air_assist" clearable>
          <el-option :label="$t('materialProcessingProfile.option_true')" value="true" />
          <el-option :label="$t('materialProcessingProfile.option_false')" value="false" />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_preview_image')">
        <el-input
          v-model="dialog.form.preview_image_url"
          maxlength="500"
          :placeholder="$t('materialProcessingProfile.form_preview_image_placeholder')"
          @input="handlePreviewUrlInput"
        />
        <div class="preview-upload-actions">
          <el-upload
            v-if="checkPermission(['app-admin.material-processing-profiles.preview'])"
            class="preview-upload"
            :show-file-list="false"
            :action="uploadPlaceholderAction"
            :before-upload="beforePreviewUpload"
            :http-request="handlePreviewUpload"
            accept="image/*"
          >
            <el-button size="mini" type="primary" :loading="dialog.previewUploading">
              {{ $t('materialProcessingProfile.form_preview_image_upload') }}
            </el-button>
          </el-upload>
          <el-button
            v-if="dialog.previewFile"
            type="text"
            size="mini"
            class="preview-clear"
            @click="clearLocalPreviewFile"
          >
            {{ $t('materialProcessingProfile.form_preview_image_clear_local') }}
          </el-button>
          <span class="preview-tip">
            {{ dialog.isEdit ? $t('materialProcessingProfile.form_preview_image_tip_edit') : $t('materialProcessingProfile.form_preview_image_tip_create') }}
          </span>
        </div>
        <div v-if="previewDisplayUrl" class="preview-display">
          <span class="preview-display-title">{{ $t('materialProcessingProfile.preview_title') }}</span>
          <el-image :src="previewDisplayUrl" fit="cover" class="preview-display-image">
            <div slot="error" class="preview-display-error">-</div>
          </el-image>
        </div>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_notes')">
        <el-input v-model="dialog.form.notes" type="textarea" :rows="2" maxlength="500" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_is_active')">
        <el-switch v-model="dialog.form.is_active" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_sort_order')">
        <el-input-number v-model="dialog.form.sort_order" :step="1" controls-position="right" />
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_parameter_sections')">
        <div class="parameter-sections">
          <el-card class="parameter-section-card">
            <div slot="header" class="parameter-section-header">
              <span class="parameter-section-title">{{ $t('materialProcessingProfile.section_fill_engrave') }}</span>
              <el-switch v-model="dialog.form.parameterSections.fill_engrave.enabled" />
            </div>
            <div class="parameter-section-body">
              <div class="parameter-section-grid">
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_engrave_density') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.fill_engrave.engrave_density"
                    :min="0"
                    :max="100"
                    :step="1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.fill_engrave.enabled"
                  />
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_scan_mode') }}</span>
                  <el-select
                    v-model="dialog.form.parameterSections.fill_engrave.scan_mode"
                    :disabled="!dialog.form.parameterSections.fill_engrave.enabled"
                  >
                    <el-option
                      v-for="mode in fillEngraveScanModes"
                      :key="`fill-engrave-${mode}`"
                      :label="$t(`materialProcessingProfile.section_scan_mode_${mode}`)"
                      :value="mode"
                    />
                  </el-select>
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_overscan_mm') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.fill_engrave.overscan_mm"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.fill_engrave.enabled"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="parameter-section-card">
            <div slot="header" class="parameter-section-header">
              <span class="parameter-section-title">{{ $t('materialProcessingProfile.section_line_engrave') }}</span>
              <el-switch v-model="dialog.form.parameterSections.line_engrave.enabled" />
            </div>
            <div class="parameter-section-body">
              <div class="parameter-section-grid">
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_kerf_compensation_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_engrave.kerf_compensation_enabled"
                    :disabled="!dialog.form.parameterSections.line_engrave.enabled"
                  />
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_kerf_compensation_width_mm') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_engrave.kerf_compensation_width_mm"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_engrave.enabled"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="parameter-section-card">
            <div slot="header" class="parameter-section-header">
              <span class="parameter-section-title">{{ $t('materialProcessingProfile.section_line_cut') }}</span>
              <el-switch v-model="dialog.form.parameterSections.line_cut.enabled" />
            </div>
            <div class="parameter-section-body">
              <div class="parameter-section-grid line-cut-grid">
                <div class="parameter-field group-kerf">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_kerf_compensation_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_cut.kerf_compensation_enabled"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                  />
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_cut.kerf_compensation_width_mm"
                    :min="0"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.kerf_compensation_enabled"
                  />
                </div>
                <div class="parameter-field group-focus">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_focus_down_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_cut.focus_down_enabled"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                  />
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_cut.focus_down_distance_mm"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.focus_down_enabled"
                  />
                </div>
                <div class="parameter-field group-perforation">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_perforation') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_cut.perforation"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                  />
                </div>
                <div class="parameter-field group-assist">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_assist_gas_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_cut.assist_gas_enabled"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                  />
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_cut.assist_gas_pressure_kpa"
                    :min="0"
                    :step="1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.assist_gas_enabled"
                  />
                </div>
                <div class="parameter-field group-generation">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_generation_rule') }}</span>
                  <el-select
                    v-model="dialog.form.parameterSections.line_cut.generation_rule"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                    @change="handleLineCutGenerationRuleChange"
                  >
                    <el-option
                      v-for="item in generationRuleOptions"
                      :key="`line-cut-generation-${item}`"
                      :label="$t(`materialProcessingProfile.section_generation_rule_${item}`)"
                      :value="item"
                    />
                  </el-select>
                </div>
                <div class="parameter-field group-break-toggle">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_break_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_cut.break_enabled"
                    :disabled="!dialog.form.parameterSections.line_cut.enabled"
                  />
                </div>
                <template v-if="dialog.form.parameterSections.line_cut.break_enabled">
                  <div class="parameter-field group-break-rule">
                    <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_break_spacing_rule') }}</span>
                    <el-select
                      v-model="dialog.form.parameterSections.line_cut.break_spacing_rule"
                      disabled
                    >
                      <el-option
                        v-for="item in spacingRuleOptions"
                        :key="`line-cut-break-spacing-${item}`"
                        :label="$t(`materialProcessingProfile.section_spacing_rule_${item}`)"
                        :value="item"
                      />
                    </el-select>
                  </div>
                  <div class="parameter-field group-break-spacing">
                    <span class="parameter-field-label">{{ breakSpacingLabel }}</span>
                    <el-input-number
                      v-model="dialog.form.parameterSections.line_cut.break_spacing_mm"
                      :min="0"
                      :step="1"
                      controls-position="right"
                      :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.break_enabled"
                    />
                  </div>
                  <div class="parameter-field group-break-size">
                    <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_break_size_mm') }}</span>
                    <el-input-number
                      v-model="dialog.form.parameterSections.line_cut.break_size_mm"
                      :min="0"
                      :step="0.1"
                      controls-position="right"
                      :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.break_enabled"
                    />
                  </div>
                  <div class="parameter-field group-break-power">
                    <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_break_power_percent') }}</span>
                    <el-input-number
                      v-model="dialog.form.parameterSections.line_cut.break_power_percent"
                      :min="0"
                      :max="100"
                      :step="1"
                      controls-position="right"
                      :disabled="!dialog.form.parameterSections.line_cut.enabled || !dialog.form.parameterSections.line_cut.break_enabled"
                    />
                  </div>
                </template>
              </div>
            </div>
          </el-card>

          <el-card class="parameter-section-card">
            <div slot="header" class="parameter-section-header">
              <span class="parameter-section-title">{{ $t('materialProcessingProfile.section_line_mark') }}</span>
              <el-switch v-model="dialog.form.parameterSections.line_mark.enabled" />
            </div>
            <div class="parameter-section-body">
              <div class="parameter-section-grid">
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_kerf_compensation_enabled') }}</span>
                  <el-switch
                    v-model="dialog.form.parameterSections.line_mark.kerf_compensation_enabled"
                    :disabled="!dialog.form.parameterSections.line_mark.enabled"
                  />
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_kerf_compensation_width_mm') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_mark.kerf_compensation_width_mm"
                    :step="0.1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_mark.enabled"
                  />
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_repeat') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.line_mark.repeat"
                    :min="1"
                    :step="1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.line_mark.enabled"
                  />
                </div>
              </div>
            </div>
          </el-card>

          <el-card class="parameter-section-card">
            <div slot="header" class="parameter-section-header">
              <span class="parameter-section-title">{{ $t('materialProcessingProfile.section_fill_mark') }}</span>
              <el-switch v-model="dialog.form.parameterSections.fill_mark.enabled" />
            </div>
            <div class="parameter-section-body">
              <div class="parameter-section-grid">
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_engrave_density') }}</span>
                  <el-input-number
                    v-model="dialog.form.parameterSections.fill_mark.engrave_density"
                    :min="0"
                    :max="100"
                    :step="1"
                    controls-position="right"
                    :disabled="!dialog.form.parameterSections.fill_mark.enabled"
                  />
                </div>
                <div class="parameter-field">
                  <span class="parameter-field-label">{{ $t('materialProcessingProfile.section_scan_mode') }}</span>
                  <el-select
                    v-model="dialog.form.parameterSections.fill_mark.scan_mode"
                    :disabled="!dialog.form.parameterSections.fill_mark.enabled"
                  >
                    <el-option
                      v-for="mode in fillMarkScanModes"
                      :key="`fill-mark-${mode}`"
                      :label="$t(`materialProcessingProfile.section_scan_mode_${mode}`)"
                      :value="mode"
                    />
                  </el-select>
                </div>
              </div>
            </div>
          </el-card>
        </div>
        <div class="form-tip">{{ $t('materialProcessingProfile.form_parameter_sections_tip') }}</div>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_parameter_sections_raw')">
        <el-input
          v-model="dialog.form.parameter_matrix_sections_raw"
          type="textarea"
          :rows="3"
          :placeholder="$t('materialProcessingProfile.form_parameter_sections_placeholder')"
          @input="handleSectionsRawInput"
        />
        <div class="form-tip">{{ $t('materialProcessingProfile.form_parameter_sections_raw_tip') }}</div>
      </el-form-item>

      <el-form-item :label="$t('materialProcessingProfile.form_parameter_matrix')">
        <el-input
          v-model="dialog.form.parameter_matrix_raw"
          type="textarea"
          :rows="3"
          :placeholder="$t('materialProcessingProfile.form_parameter_matrix_placeholder')"
          @input="handleMatrixRawInput"
        />
        <div class="form-tip">{{ $t('materialProcessingProfile.form_parameter_matrix_tip') }}</div>
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
      <el-button type="primary" :loading="dialog.loading" @click="submitDialog">
        {{ dialog.isEdit ? $t('common.save') : $t('common.save') }}
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import checkPermission from '@/utils/permission'
import {
  getMaterialProcessingProfileDetail,
  createMaterialProcessingProfile,
  updateMaterialProcessingProfile,
  uploadMaterialProcessingProfilePreview
} from '@/api/materialProcessingProfiles'
import { getMaterials } from '@/api/materials'
import { getMachines } from '@/api/machines'
import { getMachineModules } from '@/api/machineModules'
import { getMachineModuleProfiles } from '@/api/machineModuleProfiles'
import {
  createDefaultForm,
  createDefaultParameterSections,
  formatMaterialLabel,
  formatMachineLabel,
  formatModuleLabel,
  formatProfileTitle
} from '../utils'

const cloneRules = (rules = {}) => JSON.parse(JSON.stringify(rules))

export default {
  name: 'MaterialProcessingProfileDialog',
  data() {
    const baseRules = {
      material_id: [{ required: true, message: this.$t('materialProcessingProfile.form_rules_material'), trigger: 'change' }],
      machine_module_profile_id: [{ required: true, message: this.$t('materialProcessingProfile.form_rules_profile'), trigger: 'change' }],
      power_percent: [{ required: true, message: this.$t('materialProcessingProfile.form_rules_power'), trigger: 'change' }]
    }
    return {
      checkPermission,
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        rawOverrides: {
          sections: false,
          matrix: false
        },
        form: createDefaultForm(),
        previewFile: null,
        previewPreview: '',
        previewPendingUpload: false,
        previewUploading: false,
        rules: cloneRules(baseRules)
      },
      baseRules,
      materialOptions: [],
      materialLoading: false,
      machineOptions: [],
      machineLoading: false,
      moduleOptions: [],
      moduleLoading: false,
      profileOptions: [],
      profileLoading: false,
      uploadPlaceholderAction: '/noop-upload',
      fillEngraveScanModes: ['bi_directional', 'bi_oneway'],
      fillMarkScanModes: ['uni_directional', 'bi_directional', 'bi_oneway'],
      generationRuleOptions: ['by_distance', 'by_number'],
      spacingRuleOptions: ['by_distance', 'by_number']
    }
  },
  computed: {
    previewDisplayUrl() {
      if (this.dialog.previewPreview) {
        return this.dialog.previewPreview
      }
      return this.dialog.form.preview_image_url
    },
    // 根据生成规则动态返回断点间距标签
    breakSpacingLabel() {
      const rule = this.dialog.form.parameterSections?.line_cut?.generation_rule
      if (rule === 'by_number') {
        return this.$t('materialProcessingProfile.section_break_spacing_by_number')
      }
      return this.$t('materialProcessingProfile.section_break_spacing_by_distance')
    }
  },
  methods: {
    // 打开新建弹窗并重置表单状态
    openCreate() {
      this.dialog.visible = true
      this.dialog.isEdit = false
      this.dialog.loading = false
      this.resetPreviewState()
      this.dialog.form = createDefaultForm()
      this.resetRawOverrides()
      this.syncLineCutBreakSpacingRule(this.dialog.form.parameterSections.line_cut.generation_rule, { force: true })
      this.prefetchBaseOptions()
    },
    // 打开编辑弹窗并回填已有加工配置
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.loading = true
      this.resetPreviewState()
      this.dialog.form = createDefaultForm()
      this.resetRawOverrides()
      getMaterialProcessingProfileDetail(row.id)
        .then(res => {
          const data = res.data || {}
          const form = createDefaultForm()
          const sectionSource = data.parameter_matrix_sections || data.parameter_matrix || null
          const mappedSections = this.mapSectionsFromResponse(sectionSource)
          form.id = data.id || null
          if (data.material && data.material.id) {
            form.material_id = String(data.material.id)
            this.appendMaterialOption(data.material)
          }
          const profile = data.machine_module_profile || {}
          const module = profile.machine_module || {}
          const machine = module.machine || {}
          if (machine.id) {
            form.machine_id = String(machine.id)
            this.appendMachineOption(machine)
          }
          if (module.id) {
            form.machine_module_id = String(module.id)
            this.appendModuleOption(module, machine)
          }
          if (profile.id) {
            form.machine_module_profile_id = String(profile.id)
            this.appendProfileOption(profile)
          }
          form.power_percent = data.power_percent != null ? Number(data.power_percent) : null
          form.speed_mm_per_sec = data.speed_mm_per_sec != null ? Number(data.speed_mm_per_sec) : null
          form.passes = data.passes != null ? Number(data.passes) : null
          form.focus_offset_mm = data.focus_offset_mm != null ? Number(data.focus_offset_mm) : null
          form.air_assist = data.air_assist === null || data.air_assist === undefined ? '' : (data.air_assist ? 'true' : 'false')
          form.preview_image_url = data.preview_image_url || ''
          form.notes = data.notes || ''
          form.is_active = data.is_active !== undefined ? !!data.is_active : true
          form.sort_order = data.sort_order != null ? Number(data.sort_order) : 0
          form.parameterSections = this.cloneSectionState(mappedSections)
          if (data.parameter_matrix_sections) {
            form.parameter_matrix_sections_raw = JSON.stringify(data.parameter_matrix_sections, null, 2)
          } else if (data.parameter_matrix) {
            form.parameter_matrix_sections_raw = JSON.stringify(data.parameter_matrix, null, 2)
          }
          if (data.parameter_matrix) {
            form.parameter_matrix_raw = JSON.stringify(data.parameter_matrix, null, 2)
          }
          Object.keys(form).forEach(key => {
            this.$set(this.dialog.form, key, form[key])
          })
          this.$set(this.dialog.form, 'parameterSections', this.cloneSectionState(mappedSections))
          this.syncLineCutBreakSpacingRule(this.dialog.form.parameterSections.line_cut.generation_rule, { force: true })
          if (form.machine_id) {
            this.fetchMachineOptions('')
            this.fetchModuleOptions('', { machineId: form.machine_id })
          }
          if (form.machine_module_id) {
            this.fetchProfileOptions('', {
              machineId: form.machine_id,
              machineModuleId: form.machine_module_id
            })
          }
        })
        .finally(() => {
          this.dialog.loading = false
        })
    },
    // 远程搜索材料列表
    handleMaterialRemote(keyword) {
      this.fetchMaterialOptions(keyword)
    },
    // 打开材料下拉时预加载最近数据
    handleMaterialVisible(visible) {
      if (visible && !this.materialOptions.length) {
        this.fetchMaterialOptions()
      }
    },
    // 远程搜索机器列表
    handleMachineRemote(keyword) {
      this.fetchMachineOptions(keyword)
    },
    // 打开机器下拉时按需加载
    handleMachineVisible(visible) {
      if (visible && !this.machineOptions.length) {
        this.fetchMachineOptions()
      }
    },
    // 远程搜索模块列表
    handleModuleRemote(keyword) {
      if (!this.dialog.form.machine_id) {
        this.moduleOptions = []
        return
      }
      this.fetchModuleOptions(keyword, { machineId: this.dialog.form.machine_id })
    },
    // 打开模块下拉时根据机器加载
    handleModuleVisible(visible) {
      if (visible && this.dialog.form.machine_id) {
        this.fetchModuleOptions('', { machineId: this.dialog.form.machine_id })
      }
    },
    // 远程搜索加工方案列表
    handleProfileRemote(keyword) {
      if (!this.dialog.form.machine_module_id) {
        this.profileOptions = []
        return
      }
      this.fetchProfileOptions(keyword, {
        machineId: this.dialog.form.machine_id,
        machineModuleId: this.dialog.form.machine_module_id
      })
    },
    // 打开加工方案下拉时刷新可用选项
    handleProfileVisible(visible) {
      if (visible && this.dialog.form.machine_module_id) {
        // 打开下拉面板时刷新选项，确保展示最新加工方案列表
        this.fetchProfileOptions('', {
          machineId: this.dialog.form.machine_id,
          machineModuleId: this.dialog.form.machine_module_id
        })
      }
    },
    // 输入原始分段 JSON 时记录覆盖标记
    handleSectionsRawInput(value) {
      const content = typeof value === 'string' ? value : (this.dialog.form.parameter_matrix_sections_raw || '')
      this.dialog.rawOverrides.sections = content.trim().length > 0
    },
    // 输入原始矩阵 JSON 时记录覆盖标记
    handleMatrixRawInput(value) {
      const content = typeof value === 'string' ? value : (this.dialog.form.parameter_matrix_raw || '')
      this.dialog.rawOverrides.matrix = content.trim().length > 0
    },
    // 切换 line_cut 生成规则时同步间距字段
    handleLineCutGenerationRuleChange(value) {
      this.syncLineCutBreakSpacingRule(value, { force: true })
    },
    // 重置用户是否使用原始 JSON 的标记
    resetRawOverrides() {
      this.dialog.rawOverrides.sections = false
      this.dialog.rawOverrides.matrix = false
    },
    // 选择机器时重置模块和方案并重新拉取选项
    handleDialogMachineChange(value) {
      this.dialog.form.machine_id = value || ''
      this.dialog.form.machine_module_id = ''
      this.dialog.form.machine_module_profile_id = ''
      if (value) {
        this.fetchMachineOptions('')
        this.fetchModuleOptions('', { machineId: value })
      } else {
        this.moduleOptions = []
        this.profileOptions = []
      }
    },
    handleDialogModuleChange(value) {
      this.dialog.form.machine_module_id = value || ''
      this.dialog.form.machine_module_profile_id = ''
      if (value) {
        this.fetchModuleOptions('', { machineId: this.dialog.form.machine_id })
        this.fetchProfileOptions('', {
          machineId: this.dialog.form.machine_id,
          machineModuleId: value
        })
      } else {
        this.profileOptions = []
      }
    },
    // 校验预览图上传文件类型与体积
    beforePreviewUpload(file) {
      if (!file) {
        return false
      }
      const isImage = /^image\//.test(file.type)
      if (!isImage) {
        this.$message.error(this.$t('materialProcessingProfile.message_preview_upload_type'))
        return false
      }
      const isLt5M = file.size / 1024 / 1024 <= 5
      if (!isLt5M) {
        this.$message.error(this.$t('materialProcessingProfile.message_preview_upload_size'))
        return false
      }
      return true
    },
    // 处理预览图上传流程
    handlePreviewUpload(uploadOption) {
      const { file, onSuccess, onError } = uploadOption || {}
      if (!file) {
        if (typeof onError === 'function') {
          onError()
        }
        return
      }
      if (!this.beforePreviewUpload(file)) {
        if (typeof onError === 'function') {
          onError()
        }
        return
      }
      this.setLocalPreviewFile(file)
      if (this.dialog.isEdit && this.dialog.form.id) {
        this.uploadPreviewFile(this.dialog.form.id, file)
          .then(() => {
            if (typeof onSuccess === 'function') {
              onSuccess({})
            }
          })
          .catch(() => {
            if (typeof onError === 'function') {
              onError()
            }
          })
      } else {
        this.dialog.previewPendingUpload = true
        this.$message.info(this.$t('materialProcessingProfile.message_preview_upload_pending'))
        if (typeof onSuccess === 'function') {
          onSuccess({})
        }
      }
    },
    // 预览图链接变更时清理本地文件
    handlePreviewUrlInput() {
      if (this.dialog.previewFile || this.dialog.previewPreview) {
        this.clearLocalPreviewFile()
      }
    },
    // 设置本地预览文件并生成临时 URL
    setLocalPreviewFile(file) {
      this.clearLocalPreviewFile()
      if (!file) {
        return
      }
      let objectUrl = ''
      if (typeof window !== 'undefined' && window.URL && typeof window.URL.createObjectURL === 'function') {
        objectUrl = window.URL.createObjectURL(file)
      }
      this.dialog.previewFile = file
      this.dialog.previewPreview = objectUrl
      this.dialog.previewPendingUpload = !(this.dialog.isEdit && this.dialog.form.id)
    },
    // 清理本地临时预览资源
    clearLocalPreviewFile() {
      if (this.dialog.previewPreview && typeof window !== 'undefined' && window.URL && typeof window.URL.revokeObjectURL === 'function') {
        window.URL.revokeObjectURL(this.dialog.previewPreview)
      }
      this.dialog.previewPreview = ''
      this.dialog.previewFile = null
      this.dialog.previewPendingUpload = false
    },
    // 上传预览图至后端并同步最新 URL
    uploadPreviewFile(profileId, file) {
      if (!profileId || !file) {
        return Promise.resolve()
      }
      this.dialog.previewUploading = true
      return uploadMaterialProcessingProfilePreview(profileId, file)
        .then(response => {
          const data = this.resolveResponseData(response)
          const profile = (data && data.profile) || data || {}
          const previewUrl = profile.preview_image_url || data.preview_image_url || ''
          if (previewUrl) {
            this.dialog.form.preview_image_url = previewUrl
            this.clearLocalPreviewFile()
          }
          this.dialog.previewPendingUpload = false
          this.$message.success(this.$t('materialProcessingProfile.message_preview_upload_success'))
          return previewUrl
        })
        .catch(error => {
          const message = (error && error.message) ? error.message : this.$t('materialProcessingProfile.message_preview_upload_error')
          this.$message.error(message)
          throw error
        })
        .finally(() => {
          this.dialog.previewUploading = false
        })
    },
    // 重置预览上传相关状态
    resetPreviewState() {
      this.clearLocalPreviewFile()
      this.dialog.previewUploading = false
      this.dialog.previewPendingUpload = false
    },
    // 根据生成规则同步断点间距规则
    syncLineCutBreakSpacingRule(value, { force = false } = {}) {
      const sections = this.dialog.form.parameterSections
      if (!sections || !sections.line_cut) {
        return
      }
      const nextRule = value || 'by_distance'
      if (!force && sections.line_cut.break_spacing_rule === nextRule) {
        return
      }
      this.$set(sections.line_cut, 'break_spacing_rule', nextRule)
    },
    // 预拉取基础下拉选项
    prefetchBaseOptions() {
      if (!this.materialOptions.length) {
        this.fetchMaterialOptions()
      }
      if (!this.machineOptions.length) {
        this.fetchMachineOptions()
      }
    },
    // 拉取材料下拉选项
    fetchMaterialOptions(keyword = '') {
      this.materialLoading = true
      const params = {
        start: 0,
        limit: 50,
        order: 'name__ASC'
      }
      if (keyword) {
        params.keyword = keyword
      }
      getMaterials(params)
        .then(res => {
          const list = res.data && res.data.list ? res.data.list : []
          const preservedValue = this.dialog.form.material_id
          const options = list.map(item => ({
            value: String(item.id),
            label: formatMaterialLabel(item)
          }))
          if (preservedValue && !options.find(item => item.value === preservedValue)) {
            const matched = list.find(item => String(item.id) === preservedValue)
            if (matched) {
              options.push({ value: String(matched.id), label: formatMaterialLabel(matched) })
            }
          }
          this.materialOptions = options
        })
        .finally(() => {
          this.materialLoading = false
        })
    },
    // 拉取机器下拉选项
    fetchMachineOptions(keyword = '') {
      this.machineLoading = true
      const params = {
        start: 0,
        limit: 50,
        order: 'name__ASC'
      }
      if (keyword) {
        params.keyword = keyword
      }
      getMachines(params)
        .then(res => {
          const list = res.data && res.data.list ? res.data.list : []
          const preservedValue = this.dialog.form.machine_id
          const options = list.map(item => ({
            value: String(item.id),
            label: formatMachineLabel(item)
          }))
          if (preservedValue && !options.find(item => item.value === preservedValue)) {
            const matched = list.find(item => String(item.id) === preservedValue)
            if (matched) {
              options.push({ value: String(matched.id), label: formatMachineLabel(matched) })
            }
          }
          this.machineOptions = options
        })
        .finally(() => {
          this.machineLoading = false
        })
    },
    // 拉取模块下拉选项
    fetchModuleOptions(keyword = '', { machineId } = {}) {
      if (!machineId) {
        this.moduleOptions = []
        return
      }
      this.moduleLoading = true
      const params = {
        start: 0,
        limit: 50,
        machine_id: Number(machineId)
      }
      if (keyword) {
        params.keyword = keyword
      }
      getMachineModules(params)
        .then(res => {
          const list = res.data && res.data.list ? res.data.list : []
          const preservedValue = this.dialog.form.machine_module_id
          const options = list.map(item => ({
            value: String(item.id),
            label: formatModuleLabel({ ...item, machine: item.machine || {}})
          }))
          if (preservedValue && !options.find(item => item.value === preservedValue)) {
            const matched = list.find(item => String(item.id) === preservedValue)
            if (matched) {
              options.push({ value: String(matched.id), label: formatModuleLabel({ ...matched, machine: matched.machine || {}}) })
            }
          }
          this.moduleOptions = options
        })
        .finally(() => {
          this.moduleLoading = false
        })
    },
    // 拉取加工方案下拉选项
    fetchProfileOptions(keyword = '', { machineId, machineModuleId } = {}) {
      if (!machineModuleId) {
        this.profileOptions = []
        return
      }
      this.profileLoading = true
      const params = {
        start: 0,
        limit: 50,
        machine_module_id: Number(machineModuleId)
      }
      if (machineId) {
        params.machine_id = Number(machineId)
      }
      if (keyword) {
        params.keyword = keyword
      }
      getMachineModuleProfiles(params)
        .then(res => {
          const list = res.data && res.data.list ? res.data.list : []
          const preservedValue = this.dialog.form.machine_module_profile_id
          const options = list.map(item => ({
            value: String(item.id),
            label: formatProfileTitle(item)
          }))
          if (preservedValue && !options.find(item => item.value === preservedValue)) {
            const matched = list.find(item => String(item.id) === preservedValue)
            if (matched) {
              options.push({ value: String(matched.id), label: formatProfileTitle(matched) })
            }
          }
          this.profileOptions = options
        })
        .finally(() => {
          this.profileLoading = false
        })
    },
    // 追加单个材料选项
    appendMaterialOption(material) {
      if (!material || !material.id) {
        return
      }
      const option = {
        value: String(material.id),
        label: formatMaterialLabel(material)
      }
      if (!this.materialOptions.find(item => item.value === option.value)) {
        this.materialOptions.push(option)
      }
    },
    // 追加单个机器选项
    appendMachineOption(machine) {
      if (!machine || !machine.id) {
        return
      }
      const option = {
        value: String(machine.id),
        label: formatMachineLabel(machine)
      }
      if (!this.machineOptions.find(item => item.value === option.value)) {
        this.machineOptions.push(option)
      }
    },
    // 追加单个模块选项
    appendModuleOption(module, machine = {}) {
      if (!module || !module.id) {
        return
      }
      const option = {
        value: String(module.id),
        label: formatModuleLabel({ ...module, machine })
      }
      if (!this.moduleOptions.find(item => item.value === option.value)) {
        this.moduleOptions.push(option)
      }
    },
    // 追加单个加工方案选项
    appendProfileOption(profile) {
      if (!profile || !profile.id) {
        return
      }
      const option = {
        value: String(profile.id),
        label: formatProfileTitle(profile)
      }
      if (!this.profileOptions.find(item => item.value === option.value)) {
        this.profileOptions.push(option)
      }
    },
    // 表单校验通过后提交新增或更新
    submitDialog() {
      if (this.dialog.loading) {
        return
      }
      this.$refs.profileForm.validate(valid => {
        if (!valid) {
          return
        }
        let payload
        try {
          payload = this.buildSubmitPayload()
        } catch (error) {
          const message = (error && error.message) ? error.message : this.$t('materialProcessingProfile.message_invalid_json')
          this.$message.error(message)
          return
        }
        this.dialog.loading = true
        const request = this.dialog.isEdit && this.dialog.form.id
          ? updateMaterialProcessingProfile(this.dialog.form.id, payload)
          : createMaterialProcessingProfile(payload)
        request
          .then(response => {
            const currentId = this.dialog.isEdit && this.dialog.form.id ? this.dialog.form.id : this.resolveCreatedProfileId(response)
            if (!this.dialog.isEdit && currentId) {
              this.dialog.form.id = currentId
            }
            return this.handlePostSubmitPreviewUpload(currentId).then(() => response)
          })
          .then(() => {
            const successMessage = this.dialog.isEdit
              ? this.$t('materialProcessingProfile.message_update_success')
              : this.$t('materialProcessingProfile.message_create_success')
            this.$message.success(successMessage)
            this.dialog.visible = false
            this.$emit('saved')
          })
          .finally(() => {
            this.dialog.loading = false
          })
      })
    },
    // 组装提交所需的 payload 数据
    buildSubmitPayload() {
      const form = this.dialog.form
      const payload = {
        material_id: Number(form.material_id),
        machine_module_profile_id: Number(form.machine_module_profile_id),
        power_percent: Number(form.power_percent),
        is_active: !!form.is_active,
        sort_order: form.sort_order != null ? Number(form.sort_order) : 0
      }
      if (form.speed_mm_per_sec !== null && form.speed_mm_per_sec !== '' && form.speed_mm_per_sec !== undefined) {
        payload.speed_mm_per_sec = Number(form.speed_mm_per_sec)
      }
      if (form.passes !== null && form.passes !== '' && form.passes !== undefined) {
        payload.passes = Number(form.passes)
      }
      if (form.focus_offset_mm !== null && form.focus_offset_mm !== '' && form.focus_offset_mm !== undefined) {
        payload.focus_offset_mm = Number(form.focus_offset_mm)
      }
      if (form.air_assist !== '') {
        payload.air_assist = form.air_assist === 'true'
      }
      if (form.preview_image_url) {
        payload.preview_image_url = form.preview_image_url.trim()
      }
      if (form.notes) {
        payload.notes = form.notes.trim()
      }
      const sectionsPayload = this.buildParameterSectionsPayload()
      if (this.dialog.rawOverrides.sections) {
        const rawValue = (form.parameter_matrix_sections_raw || '').trim()
        if (rawValue) {
          try {
            payload.parameter_matrix_sections = JSON.parse(rawValue)
          } catch (error) {
            throw new Error(this.$t('materialProcessingProfile.message_invalid_json'))
          }
        } else {
          payload.parameter_matrix_sections = {}
        }
      } else if (Object.keys(sectionsPayload).length) {
        payload.parameter_matrix_sections = sectionsPayload
      }
      const matrixRaw = form.parameter_matrix_raw && form.parameter_matrix_raw.trim()
      if (matrixRaw) {
        try {
          payload.parameter_matrix = JSON.parse(matrixRaw)
        } catch (error) {
          throw new Error(this.$t('materialProcessingProfile.message_invalid_json'))
        }
      }
      return payload
    },
    // 按表单状态构建参数分段 payload
    buildParameterSectionsPayload() {
      const sections = this.dialog.form.parameterSections || {}
      const result = {}

      const fill = sections.fill_engrave
      if (fill && fill.enabled) {
        const fillPayload = {}
        const density = this.parseNumberField(fill.engrave_density)
        if (density !== null) {
          fillPayload.engrave_density = density
        }
        if (fill.scan_mode) {
          fillPayload.scan_mode = fill.scan_mode
        }
        const overscan = this.parseNumberField(fill.overscan_mm)
        if (overscan !== null) {
          fillPayload.overscan_mm = overscan
        }
        if (Object.keys(fillPayload).length) {
          result.fill_engrave = fillPayload
        }
      }

      const lineEngrave = sections.line_engrave
      if (lineEngrave && lineEngrave.enabled) {
        const linePayload = {}
        const kerf = {
          enabled: !!lineEngrave.kerf_compensation_enabled
        }
        const kerfWidth = this.parseNumberField(lineEngrave.kerf_compensation_width_mm)
        if (kerfWidth !== null) {
          kerf.width_mm = kerfWidth
        }
        linePayload.kerf_compensation = kerf
        result.line_engrave = linePayload
      }

      const lineCut = sections.line_cut
      if (lineCut && lineCut.enabled) {
        const cutPayload = {}
        const kerf = {
          enabled: !!lineCut.kerf_compensation_enabled
        }
        const kerfWidth = this.parseNumberField(lineCut.kerf_compensation_width_mm)
        if (kerfWidth !== null) {
          kerf.width_mm = kerfWidth
        }
        cutPayload.kerf_compensation = kerf

        const focusDown = {
          enabled: !!lineCut.focus_down_enabled
        }
        const focusDistance = this.parseNumberField(lineCut.focus_down_distance_mm)
        if (focusDistance !== null) {
          focusDown.distance_mm = focusDistance
        }
        cutPayload.focus_down = focusDown

        cutPayload.perforation = !!lineCut.perforation

        const assistGas = {
          enabled: !!lineCut.assist_gas_enabled
        }
        const pressure = this.parseNumberField(lineCut.assist_gas_pressure_kpa)
        if (pressure !== null) {
          assistGas.pressure_kpa = pressure
        }
        cutPayload.assist_gas = assistGas

        if (lineCut.generation_rule) {
          cutPayload.generation_rule = lineCut.generation_rule
        }

        const breakConfig = {
          enabled: !!lineCut.break_enabled
        }
        if (lineCut.break_spacing_rule) {
          breakConfig.spacing_rule = lineCut.break_spacing_rule
        }
        const breakSpacing = this.parseNumberField(lineCut.break_spacing_mm)
        if (breakSpacing !== null) {
          breakConfig.spacing_mm = breakSpacing
        }
        const breakSize = this.parseNumberField(lineCut.break_size_mm)
        if (breakSize !== null) {
          breakConfig.size_mm = breakSize
        }
        const breakPower = this.parseNumberField(lineCut.break_power_percent)
        if (breakPower !== null) {
          breakConfig.power_percent = breakPower
        }
        cutPayload.break = breakConfig

        result.line_cut = cutPayload
      }

      const lineMark = sections.line_mark
      if (lineMark && lineMark.enabled) {
        const lineMarkPayload = {}
        const kerf = {
          enabled: !!lineMark.kerf_compensation_enabled
        }
        const kerfWidth = this.parseNumberField(lineMark.kerf_compensation_width_mm)
        if (kerfWidth !== null) {
          kerf.width_mm = kerfWidth
        }
        lineMarkPayload.kerf_compensation = kerf
        const repeat = this.parseNumberField(lineMark.repeat)
        if (repeat !== null) {
          lineMarkPayload.repeat = repeat
        }
        result.line_mark = lineMarkPayload
      }

      const fillMark = sections.fill_mark
      if (fillMark && fillMark.enabled) {
        const fillMarkPayload = {}
        const density = this.parseNumberField(fillMark.engrave_density)
        if (density !== null) {
          fillMarkPayload.engrave_density = density
        }
        if (fillMark.scan_mode) {
          fillMarkPayload.scan_mode = fillMark.scan_mode
        }
        if (Object.keys(fillMarkPayload).length) {
          result.fill_mark = fillMarkPayload
        }
      }

      return result
    },
    // 将输入转换为数字，非法时返回 null
    parseNumberField(value) {
      if (value === '' || value === null || value === undefined) {
        return null
      }
      const num = Number(value)
      return Number.isFinite(num) ? num : null
    },
    // 判断分段对象是否包含有效字段
    hasSectionContent(section) {
      if (!section || typeof section !== 'object') {
        return false
      }
      return Object.keys(section).length > 0
    },
    // 深拷贝参数分段，避免引用共享
    cloneSectionState(sections) {
      const deepClone = target => {
        if (!target || typeof target !== 'object') {
          return target
        }
        const clone = Array.isArray(target) ? [] : {}
        Object.keys(target).forEach(key => {
          clone[key] = deepClone(target[key])
        })
        return clone
      }
      return deepClone(sections)
    },
    // 根据接口返回映射为表单分段结构
    mapSectionsFromResponse(sections) {
      const result = createDefaultParameterSections()
      if (!sections || typeof sections !== 'object') {
        return result
      }

      const fill = sections.fill_engrave
      if (fill && typeof fill === 'object') {
        result.fill_engrave.enabled = this.hasSectionContent(fill)
        if (fill.engrave_density !== undefined) {
          const density = this.parseNumberField(fill.engrave_density)
          if (density !== null) {
            result.fill_engrave.engrave_density = density
          }
        }
        if (fill.scan_mode) {
          result.fill_engrave.scan_mode = fill.scan_mode
        }
        if (fill.overscan_mm !== undefined) {
          const overscan = this.parseNumberField(fill.overscan_mm)
          if (overscan !== null) {
            result.fill_engrave.overscan_mm = overscan
          }
        }
      }

      const lineEngrave = sections.line_engrave
      if (lineEngrave && typeof lineEngrave === 'object') {
        result.line_engrave.enabled = this.hasSectionContent(lineEngrave)
        if (lineEngrave.kerf_compensation && typeof lineEngrave.kerf_compensation === 'object') {
          if (typeof lineEngrave.kerf_compensation.enabled === 'boolean') {
            result.line_engrave.kerf_compensation_enabled = lineEngrave.kerf_compensation.enabled
          }
          if (lineEngrave.kerf_compensation.width_mm !== undefined) {
            const width = this.parseNumberField(lineEngrave.kerf_compensation.width_mm)
            if (width !== null) {
              result.line_engrave.kerf_compensation_width_mm = width
            }
          }
        }
      }

      const lineCut = sections.line_cut
      if (lineCut && typeof lineCut === 'object') {
        result.line_cut.enabled = this.hasSectionContent(lineCut)
        if (lineCut.kerf_compensation && typeof lineCut.kerf_compensation === 'object') {
          if (typeof lineCut.kerf_compensation.enabled === 'boolean') {
            result.line_cut.kerf_compensation_enabled = lineCut.kerf_compensation.enabled
          }
          if (lineCut.kerf_compensation.width_mm !== undefined) {
            const width = this.parseNumberField(lineCut.kerf_compensation.width_mm)
            if (width !== null) {
              result.line_cut.kerf_compensation_width_mm = width
            }
          }
        }
        if (lineCut.focus_down && typeof lineCut.focus_down === 'object') {
          if (typeof lineCut.focus_down.enabled === 'boolean') {
            result.line_cut.focus_down_enabled = lineCut.focus_down.enabled
          }
          if (lineCut.focus_down.distance_mm !== undefined) {
            const distance = this.parseNumberField(lineCut.focus_down.distance_mm)
            if (distance !== null) {
              result.line_cut.focus_down_distance_mm = distance
            }
          }
        }
        if (typeof lineCut.perforation === 'boolean') {
          result.line_cut.perforation = lineCut.perforation
        }
        if (lineCut.assist_gas && typeof lineCut.assist_gas === 'object') {
          if (typeof lineCut.assist_gas.enabled === 'boolean') {
            result.line_cut.assist_gas_enabled = lineCut.assist_gas.enabled
          }
          if (lineCut.assist_gas.pressure_kpa !== undefined) {
            const pressure = this.parseNumberField(lineCut.assist_gas.pressure_kpa)
            if (pressure !== null) {
              result.line_cut.assist_gas_pressure_kpa = pressure
            }
          }
        }
        if (lineCut.generation_rule) {
          result.line_cut.generation_rule = lineCut.generation_rule
        }
        if (lineCut.break && typeof lineCut.break === 'object') {
          if (typeof lineCut.break.enabled === 'boolean') {
            result.line_cut.break_enabled = lineCut.break.enabled
          }
          if (lineCut.break.spacing_rule) {
            result.line_cut.break_spacing_rule = lineCut.break.spacing_rule
          }
          if (lineCut.break.spacing_mm !== undefined) {
            const spacing = this.parseNumberField(lineCut.break.spacing_mm)
            if (spacing !== null) {
              result.line_cut.break_spacing_mm = spacing
            }
          }
          if (lineCut.break.size_mm !== undefined) {
            const size = this.parseNumberField(lineCut.break.size_mm)
            if (size !== null) {
              result.line_cut.break_size_mm = size
            }
          }
          if (lineCut.break.power_percent !== undefined) {
            const power = this.parseNumberField(lineCut.break.power_percent)
            if (power !== null) {
              result.line_cut.break_power_percent = power
            }
          }
        }
      }

      const lineMark = sections.line_mark
      if (lineMark && typeof lineMark === 'object') {
        result.line_mark.enabled = this.hasSectionContent(lineMark)
        if (lineMark.kerf_compensation && typeof lineMark.kerf_compensation === 'object') {
          if (typeof lineMark.kerf_compensation.enabled === 'boolean') {
            result.line_mark.kerf_compensation_enabled = lineMark.kerf_compensation.enabled
          }
          if (lineMark.kerf_compensation.width_mm !== undefined) {
            const width = this.parseNumberField(lineMark.kerf_compensation.width_mm)
            if (width !== null) {
              result.line_mark.kerf_compensation_width_mm = width
            }
          }
        }
        if (lineMark.repeat !== undefined) {
          const repeat = this.parseNumberField(lineMark.repeat)
          if (repeat !== null) {
            result.line_mark.repeat = repeat
          }
        }
      }

      const fillMark = sections.fill_mark
      if (fillMark && typeof fillMark === 'object') {
        result.fill_mark.enabled = this.hasSectionContent(fillMark)
        if (fillMark.engrave_density !== undefined) {
          const density = this.parseNumberField(fillMark.engrave_density)
          if (density !== null) {
            result.fill_mark.engrave_density = density
          }
        }
        if (fillMark.scan_mode) {
          result.fill_mark.scan_mode = fillMark.scan_mode
        }
      }

      return result
    },
    // 统一抽取接口响应中的 data 字段
    resolveResponseData(response) {
      if (!response) {
        return {}
      }
      const payload = response.data !== undefined ? response.data : response
      if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'data')) {
        const inner = payload.data
        if (inner && typeof inner === 'object') {
          return inner
        }
      }
      return payload || {}
    },
    // 提取新建后返回的加工配置 ID
    resolveCreatedProfileId(response) {
      const data = this.resolveResponseData(response)
      if (data && typeof data === 'object') {
        if (data.id) {
          return data.id
        }
        if (data.profile && data.profile.id) {
          return data.profile.id
        }
      }
      return null
    },
    // 若存在待上传预览图则在提交后补传
    handlePostSubmitPreviewUpload(profileId) {
      if (!this.dialog.previewFile || !this.dialog.previewPendingUpload) {
        return Promise.resolve()
      }
      if (!profileId) {
        this.dialog.previewPendingUpload = false
        this.$message.warning(this.$t('materialProcessingProfile.message_preview_upload_missing_id'))
        return Promise.resolve()
      }
      return this.uploadPreviewFile(profileId, this.dialog.previewFile).catch(() => {})
    },
    // 弹窗关闭后重置表单与校验规则
    resetDialog() {
      if (this.$refs.profileForm) {
        this.$refs.profileForm.clearValidate()
      }
      this.dialog.rules = {}
      const defaults = createDefaultForm()
      Object.keys(defaults).forEach(key => {
        this.$set(this.dialog.form, key, defaults[key])
      })
      this.dialog.loading = false
      this.resetPreviewState()
      this.resetRawOverrides()
      this.syncLineCutBreakSpacingRule(this.dialog.form.parameterSections.line_cut.generation_rule, { force: true })
      this.$nextTick(() => {
        this.dialog.rules = cloneRules(this.baseRules)
        if (this.$refs.profileForm) {
          this.$refs.profileForm.clearValidate()
        }
      })
    }
  }
}
</script>

<style scoped>
.preview-upload-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.preview-tip {
  font-size: 12px;
  color: #909399;
}
.preview-display {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.preview-display-title {
  font-size: 12px;
  color: #606266;
}
.preview-display-image {
  width: 220px;
  height: 140px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}
.preview-display-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #c0c4cc;
  font-size: 12px;
}
.preview-clear {
  padding: 0;
}
.parameter-sections {
  display: grid;
  gap: 12px;
}
.parameter-section-card {
  border-radius: 6px;
}
.parameter-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.parameter-section-title {
  font-weight: 500;
  font-size: 14px;
}
.parameter-section-body {
  padding-top: 4px;
}
.parameter-section-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}
.line-cut-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}
.line-cut-grid .parameter-field {
  border-radius: 6px;
  padding: 12px;
  border: 1px solid #ebeef5;
}
.line-cut-grid .parameter-field.group-kerf,
.line-cut-grid .parameter-field.group-focus,
.line-cut-grid .parameter-field.group-assist {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}
.line-cut-grid .parameter-field.group-break-spacing,
.line-cut-grid .parameter-field.group-break-size,
.line-cut-grid .parameter-field.group-break-power {
  align-self: end;
}
.parameter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.parameter-field-label {
  font-size: 12px;
  color: #606266;
  line-height: 18px;
}
.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.profile-dialog-select--wide {
  width: 380px;
}
</style>
