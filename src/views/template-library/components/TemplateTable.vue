<template>
  <div>
    <el-table
      v-loading="loading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%"
      :empty-text="$t('templateLibrary.empty_text')"
    >
      <el-table-column prop="id" label="ID" width="80" align="center" />

      <el-table-column :label="$t('templateLibrary.table_title')" min-width="220">
        <template slot-scope="{ row }">
          <div class="template-title">
            <div class="template-title__text">{{ row.title }}</div>
            <div class="template-title__meta">
              <span v-if="row.tags && row.tags.length" class="tag-meta">
                {{ $t('templateLibrary.table_tags') }}: {{ row.tags.join(', ') }}
              </span>
              <span v-if="row.user" class="author-meta">
                {{ $t('templateLibrary.table_author') }}: {{ row.user.name || '-' }}
              </span>
            </div>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_status')" width="120" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.status === 'published' ? 'success' : 'info'">
            {{ row.status === 'published' ? $t('templateLibrary.status_published') : $t('templateLibrary.status_draft') }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_featured')" width="140" align="center">
        <template slot-scope="{ row }">
          <el-tag :type="row.is_featured ? 'warning' : 'info'">
            {{ row.is_featured ? $t('templateLibrary.option_yes') : $t('templateLibrary.option_no') }}
          </el-tag>
          <div v-if="row.is_featured" class="featured-meta">
            <span>{{ $t('templateLibrary.table_featured_weight') }}: {{ row.featured_weight || 0 }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_stats')" min-width="140" align="center">
        <template slot-scope="{ row }">
          <div class="stats-line">
            <i class="el-icon-thumb" /> {{ row.likes_count || 0 }}
          </div>
          <div class="stats-line">
            <i class="el-icon-download" /> {{ row.downloads_count || 0 }}
          </div>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_published_at')" width="180">
        <template slot-scope="{ row }">
          <span>{{ row.published_at || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_updated_at')" width="180">
        <template slot-scope="{ row }">
          <span>{{ row.updated_at || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('templateLibrary.table_actions')" fixed="right" width="440" align="center">
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
            {{ $t('templateLibrary.action_view') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            type="primary"
            plain
            icon="el-icon-edit"
            :disabled="!canEdit"
            @click="$emit('edit', row)"
          >
            {{ $t('templateLibrary.action_edit') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            :type="row.status === 'published' ? 'warning' : 'success'"
            plain
            icon="el-icon-switch-button"
            :disabled="!canUpdateStatus"
            @click="$emit('change-status', row)"
          >
            {{ row.status === 'published' ? $t('templateLibrary.action_unpublish') : $t('templateLibrary.action_publish') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            type="primary"
            plain
            icon="el-icon-star-off"
            :disabled="!canFeature"
            @click="$emit('feature', row)"
          >
            {{ $t('templateLibrary.action_feature') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            type="success"
            plain
            icon="el-icon-copy-document"
            :disabled="!canDuplicate"
            @click="$emit('duplicate', row)"
          >
            {{ $t('templateLibrary.action_duplicate') }}
          </el-button>

          <el-button
            v-waves
            size="mini"
            type="danger"
            plain
            icon="el-icon-delete"
            :disabled="!canDelete"
            @click="$emit('delete', row)"
          >
            {{ $t('templateLibrary.action_delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      :page.sync="innerPage"
      :limit.sync="innerLimit"
      class="pagination-wrapper"
      @pagination="handlePagination"
    />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'

// 模板列表表格，负责渲染数据与抛出操作事件
export default {
  name: 'TemplateTable',
  components: { Pagination },
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
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    total: {
      type: Number,
      default: 0
    },
    canView: {
      type: Boolean,
      default: true
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canUpdateStatus: {
      type: Boolean,
      default: false
    },
    canFeature: {
      type: Boolean,
      default: false
    },
    canDuplicate: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerPage: this.page,
      innerLimit: this.limit
    }
  },
  watch: {
    // 父级分页页码变化时同步到内部副本
    page(newVal) {
      this.innerPage = newVal
    },
    // 父级分页大小变化时同步到内部副本
    limit(newVal) {
      this.innerLimit = newVal
    }
  },
  methods: {
    // 统一处理分页组件回调，通知父级刷新数据
    handlePagination({ page, limit }) {
      this.$emit('update:page', page)
      this.$emit('update:limit', limit)
      this.$emit('pagination', { page, limit })
    }
  }
}
</script>

<style scoped>
.template-title__text {
  font-weight: 600;
}

.template-title__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.featured-meta {
  margin-top: 4px;
  color: #909399;
  font-size: 12px;
}

.stats-line {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}
</style>
