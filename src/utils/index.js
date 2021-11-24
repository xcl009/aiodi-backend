/**
 * Created by PanJiaChen on 16/11/18.
 */

import FileSaver from 'file-saver'
import XLSX from 'xlsx'

/**
 * Parse the time to string
 * @param {(Object|string|number)} time
 * @param {string} cFormat
 * @returns {string | null}
 */
export function parseTime(time, cFormat) {
  if (arguments.length === 0 || !time) {
    return null
  }

  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}'
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const time_str = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') { return ['日', '一', '二', '三', '四', '五', '六'][value ] }
    return value.toString().padStart(2, '0')
  })
  return time_str
}

/**
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
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
}

/**
 * @param {Object} obj
 * @param {Object} arr
 * @returns {Object}
 */
export function pick(obj, arr) {
   return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {});
}

/**
 * @param {Array} roles 需要校验的角色key
 * @returns {Boole}
 */
export function checkRoles(roles = [], type = 1) {
   return roles.indexOf(agentInfo.level_key) > -1;
}

/**
 * 自适应布局
 */
export function setRem() {
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
}

/**
 * @param {String} text 复制的内容
 * @param {String} msg 提示内容
 */
export function copyText(text) {
  var aux = document.createElement("input");
  aux.setAttribute("value", text);
  document.body.appendChild(aux);
  aux.select();
  document.execCommand("copy");
  document.body.removeChild(aux);
}

export function outTab(tabId, fileName = 'data') {
  let fix = document.querySelector('.el-table__fixed-right') ? document.querySelector('.el-table__fixed-right') : document.querySelector('.el-table__fixed');
  let xlsxParam = { raw: true };
  let wb;
  if (fix) {
    wb = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`).removeChild(fix), xlsxParam)
    document.querySelector(`#${tabId}`).appendChild(fix)
  } else {
    wb = XLSX.utils.table_to_book(document.querySelector(`#${tabId}`), xlsxParam)
  }

  /* get binary string as output */
  let wbout = XLSX.write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array'
  })

  try {
    FileSaver.saveAs(new Blob([wbout], {
      type: 'application/octet-stream'
    }), `${fileName}.xlsx`);
  } catch (e) {
    if (typeof console !== 'undefined') console.log(e, wbout)
  }
  return wbout;
}

/**
 * @param {Objct} object 表达检验滚动到错误位置
 */
export function formErrow(object) {
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
}

/**
 * 千分位逗号去除
 */
export function delComma(num) {
  if(!num) return 0
  return parseFloat(num.toString().replace(/,/g, ''));
}

/**
 * 计算百分比
 */
export function countPer(num, total){
  if(!num || !total) return 0
  num = parseFloat(num.toString().replace(/[^\d\.-]/g, ''))
  if (typeof total === 'string') {
    total = (total.trim()).toString()
    if (total.length == 0) {
      total = 0
    } else {
      total = delComma(total)
    }
  }
  if (isNaN(num) || isNaN(total)) return 0
  return total <= 0 ? 0 : (Math.round(num / total * 10000) / 100.00)
}

/**
 * 图表设备颜色值
 */
export function colorPalette(){
  return {
    0: '#2ec7c9',
    1: '#b6a2de',
    2: '#5ab1ef',
    3: '#ffb980',
    4: '#d87a80',
    5: '#8d98b3',
    6: '#e5cf0d',
    7: '#97b552',
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
}

/**
 * 提取二维数组指定key
 */
export function arrayKeys(array = [], key = '', nkey = ''){
  if(!key) return nkey ? {} : []
  let arr = nkey ? {} : []
  array.map(item => {
    if(nkey) arr[nkey] = item[key]
    if(!nkey) arr.push(item[key])
  })
  return arr
}

/**
 * 取对象的指定属性
 */
export function pickKeys(obj = {}, arr = []) {
  let iter = {}
  for(var i in arr){
    if(obj[arr[i]] != undefined) iter[arr[i]] = obj[arr[i]]
  }
  return iter
}

/**
 * 分成是否一致
 */
export function showPercent (profit_info, key) {
  if(profit_info[key + '_relative_divide'] != 0 && !profit_info[key + '_relative_divide']) return '0%'
  return (profit_info[key + '_relative_divide'] == 1 ? profit_info[key + '_relative_percent'] : profit_info[key + '_percent']) + '%(' + (profit_info[key + '_virtual_divide'] == 1 ? '不一致' : '一致') + ',' + (profit_info[key + '_relative_divide'] == 1 ? '相对分成' : '真实分成') + ')'
}

/**
 * 百度经纬度转腾讯
 * @param lng
 * @param lat
 * @returns {{lng: number, lat: number}}
 */
export function bMapTransQQMap (lng,lat) {
  let x_pi = Math.PI * 3000.0 / 180.0;
  let x = lng - 0.0065;
  let y = lat - 0.006;
  let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);
  let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
  let lngs = z * Math.cos(theta);
  let lats = z * Math.sin(theta);
  return {
    lng:lngs,
    lat:lats
  }
};

/**
 * 腾讯经纬度转百度
 * @param lng
 * @param lat
 * @returns {{lng: number, lat: number}}
 */
export function qqMapTransBMap (lng,lat) {
  let x_pi = Math.PI * 3000.0 / 180.0;//Math.PI ~ 3.14159265358979324
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
};

/**
 * 数组元素前移后移
 * @param {Object} arr
 * @param {Object} index1
 * @param {Object} index2
 */
export function swapItems (arr, index1, index2) {
  arr[index1] = arr.splice(index2, 1, arr[index1])[0]
  return arr
}

/**
 * 浮点数加法
 */
export function accAdd(){
  var args = arguments, lens = args.length, d = 0, sum = 0;

  for (var key in args) {
    var str = "" + args[key];
    if (str.indexOf(".") != -1) {
      var temp = str.split(".")[1].length;
      d = d < temp ? temp : d;
    }
  }

  //计算需要乘的数值
  var m = Math.pow(10, d);

  //遍历所有参数并相加
  for (var key in args) {
    sum += args[key] * m;
  }

  return sum / m;
}

/**
 * 手机号隐藏中间4位
 */
export function dealPhone(tel, start = 3, end = 7, symbol = '****'){
  if(!tel) return tel
  tel = '' + tel
  return tel.replace(tel.substring(start, end), symbol)
}


export function mul(a, b) {
  var c = 0,
      d = a.toString(),
      e = b.toString();
  try {
      c += d.split(".")[1].length;
  } catch (f) {}
  try {
      c += e.split(".")[1].length;
  } catch (f) {}
  return Number(d.replace(".", "")) * Number(e.replace(".", "")) / Math.pow(10, c);
}

export function division(a, b) {
  var c, d, e = 0,
      f = 0;
  try {
      e = a.toString().split(".")[1].length;
  } catch (g) {}
  try {
      f = b.toString().split(".")[1].length;
  } catch (g) {}
  return c = Number(a.toString().replace(".", "")), d = Number(b.toString().replace(".", "")), mul(c / d, Math.pow(10, f - e));
}
