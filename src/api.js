// src/api.js
import axios from 'axios'

// 创建 Axios 实例
const api = axios.create({
  baseURL: 'https://nav.tum.de/api', // 设置 baseURL
  headers: {
    'Content-Type': 'application/json',
    // 如果需要 API Key，可以在这里添加
    // 'Authorization': `Bearer ${process.env.VUE_APP_API_KEY}`,
  },
})

// 请求拦截器（如果需要添加认证信息等）
api.interceptors.request.use(
  (config) => {
    // 例如，如果需要动态添加认证 Token，可以在这里处理
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config
  },
  (error) => Promise.reject(error),
)

// 响应拦截器（统一处理错误等）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 在这里进行全局错误处理，例如弹出提示
    return Promise.reject(error)
  },
)

export default api
