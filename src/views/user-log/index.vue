<template>
  <div class="app-container user-log-page">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('userLog.page_title') }}</span>
      </div>

      <user-log-filter
        :value="filters"
        :order-options="orderOptions"
        :method-options="methodOptions"
        :loading="listLoading"
        :export-loading="exportLoading"
        :export-disabled="!canExport"
        @search="handleFilter"
        @reset="handleReset"
        @export="handleExport"
      />

      <user-log-table
        :list="list"
        :loading="listLoading"
        @view="handleViewDetail"
      />

      <pagination
        v-show="pagination.total > 0"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="handlePagination"
      />
    </el-card>

    <user-log-detail-drawer
      :visible.sync="detail.visible"
      :record="detail.record"
      :loading="detail.loading"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import checkPermission from '@/utils/permission'
import { getUserLogs, exportUserLogs } from '@/api/userLogs'
import UserLogFilter from './components/UserLogFilter.vue'
import UserLogTable from './components/UserLogTable.vue'
import UserLogDetailDrawer from './components/UserLogDetailDrawer.vue'

// 将日期对象格式化为后端识别的时间字符串
const formatDateTime = (date) => {
  const pad = (value) => String(value).padStart(2, '0')
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const day = pad(date.getDate())
  const hour = pad(date.getHours())
  const minute = pad(date.getMinutes())
  const second = pad(date.getSeconds())
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 构造默认的时间范围（最近 24 小时）
const createDefaultRange = () => {
  const end = new Date()
  const start = new Date(end.getTime() - 24 * 60 * 60 * 1000)
  return [formatDateTime(start), formatDateTime(end)]
}

// 构造筛选条件的初始值
const createDefaultFilters = () => ({
  created_range: createDefaultRange(),
  user_keyword: '',
  user_id: '',
  request_id: '',
  path: '',
  method: '',
  response_status: '',
  ip: '',
  min_duration: '',
  order: 'created_at__DESC'
})

export default {
  name: 'UserLogList',
  components: {
    Pagination,
    UserLogFilter,
    UserLogTable,
    UserLogDetailDrawer
  },
  data() {
    return {
      list: [],
      listLoading: false,
      exportLoading: false,
      filters: createDefaultFilters(),
      orderOptions: [],
      methodOptions: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      detail: {
        visible: false,
        loading: false,
        record: null
      }
    }
  },
  computed: {
    // 判断当前用户是否具备导出权限
    canExport() {
      return this.checkPermission(['app-admin.user-logs.export'])
    }
  },
  created() {
    this.initOrderOptions()
    this.fetchList()
  },
  methods: {
    // 权限校验工具函数
    checkPermission,
    // 初始化排序选项的文案
    initOrderOptions() {
      this.orderOptions = [
        { key: 'created_at__DESC', label: this.$t('userLog.order_created_desc') },
        { key: 'created_at__ASC', label: this.$t('userLog.order_created_asc') },
        { key: 'duration_ms__DESC', label: this.$t('userLog.order_duration_desc') },
        { key: 'duration_ms__ASC', label: this.$t('userLog.order_duration_asc') },
        { key: 'response_status__DESC', label: this.$t('userLog.order_status_desc') },
        { key: 'response_status__ASC', label: this.$t('userLog.order_status_asc') },
        { key: 'id__DESC', label: this.$t('userLog.order_id_desc') },
        { key: 'id__ASC', label: this.$t('userLog.order_id_asc') }
      ]
    },
    // 校验时间范围是否有效
    hasValidTimeRange(range) {
      return Array.isArray(range) && range.length === 2 && range[0] && range[1]
    },
    // 根据当前筛选条件拼装接口参数
    buildQueryParams(includePagination = true) {
      const params = {}
      if (!this.hasValidTimeRange(this.filters.created_range)) {
        throw new Error(this.$t('userLog.rules_time_range'))
      }
      params.created_start = this.filters.created_range[0]
      params.created_end = this.filters.created_range[1]
      if (includePagination) {
        params.start = (this.pagination.page - 1) * this.pagination.limit
        params.limit = this.pagination.limit
      }
      if (this.filters.order) {
        params.order = this.filters.order
      }
      if (this.filters.user_keyword) {
        params.user_keyword = this.filters.user_keyword.trim()
      }
      if (this.filters.user_id) {
        const parsedUserId = Number(this.filters.user_id)
        if (!Number.isNaN(parsedUserId)) {
          params.user_id = parsedUserId
        }
      }
      if (this.filters.request_id) {
        params.request_id = this.filters.request_id.trim()
      }
      if (this.filters.path) {
        params.path = this.filters.path.trim()
      }
      if (this.filters.method) {
        params.method = this.filters.method.trim()
      }
      if (this.filters.response_status) {
        const parsedStatus = Number(this.filters.response_status)
        if (!Number.isNaN(parsedStatus)) {
          params.response_status = parsedStatus
        }
      }
      if (this.filters.ip) {
        params.ip = this.filters.ip.trim()
      }
      if (this.filters.min_duration) {
        const parsedDuration = Number(this.filters.min_duration)
        if (!Number.isNaN(parsedDuration)) {
          params.min_duration = parsedDuration
        }
      }
      return params
    },
    // 拉取日志列表数据
    async fetchList() {
      try {
        this.listLoading = true
        const params = this.buildQueryParams(true)
        const { data } = await getUserLogs(params)
        this.list = (data && Array.isArray(data.list)) ? data.list : []
        this.pagination.total = data && data.total ? Number(data.total) : 0
      } catch (error) {
        if (error && error.message) {
          this.$message.warning(error.message)
        } else {
          this.$message.error(this.$t('userLog.toast_fetch_failed'))
        }
      } finally {
        this.listLoading = false
      }
    },
    // 处理筛选组件触发的搜索
    handleFilter(form) {
      this.filters = {
        ...this.filters,
        ...form
      }
      this.pagination.page = 1
      this.fetchList()
    },
    // 处理筛选组件的重置操作
    handleReset() {
      this.filters = createDefaultFilters()
      this.pagination.page = 1
      this.fetchList()
    },
    // 处理分页组件变更
    handlePagination({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },
    // 导出当前筛选条件的日志数据
    async handleExport(form) {
      if (!this.canExport) {
        this.$message.warning(this.$t('userLog.toast_no_export_permission'))
        return
      }
      this.filters = {
        ...this.filters,
        ...form
      }
      try {
        const params = this.buildQueryParams(false)
        this.exportLoading = true
        const response = await exportUserLogs(params)
        const saved = await this.downloadBlob(response, 'user_logs.csv')
        if (saved) {
          this.$message.success(this.$t('userLog.toast_export_success'))
        }
      } catch (error) {
        if (error && error.message) {
          this.$message.error(error.message)
        } else {
          this.$message.error(this.$t('userLog.toast_export_failed'))
        }
      } finally {
        this.exportLoading = false
      }
    },
    // 点击查看详情时展示抽屉
    handleViewDetail(row) {
      this.detail.record = row || null
      this.detail.visible = true
    },
    // 将 Blob 响应转换为文件下载
    async downloadBlob(response, fallbackName) {
      if (!response) {
        this.$message.error(this.$t('userLog.toast_export_failed'))
        return false
      }
      const blob = response.data instanceof Blob ? response.data : response
      if (!(blob instanceof Blob)) {
        this.$message.error(this.$t('userLog.toast_export_failed'))
        return false
      }
      if (blob.type && blob.type.includes('application/json')) {
        try {
          const text = await blob.text()
          const parsed = JSON.parse(text)
          const message = (parsed && (parsed.message || parsed.error)) ? (parsed.message || parsed.error) : text
          this.$message.error(message)
        } catch (error) {
          this.$message.error(this.$t('userLog.toast_export_failed'))
        }
        return false
      }
      const disposition = response.headers ? response.headers['content-disposition'] : ''
      let fileName = fallbackName || 'user_logs.csv'
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
      return true
    }
  }
}
</script>

<style scoped>
.user-log-page .card-header {
  display: flex;
  align-items: center;
}
.user-log-page .card-title {
  font-weight: 600;
}
</style>
