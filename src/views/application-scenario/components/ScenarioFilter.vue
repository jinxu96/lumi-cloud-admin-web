<template>
  <div class="scenario-filter">
    <div class="filter-fields">
      <el-input
        v-model="localForm.keyword"
        :placeholder="$t('applicationScenario.search_keyword')"
        clearable
        class="filter-item"
        @keyup.enter.native="handleSearch"
      />

      <el-select
        v-model="localForm.is_active"
        :placeholder="$t('applicationScenario.search_status')"
        clearable
        class="filter-item"
      >
        <el-option :label="$t('applicationScenario.option_all')" value="" />
        <el-option :label="$t('applicationScenario.option_enabled')" value="true" />
        <el-option :label="$t('applicationScenario.option_disabled')" value="false" />
      </el-select>

      <el-select
        v-model="localForm.order"
        :placeholder="$t('applicationScenario.search_order')"
        class="filter-item"
      >
        <el-option
          v-for="item in orderOptions"
          :key="item.key"
          :label="item.label"
          :value="item.key"
        />
      </el-select>

      <el-button type="primary" icon="el-icon-search" @click="handleSearch">
        {{ $t('applicationScenario.search_btn') }}
      </el-button>
      <el-button @click="handleReset">
        {{ $t('applicationScenario.search_reset') }}
      </el-button>
    </div>
    <div class="filter-actions">
      <el-button
        v-if="canCreate"
        type="primary"
        icon="el-icon-plus"
        :loading="loading"
        @click="$emit('create')"
      >
        {{ $t('applicationScenario.action_create') }}
      </el-button>
    </div>
  </div>
</template>

<script>
// 本地维护筛选表单数据，避免父组件频繁重置
const createLocalForm = () => ({
  keyword: '',
  is_active: '',
  order: 'sort_order__ASC'
})

export default {
  name: 'ScenarioFilter',
  props: {
    query: {
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
    },
    canCreate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      localForm: createLocalForm()
    }
  },
  watch: {
    query: {
      immediate: true,
      deep: true,
      handler(value) {
        const base = createLocalForm()
        this.localForm = {
          ...base,
          ...value
        }
      }
    }
  },
  methods: {
    // 触发搜索并将当前筛选条件回传给父级
    handleSearch() {
      this.$emit('search', { ...this.localForm })
    },
    // 重置筛选条件
    handleReset() {
      this.localForm = createLocalForm()
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.scenario-filter {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.filter-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-item {
  width: 200px;
}

.filter-actions {
  display: flex;
  align-items: center;
}
</style>
