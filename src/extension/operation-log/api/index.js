import request from '@/utils/request'

// 获取操作日志列表
export function getList(params) {
  return request({
    url: '/operation-log',
    method: 'get',
    params
  })
}

// 获取操作日志详情
export function getDetail(id) {
  return request({
    url: `/operation-log/${id}`,
    method: 'get'
  })
}

// 删除操作日志
export function deleteLog(id) {
  return request({
    url: `/operation-log/${id}`,
    method: 'delete'
  })
}

// 清空操作日志
export function clearLog(data) {
  return request({
    url: '/operation-log/clear',
    method: 'delete',
    data
  })
}
