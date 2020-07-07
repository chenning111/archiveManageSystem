import Vue from "vue";

//过滤文件大小
Vue.filter("toSize", function(size) {
  //k为单位
  if (!size) return "0.00M";
  let bsize = size * 1024;
  let num = 1024.0; //byte
  if (bsize < num) return bsize + "B";
  if (bsize < Math.pow(num, 2)) return (bsize / num).toFixed(2) + "K"; //kb
  if (bsize < Math.pow(num, 3))
    return (bsize / Math.pow(num, 2)).toFixed(2) + "M"; //M
  if (bsize < Math.pow(num, 4))
    return (bsize / Math.pow(num, 3)).toFixed(2) + "G"; //G
  return (bsize / Math.pow(num, 4)).toFixed(2) + "T"; //T
});
Vue.filter("filterFillingYear", function(val) {
  //过滤归档年度 ws2000 =>2000
  if (!val) {
    return "";
  }
  let reg = /[0-9]+/g; //匹配数字
  let arr = String(val).match(reg);
  if (arr) {
    return arr[arr.length - 1];
  }
  return "";
});
