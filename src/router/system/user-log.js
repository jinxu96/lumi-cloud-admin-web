import Layout from '@/layout'

// 用户日志主菜单路由
const route = {
  path: '/user-logs',
  component: Layout,
  redirect: '/user-logs/index',
  alwaysShow: true,
  name: 'UserLogRoot',
  meta: {
    title: 'userLog',
    icon: 'el-icon-document',
    roles: ['app-admin.user-logs.index']
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/user-log/index.vue'),
      name: 'UserLogList',
      meta: {
        title: 'userLogList',
        icon: 'el-icon-document',
        roles: ['app-admin.user-logs.index']
      }
    }
  ]
}

export default route
