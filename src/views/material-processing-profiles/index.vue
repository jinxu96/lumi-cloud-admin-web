<template>
  <div class="app-container material-processing-profiles">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('materialProcessingProfile.search_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="checkPermission(['app-admin.material-processing-profiles.template'])"
            :loading="templateLoading"
            icon="el-icon-download"
            size="small"
            @click="downloadTemplate"
          >
            {{ $t('materialProcessingProfile.action_download_template') }}
          </el-button>
          <el-button
            v-if="checkPermission(['app-admin.material-processing-profiles.store'])"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openCreate"
          >
            {{ $t('materialProcessingProfile.action_create') }}
          </el-button>
          <el-button
            v-if="checkPermission(['app-admin.material-library.import'])"
            :loading="importing"
            icon="el-icon-upload2"
            size="small"
            @click="handleImportClick"
          >
            {{ $t('materialProcessingProfile.action_import') }}
          </el-button>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('materialProcessingProfile.search_keyword')"
          clearable
          class="filter-item"
          style="width: 220px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('materialProcessingProfile.search_material') }}</span>
          <el-select
            v-model="listQuery.material_id"
            filterable
            remote
            clearable
            style="width: 220px;"
            :remote-method="handleMaterialRemote"
            :loading="materialLoading"
            @visible-change="handleMaterialVisible"
            @change="handleFilter"
          >
            <el-option
              v-for="item in materialOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('materialProcessingProfile.search_machine') }}</span>
          <el-select
            v-model="listQuery.machine_id"
            filterable
            remote
            clearable
            style="width: 200px;"
            :remote-method="handleMachineRemote"
            :loading="machineLoading"
            @visible-change="handleMachineVisible"
            @change="handleMachineFilterChange"
          >
            <el-option
              v-for="item in machineOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('materialProcessingProfile.search_machine_module') }}</span>
          <el-select
            v-model="listQuery.machine_module_id"
            filterable
            remote
            clearable
            style="width: 220px;"
            :remote-method="handleModuleRemote"
            :loading="moduleLoading"
            :disabled="!listQuery.machine_id"
            @visible-change="handleModuleVisible"
            @change="handleModuleFilterChange"
          >
            <el-option
              v-for="item in moduleOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('materialProcessingProfile.search_machine_module_profile') }}</span>
          <el-select
            v-model="listQuery.machine_module_profile_id"
            filterable
            remote
            clearable
            style="width: 220px;"
            :remote-method="handleProfileRemote"
            :loading="profileLoading"
            :disabled="!listQuery.machine_module_id"
            @visible-change="handleProfileVisible"
            @change="handleProfileFilterChange"
          >
            <el-option
              v-for="item in profileOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('materialProcessingProfile.search_status') }}</span>
          <el-select
            v-model="listQuery.is_active"
            clearable
            style="width: 140px;"
            @change="handleFilter"
          >
            <el-option :label="$t('materialProcessingProfile.option_all')" value="" />
            <el-option :label="$t('materialProcessingProfile.option_enabled')" value="true" />
            <el-option :label="$t('materialProcessingProfile.option_disabled')" value="false" />
          </el-select>
        </div>

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('materialProcessingProfile.search_order')"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('materialProcessingProfile.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('materialProcessingProfile.search_reset') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :empty-text="$t('materialProcessingProfile.empty_text')"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column min-width="220" :label="$t('materialProcessingProfile.table_material')">
          <template slot-scope="{ row }">
            <div class="material-cell">
              <span class="material-name">{{ row.material ? row.material.name : '-' }}</span>
              <span v-if="row.material && row.material.material_code" class="material-code">{{ row.material.material_code }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="260" :label="$t('materialProcessingProfile.table_machine_module_profile')">
          <template slot-scope="{ row }">
            <div class="profile-cell">
              <span class="profile-title">{{ formatProfileTitle(row.machine_module_profile) }}</span>
              <div v-if="row.machine_module_profile" class="profile-meta">
                <span v-if="row.machine_module_profile.process_type">{{ row.machine_module_profile.process_type }}</span>
                <span v-if="row.machine_module_profile.machine_module && row.machine_module_profile.machine_module.machine">
                  {{ row.machine_module_profile.machine_module.machine.name }}
                </span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('materialProcessingProfile.table_process_type')">
          <template slot-scope="{ row }">
            <span>{{ row.machine_module_profile && row.machine_module_profile.process_type ? row.machine_module_profile.process_type : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="110" align="center" :label="$t('materialProcessingProfile.table_power_percent')">
          <template slot-scope="{ row }">
            <span>{{ row.power_percent != null ? row.power_percent : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('materialProcessingProfile.table_speed')">
          <template slot-scope="{ row }">
            <span>{{ row.speed_mm_per_sec != null ? row.speed_mm_per_sec : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="100" align="center" :label="$t('materialProcessingProfile.table_passes')">
          <template slot-scope="{ row }">
            <span>{{ row.passes != null ? row.passes : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="150" align="center" :label="$t('materialProcessingProfile.table_focus_offset')">
          <template slot-scope="{ row }">
            <span>{{ row.focus_offset_mm != null ? row.focus_offset_mm : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="100" align="center" :label="$t('materialProcessingProfile.table_air_assist')">
          <template slot-scope="{ row }">
            <span v-if="row.air_assist === true" class="tag tag-success">{{ $t('materialProcessingProfile.option_true') }}</span>
            <span v-else-if="row.air_assist === false" class="tag tag-info">{{ $t('materialProcessingProfile.option_false') }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('materialProcessingProfile.table_fill_distance')">
          <template slot-scope="{ row }">
            <span>{{ row.fill_distance_mm != null ? row.fill_distance_mm : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('materialProcessingProfile.table_frequency')">
          <template slot-scope="{ row }">
            <span>{{ row.frequency_khz != null ? row.frequency_khz : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('materialProcessingProfile.table_pulse_width')">
          <template slot-scope="{ row }">
            <span>{{ row.pulse_width_us != null ? row.pulse_width_us : '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('materialProcessingProfile.table_is_active')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? $t('materialProcessingProfile.option_enabled') : $t('materialProcessingProfile.option_disabled') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="110" align="center" :label="$t('materialProcessingProfile.table_sort_order')">
          <template slot-scope="{ row }">
            <span>{{ row.sort_order }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="$t('materialProcessingProfile.table_notes')">
          <template slot-scope="{ row }">
            <span class="notes-cell">{{ row.notes || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('materialProcessingProfile.table_updated')">
          <template slot-scope="{ row }">
            <span>{{ row.updated_at }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="200" align="center" :label="$t('materialProcessingProfile.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-edit"
              :disabled="!checkPermission(['app-admin.material-processing-profiles.update'])"
              @click="openEdit(row)"
            >
              {{ $t('materialProcessingProfile.action_edit') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :loading="loading.delete === row.id"
              :disabled="!checkPermission(['app-admin.material-processing-profiles.destroy'])"
              @click="handleDelete(row)"
            >
              {{ $t('materialProcessingProfile.action_delete') }}
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

    <profile-dialog ref="profileDialog" @saved="handleDialogSaved" />
    <input
      ref="importInput"
      type="file"
      class="hidden-file-input"
      accept=".csv,.xlsx,.xls"
      @change="handleImportChange"
    >
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import {
  getMaterialProcessingProfiles,
  downloadMaterialProcessingProfileTemplate,
  deleteMaterialProcessingProfile,
  importMaterialLibrary
} from '@/api/materialProcessingProfiles'
import { getMaterials } from '@/api/materials'
import { getMachines } from '@/api/machines'
import { getMachineModules } from '@/api/machineModules'
import { getMachineModuleProfiles } from '@/api/machineModuleProfiles'
import ProfileDialog from './components/ProfileDialog'
import {
  formatMaterialLabel,
  formatMachineLabel,
  formatModuleLabel,
  formatProfileTitle
} from './utils'
import './index.scss'

// 构造默认的查询参数集合
const createDefaultQuery = () => ({
  keyword: '',
  material_id: '',
  machine_id: '',
  machine_module_id: '',
  machine_module_profile_id: '',
  process_type: '',
  is_active: '',
  order: 'created_at__DESC',
  limit: 20,
  page: 1
})

export default {
  name: 'MaterialProcessingProfiles',
  components: { Pagination, ProfileDialog },
  directives: { waves },
  data() {
    // 初始化页面所需的响应式状态
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: createDefaultQuery(),
      orderOptions: [],
      materialOptions: [],
      materialLoading: false,
      machineOptions: [],
      machineLoading: false,
      moduleOptions: [],
      moduleLoading: false,
      profileOptions: [],
      profileLoading: false,
      templateLoading: false,
      importing: false,
      loading: {
        delete: ''
      }
    }
  },
  created() {
    // 初始化排序选项并加载列表
    this.orderOptions = [
      { key: 'created_at__DESC', label: this.$t('materialProcessingProfile.order_created_desc') },
      { key: 'created_at__ASC', label: this.$t('materialProcessingProfile.order_created_asc') },
      { key: 'id__DESC', label: this.$t('materialProcessingProfile.order_id_desc') },
      { key: 'id__ASC', label: this.$t('materialProcessingProfile.order_id_asc') },
      { key: 'sort_order__DESC', label: this.$t('materialProcessingProfile.order_sort_desc') },
      { key: 'sort_order__ASC', label: this.$t('materialProcessingProfile.order_sort_asc') },
      { key: 'power_percent__DESC', label: this.$t('materialProcessingProfile.order_power_desc') },
      { key: 'power_percent__ASC', label: this.$t('materialProcessingProfile.order_power_asc') }
    ]
    this.getList()
  },
  methods: {
    // 权限校验函数
    checkPermission,
    // 组合加工方案标题
    formatProfileTitle,
    // 组合材料下拉标签
    formatMaterialLabel,
    // 组合机器下拉标签
    formatMachineLabel,
    // 组合模块下拉标签
    formatModuleLabel,
    // 打开新增弹窗
    openCreate() {
      if (this.$refs.profileDialog) {
        this.$refs.profileDialog.openCreate()
      }
    },
    // 打开编辑弹窗
    openEdit(row) {
      if (this.$refs.profileDialog) {
        this.$refs.profileDialog.openEdit(row)
      }
    },
    // 处理子弹窗保存事件
    handleDialogSaved() {
      this.getList()
    },
    // 拉取加工配置列表数据
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
      if (this.listQuery.material_id) {
        params.material_id = Number(this.listQuery.material_id)
      }
      if (this.listQuery.machine_id) {
        params.machine_id = Number(this.listQuery.machine_id)
      }
      if (this.listQuery.machine_module_id) {
        params.machine_module_id = Number(this.listQuery.machine_module_id)
      }
      if (this.listQuery.machine_module_profile_id) {
        params.machine_module_profile_id = Number(this.listQuery.machine_module_profile_id)
      }
      if (this.listQuery.process_type) {
        params.process_type = this.listQuery.process_type
      }
      if (this.listQuery.is_active !== '' && this.listQuery.is_active !== null) {
        params.is_active = this.listQuery.is_active === 'true'
      }
      getMaterialProcessingProfiles(params)
        .then(res => {
          const payload = res.data || {}
          this.list = payload.list || []
          this.total = payload.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 搜索条件变更时重置页码并查询
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 恢复筛选条件默认值
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        ...createDefaultQuery(),
        limit
      }
      this.getList()
    },
    // 远程搜索材料
    handleMaterialRemote(query) {
      this.fetchMaterialOptions(query)
    },
    // 下拉展开时加载材料选项
    handleMaterialVisible(visible) {
      if (visible && !this.materialOptions.length) {
        this.fetchMaterialOptions()
      }
    },
    // 远程搜索机器
    handleMachineRemote(query) {
      this.fetchMachineOptions(query)
    },
    // 下拉展开时加载机器选项
    handleMachineVisible(visible) {
      if (visible && !this.machineOptions.length) {
        this.fetchMachineOptions()
      }
    },
    // 远程搜索模块
    handleModuleRemote(query) {
      if (!this.listQuery.machine_id) {
        this.moduleOptions = []
        return
      }
      this.fetchModuleOptions(query, { machineId: this.listQuery.machine_id })
    },
    // 下拉展开时加载模块选项
    handleModuleVisible(visible) {
      if (visible && this.listQuery.machine_id) {
        this.fetchModuleOptions('', { machineId: this.listQuery.machine_id })
      }
    },
    // 远程搜索加工方案
    handleProfileRemote(query) {
      if (!this.listQuery.machine_module_id) {
        this.profileOptions = []
        return
      }
      this.fetchProfileOptions(query, {
        machineId: this.listQuery.machine_id,
        machineModuleId: this.listQuery.machine_module_id
      })
    },
    // 下拉展开时加载加工方案选项
    handleProfileVisible(visible) {
      if (visible && this.listQuery.machine_module_id) {
        this.fetchProfileOptions('', {
          machineId: this.listQuery.machine_id,
          machineModuleId: this.listQuery.machine_module_id
        })
      }
    },
    // 机器筛选变化时清理级联并刷新
    handleMachineFilterChange(value) {
      this.listQuery.machine_id = value || ''
      this.listQuery.machine_module_id = ''
      this.listQuery.machine_module_profile_id = ''
      if (value) {
        this.fetchModuleOptions('', { machineId: value })
      } else {
        this.moduleOptions = []
        this.profileOptions = []
      }
      this.handleFilter()
    },
    // 模块筛选变化时联动加工方案
    handleModuleFilterChange(value) {
      this.listQuery.machine_module_id = value || ''
      this.listQuery.machine_module_profile_id = ''
      if (value) {
        this.fetchProfileOptions('', {
          machineId: this.listQuery.machine_id,
          machineModuleId: value
        })
      } else {
        this.profileOptions = []
      }
      this.handleFilter()
    },
    // 加工方案筛选变更后刷新
    handleProfileFilterChange(value) {
      this.listQuery.machine_module_profile_id = value || ''
      this.handleFilter()
    },
    // 触发导入文件选择
    handleImportClick() {
      if (this.importing) {
        return
      }
      if (this.$refs.importInput) {
        this.$refs.importInput.value = ''
        this.$refs.importInput.click()
      }
    },
    // 处理导入文件上传
    handleImportChange(event) {
      const file = event && event.target && event.target.files ? event.target.files[0] : null
      if (!file) {
        return
      }
      const formData = new FormData()
      formData.append('file', file)
      this.importing = true
      importMaterialLibrary(formData)
        .then(res => {
          const successMessage = res && res.message ? res.message : this.$t('materialProcessingProfile.message_import_success')
          const errors = Array.isArray(res && res.data && res.data.errors) ? res.data.errors.filter(Boolean) : []
          const errorCount = errors.length
          if (errorCount > 0) {
            const warningMessage = this.$t('materialProcessingProfile.message_import_partial', { count: errorCount })
            this.$message.warning(warningMessage)
            const errorHtml = this.buildImportErrorHtml(errors)
            this.$alert(errorHtml, this.$t('materialProcessingProfile.title_import_errors', { count: errorCount }), {
              type: 'warning',
              dangerouslyUseHTMLString: true
            })
          } else {
            this.$message.success(successMessage)
          }
          this.getList()
        })
        .catch(err => {
          const message = err && err.message ? err.message : this.$t('materialProcessingProfile.message_import_error')
          this.$message.error(message)
        })
        .finally(() => {
          this.importing = false
          if (this.$refs.importInput) {
            this.$refs.importInput.value = ''
          }
        })
    },
    // 构造导入错误弹窗内容
    buildImportErrorHtml(errors) {
      return errors
        .map((item, index) => {
          const safeText = String(item || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
          return `${index + 1}. ${safeText}`
        })
        .join('<br>')
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
          const preservedValues = new Set([this.listQuery.material_id].filter(Boolean))
          const preserved = this.materialOptions.filter(item => preservedValues.has(item.value))
          this.materialOptions = list.map(item => ({
            value: String(item.id),
            label: this.formatMaterialLabel(item)
          }))
          preserved.forEach(option => {
            if (!this.materialOptions.find(item => item.value === option.value)) {
              this.materialOptions.push(option)
            }
          })
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
          const preservedValues = new Set([this.listQuery.machine_id].filter(Boolean))
          const preserved = this.machineOptions.filter(item => preservedValues.has(item.value))
          this.machineOptions = list.map(item => ({
            value: String(item.id),
            label: this.formatMachineLabel(item)
          }))
          preserved.forEach(option => {
            if (!this.machineOptions.find(item => item.value === option.value)) {
              this.machineOptions.push(option)
            }
          })
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
          const preservedValues = new Set([this.listQuery.machine_module_id].filter(Boolean))
          const preserved = this.moduleOptions.filter(item => preservedValues.has(item.value))
          this.moduleOptions = list.map(item => ({
            value: String(item.id),
            label: this.formatModuleLabel(item)
          }))
          preserved.forEach(option => {
            if (!this.moduleOptions.find(item => item.value === option.value)) {
              this.moduleOptions.push(option)
            }
          })
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
          const preservedValues = new Set([this.listQuery.machine_module_profile_id].filter(Boolean))
          const preserved = this.profileOptions.filter(item => preservedValues.has(item.value))
          this.profileOptions = list.map(item => ({
            value: String(item.id),
            label: this.formatProfileTitle(item)
          }))
          preserved.forEach(option => {
            if (!this.profileOptions.find(item => item.value === option.value)) {
              this.profileOptions.push(option)
            }
          })
        })
        .finally(() => {
          this.profileLoading = false
        })
    },
    // 下载模板文件
    downloadTemplate() {
      if (this.templateLoading) {
        return
      }
      this.templateLoading = true
      downloadMaterialProcessingProfileTemplate()
        .then(response => {
          this.downloadBlob(response, 'material_processing_profiles_template.csv')
          this.$message.success(this.$t('materialProcessingProfile.message_template_success'))
        })
        .catch(error => {
          if (error instanceof Blob) {
            this.downloadBlob(error, 'material_processing_profiles_template.csv')
            this.$message.success(this.$t('materialProcessingProfile.message_template_success'))
          } else if (error && error.message) {
            this.$message.error(error.message)
          } else {
            this.$message.error(this.$t('materialProcessingProfile.message_template_error'))
          }
        })
        .finally(() => {
          this.templateLoading = false
        })
    },
    // 删除单条加工配置
    handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('materialProcessingProfile.confirm_delete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.delete = row.id
        deleteMaterialProcessingProfile(row.id)
          .then(() => {
            this.$message.success(this.$t('materialProcessingProfile.message_delete_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.delete = ''
          })
      }).catch(() => {})
    },
    // 将 Blob 响应转换为下载
    downloadBlob(response, fallbackName) {
      if (!response) {
        return
      }
      const blob = response.data instanceof Blob ? response.data : response
      const disposition = response.headers ? response.headers['content-disposition'] : ''
      let fileName = fallbackName || 'download.csv'
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
    }
  }
}
</script>
