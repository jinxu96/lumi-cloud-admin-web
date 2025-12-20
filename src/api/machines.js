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
