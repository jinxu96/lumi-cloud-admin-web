import Layout from '@/layout'

// 材料管理主路由，包含材料列表与加工配置子页
const route = {
  path: '/material',
  component: Layout,
  redirect: '/material/index',
  alwaysShow: true,
  name: 'MaterialRoot',
  meta: {
    title: 'material',
    icon: 'el-icon-collection-tag',
    roles: [
      'app-admin.materials.index'
    ]
  },
  children: [
    {
      path: '/material/index',
      component: () => import('@/views/material/index.vue'),
      name: 'MaterialList',
      meta: {
        title: 'materialList',
        icon: 'el-icon-tickets',
        roles: [
          'app-admin.materials.index'
        ]
      }
    },
    {
      path: '/material/processing-profiles',
      component: () => import('@/views/material-processing-profiles/index.vue'),
      name: 'MaterialProcessingProfileList',
      meta: {
        title: 'materialProcessingProfileList',
        icon: 'el-icon-data-line',
        roles: [
          'app-admin.material-processing-profiles.index'
        ]
      }
    }
  ]
}

export default route
