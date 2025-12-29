<template>
  <el-drawer
    :title="$t('userLog.detail_title')"
    :visible.sync="innerVisible"
    size="50%"
    custom-class="user-log-detail-drawer"
    @close="handleClose"
  >
    <div v-loading="loading" class="drawer-body">
      <div v-if="record">
        <section class="detail-section">
          <h4>{{ $t('userLog.detail_basic') }}</h4>
          <el-row :gutter="12">
            <el-col
              v-for="item in basicInfoItems"
              :key="item.label"
              :span="item.span"
            >
              <div class="detail-basic-item">
                <div class="item-label">{{ item.label }}</div>
                <div class="item-value">{{ item.value }}</div>
              </div>
            </el-col>
          </el-row>
        </section>

        <section class="detail-section">
          <h4>{{ $t('userLog.detail_user') }}</h4>
          <pre class="detail-json">{{ formatJson(record.user) }}</pre>
        </section>

        <section class="detail-section">
          <h4>{{ $t('userLog.detail_query') }}</h4>
          <pre class="detail-json">{{ formatJson(record.query) }}</pre>
        </section>

        <section class="detail-section">
          <h4>{{ $t('userLog.detail_request_body') }}</h4>
          <pre class="detail-json">{{ formatJson(record.request_body) }}</pre>
        </section>

        <section class="detail-section">
          <h4>{{ $t('userLog.detail_response_body') }}</h4>
          <pre class="detail-json">{{ formatJson(record.response_body) }}</pre>
        </section>
      </div>
      <div v-else class="detail-empty">
        {{ $t('userLog.detail_empty') }}
      </div>
    </div>
  </el-drawer>
</template>

<script>
export default {
  name: 'UserLogDetailDrawer',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    record: {
      type: Object,
      default: () => null
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerVisible: false
    }
  },
  computed: {
    // 构造基础信息展示列表，包含标签、内容及列宽
    basicInfoItems() {
      if (!this.record) {
        return []
      }
      const safeValue = (value, fallback = '-') => {
        return value !== undefined && value !== null && value !== '' ? value : fallback
      }
      return [
        {
          label: this.$t('userLog.table_created_at'),
          value: safeValue(this.record.created_at),
          span: 12
        },
        {
          label: this.$t('userLog.table_request_id'),
          value: safeValue(this.record.request_id),
          span: 12
        },
        {
          label: this.$t('userLog.table_method'),
          value: safeValue(this.record.method),
          span: 12
        },
        {
          label: this.$t('userLog.table_status'),
          value: safeValue(this.record.response_status),
          span: 12
        },
        {
          label: this.$t('userLog.table_path'),
          value: safeValue(this.record.path),
          span: 24
        },
        {
          label: this.$t('userLog.table_duration'),
          value: this.formatDurationValue(this.record.duration_ms),
          span: 12
        },
        {
          label: this.$t('userLog.table_ip'),
          value: safeValue(this.record.ip),
          span: 12
        },
        {
          label: this.$t('userLog.detail_user_agent'),
          value: safeValue(this.record.user_agent),
          span: 24
        }
      ]
    }
  },
  watch: {
    visible: {
      handler(val) {
        this.innerVisible = val
      },
      immediate: true
    }
  },
  methods: {
    // 面板关闭时向父组件通知状态变更
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 规范化耗时字段的展示
    formatDurationValue(duration) {
      if (duration === null || duration === undefined || duration === '') {
        return '-'
      }
      const num = Number(duration)
      if (Number.isNaN(num)) {
        return '-'
      }
      return `${num} ms`
    },
    // 将对象或字符串格式化为易读的 JSON 文本
    formatJson(target) {
      if (target === null || target === undefined || target === '') {
        return '-'
      }
      if (typeof target === 'string') {
        try {
          const parsed = JSON.parse(target)
          return JSON.stringify(parsed, null, 2)
        } catch (error) {
          return target
        }
      }
      if (typeof target === 'object') {
        try {
          return JSON.stringify(target, null, 2)
        } catch (error) {
          return '-'
        }
      }
      return String(target)
    }
  }
}
</script>

<style scoped>
.drawer-body {
  padding: 16px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}
.detail-section {
  margin-top: 24px;
}
.detail-section h4 {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}
.detail-basic-item {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px 12px;
  background: #fafafa;
  margin-bottom: 12px;
}
.detail-basic-item .item-label {
  color: #909399;
  font-size: 12px;
  margin-bottom: 4px;
}
.detail-basic-item .item-value {
  color: #303133;
  word-break: break-word;
}
.detail-json {
  background: #f5f7fa;
  border-radius: 4px;
  padding: 12px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  font-size: 12px;
}
.detail-empty {
  color: #909399;
  text-align: center;
  padding: 40px 0;
}
</style>
