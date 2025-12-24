<template>
  <div class="errPage-container">
    <el-button icon="el-icon-arrow-left" class="pan-back-btn" @click="back">
      返回
    </el-button>
    <div class="error-body">
      <h1 class="error-title">Oops!</h1>
      <h2 class="error-subtitle">{{ $t('err401.title') }}</h2>
      <p class="error-text">{{ $t('err401.content') }}</p>
      <div class="error-actions">
        <router-link class="error-link" to="/dashboard">
          {{ $t('err401.go_home') }}
        </router-link>
        <a class="error-link" href="javascript:;" @click.prevent="logout">{{ $t('err401.relogin') }}</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Page401',
  data() {
    return {}
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/dashboard' })
      } else {
        this.$router.go(-1)
      }
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .errPage-container {
    max-width: 520px;
    margin: 120px auto;
    padding: 32px 28px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);

    .pan-back-btn {
      background: #008489;
      color: #fff;
      border: none !important;
      margin-bottom: 18px;
    }
  }

  .error-body {
    text-align: left;
  }

  .error-title {
    font-size: 48px;
    font-weight: 700;
    color: #2c3e50;
    margin-bottom: 12px;
  }

  .error-subtitle {
    font-size: 22px;
    font-weight: 600;
    color: #34495e;
    margin-bottom: 16px;
  }

  .error-text {
    font-size: 15px;
    line-height: 1.6;
    color: #6c7a89;
    margin-bottom: 24px;
  }

  .error-actions {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .error-link {
    color: #008489;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #00a1a7;
    }
  }
</style>
