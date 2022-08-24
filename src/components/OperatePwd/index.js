import OperatePwd from "./index.vue"
let instance = null
export default {
  install(Vue) {
    if (!instance) {
      //构造器 /子类
      let Pwd = Vue.extend(OperatePwd)
      instance = new Pwd({
        //创建一个div,并挂载上去
        el: document.createElement('div')
      })
      document.body.appendChild(instance.$el);
    }

    //自定义方法
    let customMethods = {
      showDialog() {
        instance.dialogStatus = true
      }
    }

    //挂载到自定义方法vue示例上
    if (!Vue.$OperatePwd) {
      Vue.$OperatePwd = customMethods
      Vue.prototype.$OperatePwd = Vue.$OperatePwd
    }
  }
}
