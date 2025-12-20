import Layout from '@/layout'

const route = {
  path: '/machine',
  component: Layout,
  redirect: '/machine/index',
  alwaysShow: true,
  name: 'MachineRoot',
  meta: {
    title: 'machine',
    icon: 'el-icon-cpu',
    roles: [
      'app-admin.machines.index',
      'app-admin.machine-modules.index'
    ]
  },
  children: [
    {
      path: '/machine/index',
      component: () => import('@/views/machine/index'),
      name: 'MachineList',
      meta: {
        title: 'machineList',
        icon: 'el-icon-printer',
        roles: [
          'app-admin.machines.index'
        ]
      }
    },
    {
      path: '/machine/modules',
      component: () => import('@/views/machine/modules/index.vue'),
      name: 'MachineModuleList',
      meta: {
        title: 'machineModuleList',
        icon: 'el-icon-collection',
        roles: [
          'app-admin.machine-modules.index'
        ]
      }
    }
  ]
}

export default route
