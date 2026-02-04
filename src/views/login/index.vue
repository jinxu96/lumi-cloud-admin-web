<template>
  <div class="login-container">
    <div class="login-main">
      <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" autocomplete="off" label-position="left">

        <div class="title-container">
          <h3 class="title">
            {{ $t('login.title') }}
          </h3>
          <lang-select class="set-language" />
        </div>

        <el-form-item prop="username">
          <span class="svg-container">
            <svg-icon icon-class="user" />
          </span>
          <el-input
            ref="username"
            v-model="loginForm.username"
            :placeholder="$t('login.username')"
            name="username"
            type="text"
            tabindex="1"
            autocomplete="new-password"
          />
        </el-form-item>

        <el-tooltip v-model="capsTooltip" content="Caps lock is On" placement="right" manual>
          <el-form-item prop="password">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              :key="passwordType"
              ref="password"
              v-model="loginForm.password"
              :type="passwordType"
              :placeholder="$t('login.password')"
              name="password"
              tabindex="2"
              autocomplete="new-password"
              @keyup.native="checkCapslock"
              @blur="capsTooltip = false"
              @keyup.enter.native="handleLogin"
            />
            <span class="show-pwd" @click="showPwd">
              <svg-icon :icon-class="passwordType === 'password' ? 'eye' : 'eye-open'" />
            </span>
          </el-form-item>
        </el-tooltip>

        <el-form-item prop="captcha">
          <span class="svg-container">
            <i class="el-icon-picture-outline" />
          </span>
          <el-input
            ref="captcha"
            v-model="loginForm.captcha"
            :placeholder="$t('login.captcha')"
            name="captcha"
            type="text"
            tabindex="3"
            autocomplete="new-password"
            class="captcha-input"
          />

          <el-tooltip effect="light" :content="$t('login.refreshCaptchaTip')" placement="top">
            <span class="captcha-img" @click="refreshCaptcha">
              <img :src="captchaImg" :title="$t('login.refreshCaptcha')">
            </span>
          </el-tooltip>
        </el-form-item>

        <el-button
          :loading="loading"
          type="primary"
          style="width:100%;margin-bottom:35px;"
          @click.native.prevent="handleLogin"
        >
          {{ $t('login.logIn') }}
        </el-button>

      </el-form>

      <!-- <div class="copyright">
        Copyright @ 2025 <a target="_blank" href="http://github.com/deatil/larke-admin">Larke-admin</a>
      </div> -->
    </div>
  </div>
</template>

<script>
import { validUsername } from '@/utils/validate'
import LangSelect from '@/components/LangSelect'

export default {
  name: 'Login',
  components: { LangSelect },
  data() {
    /**
     * 用户名验证
     * 检查用户名是否符合验证策略
     */
    const validateUsername = (rule, value, callback) => {
      if (!validUsername(value)) {
        callback(new Error(this.$t('login.rules_username_required')))
      } else {
        callback()
      }
    }
    /**
     * 密码验证
     * 检查密码长度是否至少6位
     */
    const validatePassword = (rule, value, callback) => {
      if (value.length < 6) {
        callback(new Error(this.$t('login.rules_password_required')))
      } else {
        callback()
      }
    }
    /**
     * 验证码验证
     * 检查验证码是否正好为4位
     */
    const validateCaptcha = (rule, value, callback) => {
      if (value.length !== 4) {
        callback(new Error(this.$t('login.rules_captcha_required')))
      } else {
        callback()
      }
    }
    return {
      captchaImg: require('@/assets/larke/captcha.png'), // 验证码图片URL
      pubkey: '', // 公钥（保留字段）
      loginForm: { // 登录表单数据
        username: '', // 用户名
        password: '', // 密码
        captcha: '', // 验证码
        captchaKey: '', // 验证码ID（服务器返回）

        passkeyId: '', // 次级秘钥ID（保留字段）
        passkey: '' // 次级秘钥值（保留字段）
      },
      loginRules: { // 登录表单验证规则
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }],
        captcha: [{ required: true, trigger: 'blur', validator: validateCaptcha }]
      },
      passwordType: 'password', // 密码输入框类型（password/text）
      capsTooltip: false, // 是否显示色包锻锁警告提示
      loading: false, // 登录按钮加载状态
      showDialog: false, // 对话框显示状态
      redirect: undefined, // 登录后重定向位置
      otherQuery: {} // 其他路由参数
    }
  },
  watch: {
    /**
     * 监听路由変化
     * 提取路由参数中的redirect和otherQuery参数
     */
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  /**
   * 组件创建时初始化
   * 加载次级秘钥和验证码
   */
  created() {
    // window.addEventListener('storage', this.afterQRScan)

    this.getPasskey()

    this.refreshCaptcha()
  },
  /**
   * 组件挂载后
   * 根据表单字段是否为空自动设置焦点
   */
  mounted() {
    if (this.loginForm.username === '') {
      this.$refs.username.focus()
    } else if (this.loginForm.password === '') {
      this.$refs.password.focus()
    } else if (this.loginForm.captcha === '') {
      this.$refs.captcha.focus()
    }
  },
  /**
   * 组件销毁前
   * 不可逆的清理操作存在但不需执行
   */
  destroyed() {
    // window.removeEventListener('storage', this.afterQRScan)
  },
  methods: {
    /**
     * 检查是否按下Caps Lock键
     * @param {KeyboardEvent} e - 键上事件对象
     */
    checkCapslock(e) {
      const { key } = e
      this.capsTooltip = key && key.length === 1 && (key >= 'A' && key <= 'Z')
    },
    /**
     * 切换密码显示/隐藏状态
     * 修改密码输入框的type并焦点
     */
    showPwd() {
      if (this.passwordType === 'password') {
        this.passwordType = ''
      } else {
        this.passwordType = 'password'
      }
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    /**
     * 获取次级秘钥
     * 从服务器获取用于登录的次级秘钥信息
     */
    getPasskey() {
      this.$store.dispatch('user/passkey')
        .then(response => {
          const headers = response.headers
          const res = response.data

          this.loginForm.passkeyId = headers['larke-admin-passkey-id']
          this.loginForm.passkey = res.data.key
        })
        .catch(err => {
          console.error('Failed to load passkey', err)
          return false
        })
    },
    /**
     * 刷新验证码
     * 从服务器获取新的验证码图片和ID
     */
    refreshCaptcha() {
      this.$store.dispatch('user/captcha')
        .then(response => {
          const headers = response.headers
          const res = response.data

          const captchaKey = headers['larke-admin-captcha-id']
          const captchaImg = res.data.captcha

          this.loginForm.captchaKey = captchaKey
          this.captchaImg = captchaImg
        })
        .catch(err => {
          console.error('Failed to refresh captcha', err)
          return false
        })
    },
    /**
     * 处理登录操作
     * 验证表单、发送登录请求、处理程序跳转
     */
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(response => {
              const isValidRedirect = typeof this.redirect === 'string' && this.redirect.trim() !== '' && this.redirect !== 'undefined' && this.redirect !== 'null'
              let targetPath = isValidRedirect ? this.redirect : '/'
              if (targetPath === '/404' || targetPath === '/401') {
                targetPath = '/'
              }
              this.$router.push({ path: targetPath, query: this.otherQuery })
              this.loading = false
            })
            .catch(err => {
              this.refreshCaptcha()

              console.error('Login failed', err)
              this.loading = false
            })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    /**
     * 提取redirect之外的其他路由参数
     * @param {Object} query - 路由查询参数对象
     * @returns {Object} 筛选后的其他参数
     */
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }

  }
}
</script>

