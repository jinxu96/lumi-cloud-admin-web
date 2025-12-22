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
