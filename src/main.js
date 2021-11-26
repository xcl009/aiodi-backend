import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'

import '@/icons' // icon
import '@/permission' // permission control

import {$get, $post} from './utils/request'

Vue.prototype.$get = $get
Vue.prototype.$post = $post
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

import { setRem, parseTime, pick, checkRoles, outTab, formErrow, arrayKeys, pickKeys, mul, division } from './utils/index'
Vue.prototype.parseTime = parseTime
Vue.prototype.pick = pick
Vue.prototype.checkRoles = checkRoles
Vue.prototype.outTab = outTab
Vue.prototype.formErrow = formErrow
Vue.prototype.arrayKeys = arrayKeys
Vue.prototype.pickKeys = pickKeys
Vue.prototype.mul = mul
Vue.prototype.division = division

// set ElementUI lang to EN
Vue.use(ElementUI)
// 如果想要中文版 element-ui，按如下方式声明
// Vue.use(ElementUI)

Vue.config.productionTip = false

//setRem()

// 改变窗口大小时重新设置 rem
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
