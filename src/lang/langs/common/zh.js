// 通用路由与界面文案（含材料加工配置菜单）
export default {
  route: {
    dashboard: '控制台',
    profile: '我的信息',

    icons: '图标',

    system: '系统设置',
    setting: '网站设置',
    config: '配置管理',
    menu: '菜单管理',

    attachment: '附件管理',
    machine: '机器管理',
    machineList: '机器列表',
    machineModuleList: '模块列表',
    material: '材料管理',
    materialList: '材料列表',
    materialCategoryList: '材料分类列表',
    materialProcessingProfileList: '加工配置列表', // 材料加工配置列表页标题
    templateLibrary: '模板库管理',
    templateLibraryList: '模板列表',
    applicationScenario: '应用场景管理',
    applicationScenarioList: '应用场景列表',
    userLog: '用户日志',
    userLogList: '用户日志列表',

    permission: '权限管理',
    admin: '管理员',
    adminIndex: '管理员列表',
    userManage: '用户管理',
    userManageList: '用户列表',
    userManageFiles: '用户文件列表',
    authGroup: '管理分组',
    authGroupTree: '分组结构',
    authRule: '权限路由',
    authRuleTree: '权限结构',

    localExtension: '本地扩展',
    extension: '扩展管理'
  },
  navbar: {
    dashboard: '首页',
    logOut: '退出登录',
    profile: '我的信息',
    avatar: '修改头像',
    theme: '换肤',
    size: '布局大小'
  },
  login: {
    title: '系统登录',
    logIn: '登录',
    username: '账号',
    password: '密码',
    captcha: '验证码',
    refreshCaptcha: '刷新验证码',
    refreshCaptchaTip: '点击刷新验证码',

    'rules_username_required': '请输入你的用户名',
    'rules_password_required': '密码不能少于6位',
    'rules_captcha_required': '请输入四位数验证码'
  },
  tagsView: {
    refresh: '刷新',
    close: '关闭',
    closeOthers: '关闭其它',
    closeAll: '关闭所有'
  },
  settings: {
    title: '系统布局配置',
    theme: '主题色',
    tagsView: '开启 Tags-View',
    fixedHeader: '固定 Header',
    sidebarLogo: '侧边栏 Logo'
  },

  err401: {
    'title': '你没有权限去该页面',
    'content': '你可以进行以下操作解决你的问题',
    'go_home': '返回首页',
    'relogin': '退出重新登录'
  },

  err404: {
    'content': '点击链接刷新重试或者返回首页',
    'go_home': '返回首页'
  },

  // 公用
  common: {
    'go_back': '返回',
    'go_home': '回首页',

    'tips': '提示',
    'ok': '确定',
    'confirm': '确认',
    'cancel': '取消',
    'save': '提交',
    'loading': '加载中...',

    'enable': '启用',
    'disable': '禁用',

    'detail': '详情',
    'edit': '编辑',
    'delete': '删除',

    'goto_top': '回到顶部',

    'clear_cache': '清空缓存',
    'clear_cache_success': '清空网站缓存成功',
    'confirm_clear_cache': '确认要清空网站缓存吗？',
    'clear_cache_doing': '清空网站缓存中...',

    'confirm_logout': '确认要退出登录吗？',

    'close_page': '关闭页面',

    'range_separator': '至',
    'range_start_time': '开始时间',
    'range_end_time': '结束时间'
  }
}
