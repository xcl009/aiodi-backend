import Vue from "vue";
import VueI18n from "vue-i18n";
//引入自定义语言配置
import zh from './zh'; //中文(简体)
import cp from './cp'; //中文(繁体)
import en from './en'; //英文
import ru from './ru'; //俄语
import vi from './vi'; //越南语
import tp from './tp'; //菲律宾语
import ko from './ko'; //韩语
import jp from './jp'; //日语
import es from './es'; //西班牙语

//引入UI框架语言配置---elementui
import Element from 'element-ui'
import locale from 'element-ui/lib/locale';
import cnLocale from 'element-ui/lib/locale/lang/zh-CN'; //element 中文(简体)
import twLocale from 'element-ui/lib/locale/lang/zh-TW'; //element 中文(繁体)
import enLocale from 'element-ui/lib/locale/lang/en'; //element 英文
import ruLocale from 'element-ui/lib/locale/lang/ru-RU'; //element 俄语
import viLocale from 'element-ui/lib/locale/lang/vi'; //element 越南语
import koLocale from 'element-ui/lib/locale/lang/ko'; //element 韩语
import jaLocale from 'element-ui/lib/locale/lang/ja'; //element 日语
import esLocale from 'element-ui/lib/locale/lang/es'; //element 日语
Vue.use(VueI18n);
let lang = localStorage.getItem('lang')
lang = ['zh_CN', 'en_US', 'zh_HK','ja_JP','ko_KR','en_PH','ru_RU','vi_VN','es_ES'].indexOf(lang) > -1 ? lang : 'zh_CN'
localStorage.setItem('lang', lang)
const i18n = new VueI18n({
  locale: lang,//将语言标识存入localStorage或sessionStorage中，页面刷新不会默认中文显示
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
    },   //繁体
    'ru_RU': {
      ...ru,
      ...ruLocale
    },   //俄语
    'vi_VN': {
      ...vi,
      ...viLocale
    },   //越南语
    'en_PH': {
      ...tp,
      ...enLocale
    },   //菲律宾语
    'ko_KR': {
      ...ko,
      ...koLocale
    },   //韩语
    'ja_JP': {
      ...jp,
      ...jaLocale
    },   //日语
    'es_ES': {
      ...es,
      ...esLocale
    },   //西班牙语
  },
  silentTranslationWarn:true//解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
});
export default i18n;

