import { upThemeColor, retrieveUserMsg } from '@/api/user'
import { Message } from 'element-ui'
import { setUInfo, getUInfo, removeUInfo} from '@/common/js/auth'
import router ,{resetRouter} from '@/routes'
import store from '@/store'
const state = {
  userInfo: JSON.parse(getUInfo()), //用户信息,
  sideBar: [],//菜单
  pagesIndex: [],//页面
  btnArray: []//按钮
}

const mutations = {
  RECEIVE_USER_INFO: (state, userInfo) => {
    state.userInfo = userInfo;
    let themeStr;
    if(userInfo.themeColor.length<15){
      themeStr = JSON.stringify({
        headerBg:"#304156",
        mainBg:"#f0f3f6",
        menuBg:"#304156",
        stripe:false ,
        fontSize:"16px"
      })
    }else{
      themeStr = userInfo.themeColor;
    }
    store.dispatch('theme/setTheme',themeStr)
    setUInfo(JSON.stringify(userInfo));
  },
  RESET_USER_INFO: (state) => {
    state.userInfo = {};
    removeUInfo();
  },
  SET_ROUTES :(state, userInfo) => {
    state.sideBar = userInfo.systemResourceBeanTree || [];
    state.pagesIndex = userInfo.pagesIndex || [];
    state.btnArray = userInfo.btnIndex || [];
  },
  DEL_ROUTES :(state)=>{
    state.sideBar = []
    state.pagesIndex = []
    state.btnArray = []
  }
}

const actions = {
  //同步记录用户信息
  recordUser({ commit }, userInfo) { //存储用户信息
    commit('RECEIVE_USER_INFO', userInfo)
  },
  logout({ commit }) {//重置 退出登录
    commit('RESET_USER_INFO')
    commit('DEL_ROUTES');
    resetRouter();
  },
 
  // 更新主题颜色 和字体大小
  setThemeColor({ commit }, theme) {
    return new Promise((resolve, reject) => {
      let params = {
        themeColor: JSON.stringify(theme)
      }
      upThemeColor(params).then(res => {
        if (res.success) {
          Message({
            message: res.msg,
            type: 'success'
          })
          store.dispatch('user/getUserInfo')
          resolve();
        } else {
          Message({
            message: res.msg,
            type: 'error'
          })
        }
      })
    })

  },
  getUserInfo({ commit }) {
    return new Promise((resolove,reject) => {
      retrieveUserMsg().then(res => {
        if(!res.data){
          reject('未获取到用户信息，请联系管理员')
          Message.error("未获取到用户信息，请联系管理员")
          return;
        }
        commit('RECEIVE_USER_INFO', res.data)
        commit('SET_ROUTES', res.data)
        resolove(res.data)
      }).catch(error => {
        reject(error)
      })
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
