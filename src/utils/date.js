/**
 * 获取本周、本季度、本月、上月的开始日期、结束日期
 */
var now = new Date(); //当前日期
var nowDayOfWeek = now.getDay(); //今天本周的第几天
var nowDay = now.getDate(); //当前日
var nowMonth = now.getMonth(); //当前月
var nowYear = now.getYear(); //当前年
nowYear += (nowYear < 2000) ? 1900 : 0; //
var lastMonthDate = new Date(); //上月日期
lastMonthDate.setDate(1);
lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
var lastYear = lastMonthDate.getYear();
var lastMonth = lastMonthDate.getMonth();

var DateUtil = {
  //某月的天数
  getMonthDays(myMonth) {
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  },

  //本季度的开始月份
  getQuarterStartMonth() {
    var quarterStartMonth = 0;
    if (nowMonth < 3) {
      quarterStartMonth = 0;
    }
    if (2 < nowMonth && nowMonth < 6) {
      quarterStartMonth = 3;
    }
    if (5 < nowMonth && nowMonth < 9) {
      quarterStartMonth = 6;
    }
    if (nowMonth > 8) {
      quarterStartMonth = 9;
    }
    return quarterStartMonth;
  },

  //本周的开始日期
  getWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay + 1 - nowDayOfWeek).getTime();
    return weekStartDate / 1000
  },

  //本周的结束日期
  getWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek)).getTime();
    return weekEndDate / 1000
  },

  //上周的开始日期
  getLastWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 6).getTime();
    return weekStartDate / 1000
  },

  //上周的结束日期
  getLastWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek).getTime();
    return weekEndDate / 1000
  },

  //本月的开始日期
  getMonthStartDate() {
    var monthStartDate = new Date(nowYear, nowMonth, 1).getTime();
    return monthStartDate / 1000
  },

  //本月的结束日期
  getMonthEndDate() {
    var monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays(nowMonth)).getTime();
    return monthEndDate / 1000
  },

  //上月开始时间
  getLastMonthStartDate() {
    var lastMonthStartDate = new Date(nowYear, lastMonth, 1).getTime();
    return lastMonthStartDate / 1000
  },

  //上月结束时间
  getLastMonthEndDate() {
    var lastMonthEndDate = new Date(nowYear, lastMonth, this.getMonthDays(lastMonth)).getTime();
    return lastMonthEndDate / 1000
  },

  //本季度的开始日期
  getQuarterStartDate() {
    var quarterStartDate = new Date(nowYear, this.getQuarterStartMonth(), 1).getTime();
    return quarterStartDate / 1000
  },

  //本季度的结束日期
  getQuarterEndDate() {
    var quarterEndMonth = this.getQuarterStartMonth() + 2;
    var quarterStartDate = new Date(nowYear, quarterEndMonth,
      this.getMonthDays(quarterEndMonth)).getTime();
    return quarterStartDate / 1000
  },
  //1、 得到今天、昨天、明天日期
  //dates为数字类型，0代表今日,-1代表昨日，1代表明日，返回yyyy-mm-dd格式字符串，dates不传默认代表今日。
  getDate(dates, type = 1) {
    dates = Number(dates);
    var dd = new Date();
    var n = dates || 0;
    dd.setDate(dd.getDate() + n);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    m = m < 10 ? "0" + m : m;
    d = d < 10 ? "0" + d : d;
    // var day = y + "-" + m + "-" + d;
    let day = '';
    if (type == 1) {
      day = {
        start: y + "-" + m + "-" + d + ' ' + '00:00:00',
        end: y + "-" + m + "-" + d + ' ' + '23:59:59'
      }
    } else {
      day = {
        start: y + "-" + m + "-" + d,
        end: y + "-" + m + "-" + d
      }
    }

    return day;
  },
  //2、得到本周、上周、下周的起始、结束日期
  //type为字符串类型，有两种选择，"s"代表开始,"e"代表结束，dates为数字类型，不传或0代表本周，-1代表上
  getMonday(type, dates, types = 1) {
    var now = new Date();
    var nowTime = now.getTime();
    var day = now.getDay();
    var longTime = 24 * 60 * 60 * 1000;
    var n = longTime * 7 * (dates || 0);
    if (type == "s") {
      var dd = nowTime - (day - 1) * longTime + n;
    };
    if (type == "e") {
      var dd = nowTime + (7 - day) * longTime + n;
    };
    dd = new Date(dd);
    var y = dd.getFullYear();
    var m = dd.getMonth() + 1;
    var d = dd.getDate();
    m = m < 10 ? "0" + m : m;
    d = d < 10 ? "0" + d : d;
    var day = '';
    if (types == 1) {
      day = y + "-" + m + "-" + d + " " + (type == "s" ? '00:00:00' : '23:59:59');
    } else {
      day = y + "-" + m + "-" + d + " ";
    }

    return day;
  },
  //3、得到本月、上月、下月的起始、结束日期
  //type为字符串类型，有两种选择，"s"代表开始,"e"代表结束，months为数字类型，0代表本月，-1代表上月，1代表下月
  getMonth(type, months, types = 1) {
    var d = new Date();
    var year = d.getFullYear();
    var month = d.getMonth() + 1;
    if (Math.abs(months) > 12) {
      months = months % 12;
    };
    if (months != 0) {
      if (month + months > 12) {
        year++;
        month = (month + months) % 12;
      } else if (month + months < 1) {
        year--;
        month = 12 + month + months;
      } else {
        month = month + months;
      };
    };
    month = month < 10 ? "0" + month : month;
    var date = d.getDate();
    var firstday = '';
    if (types == 1) {
      firstday = year + "-" + month + "-" + "01" + ' ' + '00:00:00';
    } else {
      firstday = year + "-" + month + "-" + "01";
    }
    var lastday = "";
    if (types == 1) {
      if (month == "01" || month == "03" || month == "05" || month == "07" || month == "08" || month ==
        "10" ||
        month == "12") {
        lastday = year + "-" + month + "-" + 31 + ' ' + '23:59:59';
      } else if (month == "02") {
        if ((year % 4 == 0 && year % 100 != 0) || (year % 100 == 0 && year % 400 == 0)) {
          lastday = year + "-" + month + "-" + 29 + ' ' + '23:59:59';
        } else {
          lastday = year + "-" + month + "-" + 28 + ' ' + '23:59:59';
        };
      } else {
        lastday = year + "-" + month + "-" + 30 + ' ' + '23:59:59';
      };
    } else {
      if (month == "01" || month == "03" || month == "05" || month == "07" || month == "08" || month ==
        "10" ||
        month == "12") {
        lastday = year + "-" + month + "-" + 31;
      } else if (month == "02") {
        if ((year % 4 == 0 && year % 100 != 0) || (year % 100 == 0 && year % 400 == 0)) {
          lastday = year + "-" + month + "-" + 29;
        } else {
          lastday = year + "-" + month + "-" + 28;
        };
      } else {
        lastday = year + "-" + month + "-" + 30;
      };
    }
    var day = "";
    if (type == "s") {
      day = firstday;
    } else {
      day = lastday;
    };
    return day;
  },
  //4、得到今年、去年、明年的开始、结束日期
  //type为字符串类型，有两种选择，"s"代表开始,"e"代表结束，dates为数字类型，不传或0代表今年，-1代表去年，1代表明年
  getYear(type, dates, types = 1) {
    var dd = new Date();
    var n = dates || 0;
    var year = dd.getFullYear() + Number(n);
    if (type == "s") {
      var day = '';
      if (types == 1) {
        day = year + "-01-01" + ' ' + '00:00:00';
      } else {
        day = year + "-01-01";
      }
    };
    if (type == "e") {
      var day = '';
      if (types == 1) {
        day = year + "-12-31" + ' ' + '23:59:59';
      } else {
        day = year + "-12-31";
      }
    };
    if (!type) {
      var day = year + "-01-01/" + year + "-12-31";
    };
    return day;
  },
}

export default DateUtil
