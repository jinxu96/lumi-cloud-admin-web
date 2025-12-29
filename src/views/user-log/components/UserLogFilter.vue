<template>
  <div class="user-log-filter">
    <el-form :model="form" label-width="0" class="filter-form" inline>
      <el-form-item>
        <el-date-picker
          v-model="form.created_range"
          class="filter-item"
          type="datetimerange"
          :start-placeholder="$t('userLog.filter_created_start')"
          :end-placeholder="$t('userLog.filter_created_end')"
          :default-time="['00:00:00', '23:59:59']"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="~"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.user_keyword"
          class="filter-item"
          :placeholder="$t('userLog.filter_user_keyword')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.user_id"
          class="filter-item"
          :placeholder="$t('userLog.filter_user_id')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.request_id"
          class="filter-item"
          :placeholder="$t('userLog.filter_request_id')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.path"
          class="filter-item"
          :placeholder="$t('userLog.filter_path')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="form.method"
          class="filter-item"
          :placeholder="$t('userLog.filter_method')"
          clearable
        >
          <el-option
            v-for="item in methodOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.response_status"
          class="filter-item"
          :placeholder="$t('userLog.filter_status')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.ip"
          class="filter-item"
          :placeholder="$t('userLog.filter_ip')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.min_duration"
          class="filter-item"
          :placeholder="$t('userLog.filter_min_duration')"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-select
          v-model="form.order"
          class="filter-item"
          :placeholder="$t('userLog.filter_order')"
          clearable
        >
          <el-option
            v-for="item in orderOptions"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
      <el-form-item class="filter-actions">
        <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleSearch">
          {{ $t('userLog.action_search') }}
        </el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">
          {{ $t('userLog.action_reset') }}
        </el-button>
        <el-button type="success" icon="el-icon-download" :loading="exportLoading" :disabled="exportDisabled" @click="handleExport">
          {{ $t('userLog.action_export') }}
        </el-button>
      </el-form-item>
    </el-form>
    <p class="filter-tip">
      <i class="el-icon-info" />
      <span v-html="tipHtml" />
    </p>
  </div>
</template>

<script>
// 构造空白的初始筛选表单
const createEmptyForm = () => ({
  created_range: [],
  user_keyword: '',
  user_id: '',
  request_id: '',
  path: '',
  method: '',
  response_status: '',
  ip: '',
  min_duration: '',
  order: ''
})

export default {
  name: 'UserLogFilter',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    orderOptions: {
      type: Array,
      default: () => []
    },
    methodOptions: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    exportLoading: {
      type: Boolean,
      default: false
    },
    exportDisabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      form: createEmptyForm()
    }
  },
  computed: {
    // 渲染包含高亮关键字的提示文案
    tipHtml() {
      return this.$t('userLog.filter_tip')
    }
  },
  watch: {
    value: {
      handler(newVal) {
        this.form = {
          ...createEmptyForm(),
          ...newVal
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    // 点击搜索按钮时触发，通知父组件执行查询
    handleSearch() {
      this.$emit('search', { ...this.form })
    },
    // 重置表单为默认状态，并通知父组件更新筛选条件
    handleReset() {
      const nextForm = createEmptyForm()
      this.form = nextForm
      this.$emit('reset', nextForm)
    },
    // 点击导出按钮时向父组件传递当前筛选条件
    handleExport() {
      this.$emit('export', { ...this.form })
    }
  }
}
</script>

<style scoped>
.user-log-filter {
  margin-bottom: 16px;
}
.filter-form {
  width: 100%;
}
.filter-item {
  min-width: 200px;
}
.filter-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-tip {
  margin: 8px 0 0;
  color: #909399;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-tip /deep/ .highlight,
.filter-tip >>> .highlight {
  color: #f56c6c;
  font-weight: 600;
}
</style>

<style>
.user-log-filter .highlight {
  color: #f56c6c;
  font-weight: 600;
}
</style>
