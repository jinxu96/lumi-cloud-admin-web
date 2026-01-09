import request from '@/utils/request'

// 模板评论相关接口封装
export function getProjectTemplateComments(params) {
  const finalParams = {
    ...params,
    // 确保默认只取顶级评论，后端约定 parent_id=0
    parent_id: params && params.parent_id !== undefined ? params.parent_id : 0
  }
  return request({
    url: 'project-template-comments',
    method: 'get',
    params: finalParams
  })
}

// 获取单条评论详情
export function getProjectTemplateCommentDetail(id) {
  return request({
    url: `project-template-comments/${id}`,
    method: 'get'
  })
}

// 管理员发表评论或回复
export function createProjectTemplateComment(data) {
  return request({
    url: 'project-template-comments',
    method: 'post',
    data
  })
}

// 软删除评论
export function deleteProjectTemplateComment(id) {
  return request({
    url: `project-template-comments/${id}`,
    method: 'delete'
  })
}

// 恢复已删除评论
export function restoreProjectTemplateComment(id) {
  return request({
    url: `project-template-comments/${id}/restore`,
    method: 'post'
  })
}

// 置顶或取消置顶评论
export function togglePinProjectTemplateComment(id, data) {
  return request({
    url: `project-template-comments/${id}/pin`,
    method: 'put',
    data
  })
}

// 禁言指定用户
export function banProjectTemplateCommentUser(userId, data) {
  return request({
    url: `project-template-comments/users/${userId}/ban`,
    method: 'post',
    data
  })
}

// 解禁指定用户
export function unbanProjectTemplateCommentUser(userId, data) {
  return request({
    url: `project-template-comments/users/${userId}/unban`,
    method: 'post',
    data
  })
}

// 查询用户禁言历史
export function getProjectTemplateCommentBanHistory(userId, params) {
  return request({
    url: `project-template-comments/users/${userId}/ban-history`,
    method: 'get',
    params
  })
}
