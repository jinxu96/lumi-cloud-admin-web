<template>
  <el-dialog
    :visible="visible"
    width="780px"
    append-to-body
    @close="handleClose"
  >
    <template #title>
      <span>{{ $t('userManage.dialog_detail') }}</span>
    </template>

    <div v-if="loading" class="detail-loading">
      <i class="el-icon-loading" />
      <span>{{ $t('userManage.detail_loading') }}</span>
    </div>

    <div v-else-if="detailData" class="detail-wrapper">
      <div class="detail-header">
        <el-avatar
          v-if="detailData.avatar"
          :src="detailData.avatar"
          size="large"
          class="detail-avatar"
        />
        <el-avatar v-else icon="el-icon-user" size="large" class="detail-avatar" />
        <div class="detail-header__info">
          <div class="detail-header__name">{{ detailData.name || '-' }}</div>
          <div class="detail-header__meta">
            <span>{{ detailData.email || '-' }}</span>
            <template v-if="registeredAt">
              <el-divider direction="vertical" />
              <span>{{ $t('userManage.detail_registered_at') }} {{ registeredAt }}</span>
            </template>
            <template v-if="lastLoginAt">
              <el-divider direction="vertical" />
              <span>{{ $t('userManage.detail_last_login_at') }} {{ lastLoginAt }}</span>
            </template>
          </div>
          <div v-if="profileNote" class="detail-header__note">
            {{ profileNote }}
          </div>
        </div>
      </div>

      <div v-if="statusTags.length" class="detail-status">
        <el-tag
          v-for="tag in statusTags"
          :key="tag.key"
          :type="tag.type"
          size="mini"
        >
          {{ tag.label }}：{{ tag.value }}
        </el-tag>
      </div>

      <div class="detail-meta-grid">
        <div
          v-for="metric in metricCards"
          :key="metric.key"
          class="meta-card"
        >
          <p>{{ metric.label }}</p>
          <strong>{{ metric.value }}</strong>
          <span v-if="metric.description" class="meta-card__desc">{{ metric.description }}</span>
        </div>
      </div>

      <div v-if="profileSummary" class="detail-note">
        <el-alert
          :title="$t('userManage.detail_summary')"
          :description="profileSummary"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <div class="detail-section">
        <h4>{{ $t('userManage.detail_projects') }}</h4>
        <div v-if="!recentProjects.length" class="detail-empty">
          <span>{{ $t('userManage.detail_empty') }}</span>
        </div>
        <el-timeline v-else>
          <el-timeline-item
            v-for="item in recentProjects"
            :key="item.id || item.title"
            :timestamp="item.updated_at || item.created_at"
          >
            <div class="timeline-title">{{ item.title || '-' }}</div>
            <div class="timeline-meta">
              {{ formatProjectStatus(item.status) }}
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>

      <div class="detail-section">
        <h4>{{ $t('userManage.detail_files') }}</h4>
        <div v-if="!processedFiles.length" class="detail-empty">
          <span>{{ $t('userManage.detail_empty') }}</span>
        </div>
        <el-table
          v-else
          :data="processedFiles"
          border
          size="small"
        >
          <el-table-column prop="name" :label="$t('userManage.detail_file_name')" min-width="180">
            <template slot-scope="{ row }">
              <span class="file-name" @click="handleDownload(row)">
                {{ row.original_name }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="mime_type" :label="$t('userManage.detail_file_mime')" width="160" />
          <el-table-column prop="size" :label="$t('userManage.detail_file_size')" width="140">
            <template slot-scope="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="created_at" :label="$t('userManage.detail_file_created')" width="180" />
          <el-table-column :label="$t('userManage.detail_file_actions')" width="160" align="center">
            <template slot-scope="{ row }">
              <div class="file-actions">
                <el-button
                  v-if="row.previewable"
                  type="text"
                  size="mini"
                  @click="handlePreview(row)"
                >
                  {{ $t('userManage.detail_preview_btn') }}
                </el-button>
                <el-button
                  type="text"
                  size="mini"
                  :loading="downloadStateId === row.id"
                  @click="handleDownload(row)"
                >
                  {{ $t('userManage.detail_download_btn') }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <div v-else class="detail-empty">
      <span>{{ $t('userManage.detail_empty') }}</span>
    </div>

    <el-dialog
      :visible.sync="preview.visible"
      width="60%"
      append-to-body
      class="file-preview-dialog"
      @close="handlePreviewClose"
    >
      <template #title>
        <span>{{ preview.fileName || $t('userManage.detail_preview_title') }}</span>
      </template>
      <div v-if="preview.type === 'image'" class="preview-body">
        <img :src="preview.url" :alt="preview.fileName" class="preview-image">
      </div>
      <div v-else-if="preview.type === 'video'" class="preview-body">
        <video :src="preview.url" controls class="preview-video" />
      </div>
      <div v-else class="preview-body preview-empty">
        <span>{{ $t('userManage.detail_preview_unavailable') }}</span>
      </div>
    </el-dialog>
  </el-dialog>
</template>

<script>
import { getUserFileDownload } from '@/api/userManage'

const CDN_DOMAIN = process.env.VUE_APP_FILES_CDN_DOMAIN || ''
const API_BASE = (process.env.VUE_APP_BASE_API || '').replace(/\/$/, '')

// 展示选中用户的详情信息以及最近文件列表。
export default {
  name: 'UserDetailDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Object,
      default: null
    },
    formatQuota: {
      type: Function,
      required: true
    },
    formatStorage: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      preview: {
        visible: false,
        url: '',
        type: '',
        fileName: '' // 记录当前预览文件名称，方便弹窗标题展示
      },
      downloadStateId: null
    }
  },
  computed: {
    detailData() {
      return this.data || null
    },
    registeredAt() {
      return this.detailData && this.detailData.created_at ? this.detailData.created_at : ''
    },
    lastLoginAt() {
      return this.detailData && this.detailData.last_login_at ? this.detailData.last_login_at : ''
    },
    profileNote() {
      if (!this.detailData) {
        return ''
      }
      const pieces = []
      if (this.detailData.id) {
        pieces.push(`#${this.detailData.id}`)
      }
      const extra = this.detailData.username_secondary || this.detailData.nickname || this.detailData.phone || ''
      if (extra) {
        pieces.push(extra)
      }
      return pieces.join(' · ')
    },
    profileSummary() {
      if (!this.detailData) {
        return ''
      }
      return this.detailData.summary || this.detailData.remark || ''
    },
    statusTags() {
      if (!this.detailData) {
        return []
      }
      const tags = [
        {
          key: 'email_verified',
          label: this.$t('userManage.table_email_verified'),
          value: this.detailData.email_verified ? this.$t('userManage.option_yes') : this.$t('userManage.option_no'),
          type: this.detailData.email_verified ? 'success' : 'info'
        },
        {
          key: 'google_binding',
          label: this.$t('userManage.table_google'),
          value: this.detailData.has_google_binding ? this.$t('userManage.option_yes') : this.$t('userManage.option_no'),
          type: this.detailData.has_google_binding ? 'success' : 'info'
        },
        {
          key: 'blocked',
          label: this.$t('userManage.table_blocked'),
          value: this.detailData.is_blocked ? this.$t('userManage.option_yes') : this.$t('userManage.option_no'),
          type: this.detailData.is_blocked ? 'danger' : 'success'
        }
      ]
      return tags
    },
    metricCards() {
      if (!this.detailData) {
        return []
      }
      return [
        {
          key: 'quota',
          label: this.$t('userManage.form_quota'),
          value: this.formatQuota(this.detailData.upload_quota_bytes)
        },
        {
          key: 'storage',
          label: this.$t('userManage.detail_storage_used'),
          value: this.formatStorage(this.detailData.storage_used_bytes)
        },
        {
          key: 'projects',
          label: this.$t('userManage.table_projects'),
          value: this.detailData.projects_count || 0
        },
        {
          key: 'files',
          label: this.$t('userManage.table_files'),
          value: this.detailData.files_count || 0
        },
        {
          key: 'likes',
          label: this.$t('userManage.detail_likes'),
          value: this.detailData.projects_likes_sum || 0
        },
        {
          key: 'downloads',
          label: this.$t('userManage.detail_downloads'),
          value: this.detailData.projects_downloads_sum || 0
        }
      ]
    },
    recentProjects() {
      if (!this.detailData || !Array.isArray(this.detailData.recent_projects)) {
        return []
      }
      return this.detailData.recent_projects
    },
    processedFiles() {
      if (!this.detailData || !Array.isArray(this.detailData.recent_files)) {
        return []
      }
      return this.detailData.recent_files.map(file => {
        const url = this.resolveFileUrl(file)
        return {
          ...file,
          downloadUrl: url,
          previewable: url && this.isPreviewable(file),
          previewType: this.detectPreviewType(file)
        }
      })
    }
  },
  methods: {
    // 关闭详情弹窗并通知父组件
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 将项目状态字段映射为可读文案
    formatProjectStatus(status) {
      if (!status) {
        return this.$t('userManage.detail_unknown_status')
      }
      const map = {
        published: this.$t('userManage.detail_project_published'),
        draft: this.$t('userManage.detail_project_draft'),
        archived: this.$t('userManage.detail_project_archived')
      }
      return map[status] || status
    },
    // 将字节数转换为易读的容量文本
    formatFileSize(size) {
      if (!size && size !== 0) {
        return '-'
      }
      const bytes = Number(size)
      if (Number.isNaN(bytes)) {
        return size
      }
      if (bytes < 1024) {
        return `${bytes} B`
      }
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`
      }
      if (bytes < 1024 * 1024 * 1024) {
        return `${(bytes / 1024 / 1024).toFixed(2)} MB`
      }
      return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`
    },
    // 调用签名接口并处理下载动作
    async handleDownload(file) {
      if (!file) {
        return
      }

      const stateKey = file.id || null
      if (stateKey) {
        this.downloadStateId = stateKey
      }

      let remoteMeta = null
      if (file.id) {
        try {
          const response = await getUserFileDownload(file.id)
          remoteMeta = response && response.data ? response.data : null
        } catch (error) {
          // 接口错误已由拦截器处理，走默认逻辑。
        }
      }

      const { endpoint, fallbackUrl, fallbackName } = this.getDownloadMeta(file, remoteMeta)
      if (!endpoint && !fallbackUrl) {
        this.$message.warning(this.$t('userManage.detail_download_missing'))
        if (stateKey) {
          this.downloadStateId = null
        }
        return
      }

      let fetchedSuccessfully = false
      try {
        if (endpoint) {
          if (!this.isSameOrigin(endpoint)) {
            this.triggerDownload(endpoint, fallbackName, true)
            fetchedSuccessfully = true
          } else {
            const response = await fetch(endpoint, { credentials: 'include' })
            if (!response.ok) {
              throw new Error(this.$t('userManage.detail_download_expired'))
            }
            const blob = await response.blob()
            const objectUrl = window.URL.createObjectURL(blob)
            const fileName = this.getFileNameFromHeaders(response.headers) || fallbackName
            this.triggerDownload(objectUrl, fileName || fallbackName, true)
            window.URL.revokeObjectURL(objectUrl)
            fetchedSuccessfully = true
          }
        }
      } catch (error) {
        if (!fallbackUrl) {
          const message = error && error.message ? error.message : this.$t('userManage.detail_download_failed')
          this.$message.error(message)
        }
      } finally {
        if (stateKey) {
          this.downloadStateId = null
        }
      }

      if (!fetchedSuccessfully && fallbackUrl) {
        this.triggerDownload(fallbackUrl, fallbackName, true)
      }
    },
    // 打开预览弹窗展示可预览的媒体文件
    handlePreview(file) {
      if (!file.previewable) {
        this.$message.info(this.$t('userManage.detail_preview_unavailable'))
        return
      }
      const url = file.downloadUrl || this.resolveFileUrl(file)
      if (!url) {
        this.$message.warning(this.$t('userManage.detail_preview_unavailable'))
        return
      }
      const previewType = file.previewType || this.detectPreviewType(file)
      const previewName = file.original_name || file.name || this.getDownloadFileName(file, url)
      this.preview = {
        visible: true,
        url,
        type: previewType,
        fileName: previewName
      }
    },
    // 关闭预览弹窗并重置状态
    handlePreviewClose() {
      this.preview.visible = false
      this.preview.url = ''
      this.preview.type = ''
      this.preview.fileName = ''
    },
    // 通过隐藏超链接触发浏览器下载
    triggerDownload(url, fileName, allowDownloadAttr = false) {
      // 使用临时创建的隐藏链接触发浏览器下载流程。
      const anchor = document.createElement('a')
      anchor.href = url
      if (allowDownloadAttr && fileName) {
        anchor.download = fileName
      }
      anchor.style.display = 'none'
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
    },
    // 汇总下载端点、兜底地址和展示文件名
    getDownloadMeta(file, remoteMeta) {
      const remoteUrl = remoteMeta && remoteMeta.url ? remoteMeta.url : ''
      const remotePreviewUrl = remoteMeta && remoteMeta.preview_url ? remoteMeta.preview_url : ''
      const remoteFilename = remoteMeta && remoteMeta.filename ? remoteMeta.filename : ''

      let fallbackUrl = remotePreviewUrl || ''
      if (!fallbackUrl) {
        fallbackUrl = file.downloadUrl || this.resolveFileUrl(file)
      }
      const fallbackName = remoteFilename || this.getPreferredFileName(file, fallbackUrl)
      const candidates = [
        remoteUrl,
        file.download_api,
        file.download_path,
        file.download_route,
        file.download_link,
        file.api_download,
        file.download_endpoint,
        file.download,
        file.downloadUrl,
        file.download_uri,
        file.download_url,
        file.download_api_url,
        file.internal_download_url
      ]
      const endpointRaw = candidates.find(item => item)
      return {
        endpoint: this.normalizeEndpoint(endpointRaw),
        fallbackUrl,
        fallbackName
      }
    },
    // 将接口返回的下载路径规范化为完整 URL
    normalizeEndpoint(endpoint) {
      if (!endpoint) {
        return ''
      }
      const trimmed = `${endpoint}`.trim()
      if (/^https?:\/\//i.test(trimmed)) {
        return trimmed
      }
      if (trimmed.startsWith('//')) {
        return `${window.location.protocol}${trimmed}`
      }
      if (API_BASE && trimmed.startsWith(API_BASE)) {
        return trimmed
      }
      const normalized = trimmed.replace(/^\/+/, '')
      if (trimmed.startsWith('/')) {
        return API_BASE ? `${API_BASE}/${normalized}` : `/${normalized}`
      }
      if (API_BASE) {
        return `${API_BASE}/${normalized}`
      }
      return `/${normalized}`
    },
    // 根据文件的备选字段构造预览/下载直链
    resolveFileUrl(file) {
      if (!file) {
        return ''
      }
      const candidates = [
        file.download_url,
        file.preview_url,
        file.url,
        file.full_url,
        file.link
      ]
      const found = candidates.find(item => item)
      if (found) {
        return found
      }
      const path = file.path || file.storage_path || file.key || file.name
      if (!path) {
        return ''
      }
      const normalizedPath = `${path}`.replace(/^\/+/, '')
      if (!CDN_DOMAIN) {
        return normalizedPath
      }
      return `${CDN_DOMAIN.replace(/\/$/, '')}/${normalizedPath}`
    },
    // 判断目标地址是否与当前站点同源
    isSameOrigin(target) {
      try {
        const parsed = new URL(target, window.location.origin)
        return parsed.origin === window.location.origin
      } catch (error) {
        return false
      }
    },
    // 判定文件是否属于可直接预览的图片或视频
    isPreviewable(file) {
      const mime = file && file.mime_type ? String(file.mime_type) : ''
      if (mime.startsWith('image/')) {
        return true
      }
      if (mime.startsWith('video/')) {
        return true
      }
      const name = file && file.name ? file.name.toLowerCase() : ''
      return ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].some(ext => name.endsWith(ext))
    },
    // 推断预览类型以匹配渲染控件
    detectPreviewType(file) {
      const mime = file && file.mime_type ? String(file.mime_type) : ''
      if (mime.startsWith('video/')) {
        return 'video'
      }
      if (mime.startsWith('image/')) {
        return 'image'
      }
      const name = file && file.name ? file.name.toLowerCase() : ''
      if (['.mp4', '.webm', '.mov', '.m4v'].some(ext => name.endsWith(ext))) {
        return 'video'
      }
      return 'unknown'
    },
    // 返回用于提示的文件名（优先对象字段）
    getDownloadFileName(file, url) {
      if (file && file.name) {
        return file.name
      }
      try {
        const pathname = new URL(url).pathname
        return pathname ? pathname.split('/').pop() : ''
      } catch (error) {
        return ''
      }
    },
    // 计算最终展示的文件名，尽量还原原始文件名
    getPreferredFileName(file, url) {
      if (file) {
        if (file.original_name) {
          return file.original_name
        }
        if (file.name) {
          return file.name
        }
      }
      return this.getDownloadFileName(file, url)
    },
    // 从响应头解析建议文件名，兼容 UTF-8 与 ASCII
    getFileNameFromHeaders(headers) {
      if (!headers) {
        return ''
      }
      const disposition = headers.get && headers.get('content-disposition')
      if (!disposition) {
        return ''
      }
      const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
      if (utf8Match && utf8Match[1]) {
        try {
          return decodeURIComponent(utf8Match[1])
        } catch (error) {
          return utf8Match[1]
        }
      }
      const asciiMatch = disposition.match(/filename="?([^";]+)"?/i)
      if (asciiMatch && asciiMatch[1]) {
        return asciiMatch[1]
      }
      return ''
    }
  }
}
</script>

