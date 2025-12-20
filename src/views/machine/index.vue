<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('machine.search_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="checkPermission(['app-admin.machines.store'])"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openCreate"
          >
            {{ $t('machine.action_create') }}
          </el-button>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('machine.search_keyword')"
          clearable
          class="filter-item"
          style="width: 240px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.is_active"
          :placeholder="$t('machine.search_status')"
          clearable
          class="filter-item"
          style="width: 160px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option :label="$t('machine.option_all')" value="" />
          <el-option :label="$t('machine.option_enabled')" value="true" />
          <el-option :label="$t('machine.option_disabled')" value="false" />
        </el-select>

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('machine.search_order')"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('machine.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('machine.search_reset') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :empty-text="$t('machine.empty_text')"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />

        <el-table-column min-width="200" :label="$t('machine.table_name')">
          <template slot-scope="{ row }">
            <div class="machine-name">
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="$t('machine.table_slug')">
          <template slot-scope="{ row }">
            <span>{{ row.slug }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="$t('machine.table_brand')">
          <template slot-scope="{ row }">
            <span>{{ row.brand || '-' }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('machine.table_is_active')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_active ? 'success' : 'info'">
              {{ row.is_active ? $t('machine.status_enabled') : $t('machine.status_disabled') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('machine.table_sort')">
          <template slot-scope="{ row }">
            <span>{{ row.sort_order }}</span>
          </template>
        </el-table-column>

        <el-table-column width="140" align="center" :label="$t('machine.table_modules')">
          <template slot-scope="{ row }">
            <el-link type="primary" @click="goModules(row)">
              {{ row.modules_count || 0 }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('machine.table_created')">
          <template slot-scope="{ row }">
            <span>{{ row.created_at }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="180" :label="$t('machine.table_updated')">
          <template slot-scope="{ row }">
            <span>{{ row.updated_at }}</span>
          </template>
        </el-table-column>

        <el-table-column width="280" align="center" :label="$t('machine.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="primary"
              icon="el-icon-collection"
              :disabled="!checkPermission(['app-admin.machine-modules.index'])"
              @click="goModules(row)"
            >
              {{ $t('machine.action_view_modules') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-edit"
              :disabled="!checkPermission(['app-admin.machines.update'])"
              @click="openEdit(row)"
            >
              {{ $t('machine.action_edit') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              icon="el-icon-delete"
              :loading="loading.delete === row.id"
              :disabled="!checkPermission(['app-admin.machines.destroy'])"
              @click="handleDelete(row)"
            >
              {{ $t('machine.action_delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        :page.sync="listQuery.page"
        :limit.sync="listQuery.limit"
        @pagination="getList"
      />
    </el-card>

    <el-dialog
      :title="dialog.isEdit ? $t('machine.dialog_edit_title') : $t('machine.dialog_create_title')"
      :visible.sync="dialog.visible"
      width="560px"
      :close-on-click-modal="false"
      @closed="resetDialog"
    >
      <el-form ref="machineForm" :model="dialog.form" :rules="dialog.rules" label-width="110px">
        <el-form-item :label="$t('machine.form_name')" prop="name">
          <el-input v-model="dialog.form.name" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machine.form_slug')" prop="slug">
          <el-input v-model="dialog.form.slug" maxlength="120" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machine.form_brand')">
          <el-input v-model="dialog.form.brand" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machine.form_icon')">
          <el-input v-model="dialog.form.icon_url" maxlength="512" />
        </el-form-item>
        <el-form-item :label="$t('machine.form_description')">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('machine.form_is_active')">
          <el-switch v-model="dialog.form.is_active" active-color="#13ce66" inactive-color="#dcdfe6" />
        </el-form-item>
        <el-form-item :label="$t('machine.form_sort')">
          <el-input-number v-model="dialog.form.sort_order" :min="0" :max="9999" :step="1" controls-position="right" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="submitDialog">{{ $t('common.save') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination'
import { getMachines, deleteMachine, createMachine, updateMachine } from '@/api/machines'

const createDefaultForm = () => ({
  id: '',
  name: '',
  slug: '',
  brand: '',
  icon_url: '',
  description: '',
  is_active: true,
  sort_order: 0
})

export default {
  name: 'MachineIndex',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        is_active: '',
        order: 'created_at__DESC',
        limit: 20,
        page: 1
      },
      orderOptions: [],
      loading: {
        delete: ''
      },
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        form: createDefaultForm(),
        rules: {
          name: [{ required: true, message: this.$t('machine.form_rules_name'), trigger: 'blur' }],
          slug: [{ required: true, message: this.$t('machine.form_rules_slug'), trigger: 'blur' }]
        }
      }
    }
  },
  created() {
    this.orderOptions = [
      { key: 'id__DESC', label: this.$t('machine.order_id_desc') },
      { key: 'id__ASC', label: this.$t('machine.order_id_asc') },
      { key: 'name__ASC', label: this.$t('machine.order_name_asc') },
      { key: 'name__DESC', label: this.$t('machine.order_name_desc') },
      { key: 'created_at__DESC', label: this.$t('machine.order_created_desc') },
      { key: 'created_at__ASC', label: this.$t('machine.order_created_asc') }
    ]
    this.getList()
  },
  methods: {
    checkPermission,
    // 拉取机器列表
    getList() {
      this.listLoading = true
      const params = {
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit,
        order: this.listQuery.order || 'created_at__DESC'
      }
      if (this.listQuery.keyword) {
        params.keyword = this.listQuery.keyword
      }
      if (this.listQuery.is_active !== '' && this.listQuery.is_active !== null) {
        params.is_active = this.listQuery.is_active === 'true'
      }
      getMachines(params)
        .then(res => {
          const payload = res.data || {}
          this.list = payload.list || []
          this.total = payload.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 应用筛选条件
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置筛选条件
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        is_active: '',
        order: 'created_at__DESC',
        limit,
        page: 1
      }
      this.getList()
    },
    // 跳转到模块列表
    goModules(row) {
      if (!row || !row.id) {
        return
      }
      this.$router.push({
        path: '/machine/modules',
        query: { machine_id: row.id }
      })
    },
    // 删除机器
    handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      this.$confirm(this.$t('machine.confirm_delete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.delete = row.id
        deleteMachine(row.id)
          .then(() => {
            this.$message.success(this.$t('machine.message_delete_success'))
            this.getList()
          })
          .finally(() => {
            this.loading.delete = ''
          })
      }).catch(() => {})
    },
    // 打开新增弹窗
    openCreate() {
      this.dialog.visible = true
      this.dialog.isEdit = false
      this.dialog.form = createDefaultForm()
    },
    // 打开编辑弹窗
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.form = {
        id: row.id,
        name: row.name || '',
        slug: row.slug || '',
        brand: row.brand || '',
        icon_url: row.icon_url || '',
        description: row.description || '',
        is_active: Boolean(row.is_active),
        sort_order: typeof row.sort_order === 'number' ? row.sort_order : Number(row.sort_order) || 0
      }
    },
    // 提交新增或编辑
    submitDialog() {
      this.$refs.machineForm.validate(valid => {
        if (!valid) {
          return
        }
        const payload = {
          name: this.dialog.form.name,
          slug: this.dialog.form.slug,
          brand: this.dialog.form.brand || '',
          icon_url: this.dialog.form.icon_url || '',
          description: this.dialog.form.description || '',
          is_active: Boolean(this.dialog.form.is_active),
          sort_order: Number(this.dialog.form.sort_order) || 0
        }
        this.dialog.loading = true
        const request = this.dialog.isEdit
          ? updateMachine(this.dialog.form.id, payload)
          : createMachine(payload)
        request
          .then(() => {
            const messageKey = this.dialog.isEdit ? 'machine.message_update_success' : 'machine.message_create_success'
            this.$message.success(this.$t(messageKey))
            this.dialog.visible = false
            this.getList()
          })
          .finally(() => {
            this.dialog.loading = false
          })
      })
    },
    // 重置弹窗状态
    resetDialog() {
      if (this.$refs.machineForm) {
        this.$refs.machineForm.resetFields()
      }
      this.dialog.loading = false
      this.dialog.form = createDefaultForm()
    }
  }
}
</script>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.card-title {
  font-weight: 600;
  font-size: 16px;
}
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-container {
  margin-bottom: 20px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}
.filter-item {
  margin-bottom: 12px;
}
.machine-name {
  display: flex;
  align-items: center;
}
</style>
