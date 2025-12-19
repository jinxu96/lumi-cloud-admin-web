<template>
  <el-dialog
    :visible="visible"
    width="420px"
    append-to-body
    @close="handleClose"
  >
    <template #title>
      <span>{{ $t('userManage.dialog_password') }}</span>
    </template>

    <el-form ref="passwordForm" :model="form" :rules="rules" label-width="140px">
      <el-form-item :label="$t('userManage.form_password')" prop="password">
        <el-input v-model.trim="form.password" type="password" autocomplete="new-password" />
      </el-form-item>
      <el-form-item :label="$t('userManage.form_password_confirm')" prop="password_confirmation">
        <el-input v-model.trim="form.password_confirmation" type="password" autocomplete="new-password" />
      </el-form-item>
    </el-form>

    <span slot="footer" class="dialog-footer">
      <el-button @click="handleClose">{{ $t('userManage.form_cancel') }}</el-button>
      <el-button type="primary" :loading="loading" @click="handleSubmit">{{ $t('userManage.form_save') }}</el-button>
    </span>
  </el-dialog>
</template>

<script>
// 管理员在后台触发用户密码重置的弹窗组件。
export default {
  name: 'UserPasswordDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const rules = {
      password: [{ validator: this.validatePassword, trigger: 'blur' }],
      password_confirmation: [{ validator: this.validatePasswordConfirm, trigger: 'blur' }]
    }

    return {
      form: this.createDefaultForm(),
      rules
    }
  },
  watch: {
    visible(value) {
      if (value) {
        this.form = this.createDefaultForm()
        this.$nextTick(() => {
          this.$refs.passwordForm && this.$refs.passwordForm.clearValidate()
        })
      }
    }
  },
  methods: {
    createDefaultForm() {
      return {
        password: '',
        password_confirmation: ''
      }
    },
    validatePassword(rule, value, callback) {
      if (!value) {
        callback(new Error(this.$t('userManage.rules_password_required')))
        return
      }
      if (value.length < 8 || value.length > 128) {
        callback(new Error(this.$t('userManage.rules_password_length')))
        return
      }
      callback()
    },
    validatePasswordConfirm(rule, value, callback) {
      if (!value) {
        callback()
        return
      }
      if (value !== this.form.password) {
        callback(new Error(this.$t('userManage.rules_password_confirm')))
        return
      }
      callback()
    },
    handleClose() {
      this.$emit('update:visible', false)
    },
    handleSubmit() {
      this.$refs.passwordForm.validate(valid => {
        if (!valid) {
          return
        }
        this.$emit('submit', { ...this.form })
      })
    }
  }
}
</script>
