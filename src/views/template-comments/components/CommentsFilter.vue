<template>
  <div class="comments-filter">
    <el-form :model="form" label-width="100px" inline>
      <el-form-item :label="$t('templateComments.filter_project_id')">
        <el-input v-model="form.project_id" clearable :placeholder="$t('templateComments.placeholder_project_id')" />
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_user_id')">
        <el-input v-model="form.user_id" clearable :placeholder="$t('templateComments.placeholder_user_id')" />
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_keyword')">
        <el-input v-model="form.keyword" clearable :placeholder="$t('templateComments.placeholder_keyword')" />
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_status')">
        <el-select v-model="form.status" clearable :placeholder="$t('templateComments.option_all')">
          <el-option :label="$t('templateComments.option_all')" value="" />
          <el-option :label="$t('templateComments.status_normal')" value="normal" />
          <el-option :label="$t('templateComments.status_deleted_by_owner')" value="deleted_by_owner" />
          <el-option :label="$t('templateComments.status_deleted_by_admin')" value="deleted_by_admin" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_pinned')">
        <el-select v-model="form.is_pinned" clearable :placeholder="$t('templateComments.option_all')">
          <el-option :label="$t('templateComments.option_all')" value="" />
          <el-option :label="$t('templateComments.option_yes')" value="true" />
          <el-option :label="$t('templateComments.option_no')" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_reports')">
        <el-select v-model="form.has_reports" clearable :placeholder="$t('templateComments.option_all')">
          <el-option :label="$t('templateComments.option_all')" value="" />
          <el-option :label="$t('templateComments.option_yes')" value="true" />
          <el-option :label="$t('templateComments.option_no')" value="false" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_created')">
        <el-date-picker
          v-model="form.created_range"
          type="daterange"
          unlink-panels
          range-separator="-"
          :start-placeholder="$t('templateComments.created_start')"
          :end-placeholder="$t('templateComments.created_end')"
          value-format="yyyy-MM-dd"
        />
      </el-form-item>
      <el-form-item :label="$t('templateComments.filter_order')">
        <el-select v-model="form.order" clearable :placeholder="$t('templateComments.option_all')">
          <el-option
            v-for="item in orderOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" :loading="loading" @click="handleSearch">
          {{ $t('templateComments.action_search') }}
        </el-button>
        <el-button icon="el-icon-refresh" @click="handleReset">
          {{ $t('templateComments.action_reset') }}
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'CommentsFilter',
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    orderOptions: {
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
      form: { ...this.value }
    }
  },
  watch: {
    // 父级筛选器变动时同步到内部表单（深度监听确保嵌套字段更新）
    value: {
      deep: true,
      handler(newVal) {
        this.form = { ...newVal }
      }
    }
  },
  methods: {
    // 触发搜索
    handleSearch() {
      this.$emit('input', { ...this.form })
      this.$emit('search', { ...this.form })
    },
    // 重置筛选条件
    handleReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.comments-filter {
  margin-bottom: 12px;
}
</style>
