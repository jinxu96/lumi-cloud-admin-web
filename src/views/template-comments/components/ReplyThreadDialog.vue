<template>
  <el-dialog
    :visible.sync="innerVisible"
    width="640px"
    :title="dialogTitle"
    custom-class="reply-thread-dialog"
    @close="handleClose"
  >
    <div v-if="!parentReply" class="thread-empty">
      <i class="el-icon-info" />
      <span>{{ $t('templateComments.thread_no_parent') }}</span>
    </div>

    <div v-else class="thread-container">
      <div v-if="canBack" class="thread-toolbar">
        <el-button type="text" size="mini" icon="el-icon-back" @click="$emit('go-back')">
          {{ $t('templateComments.thread_back') }}
        </el-button>
      </div>
      <section class="thread-parent">
        <h4 class="thread-section-title">{{ $t('templateComments.thread_parent') }}</h4>
        <div class="thread-card is-parent">
          <div class="thread-meta">
            <el-avatar v-if="parentReply.user && parentReply.user.avatar" :src="parentReply.user.avatar" size="small" />
            <el-avatar v-else size="small" class="avatar-fallback">{{ avatarText(parentReply.user) }}</el-avatar>
            <div class="meta-main">
              <span class="meta-author">{{ parentReply.user ? parentReply.user.name : '匿名用户' }}</span>
              <span class="meta-time">{{ parentReply.created_at || '-' }}</span>
            </div>
            <span class="meta-id">#{{ parentReply.id }}</span>
          </div>
          <div class="thread-content">
            <p v-if="parentReply.content || parentReply.content_excerpt" class="thread-text">
              {{ parentReply.content || parentReply.content_excerpt }}
            </p>
            <div v-if="Array.isArray(parentReply.images) && parentReply.images.length" class="thread-images">
              <el-image
                v-for="(img, idx) in parentReply.images"
                :key="idx"
                :src="img"
                fit="cover"
                :preview-src-list="parentReply.images"
              />
            </div>
          </div>
        </div>
      </section>

      <section class="thread-children">
        <h4 class="thread-section-title">
          {{ $t('templateComments.thread_children') }}
          <span class="thread-count">{{ threadTotal }}</span>
        </h4>
        <div v-if="threadLoading && threadReplies.length === 0" class="thread-state">
          <i class="el-icon-loading" />
          <span>{{ $t('templateComments.thread_loading') }}</span>
        </div>
        <div v-else-if="threadReplies.length === 0" class="thread-state">
          <i class="el-icon-chat-dot-round" />
          <span>{{ $t('templateComments.thread_empty') }}</span>
        </div>
        <div v-else class="thread-list">
          <div v-for="item in threadReplies" :key="item.id" class="thread-card">
            <div class="thread-meta">
              <el-avatar v-if="item.user && item.user.avatar" :src="item.user.avatar" size="small" />
              <el-avatar v-else size="small" class="avatar-fallback">{{ avatarText(item.user) }}</el-avatar>
              <div class="meta-main">
                <span class="meta-author">{{ item.user ? item.user.name : '匿名用户' }}</span>
                <span class="meta-time">{{ item.created_at || '-' }}</span>
              </div>
              <span class="meta-id">#{{ item.id }}</span>
            </div>
            <div class="thread-content">
              <p v-if="item.content || item.content_excerpt" class="thread-text">
                {{ item.content || item.content_excerpt }}
              </p>
              <div v-if="Array.isArray(item.images) && item.images.length" class="thread-images">
                <el-image
                  v-for="(img, idx) in item.images"
                  :key="idx"
                  :src="img"
                  fit="cover"
                  :preview-src-list="item.images"
                />
              </div>
            </div>
            <div v-if="canReply" class="thread-actions">
              <el-button type="text" size="mini" @click="replyTo(item)">
                {{ $t('templateComments.action_reply_to') }}
              </el-button>
              <el-button
                v-if="item.replies_count > 0"
                type="text"
                size="mini"
                @click="openNested(item)"
              >
                {{ $t('templateComments.action_view_children', { count: item.replies_count }) }}
              </el-button>
            </div>
          </div>
          <div v-if="hasMore" class="thread-pagination">
            <el-button type="text" size="mini" :loading="threadLoading" @click="loadMore">
              {{ $t('templateComments.replies_more') }}
            </el-button>
          </div>
        </div>
      </section>

      <section v-if="canReply" class="thread-quick-reply">
        <h4 class="thread-section-title">
          {{ $t('templateComments.quick_reply_title') }}
          <span v-if="replyTarget" class="thread-target">@{{ replyTarget.user ? replyTarget.user.name : '匿名用户' }}</span>
        </h4>
        <el-input
          ref="threadTextarea"
          v-model="form.content"
          type="textarea"
          :rows="4"
          :placeholder="$t('templateComments.quick_reply_placeholder')"
          maxlength="500"
          show-word-limit
        />
        <div class="thread-reply-actions">
          <el-button size="small" @click="handleCancel">{{ $t('templateComments.action_cancel') }}</el-button>
          <el-button type="primary" size="small" :loading="submitting" @click="submit">
            {{ $t('templateComments.action_reply') }}
          </el-button>
        </div>
      </section>
    </div>
  </el-dialog>
