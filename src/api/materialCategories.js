import request from '@/utils/request'

// 获取材料分类列表
export function getMaterialCategories(params) {
  return request({
    url: 'material-categories',
    method: 'get',
    params
  })
}

// 获取材料分类详情
export function getMaterialCategoryDetail(id) {
  return request({
    url: `material-categories/${id}`,
    method: 'get'
  })
}

// 新增材料分类
export function createMaterialCategory(data) {
  return request({
    url: 'material-categories',
    method: 'post',
    data
  })
}

// 更新材料分类
export function updateMaterialCategory(id, data) {
  return request({
    url: `material-categories/${id}`,
    method: 'put',
    data
  })
}

// 删除材料分类
export function deleteMaterialCategory(id) {
  return request({
    url: `material-categories/${id}`,
    method: 'delete'
  })
}
