import api from '../api.js'
/**
 * 搜索房间
 * @param params
 */
export const searchValue = (params) => {
  return api.get('/search', { params })
}

/**
 * 查询所有的教室类型以及房间
 * @param params
 */
export const searchlocationsRooms = (id, params) => {
  return api.get(`/locations/${id}`, { params })
}
