<template>
  <el-table
    :data="list"
    :loading="loading"
    border
    fit
    highlight-current-row
    style="width: 100%;"
    :empty-text="$t('applicationScenario.empty_text')"
  >
    <el-table-column prop="id" label="ID" width="80" align="center" />

    <el-table-column :label="$t('applicationScenario.table_name')" min-width="200">
      <template slot-scope="{ row }">
        <div class="scenario-name">
          <span class="scenario-name__title">{{ row.name }}</span>
          <span class="scenario-name__code">{{ row.code }}</span>
        </div>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_icon')" width="120" align="center">
      <template slot-scope="{ row }">
        <el-image
          v-if="row.icon_url"
          :src="row.icon_url"
          fit="cover"
          class="scenario-icon"
        >
          <div slot="error" class="scenario-icon__placeholder">-</div>
        </el-image>
        <div v-else class="scenario-icon__placeholder">-</div>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_description')" min-width="260">
      <template slot-scope="{ row }">
        <span class="scenario-description">{{ row.description || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_status')" width="120" align="center">
      <template slot-scope="{ row }">
        <el-tag :type="row.is_active ? 'success' : 'info'">
          {{ row.is_active ? $t('applicationScenario.status_enabled') : $t('applicationScenario.status_disabled') }}
        </el-tag>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_sort')" width="110" align="center">
      <template slot-scope="{ row }">
        <span>{{ row.sort_order }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_updated')" min-width="180">
      <template slot-scope="{ row }">
        <span>{{ row.updated_at || '-' }}</span>
      </template>
    </el-table-column>

    <el-table-column :label="$t('applicationScenario.table_actions')" width="260" align="center">
      <template slot-scope="{ row }">
        <el-button
          v-if="canEdit"
          size="mini"
          type="primary"
          plain
          icon="el-icon-edit"
          @click="$emit('edit', row)"
        >
          {{ $t('applicationScenario.action_edit') }}
        </el-button>
        <el-button
          v-if="canToggle"
          size="mini"
          :type="row.is_active ? 'warning' : 'success'"
          plain
          icon="el-icon-switch-button"
          :loading="statusLoading === row.id"
          @click="$emit('toggle-status', row)"
        >
          {{ row.is_active ? $t('applicationScenario.action_disable') : $t('applicationScenario.action_enable') }}
        </el-button>
        <el-button
          v-if="canDelete"
          size="mini"
          type="danger"
          plain
          icon="el-icon-delete"
          :loading="deleteLoading === row.id"
          @click="$emit('delete', row)"
        >
          {{ $t('applicationScenario.action_delete') }}
        </el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: 'ScenarioTable',
  props: {
    list: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canToggle: {
      type: Boolean,
      default: false
    },
    statusLoading: {
      type: [String, Number],
      default: ''
    },
    deleteLoading: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>

<style scoped>
.scenario-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scenario-name__title {
  font-weight: 600;
}

.scenario-name__code {
  font-size: 12px;
  color: #909399;
}

.scenario-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
}

.scenario-icon__placeholder {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  border-radius: 6px;
}

.scenario-description {
  display: inline-block;
  max-width: 100%;
  color: #606266;
  word-break: break-word;
}
</style>