</template>

<script>
import { getProjectTemplateComments } from '@/api/projectTemplateComments'
import checkPermission from '@/utils/permission'

export default {
  name: 'ReplyThreadDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    parentReply: {
      type: Object,
      default: null
    },
    projectId: {
      type: [Number, String],
      default: null
    },
    replyHandler: {
      type: Function,
      default: null
    },
    canBack: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      innerVisible: this.visible,
      threadReplies: [],
      threadTotal: 0,
      threadPage: 1,
      threadLimit: 20,
      threadLoading: false,
      submitting: false,
      form: {
        content: ''
      },
      replyTarget: null
    }
  },
  computed: {
    dialogTitle() {
      if (!this.parentReply) return this.$t('templateComments.thread_title')
      return `${this.$t('templateComments.thread_title')} · #${this.parentReply.id}`
    },
    canReply() {
      return checkPermission(['app-admin.project-template-comments.store'])
    },
    hasMore() {
      return this.threadReplies.length < this.threadTotal
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    innerVisible(val) {
      if (val) {
        this.initThread()
      } else {
        this.resetState()
        this.$emit('update:visible', false)
      }
    },
    parentReply() {
      if (this.innerVisible) {
        this.initThread(true)
      }
    }
  },
  methods: {
    // 关闭弹窗
    handleClose() {
      this.innerVisible = false
    },
    // 初始化回复线程
    // @param {boolean} force - 是否强制重置状态
    initThread(force = false) {
      if (!this.parentReply) return
      if (force) {
        this.resetState()
      }
      if (this.threadReplies.length === 0) {
        this.fetchReplies()
      }
    },
    // 重置所有状态到初始值
    resetState() {
      this.threadReplies = []
      this.threadTotal = 0
      this.threadPage = 1
      this.form.content = ''
      this.replyTarget = null
    },
    // 从接口拉取子回复列表
    async fetchReplies() {
      if (!this.parentReply) return
      this.threadLoading = true
      try {
        const params = {
          parent_id: this.parentReply.id,
          start: (this.threadPage - 1) * this.threadLimit,
          limit: this.threadLimit,
          order: 'created_at__ASC'
        }
        const { data } = await getProjectTemplateComments(params)
        const list = (data && data.list) || []
        this.threadReplies = this.mergeReplies(this.threadReplies, list)
        this.threadTotal = (data && data.total) || 0
      } catch (error) {
        this.$message.error(this.$t('templateComments.thread_load_failed'))
      } finally {
        this.threadLoading = false
      }
    },
    // 加载更多回复（分页）
    loadMore() {
      this.threadPage += 1
      this.fetchReplies()
    },
    // 获取头像占位符文本（取用户名首字母）
    // @param {Object} user - 用户对象
    // @returns {string} 头像文本
    avatarText(user) {
      const name = user && user.name ? String(user.name).trim() : ''
      return name ? name.charAt(0) : '?'
    },
    // 设置回复目标并聚焦输入框
    // @param {Object} item - 要回复的评论对象
    replyTo(item) {
      this.replyTarget = item
      this.$nextTick(() => {
        if (this.$refs.threadTextarea && this.$refs.threadTextarea.$el) {
          const textarea = this.$refs.threadTextarea.$el.querySelector('textarea')
          if (textarea) textarea.focus()
        }
      })
    },
    // 打开嵌套的子回复线程
    // @param {Object} item - 要查看子回复的评论对象
    openNested(item) {
      this.$emit('open-nested', item)
    },
    // 重置回复表单内容和目标
    resetForm() {
      this.form.content = ''
      this.replyTarget = null
    },
    // 处理取消回复操作（清空内容并关闭弹窗）
    handleCancel() {
      if (this.form.content.trim() || this.replyTarget) {
        this.resetForm()
      }
      this.$emit('cancel')
      this.innerVisible = false
    },
    // 提交回复内容
    async submit() {
      if (!this.form.content.trim()) {
        this.$message.warning(this.$t('templateComments.quick_reply_required'))
        return
      }
      if (!this.canReply) {
        this.$message.error(this.$t('common.no_permission'))
        return
      }
      this.submitting = true
      try {
        const payload = {
          project_id: this.projectId ? Number(this.projectId) : null,
          parent_id: this.replyTarget ? this.replyTarget.id : this.parentReply.id,
          content: this.form.content.trim()
        }
        if (this.replyHandler) {
          await this.replyHandler(payload)
        } else {
          this.$emit('reply', payload)
        }
        this.resetForm()
        this.threadReplies = []
        this.threadPage = 1
        await this.fetchReplies()
        this.$message.success(this.$t('templateComments.toast_reply_success'))
      } catch (error) {
        this.$message.error(error && error.message ? error.message : this.$t('templateComments.toast_reply_failed'))
      } finally {
        this.submitting = false
      }
    },
    // 合并回复列表并去重（根据 ID 唯一化）
    // @param {Array} existing - 已有的回复列表
    // @param {Array} incoming - 新获取的回复列表
    // @returns {Array} 合并去重后的回复列表
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
.reply-thread-dialog ::v-deep .el-dialog__body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px 24px;
}
.thread-empty {
  display: flex;
  gap: 8px;
  align-items: center;
  color: #909399;
  font-size: 14px;
  padding: 16px 0;
}
.thread-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.thread-toolbar {
  display: flex;
  justify-content: flex-start;
  margin-bottom: -12px;
}
.thread-toolbar .el-button {
  padding: 0;
}
.thread-section-title {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}
.thread-count {
  margin-left: 8px;
  color: #909399;
  font-size: 12px;
}
.thread-card {
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
  padding: 12px 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.thread-card.is-parent {
  border-left: 3px solid #1890ff;
}
.thread-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
.meta-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.meta-author {
  font-weight: 500;
  color: #303133;
}
.meta-time {
  font-size: 12px;
  color: #909399;
}
.meta-id {
  font-size: 12px;
  color: #c0c4cc;
}
.avatar-fallback {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  color: #fff;
  font-weight: 600;
}
.thread-text {
  margin: 0;
  color: #606266;
  line-height: 20px;
  white-space: pre-wrap;
  word-break: break-word;
}
.thread-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}
.thread-actions {
  display: flex;
  gap: 8px;
}
.thread-state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
  padding: 12px 0;
}
.thread-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.thread-pagination {
  text-align: center;
}
.thread-quick-reply {
  border-top: 1px solid #ebeef5;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.thread-target {
  margin-left: 8px;
  color: #1890ff;
  font-size: 12px;
}
.thread-reply-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
