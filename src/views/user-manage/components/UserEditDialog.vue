<template>
  <el-dialog
    :visible="visible"
    width="520px"
    append-to-body
    @close="handleClose"
  >
    <template #title>
      <span>{{ $t('userManage.dialog_edit') }}</span>
    </template>

    <el-form ref="editForm" :model="form" :rules="rules" label-width="120px">
      <el-form-item :label="$t('userManage.form_name')" prop="name">
        <el-input v-model.trim="form.name" />
      </el-form-item>
      <el-form-item :label="$t('userManage.form_email')" prop="email">
        <el-input v-model.trim="form.email" />
      </el-form-item>
      <el-form-item :label="$t('userManage.form_avatar')">
        <div class="avatar-input">
          <el-input v-model.trim="form.avatar" class="avatar-input-field" />
          <el-avatar
            v-if="form.avatar"
            :src="form.avatar"
            size="large"
            class="avatar-preview"
          />
          <el-avatar v-else icon="el-icon-user" size="large" class="avatar-preview" />
        </div>
      </el-form-item>
      <el-form-item :label="$t('userManage.form_quota')">
        <el-input-number
          v-model="form.upload_quota_mb"
          :min="0"
          :step="1"
          :precision="2"
          :controls="false"
          style="width:100%;"
        />
      </el-form-item>
      <el-form-item :label="$t('userManage.form_email_verified')">
        <el-switch v-model="form.email_verified" />
      </el-form-item>
      <el-form-item :label="$t('userManage.form_blocked')">
        <el-switch v-model="form.is_blocked" />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('userManage.form_cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('userManage.form_save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
// 管理员用于编辑单个用户基础资料的弹窗组件。
export default {
  name: 'UserEditDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    user: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      form: this.createDefaultForm()
    }
  },
  computed: {
    rules() {
      const validateEmail = (rule, value, callback) => {
        if (!value) {
          callback(new Error(this.$t('userManage.rules_email_required')))
          return
        }
        const emailReg = /^\S+@\S+\.\S+$/
        if (!emailReg.test(value)) {
          callback(new Error(this.$t('userManage.rules_email_format')))
          return
        }
        callback()
      }

      return {
        name: [{ required: true, message: this.$t('userManage.rules_name_required'), trigger: 'blur' }],
        email: [{ validator: validateEmail, trigger: 'blur' }]
      }
    }
  },
  watch: {
    user: {
      deep: true,
      immediate: true,
      handler(value) {
        if (value) {
          this.form = { ...this.createDefaultForm(), ...value }
        } else {
          this.form = this.createDefaultForm()
        }
      }
    },
    visible(value) {
      if (!value) {
        this.$nextTick(() => {
          this.$refs.editForm && this.$refs.editForm.clearValidate()
        })
      }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        id: '',
        name: '',
        email: '',
        avatar: '',
        upload_quota_mb: 0,
        email_verified: false,
        is_blocked: false
      }
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleSubmit() {
      this.$refs.editForm.validate(valid => {
        if (!valid) {
          return
        }
        this.$emit('submit', { ...this.form })
      })
    }
  }
}
</script>

<style scoped>
.avatar-input {
  display: flex;
  align-items: center;
}
.avatar-input-field {
  flex: 1;
}
.avatar-preview {
  margin-left: 12px;
}
</style>
