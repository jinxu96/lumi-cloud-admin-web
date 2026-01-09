<template>
  <div class="app-container template-comments-page">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <span>{{ $t('templateComments.page_title') }}</span>
        <div class="card-actions">
          <el-button
            v-waves
            type="primary"
            size="mini"
            icon="el-icon-edit"
            :disabled="!canCreate"
            @click="openCreateDialog()"
          >
            {{ $t('templateComments.action_create') }}
          </el-button>
          <el-button
            v-waves
            type="text"
            icon="el-icon-refresh"
            :loading="listLoading"
            @click="fetchList"
          >
            {{ $t('templateComments.action_refresh') }}
          </el-button>
        </div>
      </div>

      <comments-filter
        :value="filters"
        :order-options="orderOptions"
        :loading="listLoading"
        @search="handleSearch"
        @reset="handleReset"
      />

      <comments-table
        :list="list"
        :loading="listLoading"
        :can-view="canView"
        :can-delete="canDelete"
        :can-restore="canRestore"
        :can-pin="canPin"
        @view="handleView"
        @delete="handleDelete"
        @restore="handleRestore"
        @pin="handlePin"
      />

      <pagination
        v-show="pagination.total > 0"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="handlePagination"
      />
    </el-card>

    <comment-detail-drawer
      :visible.sync="detail.visible"
      :loading="detail.loading"
      :record="detail.record"
      @action="handleDetailAction"
      @reply="handleQuickReply"
    />
    <comment-form-dialog
      :visible.sync="createDialog.visible"
      :loading="createDialog.loading"
      :project-id="createDialog.projectId"
      @submit="submitCreateComment"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import {
  getProjectTemplateComments,
  getProjectTemplateCommentDetail,
  createProjectTemplateComment,
  deleteProjectTemplateComment,
  restoreProjectTemplateComment,
  togglePinProjectTemplateComment
} from '@/api/projectTemplateComments'
import CommentsFilter from './components/CommentsFilter.vue'
import CommentsTable from './components/CommentsTable.vue'
import CommentDetailDrawer from './components/CommentDetailDrawer.vue'
import CommentFormDialog from './components/CommentFormDialog.vue'

// 构造默认筛选条件，便于重置
const createDefaultFilters = () => ({
  project_id: '',
  user_id: '',
  keyword: '',
  status: '',
  is_pinned: '',
  has_reports: '',
  created_range: [],
  order: 'created_at__DESC'
})

