<template>
  <el-drawer
    :visible.sync="innerVisible"
    :title="detailTitle"
    custom-class="template-detail-drawer"
    size="520px"
    @close="handleClose"
  >
    <div v-if="loading" class="detail-loading">
      <i class="el-icon-loading" />
      <span>{{ $t('templateLibrary.detail_loading') }}</span>
    </div>

    <div v-else-if="detailData" class="detail-body">
      <section class="detail-section detail-section--list detail-section--base">
        <h4>{{ $t('templateLibrary.detail_base') }}</h4>
        <ul>
          <li>
            <strong>{{ $t('templateLibrary.table_title') }}：</strong>
            <span>{{ detailData.title }}</span>
          </li>
          <li>
            <strong>{{ $t('templateLibrary.table_status') }}：</strong>
            <span>{{ formatStatus(detailData.status) }}</span>
          </li>
          <li>
            <strong>{{ $t('templateLibrary.detail_featured') }}：</strong>
            <span>{{ formatFeatured(detailData) }}</span>
          </li>
          <li>
            <strong>{{ $t('templateLibrary.table_author') }}：</strong>
            <span>{{ detailData.user ? detailData.user.name : '-' }}</span>
          </li>
          <li>
            <strong>{{ $t('templateLibrary.table_published_at') }}：</strong>
            <span>{{ detailData.published_at || '-' }}</span>
          </li>
          <li>
            <strong>{{ $t('templateLibrary.table_updated_at') }}：</strong>
            <span>{{ detailData.updated_at || '-' }}</span>
          </li>
        </ul>
      </section>

      <section v-if="detailData.description" class="detail-section">
        <h4>{{ $t('templateLibrary.detail_description') }}</h4>
        <div class="detail-rich" v-html="detailData.description" />
      </section>

      <section v-if="detailData.tags && detailData.tags.length" class="detail-section detail-section--list">
        <h4>{{ $t('templateLibrary.table_tags') }}</h4>
        <el-tag
          v-for="tag in detailData.tags"
          :key="tag"
          class="tag-chip"
          type="info"
          size="mini"
        >
          {{ tag }}
        </el-tag>
      </section>

      <section v-if="detailData.machine_modules && detailData.machine_modules.length" class="detail-section detail-section--list">
        <h4>{{ $t('templateLibrary.detail_machine_modules') }}</h4>
        <ul>
          <li v-for="(item, index) in detailData.machine_modules" :key="item.id">
            <span class="detail-index">{{ index + 1 }}</span>
            <span class="detail-value">{{ item.name }}<span v-if="item.machine">（{{ item.machine.name }}）· {{ item.power_watt }}w</span></span>
          </li>
        </ul>
      </section>

      <section v-if="detailData.materials && detailData.materials.length" class="detail-section detail-section--list">
        <h4>{{ $t('templateLibrary.detail_materials') }}</h4>
        <ul>
          <li v-for="(item, index) in detailData.materials" :key="item.id">
            <span class="detail-index">{{ index + 1 }}</span>
            <span class="detail-value">{{ item.name }}</span>
          </li>
        </ul>
      </section>

      <section v-if="detailData.scenarios && detailData.scenarios.length" class="detail-section detail-section--list">
        <h4>{{ $t('templateLibrary.detail_scenarios') }}</h4>
        <ul>
          <li v-for="(item, index) in detailData.scenarios" :key="item.id">
            <span class="detail-index">{{ index + 1 }}</span>
            <span class="detail-value">{{ item.name }}</span>
          </li>
        </ul>
      </section>

      <section v-if="detailData.media && detailData.media.length" class="detail-section detail-section--media">
        <h4>{{ $t('templateLibrary.detail_media') }}</h4>
        <div class="media-grid">
          <div v-for="item in detailData.media" :key="item.id || item.url" class="media-card">
            <template v-if="item.media_type === 'image'">
              <el-image
                :src="item.url"
                fit="cover"
                :preview-src-list="imagePreviewList"
                :initial-index="getImagePreviewIndex(item)"
              />
            </template>
            <template v-else>
              <video :src="item.url" controls />
            </template>
            <div class="media-caption">
              <span class="media-title">{{ item.title || '-' }}</span>
              <span class="media-desc">{{ item.caption || '' }}</span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="detailData.file" class="detail-section detail-section--file">
        <h4>{{ $t('templateLibrary.detail_file') }}</h4>
        <div class="file-row">
          <span>{{ detailData.file.original_name || detailData.file.name || '-' }}</span>
          <el-button
            v-if="detailData.file.download_url"
            type="text"
            size="mini"
            @click="openDownload(detailData.file.download_url)"
          >
            {{ $t('templateLibrary.detail_download_file') }}
          </el-button>
        </div>
      </section>
    </div>

    <div v-else class="detail-empty">
      <span>{{ $t('templateLibrary.detail_empty') }}</span>
    </div>
  </el-drawer>
