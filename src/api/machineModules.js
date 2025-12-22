import request from '@/utils/request'

export function getMachineModules(params) {
  // 获取模块列表数据
  return request({
    url: 'machine-modules',
    method: 'get',
    params
  })
}

export function getMachineModuleDetail(id) {
  // 获取单个模块详情
  return request({
    url: `machine-modules/${id}`,
    method: 'get'
  })
}

export function createMachineModule(data) {
  // 创建模块
  return request({
    url: 'machine-modules',
    method: 'post',
    data
  })
}

export function updateMachineModule(id, data) {
  // 更新模块
  return request({
    url: `machine-modules/${id}`,
    method: 'put',
    data
  })
}

export function deleteMachineModule(id) {
  // 删除模块
  return request({
    url: `machine-modules/${id}`,
    method: 'delete'
  })
}

export function updateMachineModuleStatus(id, isActive) {
  // 更新模块启用状态
  return request({
    url: `machine-modules/${id}/status`,
    method: 'patch',
    data: {
      is_active: isActive
    }
  })
}

export function importMachineModules(data) {
  // 导入模块配置文件
  return request({
    url: 'machine-modules/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function exportMachineModules(params) {
  // 导出模块配置文件
  return request({
    url: 'machine-modules/export',
    method: 'get',
    params,
    responseType: 'blob',
    catchReturnData: true
  }).catch(error => {
    if (error instanceof Blob) {
      return {
        data: error,
        headers: {}
      }
    }
    return Promise.reject(error)
  })
}

export function downloadMachineModuleTemplate() {
  // 下载导入模板
  return request({
    url: 'machine-modules/template',
    method: 'get',
    responseType: 'blob',
    catchReturnData: true
  }).catch(error => {
    if (error instanceof Blob) {
      return {
        data: error,
        headers: {}
      }
    }
    return Promise.reject(error)
  })
}
