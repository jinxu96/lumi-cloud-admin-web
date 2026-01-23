<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('machineModule.search_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="checkPermission(['app-admin.machine-modules.import'])"
            :loading="templateLoading"
            icon="el-icon-document"
            size="small"
            @click="handleDownloadTemplate"
          >
            {{ $t('machineModule.action_download_template') }}
          </el-button>
          <el-button
            v-if="checkPermission(['app-admin.machine-modules.store'])"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openCreate"
          >
            {{ $t('machineModule.action_create') }}
          </el-button>
          <el-button
            v-if="checkPermission(['app-admin.machine-modules.import'])"
            :loading="importing"
            icon="el-icon-upload2"
            size="small"
            @click="handleImportClick"
          >
            {{ $t('machineModule.action_import') }}
          </el-button>
          <el-button
            v-if="checkPermission(['app-admin.machine-modules.export'])"
            :loading="exporting"
            icon="el-icon-download"
            size="small"
            @click="handleExport"
          >
            {{ $t('machineModule.action_export') }}
          </el-button>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('machineModule.search_keyword')"
          clearable
          class="filter-item"
          style="width: 240px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('machineModule.search_machine') }}</span>
          <el-select
            v-model="listQuery.machine_id"
            clearable
            filterable
            :placeholder="$t('machineModule.filter_machine_placeholder')"
            class="filter-select"
            style="width: 220px;"
            :loading="machineOptionsLoading"
            @visible-change="handleMachineSelectVisible"
            @change="handleFilter"
          >
            <el-option :label="$t('machineModule.option_all')" value="" />
            <el-option
              v-for="item in machineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('machineModule.search_status') }}</span>
          <el-select
            v-model="listQuery.is_active"
            :placeholder="$t('machineModule.search_status')"
            clearable
            class="filter-select"
            style="width: 160px;"
            @change="handleFilter"
          >
            <el-option :label="$t('machineModule.option_all')" value="" />
            <el-option :label="$t('machineModule.option_enabled')" value="true" />
            <el-option :label="$t('machineModule.option_disabled')" value="false" />
          </el-select>
        </div>

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('machineModule.search_order')"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('machineModule.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('machineModule.search_reset') }}
        </el-button>
      </div>

      <div class="module-tip">
        提示：同一机器若有蓝光、光纤等不同激光类型且存在 20W、30W 等不同功率，建议在模块名称中标注功率区分，例如“蓝光20W”、“蓝光30W”，便于识别。
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :empty-text="$t('machineModule.empty_text')"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column min-width="220" :label="$t('machineModule.table_name')">
          <template slot-scope="{ row }">
            <div class="module-name">
              <span class="module-title">{{ row.name }}</span>
              <div v-if="row.description" class="module-desc">{{ row.description }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('machineModule.table_machine')">
          <template slot-scope="{ row }">
            <span>{{ (row.machine && row.machine.name) || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('machineModule.table_power')">
          <template slot-scope="{ row }">
            <span>{{ row.power_watt || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="160" :label="$t('machineModule.table_color')">
          <template slot-scope="{ row }">
            <div v-if="row.color_hex" class="color-cell">
              <span class="color-block" :style="{ backgroundColor: row.color_hex }" />
              <span class="color-text">{{ row.color_hex }}</span>
            </div>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('machineModule.table_is_active')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? $t('machineModule.status_enabled') : $t('machineModule.status_disabled') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('machineModule.table_sort')">
          <template slot-scope="{ row }">
            <span>{{ row.sort_order }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('machineModule.table_profiles')">
          <template slot-scope="{ row }">
            <span>{{ row.profiles_count || 0 }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('machineModule.table_created')">
          <template slot-scope="{ row }">
            <span>{{ row.created_at }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="360" align="center" :label="$t('machineModule.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-view"
              :disabled="!checkPermission(['app-admin.machine-modules.show'])"
              @click="openDetail(row)"
            >
              {{ $t('machineModule.action_view') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="primary"
              icon="el-icon-edit"
              plain
              :disabled="!checkPermission(['app-admin.machine-modules.update'])"
              @click="openEdit(row)"
            >
              {{ $t('machineModule.action_edit') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              :type="row.is_active ? 'warning' : 'success'"
              plain
              icon="el-icon-switch-button"
              :loading="loading.status === row.id"
              :disabled="!checkPermission(['app-admin.machine-modules.status'])"
              @click="toggleStatus(row)"
            >
              {{ row.is_active ? $t('machineModule.action_disable') : $t('machineModule.action_enable') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :loading="loading.delete === row.id"
              :disabled="!checkPermission(['app-admin.machine-modules.destroy'])"
              @click="handleDelete(row)"
            >
              {{ $t('machineModule.action_delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <input
      ref="importInput"
      type="file"
      class="hidden-file-input"
      accept=".csv,.xlsx,.xls"
      @change="handleImportChange"
    >

    <el-dialog
      :title="dialog.isEdit ? $t('machineModule.dialog_edit_title') : $t('machineModule.dialog_create_title')"
      :visible.sync="dialog.visible"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetDialog"
    >
      <el-form ref="moduleForm" :model="dialog.form" :rules="dialog.rules" label-width="120px">
        <el-form-item :label="$t('machineModule.form_machine')" prop="machine_id">
          <el-select
            v-model="dialog.form.machine_id"
            filterable
            clearable
            :placeholder="$t('machineModule.filter_machine_placeholder')"
            @visible-change="visible => visible && loadMachineOptions()"
          >
            <el-option
              v-for="item in machineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_name')" prop="name">
          <el-input v-model="dialog.form.name" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_power')">
          <el-input-number v-model="dialog.form.power_watt" :min="0" :max="200000" :step="10" controls-position="right" />
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_color')">
          <el-input v-model="dialog.form.color_hex" maxlength="7" placeholder="#FFFFFF" />
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_description')">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_is_active')">
          <el-switch v-model="dialog.form.is_active" active-color="#13ce66" inactive-color="#dcdfe6" />
        </el-form-item>
        <el-form-item :label="$t('machineModule.form_sort')">
          <el-input-number v-model="dialog.form.sort_order" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="submitDialog">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>

    <el-drawer
      :title="$t('machineModule.dialog_detail_title')"
      :visible.sync="detail.visible"
      size="45%"
      :destroy-on-close="true"
      @close="handleDetailClosed"
    >
      <div v-if="detail.loading" class="drawer-loading">
        <i class="el-icon-loading drawer-loading__icon" />
        <span class="drawer-loading__text">{{ $t('common.loading') }}</span>
      </div>
      <div v-else class="drawer-content">
        <el-form label-position="left" label-width="120px" class="detail-form">
          <el-form-item :label="$t('machineModule.detail_machine')">
            <span>{{ detail.data.machine ? detail.data.machine.name : '-' }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_name')">
            <span>{{ detail.data.name || '-' }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_power')">
            <span>{{ detail.data.power_watt || '-' }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_color')">
            <span>{{ detail.data.color_hex || '-' }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_is_active')">
            <span>{{ detail.data.is_active ? $t('machineModule.status_enabled') : $t('machineModule.status_disabled') }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_sort')">
            <span>{{ detail.data.sort_order || 0 }}</span>
          </el-form-item>
          <el-form-item :label="$t('machineModule.form_description')">
            <span>{{ detail.data.description || '-' }}</span>
          </el-form-item>
        </el-form>

        <div class="detail-section">
          <div class="detail-section__header">
            <h4>{{ $t('machineModule.detail_profiles') }}</h4>
            <el-button
              v-if="checkPermission(['app-admin.machine-module-profiles.store'])"
              type="primary"
              size="mini"
              icon="el-icon-plus"
              @click="openProfileDialog"
            >
              {{ $t('machineModule.action_add_profile') }}
            </el-button>
          </div>
          <el-table
            v-if="detail.profiles && detail.profiles.length"
            :data="detail.profiles"
            border
            size="small"
            style="width: 100%"
          >
            <el-table-column prop="processing_module" :label="$t('machineModule.profile_processing_module')" />
            <el-table-column prop="processing_mode" :label="$t('machineModule.profile_processing_mode')" />
            <el-table-column prop="process_type" :label="$t('machineModule.profile_process_type')" />
            <el-table-column prop="power_watt" :label="$t('machineModule.profile_power')" />
            <el-table-column prop="sort_order" :label="$t('machineModule.profile_sort')" />
            <el-table-column
              v-if="checkPermission(['app-admin.machine-module-profiles.update', 'app-admin.machine-module-profiles.destroy'])"
              :label="$t('machineModule.profile_actions')"
              width="180"
              align="center"
            >
              <template slot-scope="{ row }">
                <el-button
                  v-if="checkPermission(['app-admin.machine-module-profiles.update'])"
                  size="mini"
                  type="primary"
                  plain
                  icon="el-icon-edit"
                  @click="openProfileEdit(row)"
                >
                  {{ $t('machineModule.action_edit_profile') }}
                </el-button>
                <el-button
                  v-if="checkPermission(['app-admin.machine-module-profiles.destroy'])"
                  size="mini"
                  type="danger"
                  plain
                  icon="el-icon-delete"
                  :loading="loading.profileDelete === row.id"
                  @click="handleProfileDelete(row)"
                >
                  {{ $t('machineModule.action_delete_profile') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 无加工方案时显示的提示块 -->
          <div v-else class="detail-empty">
            {{ $t('machineModule.detail_profiles_empty') }}
          </div>
        </div>
      </div>
    </el-drawer>

    <profile-scheme-dialog
      v-if="detail.profileDialogVisible"
      :visible.sync="detail.profileDialogVisible"
      :machine-module-id="detail.currentId"
      :default-power="detail.data && detail.data.power_watt"
      :mode="detail.profileDialogMode"
      :profile="detail.activeProfile"
      @submit="handleProfileSubmit"
      @closed="handleProfileDialogClosed"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination'
import {
  getMachineModules,
  deleteMachineModule,
  createMachineModule,
  updateMachineModule,
  getMachineModuleDetail,
  importMachineModules,
  exportMachineModules,
  downloadMachineModuleTemplate,
  updateMachineModuleStatus
} from '@/api/machineModules'
import { getMachines } from '@/api/machines'
import {
  createMachineModuleProfile,
  updateMachineModuleProfile,
  deleteMachineModuleProfile
} from '@/api/machineModuleProfiles'
import ProfileSchemeDialog from './components/ProfileSchemeDialog.vue'

const createDefaultModuleForm = () => ({
  id: '',
  machine_id: '',
  name: '',
  power_watt: null,
  color_hex: '',
  description: '',
  is_active: true,
  sort_order: 0
})

export default {
  name: 'MachineModuleIndex',
  components: { Pagination, ProfileSchemeDialog },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        machine_id: '',
        is_active: '',
        order: 'created_at__DESC',
        limit: 20,
        page: 1
      },
      orderOptions: [],
      machineOptions: [],
      machineOptionsLoading: false,
      loading: {
        delete: '',
        status: '',
        profileDelete: ''
      },
      importing: false,
      exporting: false,
      templateLoading: false,
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        form: createDefaultModuleForm(),
        rules: {
          machine_id: [{ required: true, message: this.$t('machineModule.form_rules_machine'), trigger: 'change' }],
          name: [{ required: true, message: this.$t('machineModule.form_rules_name'), trigger: 'blur' }]
        }
      },
      detail: {
        visible: false,
        loading: false,
        currentId: '',
        data: {},
        profiles: [],
        profileDialogVisible: false, // 控制新增加工方案弹窗
        profileDialogMode: 'create', // 弹窗当前模式（新增/编辑）
        activeProfile: null // 当前正在编辑的加工方案
      }
    }
  },
  created() {
    this.orderOptions = [
      { key: 'id__DESC', label: this.$t('machineModule.order_id_desc') },
      { key: 'id__ASC', label: this.$t('machineModule.order_id_asc') },
      { key: 'power_watt__DESC', label: this.$t('machineModule.order_power_desc') },
      { key: 'power_watt__ASC', label: this.$t('machineModule.order_power_asc') },
      { key: 'created_at__DESC', label: this.$t('machineModule.order_created_desc') },
      { key: 'created_at__ASC', label: this.$t('machineModule.order_created_asc') }
    ]
    const { machine_id: machineId } = this.$route.query || {}
    if (machineId) {
      this.listQuery.machine_id = String(machineId)
      this.loadMachineOptions()
    }
    this.getList()
  },
  methods: {
    checkPermission,
    // 获取模块列表
    getList() {
      this.listLoading = true
      const params = {
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit,
        order: this.listQuery.order || 'created_at__DESC'
      }
      if (this.listQuery.keyword) {
        params.keyword = this.listQuery.keyword
      }
      if (this.listQuery.machine_id) {
        params.machine_id = Number(this.listQuery.machine_id)
      }
      if (this.listQuery.is_active !== '' && this.listQuery.is_active !== null) {
        params.is_active = this.listQuery.is_active === 'true'
      }
      getMachineModules(params)
        .then(res => {
          const payload = res.data || {}
          this.list = payload.list || []
          this.total = payload.total || 0
          this.ensureMachineOption()
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 加载机器筛选项
    loadMachineOptions() {
      if (this.machineOptions.length || this.machineOptionsLoading) {
        return
      }
      this.machineOptionsLoading = true
      getMachines({ start: 0, limit: 200, order: 'name__ASC' })
        .then(res => {
          const payload = res.data || {}
          const options = (payload.list || []).map(item => ({
            label: item.name,
            value: String(item.id)
          }))
          this.machineOptions = options
          this.ensureMachineOption()
        })
        .finally(() => {
          this.machineOptionsLoading = false
        })
    },
    // 确保当前选中机器存在于选项中
    ensureMachineOption() {
      if (!this.listQuery.machine_id) {
        return
      }
      const exists = this.machineOptions.some(item => item.value === this.listQuery.machine_id)
      if (!exists && this.list.length) {
        const matched = this.list.find(item => item.machine && String(item.machine.id) === this.listQuery.machine_id)
        if (matched && matched.machine) {
          this.machineOptions.unshift({
            label: matched.machine.name,
            value: String(matched.machine.id)
          })
        }
      }
    },
    // 打开机器下拉时触发加载
    handleMachineSelectVisible(visible) {
      if (visible) {
        this.loadMachineOptions()
      }
    },
    // 应用筛选条件
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置筛选条件
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        machine_id: '',
        is_active: '',
        order: 'created_at__DESC',
        limit,
        page: 1
      }
      this.getList()
    },
    // 删除模块
    handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('machineModule.confirm_delete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.delete = row.id
        deleteMachineModule(row.id)
          .then(() => {
            this.$message.success(this.$t('machineModule.message_delete_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.delete = ''
          })
      }).catch(() => {})
    },
    // 打开新增弹窗
    openCreate() {
      this.dialog.visible = true
      this.dialog.isEdit = false
      this.dialog.form = {
        ...createDefaultModuleForm(),
        machine_id: this.listQuery.machine_id ? String(this.listQuery.machine_id) : ''
      }
      this.loadMachineOptions()
    },
    // 打开编辑弹窗
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.form = {
        id: row.id,
        machine_id: row.machine && row.machine.id ? String(row.machine.id) : '',
        name: row.name || '',
        power_watt: typeof row.power_watt === 'number' ? row.power_watt : (row.power_watt ? Number(row.power_watt) : null),
        color_hex: row.color_hex || '',
        description: row.description || '',
        is_active: Boolean(row.is_active),
        sort_order: typeof row.sort_order === 'number' ? row.sort_order : Number(row.sort_order) || 0
      }
      this.loadMachineOptions()
    },
    // 切换模块启用状态
    toggleStatus(row) {
      if (!row || !row.id) {
        return
      }
      const targetStatus = !row.is_active
      const confirmKey = targetStatus ? 'machineModule.confirm_enable' : 'machineModule.confirm_disable'
      this.$confirm(this.$t(confirmKey), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.status = row.id
        updateMachineModuleStatus(row.id, targetStatus)
          .then(() => {
            const messageKey = targetStatus ? 'machineModule.message_enable_success' : 'machineModule.message_disable_success'
            this.$message.success(this.$t(messageKey))
            this.getList()
          })
          .finally(() => {
            this.loading.status = ''
          })
      }).catch(() => {})
    },
    // 提交新增或编辑
    submitDialog() {
      this.$refs.moduleForm.validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          machine_id: Number(this.dialog.form.machine_id),
          name: this.dialog.form.name,
          power_watt: this.dialog.form.power_watt === null || this.dialog.form.power_watt === ''
            ? null
            : Number(this.dialog.form.power_watt),
          color_hex: this.normalizeColor(this.dialog.form.color_hex),
          description: this.dialog.form.description || '',
          is_active: Boolean(this.dialog.form.is_active),
          sort_order: Number(this.dialog.form.sort_order) || 0
        }
        if (!payload.machine_id) {
          this.$message.warning(this.$t('machineModule.form_rules_machine'))
          return
        }
        this.dialog.loading = true
        const request = this.dialog.isEdit
          ? updateMachineModule(this.dialog.form.id, payload)
          : createMachineModule(payload)
        request
          .then(() => {
            const key = this.dialog.isEdit ? 'machineModule.message_update_success' : 'machineModule.message_create_success'
            this.$message.success(this.$t(key))
            this.dialog.visible = false
            this.getList()
          })
          .finally(() => {
            this.dialog.loading = false
          })
      })
    },
    // 重置弹窗状态
    resetDialog() {
      if (this.$refs.moduleForm) {
        this.$refs.moduleForm.resetFields()
      }
      this.dialog.loading = false
      this.dialog.form = createDefaultModuleForm()
    },
    // 规范颜色值
    normalizeColor(value) {
      if (!value) {
        return ''
      }
      const trimmed = String(value).trim()
      if (!trimmed) {
        return ''
      }
      const upper = trimmed.startsWith('#') ? trimmed.toUpperCase() : `#${trimmed.toUpperCase()}`
      return upper.length === 7 ? upper : upper
    },
    // 触发隐藏的导入选择框
    handleImportClick() {
      if (this.importing) {
        return
      }
      if (this.$refs.importInput) {
        this.$refs.importInput.value = ''
        this.$refs.importInput.click()
      }
    },
    // 导入模块配置
    handleImportChange(event) {
      const file = event && event.target && event.target.files ? event.target.files[0] : null
      if (!file) {
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      this.importing = true
      importMachineModules(formData)
        .then(res => {
          const message = (res && res.message) ? res.message : this.$t('machineModule.message_import_success')
          this.$message.success(message)
          this.getList()
        })
        .catch(err => {
          const message = (err && err.message) ? err.message : this.$t('machineModule.message_import_error')
          this.$message.error(message)
        })
        .finally(() => {
          this.importing = false
          if (this.$refs.importInput) {
            this.$refs.importInput.value = ''
          }
        })
    },
    // 导出模块配置
    handleExport() {
      if (this.exporting) {
        return
      }
      const params = {
        machine_id: this.listQuery.machine_id ? Number(this.listQuery.machine_id) : undefined,
        keyword: this.listQuery.keyword || undefined,
        is_active: this.listQuery.is_active !== '' ? (this.listQuery.is_active === 'true') : undefined
      }
      this.exporting = true
      exportMachineModules(params)
        .then(response => {
          this.downloadBlob(response, 'machine_modules_export.xlsx')
          this.$message.success(this.$t('machineModule.message_export_success'))
        })
        .catch(err => {
          if (err instanceof Blob) {
            this.downloadBlob(err, 'machine_modules_export.xlsx')
            this.$message.success(this.$t('machineModule.message_export_success'))
          } else {
            const message = (err && err.message) ? err.message : this.$t('machineModule.message_export_error')
            this.$message.error(message)
          }
        })
        .finally(() => {
          this.exporting = false
        })
    },
    // 下载导入模板
    handleDownloadTemplate() {
      if (this.templateLoading) {
        return
      }
      this.templateLoading = true
      downloadMachineModuleTemplate()
        .then(response => {
          this.downloadBlob(response, 'machine_module_import_template.csv')
          this.$message.success(this.$t('machineModule.message_template_success'))
        })
        .catch(err => {
          if (err instanceof Blob) {
            this.downloadBlob(err, 'machine_module_import_template.csv')
            this.$message.success(this.$t('machineModule.message_template_success'))
          } else {
            const message = (err && err.message) ? err.message : this.$t('machineModule.message_template_error')
            this.$message.error(message)
          }
        })
        .finally(() => {
          this.templateLoading = false
        })
    },
    // 执行 Blob 下载
    downloadBlob(response, fallbackName = 'machine_modules_export.xlsx') {
      if (!response) {
        return
      }
      const blob = response.data instanceof Blob ? response.data : response
      const disposition = response.headers ? response.headers['content-disposition'] : ''
      let fileName = fallbackName
      if (disposition) {
        const match = /filename\*=utf-8''([^;]+)/i.exec(disposition) || /filename="?([^";]+)"?/i.exec(disposition)
        if (match && match[1]) {
          fileName = decodeURIComponent(match[1])
        }
      }
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    },
    loadModuleDetail(moduleId, { reset = false, showLoading = true } = {}) {
      if (!moduleId) {
        return
      }
      if (reset) {
        this.detail.data = {}
        this.detail.profiles = []
      }
      if (showLoading) {
        this.detail.loading = true
      }
      return getMachineModuleDetail(moduleId)
        .then(res => {
          const data = res.data || {}
          this.detail.data = data
          this.detail.profiles = data.profiles || []
        })
        .finally(() => {
          if (showLoading) {
            this.detail.loading = false
          }
        })
    },
    // 打开详情抽屉
    openDetail(row) {
      if (!row || !row.id) {
        return
      }
      this.detail.visible = true
      this.detail.profileDialogVisible = false
      this.detail.currentId = row.id
      this.loadModuleDetail(row.id, { reset: true, showLoading: true })
    },
    openProfileDialog() {
      if (!this.detail.currentId) {
        return
      }
      this.detail.profileDialogMode = 'create'
      this.detail.activeProfile = null
      this.detail.profileDialogVisible = true
    },
    openProfileEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.detail.profileDialogMode = 'edit'
      this.detail.activeProfile = { ...row }
      this.detail.profileDialogVisible = true
    },
    handleProfileSubmit(context, done) {
      const mode = context && context.mode ? context.mode : 'create'
      const payload = context && context.payload ? context.payload : null
      const profileId = context && context.profileId ? context.profileId : (this.detail.activeProfile && this.detail.activeProfile.id)
      if (!payload) {
        done(false)
        return
      }
      let request
      if (mode === 'edit' && profileId) {
        request = updateMachineModuleProfile(profileId, payload)
      } else {
        request = createMachineModuleProfile(payload)
      }
      request
        .then(() => {
          const messageKey = mode === 'edit'
            ? 'machineModule.message_profile_update_success'
            : 'machineModule.message_profile_create_success'
          this.$message.success(this.$t(messageKey))
          this.loadModuleDetail(this.detail.currentId, { reset: false, showLoading: false })
          done(true)
        })
        .catch(err => {
          const fallbackKey = mode === 'edit'
            ? 'machineModule.message_profile_update_error'
            : 'machineModule.message_profile_create_error'
          const message = (err && err.message) ? err.message : this.$t(fallbackKey)
          this.$message.error(message)
          done(false)
        })
    },
    handleProfileDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('machineModule.confirm_profile_delete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.profileDelete = row.id
        deleteMachineModuleProfile(row.id)
          .then(() => {
            this.$message.success(this.$t('machineModule.message_profile_delete_success'))
            this.loadModuleDetail(this.detail.currentId, { reset: false, showLoading: false })
          })
          .catch(err => {
            const message = (err && err.message) ? err.message : this.$t('machineModule.message_profile_delete_error')
            this.$message.error(message)
          })
          .finally(() => {
            this.loading.profileDelete = ''
          })
      }).catch(() => {})
    },
    handleProfileDialogClosed() {
      this.detail.profileDialogMode = 'create'
      this.detail.activeProfile = null
    },
    handleDetailClosed() {
      this.detail.profileDialogVisible = false
      this.detail.currentId = ''
      this.detail.profileDialogMode = 'create'
      this.detail.activeProfile = null
      this.loading.profileDelete = ''
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-weight: 600;
  font-size: 16px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.hidden-file-input {
  display: none;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.filter-item {
  margin-bottom: 12px;
}
.filter-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
.module-tip {
  margin: 4px 0 16px;
  color: #f56c6c;
  font-size: 13px;
}
.color-cell {
  display: flex;
  align-items: center;
}
.color-block {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid #e0e0e0;
  margin-right: 6px;
}
.color-text {
  font-size: 12px;
  color: #606266;
}
.module-name {
  display: flex;
  flex-direction: column;
}
.module-title {
  font-weight: 500;
  margin-bottom: 2px;
}
.module-desc {
  font-size: 12px;
  color: #909399;
}
.module-desc:empty {
  display: none;
}
.drawer-loading {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.drawer-loading__icon {
  font-size: 24px;
  color: #409EFF;
}
.drawer-loading__text {
  color: #606266;
}
.drawer-content {
  padding: 0 8px 24px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
}
.detail-form .el-form-item {
  margin-bottom: 12px;
}
.detail-section {
  margin-top: 24px;
}
.detail-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.detail-section__header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}
.detail-empty {
  padding: 28px 0;
  text-align: center;
  color: #909399;
  font-size: 13px;
}
</style>
