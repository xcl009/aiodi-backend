import Vue from 'vue'
import axios from 'axios'
import qs from 'qs'
import {
  MessageBox,
  Message
} from 'element-ui'
import store from '@/store'
import {
  getToken
} from '@/utils/auth'

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken; //初始化取消请求的构造函数
let removePending = (flagUrl, f) => {
	if (pending.indexOf(flagUrl) !== -1) {
		if (f) {
      Message({
        message: '按钮点击太频繁',
        type: 'error'
      })
		} else {
			pending.splice(pending.indexOf(flagUrl), 1)
		}
	} else {
		if (f) {
			pending.push(flagUrl)
		}
	}
}

// create an axios instance
const service = axios.create({
  baseURL: Vue.prototype.BASE_URL, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 60000, // request timeout
  headers: {
    'Content-Type': 'application/json'
  }
})
//service.defaults.withCredentials = true // 跨域
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // please modify it according to the actual situation

      // config.headers['user_id'] = getToken('user_id')
      config.headers['Authorization'] = store.getters.token
    }
    config.baseURL = Vue.prototype.BASE_URL
    if(config.method == 'get'){
      config.paramsSerializer = function(params){
        return qs.stringify(params, { arrayFormat: 'repeat' })
      }
    }
    return config
  },
  error => {
    // do something with request error
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  res => {
    if (res.headers['content-type'] === 'application/vnd.ms-excel;charset=UTF-8') {
      return Promise.resolve(res.data)
    }
    if (res.headers['content-type'] === 'image/jpeg') {
      return Promise.resolve(res.data)
    }
    switch (parseInt(res.data.code)) {
      case 200:
        if (res.data.data) {
          return Promise.resolve(res.data.data)
        } else {
          return Promise.resolve(res.data)
        }
      default:
        Message.closeAll()
        if(['10601', '10603', '10604', '10605'].indexOf(res.data.code) > -1){
          Message({
            message: res.data.message || '网络卡住了，请刷新',
            type: 'error'
          })
          setTimeout(()=>{
            location.href = '/login'
          }, 1500)
        }else{
          Message({
            message: res.data.message || '网络卡住了，请刷新',
            type: 'error'
          })
          return Promise.reject(res.data)
        }
    }
  },
  (error) => {
    if(error.response && error.response.data && error.response.data.message){
      Message({
        message: error.response.data.message,
        type: 'error'
      })
    }
    if(error.response){
      return Promise.reject(error.response.data)
    }else{
      return Promise.reject(error)
    }
  }
)

let toType = (obj) => {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
let filterNull = (o) => {
  for (var key in o) {
    if (o[key] === null || o[key] === '' || o[key] === undefined) {
      delete o[key]
    }
    if (toType(o[key]) === 'string') {
      o[key] = o[key].trim()
    } else if (toType(o[key]) === 'object') {
      o[key] = filterNull(o[key])
    } else if (toType(o[key]) === 'array') {
      o[key] = filterNull(o[key])
    }
  }
  return o
}

export function $get(url, params = {}) {
  params = filterNull(params)
  return service.get(url, {
    params
  })
}

export function $post(url, data = {}) {
  data = filterNull(data)
  return service.post(url, data)
}

export function $export(url, data = {}) {
  data = filterNull(data)
  return service({
    method: 'post',
    url: url,
    data: data,
    responseType: 'blob'
  })
}
export default service
