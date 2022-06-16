import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css
import '@icon-park/vue/styles/index.css'

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import {$get, $post, $put, $delete, $export} from './utils/request'

Vue.prototype.$get = $get
Vue.prototype.$post = $post
Vue.prototype.$put = $put
Vue.prototype.$delete = $delete
Vue.prototype.$export = $export
/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

import { setRem, parseTime, currentTime, pick, checkRoles, formErrow, arrayKeys, pickKeys, mul, division, isSaas, isBrand, isStore, isAgent, dealPhone, getOsInfo, getBrowser } from './utils/index'
Vue.prototype.parseTime = parseTime
Vue.prototype.currentTime = currentTime
Vue.prototype.pick = pick
Vue.prototype.checkRoles = checkRoles
Vue.prototype.formErrow = formErrow
Vue.prototype.arrayKeys = arrayKeys
Vue.prototype.pickKeys = pickKeys
Vue.prototype.mul = mul
Vue.prototype.division = division
Vue.prototype.isSaas = isSaas
Vue.prototype.isBrand = isBrand
Vue.prototype.isStore = isStore
Vue.prototype.isAgent = isAgent
Vue.prototype.dealPhone = dealPhone
Vue.prototype.OsInfo = getOsInfo
Vue.prototype.Browser = getBrowser
Vue.prototype.Browser = getBrowser
 /**
 * 校验是否拥有设备类型相关能力
 */
Vue.prototype.checkAbility = function(deviceArr, keyArr){
  let val = false
  for(var i in deviceArr){
    for(var s in keyArr){
      if(Vue.prototype.Ability[deviceArr[i].deviceTypeCode + keyArr[s]]){
        val = true
        break
      }
    }
    if(val == true) break
  }
  return val
}

// set ElementUI lang to EN
Vue.use(ElementUI)

Vue.config.productionTip = false

//改变窗口大小时重新设置 rem
// setRem()
// window.onresize = function () {
//   setRem()
// }

import axios from 'axios'
let startApp = function () {
  axios.get('/config.json').then((res) => {
    // 基础地址
    Vue.prototype.BASE_URL = res.data.BASE_URL
    Vue.prototype.config = res.data
    new Vue({
      el: '#app',
      router,
      store,
      render: h => h(App)
    })

    if(res.data.baidu_statistics){
      router.beforeEach((to, from, next) => {
        setTimeout(() => {
          eval(res.data.baidu_statistics)
        }, 50)
        next()
      })
    }
  })
}
startApp()
