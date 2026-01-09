<template>
  <el-dialog
    :visible.sync="innerVisible"
    :title="$t('templateComments.create_title')"
    width="520px"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="$t('templateComments.field_project_id')" prop="project_id">
        <el-input v-model="form.project_id" :placeholder="$t('templateComments.placeholder_project_id')" />
      </el-form-item>
      <el-form-item :label="$t('templateComments.field_parent_id')" prop="parent_id">
        <el-input v-model="form.parent_id" :placeholder="$t('templateComments.placeholder_parent_id')" />
      </el-form-item>
      <el-form-item :label="$t('templateComments.field_content')" prop="content">
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="4"
          :placeholder="$t('templateComments.placeholder_content')"
          maxlength="2000"
          show-word-limit
        />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="handleClose">{{ $t('templateComments.action_cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('templateComments.action_submit') }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
// 管理员发表评论弹窗
export default {
  name: 'CommentFormDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    projectId: {
      type: [Number, String],
      default: ''
    }
  },
  data() {
    return {
      innerVisible: this.visible,
      form: {
        project_id: this.projectId || '',
        parent_id: '',
        content: ''
      },
      rules: {
        project_id: [{ required: true, message: this.$t('templateComments.rule_project_id'), trigger: 'blur' }],
        content: [{ required: true, message: this.$t('templateComments.rule_content'), trigger: 'blur' }]
      }
    }
  },
  watch: {
    visible(val) {
      this.innerVisible = val
    },
    projectId(val) {
      if (val) {
        this.form.project_id = val
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false)
    },
    // 表单校验后提交
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return
        const payload = {
          project_id: Number(this.form.project_id),
          content: this.form.content.trim()
        }
        if (this.form.parent_id) {
          const parsedParent = Number(this.form.parent_id)
          if (!Number.isNaN(parsedParent)) {
            payload.parent_id = parsedParent
          }
        }
        this.$emit('submit', payload)
      })
    }
  }
}
</script>
