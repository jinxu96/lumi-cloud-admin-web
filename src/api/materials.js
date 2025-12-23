import request from '@/utils/request'

export function getMaterials(params) {
  // 获取材料列表
  return request({
    url: 'materials',
    method: 'get',
    params
  })
}

export function getMaterialDetail(id) {
  // 获取材料详情
  return request({
    url: `materials/${id}`,
    method: 'get'
  })
}

export function createMaterial(data) {
  // 创建材料
  return request({
    url: 'materials',
    method: 'post',
    data
  })
}

export function updateMaterial(id, data) {
  // 更新材料
  return request({
    url: `materials/${id}`,
    method: 'put',
    data
  })
}

export function deleteMaterial(id) {
  // 删除材料
  return request({
    url: `materials/${id}`,
    method: 'delete'
  })
}

export function updateMaterialStatus(id, isActive) {
  // 更新材料启用状态
  return request({
    url: `materials/${id}/status`,
    method: 'patch',
    data: {
      is_active: isActive
    }
  })
}

// 独立封面上传，避免 PUT + multipart 解析问题
export function uploadMaterialCover(id, file) {
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `materials/${id}/cover`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function detachMaterialModules(id, machineModuleId) {
  // 解绑材料与机器模块关联，machineModuleId 为空时解绑全部
  const params = {}
  if (machineModuleId) {
    params.machine_module_id = machineModuleId
  }
  return request({
    url: `materials/${id}/machine-modules`,
    method: 'delete',
    params
  })
}
