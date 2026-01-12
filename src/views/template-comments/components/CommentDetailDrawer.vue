<template>
  <div class="comment-detail-wrapper">
    <el-drawer
      :visible.sync="innerVisible"
      size="520px"
      :title="drawerTitle"
      custom-class="comment-detail-drawer"
      @close="handleClose"
    >
      <div v-if="loading" class="detail-loading">
        <i class="el-icon-loading" />
        <span>{{ $t('templateComments.detail_loading') }}</span>
      </div>

      <div v-else-if="detail" class="detail-body">
        <!-- 基础信息卡片 -->
        <section class="card-block">
          <div class="card-header">
            <h4 class="card-title">{{ $t('templateComments.detail_basic') }}</h4>
            <el-dropdown v-if="hasMenuPermission" trigger="hover" placement="bottom-end" @command="handleAction">
              <button class="dropdown-button">
                <i class="el-icon-more" />
              </button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-if="!detail.is_deleted_by_admin && canDelete" command="delete" icon="el-icon-delete">
                  {{ $t('templateComments.action_delete') }}
                </el-dropdown-item>
                <el-dropdown-item v-if="detail.is_deleted_by_admin && canRestore" command="restore" icon="el-icon-refresh-left">
                  {{ $t('templateComments.action_restore') }}
                </el-dropdown-item>
                <el-dropdown-item v-if="canPin" :command="detail.is_pinned ? 'unpin' : 'pin'" icon="el-icon-top">
                  {{ detail.is_pinned ? $t('templateComments.action_unpin') : $t('templateComments.action_pin') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </div>
          <div class="card-body">
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">ID</span>
                <span class="info-value">{{ detail.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('templateComments.table_project') }}</span>
                <span class="info-value">{{ detail.project ? detail.project.title : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('templateComments.table_user') }}</span>
                <span class="info-value">{{ detail.user ? detail.user.name : '-' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('templateComments.table_status') }}</span>
                <span class="info-value">
                  <el-tag :type="detail.is_deleted_by_admin ? 'danger' : detail.is_deleted_by_owner ? 'info' : 'success'" size="mini">
                    {{ formatStatus(detail) }}
                  </el-tag>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('templateComments.table_created_at') }}</span>
                <span class="info-value minor-text">{{ detail.created_at || '-' }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 评论内容卡片 -->
        <section v-if="detail.content" class="card-block">
          <div class="card-header">
            <h4 class="card-title">{{ $t('templateComments.detail_content') }}</h4>
          </div>
          <div class="card-body">
            <p class="detail-content">{{ detail.content }}</p>
          </div>
        </section>

        <!-- 评论图片卡片 -->
        <section v-if="Array.isArray(detail.images) && detail.images.length" class="card-block">
          <div class="card-header">
            <h4 class="card-title">{{ $t('templateComments.detail_images') }}</h4>
          </div>
          <div class="card-body">
            <div class="image-list">
              <el-image
                v-for="(item, idx) in detail.images"
                :key="idx"
                :src="item"
                fit="cover"
                :preview-src-list="detail.images"
              />
            </div>
          </div>
        </section>

        <!-- 回复列表卡片 -->
        <section v-if="repliesTotal > 0 || repliesLoading" class="card-block replies-card">
          <div class="card-header">
            <h4 class="card-title">{{ $t('templateComments.detail_replies') }}</h4>
            <div class="card-tools">
              <span class="replies-progress">{{ $t('templateComments.replies_progress', { shown: repliesList.length, total: repliesTotal }) }}</span>
            </div>
          </div>
          <div class="card-body">
            <div v-if="repliesLoading && repliesList.length === 0" class="replies-loading">
              <i class="el-icon-loading" />
              <span>{{ $t('templateComments.replies_loading') }}</span>
            </div>
            <div v-if="repliesList.length > 0" class="replies-list scrollable">
              <div class="replies-grid">
                <div v-for="reply in repliesList" :key="reply.id" class="reply-card">
                  <!-- 头部：头像 + 元信息 + 操作图标 -->
                  <div class="reply-header">
                    <div class="reply-meta">
                      <el-avatar v-if="reply.user && reply.user.avatar" :src="reply.user.avatar" size="small" class="reply-avatar" />
                      <el-avatar v-else size="small" class="reply-avatar">{{ avatarText(reply.user) }}</el-avatar>
                      <span class="reply-author">{{ reply.user ? reply.user.name : '匿名用户' }}</span>
                      <span class="reply-id">#{{ reply.id }}</span>
                    </div>
                    <div class="reply-tools">
                      <span class="reply-time">{{ reply.created_at || '-' }}</span>
                      <el-dropdown
                        v-if="canReply || reply.replies_count > 0"
                        trigger="click"
                        placement="bottom-end"
                        @command="command => handleReplyAction(command, reply)"
                      >
                        <button class="reply-more-trigger">
                          <i class="el-icon-more" />
                        </button>
                        <el-dropdown-menu slot="dropdown">
                          <el-dropdown-item
                            v-if="canReply"
                            command="reply"
                            icon="el-icon-chat-dot-round"
                          >
                            {{ $t('templateComments.action_reply_to') }}
                          </el-dropdown-item>
                          <el-dropdown-item
                            v-if="reply.replies_count > 0"
                            command="view-thread"
                            icon="el-icon-view"
                          >
                            {{ $t('templateComments.action_view_children', { count: reply.replies_count }) }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </el-dropdown>
                    </div>
                  </div>

                  <!-- 内容与图片 -->
                  <div class="reply-body">
                    <p v-if="reply.content || reply.content_excerpt" class="reply-content">
                      {{ reply.content || reply.content_excerpt }}
                    </p>
                    <div v-if="Array.isArray(reply.images) && reply.images.length" class="reply-images">
                      <el-image
                        v-for="(img, idx) in reply.images"
                        :key="idx"
                        :src="img"
                        fit="cover"
                        :preview-src-list="reply.images"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="repliesTotal > 0" class="replies-actions">
              <el-button
                v-if="hasMoreReplies"
                type="text"
                size="mini"
                :loading="repliesLoading"
                @click="loadMoreReplies"
              >
                {{ $t('templateComments.replies_more') }}
              </el-button>
            </div>
          </div>
        </section>

        <!-- 快速回复 -->
        <section v-if="canReply" ref="quickReplySection" class="card-block quick-reply-card">
          <div class="card-header">
            <h4 class="card-title">
              {{ $t('templateComments.quick_reply_title') }}
              <span v-if="replyTarget" class="reply-target-hint">
                回复 @{{ replyTarget.user ? replyTarget.user.name : '匿名用户' }}
                <i class="el-icon-close" @click="clearReplyTarget" />
              </span>
            </h4>
          </div>
          <div class="card-body">
            <el-input
              ref="replyTextarea"
              v-model="replyForm.content"
              type="textarea"
              :rows="3"
              :placeholder="$t('templateComments.quick_reply_placeholder')"
              maxlength="500"
              show-word-limit
            />
            <div class="reply-actions">
              <el-button size="small" @click="resetReplyForm">{{ $t('templateComments.action_cancel') }}</el-button>
              <el-button type="primary" size="small" :loading="replySubmitting" @click="submitQuickReply">
                {{ $t('templateComments.action_reply') }}
              </el-button>
            </div>
          </div>
        </section>
      </div>

      <div v-else class="detail-empty">
        <span>{{ $t('templateComments.detail_empty') }}</span>
      </div>
    </el-drawer>

    <reply-thread-dialog
      :visible.sync="threadDialog.visible"
      :parent-reply="threadDialog.parent"
      :project-id="detail && detail.project ? detail.project.id : null"
      :reply-handler="handleThreadReply"
      :can-back="threadDialog.stack.length > 0"
      @open-nested="openNestedThread"
      @go-back="handleThreadBack"
    />
  </div>
</template>

<script>
import { getProjectTemplateComments, createProjectTemplateComment } from '@/api/projectTemplateComments'
import checkPermission from '@/utils/permission'
import ReplyThreadDialog from './ReplyThreadDialog.vue'

// 评论详情抽屉
export default {
  name: 'CommentDetailDrawer',
  components: {
    ReplyThreadDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    record: {
      type: Object,
      default: null
    },
    replyHandler: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      innerVisible: this.visible,
      // 回复列表状态
      repliesList: [],
      repliesLoading: false,
      repliesPage: 1,
      repliesLimit: 20,
      repliesTotal: 0,
      // 快速回复表单
      replyForm: {
        content: ''
      },
      replySubmitting: false,
      replyTarget: null, // 回复目标（用于回复回复）
      threadDialog: {
        visible: false,
        parent: null,
        stack: []
      }
    }
  },
  computed: {
    detail() {
      return this.record || null
    },
    drawerTitle() {
      if (!this.detail) return this.$t('templateComments.detail_title')
      return `${this.$t('templateComments.detail_title')} · #${this.detail.id}`
    },
    // 是否还有更多回复待加载
    hasMoreReplies() {
      return this.repliesList.length < this.repliesTotal
    },
    // 菜单权限判断
    hasMenuPermission() {
      return this.canDelete || this.canRestore || this.canPin
    },
    canDelete() {
      return checkPermission(['app-admin.project-template-comments.destroy'])
    },
    canRestore() {
      return checkPermission(['app-admin.project-template-comments.restore'])
    },
    canPin() {
      return checkPermission(['app-admin.project-template-comments.pin'])
    },
    canReply() {
      return checkPermission(['app-admin.project-template-comments.store'])
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
      if (val && this.detail) {
        this.fetchReplies()
      }
      if (!val) {
        this.threadDialog.visible = false
        this.threadDialog.parent = null
        this.threadDialog.stack = []
      }
    },
    // 记录变化时重置回复并拉取
    record(newVal) {
      if (newVal && newVal.id) {
        this.resetReplies()
        this.fetchReplies()
      }
    },
    'threadDialog.visible'(val) {
      if (!val) {
        this.threadDialog.parent = null
        this.threadDialog.stack = []
      }
    }
  },
  methods: {
    // 统一状态文案
    formatStatus(row) {
      if (row.is_deleted_by_admin) return this.$t('templateComments.status_deleted_by_admin')
      if (row.is_deleted_by_owner) return this.$t('templateComments.status_deleted_by_owner')
      return this.$t('templateComments.status_normal')
    },
    // 头像占位字符（用户首字或问号）
    avatarText(user) {
      const name = user && user.name ? String(user.name).trim() : ''
      return name ? name.charAt(0) : '?'
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 重置回复列表状态
    resetReplies() {
      this.repliesList = []
      this.repliesPage = 1
      this.repliesTotal = 0
    },
    // 从列表接口拉取回复
    async fetchReplies() {
      if (!this.detail || !this.detail.id) return
      this.repliesLoading = true
      try {
        const params = {
          parent_id: this.detail.id,
          start: (this.repliesPage - 1) * this.repliesLimit,
          limit: this.repliesLimit,
          order: 'created_at__ASC'
        }
        const { data } = await getProjectTemplateComments(params)
        const newReplies = (data && data.list) || []
        this.repliesList = this.mergeReplies(this.repliesList, newReplies)
        this.repliesTotal = (data && data.total) || 0
      } catch (error) {
        this.$message.error(this.$t('templateComments.toast_replies_failed'))
      } finally {
        this.repliesLoading = false
      }
    },
    // 加载更多回复
    loadMoreReplies() {
      this.repliesPage += 1
      this.fetchReplies()
    },
    // 处理卡片操作菜单命令
    handleAction(command) {
      this.$emit('action', { command, record: this.detail })
    },
    // 重置回复表单
    resetReplyForm() {
      this.replyForm.content = ''
      this.replyTarget = null
    },
    // 处理回复操作
    handleReplyAction(command, reply) {
      if (command === 'reply') {
        this.replyTarget = reply
        this.$nextTick(() => {
          // 滚动到快速回复区
          if (this.$refs.quickReplySection) {
            this.$refs.quickReplySection.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          // 聚焦输入框
          if (this.$refs.replyTextarea && this.$refs.replyTextarea.$el) {
            const textarea = this.$refs.replyTextarea.$el.querySelector('textarea')
            if (textarea) textarea.focus()
          }
        })
      } else if (command === 'view-thread') {
        this.threadDialog.parent = reply
        this.threadDialog.stack = []
        this.threadDialog.visible = true
      }
    },
    // 清除回复目标
    clearReplyTarget() {
      this.replyTarget = null
    },
    // 提交快速回复
    async submitQuickReply() {
      if (!this.replyForm.content.trim()) {
        this.$message.warning(this.$t('templateComments.quick_reply_required'))
        return
      }
      if (!this.canReply) {
        this.$message.error(this.$t('common.no_permission'))
        return
      }
      this.replySubmitting = true
      try {
        const payload = {
          project_id: this.detail.project ? this.detail.project.id : null,
          // 如果有 replyTarget，说明是回复某条回复，parent_id 传该回复的 id
          // 否则是回复顶级评论，parent_id 传顶级评论的 id
          parent_id: this.replyTarget ? this.replyTarget.id : this.detail.id,
          content: this.replyForm.content.trim()
        }
        await this.invokeReply(payload)
        this.resetReplyForm()
        // 刷新回复列表
        this.resetReplies()
        await this.fetchReplies()
        this.$message.success(this.$t('templateComments.toast_reply_success'))
      } catch (error) {
        this.$message.error(error.message || this.$t('templateComments.toast_reply_failed'))
      } finally {
        this.replySubmitting = false
      }
    },
    async invokeReply(payload) {
      if (this.replyHandler) {
        return this.replyHandler(payload)
      }
      return createProjectTemplateComment(payload)
    },
    async handleThreadReply(payload) {
      await this.invokeReply(payload)
      this.resetReplies()
      await this.fetchReplies()
    },
    openNestedThread(reply) {
      if (!reply) return
      if (this.threadDialog.parent) {
        this.threadDialog.stack.push(this.threadDialog.parent)
      }
      this.threadDialog.parent = reply
      this.threadDialog.visible = true
    },
    handleThreadBack() {
      if (!this.threadDialog.stack.length) return
      const previous = this.threadDialog.stack.pop()
      this.threadDialog.parent = previous
    },
    mergeReplies(existing, incoming) {
      const order = []
      const map = new Map()
      const append = list => {
        if (!Array.isArray(list)) return
        list.forEach(item => {
          if (!item) return
          const hasId = Object.prototype.hasOwnProperty.call(item, 'id') && item.id !== null && item.id !== undefined
          if (hasId) {
            const key = `id-${item.id}`
            if (!map.has(key)) {
              order.push(key)
            }
            map.set(key, item)
          } else {
            const key = `anon-${order.length}`
            order.push(key)
            map.set(key, item)
          }
        })
      }
      append(existing)
      append(incoming)
      return order.map(key => map.get(key))
    }
  }
}
</script>

<style scoped>
.detail-loading,
.detail-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #909399;
  gap: 8px;
}

/* 抽屉内容容器 - 支持滚动 */
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}
.detail-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}
.card-block {
  background: #fafafa;
  border: 1px solid #e8f4ff;
  border-left: 3px solid #1890ff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(24,144,255,0.08);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
}
.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}
/* 下拉菜单按钮 */
.dropdown-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  margin: -4px -8px;
  color: #666;
  font-size: 18px;
  transition: color 0.2s;
  position: relative;
  z-index: 10;
}
.dropdown-button:hover {
  color: #1890ff;
}
.card-actions {
  cursor: pointer;
  color: #666;
  font-size: 18px;
  padding: 4px 8px;
  margin: -4px -8px;
  transition: color 0.2s;
  position: relative;
  z-index: 10;
}
.card-actions:hover {
  color: #1890ff;
}
.card-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.card-actions {
  cursor: pointer;
  color: #666;
  font-size: 18px;
  padding: 4px;
  transition: color 0.2s;
}
.card-actions:hover {
  color: #1890ff;
}
.card-body {
  padding: 12px;
}
.info-list {
  display: flex;
  flex-direction: column;
}
.info-item {
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}
.info-item:last-child {
  border-bottom: none;
}
.info-label {
  width: 120px;
  flex-shrink: 0;
  color: #666;
  font-size: 13px;
  font-weight: 500;
}
.info-value {
  flex: 1;
  color: #333;
  font-size: 13px;
}
.minor-text {
  color: #999;
}
.detail-content {
  white-space: pre-wrap;
  line-height: 22px;
}
.image-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}
.replies-card .card-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.replies-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.scrollable {
  max-height: 340px;
  overflow: auto;
}
/* 回复网格 - 双列布局 */
.replies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  grid-auto-flow: dense;
}

/* 回复卡片 */
.reply-card {
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  transition: box-shadow 0.2s;
}

.reply-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 回复头部 - 用户信息和时间 */
.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}

.reply-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}
.reply-avatar {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  font-weight: 600;
}
.reply-tools {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #c0c4cc;
}

.reply-more-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: #c0c4cc;
  padding: 4px;
  margin: -4px;
  font-size: 16px;
  transition: color 0.2s;
}

.reply-more-trigger:hover {
  color: #1890ff;
}

.reply-author {
  font-weight: 500;
  color: #303133;
  font-size: 13px;
}

.reply-id {
  color: #909399;
  font-size: 12px;
}

.reply-time {
  color: #c0c4cc;
  font-size: 12px;
}

/* 回复内容和图片区 */
.reply-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-content {
  margin: 0;
  font-size: 13px;
  color: #606266;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}

.reply-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}
.replies-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.replies-progress {
  color: #909399;
  font-size: 12px;
}
.replies-loading {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
  font-size: 12px;
  padding: 8px 0;
}

/* 快速回复 */
.quick-reply-card {
  border-left-color: #52c41a;
}
.reply-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
