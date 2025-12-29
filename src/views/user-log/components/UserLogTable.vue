<template>
  <el-table
    v-loading="loading"
    :data="list"
    :empty-text="$t('userLog.table_empty')"
    border
    fit
    highlight-current-row
    :header-cell-style="headerStyle"
    class="user-log-table"
  >
    <el-table-column prop="created_at" :label="$t('userLog.table_created_at')" min-width="160" />
    <el-table-column prop="request_id" :label="$t('userLog.table_request_id')" min-width="180" />
    <el-table-column :label="$t('userLog.table_user')" min-width="160">
      <template slot-scope="{ row }">
        <div class="user-cell">
          <div class="user-name">{{ getUserName(row) }}</div>
          <div v-if="getUserEmail(row)" class="user-extra">{{ getUserEmail(row) }}</div>
        </div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('userLog.table_method')" width="100" align="center">
      <template slot-scope="{ row }">
        <el-tag :type="getMethodTagType(row.method)">
          {{ row.method || '-' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column prop="path" :label="$t('userLog.table_path')" min-width="220" show-overflow-tooltip />
    <el-table-column :label="$t('userLog.table_status')" width="110" align="center">
      <template slot-scope="{ row }">
        <el-tag :type="getStatusTagType(row.response_status)">
          {{ row.response_status || '-' }}
        </el-tag>
      </template>
    </el-table-column>
    <el-table-column :label="$t('userLog.table_duration')" width="110" align="center">
      <template slot-scope="{ row }">
        <span>{{ formatDuration(row.duration_ms) }}</span>
      </template>
    </el-table-column>
    <el-table-column prop="ip" :label="$t('userLog.table_ip')" width="140" />
    <el-table-column :label="$t('userLog.table_actions')" width="140" align="center" fixed="right">
      <template slot-scope="{ row }">
        <el-button type="text" size="mini" icon="el-icon-view" @click="handleView(row)">
          {{ $t('userLog.action_view') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'UserLogTable',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      headerStyle: {
        background: '#f5f7fa'
      }
    }
  },
  methods: {
    // 触发查看详情事件，向父级发送当前行信息
    handleView(row) {
      this.$emit('view', row)
    },
    // 根据请求方法返回不同的标签颜色
    getMethodTagType(method) {
      const map = {
        GET: 'success',
        POST: 'warning',
        PUT: 'warning',
        PATCH: 'warning',
        DELETE: 'danger'
      }
      const upper = (method || '').toUpperCase()
      return map[upper] || 'info'
    },
    // 根据响应状态选择标签颜色
    getStatusTagType(status) {
      if (!status) {
        return 'info'
      }
      if (status >= 200 && status < 300) {
        return 'success'
      }
      if (status >= 400) {
        return 'danger'
      }
      if (status >= 300) {
        return 'warning'
      }
      return 'info'
    },
    // 拼装耗时文案，缺省时返回占位
    formatDuration(duration) {
      if (duration === undefined || duration === null || duration === '') {
        return '-'
      }
      const num = Number(duration)
      if (Number.isNaN(num)) {
        return '-'
      }
      return `${num} ms`
    },
    // 从日志记录中提取用户名称
    getUserName(row) {
      if (row && row.user && row.user.name) {
        return row.user.name
      }
      return row && row.user && row.user.id ? `${this.$t('userLog.field_user')}#${row.user.id}` : this.$t('userLog.field_unknown')
    },
    // 从日志记录中提取用户邮箱
    getUserEmail(row) {
      if (row && row.user && row.user.email) {
        return row.user.email
      }
      return ''
    }
  }
}
</script>

<style scoped>
.user-log-table .user-cell {
  display: flex;
  flex-direction: column;
}
.user-log-table .user-name {
  font-weight: 500;
}
.user-log-table .user-extra {
  color: #909399;
  font-size: 12px;
}
</style>
