<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('操作日志') }}</span>
      </div>

      <div class="filter-container">
        <el-row :gutter="10">
          <el-col :md="6" :sm="8">
            <div>
              <el-input v-model="listQuery.searchword" :placeholder="$t('请输入关键字')" clearable class="filter-item" @keyup.enter.native="handleFilter" />
            </div>
          </el-col>
          <el-col :md="5" :sm="7">
            <div>
              <el-date-picker v-model="listQuery.start_time" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="选择开始时间" clearable style="width: 100%;" class="filter-item" />
            </div>
          </el-col>
          <el-col :md="5" :sm="7">
            <div>
              <el-date-picker v-model="listQuery.end_time" format="yyyy-MM-dd HH:mm:ss" type="datetime" placeholder="选择结束时间" clearable style="width: 100%;" class="filter-item" />
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="10">
          <el-col v-if="showDeletebtn" :md="3" :sm="3">
            <div>
              <el-button
                v-waves
                class="filter-item"
                type="danger"
                style="width:100%;"
                :disabled="!checkPermission(['larke-admin.operation-log.clear'])"
                @click="handleDeleteList"
              >
                {{ $t('删除选中') }}
              </el-button>
            </div>
          </el-col>
          <el-col :md="4" :sm="5">
            <div>
              <el-select v-model="listQuery.method" :placeholder="$t('请求方式')" clearable class="filter-item" style="width: 100%;">
                <el-option v-for="item in methodOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </div>
          </el-col>
          <el-col :md="3" :sm="3">
            <div>
              <el-select v-model="listQuery.status" :placeholder="$t('状态')" clearable class="filter-item" style="width: 100%;">
                <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key" />
              </el-select>
            </div>
          </el-col>
          <el-col :md="3" :sm="3">
            <div>
              <el-select v-model="listQuery.order" class="filter-item" style="width: 100%;" @change="handleFilter">
                <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key" />
              </el-select>
            </div>
          </el-col>
          <el-col :md="3" :sm="3">
            <div>
              <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" style="width: 100%;" @click="handleFilter">
                {{ $t('搜索') }}
              </el-button>
            </div>
          </el-col>
          <el-col :md="3" :sm="3">
            <div>
              <el-button v-waves class="filter-item" type="danger" :disabled="!checkPermission(['larke-admin.operation-log.clear'])" icon="el-icon-delete" style="width: 100%;" @click="handleClear">
                {{ $t('清空') }}
              </el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        ref="logTable"
        v-loading="listLoading"
        :header-cell-style="{background:'#eef1f6',color:'#606266'}"
        :data="list"
        class="border-gray"
        fit
        highlight-current-row
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column
          type="selection"
          width="55"
          align="center"
        />

        <el-table-column width="100px" align="left" :label="$t('请求方式')">
          <template slot-scope="{row}">
            <el-tag :type="row.method | methodFilter">
              {{ row.method }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column min-width="150px" :label="$t('请求URL')">
          <template slot-scope="{row}">
            <span>{{ row.url }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="180px" :label="$t('摘要')">
          <template slot-scope="{row}">
            <span>{{ getParsedInfo(row).summary || row.url }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="50px" :label="$t('账号名称')">
          <template slot-scope="{row}">
            <span>{{ row.admin_name }}</span>
          </template>
        </el-table-column>

        <el-table-column width="80px" :label="$t('请求IP')">
          <template slot-scope="{row}">
            <span class="text-muted">{{ row.ip }}</span>
          </template>
        </el-table-column>

        <el-table-column width="170px" align="left" :label="$t('请求时间')">
          <template slot-scope="scope">
            <span class="text-muted">
              <i class="el-icon-time" />&nbsp;
              {{ scope.row.create_time | parseTime('{y}-{m}-{d} {h}:{i}:{s}') }}
            </span>
          </template>
        </el-table-column>

        <el-table-column class-name="status-col" :label="$t('状态')" width="70">
          <template slot-scope="{row}">
            <el-tag :type="row.status | statusFilter" size="mini">
              {{ (row.status == 1) ? $t('启用') : $t('禁用') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column align="center" :label="$t('操作')" width="150">
          <template slot-scope="scope">
            <el-tooltip :content="查看完整变更" placement="top">
              <span style="display:inline-block;">
                <el-button
                  v-waves
                  :loading="scope.row.id == loading.detail"
                  :disabled="!checkPermission(['larke-admin.operation-log.detail'])"
                  type="info"
                  size="mini"
                  icon="el-icon-info"
                  @click="handleDetail(scope.$index, scope.row)"
                >
                  {{ $t('详情') }}
                </el-button>
              </span>
            </el-tooltip>

            <el-button
              v-waves
              v-permission="['larke-admin.log.delete']"
              :loading="scope.row.id == loading.delete"
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="handleDelete(scope.$index, scope.row)"
            >
              {{ $t('删除') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total>0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <el-dialog
      :title="$t('日志详情')"
      :visible.sync="detail.dialogVisible"
    >
      <detail :data="detail.data" />
    </el-dialog>

    <el-tooltip placement="top" :content="$t('回到顶部')">
      <back-to-top :custom-style="backToTopStyle" :visibility-height="300" :back-position="50" transition-name="fade" />
    </el-tooltip>
  </div>
</template>

<script>
import waves from '@/directive/waves' // waves directive
import permission from '@/directive/permission/index.js' // 权限判断指令
import checkPermission from '@/utils/permission' // 权限判断函数
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import BackToTop from '@/components/BackToTop'

import Detail from '@/components/Larke/Detail'
import {
  getList,
  getDetail,
  deleteLog,
  clearLog
} from '../api/index'

export default {
  name: 'AdminLogIndex',
  components: { BackToTop, Pagination, Detail },
  directives: { waves, permission },
  filters: {
    methodFilter(method) {
      const methodMap = {
        'GET': 'success',
        'HEAD': 'info',
        'POST': 'warning',
        'PUT': 'warning',
        'DELETE': 'danger',
        'PATCH': 'warning',
        'OPTIONS': 'info'
      }
      return methodMap[method]
    },
    statusFilter(status) {
      const statusMap = {
        1: 'success',
        0: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      backToTopStyle: {
        right: '50px',
        bottom: '50px',
        width: '40px',
        height: '40px',
        'border-radius': '4px',
        'line-height': '45px', // 请保持与高度一致以垂直居中 Please keep consistent with height to center vertically
        background: '#e7eaf1'// 按钮的背景颜色 The background color of the button
      },

      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        searchword: '',
        start_time: '',
        end_time: '',
        order: 'create_time__DESC',
        status: '',
        method: '',
        page: 1,
        limit: 20
      },
      statusOptions: [
        { key: 'open', display_name: this.$t('启用') },
        { key: 'close', display_name: this.$t('禁用') }
      ],
      methodOptions: [
        { label: 'GET', key: 'GET' },
        { label: 'HEAD', key: 'HEAD' },
        { label: 'POST', key: 'POST' },
        { label: 'PUT', key: 'PUT' },
        { label: 'DELETE', key: 'DELETE' },
        { label: 'PATCH', key: 'PATCH' },
        { label: 'OPTIONS', key: 'OPTIONS' }
      ],
      sortOptions: [
        { key: 'create_time__ASC', label: '正序' },
        { key: 'create_time__DESC', label: '倒叙' }
      ],
      detail: {
        dialogVisible: false,
        data: []
      },
      selectedData: [],
      showDeletebtn: false,
      loading: {
        detail: '',
        delete: ''
      },
      infoCache: {}
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    getList() {
      this.listLoading = true
      getList({
        searchword: this.listQuery.searchword,
        start_time: this.listQuery.start_time,
        end_time: this.listQuery.end_time,
        status: this.listQuery.status,
        method: this.listQuery.method,
        order: this.listQuery.order,
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit
      }).then(response => {
        this.resetInfoCache()
        const payload = response.data || {}
        this.list = payload.list || []
        this.total = payload.total || 0
        this.listLoading = false
      })
    },
    resetInfoCache() {
      this.infoCache = {}
    },
    getInfoCacheKey(row) {
      if (!row) {
        return ''
      }
      if (row.id !== undefined && row.id !== null) {
        return row.id
      }
      return `${row.url || ''}_${row.create_time || ''}`
    },
    getParsedInfo(row) {
      const key = this.getInfoCacheKey(row)
      if (key && this.infoCache[key]) {
        return this.infoCache[key]
      }
      const parsed = this.normalizeInfo(row ? row.info : undefined)
      if (key) {
        this.$set(this.infoCache, key, parsed)
      }
      return parsed
    },
    normalizeInfo(raw) {
      const empty = {
        raw: {},
        rawIsObject: true,
        summary: '',
        messages: [],
        changes: null,
        request: {},
        response: {},
        meta: {},
        parseError: null
      }

      if (raw === undefined || raw === null || raw === '') {
        return empty
      }

      let base = raw
      if (typeof raw === 'string') {
        try {
          base = JSON.parse(raw)
        } catch (error) {
          return {
            ...empty,
            raw: raw,
            rawIsObject: false,
            parseError: error
          }
        }
      }

      if (!base || typeof base !== 'object') {
        return {
          ...empty,
          raw: base,
          rawIsObject: false
        }
      }

      const messages = Array.isArray(base.messages) ? base.messages.slice() : []
      if (!messages.length && typeof base.message === 'string') {
        messages.push(base.message)
      }

      return {
        raw: base,
        rawIsObject: true,
        summary: typeof base.summary === 'string' ? base.summary : (typeof base.message === 'string' ? base.message : ''),
        messages,
        changes: base.changes || base.diff || null,
        request: (base.request && typeof base.request === 'object') ? base.request : {},
        response: (base.response && typeof base.response === 'object') ? base.response : {},
        meta: (base.meta && typeof base.meta === 'object') ? base.meta : {},
        parseError: null
      }
    },
    hasStructuredContent(target) {
      if (!target || typeof target !== 'object') {
        return false
      }
      if (Array.isArray(target)) {
        return target.length > 0
      }
      return Object.keys(target).length > 0
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleSelectionChange(data, key) {
      this.selectedData = []
      data.forEach(element => {
        this.selectedData.push(element.id)
      })

      if (this.selectedData.length > 0) {
        this.showDeletebtn = true
      } else {
        this.showDeletebtn = false
      }
    },
    handleDetail(index, row) {
      this.loading.detail = row.id

      getDetail(row.id).then((res) => {
        this.detail.dialogVisible = true
        const data = res.data

        this.loading.detail = ''

        const parsedInfo = this.normalizeInfo(data.info)
        if (data.id) {
          this.$set(this.infoCache, data.id, parsedInfo)
        }

        const detailRows = [
          {
            name: this.$t('ID'),
            content: data.id,
            type: 'text'
          },
          {
            name: this.$t('账号ID'),
            content: data.admin_id,
            type: 'text'
          },
          {
            name: this.$t('账号名称'),
            content: data.admin_name,
            type: 'text'
          },
          {
            name: this.$t('请求URL'),
            content: data.url,
            type: 'text'
          },
          {
            name: this.$t('请求方式'),
            content: data.method,
            type: 'text'
          }
        ]

        if (parsedInfo.summary) {
          detailRows.push({
            name: this.$t('摘要'),
            content: parsedInfo.summary,
            type: 'text'
          })
        }

        if (parsedInfo.messages && parsedInfo.messages.length) {
          detailRows.push({
            name: this.$t('消息'),
            content: parsedInfo.messages,
            type: 'json',
            depth: 6
          })
        }

        if (parsedInfo.changes !== undefined && parsedInfo.changes !== null) {
          const changeValue = parsedInfo.changes
          const changeIsStructured = this.hasStructuredContent(changeValue)
          detailRows.push({
            name: this.$t('变更详情'),
            content: changeIsStructured ? changeValue : String(changeValue),
            type: changeIsStructured ? 'json' : 'text',
            depth: changeIsStructured ? 6 : undefined
          })
        }

        const requestInfo = parsedInfo.request || {}
        if (requestInfo.query !== undefined && requestInfo.query !== null) {
          const queryValue = requestInfo.query
          const queryStructured = this.hasStructuredContent(queryValue)
          detailRows.push({
            name: this.$t('请求 Query'),
            content: queryStructured ? queryValue : String(queryValue),
            type: queryStructured ? 'json' : 'text',
            depth: queryStructured ? 5 : undefined
          })
        }
        if (requestInfo.body !== undefined && requestInfo.body !== null) {
          const bodyValue = requestInfo.body
          const bodyStructured = this.hasStructuredContent(bodyValue)
          detailRows.push({
            name: this.$t('请求 Body'),
            content: bodyStructured ? bodyValue : String(bodyValue),
            type: bodyStructured ? 'json' : 'text',
            depth: bodyStructured ? 5 : undefined
          })
        }
        if (requestInfo.headers !== undefined && requestInfo.headers !== null) {
          const headerValue = requestInfo.headers
          const headerStructured = this.hasStructuredContent(headerValue)
          detailRows.push({
            name: this.$t('请求 Header'),
            content: headerStructured ? headerValue : String(headerValue),
            type: headerStructured ? 'json' : 'text',
            depth: headerStructured ? 4 : undefined
          })
        }

        const responseInfo = parsedInfo.response || {}
        if (responseInfo.status !== undefined && responseInfo.status !== null) {
          detailRows.push({
            name: this.$t('响应状态'),
            content: String(responseInfo.status),
            type: 'text'
          })
        }
        if (responseInfo.body !== undefined && responseInfo.body !== null) {
          const bodyIsObject = typeof responseInfo.body === 'object'
          detailRows.push({
            name: this.$t('响应 Body'),
            content: bodyIsObject ? responseInfo.body : String(responseInfo.body),
            type: bodyIsObject ? 'json' : 'text',
            depth: 5
          })
        }

        if (this.hasStructuredContent(parsedInfo.meta)) {
          detailRows.push({
            name: this.$t('额外信息'),
            content: parsedInfo.meta,
            type: 'json',
            depth: 4
          })
        }

        if (parsedInfo.rawIsObject) {
          detailRows.push({
            name: this.$t('请求内容'),
            content: parsedInfo.raw,
            type: 'json',
            depth: 10
          })
        } else if (parsedInfo.raw !== undefined && parsedInfo.raw !== null) {
          detailRows.push({
            name: this.$t('请求内容'),
            content: String(parsedInfo.raw),
            type: 'text'
          })
        }

        detailRows.push(
          {
            name: this.$t('UA信息'),
            content: data.useragent,
            type: 'text'
          },
          {
            name: this.$t('请求IP'),
            content: data.ip,
            type: 'text'
          },
          {
            name: this.$t('请求时间'),
            content: data.create_time,
            type: 'time'
          },
          {
            name: this.$t('激活状态'),
            content: data.status + '',
            type: 'boolen'
          }
        )

        this.detail.data = detailRows
      }).catch((error) => {
        this.loading.detail = ''
        const message = (error && error.message) ? error.message : this.$t('加载日志详情失败')
        this.$message.error(message)
      })
    },
    handleDelete(index, row) {
      const thiz = this
      this.$confirm(this.$t('确认要删除该日志吗？'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        thiz.loading.delete = row.id

        deleteLog(row.id).then(res => {
          thiz.loading.delete = ''
          thiz.list.splice(index, 1)
          if (row && row.id !== undefined && row.id !== null && thiz.infoCache[row.id]) {
            thiz.$delete(thiz.infoCache, row.id)
          }

          this.$message({
            message: res.message,
            type: 'success',
            duration: 3 * 1000
          })
        }).catch(() => {
          thiz.loading.delete = ''
        })
      }).catch(() => {})
    },
    handleDeleteList() {
      this.$confirm(this.$t('确认要删除选中的日志吗？'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        if (this.selectedData.length < 1) {
          this.$message({
            message: this.$t('请选择要删除的日志'),
            type: 'error',
            duration: 3 * 1000
          })
          return
        }

        const thiz = this
        clearLog({
          ids: this.selectedData.join(',')
        }).then(res => {
          this.$message({
            message: res.message,
            type: 'success',
            duration: 3 * 1000,
            onClose() {
              for (let i = thiz.list.length - 1; i >= 0; i--) {
                if (thiz.selectedData.includes(thiz.list[i].id)) {
                  const removedId = thiz.list[i].id
                  thiz.list.splice(i, 1)
                  if (removedId !== undefined && removedId !== null && thiz.infoCache[removedId]) {
                    thiz.$delete(thiz.infoCache, removedId)
                  }
                }
              }
            }
          })
        })
      }).catch(() => {

      })
    },
    handleClear() {
      this.$confirm(this.$t('确认要清空一个月之前的日志吗？'), this.$t('提示'), {
        confirmButtonText: this.$t('确定'),
        cancelButtonText: this.$t('取消'),
        type: 'warning'
      }).then(() => {
        clearLog().then(res => {
          this.$message({
            message: res.message,
            type: 'success',
            duration: 5 * 1000
          })
        })
      }).catch(() => {

      })
    }
  }
}
</script>

<style scoped>
.pagination-container {
  padding: 5px 2px;
}
.edit-input {
  padding-right: 100px;
}
.cancel-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>
