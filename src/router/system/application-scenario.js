import Layout from '@/layout'

// 应用场景管理主路由
const route = {
  path: '/application-scenarios',
  component: Layout,
  redirect: '/application-scenarios/index',
  alwaysShow: true,
  name: 'ApplicationScenarioRoot',
  meta: {
    title: 'applicationScenario',
    icon: 'el-icon-collection',
    roles: [
      'app-admin.application-scenarios.index'
    ]
  },
  children: [
    {
      path: 'index',
      component: () => import('@/views/application-scenario/index.vue'),
      name: 'ApplicationScenarioList',
      meta: {
        title: 'applicationScenarioList',
        icon: 'el-icon-collection-tag',
        roles: [
          'app-admin.application-scenarios.index'
        ]
      }
    }
  ]
}

export default route
