<template>
  <div>
    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :empty-text="$t('templateComments.empty_text')"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />

      <el-table-column :label="$t('templateComments.table_project')" min-width="160">
        <template slot-scope="{ row }">
          <div class="project-cell">
            <div class="project-title">{{ row.project ? row.project.title : '-' }}</div>
            <div v-if="row.project" class="project-meta">#{{ row.project.id }}</div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_user')" min-width="140">
        <template slot-scope="{ row }">
          <div class="user-cell">
            <span>{{ row.user ? row.user.name : '-' }}</span>
            <el-tag v-if="row.user && row.user.is_comment_banned" type="danger" size="mini">
              {{ $t('templateComments.tag_banned') }}
            </el-tag>
          </div>
          <div v-if="row.user" class="user-meta">ID: {{ row.user.id }}</div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_content')" min-width="220">
        <template slot-scope="{ row }">
          <div class="content-excerpt" :title="row.content_excerpt">
            {{ row.content_excerpt || '-' }}
          </div>
          <div v-if="row.is_pinned" class="pin-flag">
            <i class="el-icon-top" /> {{ $t('templateComments.flag_pinned') }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_stats')" width="200" align="center">
        <template slot-scope="{ row }">
          <div class="stat-line">
            <i class="el-icon-thumb" /> {{ row.likes_count || 0 }}
          </div>
          <div class="stat-line">
            <i class="el-icon-bottom" /> {{ row.dislikes_count || 0 }}
          </div>
          <div class="stat-line">
            <i class="el-icon-chat-dot-round" /> {{ row.replies_count || 0 }}
          </div>
          <div class="stat-line">
            <i class="el-icon-warning-outline" /> {{ row.reports_count || 0 }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_status')" width="140" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.is_deleted_by_admin ? 'danger' : row.is_deleted_by_owner ? 'info' : 'success'">
            {{ formatStatus(row) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_created_at')" width="180">
        <template slot-scope="{ row }">
          <span>{{ row.created_at || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateComments.table_actions')" fixed="right" width="320" align="center">
        <template slot-scope="{ row }">
          <el-button
            v-waves
            size="mini"
            type="info"
            plain
            icon="el-icon-view"
            :disabled="!canView"
            @click="$emit('view', row)"
          >
            {{ $t('templateComments.action_view') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            :type="row.is_deleted_by_admin ? 'success' : 'danger'"
            plain
            icon="el-icon-delete"
            :disabled="row.is_deleted_by_admin ? !canRestore : !canDelete"
            @click="row.is_deleted_by_admin ? $emit('restore', row) : $emit('delete', row)"
          >
            {{ row.is_deleted_by_admin ? $t('templateComments.action_restore') : $t('templateComments.action_delete') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            type="warning"
            plain
            icon="el-icon-top"
            :disabled="!canPin"
            @click="$emit('pin', row)"
          >
            {{ row.is_pinned ? $t('templateComments.action_unpin') : $t('templateComments.action_pin') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
// 评论列表表格，统一处理状态与操作按钮
export default {
  name: 'CommentsTable',
  directives: { waves: require('@/directive/waves').default },
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    canView: {
      type: Boolean,
      default: true
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canRestore: {
      type: Boolean,
      default: false
    },
    canPin: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    // 显示状态标签
    formatStatus(row) {
      if (row.is_deleted_by_admin) return this.$t('templateComments.status_deleted_by_admin')
      if (row.is_deleted_by_owner) return this.$t('templateComments.status_deleted_by_owner')
      return this.$t('templateComments.status_normal')
    }
  }
}
</script>

<style scoped>
.project-cell {
  display: flex;
  flex-direction: column;
  line-height: 18px;
}
.project-title {
  font-weight: 600;
}
.project-meta {
  color: #909399;
  font-size: 12px;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 6px;
}
.user-meta {
  color: #909399;
  font-size: 12px;
}
.content-excerpt {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 18px;
}
.pin-flag {
  margin-top: 4px;
  color: #e6a23c;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  line-height: 18px;
}
</style>
