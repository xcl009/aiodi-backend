import Vue from "vue";
import VueI18n from "vue-i18n";
//引入自定义语言配置  
import zh from './zh';//语言包定义的位置，前文写在同一文件夹下，可自行修改位置
import cp from './cp';
import en from './en';
//引入UI框架语言配置---elementui
import Element from 'element-ui'
import locale from 'element-ui/lib/locale';
import twLocale from 'element-ui/lib/locale/lang/zh-TW';
import cnLocale from 'element-ui/lib/locale/lang/zh-CN';
import enLocale from 'element-ui/lib/locale/lang/en';
Vue.use(VueI18n);
const i18n = new VueI18n({
  locale: localStorage.getItem('lang') || "zh_CN",//将语言标识存入localStorage或sessionStorage中，页面刷新不会默认中文显示
  messages: {
    'zh_CN': {
      ...zh,
      ...cnLocale
    },   // 中文语言包
    'en_US': {
      ...en,
      ...enLocale
    },   //英文语言包
    'zh_HK': {
      ...cp,
      ...twLocale
    }   //繁体
  },
  silentTranslationWarn:true//解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
});

// locale.i18n((key, value) => i18n.$t(key, value));
// Vue.use(Element, {enLocale})
export default i18n;

