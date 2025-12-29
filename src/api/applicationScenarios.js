import request from '@/utils/request'

// 获取应用场景列表
export function getApplicationScenarios(params) {
  return request({
    url: 'application-scenarios',
    method: 'get',
    params
  })
}

// 创建应用场景
export function createApplicationScenario(data) {
  return request({
    url: 'application-scenarios',
    method: 'post',
    data
  })
}

// 更新应用场景
export function updateApplicationScenario(id, data) {
  return request({
    url: `application-scenarios/${id}`,
    method: 'put',
    data
  })
}

// 删除应用场景
export function deleteApplicationScenario(id) {
  return request({
    url: `application-scenarios/${id}`,
    method: 'delete'
  })
}

// 切换应用场景启用状态
export function updateApplicationScenarioStatus(id, isActive) {
  return request({
    url: `application-scenarios/${id}/status`,
    method: 'patch',
    data: { is_active: isActive }
  })
}
