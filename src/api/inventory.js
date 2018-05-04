import request from '@/utils/request'

export function uploadData(form) {
  return request({
    url: '/inventory/readExcel',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export function fetchHeadList(query) {
  return request({
    url: '/inventory/queryCheckHead',
    method: 'post',
    data: query
  })
}

export function fetchDetailList(query) {
  return request({
    url: '/inventory/queryInventory',
    method: 'post',
    data: query
  })
}

export function downloadDetail(query) {
  return request({
    url: '/inventory/exportInventory',
    method: 'post',
    data: query
  })
}

export function downloadTotal(query) {
  return request({
    url: '/inventory/exportText',
    method: 'post',
    data: query,
    responseType: 'blob'
  })
}
