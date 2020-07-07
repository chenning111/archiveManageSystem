import { asyncRoutes, constantRoutes } from '@/routes'
import { deepClone } from '@/common/js/util'
export function filterAsyncRoutes(asyncRoutes, pagesIndex = []) {
  const res = []
  const asyncData = deepClone(asyncRoutes);
  const cachedViews = [];
  let data = asyncRoutes[0].children;
  for (let i = 0; i < pagesIndex.length; i++) {
    for (let j = 0; j < data.length; j++) {
      if (data[j].name === pagesIndex[i]) {
        if (data[j].meta.keepAlive) {
          cachedViews.push(data[j].path);
          if(data[j].redirect){ //重定向路由也加入缓存
            cachedViews.push(data[j].redirect);
          }
        }
        res.push(data[j])
        break
      }
    }
  }
  asyncData[0].children = res;
  state.cachedViews = cachedViews
  return asyncData
}

const state = {
  routes: [],
  addRoutes: [],
  cachedViews: [] //缓存组件
}

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes
    state.routes = constantRoutes.concat(routes)
  },
  DEL_CACHEDVIEWS: (state, name) => {
    state.cachedViews = state.cachedViews.filter(item => item != name)
  },
  ADD_CACHEDVIEWS:(state, name)=>{
      if(!state.cachedViews.includes(name)){
        state.cachedViews.push(name)
      }
  }
}

const actions = {
  generateRoutes({ commit }, pagesIndex) {
    return new Promise(resolve => {
      let accessedRoutes;
      // 去重pagesIndex
      pagesIndex = Array.from(new Set(pagesIndex))
      accessedRoutes = filterAsyncRoutes(asyncRoutes, pagesIndex);
      commit('SET_ROUTES', accessedRoutes)
      resolve(accessedRoutes)
    })
  },
  del_cachedViews({commit},name){
    return new Promise((resolve,reject)=>{
      commit('DEL_CACHEDVIEWS',name)
      resolve()
    })
  },
  add_cachedViews({commit},name){
    return new Promise((resolve,reject)=>{
      commit('ADD_CACHEDVIEWS',name)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
