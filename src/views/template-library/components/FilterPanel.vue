<template>
  <div class="filter-panel">
    <el-input
      v-model="localFilters.keyword"
      :placeholder="$t('templateLibrary.search_keyword')"
      clearable
      class="filter-item"
      @keyup.enter.native="emitSearch"
    />

    <el-select
      v-model="localFilters.status"
      :placeholder="$t('templateLibrary.search_status')"
      clearable
      class="filter-item"
    >
      <el-option :label="$t('templateLibrary.option_all')" value="" />
      <el-option :label="$t('templateLibrary.status_draft')" value="draft" />
      <el-option :label="$t('templateLibrary.status_published')" value="published" />
    </el-select>

    <el-select
      v-model="localFilters.is_featured"
      :placeholder="$t('templateLibrary.search_featured')"
      clearable
      class="filter-item"
    >
      <el-option :label="$t('templateLibrary.option_all')" value="" />
      <el-option :label="$t('templateLibrary.option_yes')" value="true" />
      <el-option :label="$t('templateLibrary.option_no')" value="false" />
    </el-select>

    <el-date-picker
      v-model="localFilters.published_range"
      :range-separator="$t('templateLibrary.range_separator')"
      :start-placeholder="$t('templateLibrary.published_start')"
      :end-placeholder="$t('templateLibrary.published_end')"
      type="datetimerange"
      align="right"
      value-format="yyyy-MM-dd HH:mm:ss"
      class="filter-item"
      clearable
    />

    <el-date-picker
      v-model="localFilters.created_range"
      :range-separator="$t('templateLibrary.range_separator')"
      :start-placeholder="$t('templateLibrary.created_start')"
      :end-placeholder="$t('templateLibrary.created_end')"
      type="datetimerange"
      align="right"
      value-format="yyyy-MM-dd HH:mm:ss"
      class="filter-item"
      clearable
    />

    <el-select
      v-model="localFilters.order"
      :placeholder="$t('templateLibrary.search_order')"
      class="filter-item"
      @change="emitSearch"
    >
      <el-option
        v-for="item in orderOptions"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>

    <div class="filter-actions">
      <el-button type="primary" icon="el-icon-search" @click="emitSearch">
        {{ $t('templateLibrary.search_btn') }}
      </el-button>
      <el-button @click="emitReset">
        {{ $t('templateLibrary.search_reset') }}
      </el-button>
    </div>
  </div>
</template>

<script>
// 过滤器面板，负责收集模板库的查询条件
export default {
  name: 'TemplateFilterPanel',
  props: {
    filters: {
      type: Object,
      required: true
    },
    orderOptions: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      localFilters: this.createLocalFilters(this.filters)
    }
  },
  watch: {
    // 外部筛选条件更新时刷新本地副本
    filters: {
      deep: true,
      handler(newVal) {
        this.localFilters = this.createLocalFilters(newVal)
      }
    }
  },
  methods: {
    // 根据父级传入的条件生成可编辑的本地对象
    createLocalFilters(source) {
      return {
        keyword: source.keyword || '',
        status: source.status || '',
        is_featured: source.is_featured || '',
        published_range: source.published_range ? [...source.published_range] : [],
        created_range: source.created_range ? [...source.created_range] : [],
        order: source.order || ''
      }
    },
    // 抛出查询事件，交给父级刷新列表
    emitSearch() {
      const payload = { ...this.localFilters }
      if (Array.isArray(payload.published_range)) {
        payload.published_range = [...payload.published_range]
      }
      if (Array.isArray(payload.created_range)) {
        payload.created_range = [...payload.created_range]
      }
      this.$emit('search', payload)
    },
    // 抛出重置事件，交给父级复原默认筛选
    emitReset() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}

.filter-item {
  min-width: 200px;
}

.filter-actions {
  display: flex;
  gap: 12px;
}
</style>
