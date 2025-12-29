<template>
  <div class="app-container application-scenario-page">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('applicationScenario.search_title') }}</span>
      </div>

      <scenario-filter
        :query="listQuery"
        :order-options="orderOptions"
        :loading="listLoading"
        :can-create="canCreate"
        @search="handleFilter"
        @reset="resetFilter"
        @create="openCreate"
      />

      <scenario-table
        :list="list"
        :loading="listLoading"
        :can-edit="canEdit"
        :can-delete="canDelete"
        :can-toggle="canToggleStatus"
        :status-loading="loading.status"
        :delete-loading="loading.delete"
        @edit="openEdit"
        @delete="handleDelete"
        @toggle-status="handleToggleStatus"
      />

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <scenario-dialog
      :visible.sync="dialog.visible"
      :scenario="dialog.form"
      :loading="dialog.loading"
      :is-edit="dialog.isEdit"
      @submit="handleDialogSubmit"
      @closed="handleDialogClosed"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import checkPermission from '@/utils/permission'
import {
  getApplicationScenarios,
  createApplicationScenario,
  updateApplicationScenario,
  deleteApplicationScenario,
  updateApplicationScenarioStatus
} from '@/api/applicationScenarios'
import ScenarioFilter from './components/ScenarioFilter.vue'
import ScenarioTable from './components/ScenarioTable.vue'
import ScenarioDialog from './components/ScenarioDialog.vue'

// 生成默认的筛选参数，便于重置
const createDefaultQuery = () => ({
  keyword: '',
  is_active: '',
  order: 'sort_order__ASC',
  limit: 20,
  page: 1
})

// 生成空白的表单数据，新增和重置时复用
const createDefaultForm = () => ({
  id: '',
  name: '',
  code: '',
  icon_url: '',
  description: '',
  is_active: true,
  sort_order: 0
})

export default {
  name: 'ApplicationScenarioList',
  components: {
    Pagination,
    ScenarioFilter,
    ScenarioTable,
    ScenarioDialog
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: createDefaultQuery(),
      orderOptions: [],
      loading: {
        delete: '',
        status: ''
      },
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        form: createDefaultForm()
      }
    }
  },
  computed: {
    canCreate() {
      return this.checkPermission(['app-admin.application-scenarios.store'])
    },
    canEdit() {
      return this.checkPermission(['app-admin.application-scenarios.update'])
    },
    canDelete() {
      return this.checkPermission(['app-admin.application-scenarios.destroy'])
    },
    canToggleStatus() {
      return this.checkPermission(['app-admin.application-scenarios.status'])
    }
  },
  created() {
    // 初始化排序选项并拉取列表
    this.orderOptions = [
      { key: 'sort_order__ASC', label: this.$t('applicationScenario.order_sort_asc') },
      { key: 'sort_order__DESC', label: this.$t('applicationScenario.order_sort_desc') },
      { key: 'name__ASC', label: this.$t('applicationScenario.order_name_asc') },
      { key: 'name__DESC', label: this.$t('applicationScenario.order_name_desc') },
      { key: 'created_at__DESC', label: this.$t('applicationScenario.order_created_desc') },
      { key: 'created_at__ASC', label: this.$t('applicationScenario.order_created_asc') }
    ]
    this.getList()
  },
  methods: {
    checkPermission,
    // 拉取应用场景列表数据
    getList() {
      this.listLoading = true
      const params = {
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit,
        order: this.listQuery.order
      }
      if (this.listQuery.keyword) {
        params.keyword = this.listQuery.keyword
      }
      if (this.listQuery.is_active !== '' && this.listQuery.is_active !== null) {
        params.is_active = this.listQuery.is_active
      }
      getApplicationScenarios(params)
        .then(res => {
          const payload = res && res.data ? res.data : {}
          this.list = Array.isArray(payload.list) ? payload.list : []
          this.total = Number(payload.total) || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 处理筛选组件提交
    handleFilter(form) {
      this.listQuery = {
        ...this.listQuery,
        keyword: form.keyword ? form.keyword.trim() : '',
        is_active: form.is_active,
        order: form.order,
        page: 1
      }
      this.getList()
    },
    // 重置筛选条件
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        ...createDefaultQuery(),
        limit
      }
      this.getList()
    },
    // 打开新增弹窗
    openCreate() {
      this.dialog.form = createDefaultForm()
      this.dialog.isEdit = false
      this.dialog.visible = true
    },
    // 打开编辑弹窗并填充数据
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.form = {
        id: row.id,
        name: row.name || '',
        code: row.code || '',
        icon_url: row.icon_url || '',
        description: row.description || '',
        is_active: Boolean(row.is_active),
        sort_order: typeof row.sort_order === 'number' ? row.sort_order : Number(row.sort_order) || 0
      }
      this.dialog.isEdit = true
      this.dialog.visible = true
    },
    // 处理新增或编辑提交
    handleDialogSubmit(form) {
      const payload = this.buildPayload(form)
      this.dialog.loading = true
      const request = this.dialog.isEdit
        ? updateApplicationScenario(this.dialog.form.id, payload)
        : createApplicationScenario(payload)
      request
        .then(() => {
          const messageKey = this.dialog.isEdit
            ? 'applicationScenario.message_update_success'
            : 'applicationScenario.message_create_success'
          this.$message.success(this.$t(messageKey))
          this.dialog.visible = false
          this.getList()
        })
        .finally(() => {
          this.dialog.loading = false
        })
    },
    // 弹窗关闭后重置表单
    handleDialogClosed() {
      this.dialog.form = createDefaultForm()
      this.dialog.isEdit = false
    },
    // 删除指定场景
    handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(
        this.$t('applicationScenario.confirm_delete', { name: row.name }),
        this.$t('common.tips'),
        { type: 'warning' }
      ).then(() => {
        this.loading.delete = row.id
        deleteApplicationScenario(row.id)
          .then(() => {
            this.$message.success(this.$t('applicationScenario.message_delete_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.delete = ''
          })
      }).catch(() => {})
    },
    // 切换场景启用状态
    handleToggleStatus(row) {
      if (!row || !row.id) {
        return
      }
      const targetStatus = !row.is_active
      const confirmKey = targetStatus
        ? 'applicationScenario.confirm_enable'
        : 'applicationScenario.confirm_disable'
      this.$confirm(
        this.$t(confirmKey, { name: row.name }),
        this.$t('common.tips'),
        { type: 'warning' }
      ).then(() => {
        this.loading.status = row.id
        updateApplicationScenarioStatus(row.id, targetStatus)
          .then(() => {
            const messageKey = targetStatus
              ? 'applicationScenario.message_enable_success'
              : 'applicationScenario.message_disable_success'
            this.$message.success(this.$t(messageKey))
            this.getList()
          })
          .finally(() => {
            this.loading.status = ''
          })
      }).catch(() => {})
    },
    // 组装提交给后端的场景数据
    buildPayload(form) {
      return {
        name: form.name ? form.name.trim() : '',
        code: form.code ? form.code.trim() : '',
        icon_url: form.icon_url ? form.icon_url.trim() : '',
        description: form.description ? form.description.trim() : '',
        is_active: Boolean(form.is_active),
        sort_order: Number.isFinite(Number(form.sort_order)) ? Number(form.sort_order) : 0
      }
    }
  }
}
</script>

<style scoped>
.application-scenario-page .card-header {
  display: flex;
  align-items: center;
}

.application-scenario-page .card-title {
  font-weight: 600;
}
</style>
