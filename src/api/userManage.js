import request from '@/utils/request'

// 后台用户管理相关接口封装，统一透传到 /admin-api/users
export function getUsers(params) {
  return request({
    url: 'users',
    method: 'get',
    params
  })
}

// 获取指定用户详情
export function getUserDetail(id) {
  return request({
    url: `users/${id}`,
    method: 'get'
  })
}

export function updateUser(id, data) {
  // 更新用户基础资料
  return request({
    url: `users/${id}`,
    method: 'put',
    data
  })
}

export function resetUserPassword(id, data) {
  // 重置指定用户密码
  return request({
    url: `users/${id}/password`,
    method: 'patch',
    data
  })
}

export function blockUser(id) {
  // 封禁指定用户账号
  return request({
    url: `users/${id}/block`,
    method: 'post'
  })
}

export function unblockUser(id) {
  // 解除指定用户封禁状态
  return request({
    url: `users/${id}/unblock`,
    method: 'post'
  })
}

export function forbidUserProjectPublish(id) {
  // 禁止指定用户发布项目模板
  return request({
    url: `users/${id}/project-publish/forbid`,
    method: 'post'
  })
}

export function allowUserProjectPublish(id) {
  // 解除指定用户项目发布限制
  return request({
    url: `users/${id}/project-publish/allow`,
    method: 'post'
  })
}

export function getUserFileDownload(id) {
  // 获取用户文件的签名下载链接
  return request({
    url: `user-files/${id}/download`,
    method: 'get'
  })
}

export function getUserFiles(userId, params) {
  // 查询指定用户的文件列表
  return request({
    url: `users/${userId}/files`,
    method: 'get',
    params
  })
}

export function getAllUserFiles(params) {
  // 查询全部用户文件，可按用户关键字、ID 或文件信息筛选
  return request({
    url: 'user-files',
    method: 'get',
    params
  })
}

export function createUserFile(userId, payload) {
  // 上传新文件给指定用户（表单直传）
  return request({
    url: `users/${userId}/files`,
    method: 'post',
    data: payload
  })
}

export function updateUserFile(id, payload) {
  // 更新用户文件备注或内容
  return request({
    url: `user-files/${id}`,
    method: 'put',
    data: payload
  })
}

export function deleteUserFile(id) {
  // 删除指定用户文件
  return request({
    url: `user-files/${id}`,
    method: 'delete'
  })
}

export function getUserFileUploadSignature(userId, data) {
  // 获取用户文件直传 OSS 所需的临时凭证
  return request({
    url: `users/${userId}/files/signature`,
    method: 'post',
    data
  })
}

export function completeUserFileDirectUpload(userId, data) {
  // 通知后端直传完成，写入数据库并刷新配额
  return request({
    url: `users/${userId}/files/direct-complete`,
    method: 'post',
    data
  })
}