export default {
  name: 'TemplateCommentsList',
  components: {
    Pagination,
    CommentsFilter,
    CommentsTable,
    CommentDetailDrawer,
    CommentFormDialog
  },
  directives: { waves },
  data() {
    return {
      list: [],
      listLoading: false,
      filters: createDefaultFilters(),
      orderOptions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      // 记录最近一次从路由初始化得到的 project_id，用于激活时判断是否需要刷新
      lastRouteProjectId: undefined,
      detail: {
        visible: false,
        loading: false,
        record: null
      },
      createDialog: {
        visible: false,
        loading: false,
        projectId: ''
      }
    }
  },
  computed: {
    canView() {
      return this.checkPermission(['app-admin.project-template-comments.show'])
    },
    canDelete() {
      return this.checkPermission(['app-admin.project-template-comments.destroy'])
    },
    canRestore() {
      return this.checkPermission(['app-admin.project-template-comments.restore'])
    },
    canPin() {
      return this.checkPermission(['app-admin.project-template-comments.pin'])
    },
    canCreate() {
      return this.checkPermission(['app-admin.project-template-comments.store'])
    }
  },
  watch: {
    '$i18n.locale'() {
      this.buildOrderOptions()
    },
    // 监听路由变化（例如从模板列表带不同的 project_id 进入）
    $route(to) {
      this.initFromRoute(to)
      this.pagination.page = 1
      this.fetchList()
    }
  },
  created() {
    this.buildOrderOptions()
    this.initFromRoute()
    this.fetchList()
  },
  activated() {
    // keep-alive 重新激活时，根据当前路由参数决定是否刷新
    const changed = this.initFromRoute()
    if (changed) {
      this.pagination.page = 1
      this.fetchList()
    }
  },
  beforeRouteUpdate(to, from, next) {
    const changed = this.initFromRoute(to)
    if (changed) {
      this.pagination.page = 1
      this.fetchList()
    }
    next()
  },
  methods: {
    // 暴露权限判断工具
    checkPermission,
    // 构建排序选项
    buildOrderOptions() {
      this.orderOptions = [
        { value: 'created_at__DESC', label: this.$t('templateComments.order_created_desc') },
        { value: 'created_at__ASC', label: this.$t('templateComments.order_created_asc') },
        { value: 'updated_at__DESC', label: this.$t('templateComments.order_updated_desc') },
        { value: 'updated_at__ASC', label: this.$t('templateComments.order_updated_asc') },
        { value: 'likes_count__DESC', label: this.$t('templateComments.order_likes_desc') },
        { value: 'replies_count__DESC', label: this.$t('templateComments.order_replies_desc') },
        { value: 'id__DESC', label: this.$t('templateComments.order_id_desc') }
      ]
    },
    // 读取路由 query 的 project_id 作为初始/变更过滤
    initFromRoute(route = this.$route) {
      const projectId = route && route.query && route.query.project_id
      let changed = false
      if (projectId !== undefined) {
        const newVal = projectId || ''
        if (newVal !== this.filters.project_id) {
          this.filters.project_id = newVal
          changed = true
        }
        this.lastRouteProjectId = newVal
      }
      return changed
    },
    // 生成查询参数
    buildQueryParams() {
      const params = {
        start: (this.pagination.page - 1) * this.pagination.limit,
        limit: this.pagination.limit,
        parent_id: 0 // 仅拉取顶级评论，后端约定 parent_id=0
      }
      if (this.filters.order) params.order = this.filters.order
      if (this.filters.project_id) {
        const projectId = Number(this.filters.project_id)
        if (!Number.isNaN(projectId)) params.project_id = projectId
      }
      if (this.filters.user_id) {
        const userId = Number(this.filters.user_id)
        if (!Number.isNaN(userId)) params.user_id = userId
      }
      if (this.filters.keyword) params.keyword = this.filters.keyword.trim()
      if (this.filters.status) params.status = this.filters.status
      if (this.filters.is_pinned !== '') params.is_pinned = this.filters.is_pinned === 'true'
      if (this.filters.has_reports !== '') params.has_reports = this.filters.has_reports === 'true'
      if (this.filters.created_range && this.filters.created_range.length === 2) {
        params.created_start = this.filters.created_range[0]
        params.created_end = this.filters.created_range[1]
      }
      return params
    },
    async fetchList() {
      this.listLoading = true
      try {
        const params = this.buildQueryParams()
        const { data } = await getProjectTemplateComments(params)
        this.list = (data && data.list) || []
        this.pagination.total = (data && data.total) || 0
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_fetch_failed'))
      } finally {
        this.listLoading = false
      }
    },
    handleSearch(payload) {
      this.filters = { ...payload }
      this.pagination.page = 1
      this.fetchList()
    },
    handleReset() {
      this.filters = createDefaultFilters()
      this.pagination.page = 1
      this.fetchList()
    },
    handlePagination({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },
    async handleView(row) {
      this.detail.visible = true
      this.detail.loading = true
      this.detail.record = null
      try {
        const { data } = await getProjectTemplateCommentDetail(row.id)
        this.detail.record = data || null
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_detail_failed'))
      } finally {
        this.detail.loading = false
      }
    },
    async handleDelete(row) {
      try {
        await this.$confirm(this.$t('templateComments.confirm_delete'), this.$t('common.tips'))
        await deleteProjectTemplateComment(row.id)
        this.$message.success(this.$t('templateComments.toast_delete_success'))
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(this.$t('templateComments.toast_delete_failed'))
        }
      }
    },
    async handleRestore(row) {
      try {
        await this.$confirm(this.$t('templateComments.confirm_restore'), this.$t('common.tips'))
        await restoreProjectTemplateComment(row.id)
        this.$message.success(this.$t('templateComments.toast_restore_success'))
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(this.$t('templateComments.toast_restore_failed'))
        }
      }
    },
    async handlePin(row) {
      const targetStatus = !row.is_pinned
      try {
        await this.$confirm(
          targetStatus ? this.$t('templateComments.confirm_pin') : this.$t('templateComments.confirm_unpin'),
          this.$t('common.tips')
        )
        await togglePinProjectTemplateComment(row.id, { is_pinned: targetStatus })
        this.$message.success(this.$t('templateComments.toast_pin_success'))
        this.fetchList()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(this.$t('templateComments.toast_pin_failed'))
        }
      }
    },
    openCreateDialog(projectId = '') {
      this.createDialog.projectId = projectId
      this.createDialog.visible = true
    },
    async submitCreateComment(payload) {
      this.createDialog.loading = true
      try {
        await createProjectTemplateComment(payload)
        this.$message.success(this.$t('templateComments.toast_create_success'))
        this.createDialog.visible = false
        this.fetchList()
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_create_failed'))
      } finally {
        this.createDialog.loading = false
      }
    },
    // 处理详情抽屉操作菜单
    handleDetailAction({ command, record }) {
      if (!record) return
      switch (command) {
        case 'delete':
          this.handleDelete(record)
          break
        case 'restore':
          this.handleRestore(record)
          break
        case 'pin':
        case 'unpin':
          this.handlePin(record)
          break
      }
    },
    // 处理快速回复
    async handleQuickReply(payload) {
      await createProjectTemplateComment(payload)
      // 刷新详情以更新回复列表
      if (this.detail.record && this.detail.record.id) {
        const { data } = await getProjectTemplateCommentDetail(this.detail.record.id)
        this.detail.record = data || null
      }
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
.card-actions {
  display: flex;
  gap: 8px;
}
</style>
