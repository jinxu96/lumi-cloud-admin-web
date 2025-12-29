import request from '@/utils/request'

// 获取用户日志列表（需携带时间范围等筛选参数）
export function getUserLogs(params) {
  return request({
    url: 'user-logs',
    method: 'get',
    params
  })
}

// 导出用户日志为 CSV 文件
export function exportUserLogs(params) {
  return request({
    url: 'user-logs/export',
    method: 'get',
    params,
    responseType: 'blob',
    catchReturnData: true
  }).catch(error => {
    // 拦截器会将成功的文件流作为异常抛出，这里重新包装为统一结构
    if (error instanceof Blob) {
      return {
        data: error,
        headers: {}
      }
    }
    return Promise.reject(error)
  })
}
