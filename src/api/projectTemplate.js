import request from '@/utils/request'

// 获取模板库列表数据，支持分页与多条件筛选
export function getProjectTemplates(params) {
  return request({
    url: 'project-templates',
    method: 'get',
    params
  })
}

// 拉取单个模板的完整详情，含材料和媒体等关联信息
export function getProjectTemplateDetail(id) {
  return request({
    url: `project-templates/${id}`,
    method: 'get'
  })
}

// 更新模板基础信息与关联关系
export function updateProjectTemplate(id, data) {
  return request({
    url: `project-templates/${id}`,
    method: 'put',
    data
  })
}

// 切换模板的上下架状态
export function updateProjectTemplateStatus(id, data) {
  return request({
    url: `project-templates/${id}/status`,
    method: 'patch',
    data
  })
}

// 设置模板是否推荐及权重
export function featureProjectTemplate(id, data) {
  return request({
    url: `project-templates/${id}/feature`,
    method: 'patch',
    data
  })
}

// 复制模板生成新的项目
export function duplicateProjectTemplate(id, data) {
  return request({
    url: `project-templates/${id}/duplicate`,
    method: 'post',
    data
  })
}

// 删除模板并释放关联资源
export function deleteProjectTemplate(id) {
  return request({
    url: `project-templates/${id}`,
    method: 'delete'
  })
}

// 获取模板媒体资源上传所需的临时凭证
export function getProjectTemplateUploadSignature(data) {
  return request({
    url: 'project-templates/upload/signature',
    method: 'post',
    data
  })
}

// 获取模板编辑所需的机器、材料、场景选项
export function getProjectTemplateOptions(params) {
  return request({
    url: 'project-templates/options',
    method: 'get',
    params
  })
}
