<template>
  <div class="app-container template-library-page">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <span>{{ $t('templateLibrary.page_title') }}</span>
        <el-button
          v-waves
          type="text"
          icon="el-icon-refresh"
          :loading="listLoading"
          @click="refreshList"
        >
          {{ $t('templateLibrary.action_refresh') }}
        </el-button>
      </div>

      <filter-panel
        :filters="filters"
        :order-options="orderOptions"
        @search="handleSearch"
        @reset="handleReset"
      />

      <template-table
        :list="list"
        :loading="listLoading"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        :total="pagination.total"
        :can-view="checkPermission(['app-admin.project-templates.show'])"
        :can-view-comments="checkPermission(['app-admin.project-template-comments.index'])"
        :can-edit="checkPermission(['app-admin.project-templates.update'])"
        :can-update-status="checkPermission(['app-admin.project-templates.status'])"
        :can-feature="checkPermission(['app-admin.project-templates.feature'])"
        :can-duplicate="checkPermission(['app-admin.project-templates.duplicate'])"
        :can-delete="checkPermission(['app-admin.project-templates.destroy'])"
        @pagination="handlePagination"
        @view="handleView"
        @manage-comments="handleManageComments"
        @edit="handleEdit"
        @change-status="handleChangeStatus"
        @feature="handleFeature"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
      />
    </el-card>

    <template-detail-drawer
      :visible.sync="detail.visible"
      :loading="detail.loading"
      :data="detail.data"
      :can-view-comments="checkPermission(['app-admin.project-template-comments.index'])"
      @open-comments="handleManageCommentsById"
    />

    <template-edit-dialog
      :visible.sync="edit.visible"
      :loading="edit.loading"
      :submitting="edit.submitting"
      :form-data="edit.form"
      :options="edit.options"
      :can-upload="checkPermission(['app-admin.project-templates.upload-signature'])"
      @submit="submitEdit"
      @closed="handleEditClosed"
    />

    <template-duplicate-dialog
      :visible.sync="duplicate.visible"
      :submitting="duplicate.submitting"
      :form-data="duplicate.form"
      @submit="submitDuplicate"
      @closed="handleDuplicateClosed"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import FilterPanel from './components/FilterPanel'
import TemplateTable from './components/TemplateTable'
import TemplateDetailDrawer from './components/TemplateDetailDrawer'
import {
  getProjectTemplates,
  getProjectTemplateDetail,
  updateProjectTemplateStatus,
  featureProjectTemplate,
  duplicateProjectTemplate,
  deleteProjectTemplate,
  updateProjectTemplate,
  getProjectTemplateOptions
} from '@/api/projectTemplate'
import checkPermission from '@/utils/permission'
import TemplateEditDialog from './components/TemplateEditDialog'
import TemplateDuplicateDialog from './components/TemplateDuplicateDialog'

