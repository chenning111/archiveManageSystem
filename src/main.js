// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
//请阅读readme文件 包含启动项目，项目部署文件夹设置等信息
import Vue from "vue";
import App from "./App";
import "babel-polyfill";
import "element-ui/lib/theme-chalk/index.css";
import "./assets/css/iconfont/iconfont.css";
import router from "./routes";
import "font-awesome/css/font-awesome.min.css"; //字体图标库
import "@/styles/index.scss";
import store from "./store";
import "@/common/js/directives.js";
import "@/common/js/filter.js";
import "@/common/js/date";
import "./permission"; // permission control
import is_disabled from "@/common/js/permission";
import axios from "axios";
import Print from "vue-print-nb";
import "@/common/js/resetMessage";
Vue.use(Print); // 注册

Vue.config.productionTip = false;
let url =
  process.env.NODE_ENV == "production"
    ? process.env.routerURL + "/static/config.json?"
    : "/static/config.json?"; //获取接口的json
let pdfHtmlURL =
  process.env.NODE_ENV == "production"
    ? "./static/pdf/web/viewer.html"
    : "/static/pdf/web/viewer.html"; //获取pdf地址
Vue.prototype.$is_disabled = is_disabled; //判断按钮是否可用
axios.get(url).then(res => {
  Vue.prototype.pdfHtmlURL = pdfHtmlURL;
  Vue.prototype.baseURL = res.data.baseURL;
  Vue.prototype.webSocketUrl = res.data.webSocketUrl;
  Vue.prototype.isEditDataSource = res.data.isEditDataSource;
  axios.defaults.baseURL = res.data.baseURL;
  new Vue({
    el: "#app",
    router,
    store,
    components: { App },
    template: "<App/>"
  });
});