<style scoped>
.detail-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-avatar {
  flex-shrink: 0;
}

.detail-header__info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-header__name {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
}

.detail-header__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: #606266;
}

.detail-header__meta >>> .el-divider--vertical {
  margin: 0 4px;
}

.detail-header__note {
  color: #909399;
}

.detail-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-meta-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.meta-card {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
}

.meta-card p {
  margin: 0;
  color: #909399;
  font-size: 13px;
}

.meta-card strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
}

.meta-card__desc {
  display: block;
  margin-top: 4px;
  color: #a0a3a6;
  font-size: 12px;
}

.detail-note {
  margin-top: -8px;
}

.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  color: #c0c4cc;
  background: #f8f9fb;
  border: 1px dashed #ebeef5;
  border-radius: 6px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-section h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.timeline-title {
  font-weight: 500;
}

.timeline-meta {
  color: #909399;
  font-size: 12px;
  margin-top: 2px;
}

.file-name {
  color: #409eff;
  cursor: pointer;
}

.file-name:hover {
  text-decoration: underline;
}

.file-preview-dialog ::v-deep .el-dialog__body {
  padding: 12px 20px 20px;
}

.preview-body {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  max-height: 60vh;
}

.preview-video {
  width: 100%;
  max-height: 60vh;
  outline: none;
}

.preview-empty {
  color: #909399;
  font-size: 14px;
}

.file-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
