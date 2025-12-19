<template>
  <div class="app-container">
    <el-card>
      <div slot="header" class="clearfix">
        <span>{{ $t('userManage.search_title') }}</span>
      </div>

      <div class="filter-container">
        <el-input
          v-model="listQuery.keyword"
          :placeholder="$t('userManage.search_keyword')"
          clearable
          class="filter-item"
          style="width: 220px;margin-right: 10px;"
          @keyup.enter.native="handleFilter"
        />

        <div class="filter-item filter-labeled">
          <span class="filter-label">{{ $t('userManage.search_email_verified') }}</span>
          <el-select
            v-model="listQuery.email_verified"
            clearable
            style="width: 150px;"
            @change="handleFilter"
          >
            <el-option :label="$t('userManage.option_all')" value="" />
            <el-option :label="$t('userManage.option_yes')" value="true" />
            <el-option :label="$t('userManage.option_no')" value="false" />
          </el-select>
        </div>

        <div class="filter-item filter-labeled">
          <span class="filter-label">{{ $t('userManage.search_has_google') }}</span>
          <el-select
            v-model="listQuery.has_google"
            clearable
            style="width: 150px;"
            @change="handleFilter"
          >
            <el-option :label="$t('userManage.option_all')" value="" />
            <el-option :label="$t('userManage.option_yes')" value="true" />
            <el-option :label="$t('userManage.option_no')" value="false" />
          </el-select>
        </div>

        <div class="filter-item filter-labeled">
          <span class="filter-label">{{ $t('userManage.search_blocked') }}</span>
          <el-select
            v-model="listQuery.is_blocked"
            clearable
            style="width: 150px;"
            @change="handleFilter"
          >
            <el-option :label="$t('userManage.option_all')" value="" />
            <el-option :label="$t('userManage.option_yes')" value="true" />
            <el-option :label="$t('userManage.option_no')" value="false" />
          </el-select>
        </div>

        <el-select
          v-model="listQuery.order"
          :placeholder="$t('userManage.search_order')"
          clearable
          class="filter-item"
          style="width: 180px;margin-right: 10px;"
          @change="handleFilter"
        >
          <el-option v-for="item in orderOptions" :key="item.key" :label="item.label" :value="item.key" />
        </el-select>

        <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('userManage.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="resetFilter">
          {{ $t('userManage.search_reset') }}
        </el-button>
      </div>

      <el-table
        v-loading="listLoading"
        :data="list"
        class="border-gray"
        fit
        highlight-current-row
        style="width: 100%"
      >
        <el-table-column fixed width="200" :label="$t('userManage.table_name')">
          <template slot-scope="{ row }">
            <div class="user-name">
              <el-avatar v-if="row.avatar" :src="row.avatar" size="small" style="margin-right:8px;" />
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column min-width="220" :label="$t('userManage.table_email')">
          <template slot-scope="{ row }">
            <span>{{ row.email }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('userManage.table_email_verified')">
          <template slot-scope="{ row }">
            <el-tag :type="row.email_verified ? 'success' : 'info'">
              {{ row.email_verified ? $t('userManage.option_yes') : $t('userManage.option_no') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="110" align="center" :label="$t('userManage.table_google')">
          <template slot-scope="{ row }">
            <el-tag :type="row.has_google_binding ? 'success' : 'info'">
              {{ row.has_google_binding ? $t('userManage.option_yes') : $t('userManage.option_no') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('userManage.table_blocked')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_blocked ? 'danger' : 'success'">
              {{ row.is_blocked ? $t('userManage.option_yes') : $t('userManage.option_no') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('userManage.table_projects')">
          <template slot-scope="{ row }">
            <span>{{ row.projects_count }}</span>
          </template>
        </el-table-column>

        <el-table-column width="120" align="center" :label="$t('userManage.table_files')">
          <template slot-scope="{ row }">
            <span>{{ row.files_count }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="$t('userManage.table_quota')">
          <template slot-scope="{ row }">
            <span>{{ formatQuota(row.upload_quota_bytes) }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="140" :label="$t('userManage.table_storage_used')">
          <template slot-scope="{ row }">
            <span>{{ formatStorage(row.storage_used_bytes) }}</span>
          </template>
        </el-table-column>

        <el-table-column min-width="160" :label="$t('userManage.table_created')">
          <template slot-scope="{ row }">
            <span>{{ row.created_at }}</span>
          </template>
        </el-table-column>

        <el-table-column fixed="right" width="280" align="center" :label="$t('userManage.table_actions')">
          <template slot-scope="{ row }">
            <el-button
              v-waves
              size="mini"
              type="info"
              icon="el-icon-view"
              :loading="detail.loading && detail.currentId === row.id"
              :disabled="!checkPermission(['app-admin.users.show'])"
              @click="handleDetail(row)"
            >
              {{ $t('userManage.table_detail') }}
            </el-button>

            <el-button
              v-waves
              size="mini"
              type="primary"
              icon="el-icon-edit"
              :loading="edit.loading && edit.currentId === row.id"
              :disabled="!checkPermission(['app-admin.users.update'])"
              @click="handleEdit(row)"
            >
              {{ $t('userManage.table_update') }}
            </el-button>

            <el-button
              v-waves
              size="mini"
              type="warning"
              icon="el-icon-key"
              :loading="password.loading && password.currentId === row.id"
              :disabled="!checkPermission(['app-admin.users.password'])"
              @click="handlePassword(row)"
            >
              {{ $t('userManage.table_reset_password') }}
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

    <user-detail-dialog
      :visible.sync="detail.visible"
      :loading="detail.loading"
      :data="detail.data"
      :format-quota="formatQuota"
      :format-storage="formatStorage"
      @update:visible="handleDetailVisibleChange"
    />

    <user-edit-dialog
      :visible.sync="edit.visible"
      :loading="edit.loading"
      :user="edit.form"
      @update:visible="handleEditVisibleChange"
      @submit="handleEditSubmit"
    />

    <user-password-dialog
      :visible.sync="password.visible"
      :loading="password.loading"
      @update:visible="handlePasswordVisibleChange"
      @submit="handlePasswordSubmit"
    />
  </div>
</template>

<script>
import waves from '@/directive/waves'
import checkPermission from '@/utils/permission'
import Pagination from '@/components/Pagination'
import {
  getUsers,
  getUserDetail,
  updateUser,
  resetUserPassword
} from '@/api/userManage'
import UserDetailDialog from './components/UserDetailDialog'
import UserEditDialog from './components/UserEditDialog'
import UserPasswordDialog from './components/UserPasswordDialog'

// 用户管理页面核心容器，负责列表渲染及详情/编辑/密码弹窗联动。

const createDefaultEditForm = () => ({
  id: '',
  name: '',
  email: '',
  avatar: '',
  upload_quota_mb: 0,
  email_verified: false,
  is_blocked: false
})

export default {
  name: 'UserManageIndex',
  components: { Pagination, UserDetailDialog, UserEditDialog, UserPasswordDialog },
  directives: { waves },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: false,
      listQuery: {
        keyword: '',
        email_verified: '',
        has_google: '',
        is_blocked: '',
        order: 'id_DESC',
        limit: 10,
        page: 1
      },
      orderOptions: [
        { key: 'id_DESC', label: this.$t('userManage.order_id_desc') },
        { key: 'id_ASC', label: this.$t('userManage.order_id_asc') },
        { key: 'created_at_DESC', label: this.$t('userManage.order_created_desc') },
        { key: 'created_at_ASC', label: this.$t('userManage.order_created_asc') }
      ],
      detail: {
        visible: false,
        loading: false,
        data: null,
        currentId: ''
      },
      edit: {
        visible: false,
        loading: false,
        currentId: '',
        form: createDefaultEditForm()
      },
      password: {
        visible: false,
        loading: false,
        currentId: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
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
      if (this.listQuery.email_verified === 'true') {
        params.email_verified = true
      } else if (this.listQuery.email_verified === 'false') {
        params.email_verified = false
      }
      if (this.listQuery.has_google === 'true') {
        params.has_google = true
      } else if (this.listQuery.has_google === 'false') {
        params.has_google = false
      }
      if (this.listQuery.is_blocked === 'true') {
        params.is_blocked = true
      } else if (this.listQuery.is_blocked === 'false') {
        params.is_blocked = false
      }

      getUsers(params)
        .then(res => {
          const data = res.data || {}
          this.list = data.list || []
          this.total = data.total || 0
        })
        .finally(() => {
          this.listLoading = false
        })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        email_verified: '',
        has_google: '',
        is_blocked: '',
        order: 'id_DESC',
        limit,
        page: 1
      }
      this.getList()
    },
    formatBytesToMB(value) {
      if (!value && value !== 0) {
        return '-'
      }
      const numeric = Number(value)
      if (Number.isNaN(numeric)) {
        return '-'
      }
      const mb = numeric / (1024 * 1024)
      if (mb === 0) {
        return '0.00'
      }
      if (mb < 0.01) {
        return mb.toFixed(4)
      }
      return mb.toFixed(2)
    },
    formatQuota(value) {
      return this.formatBytesToMB(value)
    },
    formatStorage(value) {
      return this.formatBytesToMB(value)
    },
    bytesToMBValue(value) {
      if (!value && value !== 0) {
        return 0
      }
      const numeric = Number(value)
      if (Number.isNaN(numeric)) {
        return 0
      }
      return Number((numeric / (1024 * 1024)).toFixed(2))
    },
    mbToBytes(value) {
      if (!value && value !== 0) {
        return 0
      }
      const numeric = Number(value)
      if (Number.isNaN(numeric)) {
        return 0
      }
      return Math.round(numeric * 1024 * 1024)
    },
    handleDetail(row) {
      this.detail.visible = true
      this.detail.loading = true
      this.detail.currentId = row.id
      getUserDetail(row.id)
        .then(res => {
          this.detail.data = res.data
        })
        .finally(() => {
          this.detail.loading = false
          this.detail.currentId = ''
        })
    },
    handleDetailVisibleChange(value) {
      this.detail.visible = value
      if (!value) {
        this.detail.data = null
        this.detail.currentId = ''
      }
    },
    handleEdit(row) {
      this.edit.visible = true
      this.edit.loading = true
      this.edit.currentId = row.id
      getUserDetail(row.id)
        .then(res => {
          const data = res.data || {}
          const base = createDefaultEditForm()
          this.edit.form = {
            ...base,
            id: data.id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            upload_quota_mb: this.bytesToMBValue(data.upload_quota_bytes),
            email_verified: Boolean(data.email_verified),
            is_blocked: Boolean(data.is_blocked)
          }
        })
        .finally(() => {
          this.edit.loading = false
          this.edit.currentId = ''
        })
    },
    handleEditVisibleChange(value) {
      this.edit.visible = value
      if (!value && !this.edit.loading) {
        this.edit.currentId = ''
        this.edit.form = createDefaultEditForm()
      }
    },
    handleEditSubmit(form) {
      if (!form || !form.id) {
        return
      }
      this.edit.loading = true
      const payload = {
        name: form.name,
        email: form.email,
        avatar: form.avatar,
        upload_quota_bytes: this.mbToBytes(form.upload_quota_mb),
        email_verified: form.email_verified,
        is_blocked: form.is_blocked
      }
      updateUser(form.id, payload)
        .then(() => {
          this.$message.success(this.$t('userManage.message_update_success'))
          this.edit.visible = false
          this.edit.form = createDefaultEditForm()
          this.getList()
        })
        .finally(() => {
          this.edit.loading = false
        })
    },
    handlePassword(row) {
      this.password.visible = true
      this.password.currentId = row.id
    },
    handlePasswordVisibleChange(value) {
      this.password.visible = value
      if (!value && !this.password.loading) {
        this.password.currentId = ''
      }
    },
    handlePasswordSubmit(form) {
      if (!this.password.currentId) {
        return
      }
      this.password.loading = true
      resetUserPassword(this.password.currentId, form)
        .then(() => {
          this.$message.success(this.$t('userManage.message_password_success'))
          this.password.visible = false
        })
        .finally(() => {
          this.password.loading = false
          this.password.currentId = ''
        })
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
.filter-labeled {
  display: inline-flex;
  align-items: center;
  margin-right: 10px;
}
.filter-label {
  margin-right: 6px;
  color: #606266;
  white-space: nowrap;
}
.user-name {
  display: flex;
  align-items: center;
}
</style>
