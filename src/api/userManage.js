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
