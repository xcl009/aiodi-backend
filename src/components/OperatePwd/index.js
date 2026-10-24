import Vue from 'vue'
import OperatePwd from './index.vue'
import i18n from '@/lang'
import router from '@/router'

let instance = null
let pendingVerification = null

function getInstance() {
  if (!instance) {
    // Resolve the store lazily: it also imports the request module.
    const storeModule = require('@/store')
    const store = storeModule.default || storeModule
    const Pwd = Vue.extend(OperatePwd)
    instance = new Pwd({
      el: document.createElement('div'),
      i18n,
      router,
      store
    })
    document.body.appendChild(instance.$el)
  }
  return instance
}

export default function verifyOperatePwd() {
  if (!pendingVerification) {
    pendingVerification = getInstance().open().finally(() => {
      pendingVerification = null
    })
  }
  return pendingVerification
}
