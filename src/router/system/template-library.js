import Layout from '@/layout'

// 模板库管理路由，挂载模板列表主界面
const route = {
  path: '/template-library',
  component: Layout,
  redirect: '/template-library/index',
  alwaysShow: true,
  name: 'TemplateLibraryRoot',
  meta: {
    title: 'templateLibrary',
    icon: 'el-icon-notebook-1',
    roles: [
      'app-admin.project-templates.index',
      'app-admin.project-templates.show',
      'app-admin.project-templates.status',
      'app-admin.project-templates.update',
      'app-admin.project-templates.feature',
      'app-admin.project-templates.duplicate',
      'app-admin.project-templates.destroy'
    ]
  },
  children: [
    {
      path: '/template-library/index',
      component: () => import('@/views/template-library/index.vue'),
      name: 'TemplateLibraryList',
      meta: {
        title: 'templateLibraryList',
        icon: 'el-icon-document',
        roles: [
          'app-admin.project-templates.index',
          'app-admin.project-templates.show',
          'app-admin.project-templates.status',
          'app-admin.project-templates.update',
          'app-admin.project-templates.feature',
          'app-admin.project-templates.duplicate',
          'app-admin.project-templates.destroy'
        ]
      }
    },
    {
      path: '/template-library/comments',
      component: () => import('@/views/template-comments/index.vue'),
      name: 'TemplateCommentsList',
      meta: {
        title: 'templateCommentsList',
        icon: 'el-icon-chat-line-round',
        roles: ['app-admin.project-template-comments.index']
      },
      sort: 999999
    }
  ]
}

export default route
