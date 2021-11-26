import Vue from 'vue'
import axios from 'axios'
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
    'Content-Type': 'application/x-www-form-urlencoded'
  }
})
//service.defaults.withCredentials = true // 跨域
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation

      //config.headers['user_id'] = getToken('user_id')
    }
    config.baseURL = Vue.prototype.BASE_URL
    return config
  },
  error => {
    // do something with request error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  res => {
    if (res.headers['content-type'] === 'image/jpeg') {
      return Promise.resolve(res.data)
    }
    switch (parseInt(res.data.code)) {
      case 0:
        if (res.data.data) {
          return Promise.resolve(res.data.data)
        } else {
          return Promise.resolve(res.data)
        }
      default:
        Message.closeAll()
        if(res.data.msg == '登录已过期，请重新登录' || res.data.msg == '验证失败，无效的token'){
          Message({
            message: res.data.msg || '网络卡住了，请刷新',
            type: 'error'
          })
          //location.href = '/login'
        }else{
          Message({
            message: res.data.msg || '网络卡住了，请刷新',
            type: 'error'
          })
          return Promise.reject(res.data)
        }
    }
  },
  (error) => {
    if(error.message && error.message.indexOf('timeout of') > -1){
      location.reload()
    } else {
      Message.closeAll()
      if (!error.response) {
        Message({
          message: '网络卡住了，请刷新',
          type: 'error'
        });
      }
      if (error.code == 'ECONNABORTED' && error.message.indexOf('timeout') != -1) {
        Message({
          message: '网络卡住了，请刷新',
          type: 'error'
        });
      }
    }
    return Promise.reject(error)
  }
)

export function $get(url, params = {}) {
  params.token = getToken()
  //params.user_id = getToken('user_id')
  //params.agent_id = params.agent_id || getToken('agent_id')
  return service.get(url, {
    params
  })
}
export function $post(url, data = {}) {
  if(getToken()){
    url = url + '?token=' + getToken()
  }
  data.token = getToken()
  //data.user_id = getToken('user_id')
  //data.agent_id = data.tagent_id || getToken('agent_id')
  return service.post(url, data)
}

export default service
