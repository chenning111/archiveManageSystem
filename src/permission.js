import Vue from 'vue'
import router from './routes'
import store from './store'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getUInfo } from '@/common/js/auth'
import { Loading, Message, MessageBox } from 'element-ui'
NProgress.configure({ showSpinner: true }) // 进度环显示隐藏
let bus = new Vue()
Vue.prototype.bus = bus
const whiteList = ['/login'] // no redirect whitelist
router.beforeEach(async (to, from, next) => {
  NProgress.start()

  let user = getUInfo()
  if (user) {
    if (to.path === '/login') {
      next('/')
      NProgress.done()
    } else {

      const hasRoles = store.state.user.pagesIndex && store.state.user.pagesIndex.length > 0
      if (hasRoles) {
        next()
      } else {
        try {
          // get user info
          const { pagesIndex } = await store.dispatch('user/getUserInfo');

          // 匹配路由
          const accessRoutes = await store.dispatch('permission/generateRoutes', pagesIndex)

          // 添加动态路由 
          router.addRoutes(accessRoutes.concat([{
            path: "*",
            redirect: "/404"
          }]))
          // router.addRoutes(accessRoutes)
          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/logout')
          // Message.error(error || 'Has Error')
          sessionStorage.setItem('referrer', to.fullPath);
          next()
          NProgress.done()
        }
      }

    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next('/login')
      NProgress.done()
    }
  }

})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})