// 机器模块加工方案下拉接口封装
import request from '@/utils/request'

export function getMachineModuleProfiles(params) {
  // 获取机器模块加工方案列表，用于下拉选择
  return request({
    url: 'machine-module-profiles',
    method: 'get',
    params
  })
}

export function createMachineModuleProfile(data) {
  // 新增机器模块加工方案
  return request({
    url: 'machine-module-profiles',
    method: 'post',
    data
  })
}

export function updateMachineModuleProfile(id, data) {
  // 更新指定机器模块加工方案
  return request({
    url: `machine-module-profiles/${id}`,
    method: 'put',
    data
  })
}

export function deleteMachineModuleProfile(id) {
  // 删除机器模块加工方案
  return request({
    url: `machine-module-profiles/${id}`,
    method: 'delete'
  })
}
