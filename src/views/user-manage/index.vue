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

        <div class="filter-item filter-labeled">
          <span class="filter-label">{{ $t('userManage.search_project_publish_banned') }}</span>
          <el-select
            v-model="listQuery.is_project_publish_banned"
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
          <span class="filter-label">{{ $t('userManage.search_comment_banned') }}</span>
          <el-select
            v-model="listQuery.is_comment_banned"
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

        <el-table-column width="150" align="center" :label="$t('userManage.table_project_publish_banned')">
          <template slot-scope="{ row }">
            <el-tag :type="row.is_project_publish_banned ? 'warning' : 'success'">
              {{ row.is_project_publish_banned ? $t('userManage.option_yes') : $t('userManage.option_no') }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column width="150" align="center" :label="$t('userManage.table_comment_banned')">
          <template slot-scope="{ row }">
            <el-tag v-if="row && row.is_comment_banned === true" type="danger">
              {{ $t('templateComments.tag_banned') }}
            </el-tag>
            <el-tag v-else type="success">
              {{ $t('templateComments.status_normal') }}
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

        <el-table-column fixed="right" width="620" align="center" :label="$t('userManage.table_actions')">
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

            <el-button
              v-if="!row.is_blocked"
              v-waves
              size="mini"
              type="danger"
              icon="el-icon-lock"
              :plain="!checkPermission(['app-admin.users.block'])"
              :disabled="!checkPermission(['app-admin.users.block'])"
              :loading="block.loading && block.currentId === row.id"
              @click="handleBlock(row)"
            >
              {{ $t('userManage.table_block') }}
            </el-button>

            <el-button
              v-else
              v-waves
              size="mini"
              type="success"
              icon="el-icon-unlock"
              :plain="!checkPermission(['app-admin.users.unblock'])"
              :disabled="!checkPermission(['app-admin.users.unblock'])"
              :loading="unblock.loading && unblock.currentId === row.id"
              @click="handleUnblock(row)"
            >
              {{ $t('userManage.table_unblock') }}
            </el-button>

            <el-button
              v-if="!row.is_project_publish_banned"
              v-waves
              size="mini"
              type="warning"
              icon="el-icon-remove-outline"
              :plain="!checkPermission(['app-admin.users.forbid-project-publish'])"
              :disabled="!checkPermission(['app-admin.users.forbid-project-publish'])"
              :loading="forbidPublish.loading && forbidPublish.currentId === row.id"
              @click="handleForbidProjectPublish(row)"
            >
              {{ $t('userManage.table_forbid_project_publish') }}
            </el-button>

            <el-button
              v-else
              v-waves
              size="mini"
              type="primary"
              icon="el-icon-circle-check"
              :plain="!checkPermission(['app-admin.users.allow-project-publish'])"
              :disabled="!checkPermission(['app-admin.users.allow-project-publish'])"
              :loading="allowPublish.loading && allowPublish.currentId === row.id"
              @click="handleAllowProjectPublish(row)"
            >
              {{ $t('userManage.table_allow_project_publish') }}
            </el-button>

            <el-button
              v-if="!row.is_comment_banned"
              v-waves
              size="mini"
              type="primary"
              plain
              icon="el-icon-connection"
              :disabled="!checkPermission(['app-admin.project-template-comments.ban-user'])"
              @click="handleBan(row)"
            >
              {{ $t('templateComments.action_ban') }}
            </el-button>

            <el-button
              v-else
              v-waves
              size="mini"
              type="success"
              plain
              icon="el-icon-connection"
              :disabled="!checkPermission(['app-admin.project-template-comments.unban-user'])"
              @click="handleUnban(row)"
            >
              {{ $t('templateComments.action_unban') }}
            </el-button>

            <el-button
              v-waves
              size="mini"
              type="default"
              plain
              icon="el-icon-time"
              :disabled="!checkPermission(['app-admin.project-template-comments.ban-history'])"
              @click="handleBanHistory(row)"
            >
              {{ $t('templateComments.action_ban_history') }}
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

    <ban-history-dialog
      :visible.sync="banHistory.visible"
      :list="banHistory.list"
      :loading="banHistory.loading"
      :pagination="banHistory.pagination"
      @pagination="handleBanHistoryPagination"
    />

    <el-dialog
      :visible.sync="banDialog.visible"
      width="520px"
      :title="banDialog.mode === 'ban' ? $t('templateComments.dialog_ban_title') : $t('templateComments.dialog_unban_title')"
      @close="resetBanDialog"
    >
      <el-form :model="banDialog.form" label-width="120px">
        <el-form-item :label="$t('templateComments.ban_reason')" :required="banDialog.mode === 'ban'">
          <el-input
            v-model="banDialog.form.reason"
            type="textarea"
            :rows="3"
            :placeholder="$t('templateComments.placeholder_reason')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="banDialog.mode === 'ban'" :label="$t('templateComments.ban_expires_at')">
          <el-date-picker
            v-model="banDialog.form.expires_at"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('templateComments.placeholder_expires')"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="banDialog.visible = false">{{ $t('templateComments.action_cancel') }}</el-button>
        <el-button type="primary" :loading="banDialog.loading" @click="submitBanDialog">
          {{ $t('templateComments.action_confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 禁发项目对话框 -->
    <el-dialog
      :visible.sync="publishBanDialog.visible"
      width="520px"
      :title="publishBanDialog.mode === 'forbid' ? $t('userManage.dialog_forbid_project_publish') : $t('userManage.dialog_allow_project_publish')"
      @close="resetPublishBanDialog"
    >
      <el-form :model="publishBanDialog.form" label-width="120px">
        <el-form-item :label="$t('userManage.form_block_reason')" :required="publishBanDialog.mode === 'forbid'">
          <el-input
            v-model="publishBanDialog.form.reason"
            type="textarea"
            :rows="3"
            :placeholder="$t('userManage.placeholder_block_reason')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="publishBanDialog.mode === 'forbid'" :label="$t('userManage.form_block_expires')">
          <el-date-picker
            v-model="publishBanDialog.form.expires_at"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('userManage.placeholder_block_expires')"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="publishBanDialog.visible = false">{{ $t('templateComments.action_cancel') }}</el-button>
        <el-button type="primary" :loading="publishBanDialog.loading" @click="submitPublishBanDialog">
          {{ $t('templateComments.action_confirm') }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 封禁用户对话框 -->
    <el-dialog
      :visible.sync="blockDialog.visible"
      width="520px"
      :title="blockDialog.mode === 'block' ? $t('userManage.dialog_block_user') : $t('userManage.dialog_unblock_user')"
      @close="resetBlockDialog"
    >
      <el-form :model="blockDialog.form" label-width="120px">
        <el-form-item :label="$t('userManage.form_block_reason')" required>
          <el-input
            v-model="blockDialog.form.reason"
            type="textarea"
            :rows="3"
            :placeholder="$t('userManage.placeholder_block_reason')"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        <el-form-item v-if="blockDialog.mode === 'block'" :label="$t('userManage.form_block_expires')">
          <el-date-picker
            v-model="blockDialog.form.expires_at"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :placeholder="$t('userManage.placeholder_block_expires')"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="blockDialog.visible = false">{{ $t('templateComments.action_cancel') }}</el-button>
        <el-button type="primary" :loading="blockDialog.loading" @click="submitBlockDialog">
          {{ $t('templateComments.action_confirm') }}</el-button>
      </div>
    </el-dialog>
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
  resetUserPassword,
  blockUser,
  unblockUser,
  forbidUserProjectPublish,
  allowUserProjectPublish
} from '@/api/userManage'
import {
  banProjectTemplateCommentUser,
  unbanProjectTemplateCommentUser,
  getProjectTemplateCommentBanHistory
} from '@/api/projectTemplateComments'
import UserDetailDialog from './components/UserDetailDialog'
import UserEditDialog from './components/UserEditDialog'
import UserPasswordDialog from './components/UserPasswordDialog'
import BanHistoryDialog from '../template-comments/components/BanHistoryDialog.vue'

// 用户管理页面核心容器，负责列表渲染及详情/编辑/密码弹窗联动。

// 创建用户编辑弹窗的初始表单数据，避免字段缺失
const createDefaultEditForm = () => ({
  id: '',
  name: '',
  email: '',
  avatar: '',
  upload_quota_mb: 0,
  email_verified: false
})

export default {
  name: 'UserManageIndex',
  components: { Pagination, UserDetailDialog, UserEditDialog, UserPasswordDialog, BanHistoryDialog },
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
        is_project_publish_banned: '',
        is_comment_banned: '',
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
      },
      block: {
        loading: false,
        currentId: ''
      },
      unblock: {
        loading: false,
        currentId: ''
      },
      forbidPublish: {
        loading: false,
        currentId: ''
      },
      allowPublish: {
        loading: false,
        currentId: ''
      },
      banDialog: {
        visible: false,
        loading: false,
        mode: 'ban',
        userId: null,
        form: {
          reason: '',
          expires_at: ''
        }
      },
      publishBanDialog: {
        visible: false,
        loading: false,
        mode: 'forbid',
        userId: null,
        form: {
          reason: '',
          expires_at: ''
        }
      },
      blockDialog: {
        visible: false,
        loading: false,
        mode: 'block',
        userId: null,
        form: {
          reason: '',
          expires_at: ''
        }
      },
      banHistory: {
        visible: false,
        loading: false,
        list: [],
        pagination: { page: 1, limit: 20, total: 0 },
        userId: null
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    // 查询用户列表并应用筛选条件
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
      if (this.listQuery.is_project_publish_banned === 'true') {
        params.is_project_publish_banned = true
      } else if (this.listQuery.is_project_publish_banned === 'false') {
        params.is_project_publish_banned = false
      }
      if (this.listQuery.is_comment_banned === 'true') {
        params.is_comment_banned = true
      } else if (this.listQuery.is_comment_banned === 'false') {
        params.is_comment_banned = false
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
    // 点击筛选或切换条件时刷新列表
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    // 重置筛选条件并返回第一页
    resetFilter() {
      const limit = this.listQuery.limit
      this.listQuery = {
        keyword: '',
        email_verified: '',
        has_google: '',
        is_blocked: '',
        is_project_publish_banned: '',
        is_comment_banned: '',
        order: 'id_DESC',
        limit,
        page: 1
      }
      this.getList()
    },
    // 将字节数格式化为可读的 MB 文本
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
    // 用户配额显示使用 MB 单位
    formatQuota(value) {
      return this.formatBytesToMB(value)
    },
    // 存储占用显示使用 MB 单位
    formatStorage(value) {
      return this.formatBytesToMB(value)
    },
    // 将字节数转换为 MB 数值，用于编辑表单
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
    // 将 MB 数值转换为字节，用于提交接口
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
    // 打开详情弹窗并拉取用户详情
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
    // 监听详情弹窗开关，关闭时清理数据
    handleDetailVisibleChange(value) {
      this.detail.visible = value
      if (!value) {
        this.detail.data = null
        this.detail.currentId = ''
      }
    },
    // 打开编辑弹窗并预填用户数据
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
            email_verified: Boolean(data.email_verified)
          }
        })
        .finally(() => {
          this.edit.loading = false
          this.edit.currentId = ''
        })
    },
    // 监听编辑弹窗关闭，重置状态
    handleEditVisibleChange(value) {
      this.edit.visible = value
      if (!value && !this.edit.loading) {
        this.edit.currentId = ''
        this.edit.form = createDefaultEditForm()
      }
    },
    // 提交编辑表单并更新用户信息
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
        email_verified: form.email_verified
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
    // 打开封禁对话框
    handleBlock(row) {
      if (!row || !row.id) {
        return
      }
      if (!this.checkPermission(['app-admin.users.block'])) {
        this.$message.warning(this.$t('userManage.permission_denied'))
        return
      }
      this.blockDialog.mode = 'block'
      this.blockDialog.userId = row.id
      this.blockDialog.form.reason = ''
      this.blockDialog.form.expires_at = ''
      this.blockDialog.visible = true
    },
    // 打开解除封禁对话框
    handleUnblock(row) {
      if (!row || !row.id) {
        return
      }
      if (!this.checkPermission(['app-admin.users.unblock'])) {
        this.$message.warning(this.$t('userManage.permission_denied'))
        return
      }
      this.blockDialog.mode = 'unblock'
      this.blockDialog.userId = row.id
      this.blockDialog.form.reason = ''
      this.blockDialog.form.expires_at = ''
      this.blockDialog.visible = true
    },
    // 禁止用户发布项目模板
    // 禁止指定用户发布项目模板
    handleForbidProjectPublish(row) {
      if (!row || !row.id) {
        return
      }
      if (!this.checkPermission(['app-admin.users.forbid-project-publish'])) {
        this.$message.warning(this.$t('userManage.permission_denied'))
        return
      }
      this.publishBanDialog.mode = 'forbid'
      this.publishBanDialog.userId = row.id
      this.publishBanDialog.form = {
        reason: '',
        expires_at: ''
      }
      this.publishBanDialog.visible = true
    },
    // 允许用户重新发布项目模板
    handleAllowProjectPublish(row) {
      if (!row || !row.id) {
        return
      }
      if (!this.checkPermission(['app-admin.users.allow-project-publish'])) {
        this.$message.warning(this.$t('userManage.permission_denied'))
        return
      }
      this.publishBanDialog.mode = 'allow'
      this.publishBanDialog.userId = row.id
      this.publishBanDialog.form = {
        reason: ''
      }
      this.publishBanDialog.visible = true
    },
    // 打开评论禁言弹窗
    handleBan(row) {
      if (!row || !row.id) return
      this.banDialog.mode = 'ban'
      this.banDialog.userId = row.id
      this.banDialog.form.reason = ''
      this.banDialog.form.expires_at = ''
      this.banDialog.visible = true
    },
    // 打开评论解禁弹窗
    handleUnban(row) {
      if (!row || !row.id) return
      this.banDialog.mode = 'unban'
      this.banDialog.userId = row.id
      this.banDialog.form.reason = ''
      this.banDialog.form.expires_at = ''
      this.banDialog.visible = true
    },
    // 重置禁言弹窗状态
    resetBanDialog() {
      this.banDialog.visible = false
      this.banDialog.loading = false
      this.banDialog.userId = null
      this.banDialog.form.reason = ''
      this.banDialog.form.expires_at = ''
    },
    // 重置禁发项目弹窗状态
    resetPublishBanDialog() {
      this.publishBanDialog.visible = false
      this.publishBanDialog.loading = false
      this.publishBanDialog.userId = null
      this.publishBanDialog.form.reason = ''
      this.publishBanDialog.form.expires_at = ''
    },
    // 重置封禁弹窗状态
    resetBlockDialog() {
      this.blockDialog.visible = false
      this.blockDialog.loading = false
      this.blockDialog.userId = null
      this.blockDialog.form.reason = ''
      this.blockDialog.form.expires_at = ''
    },
    // 提交禁言/解禁
    async submitBanDialog() {
      if (!this.banDialog.userId) return
      if (this.banDialog.mode === 'ban' && !this.banDialog.form.reason.trim()) {
        this.$message.warning(this.$t('templateComments.rule_ban_reason'))
        return
      }
      this.banDialog.loading = true
      try {
        if (this.banDialog.mode === 'ban') {
          await banProjectTemplateCommentUser(this.banDialog.userId, {
            reason: this.banDialog.form.reason.trim(),
            expires_at: this.banDialog.form.expires_at || undefined
          })
          this.$message.success(this.$t('templateComments.toast_ban_success'))
        } else {
          await unbanProjectTemplateCommentUser(this.banDialog.userId, {
            reason: this.banDialog.form.reason.trim() || undefined
          })
          this.$message.success(this.$t('templateComments.toast_unban_success'))
        }
        this.resetBanDialog()
        this.getList()
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_ban_failed'))
      } finally {
        this.banDialog.loading = false
      }
    },
    // 提交禁发/允许发布项目对话框
    async submitPublishBanDialog() {
      const { mode, userId, form } = this.publishBanDialog
      if (!form.reason || !form.reason.trim()) {
        this.$message.warning(this.$t('templateComments.rule_ban_reason'))
        return
      }
      if (!userId) {
        return
      }
      this.publishBanDialog.loading = true
      try {
        const payload = {
          reason: form.reason.trim()
        }
        if (mode === 'forbid' && form.expires_at) {
          payload.expires_at = form.expires_at
        }
        if (mode === 'forbid') {
          await forbidUserProjectPublish(userId, payload)
          this.$message.success(this.$t('userManage.message_forbid_project_publish_success'))
        } else {
          await allowUserProjectPublish(userId, payload)
          this.$message.success(this.$t('userManage.message_allow_project_publish_success'))
        }
        this.resetPublishBanDialog()
        this.getList()
      } catch (error) {
        const message = (error && error.message) ? error.message : this.$t('userManage.message_forbid_project_publish_failure')
        this.$message.error(message)
      } finally {
        this.publishBanDialog.loading = false
      }
    },
    // 提交封禁/解除封禁对话框
    async submitBlockDialog() {
      const { mode, userId, form } = this.blockDialog
      if (!form.reason || !form.reason.trim()) {
        this.$message.warning(this.$t('userManage.message_reason_required'))
        return
      }
      if (!userId) {
        return
      }
      this.blockDialog.loading = true
      try {
        const payload = {
          reason: form.reason.trim()
        }
        if (mode === 'block' && form.expires_at) {
          payload.expires_at = form.expires_at
        }
        if (mode === 'block') {
          await blockUser(userId, payload)
          this.$message.success(this.$t('userManage.message_block_success'))
        } else {
          await unblockUser(userId, payload)
          this.$message.success(this.$t('userManage.message_unblock_success'))
        }
        this.resetBlockDialog()
        this.getList()
      } catch (error) {
        const message = (error && error.message) ? error.message : this.$t('userManage.message_block_failure')
        this.$message.error(message)
      } finally {
        this.blockDialog.loading = false
      }
    },
    // 查看评论禁言历史
    async handleBanHistory(row) {
      if (!row || !row.id) return
      this.banHistory.userId = row.id
      this.banHistory.visible = true
      this.banHistory.pagination.page = 1
      await this.fetchBanHistory()
    },
    async fetchBanHistory() {
      if (!this.banHistory.userId) return
      this.banHistory.loading = true
      try {
        const params = {
          start: (this.banHistory.pagination.page - 1) * this.banHistory.pagination.limit,
          limit: this.banHistory.pagination.limit
        }
        const { data } = await getProjectTemplateCommentBanHistory(this.banHistory.userId, params)
        this.banHistory.list = (data && data.list) || []
        this.banHistory.pagination.total = (data && data.total) || 0
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_ban_history_failed'))
      } finally {
        this.banHistory.loading = false
      }
    },
    handleBanHistoryPagination({ page, limit }) {
      this.banHistory.pagination.page = page
      this.banHistory.pagination.limit = limit
      this.fetchBanHistory()
    },
    // 打开重置密码弹窗
    handlePassword(row) {
      this.password.visible = true
      this.password.currentId = row.id
    },
    // 监听密码弹窗关闭清理状态
    handlePasswordVisibleChange(value) {
      this.password.visible = value
      if (!value && !this.password.loading) {
        this.password.currentId = ''
      }
    },
    // 提交重置密码请求
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