// 模板库主界面，负责整合筛选、表格与详情逻辑
export default {
  name: 'TemplateLibraryIndex',
  components: {
    FilterPanel,
    TemplateTable,
    TemplateDetailDrawer,
    TemplateEditDialog,
    TemplateDuplicateDialog
  },
  directives: { waves },
  data() {
    return {
      listLoading: false,
      list: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      filters: this.getDefaultFilters(),
      orderOptions: [],
      detail: {
        visible: false,
        loading: false,
        data: null
      },
      edit: {
        visible: false,
        loading: false,
        submitting: false,
        currentId: null,
        form: {},
        options: {
          machines: [],
          materials: [],
          scenarios: []
        },
        optionsLoaded: false
      },
      duplicate: {
        visible: false,
        submitting: false,
        currentId: null,
        form: {}
      }
    }
  },
  watch: {
    // 监听语言切换以重算下拉文案
    '$i18n.locale'() {
      this.buildOrderOptions()
    }
  },
  created() {
    this.buildOrderOptions()
    this.fetchList()
  },
  methods: {
    // 对外暴露权限判断工具，便于模板内直接调用
    checkPermission,
    // 构造默认筛选项，便于重置时复用
    getDefaultFilters() {
      return {
        keyword: '',
        status: '',
        is_featured: '',
        published_range: [],
        created_range: [],
        order: ''
      }
    },
    // 根据当前语言重新生成排序下拉选项
    buildOrderOptions() {
      this.orderOptions = [
        { value: '', label: this.$t('templateLibrary.order_default') },
        { value: 'published_at_desc', label: this.$t('templateLibrary.order_published_desc') },
        { value: 'published_at_asc', label: this.$t('templateLibrary.order_published_asc') },
        { value: 'updated_at_desc', label: this.$t('templateLibrary.order_updated_desc') },
        { value: 'updated_at_asc', label: this.$t('templateLibrary.order_updated_asc') },
        { value: 'downloads_desc', label: this.$t('templateLibrary.order_downloads_desc') }
      ]
    },
    // 手动刷新列表，沿用当前条件
    refreshList() {
      this.fetchList()
    },
    // 翻页或修改分页大小时触发数据刷新
    handlePagination({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },
    // 直达评论管理页面，带上模板ID作为过滤条件
    handleManageComments(row) {
      this.$router.push({
        path: '/template-library/comments',
        query: { project_id: row.id }
      })
    },
    // 从详情面板跳转评论管理
    handleManageCommentsById(templateId) {
      this.$router.push({
        path: '/template-library/comments',
        query: { project_id: templateId }
      })
    },
    // 接收筛选面板回传的查询条件并刷新
    handleSearch(payload) {
      this.filters = { ...payload }
      this.pagination.page = 1
      this.fetchList()
    },
    // 重置筛选条件并重新加载第一页
    handleReset() {
      this.filters = this.getDefaultFilters()
      this.pagination.page = 1
      this.fetchList()
    },
    // 拉取模板列表数据并填充表格
    async fetchList() {
      this.listLoading = true
      try {
        const params = this.buildQueryParams()
        const { data } = await getProjectTemplates(params)
        this.list = (data && data.list) || []
        this.pagination.total = (data && data.total) || 0
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_fetch_failed'))
      } finally {
        this.listLoading = false
      }
    },
    // 将筛选条件转换为接口需要的查询参数
    buildQueryParams() {
      const params = {
        page: this.pagination.page,
        limit: this.pagination.limit
      }
      if (this.filters.keyword) {
        params.keyword = this.filters.keyword
      }
      if (this.filters.status) {
        params.status = this.filters.status
      }
      if (this.filters.is_featured !== '') {
        params.is_featured = this.filters.is_featured === 'true'
      }
      if (this.filters.order) {
        params.order = this.filters.order
      }
      if (this.filters.published_range && this.filters.published_range.length === 2) {
        params.published_start = this.filters.published_range[0]
        params.published_end = this.filters.published_range[1]
      }
      if (this.filters.created_range && this.filters.created_range.length === 2) {
        params.created_start = this.filters.created_range[0]
        params.created_end = this.filters.created_range[1]
      }
      return params
    },
    // 查看详情时拉取单条模板的完整信息
    async handleView(row) {
      this.detail.visible = true
      this.detail.loading = true
      this.detail.data = null
      try {
        const { data } = await getProjectTemplateDetail(row.id)
        this.detail.data = data || null
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_detail_failed'))
      } finally {
        this.detail.loading = false
      }
    },
    // 切换模板上下架状态，完成后刷新列表
    async handleChangeStatus(row) {
      const nextStatus = row.status === 'published' ? 'draft' : 'published'
      try {
        await this.$confirm(
          this.$t('templateLibrary.confirm_change_status', { status: this.$t(nextStatus === 'published' ? 'templateLibrary.status_published' : 'templateLibrary.status_draft') }),
          this.$t('common.tips'),
          {
            type: 'warning'
          }
        )
      } catch (error) {
        return
      }

      try {
        this.listLoading = true
        await updateProjectTemplateStatus(row.id, { status: nextStatus })
        this.$message.success(this.$t('templateLibrary.toast_status_success'))
        this.fetchList()
      } catch (error) {
        this.listLoading = false
        this.$message.error(this.$t('templateLibrary.toast_status_failed'))
      }
    },
    // 设置或取消推荐状态，必要时获取权重
    async handleFeature(row) {
      const toggledOn = !row.is_featured
      let featuredWeight = row.featured_weight || 0

      if (toggledOn) {
        try {
          const { value } = await this.$prompt(
            this.$t('templateLibrary.prompt_featured_weight'),
            this.$t('templateLibrary.action_feature'),
            {
              inputValue: featuredWeight || 10,
              inputPattern: /^\d+$/,
              inputErrorMessage: this.$t('templateLibrary.prompt_featured_invalid')
            }
          )
          featuredWeight = Number(value)
        } catch (error) {
          return
        }
      } else {
        try {
          await this.$confirm(
            this.$t('templateLibrary.confirm_cancel_featured'),
            this.$t('common.tips'),
            {
              type: 'warning'
            }
          )
        } catch (error) {
          return
        }
      }

      try {
        this.listLoading = true
        await featureProjectTemplate(row.id, {
          is_featured: toggledOn,
          featured_weight: toggledOn ? featuredWeight : 0
        })
        this.$message.success(this.$t('templateLibrary.toast_feature_success'))
        this.fetchList()
      } catch (error) {
        this.listLoading = false
        this.$message.error(this.$t('templateLibrary.toast_feature_failed'))
      }
    },
    // 复制模板生成新条目，完成后刷新
    handleDuplicate(row) {
      this.duplicate.visible = true
      this.duplicate.submitting = false
      this.duplicate.currentId = row.id
      this.duplicate.form = {
        title: row.title || '',
        status: 'draft',
        target_user_id: row.user && row.user.id ? row.user.id : '',
        copy_media: true,
        file_ids: []
      }
    },
    // 打开编辑弹窗并加载所需数据
    async handleEdit(row) {
      this.edit.visible = true
      this.edit.loading = true
      this.edit.submitting = false
      this.edit.currentId = row.id

      try {
        await this.ensureEditOptions()
      } catch (error) {
        this.edit.loading = false
        this.edit.visible = false
        return
      }

      try {
        const { data } = await getProjectTemplateDetail(row.id)
        this.edit.form = data || {}
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_detail_failed'))
        this.edit.visible = false
      } finally {
        this.edit.loading = false
      }
    },
    // 缓存编辑下拉选项，避免重复请求
    async ensureEditOptions(force = false) {
      if (!force && this.edit.optionsLoaded) {
        return
      }
      try {
        const { data } = await getProjectTemplateOptions()
        this.edit.options = {
          machines: (data && data.machines) || [],
          materials: (data && data.materials) || [],
          scenarios: (data && data.scenarios) || []
        }
        this.edit.optionsLoaded = true
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_options_failed'))
        throw error
      }
    },
    // 处理编辑保存请求
    async submitEdit(payload) {
      if (!this.edit.currentId) {
        return
      }
      this.edit.submitting = true
      try {
        await updateProjectTemplate(this.edit.currentId, payload)
        this.$message.success(this.$t('templateLibrary.toast_update_success'))
        this.edit.visible = false
        this.fetchList()
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_update_failed'))
      } finally {
        this.edit.submitting = false
      }
    },
    // 弹窗关闭后清理状态
    handleEditClosed() {
      this.edit.currentId = null
      this.edit.form = {}
    },
    // 处理复制提交
    async submitDuplicate(payload) {
      if (!this.duplicate.currentId) {
        return
      }
      this.duplicate.submitting = true
      try {
        await duplicateProjectTemplate(this.duplicate.currentId, payload)
        this.$message.success(this.$t('templateLibrary.toast_duplicate_success'))
        this.duplicate.visible = false
        this.fetchList()
      } catch (error) {
        this.$message.error(this.$t('templateLibrary.toast_duplicate_failed'))
      } finally {
        this.duplicate.submitting = false
      }
    },
    // 关闭复制弹窗后重置状态
    handleDuplicateClosed() {
      this.duplicate.currentId = null
      this.duplicate.form = {}
    },
    // 删除模板后刷新列表
    async handleDelete(row) {
      try {
        await this.$confirm(
          this.$t('templateLibrary.confirm_delete', { title: row.title }),
          this.$t('common.tips'),
          {
            type: 'warning'
          }
        )
      } catch (error) {
        return
      }

      try {
        this.listLoading = true
        await deleteProjectTemplate(row.id)
        this.$message.success(this.$t('templateLibrary.toast_delete_success'))
        this.fetchList()
      } catch (error) {
        this.listLoading = false
        this.$message.error(this.$t('templateLibrary.toast_delete_failed'))
      }
    }
  }
}
</script>

<style scoped>
.template-library-page .card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
