import router from '../router';
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
import i18n from '../lang'

const windowScreen = `${window.screen.width} * ${window.screen.height}`

let pending = []; //声明一个数组用于存储每个ajax请求的取消函数和ajax标识
let cancelToken = axios.CancelToken; //初始化取消请求的构造函数
let removePending = (flagUrl, f) => {
  if (pending.indexOf(flagUrl) !== -1) {
    if (f) {
      Message({
        message: i18n.t('lang.message'),
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
    'Content-Type': 'application/json',
    'Accept-Language': localStorage.getItem('lang')
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
      config.headers['timeZone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
      config.headers['Authorization'] = store.getters.token
      config.headers['apiVersion'] = ''
      config.headers['appVersion'] = '0.0.1'
      config.headers['osType'] = Vue.prototype.OsInfo.name
      config.headers['osVersion'] = Vue.prototype.OsInfo.version
      config.headers['appid'] = 'PC'
      config.headers['path'] = location.hash
      config.headers['network'] = ''
      config.headers['ssid'] = ''
      config.headers['model'] = ''
      config.headers['screen'] = windowScreen
    }
    if (config.url.indexOf('http') == -1) {
      config.baseURL = Vue.prototype.BASE_URL
    }
    if (config.method == 'get') {
      config.paramsSerializer = function (params) {
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
    if (res.config.headers['Content-Type'] === 'application/vnd.ms-excel;charset=UTF-8') {
      return Promise.resolve(res.data)
    }
    if (res.headers['Content-Type'] === 'image/jpeg') {
      return Promise.resolve(res.data)
    }
    switch (parseInt(res.data.code)) {
      case 200:
        return Promise.resolve(res.data.data)
        // if (res.data.data) {
        //   return Promise.resolve(res.data.data)
        // } else {
        //   return Promise.resolve(res.data)
        // }
        break
      default:
        Message.closeAll(res.data.code)
        if (['10601', '10603', '10604', '10605'].indexOf(res.data.code) > -1) {
          Message({
            message: res.data.message || i18n.t('lang.message1'),
            type: 'error'
          })
          setTimeout(() => {
            location.href = '/login'
          }, 1500)
        } else {
          Message({
            message: res.data.message || i18n.t('lang.message1'),
            type: 'error'
          })
          return Promise.reject(res.data)
        }
        break
    }
  },
  (error) => {
    Message.closeAll()
    if (error.response) {
      let res = error.response.data
      if (['19876', 19876].indexOf(res.code) > -1) {
        router.push({
          path: '/user/checkPwd'
        })
      } else if (res.message) {
        Message({
          message: res.message,
          type: 'error'
        })
      }
    }
    if (error.response) {
      return Promise.reject(error.response.data)
    } else {
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

export function $put(url, data = {}) {
  data = filterNull(data)
  return service.put(url, data)
}

export function $delete(url, data = {}) {
  data = filterNull(data)
  return service.delete(url, data)
}

export function $export(url, data = {}) {
  data = filterNull(data)
  return service({
    method: 'GET',
    url: url,
    data: data,
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/vnd.ms-excel;charset=UTF-8',
      'Accept-Language': 'zh-CN'
    }
  })
}

export default service
