import request from '@/utils/request'

// 控制台统计数据
export function getStats() {
  return request({
    url: '/dashboard/stats',
    method: 'get'
  })
}

// 控制台趋势分析数据
export function getAnalytics(params = {}) {
  return request({
    url: '/dashboard/analytics',
    method: 'get',
    params
  })
}
