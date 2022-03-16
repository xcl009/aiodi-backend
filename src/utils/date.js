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
  getMonthDays(myMonth){
    var monthStartDate = new Date(nowYear, myMonth, 1);
    var monthEndDate = new Date(nowYear, myMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  },

  //本季度的开始月份
  getQuarterStartMonth(){
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
  getWeekStartDate(){
    var weekStartDate = new Date(nowYear, nowMonth, nowDay + 1 - nowDayOfWeek).getTime();
    return weekStartDate / 1000
  },

  //本周的结束日期
  getWeekEndDate(){
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (7 - nowDayOfWeek)).getTime();
    return weekEndDate / 1000
  },

  //上周的开始日期
  getLastWeekStartDate(){
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 6).getTime();
    return weekStartDate / 1000
  },

  //上周的结束日期
  getLastWeekEndDate(){
    var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek).getTime();
    return weekEndDate / 1000
  },

  //本月的开始日期
  getMonthStartDate(){
    var monthStartDate = new Date(nowYear, nowMonth, 1).getTime();
    return monthStartDate / 1000
  },

  //本月的结束日期
  getMonthEndDate(){
    var monthEndDate = new Date(nowYear, nowMonth, this.getMonthDays(nowMonth)).getTime();
    return monthEndDate / 1000
  },

  //上月开始时间
  getLastMonthStartDate(){
    var lastMonthStartDate = new Date(nowYear, lastMonth, 1).getTime();
    return lastMonthStartDate / 1000
  },

  //上月结束时间
  getLastMonthEndDate(){
    var lastMonthEndDate = new Date(nowYear, lastMonth, this.getMonthDays(lastMonth)).getTime();
    return lastMonthEndDate / 1000
  },

  //本季度的开始日期
  getQuarterStartDate(){
    var quarterStartDate = new Date(nowYear, this.getQuarterStartMonth(), 1).getTime();
    return quarterStartDate / 1000
  },

  //本季度的结束日期
  getQuarterEndDate(){
    var quarterEndMonth = this.getQuarterStartMonth() + 2;
    var quarterStartDate = new Date(nowYear, quarterEndMonth,
      this.getMonthDays(quarterEndMonth)).getTime();
    return quarterStartDate / 1000
  }
}

export default DateUtil
