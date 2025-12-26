<template>
  <div class="app-container user-files-page">
    <el-card shadow="never">
      <div slot="header" class="card-header">
        <span>{{ $t('userManage.files_page_title') }}</span>
        <div class="card-actions">
          <el-button
            v-if="canUpload"
            type="primary"
            icon="el-icon-upload"
            :disabled="!filters.userId || uploadVerifyLoading"
            :loading="uploadVerifyLoading"
            @click="openUploadDialog"
          >
            {{ $t('userManage.files_upload_btn') }}
          </el-button>
        </div>
      </div>

      <div class="filters">
        <el-input
          v-model="filters.userKeyword"
          class="filter-item"
          :placeholder="$t('userManage.files_user_keyword_placeholder')"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <el-input
          v-model="filters.userId"
          type="number"
          class="filter-item"
          :placeholder="$t('userManage.files_user_id_placeholder')"
          @keyup.enter.native="handleSearch"
        />
        <el-input
          v-model="filters.search"
          class="filter-item"
          :placeholder="$t('userManage.files_search_placeholder')"
          clearable
          @keyup.enter.native="handleSearch"
        />
        <el-button type="primary" icon="el-icon-search" class="filter-item" @click="handleSearch">
          {{ $t('userManage.search_btn') }}
        </el-button>
        <el-button class="filter-item" @click="handleReset">
          {{ $t('userManage.search_reset') }}
        </el-button>
      </div>

      <el-alert
        v-if="filters.userId && usageLoaded"
        type="info"
        :title="usageText"
        show-icon
        class="usage-alert"
      />

      <el-table
        v-loading="loading"
        :data="list"
        border
        style="width: 100%;"
        class="files-table"
        :empty-text="$t('userManage.detail_empty')"
      >
        <el-table-column :label="$t('userManage.table_name')" min-width="200">
          <template slot-scope="{ row }">
            <div class="user-info">
              <span class="user-name">{{ (row.user && row.user.name) || '-' }}</span>
              <span v-if="row.user && row.user.email" class="user-email">{{ row.user.email }}</span>
              <span v-else-if="row.user_id" class="user-email">ID: {{ row.user_id }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="用户 ID" width="120" align="center">
          <template slot-scope="{ row }">
            {{ (row.user && row.user.id) || row.user_id || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="original_name" :label="$t('userManage.detail_file_name')" min-width="200">
          <template slot-scope="{ row }">
            <span class="file-name" @click="handleDownload(row)">{{ row.original_name || row.name }}</span>
            <el-link
              v-if="hasPreview(row) && canDownload"
              type="primary"
              class="file-preview"
              :underline="false"
              @click.stop="handlePreview(row)"
            >
              {{ $t('userManage.detail_preview_btn') }}
            </el-link>
          </template>
        </el-table-column>
        <el-table-column prop="size" :label="$t('userManage.detail_file_size')" width="140" align="center">
          <template slot-scope="{ row }">
            {{ formatBytes(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="extension" label="扩展名" width="110" align="center" />
        <el-table-column prop="comment" label="备注" min-width="200">
          <template slot-scope="{ row }">
            <span>{{ row.comment || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" :label="$t('userManage.detail_file_created')" width="180" />
        <el-table-column :label="$t('userManage.detail_file_actions')" width="220" align="center" fixed="right">
          <template slot-scope="{ row }">
            <el-button
              class="action-button"
              type="primary"
              size="mini"
              :plain="!canDownload"
              :disabled="!canDownload"
              :loading="downloadingId === row.id"
              icon="el-icon-download"
              @click="handleDownload(row)"
            >
              {{ $t('userManage.detail_download_btn') }}
            </el-button>
            <el-button
              class="action-button"
              type="danger"
              size="mini"
              :plain="!canDelete"
              :disabled="!canDelete"
              :loading="deleteLoadingId === row.id"
              icon="el-icon-delete"
              @click="handleDelete(row)"
            >
              {{ $t('common.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="pagination.total > 0"
        class="pagination-wrapper"
        :total="pagination.total"
        :page.sync="pagination.page"
        :limit.sync="pagination.limit"
        @pagination="handlePagination"
      />
    </el-card>

    <el-dialog
      :visible.sync="uploadDialog.visible"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetUploadDialog"
    >
      <template slot="title">
        <span>{{ $t('userManage.files_upload_title') }}</span>
      </template>
      <el-form label-width="90px">
        <el-form-item :label="$t('userManage.files_upload_select_label')">
          <el-upload
            class="upload-block"
            action="#"
            :auto-upload="false"
            :file-list="uploadDialog.fileList"
            :limit="1"
            :on-change="handleUploadFileChange"
            :on-remove="handleUploadFileRemove"
            :before-upload="() => false"
            :accept="acceptTypes"
          >
            <el-button type="primary" icon="el-icon-plus">{{ $t('userManage.files_upload_select_btn') }}</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item :label="$t('userManage.files_upload_comment_label')">
          <el-input v-model="uploadDialog.comment" type="textarea" :rows="3" maxlength="1000" show-word-limit />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="uploadDialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="uploadDialog.submitting" @click="submitUpload">{{ $t('userManage.files_upload_confirm_btn') }}</el-button>
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="previewDialog.visible"
      width="720px"
      :close-on-click-modal="false"
      class="preview-dialog"
      @closed="resetPreviewDialog"
    >
      <template slot="title">
        <span>{{ previewDialog.name || $t('userManage.detail_preview_title') }}</span>
      </template>
      <div v-loading="previewDialog.loading" class="preview-container">
        <el-image
          v-if="!previewDialog.loading"
          :src="previewDialog.url"
          fit="contain"
          :preview-src-list="[previewDialog.url]"
          class="preview-image"
        >
          <div slot="error" class="preview-error">
            {{ $t('userManage.files_download_failed') }}
          </div>
        </el-image>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="previewDialog.visible = false">{{ $t('common.ok') }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getAllUserFiles,
  getUserFiles,
  deleteUserFile,
  getUserFileDownload,
  getUserFileUploadSignature,
  completeUserFileDirectUpload
} from '@/api/userManage'
import Pagination from '@/components/Pagination'
import checkPermission from '@/utils/permission'
import { uploadFileToOss } from '@/utils/oss'

const DEFAULT_ALLOWED_EXTENSIONS = [
  'chb',
  'laser',
  'dxf',
  'svg',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'tif',
  'tiff'
]

// 用户文件列表页面，支持按用户 ID 查看、上传与删除文件记录。
export default {
  name: 'UserManageFilesIndex',
  components: { Pagination },
  data() {
    return {
      // 记录当前查询条件，需先指定用户 ID
      filters: {
        userKeyword: '',
        userId: '',
        search: ''
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0
      },
      list: [],
      usage: {
        used: 0,
        quota: 0,
        remaining: 0
      },
      usageLoaded: false,
      loading: false,
      downloadingId: null,
      deleteLoadingId: null,
      uploadVerifyLoading: false,
      uploadDialog: {
        visible: false,
        comment: '',
        fileList: [],
        file: null,
        submitting: false,
        progress: 0
      },
      previewDialog: {
        visible: false,
        loading: false,
        url: '',
        name: ''
      },
      // 后端实时返回的上传白名单扩展名列表
      allowedExtensions: [...DEFAULT_ALLOWED_EXTENSIONS]
    }
  },
  computed: {
    // 组合用户存储用量的提示文本
    usageText() {
      if (!this.filters.userId) {
        return ''
      }
      const items = [
        `已用 ${this.formatBytes(this.usage.used)}`,
        `额度 ${this.formatBytes(this.usage.quota)}`,
        `剩余 ${this.formatBytes(this.usage.remaining)}`
      ]
      return items.join(' | ')
    },
    // 校验上传权限
    canUpload() {
      return this.checkPermission(['app-admin.user-files.store'])
    },
    // 校验下载权限
    canDownload() {
      return this.checkPermission(['app-admin.user-files.download'])
    },
    // 校验删除权限
    canDelete() {
      return this.checkPermission(['app-admin.user-files.destroy'])
    },
    // 生成 accept 属性字符串
    acceptTypes() {
      return this.allowedExtensions.map(ext => `.${ext}`).join(',')
    },
    // 拼装白名单展示文案
    allowedExtensionsDisplay() {
      if (!this.allowedExtensions.length) {
        return '-'
      }
      return this.allowedExtensions.map(ext => ext.toUpperCase()).join(' / ')
    }
  },
  created() {
    // 若路由附带 userId，则自动带入查询
    const { userId } = this.$route.query || {}
    if (userId && !Number.isNaN(Number(userId))) {
      this.filters.userId = Number(userId)
      this.handleSearch()
    } else {
      this.fetchList()
    }
  },
  methods: {
    checkPermission,
    // 将字节数格式化为易读文本
    formatBytes(value) {
      if (!value && value !== 0) {
        return '-'
      }
      const size = Number(value)
      if (Number.isNaN(size)) {
        return '-'
      }
      if (size < 1024) {
        return `${size} B`
      }
      if (size < 1024 * 1024) {
        return `${(size / 1024).toFixed(1)} KB`
      }
      if (size < 1024 * 1024 * 1024) {
        return `${(size / 1024 / 1024).toFixed(2)} MB`
      }
      return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    // 拉取文件列表并处理分页及存储配额
    async fetchList() {
      this.loading = true
      this.usageLoaded = false
      try {
        const params = {
          page: this.pagination.page,
          limit: this.pagination.limit
        }
        const userKeyword = this.filters.userKeyword && this.filters.userKeyword.trim()
        if (userKeyword) {
          params.user = userKeyword
        }
        if (this.filters.userId) {
          params.user_id = Number(this.filters.userId)
        }
        const searchKeyword = this.filters.search && this.filters.search.trim()
        if (searchKeyword) {
          params.search = searchKeyword
        }
        const { data } = await getAllUserFiles(params)
        this.list = (data && data.list) || []
        this.pagination.total = (data && data.total) || 0
        this.pagination.page = (data && data.page) || this.pagination.page
        this.pagination.limit = (data && data.limit) || this.pagination.limit
        if (data && data.usage) {
          this.usage = {
            used: data.usage.used_bytes || 0,
            quota: data.usage.quota_bytes || 0,
            remaining: data.usage.remaining_bytes || 0
          }
          this.usageLoaded = true
        } else {
          this.usage = {
            used: 0,
            quota: 0,
            remaining: 0
          }
        }
      } catch (error) {
        this.usage = {
          used: 0,
          quota: 0,
          remaining: 0
        }
        this.$message.error(this.$t('userManage.files_load_failure'))
      } finally {
        this.loading = false
      }
    },
    // 触发查询
    handleSearch() {
      this.pagination.page = 1
      this.fetchList()
    },
    // 重置筛选条件
    handleReset() {
      this.filters.userKeyword = ''
      this.filters.search = ''
      this.filters.userId = ''
      this.pagination.page = 1
      this.usage = {
        used: 0,
        quota: 0,
        remaining: 0
      }
      this.usageLoaded = false
      this.fetchList()
    },
    // 处理分页器页码变化
    handlePagination({ page, limit }) {
      this.pagination.page = page
      this.pagination.limit = limit
      this.fetchList()
    },
    // 打开上传弹窗前校验权限及用户合法性
    async openUploadDialog() {
      if (!this.canUpload) {
        this.$message.warning(this.$t('userManage.files_permission_denied'))
        return
      }
      if (!this.filters.userId) {
        this.$message.warning(this.$t('userManage.files_user_required'))
        return
      }
      const userId = Number(this.filters.userId)
      if (!userId) {
        this.$message.warning(this.$t('userManage.files_user_required'))
        return
      }
      this.uploadVerifyLoading = true
      try {
        await getUserFiles(userId, { limit: 1 })
        this.uploadDialog.visible = true
      } catch (error) {
        this.$message.error(this.$t('userManage.files_user_verify_failed'))
      } finally {
        this.uploadVerifyLoading = false
      }
    },
    // 上传组件选中文件时仅保留最后一项
    handleUploadFileChange(file, fileList) {
      // 仅保留最新文件，方便控制上传队列
      const ext = this.getFileExtension(file && file.name)
      if (this.allowedExtensions.length && !this.isAllowedExtension(ext)) {
        this.$message.warning(this.$t('userManage.files_upload_type_limited', { types: this.allowedExtensionsDisplay }))
        this.uploadDialog.fileList = []
        this.uploadDialog.file = null
        return
      }
      const rawFile = file && file.raw ? file.raw : file
      this.uploadDialog.fileList = fileList.slice(-1)
      this.uploadDialog.file = rawFile
      this.uploadDialog.progress = 0
    },
    // 移除待上传文件时重置状态
    handleUploadFileRemove() {
      this.uploadDialog.fileList = []
      this.uploadDialog.file = null
      this.uploadDialog.progress = 0
    },
    // 关闭上传弹窗时重置表单
    resetUploadDialog() {
      this.uploadDialog.comment = ''
      this.uploadDialog.fileList = []
      this.uploadDialog.file = null
      this.uploadDialog.submitting = false
      this.uploadDialog.progress = 0
    },
    // 提交上传请求：申请凭证 -> 直传 OSS -> 通知后端入库
    async submitUpload() {
      if (!this.uploadDialog.file) {
        this.$message.warning(this.$t('userManage.files_select_file_required'))
        return
      }
      const userId = Number(this.filters.userId)
      if (!userId) {
        this.$message.warning(this.$t('userManage.files_user_required'))
        return
      }
      const file = this.uploadDialog.file
      const fileExt = this.getFileExtension(file && file.name)
      if (!fileExt) {
        this.$message.warning(this.$t('userManage.files_upload_type_limited', { types: this.allowedExtensionsDisplay }))
        return
      }
      this.uploadDialog.submitting = true
      this.uploadDialog.progress = 0
      try {
        const signature = await this.requestUploadSignature(userId, file, fileExt)
        if (this.allowedExtensions.length && !this.isAllowedExtension(fileExt)) {
          this.$message.warning(this.$t('userManage.files_upload_type_limited', { types: this.allowedExtensionsDisplay }))
          return
        }
        let uploadResult
        try {
          uploadResult = await uploadFileToOss(signature, file, percent => {
            this.uploadDialog.progress = percent
          })
        } catch (error) {
          const message = this.$t('userManage.files_upload_direct_failed')
          const wrapped = new Error(message)
          wrapped.userMessage = message
          throw wrapped
        }
        const comment = this.uploadDialog.comment && this.uploadDialog.comment.trim()
        const payload = {
          object_key: uploadResult.objectKey || signature.object_key,
          original_name: file.name,
          size: file.size,
          extension: fileExt
        }
        if (comment) {
          payload.comment = comment
        }
        try {
          await completeUserFileDirectUpload(userId, payload)
        } catch (error) {
          const message = error && error.userMessage
            ? error.userMessage
            : (error && error.message ? error.message : this.$t('userManage.files_upload_complete_failed'))
          const wrapped = new Error(message)
          wrapped.userMessage = message
          throw wrapped
        }
        this.$message.success(this.$t('userManage.files_upload_success'))
        this.uploadDialog.visible = false
        this.fetchList()
      } catch (error) {
        const message = error && error.userMessage
          ? error.userMessage
          : (error && error.message ? error.message : this.$t('userManage.files_upload_failure'))
        this.$message.error(message)
      } finally {
        this.uploadDialog.submitting = false
        this.uploadDialog.progress = 0
      }
    },
    // 调用后端接口获取直传凭证，并根据返回更新白名单
    async requestUploadSignature(userId, file, extension) {
      try {
        const { data } = await getUserFileUploadSignature(userId, {
          file_name: file.name,
          size: file.size,
          extension
        })
        if (!data) {
          const message = this.$t('userManage.files_upload_signature_failed')
          const error = new Error(message)
          error.userMessage = message
          throw error
        }
        this.updateAllowedExtensions(data.allowed_extensions)
        return data
      } catch (error) {
        const message = error && error.userMessage
          ? error.userMessage
          : (error && error.message ? error.message : this.$t('userManage.files_upload_signature_failed'))
        const wrapped = new Error(message)
        wrapped.userMessage = message
        throw wrapped
      }
    },
    // 删除单条文件记录
    async handleDelete(row) {
      if (!row || !row.id) {
        return
      }
      if (!this.canDelete) {
        this.$message.warning(this.$t('userManage.files_permission_denied'))
        return
      }
      try {
        await this.$confirm(
          this.$t('userManage.files_delete_confirm', { name: row.original_name || row.name }),
          this.$t('common.tips'),
          { type: 'warning' }
        )
      } catch (error) {
        return
      }
      this.deleteLoadingId = row.id
      try {
        await deleteUserFile(row.id)
        this.$message.success(this.$t('userManage.files_delete_success'))
        this.fetchList()
      } catch (error) {
        this.$message.error(this.$t('userManage.files_delete_failure'))
      } finally {
        this.deleteLoadingId = null
      }
    },
    // 生成下载链接并触发浏览器下载
    async handleDownload(row) {
      if (!row) {
        return
      }
      if (!this.canDownload) {
        this.$message.warning(this.$t('userManage.files_permission_denied'))
        return
      }
      const fallbackUrl = row.download_url || row.preview_url
      if (!row.id && !fallbackUrl) {
        this.$message.warning(this.$t('userManage.files_download_missing'))
        return
      }
      this.downloadingId = row.id || null
      try {
        let url = fallbackUrl
        let filename = row.original_name || row.name
        if (row.id) {
          const { data } = await getUserFileDownload(row.id)
          if (data) {
            url = data.url || data.preview_url || url
            filename = data.filename || filename
          }
        }
        if (!url) {
          this.$message.warning(this.$t('userManage.files_download_missing'))
          return
        }
        this.triggerDownload(url, filename)
      } catch (error) {
        this.$message.error(this.$t('userManage.files_download_failed'))
      } finally {
        this.downloadingId = null
      }
    },
    // 判断文件是否支持预览
    hasPreview(row) {
      if (!row) {
        return false
      }
      const extension = (row.extension || '').toLowerCase()
      const previewable = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
      return extension ? previewable.includes(extension) : false
    },
    // 打开预览弹窗并加载预览地址
    async handlePreview(row) {
      if (!row) {
        return
      }
      if (!this.hasPreview(row)) {
        this.$message.warning(this.$t('userManage.detail_preview_unavailable'))
        return
      }
      if (!this.canDownload) {
        this.$message.warning(this.$t('userManage.files_permission_denied'))
        return
      }
      this.previewDialog.visible = true
      this.previewDialog.loading = true
      this.previewDialog.url = ''
      this.previewDialog.name = row.original_name || row.name || ''
      let previewUrl = row.preview_url
      try {
        if (!previewUrl && row.id) {
          const { data } = await getUserFileDownload(row.id)
          if (data) {
            previewUrl = data.preview_url || data.url || previewUrl
          }
        }
        if (!previewUrl) {
          this.previewDialog.visible = false
          this.$message.warning(this.$t('userManage.files_download_missing'))
          return
        }
        this.previewDialog.url = previewUrl
      } catch (error) {
        this.previewDialog.visible = false
        this.$message.error(this.$t('userManage.files_download_failed'))
        return
      } finally {
        this.previewDialog.loading = false
      }
    },
    // 重置预览弹窗状态
    resetPreviewDialog() {
      this.previewDialog.loading = false
      this.previewDialog.url = ''
      this.previewDialog.name = ''
    },
    // 创建隐藏链接触发原生下载
    triggerDownload(url, filename) {
      // 创建隐藏的 a 标签触发下载
      const link = document.createElement('a')
      link.style.display = 'none'
      link.href = url
      link.setAttribute('download', filename || 'download')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    // 更新后端返回的扩展名白名单
    updateAllowedExtensions(list) {
      if (!Array.isArray(list)) {
        return
      }
      const normalized = list
        .map(item => (item || '').toString().trim().toLowerCase())
        .filter(Boolean)
      this.allowedExtensions = Array.from(new Set(normalized))
    },
    // 从文件名中获取扩展名
    getFileExtension(name) {
      if (!name || typeof name !== 'string') {
        return ''
      }
      const parts = name.split('.')
      if (parts.length <= 1) {
        return ''
      }
      return parts.pop().toLowerCase()
    },
    // 判断扩展名是否允许
    isAllowedExtension(ext) {
      if (!ext) {
        return false
      }
      if (!this.allowedExtensions.length) {
        return true
      }
      return this.allowedExtensions.includes(ext.toLowerCase())
    }
  }
}
</script>

<style scoped>
.user-files-page .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.filters .el-input.filter-item {
  width: 220px;
}

.usage-alert {
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
}

.user-name {
  font-weight: 500;
}

.user-email {
  color: #909399;
  font-size: 12px;
}

.files-table .file-name {
  color: #409eff;
  cursor: pointer;
}

.files-table .file-name:hover {
  text-decoration: underline;
}

.file-preview {
  margin-left: 8px;
  font-size: 12px;
  padding: 0;
}

.action-button + .action-button {
  margin-left: 8px;
}

.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}

.upload-block {
  width: 100%;
}

.preview-container {
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.preview-image {
  max-height: 60vh;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.preview-error {
  padding: 40px;
  color: #909399;
  text-align: center;
}
</style>
