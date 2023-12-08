import Vue from "vue";
import VueI18n from 'vue-i18n'
import zn from "./zn"
import en from "./en"
Vue.use(VueI18n);   // 全局注册国际化包
 
// 准备翻译的语言环境信息
const i18n = new VueI18n({
  locale: "zn",   // 初始化中文
  messages: {
    "zn":zn,
    "en":en
  }
}); 
 
export default i18n;