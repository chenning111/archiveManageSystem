/** 将 Date 转化为指定格式的String   
 * 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，   
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)   
 * 例子：   
 * new Date(date).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423   
 * new Date(date).fomat("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18   
 **/
Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份 
        "d+": this.getDate(),                    //日 
        "h+": this.getHours(),                   //小时 
        "m+": this.getMinutes(),                 //分 
        "s+": this.getSeconds(),                 //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds()             //毫秒 
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
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

//格式化日期：yyyy-MM-dd 
function formatDate(date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();

    if (mymonth < 10) {
        mymonth = "0" + mymonth;
    }
    if (myweekday < 10) {
        myweekday = "0" + myweekday;
    }
    return (myyear + "-" + mymonth + "-" + myweekday);
}


//获得本季度的开始月份 
function getQuarterStartMonth() {
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
}
export function getNowFromDay(day) {
    var date1 = new Date();
    var time1 = date1.getFullYear() + "-" + (date1.getMonth() + 1) + "-" + date1.getDate();//time1表示当前时间
    var date2 = new Date(date1);
    date2.setDate(date1.getDate() + day);
    var time2 = date2.getFullYear() + "-" + (date2.getMonth() + 1) + "-" + date2.getDate();
    return time2
}
//获得本周的开始日期 
export function getWeekStartDate() {
    var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek);
    return formatDate(weekStartDate);
}

//获得本周的结束日期 
export function getWeekEndDate() {
    var weekEndDate = new Date(nowYear, nowMonth, nowDay + (6 - nowDayOfWeek));
    return formatDate(weekEndDate);
}

//获得本月的开始日期 
export function getMonthStartDate() {
    var monthStartDate = new Date(nowYear, nowMonth, 1);
    return formatDate(monthStartDate);
}

//获得本月的结束日期 
export function getMonthEndDate() {

    var days = getMonthDays(nowMonth);//获取当月总共有多少天
    var monthEndDate = new Date(nowYear, nowMonth, days);
    return formatDate(monthEndDate); //返回当月结束时间
}

// 注意：因为上面这个方法里的getMonthDays(nowMonth)方法 我尝试使用失败，我不知道是什么原因 所以我用了另外个方法如下（获得某月的天数,需要配合文章开头的公式 ）：

//获得某月的天数 （与上面有重复可删除，不然本月结束日期报错）
function getMonthDays(nowyear, myMonth) {
    var lastMonthStartDate = new Date(nowyear, lastMonth, 1);
    var lastMonthEndDate = new Date(nowyear, lastMonth + 1, 1);
    var days = (lastMonthEndDate - lastMonthStartDate) / (1000 * 60 * 60 * 24);//格式转换
    return days;
}

//获得上月开始时间
export function getLastMonthStartDate() {
    var lastMonthStartDate = new Date(nowYear, lastMonth, 1);
    return formatDate(lastMonthStartDate);
}

//获得上月结束时间
export function getLastMonthEndDate() {
    var lastMonthEndDate = new Date(nowYear, lastMonth, getMonthDays(lastMonth));
    return formatDate(lastMonthEndDate);
}

//获得本季度的开始日期 
export function getQuarterStartDate() {

    var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
    return formatDate(quarterStartDate);
}

//或的本季度的结束日期 
export function getQuarterEndDate() {
    var quarterEndMonth = getQuarterStartMonth() + 2;
    var quarterStartDate = new Date(nowYear, quarterEndMonth, getMonthDays(quarterEndMonth));
    return formatDate(quarterStartDate);
}

//获取本年开始-当前时间

var currentYear = now.getFullYear();//获得当前年份4位年

var currentYearFirstDate = new Date(currentYear, 0, 1); //本年第一天

var startTime = currentYearFirstDate.getFullYear() + '-' + (currentYearFirstDate.getMonth() + 1) + '-' + currentYearFirstDate.getDate() + '' + currentYearFirstDate.getHours() + ':' + currentYearFirstDate.getMinutes() + ':' +

    currentYearFirstDate.getSeconds(); //格式化本年第一天日期

var currentYearEndDate = now; //当前时间

/**
     * getXAxis（）方法作用：获取开始日期和结束日期之间（包含开始日期和结束日期）的日期数组，可作为时间轴坐标等
     * @param  filters: {tab:0/1/2, startTime:开始日期, endTime:结束日期}
     * 说明： tab：取值0或1或2，分别表示日、月、年，对应的startTime和endTime的格式分别为'yyyy-MM-dd'、'yyyy-MM'、'yyyy'
 */
export const getXAxis = (filters)=>{
    var tab = filters.tab;
        var startTime = new Date(filters.startTime);
        var endTime = new Date(filters.endTime);
        var length = 0;   //日期跨度变量

        if( 0 == tab ) {
            length = (endTime.getTime() - startTime.getTime()) / (1000*24*60*60) + 1;
        } else if( 1 == tab ) {
            length = (endTime.getFullYear() - startTime.getFullYear()) * 12 + (endTime.getMonth() - startTime.getMonth()) + 1;
        } else {
            length = endTime.getFullYear() - startTime.getFullYear() + 1;
        }

        var xAxis = new Array(length);
        xAxis[0] = filters.startTime;
        for( var i = 1; i < length; i++ ) {
            if( 0 == tab ) {
                startTime.setDate( startTime.getDate() + 1 );
                xAxis[i] = startTime.format("yyyy-MM-dd");
            } else if( 1 == tab ) {
                startTime.setMonth( startTime.getMonth() + 1 );
                xAxis[i] = startTime.format("yyyy-MM");
            } else {
                startTime.setFullYear( startTime.getFullYear() + 1 );
                xAxis[i] = startTime.format("yyyy");
            }
        }

        return xAxis;
}