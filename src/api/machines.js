import request from '@/utils/request'

export function getMachines(params) {
  return request({
    url: 'machines',
    method: 'get',
    params
  })
}

export function getMachineDetail(id) {
  return request({
    url: `machines/${id}`,
    method: 'get'
  })
}

export function createMachine(data) {
  return request({
    url: 'machines',
    method: 'post',
    data
  })
}

export function updateMachine(id, data) {
  return request({
    url: `machines/${id}`,
    method: 'put',
    data
  })
}

export function deleteMachine(id) {
  return request({
    url: `machines/${id}`,
    method: 'delete'
  })
}

export function updateMachineStatus(id, isActive) {
  // 更新机器启用状态
  return request({
    url: `machines/${id}/status`,
    method: 'patch',
    data: {
      is_active: isActive
    }
  })
}

export function uploadMachineIcon(id, file) {
  // 上传机器展示图
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `machines/${id}/icon`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
