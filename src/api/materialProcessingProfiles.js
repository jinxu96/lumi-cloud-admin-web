// 材料加工配置相关接口封装
import request from '@/utils/request'

export function getMaterialProcessingProfiles(params) {
  // 获取材料加工配置列表
  return request({
    url: 'material-processing-profiles',
    method: 'get',
    params
  })
}

export function getMaterialProcessingProfileDetail(id) {
  // 获取单条材料加工配置详情
  return request({
    url: `material-processing-profiles/${id}`,
    method: 'get'
  })
}

export function createMaterialProcessingProfile(data) {
  // 创建材料加工配置
  return request({
    url: 'material-processing-profiles',
    method: 'post',
    data
  })
}

export function updateMaterialProcessingProfile(id, data) {
  // 更新材料加工配置
  return request({
    url: `material-processing-profiles/${id}`,
    method: 'put',
    data
  })
}

export function deleteMaterialProcessingProfile(id) {
  // 删除材料加工配置
  return request({
    url: `material-processing-profiles/${id}`,
    method: 'delete'
  })
}

export function downloadMaterialProcessingProfileTemplate() {
  // 下载加工配置模板供运营参考
  return request({
    url: 'material-processing-profiles/template',
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

export function uploadMaterialProcessingProfilePreview(id, file) {
  // 独立上传或替换加工配置的预览图片
  const formData = new FormData()
  formData.append('file', file)
  return request({
    url: `material-processing-profiles/${id}/preview`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export function importMaterialLibrary(data) {
  // 批量导入材料库及加工配置
  return request({
    url: 'material-library/import',
    method: 'post',
    data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
