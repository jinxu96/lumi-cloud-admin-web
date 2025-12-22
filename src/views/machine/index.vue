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

        <div class="filter-item filter-field" style="margin-right: 12px;">
          <span class="filter-label">{{ $t('machine.search_status') }}</span>
          <el-select
            v-model="listQuery.is_active"
            :placeholder="$t('machine.search_status')"
            clearable
            class="filter-select"
            style="width: 160px;"
            @change="handleFilter"
          >
            <el-option :label="$t('machine.option_all')" value="" />
            <el-option :label="$t('machine.option_enabled')" value="true" />
            <el-option :label="$t('machine.option_disabled')" value="false" />
          </el-select>
        </div>

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

        <el-table-column width="120" align="center" :label="$t('machine.table_icon')">
          <template slot-scope="{ row }">
            <el-image
              v-if="row.icon_url"
              :src="row.icon_url"
              fit="cover"
              class="machine-icon-thumb"
              :lazy="true"
            >
              <div slot="error" class="icon-placeholder">-</div>
            </el-image>
            <div v-else class="icon-placeholder">-</div>
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

        <el-table-column fixed="right" width="360" align="center" :label="$t('machine.table_actions')">
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
              :type="row.is_active ? 'warning' : 'success'"
              plain
              icon="el-icon-switch-button"
              :loading="loading.status === row.id"
              :disabled="!checkPermission(['app-admin.machines.status'])"
              @click="toggleStatus(row)"
            >
              {{ row.is_active ? $t('machine.action_disable') : $t('machine.action_enable') }}
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
          <el-input
            v-model="dialog.form.icon_url"
            maxlength="512"
            :placeholder="$t('machine.form_icon_placeholder')"
            @input="handleIconUrlInput"
          />
          <div class="icon-upload-actions">
            <el-upload
              v-if="canUploadIcon"
              class="icon-upload"
              :show-file-list="false"
              :action="uploadPlaceholderAction"
              :before-upload="beforeIconUpload"
              :http-request="handleIconUpload"
              accept="image/*"
              :disabled="dialog.iconUploading"
            >
              <el-button size="mini" type="primary" :loading="dialog.iconUploading">
                {{ $t('machine.action_upload_icon') }}
              </el-button>
            </el-upload>
            <span class="icon-tip">{{ $t('machine.form_icon_tip') }}</span>
          </div>
          <div v-if="iconPreviewUrl" class="icon-preview">
            <span class="icon-preview-title">{{ $t('machine.preview_title') }}</span>
            <el-image :src="iconPreviewUrl" fit="cover" class="icon-preview-image">
              <div slot="error" class="icon-preview-error">-</div>
            </el-image>
          </div>
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
import { getMachines, deleteMachine, createMachine, updateMachine, updateMachineStatus, uploadMachineIcon } from '@/api/machines'

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
      // Element Upload 组件要求提供 action 属性，实际请求由 http-request 接管
      uploadPlaceholderAction: '/noop-upload',
      loading: {
        delete: '',
        status: ''
      },
      dialog: {
        visible: false,
        loading: false,
        isEdit: false,
        iconUploading: false,
        iconFile: null,
        iconPreview: '',
        form: createDefaultForm(),
        rules: {
          name: [{ required: true, message: this.$t('machine.form_rules_name'), trigger: 'blur' }],
          slug: [{ required: true, message: this.$t('machine.form_rules_slug'), trigger: 'blur' }]
        }
      }
    }
  },
  computed: {
    iconPreviewUrl() {
      return this.dialog.iconPreview || this.dialog.form.icon_url || ''
    },
    canUploadIcon() {
      if (this.dialog.isEdit) {
        return this.checkPermission(['app-admin.machines.icon'])
      }
      return this.checkPermission(['app-admin.machines.store']) || this.checkPermission(['app-admin.machines.icon'])
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
  beforeDestroy() {
    this.clearLocalIconFile()
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
      this.dialog.iconUploading = false
      this.clearLocalIconFile()
      this.dialog.form = createDefaultForm()
    },
    // 打开编辑弹窗
    openEdit(row) {
      if (!row || !row.id) {
        return
      }
      this.dialog.visible = true
      this.dialog.isEdit = true
      this.dialog.iconUploading = false
      this.clearLocalIconFile()
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
    // 切换机器启用状态
    toggleStatus(row) {
      if (!row || !row.id) {
        return
      }
      const targetStatus = !row.is_active
      const confirmKey = targetStatus ? 'machine.confirm_enable' : 'machine.confirm_disable'
      this.$confirm(this.$t(confirmKey), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.ok'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        this.loading.status = row.id
        updateMachineStatus(row.id, targetStatus)
          .then(() => {
            const messageKey = targetStatus ? 'machine.message_enable_success' : 'machine.message_disable_success'
            this.$message.success(this.$t(messageKey))
            this.getList()
          })
          .finally(() => {
            this.loading.status = ''
          })
      }).catch(() => {})
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
        const submitData = this.buildMachineSubmitData(payload)
        this.dialog.loading = true
        const request = this.dialog.isEdit
          ? updateMachine(this.dialog.form.id, submitData)
          : createMachine(submitData)
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
      this.dialog.iconUploading = false
      this.clearLocalIconFile()
      this.dialog.form = createDefaultForm()
    },
    // 校验上传文件
    beforeIconUpload(file) {
      const isImage = /^image\//.test(file.type)
      if (!isImage) {
        this.$message.error(this.$t('machine.message_icon_upload_error_type'))
        return false
      }
      const isLt5M = file.size / 1024 / 1024 <= 5
      if (!isLt5M) {
        this.$message.error(this.$t('machine.message_icon_upload_error_size'))
        return false
      }
      return true
    },
    // 自定义上传机器展示图
    handleIconUpload(uploadOption) {
      const { file, onError, onSuccess } = uploadOption || {}
      if (!file) {
        if (typeof onError === 'function') {
          onError()
        }
        return
      }
      if (!this.dialog.isEdit) {
        this.setLocalIconFile(file)
        if (typeof onSuccess === 'function') {
          onSuccess({})
        }
        return
      }
      if (!this.dialog.form.id) {
        this.$message.error(this.$t('machine.message_icon_upload_error'))
        if (typeof onError === 'function') {
          onError()
        }
        return
      }
      this.dialog.iconUploading = true
      uploadMachineIcon(this.dialog.form.id, file)
        .then(res => {
          const payload = res.data || {}
          const nextUrl = payload.icon_url || (payload.machine && payload.machine.icon_url) || this.dialog.form.icon_url
          if (nextUrl) {
            this.dialog.form.icon_url = nextUrl
          }
          this.$message.success(this.$t('machine.message_icon_upload_success'))
          this.getList()
          this.clearLocalIconFile()
          if (typeof onSuccess === 'function') {
            onSuccess(payload)
          }
        })
        .catch(error => {
          this.$message.error(this.$t('machine.message_icon_upload_error'))
          if (typeof onError === 'function') {
            onError(error)
          }
        })
        .finally(() => {
          this.dialog.iconUploading = false
        })
    },
    // 手动输入地址时清除临时文件
    handleIconUrlInput() {
      if (this.dialog.iconFile || this.dialog.iconPreview) {
        this.clearLocalIconFile()
      }
    },
    // 记录本地选择的图片文件
    setLocalIconFile(file) {
      this.clearLocalIconFile()
      if (file) {
        let previewUrl = ''
        if (typeof window !== 'undefined' && window.URL && typeof window.URL.createObjectURL === 'function') {
          previewUrl = window.URL.createObjectURL(file)
        }
        this.dialog.iconFile = file
        this.dialog.iconPreview = previewUrl
      }
    },
    // 清理本地临时文件和预览
    clearLocalIconFile() {
      if (this.dialog.iconPreview && typeof window !== 'undefined' && window.URL && typeof window.URL.revokeObjectURL === 'function') {
        window.URL.revokeObjectURL(this.dialog.iconPreview)
      }
      this.dialog.iconPreview = ''
      this.dialog.iconFile = null
    },
    // 根据当前表单构建提交数据
    buildMachineSubmitData(payload) {
      if (!this.dialog.iconFile) {
        return payload
      }
      const formData = new FormData()
      Object.keys(payload).forEach(key => {
        const value = payload[key]
        if (value !== '' && value !== null && value !== undefined) {
          if (typeof value === 'boolean') {
            formData.append(key, value ? '1' : '0')
          } else {
            formData.append(key, value)
          }
        }
      })
      formData.append('icon', this.dialog.iconFile)
      return formData
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
.filter-field {
  display: flex;
  align-items: center;
  gap: 8px;
}
.filter-label {
  font-size: 13px;
  color: #606266;
  white-space: nowrap;
}
.machine-name {
  display: flex;
  align-items: center;
}
.machine-icon-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  overflow: hidden;
}
.icon-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 20px;
}
.icon-upload-actions {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.icon-tip {
  font-size: 12px;
  color: #909399;
}
.icon-preview {
  margin-top: 12px;
}
.icon-preview-title {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #606266;
}
.icon-preview-image {
  width: 120px;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}
.icon-preview-error {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 20px;
}
</style>
