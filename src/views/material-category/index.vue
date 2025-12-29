<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="card-header">
        <span class="card-title">{{ $t('materialCategory.search_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="checkPermission(['app-admin.material-categories.store'])"
            type="primary"
            icon="el-icon-plus"
            size="small"
            @click="openCreate"
          >
            {{ $t('materialCategory.action_create') }}
          </el-button>
        </div>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('materialCategory.search_keyword')"
          clearable
          class="filter-item"
          style="width: 220px;margin-right: 12px;"
          @keyup.enter.native="handleFilter"
        />

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('materialCategory.search_order')"
          class="filter-item"
          style="width: 200px;margin-right: 12px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('materialCategory.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('materialCategory.search_reset') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        border
        fit
        highlight-current-row
        style="width: 100%"
        :empty-text="$t('materialCategory.empty_text')"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column min-width="240" :label="$t('materialCategory.table_name')">
          <template slot-scope="{ row }">
            <div class="category-name">
              <span class="category-name__title">{{ row.name }}</span>
              <span class="category-name__description">{{ row.description || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column width="120" align="center" :label="$t('materialCategory.table_sort')">
          <template slot-scope="{ row }">
            <span>{{ row.sort_order }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="160" :label="$t('materialCategory.table_created')">
          <template slot-scope="{ row }">
            <span>{{ row.created_at }}</span>
          </template>
        </el-table-column>
        <el-table-column min-width="160" :label="$t('materialCategory.table_updated')">
          <template slot-scope="{ row }">
            <span>{{ row.updated_at }}</span>
          </template>
        </el-table-column>
        <el-table-column width="220" align="center" :label="$t('materialCategory.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-edit"
              :disabled="!checkPermission(['app-admin.material-categories.update'])"
              @click="openEdit(row)"
            >
              {{ $t('materialCategory.action_edit') }}
            </el-button>
            <el-button
              v-waves
              size="mini"
              type="danger"
              plain
              icon="el-icon-delete"
              :loading="loading.delete === row.id"
              :disabled="!checkPermission(['app-admin.material-categories.destroy'])"
              @click="handleDelete(row)"
            >
              {{ $t('materialCategory.action_delete') }}
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
      :title="dialog.isEdit ? $t('materialCategory.dialog_edit_title') : $t('materialCategory.dialog_create_title')"
      :visible.sync="dialog.visible"
      width="520px"
      :close-on-click-modal="false"
      @closed="resetDialog"
    >
      <el-form ref="categoryForm" :model="dialog.form" :rules="dialog.rules" label-width="120px">
        <el-form-item :label="$t('materialCategory.form_name')" prop="name">
          <el-input v-model="dialog.form.name" maxlength="60" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('materialCategory.form_description')">
          <el-input v-model="dialog.form.description" type="textarea" :rows="3" maxlength="240" show-word-limit />
        </el-form-item>
        <el-form-item :label="$t('materialCategory.form_sort')">
          <el-input-number
            v-model="dialog.form.sort_order"
            :min="0"
            :max="9999"
            :step="1"
            :precision="0"
            controls-position="right"
          />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialog.visible = false">{{ $t('materialCategory.dialog_cancel') }}</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="submitDialog">
          {{ dialog.isEdit ? $t('materialCategory.dialog_confirm_edit') : $t('materialCategory.dialog_confirm_create') }}
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination'
import {
  getMaterialCategories,
  createMaterialCategory,
  updateMaterialCategory,
  deleteMaterialCategory
} from '@/api/materialCategories'

// 构造默认的分类表单，便于创建或重置时复用
const createDefaultForm = () => ({
  id: '',
  name: '',
  description: '',
  sort_order: 0
})

export default {
  name: 'MaterialCategoryList',
  components: { Pagination },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        order: 'sort_order_ASC',
        limit: 10,
        page: 1
      },
      orderOptions: [
        { key: 'sort_order_ASC', label: this.$t('materialCategory.order_sort_asc') },
        { key: 'sort_order_DESC', label: this.$t('materialCategory.order_sort_desc') },
        { key: 'name_ASC', label: this.$t('materialCategory.order_name_asc') },
        { key: 'name_DESC', label: this.$t('materialCategory.order_name_desc') },
        { key: 'created_at_DESC', label: this.$t('materialCategory.order_created_desc') },
        { key: 'created_at_ASC', label: this.$t('materialCategory.order_created_asc') }
      ],
      loading: {
        delete: ''
      },
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        form: createDefaultForm(),
        rules: {
          name: [{ required: true, message: this.$t('materialCategory.form_rules_name'), trigger: 'blur' }]
        }
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    // 拉取材料分类列表数据
    getList() {
      this.listLoading = true
      const params = {
        start: (this.listQuery.page - 1) * this.listQuery.limit,
        limit: this.listQuery.limit,
        order: this.listQuery.order
      }
      if (this.listQuery.keyword) {
        params.keyword = this.listQuery.keyword
      }
      getMaterialCategories(params)
        .then(res => {
          const data = res.data || {}
          this.list = data.list || []
          this.total = data.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    // 点击搜索或切换排序时刷新列表
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 清空筛选条件并回到第一页
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        order: 'sort_order_ASC',
        limit,
        page: 1
      }
      this.getList()
    },
    // 打开新增分类弹窗
    openCreate() {
      this.dialog.visible = true
      this.dialog.isEdit = false
      this.dialog.form = createDefaultForm()
    },
    // 打开编辑弹窗并填充选中数据
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.form = {
        id: row.id,
        name: row.name,
        description: row.description || '',
        sort_order: Number.isFinite(row.sort_order) ? row.sort_order : Number(row.sort_order) || 0
      }
    },
    // 组装分类提交载荷，保证类型正确
    buildPayload() {
      const { name, description, sort_order: sortOrder } = this.dialog.form
      const payload = {
        name: name ? name.trim() : '',
        description: description ? description.trim() : '',
        sort_order: Number.isFinite(sortOrder) ? sortOrder : Number(sortOrder) || 0
      }
      return payload
    },
    // 提交表单，根据状态调用新增或更新接口
    submitDialog() {
      if (!this.$refs.categoryForm) {
        return
      }
      this.$refs.categoryForm.validate(valid => {
        if (!valid) {
          return
        }
        const payload = this.buildPayload()
        this.dialog.loading = true
        const request = this.dialog.isEdit
          ? updateMaterialCategory(this.dialog.form.id, payload)
          : createMaterialCategory(payload)
        request
          .then(() => {
            this.$message.success(
              this.dialog.isEdit
                ? this.$t('materialCategory.message_update_success')
                : this.$t('materialCategory.message_create_success')
            )
            this.dialog.visible = false
            this.getList()
          })
          .finally(() => {
            this.dialog.loading = false
          })
      })
    },
    // 删除指定分类前进行确认
    async handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      try {
        await this.$confirm(
          this.$t('materialCategory.confirm_delete', { name: row.name }),
          this.$t('common.tips'),
          { type: 'warning' }
        )
      } catch (error) {
        return
      }
      this.loading.delete = row.id
      deleteMaterialCategory(row.id)
        .then(() => {
          this.$message.success(this.$t('materialCategory.message_delete_success'))
          this.getList()
        })
        .finally(() => {
          this.loading.delete = ''
        })
    },
    // 重置弹窗状态，清除校验与表单数据
    resetDialog() {
      if (this.$refs.categoryForm) {
        this.$refs.categoryForm.resetFields()
      }
      this.dialog.form = createDefaultForm()
      this.dialog.isEdit = false
      this.dialog.loading = false
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
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-container {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.category-name {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.category-name__title {
  font-weight: 600;
}
.category-name__description {
  color: #909399;
  font-size: 12px;
}
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
