<h3 align="center">
    lumi后台管理系统 前端编译文档
</h3>

## 简介

本项目是基于 [vue-element-admin](https://github.com/PanJiaChen/vue-element-admin) 的前端项目，部分功能为了适配 larke-admin 进行了优化和调整。
编译工具为 `pnpm`

## 功能

```
- 登录 / 注销

- 权限验证
  - 页面权限
  - 指令权限
  - 权限配置
  - 二步登录

- 多环境发布
  - dev
  - sit
  - stage
  - prod

- 全局功能
  - 国际化多语言
  - 多种动态换肤
  - 动态侧边栏（支持多级路由嵌套）
  - 动态面包屑
  - 快捷导航(标签页)
  - Svg Sprite 图标
  - 本地/后端 mock 数据
  - Screenfull全屏
  - 自适应收缩侧边栏

- 编辑器
  - 富文本
  - Markdown
  - JSON 等多格式

- Excel
  - 导出excel
  - 导入excel
  - 前端可视化excel
  - 导出zip

- 表格
  - 动态表格
  - 拖拽表格
  - 内联编辑

- 错误页面
  - 401
  - 404

- 組件
  - 头像上传
  - 返回顶部
  - 拖拽Dialog
  - 拖拽Select
  - 拖拽看板
  - 列表拖拽
  - SplitPane
  - Dropzone
  - Sticky
  - CountTo

- 综合实例
- 错误日志
- Dashboard
- 引导页
- ECharts 图表
- Clipboard(剪贴复制)
- Markdown2html
```

## 开发

```bash
# 开发环境 防止跨域 vue.config.js
  devServer: {
    // .........
    proxy: {
      '/admin-api': {
        // 将前端请求转发到本地后端，避免开发环境出现跨域
        target: 'http://127.0.0.1:8010',
        changeOrigin: true
      }
    }
   // ......... 
  },

# 修改左边菜单栏：src\routes.js  xxxx在src\router\system\对应菜单栏的name.js的name值
export default {
  xxxx:10010
}

# 更改后端请求接口
编辑 .env.development 和 .env.production 环境变量里的 VUE_APP_BASE_API 的接口地址为后端 api 接口地址

# 安装依赖
pnpm install

# 安装依赖并忽略错误
pnpm install --ignore-scripts

# 建议不要直接使用 cnpm 安装依赖，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
pnpm install --registry=https://registry.npm.taobao.org

# 启动服务
pnpm run dev
```

浏览器访问 http://localhost:9527

## 发布

```bash
# 构建测试环境
pnpm run build:stage

# 构建生产环境
pnpm run build:prod
```

## 其它

```bash
# 预览发布环境效果
pnpm run preview

# 预览发布环境效果 + 静态资源分析
pnpm run preview -- --report

# 代码格式检查
pnpm run lint

# 代码格式检查并自动修复
pnpm run lint -- --fix
```

如果出现 `uv_os_gethostname` 问题，可以搜索在出错依赖库入口文件添加 `os.hostname = () => "localhost";` 解决

更多文档信息可以查看 [使用文档](https://panjiachen.github.io/vue-element-admin-site/zh/)