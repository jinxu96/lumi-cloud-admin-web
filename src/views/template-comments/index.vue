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
      :reply-handler="handleQuickReply"
      @action="handleDetailAction"
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

/**
 * 构造默认筛选条件对象
 * @returns {Object} 包含所有筛选字段的默认值
 */
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

/**
 * 模板评论列表页面组件
 * 用于管理项目模板的评论，支持查看、创建、删除、恢复、置顶等操作
 * 可通过路由参数 project_id 进行筛选
 */
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
      // 评论列表数据
      list: [],
      // 列表加载状态
      listLoading: false,
      // 筛选条件
      filters: createDefaultFilters(),
      // 排序选项列表
      orderOptions: [],
      // 分页配置
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      // 记录最近一次从路由初始化得到的 project_id，用于激活时判断是否需要刷新
      lastRouteProjectId: undefined,
      // 详情抽屉状态
      detail: {
        visible: false, // 抽屉是否可见
        loading: false, // 详情加载状态
        record: null // 详情数据
      },
      // 创建评论对话框状态
      createDialog: {
        visible: false, // 对话框是否可见
        loading: false, // 提交加载状态
        projectId: '' // 预设的项目ID
      }
    }
  },
  computed: {
    // 是否有查看评论详情的权限
    canView() {
      return this.checkPermission(['app-admin.project-template-comments.show'])
    },
    // 是否有删除评论的权限
    canDelete() {
      return this.checkPermission(['app-admin.project-template-comments.destroy'])
    },
    // 是否有恢复评论的权限
    canRestore() {
      return this.checkPermission(['app-admin.project-template-comments.restore'])
    },
    // 是否有置顶/取消置顶评论的权限
    canPin() {
      return this.checkPermission(['app-admin.project-template-comments.pin'])
    },
    // 是否有创建评论的权限
    canCreate() {
      return this.checkPermission(['app-admin.project-template-comments.store'])
    }
  },
  watch: {
    // 监听语言切换，重新构建排序选项
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
  /**
   * 组件创建时初始化
   * 构建排序选项、从路由读取参数、加载列表数据
   */
  created() {
    this.buildOrderOptions()
    this.initFromRoute()
    this.fetchList()
  },
  /**
   * keep-alive组件激活时的钩子
   * 重新激活时，根据当前路由参数决定是否刷新列表
   */
  activated() {
    const changed = this.initFromRoute()
    if (changed) {
      this.pagination.page = 1
      this.fetchList()
    }
  },
  /**
   * 路由更新前的守卫
   * 在当前路由改变但组件被复用时调用
   */
  beforeRouteUpdate(to, from, next) {
    const changed = this.initFromRoute(to)
    if (changed) {
      this.pagination.page = 1
      this.fetchList()
    }
    next()
  },
  methods: {
    /**
     * 权限判断工具方法
     * 从utils中导入，用于检查当前用户是否拥有指定权限
     */
    checkPermission,
    /**
     * 构建排序选项列表
     * 根据当前语言生成国际化的排序选项
     */
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
    /**
     * 从路由参数中初始化筛选条件
     * 读取路由 query 中的 project_id 并更新到筛选条件中
     * @param {Object} route - Vue Router路由对象，默认使用当前路由
     * @returns {boolean} 返回筛选条件是否发生变化
     */
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
    /**
     * 构建API查询参数
     * 将筛选条件和分页信息转换为API所需的参数格式
     * @returns {Object} API查询参数对象
     */
    buildQueryParams() {
      const params = {
        start: (this.pagination.page - 1) * this.pagination.limit, // 分页起始位置
        limit: this.pagination.limit, // 每页数量
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
    /**
     * 获取评论列表数据
     * 根据当前筛选条件和分页信息从API获取评论列表
     */
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
    /**
     * 处理搜索操作
     * @param {Object} payload - 新的筛选条件
     */
    handleSearch(payload) {
      this.filters = { ...payload }
      this.pagination.page = 1
      this.fetchList()
    },
    /**
     * 重置筛选条件
     * 将所有筛选条件恢复为默认值并重新加载列表
     */
    handleReset() {
      this.filters = createDefaultFilters()
      this.pagination.page = 1
      this.fetchList()
    },
    /**
     * 处理分页变化
     * @param {Object} params - 分页参数 {page, limit}
     */
    handlePagination({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },
    /**
     * 查看评论详情
     * @param {Object} row - 评论行数据
     */
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
    /**
     * 删除评论
     * @param {Object} row - 评论行数据
     */
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
    /**
     * 恢复已删除的评论
     * @param {Object} row - 评论行数据
     */
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
    /**
     * 切换评论置顶状态
     * @param {Object} row - 评论行数据
     */
    async handlePin(row) {
      const targetStatus = !row.is_pinned // 目标置顶状态
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
    /**
     * 打开创建评论对话框
     * @param {string|number} projectId - 预设的项目ID
     */
    openCreateDialog(projectId = '') {
      this.createDialog.projectId = projectId
      this.createDialog.visible = true
    },
    /**
     * 提交创建评论
     * @param {Object} payload - 评论数据
     */
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
    /**
     * 处理详情抽屉中的操作菜单
     * @param {Object} params - 操作参数
     * @param {string} params.command - 操作命令（delete/restore/pin/unpin）
     * @param {Object} params.record - 评论记录数据
     */
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
    /**
     * 处理快速回复操作
     * 在详情抽屉中直接回复评论，回复后刷新详情以显示新回复
     * @param {Object} payload - 回复数据
     */
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