</template>

<script>
// 模板详情抽屉，展示扩展信息及关联资源
export default {
  name: 'TemplateDetailDrawer',
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
    }
  },
  data() {
    return {
      innerVisible: this.visible
    }
  },
  computed: {
    // 统一处理详情数据，避免空引用
    detailData() {
      return this.data || null
    },
    // 动态拼接抽屉标题，展示模板名
    detailTitle() {
      if (!this.detailData) {
        return this.$t('templateLibrary.detail_title')
      }
      return `${this.$t('templateLibrary.detail_title')} · ${this.detailData.title}`
    },
    // 提取图片类型素材，用于预览
    imageMediaList() {
      if (!this.detailData || !Array.isArray(this.detailData.media)) {
        return []
      }
      return this.detailData.media.filter(item => item && item.media_type === 'image' && item.url)
    },
    // 生成预览地址列表，传递给 el-image
    imagePreviewList() {
      return this.imageMediaList.map(item => item.url)
    }
  },
  watch: {
    // 外部可见状态变化时同步到内部变量
    visible(newVal) {
      this.innerVisible = newVal
    }
  },
  methods: {
    // 关闭抽屉并通知父组件
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 映射状态字段为易读文案
    formatStatus(status) {
      return status === 'published'
        ? this.$t('templateLibrary.status_published')
        : this.$t('templateLibrary.status_draft')
    },
    // 根据推荐状态输出权重信息
    formatFeatured(detail) {
      if (!detail || !detail.is_featured) {
        return this.$t('templateLibrary.option_no')
      }
      const weight = detail.featured_weight || 0
      return `${this.$t('templateLibrary.option_yes')}（${this.$t('templateLibrary.table_featured_weight')} ${weight}）`
    },
    // 打开附件下载链接
    openDownload(url) {
      window.open(url, '_blank')
    },
    // 根据素材定位预览初始索引
    getImagePreviewIndex(item) {
      if (!item || !item.url) {
        return 0
      }
      const index = this.imageMediaList.findIndex(media => {
        if (item.id && media.id) {
          return item.id === media.id
        }
        return media.url === item.url
      })
      return index >= 0 ? index : 0
    }
  }
}
</script>

<style scoped>
.template-detail-drawer ::v-deep .el-drawer__wrapper {
  height: 100%;
}

.template-detail-drawer ::v-deep .el-drawer {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-detail-drawer ::v-deep .el-drawer__header {
  flex-shrink: 0;
}

.template-detail-drawer ::v-deep .el-drawer__body {
  padding: 20px 24px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
}

.detail-loading,
.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #909399;
  height: 200px;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-height: calc(100vh - 160px);
  overflow-y: auto;
  padding-right: 6px;
  box-sizing: border-box;
}

.detail-section {
  background: #fafbfc;
  border: 1px solid #eff2f7;
  border-radius: 6px;
  padding: 14px 18px;
  box-sizing: border-box;
  width: 100%;
}

.detail-section.detail-section--media {
  padding-bottom: 20px;
}

.detail-section.detail-section--file {
  padding-bottom: 12px;
}

.detail-section h4 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #2f3748;
}

.detail-section,
.detail-section li,
.detail-section .detail-value,
.detail-section strong {
  font-size: 13px;
}

.detail-section ul {
  margin: 0;
  padding: 0;
  list-style: none;
  color: #606266;
  width: 100%;
  box-sizing: border-box;
}

.detail-section li {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
  padding: 8px 12px;
  align-items: center;
}

.detail-section--base li {
  grid-template-columns: 140px 1fr;
}

.detail-section--list:not(.detail-section--base) li {
  grid-template-columns: 48px 1fr;
}

.detail-section--list ul {
  border: 1px solid #eef1f6;
  border-radius: 6px;
  overflow: hidden;
}

.detail-section--list li:nth-child(odd) {
  background: #ffffff;
}

.detail-section--list li:nth-child(even) {
  background: #f6f8fc;
}

.detail-section li strong {
  font-weight: 600;
  color: #303133;
}

.detail-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  background: rgba(64, 158, 255, 0.12);
  color: #409eff;
  font-weight: 600;
}

.detail-value {
  color: #303133;
}

.detail-section li span,
.detail-section li strong + span {
  word-break: break-word;
}

.detail-rich {
  background: #f5f7fa;
  padding: 12px;
  border-radius: 6px;
  color: #606266;
}

.tag-chip {
  margin-right: 6px;
  margin-bottom: 6px;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 12px;
}

.media-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.media-card .el-image,
.media-card video {
  width: 100%;
  height: 100px;
  object-fit: cover;
}

.media-caption {
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #606266;
}

.media-title {
  font-weight: 600;
}

.file-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 10px 12px;
}
</style>
