<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane :label="$t('profile.info')" name="account">
                <account :user="user" />
              </el-tab-pane>
              <el-tab-pane :label="$t('profile.password')" name="password">
                <password />
              </el-tab-pane>
              <el-tab-pane :label="$t('profile.avatar')" name="avatar">
                <avatar :user="user" />
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import UserCard from './components/UserCard'
import Account from './components/Account'
import Password from './components/Password'
import Avatar from './components/Avatar'
import { getInfo } from '@/api/user'

// 个人资料页面组件
export default {
  name: 'Profile',
  components: {
    UserCard,
    Account,
    Password,
    Avatar
  },
  data() {
    return {
      // 用户基础信息
      user: {
        name: '',
        email: '',
        avatar: require('@/assets/larke/avatar-default.jpg'),
        introduce: ''
      },
      // 当前激活的标签页
      activeTab: 'account'
    }
  },
  computed: {

  },
  created() {
    // 页面创建时加载用户信息
    this.getUser()
  },
  methods: {
    // 获取用户信息
    getUser() {
      getInfo().then(response => {
        const { nickname, email, avatar, introduce, groups } = response.data

        // 组装用户信息用于展示
        this.user = {
          name: nickname,
          email: email,
          avatar: avatar,
          introduce: introduce,
          groups: groups
        }
      })
    }
  }
}
</script>
