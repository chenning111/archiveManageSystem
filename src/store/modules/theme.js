import { upThemeColor, retrieveUserMsg } from "@/api/user";
import { Table } from "element-ui";
import variables from "@/styles/variables.scss";
const state = {
  menu: {
    menuText: variables.BmenuText,
    menuActiveText: variables.BmenuActiveText, //不变
    menuBg: variables.BmenuBg
  },
  header: {
    headerBg: variables.AheaderBg
  },
  mainBg: {
    backgroundColor: variables.backgroundColor
  },
  stripe: "",
  fontSize: ""
};

const mutations = {
  SET_THEME: (state, theme) => {
    let themeObj = JSON.parse(theme);
    state.header.headerBg = themeObj.headerBg;
    state.mainBg.backgroundColor = themeObj.mainBg;
    state.stripe = themeObj.stripe;
    state.fontSize = themeObj.fontSize;
    if (themeObj.menuBg !== "#304156") {
      //如果是默认
      state.menu.menuBg = variables.BmenuBg;
      state.menu.menuText = variables.BmenuText;
      state.menu.menuActiveText = variables.BmenuActiveText;
      createDefaultCss(); //添加默认样式表
    } else {
      state.menu.menuBg = variables.AmenuBg;
      state.menu.menuText = variables.AmenuText;
      state.menu.menuActiveText = variables.AmenuActiveText;
      deleteDefaultCss(); //删除默认样式表
    }
    Table.props.stripe = {
      type: Boolean,
      default: themeObj.stripe == "T" ? true : false
    };
    createFontSizeCss(themeObj.fontSize, themeObj.menuBg);
  }
};

const actions = {
  setTheme({ commit, state }, theme) {
    //设置主题
    commit("SET_THEME", theme);
  }
};
let css =
  ".el-menu--vertical .el-menu-item:hover {background-color: #ecf5ff !important;}";
function createDefaultCss() {
  let styleElement = document.getElementById("defaultCss");
  if (!styleElement) {
    styleElement = document.createElement("style");
    styleElement.setAttribute("type", "text/css");
    styleElement.setAttribute("id", "defaultCss");
    document.getElementsByTagName("head")[0].appendChild(styleElement);
  }
  styleElement.appendChild(document.createTextNode(css));
}
function deleteDefaultCss() {
  let styleElement = document.getElementById("defaultCss");
  if (styleElement) {
    document.getElementsByTagName("head")[0].removeChild(styleElement);
  }
}
function createFontSizeCss(fontSize = "16px", menuBg) {
  let css = `.el-table{font-size:${fontSize} !important;} #app{font-size:${fontSize} !important;}`;
  if (menuBg == "#304156") {
    //激活颜色和图标
    css = `#app .sidebar .is-active>.el-submenu__title span,#app .sidebar .is-active>.el-submenu__title i{color: #f4f4f5!important;}
         .el-table{font-size:${fontSize} !important;}
          #app{font-size:${fontSize} !important;}`;
  }
  let styleElement = document.getElementById("fontCss");
  if (styleElement) {
    document.getElementsByTagName("head")[0].removeChild(styleElement);
  }
  styleElement = document.createElement("style");
  styleElement.setAttribute("type", "text/css");
  styleElement.setAttribute("id", "fontCss");
  document.getElementsByTagName("head")[0].appendChild(styleElement);
  styleElement.appendChild(document.createTextNode(css));
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
