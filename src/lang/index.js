import Vue from "vue";
import VueI18n from "vue-i18n";
//引入自定义语言配置
import zh from './zh'; //中文(简体)
// import cp from './cp'; //中文(繁体)
import en from './en'; //英文
// import ru from './ru'; //俄语
// import vi from './vi'; //越南语
// import tp from './tp'; //菲律宾语
// import ko from './ko'; //韩语
// import jp from './jp'; //日语
// import es from './es'; //西班牙语
// import km_MM from './km_MM'; //高棉语
// import th_TH from './th_TH'; //泰语
// import pt_PT from './pt'; //葡萄牙语
import de_DE from './de_DE'; //德语
// import yn_ID from './yn_ID'; //印尼语
//import ms_MY from './ms_MY'; //马来西亚语
import fr_FR from './fr_FR'; //法语
import nl_NL from './nl_NL'; //荷兰语

/* let keys = [], values = []
for(var i in zh){
	for(var s in zh[i]){
		keys.push(`${i}_${s}`)
		values.push(zh[i][s])
	}
}
console.log('keys====', keys)
console.log('values====', values) */

/**
 * 表格翻译语言转为对象，保存到js
 */
/* import langKeys from './langKeys' // 表格语言key
import langVal from './langVal' // 表格语言val
let langObj = {}
langKeys.keys.map((i, v) => {
  let vi = i.split('_'), vik = vi[0], viv = vi[1]
  langObj[vik] = langObj[vik] || {}
  langObj[vik][viv] = langVal.keys[v]
})
console.log(langObj) */


//引入UI框架语言配置---elementui
import Element from 'element-ui'
import locale from 'element-ui/lib/locale';
import cnLocale from 'element-ui/lib/locale/lang/zh-CN'; //element 中文(简体)
//import twLocale from 'element-ui/lib/locale/lang/zh-TW'; //element 中文(繁体)
import enLocale from 'element-ui/lib/locale/lang/en'; //element 英文
//import ruLocale from 'element-ui/lib/locale/lang/ru-RU'; //element 俄语
//import viLocale from 'element-ui/lib/locale/lang/vi'; //element 越南语
//import koLocale from 'element-ui/lib/locale/lang/ko'; //element 韩语
//import jaLocale from 'element-ui/lib/locale/lang/ja'; //element 日语
//import esLocale from 'element-ui/lib/locale/lang/es'; //element 西班牙语
//import km_MMLocale from 'element-ui/lib/locale/lang/km'; //element 高棉语
//import th_THLocale from 'element-ui/lib/locale/lang/th'; //element 泰语
import de_DELocale from 'element-ui/lib/locale/lang/de'; //element 德语
//import pt_PTLocale from 'element-ui/lib/locale/lang/pt'; //element 葡萄牙语
import fr_FRLocale from 'element-ui/lib/locale/lang/fr'; //element 荷兰语
import nl_NLLocale from 'element-ui/lib/locale/lang/nl'; //element 法语
Vue.use(VueI18n);
let lang = localStorage.getItem('lang')
lang = ['zh_CN', 'en_US', 'de_DE', 'fr_FR', 'nl_NL'].indexOf(lang) > -1 ? lang : 'en_US'
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
    'de-DE': {
      ...de_DE,
      ...de_DELocale
    }, // 德语
    'fr_FR': {
      ...fr_FR,
      ...fr_FRLocale
    }, // 法语
    'nl_NL': {
      ...nl_NL,
      ...nl_NLLocale
    }, // 荷兰语
  },
  silentTranslationWarn: true,//解决vue-i18n黄色警告"value of key 'xxx' is not a string"和"cannot translate the value of keypath 'xxx'.use the value of keypath as default",可忽略
  missing: (locale, key, vm, values) => {
  	return values[0] && values[0][0] ? values[0][0] : ''
  }
});
export default i18n;

