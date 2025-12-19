import Layout from '@/layout'

// 顶级用户管理菜单路由配置，使用用户列表权限控制菜单显示
const route = {
  path: '/user-manage',
  component: Layout,
  redirect: '/user-manage/index',
  alwaysShow: true,
  name: 'UserManageRoot',
  meta: {
    title: 'userManage',
    icon: 'el-icon-user',
    roles: [
      'app-admin.users.index'
    ]
  },
  children: [
    // 用户列表页面，单独使用子菜单标题
    {
      path: 'index',
      component: () => import('@/views/user-manage/index'),
      name: 'UserManage',
      meta: {
        title: 'userManageList',
        roles: [
          'app-admin.users.index'
        ]
      }
    }
  ]
}

export default route
