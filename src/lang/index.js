import Vue from "vue";
import VueI18n from "vue-i18n";
//引入自定义语言配置  
import zn from './zn';//语言包定义的位置，前文写在同一文件夹下，可自行修改位置
import cp from './cp';
//引入UI框架语言配置---elementui
import locale from 'element-ui/lib/locale';
import twLocale from 'element-ui/lib/locale/lang/zh-TW';
import cnLocale from 'element-ui/lib/locale/lang/zh-CN';
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: localStorage.getItem('lang') || "zn",//将语言标识存入localStorage或sessionStorage中，页面刷新不会默认中文显示
  messages: {
    'zn': {
      ...zn,
      ...cnLocale
    },   // 中文语言包
    'cp': {
      ...cp,
      ...twLocale
    }   //英文语言包
  },
  silentTranslationWarn:true//解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
});

//vue-i18n版本为6.xx或更新的版本书写方式如下，5.xx版本请以element-ui国际化为准，建议使用8.xx版本
locale.i18n(function (path, options) {
  let value = i18n.t(path, options)
  if (value !== null && value !== undefined) {
    return value
  }
  return ''
})

export default i18n;

