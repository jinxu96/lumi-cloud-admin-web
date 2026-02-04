<template>
  <el-dialog
    :visible.sync="innerVisible"
    :title="$t('templateComments.ban_history_title')"
    width="720px"
    @close="handleClose"
  >
    <el-table v-loading="loading" :data="list" border :empty-text="$t('templateComments.ban_history_empty')">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column :label="$t('templateComments.ban_reason')" min-width="180">
        <template slot-scope="{ row }">
          <div>{{ row.reason || '-' }}</div>
          <div v-if="row.unban_reason" class="ban-meta">{{ $t('templateComments.unban_reason') }}: {{ row.unban_reason }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('templateComments.ban_range')" width="200">
        <template slot-scope="{ row }">
          <div>{{ row.banned_at || '-' }}</div>
          <div>→ {{ row.expires_at || $t('templateComments.ban_permanent') }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('templateComments.ban_by')" width="160">
        <template slot-scope="{ row }">
          <div>{{ row.banned_by ? row.banned_by.name : '-' }}</div>
          <div v-if="row.unbanned_by" class="ban-meta">{{ row.unbanned_by.name }}</div>
        </template>
      </el-table-column>
      <el-table-column :label="$t('templateComments.ban_status')" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.is_active ? 'danger' : 'info'">
            {{ row.is_active ? $t('templateComments.ban_active') : $t('templateComments.ban_inactive') }}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer" class="dialog-footer">
      <pagination
        v-show="pagination.total > 0"
        :total="pagination.total"
        :page.sync="innerPage"
        :limit.sync="innerLimit"
        layout="prev, pager, next"
        @pagination="handlePagination"
      />
      <el-button @click="handleClose">{{ $t('templateComments.action_close') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import Pagination from '@/components/Pagination'

// 用户禁言历史弹窗组件
export default {
  name: 'BanHistoryDialog',
  components: { Pagination },
  props: {
    // 弹窗可见状态
    visible: {
      type: Boolean,
      default: false
    },
    // 禁言记录列表
    list: {
      type: Array,
      default: () => []
    },
    // 表格加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页信息
    pagination: {
      type: Object,
      default: () => ({ page: 1, limit: 20, total: 0 })
    }
  },
  data() {
    return {
      // 内部可见状态，用于与父组件双向同步
      innerVisible: this.visible,
      // 内部分页页码
      innerPage: this.pagination.page,
      // 内部分页每页数量
      innerLimit: this.pagination.limit
    }
  },
  watch: {
    // 监听外部visible变化，同步到内部状态
    visible(val) {
      this.innerVisible = val
    },
    // 监听分页变化，同步到内部分页状态
    pagination: {
      deep: true,
      handler(val) {
        this.innerPage = val.page
        this.innerLimit = val.limit
      }
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 分页变化时通知父组件刷新
    handlePagination({ page, limit }) {
      this.$emit('pagination', { page, limit })
    }
  }
}
</script>

<style scoped>
.ban-meta {
  color: #909399;
  font-size: 12px;
}
.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
</style>