<style lang="scss">
/* 修复input 背景不协调 和光标变色 */
/* Detail see https://github.com/PanJiaChen/vue-element-admin/pull/927 */

$bg:#283443;
$light_gray:#fff;
$cursor: #fff;

@supports (-webkit-mask: none) and (not (cater-color: $cursor)) {
  .login-container .el-input input {
    color: $cursor;
  }
}

/* reset element-ui css */
.login-container {
  .el-input {
    display: inline-block;
    height: 47px;
    width: 85%;

    input {
      background: transparent;
      border: 0px;
      -webkit-appearance: none;
      border-radius: 0px;
      padding: 12px 5px 12px 15px;
      color: $light_gray;
      height: 47px;
      caret-color: $cursor;

      &:-webkit-autofill {
        box-shadow: 0 0 0px 1000px $bg inset !important;
        -webkit-text-fill-color: $cursor !important;
      }
    }
  }

  .el-form-item {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(0, 0, 0, 0.1);
    border-radius: 5px;
    color: #454545;
  }
}
</style>

<style lang="scss" scoped>
$bg:#2d3a4b;
$dark_gray:#889aa4;
$light_gray:#eee;

.login-container {
  min-height: 100%;
  width: 100%;
  background: url(../../assets/larke/loginbg.png) 0% 0% / cover no-repeat;
  position: static;
  overflow: hidden;

  .login-main {
    width: 428px;
    position: relative;
    margin: 0 auto;
    margin-top: 80px;
    margin-bottom: 50px;
    background: #526070;
    border-radius: 5px;

    .copyright {
        color: #fff;
        width: 100%;
        position: absolute;
        text-align: center;
        line-height: 30px;
        padding: 10px 0;
        text-shadow: #000 0.1em 0.1em 0.1em;
        font-size: 14px;
    }
    .copyright a, .copyright span {
        color: #fff;
    }
  }

  .login-form {
    position: relative;
    width: 520px;
    max-width: 100%;
    padding: 35px 35px 0;
    margin: 0 auto;
    overflow: hidden;
  }

  .tips {
    font-size: 14px;
    color: #fff;
    margin-bottom: 10px;

    span {
      &:first-of-type {
        margin-right: 16px;
      }
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: $dark_gray;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: $light_gray;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }

    .set-language {
      color: #fff;
      position: absolute;
      top: 3px;
      font-size: 18px;
      right: 0px;
      cursor: pointer;
    }
  }

  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }

  .thirdparty-button {
    position: absolute;
    right: 0;
    bottom: 6px;
  }

  .captcha-input {
    width: 65%;
  }
  .captcha-img {
    width: 100px;
    height: 39px;
    vertical-align: middle;
    display: inline-block;
    position: absolute;
    top: 5px;
    right: 10px;
  }
  .captcha-img img {
    width: 100px;
    cursor: pointer;
  }

  @media only screen and (max-width: 470px) {
    .thirdparty-button {
      display: none;
    }
  }
}

</style>
