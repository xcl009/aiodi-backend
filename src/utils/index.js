import {
  Message
} from 'element-ui'
import { parse } from 'qs'
import i18n from '../lang'

const util = {
  /**
   * @param {string} url
   * @returns {Object}
   */
  param2Obj: (url) => {
    const search = url.split('?')[1]
    if (!search) {
      return {}
    }
    return JSON.parse(
      '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"')
        .replace(/\+/g, ' ') +
      '"}'
    )
  },

  /**
   * @param {Array} roles 需要校验的角色key
   * @returns {Boole}
   */
  checkRoles: (roles = [], type = 1) => {
    return roles.indexOf(agentInfo.level_key) > -1;
  },
  currencySymbolposition:() => {
    if(agentInfo.brandId.indexOf(['1320720054202933249']) == '-1'){
      return false;
    }else{
      return true;
    }

  },

  /**
   * 自适应布局
   */
  setRem: () => {
    var base = 10
    var htmlWidth = document.documentElement.clientWidth || document.body.clientWidth
    var htmlDom = document.getElementsByTagName('html')[0]
    if (htmlWidth > 1280) {
      htmlWidth = 750
    } else if (htmlWidth > 750) {
      htmlWidth = 750
      base = 12
    } else {
      base = 7.5
    }
    htmlDom.style.fontSize = htmlWidth / base + 'px'
  },

  /**
   * @param {String} text 复制的内容
   * @param {String} msg 提示内容
   */
  copyText: (text) => {
    var aux = document.createElement("input")
    aux.setAttribute("value", text)
    document.body.appendChild(aux)
    aux.select()
    document.execCommand("copy")
    document.body.removeChild(aux)
    Message({
      message: i18n.t('public.copySuccess'),
      type: 'success'
    })
  },

  /**
   * @param {Objct} object 表达检验滚动到错误位置
   */
  formErrow: (object) => {
    for (let i in object) {
      let dom = this.$refs[i]
      if (Object.prototype.toString.call(dom) !== '[object Object]') dom = dom[0]
      //第一种方法（包含动画效果）
      dom.$el.scrollIntoView({ //滚动到指定节点
        block: 'center', //值有start,center,end，nearest，当前显示在视图区域中间
        behavior: 'smooth' //值有auto、instant,smooth，缓动动画（当前是慢速的）
      })
      break
    }
  },

  /**
   * 图表设备颜色值
   */
  colorPalette: () => {
    return {
      0: '#2ec7c9',
      1: '#b6a2de',
      2: '#5ab1ef',
      3: '#ffb980',
      4: '#d87a80',
      5: '#8d98b3',
      6: '#e5cf0d',
      7: '#c7ec69',
      8: '#95706d',
      9: '#dc69aa',
      10: '#07a2a4',
      11: '#9a7fd1',
      12: '#588dd5',
      13: '#f5994e',
      14: '#c05050',
      15: '#59678c',
      16: '#c9ab00',
      17: '#7eb00a',
      18: '#6f5553',
      19: '#c14089'
    }
  },

  /**
   * 百度经纬度转腾讯
   * @param lng
   * @param lat
   * @returns {{lng: number, lat: number}}
   */
  bMapTransQQMap: (lng, lat) => {
    let x_pi = Math.PI * 3000.0 / 180.0;
    let x = lng - 0.0065;
    let y = lat - 0.006;
    let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta);
    let lats = z * Math.sin(theta);
    return {
      lng: lngs,
      lat: lats
    }
  },

  /**
   * 腾讯经纬度转百度
   * @param lng
   * @param lat
   * @returns {{lng: number, lat: number}}
   */
  qqMapTransBMap(lng, lat) {
    let x_pi = Math.PI * 3000.0 / 180.0; //Math.PI ~ 3.14159265358979324
    let x = lng;
    let y = lat;
    let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
    let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
    let lngs = z * Math.cos(theta) + 0.0065;
    let lats = z * Math.sin(theta) + 0.006;
    return {
      lng: lngs,
      lat: lats
    }
  },

  /**
   * 数组元素前移后移
   * @param {Object} arr
   * @param {Object} index1
   * @param {Object} index2
   */
  swapItems: (arr, index1, index2) => {
    arr[index1] = arr.splice(index2, 1, arr[index1])[0]
    return arr
  },

  /**
   * 手机号隐藏中间4位
   */
  dealPhone: (tel, start = 3, end = 7, symbol = '****') => {
    if (!tel) return tel
    tel = '' + tel
    return tel.substr(0, start) + symbol + tel.substring(end, tel.length)
  },

  // 获取操作系统信息
  getOsInfo: () => {
    var userAgent = navigator.userAgent.toLowerCase();
    var name = 'Unknown';
    var version = 'Unknown';
    console.log(userAgent)
    if (userAgent.indexOf('win') > -1) {
      name = 'Windows';
      if (userAgent.indexOf('windows nt 5.0') > -1) {
        version = 'Windows 2000';
      } else if (userAgent.indexOf('windows nt 5.1') > -1 || userAgent.indexOf('windows nt 5.2') > -1) {
        version = 'Windows XP';
      } else if (userAgent.indexOf('windows nt 6.0') > -1) {
        version = 'Windows Vista';
      } else if (userAgent.indexOf('windows nt 6.1') > -1 || userAgent.indexOf('windows 7') > -1) {
        version = 'Windows 7';
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows 8') > -1) {
        version = 'Windows 8';
      } else if (userAgent.indexOf('windows nt 6.3') > -1) {
        version = 'Windows 8.1';
      } else if (userAgent.indexOf('windows nt 6.2') > -1 || userAgent.indexOf('windows nt 10.0') > -1) {
        version = 'Windows 10';
      } else {
        version = 'Unknown';
      }
    } else if (userAgent.indexOf('iphone') > -1) {
      name = 'iPhone';
    } else if (userAgent.indexOf('mac') > -1) {
      name = 'Mac';
    } else if (userAgent.indexOf('x11') > -1 || userAgent.indexOf('unix') > -1 || userAgent.indexOf('sunname') > -1 || userAgent.indexOf('bsd') > -1) {
      name = 'Unix';
    } else if (userAgent.indexOf('linux') > -1) {
      if (userAgent.indexOf('android') > -1) {
        name = 'Android';
      } else {
        name = 'Linux';
      }
    } else {
      name = 'Unknown';
    }
    return { name, version }
  },

  // 获取浏览器信息
  getBrowser: () => {
    var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
    var isIE11 = userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/); // IE 11中userAgent已经不包含'msie'所以用'msie'不能判断IE 11
    var isOpera = userAgent.indexOf("Opera") > -1; //判断是否Opera浏览器
    var isIE = (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) || isIE11; //判断是否IE浏览器
    var isEdge = userAgent.indexOf("Edge") > -1; //判断是否IE的Edge浏览器
    var isFF = userAgent.indexOf("Firefox") > -1; //判断是否Firefox浏览器
    var isSafari = userAgent.indexOf("Safari") > -1
      && userAgent.indexOf("Chrome") == -1; //判断是否Safari浏览器
    var isChrome = userAgent.indexOf("Chrome") > -1
      && userAgent.indexOf("Safari") > -1; //判断Chrome浏览器

    if (isIE) {
      var reIE = new RegExp("MSIE (\\d+\\.\\d+);");
      reIE.test(userAgent);
      var fIEVersion = parseFloat(RegExp["$1"]);
      if (fIEVersion == 7) {
        return "IE7";
      } else if (fIEVersion == 8) {
        return "IE8";
      } else if (fIEVersion == 9) {
        return "IE9";
      } else if (fIEVersion == 10) {
        return "IE10";
      } else if (isIE11) { // IE 11中userAgent已经不包含'msie'所以用'msie'不能判断IE 11
        return "IE11";
      } else {
        return "IE";
      }//IE版本过低
    }
    if (isOpera) {
      return "Opera";
    }
    if (isEdge) {
      return "Edge";
    }
    if (isFF) {
      return "Firefox";
    }
    if (isSafari) {
      return "Safari";
    }
    if (isChrome) {
      return "Chrome";
    }
    return '--'
  },

  /**
   * Parse the time to string
   * @param {(Object|string|number)} time
   * @param {string} cFormat
   * @returns {string | null}
   */
  parseTime: (time, cFormat) => {
    if (arguments.length === 0) {
      return null;
    } else if (!time) {
      return '--';
    }

    const format = cFormat || '{y}-{m}-{d} {h}:{i}';
    let date;

    if (typeof time === 'object') {
      date = time;
    } else {
      if (typeof time === 'string' && /^[0-9]+$/.test(time)) {
        time = parseInt(time);
      }

      if (typeof time === 'number' && time.toString().length === 10) {
        time = time * 1000;
      }

      date = new Date(time);
    }

    const formatObj = {
      y: date.getFullYear(),
      m: date.getMonth() + 1,
      d: date.getDate(),
      h: date.getHours(),
      i: date.getMinutes(),
      s: date.getSeconds(),
      a: date.getDay()
    };
    const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
      const value = formatObj[key]; // Note: getDay() returns 0 on Sunday

      if (key === 'a') {
        return [i18n.t('public.sunday'), i18n.t('public.one'), i18n.t('public.two'), i18n.t('public.three'), i18n.t('public.four'), i18n.t('public.five'), i18n.t('public.six')][value];
      }

      return value.toString().padStart(2, '0');
    });
    return time_str;
  },

  /**
   * 日期转时间戳
   * @param  datetime
   * @return {[unix]}
   */
  unixTime: (date) => {
    if (!date) return
    var curDate = new Date(date)
    return parseInt(curDate.getTime() / 1000);
  },

  /**
   * 千分位逗号去除
   */
  delComma: (num) => {
    if (!num) return 0
    return parseFloat(num.toString().replace(/,/g, ''))
  },

  /**
   * 计算百分比
   */
  countPer: (num, total) => {
    num = parseFloat(num.toString().replace(/[^\d\.-]/g, ''));

    if (typeof total === 'string') {
      total = total.trim().toString();

      if (total.length == 0) {
        total = 0;
      } else {
        total = util.delComma(total);
      }
    }

    if (isNaN(num) || isNaN(total)) return 0;
    return total <= 0 ? 0 : Math.round(num / total * 10000) / 100.00;
  },

  /**
   * 获取当前时间
   */
  currentTime: () => {
    return Date.parse(new Date()) / 1000;
  },

  /**
   ** 秒 转 天-时-分-秒
   **/
  formatSeconds: (value, cFormat = 'd-h-m-s', type = 1, strObj = {}) => {
    var theTime = parseInt(value),
      middle = 0,
      hour = 0,
      day = 0,
      result = ''
    if (theTime > 60) {
      if(type == 3){
        middle = Math.ceil(theTime / 60);
      }else{
        middle = parseInt(theTime / 60)
      }
      theTime = parseInt(theTime % 60)
      if (middle > 60) {
        hour = parseInt(middle / 60)
        middle = parseInt(middle % 60)
        if (hour > 24) {
          day = parseInt(hour / 24)
          hour = parseInt(hour / 24)
        }
      }
    }else if(type == 3 && theTime > 0){
      middle = 1
    }
    if (cFormat.indexOf('s') > -1 && (theTime > 0 || type == 2)) {
      result = '' + parseInt(theTime) + (strObj.s || i18n.t('public.second'))
    }
    if (cFormat.indexOf('m') > -1 && (middle > 0 || type == 2)) {
      result = '' + parseInt(middle) + (strObj.m || i18n.t('public.branch')) + result
    }
    if (cFormat.indexOf('h') > -1 && (hour > 0 || type == 2)) {
      result = '' + parseInt(hour) + (strObj.h || i18n.t('public.times')) + result
    }
    if (cFormat.indexOf('d') > -1 && (day > 0 || type == 2)) {
      result = '' + parseInt(day) + (strObj.d || i18n.t('public.day')) + result
    }
    return result
  },

  /**
   * 提取二维数组指定key
   */
  arrayKeys: (array = [], key = '') => {
    if (!key) return []
    let arr = []
    array.map(item => {
      arr.push(item[key])
    })
    return arr
  },

  /**
   * 数组指定key转对象
   */
  arrayToObj: (array = [], key = '', nkey = '') => {
    if (!key || !Array.isArray(array)) return {}
    let obj = {}
    array.map(item => {
      if (nkey && item[nkey] && (item[key] || item[key] == 0)) {
        obj[item[key]] = item[nkey]
      } else if (item[key] != 'undefined' && item[key] != null) {
        obj[item[key]] = item
      }
    })
    return obj
  },

  /**
   * 取对象的指定属性
   */
  pickKeys: (obj = {}, arr = []) => {
    let iter = {}
    for (var i in arr) {
      if (obj[arr[i]] != undefined) iter[arr[i]] = obj[arr[i]]
    }
    return iter
  },


  /**
   * @param {Object} obj
   * @param {Object} arr
   * @returns {Object}
   */
  pick: (obj, arr) => {
    return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});
  },

  /**
   * 校验字符是否存在于数组中
   */
  isBe: (arr, str) => {
    if (!arr) return false
    return arr.indexOf(str) > -1 || arr.indexOf(str.toString()) > -1
  },

  /**
   * 浮点数加法
   */
  accAdd: (arg1, arg2) => {
    var r1, r2, m, c
    arg1 = arg1 || 0
    arg2 = arg2 || 0
    try {
      r1 = arg1.toString().split(".")[1].length
    } catch (e) {
      r1 = 0
    }
    try {
      r2 = arg2.toString().split(".")[1].length
    } catch (e) {
      r2 = 0
    }

    c = Math.abs(r1 - r2)
    m = Math.pow(10, Math.max(r1, r2))
    if (c > 0) {
      var cm = Math.pow(10, c);
      if (r1 > r2) {
        arg1 = Number(arg1.toString().replace(".", ""));
        arg2 = Number(arg2.toString().replace(".", "")) * cm;
      } else {
        arg1 = Number(arg1.toString().replace(".", "")) * cm;
        arg2 = Number(arg2.toString().replace(".", ""));
      }
    } else {
      arg1 = Number(arg1.toString().replace(".", ""));
      arg2 = Number(arg2.toString().replace(".", ""));
    }
    return (arg1 + arg2) / m
  },

  /**
   * 浮点数乘法
   */
  accMul: (arg1, arg2) => {
    var c = 0,
      d = arg1 ? arg1.toString() : '0',
      e = arg2 ? arg2.toString() : '0';
    try {
      c += d.split(".")[1].length;
    } catch (f) { }
    try {
      c += e.split(".")[1].length;
    } catch (f) { }
    return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
  },

  /**
   ** 浮点数减法
   **/
  accSub: (arg1, arg2) => {
    var r1, r2, m, n;
    arg1 = arg1 || 0;
    arg2 = arg2 || 0;
    try {
      r1 = arg1.toString().split(".")[1].length;
    }
    catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    }
    catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2)); //last modify by deeka //动态控制精度长度
    n = (r1 >= r2) ? r1 : r2;
    return parseFloat(((arg1 * m - arg2 * m) / m).toFixed(n));
  },

  /**
   * 校验当前用户是否为SAAS
   */
  isSaas: () => {
    return agentInfo.userType == 'admin'
  },

  /**
   * 校验当前用户是否为品牌商
   */
  isBrand: () => {
    return agentInfo.userType == 'brand'
  },

  /**
   * 校验当前用户是否为商户
   */
  isStore: () => {
    return agentInfo.userType == 'store'
  },

  /**
   * 校验当前用户是否为代理商
   */
  isAgent: () => {
    return agentInfo.userType == 'agent'
  },

  /**
   * 获取角色名
   */
  getRoleName: (type) => {
    let roleName = {
      brand: i18n.t('rolesName.brand'),
      store: i18n.t('rolesName.store'),
      agent: i18n.t('rolesName.agent'),
      wechat: i18n.t('rolesName.wechat'),
      alipay: i18n.t('rolesName.alipay')
    }
    return roleName[type] || ''
  },

  /**
   * 套餐显示
   */
  showFeeMode: (type, mode, stype = 1, deviceTypeCode = '') => {
    if (!mode) return ''
    type = type || 1
    mode = JSON.parse(mode)
    let userType  = localStorage.getItem('userType'), currencySymbolL = '', currencySymbolR = ''
    if(userType != 'admin'){
      if(util.currencySymbolposition()){
        currencySymbolL = currencySymbol
      } else {
        currencySymbolR = currencySymbol
      }
    }
    if (type == 1) {
      if (deviceTypeCode && deviceTypeCode.indexOf('WM') > -1) {
        return `${window.config.washing_package[mode.time].title}${currencySymbolL}(${mode.money}${currencySymbolR}`
      }
      return mode.time >= 60 ? `${mode.time / 60}${i18n.t('public.huor')}${currencySymbolL}${mode.money}${currencySymbolR}` : `${mode.time}${i18n.t('public.minute')}${currencySymbolL}${mode.money}${currencySymbolR}`
    } else if(type == 5){
      let fee = `${mode.overBillingUnit}${i18n.t('public.minute')}${currencySymbolL}${mode.unitPrice}${currencySymbolR}`, stepStr = ''
      if (stype == 2) {
        stepStr += '，'
        mode.stepList.map(item => {
          if(item.endTime){
            stepStr += (i18n.t('public.stepList1')).i18Format(item.endTime, util.formatCurrency(item.maxAmount, 1))
          }else{
            stepStr += (i18n.t('public.stepList2')).i18Format(item.startingTime, util.formatCurrency(item.maxAmount, 1))
          }
        })
        fee = fee + stepStr
      }
      return fee
    } else {
      let fee = `${mode.startingTime}${i18n.t('public.minute')}${currencySymbolL}${mode.startingAmount}${currencySymbolR}`
      if (mode.startingTime != mode.overBillingUnit || mode.startingAmount != mode.unitPrice) {
        fee = `${i18n.t('public.front')}${mode.startingTime}${i18n.t('public.minute')}${currencySymbolL}${mode.startingAmount}${currencySymbolR}，${i18n.t('public.afterExceeding')}${mode.overBillingUnit}${i18n.t('public.minute')}${currencySymbolL}${mode.unitPrice}${currencySymbolR}`
      }
      if (stype == 2) {
        fee = `${fee}，${mode.maxBillingTimeUnit == 1440 ? i18n.t('public.dailyCapping') : mode.maxBillingTimeUnit + i18n.t('public.minCap')}${currencySymbolL}${mode.maxBillingTimePrice || 19.9}${currencySymbolR}，${i18n.t('public.totalCapping')}${currencySymbolL}${mode.maxAmount}${currencySymbolR}`
      }
      if(mode.feeTime > 0){
        fee = `${i18n.t('public.free')}${mode.feeTime}${i18n.t('public.minute')}${fee}`
      }
      return fee
    }
  },

  /**
   * 套餐名称显示
   */
  showFeeName: (type) => {
    let obj = {
      "1": i18n.t('public.package'),
      "2": i18n.t('public.freeOfCharge'),
      "3": i18n.t('payType.balance')
    }
    return obj[type] || ''
  },

  /**
   * 分成显示
   */
  divideType: (type) => {
    let obj = {
      "1": i18n.t('store.text'),
      "2": i18n.t('store.text2'),
      "3": i18n.t('store.inconsistentDivision')
    }
    return obj[type] || ''
  },

  /**
   * 默认计费
   */
  defaultFee: (code = '') => {
    let laundryMode = [
      {
        title: i18n.t('lang.text'),
        tag: 1,
        package: [
          {
            value: 15,
            money: 1
          },
          {
            value: 18,
            money: 2
          },
          {
            value: 20,
            money: 3
          }
        ]
      },
      {
        title: i18n.t('lang.text1'),
        tag: 2,
        package: [
          {
            value: 15,
            money: 1
          },
          {
            value: 18,
            money: 2
          },
          {
            value: 20,
            money: 3
          }
        ]
      }
    ];
    let stepPayMode = {
      depositAmount: 99,
      unitPrice: 0.1,
      overBillingUnit: 1,
      initialAmount: 0,
      stepList: [
        {
          startingTime: 0,
          endTime: 600,
          maxAmount: 3
        },
        {
          startingTime: 600,
          endTime: 1440,
          maxAmount: 8
        },
        {
          startingTime: 1440,
          maxAmount: 15
        }
      ]
    }
    let obj = {
      status: 1,
      closeType: '1',
      storePayConfig: ['weixin', 'alipay'],
      weixinPayMode: {
        modeType: 'PACKAGE',
        WMpayModeDetail: [
          {
            time: '46',
            money: 2
          }
        ],
        payModeDetail: [
          {
            time: 60,
            money: 2
          }
        ],
        laundryMode: laundryMode,
        stepPayMode: stepPayMode,
        payModeDetails: {
          startingTime: '60',
          startingAmount: 3,
          overBillingUnit: '60',
          unitPrice: 3,
          maxBillingTimeUnit: 1440,
          maxBillingTimePrice: 20,
          maxAmount: 99,
          depositAmount: 99
        },
      },
      alipayPayMode: {
        modeType: 'PACKAGE',
        WMpayModeDetail: [
          {
            time: '46',
            money: 2
          }
        ],
        payModeDetail: [
          {
            time: 60,
            money: 2
          }
        ],
        laundryMode: laundryMode,
        stepPayMode: stepPayMode,
        payModeDetails: {
          startingTime: '60',
          startingAmount: 3,
          overBillingUnit: '60',
          unitPrice: 3,
          maxBillingTimeUnit: 1440,
          maxBillingTimePrice: 20,
          maxAmount: 99,
          depositAmount: 99
        },
      },
      threePayMode: {
        modeType: 'PACKAGE',
        WMpayModeDetail: [
          {
            time: '46',
            money: 2
          }
        ],
        payModeDetail: [
          {
            time: 60,
            money: 2
          }
        ],
        laundryMode: laundryMode,
        stepPayMode: stepPayMode,
        payModeDetails: {
          startingTime: '60',
          startingAmount: 3,
          overBillingUnit: '60',
          unitPrice: 3,
          maxBillingTimeUnit: 1440,
          maxBillingTimePrice: 20,
          maxAmount: 99,
          depositAmount: 99
        },
      },
      fourPayMode: {
        modeType: 'PACKAGE',
        WMpayModeDetail: [
          {
            time: '46',
            money: 2
          }
        ],
        payModeDetail: [
          {
            time: 60,
            money: 2
          }
        ],
        laundryMode: laundryMode,
        stepPayMode: stepPayMode,
        payModeDetails: {
          startingTime: '60',
          startingAmount: 3,
          overBillingUnit: '60',
          unitPrice: 3,
          maxBillingTimeUnit: 1440,
          maxBillingTimePrice: 20,
          maxAmount: 99,
          depositAmount: 99
        },
      },
    }
    if (code && obj.weixinPayMode[`${code}payModeDetail`]) {
      obj.weixinPayMode.payModeDetail = obj.weixinPayMode[`${code}payModeDetail`]
      obj.alipayPayMode.payModeDetail = obj.alipayPayMode[`${code}payModeDetail`]
    }
    return obj
  },

  /**
   * 日期排序
   */
  dateSort: (property, bol = false) => {
    return function (a, b) {
      let value1 = a[property], value2 = b[property]
      if (bol) {
        // 升序
        return Date.parse(value1) - Date.parse(value2)
      } else {
        //降序
        return Date.parse(value2) - Date.parse(value1)
      }
    }
  },

  /**
   * 校验筛选条件重复
   * @param {Object} key
   * @param {Object} idx
   * @param {Object} formKey
   */
  checkQueryRepeat(key, idx, formKey) {
    return Object.values(formKey).indexOf(key) == -1 || Object.values(formKey).indexOf(key) == idx - 1
  },

  /**
   * 数字输入校验
   */
  checkDigit(val, min = 0, max = 100, p = 2, isEmpty = false) {
    let testReg = new RegExp("(^[0-9]{1," + max.toString().length + "}$)")
    if (p > 0) testReg = new RegExp("(^[0-9]{1," + max.toString().length + "}$)|(^[0-9]{1," + max.toString().length + "}[\\.]{1}[0-9]{1," + p + "}$)")
    val = val.replace(/,/g, "")
    if (isEmpty && val != 0 && !val) {

    } else if (parseFloat(val) > parseFloat(max)) {
      return `${i18n.t('lang.cannotBeGreaterThan')}${max}`
    } else if (parseFloat(val) < parseFloat(min)) {
      return `${i18n.t('lang.cannotBeLessThan')}${min}`
    } else if (parseFloat(val) < parseFloat(min)) {
      return `${i18n.t('lang.cannotBeLessThan')}${min}`
    } else if (testReg.test(val)) {
      return ''
    } else {
      return `${i18n.t('lang.range')}${min}-${max}${p > 0 ? `，${i18n.t('lang.afterDecimalPoint')}` + p + `${i18n.t('lang.position')}` : `${i18n.t('lang.integerOf')}`}`
    }
  },

  trim: (str) => {
    return str.replace(/\s/g, "");
  },

  ossThumbnail: (url, w = 200, h = '') => {
    if(!url) return ''
    url = url.split('?')
    let wStr = ','
    if(h) wStr += `h_${h},`
    if(w) wStr += `w_${w}`
    return url[0] + '?x-oss-process=image/resize,m_lfit' + wStr
  },

  formatCurrency: (number, type = 0) => {
  	if (!number) return 0
    if (number >= 1000) {
      number = parseFloat((number / 1000)) + 'K'
    }
    const types = util.currencySymbolposition();
  	// 将数字转换为字符串
  	const numberStr = number.toString()
  	// 使用正则表达式去除末尾的 .00
  	const trimmedNumber = numberStr.replace(/\.00$/, '')
  	// 应用千位格式化
  	const formattedNumber = trimmedNumber.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${types ? (type > 0 ? currencySymbol : ''):''}${formattedNumber}${types ? '':  (type > 0 ? currencySymbol : '') }`
  },
}

export const param2Obj = util.param2Obj
export const checkRoles = util.checkRoles
export const setRem = util.setRem
export const copyText = util.copyText
export const formErrow = util.formErrow
export const colorPalette = util.colorPalette
export const bMapTransQQMap = util.bMapTransQQMap
export const qqMapTransBMap = util.qqMapTransBMap
export const swapItems = util.swapItems
export const dealPhone = util.dealPhone
export const getOsInfo = util.getOsInfo
export const getBrowser = util.getBrowser
export const isSaas = util.isSaas
export const isBrand = util.isBrand
export const isStore = util.isStore
export const isAgent = util.isAgent
export const getRoleName = util.getRoleName
export const showFeeMode = util.showFeeMode
export const showFeeName = util.showFeeName
export const divideType = util.divideType
export const parseTime = util.parseTime
export const unixTime = util.unixTime
export const delComma = util.delComma
export const countPer = util.countPer
export const currentTime = util.currentTime
export const formatSeconds = util.formatSeconds
export const arrayKeys = util.arrayKeys
export const arrayToObj = util.arrayToObj
export const pickKeys = util.pickKeys
export const pick = util.pick
export const isBe = util.isBe
export const accAdd = util.accAdd
export const accMul = util.accMul
export const accSub = util.accSub
export const defaultFee = util.defaultFee
export const dateSort = util.dateSort
export const checkQueryRepeat = util.checkQueryRepeat
export const checkDigit = util.checkDigit
export const trim = util.trim
export const ossThumbnail = util.ossThumbnail
export const formatCurrency = util.formatCurrency
export const currencySymbolposition = util.currencySymbolposition
