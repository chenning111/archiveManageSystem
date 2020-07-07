<template>
  <el-container class="container">
    <el-header class="header flex-start" :style="'background-color:' + variables.headerTheme">
      <div class="logo pull-left flex-center">
        <img :src="logo" alt="logo" />
      </div>

      <!-- 伸缩按钮 -->
      <div class="collapse-btn pull-left flex-center" @click.prevent="collapse">
        <i class="el-icon-s-fold" v-if="!collapsed"></i>
        <i class="el-icon-s-unfold" v-else></i>
      </div>
      <div class="swipperContent pull-left flex-start">
        <div class="messageBtn" v-show="swipperMessageList.length > 0">
          <i class="iconfont icon-weibiaoti555"></i>
          <em>消息：</em>
        </div>
        <el-carousel
          height="40px"
          direction="vertical"
          :autoplay="true"
          indicator-position="none"
          style="width:65%"
        >
          <el-carousel-item
            v-for="(item, index) in swipperMessageList"
            :key="index"
            @click.native="goMessage(item.type)"
          >
            <span v-html="item.text"></span>
          </el-carousel-item>
        </el-carousel>
      </div>
      <div class="header-right pull-right">
        <div class="header-user-con">
          <!-- 全屏显示 -->
          <div class="btn-fullscreen" @click="handleFullScreen">
            <el-tooltip effect="dark" :content="fullscreen ? `取消全屏` : `全屏`" placement="bottom">
              <i class="el-icon-rank"></i>
            </el-tooltip>
          </div>
          <!-- 消息中心 -->
          <el-dropdown trigger="hover" class="btn-bell">
            <div>
              <el-badge :value="message" :max="99">
                <i class="el-icon-bell"></i>
              </el-badge>
              <span>
                消息
                <i class="el-icon-caret-bottom el-icon--right"></i>
              </span>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="goMessage('1')">
                申请消息
                <el-badge :value="messageObj.a" />
              </el-dropdown-item>
              <el-dropdown-item @click.native="goMessage('2')">
                催还消息
                <el-badge :value="messageObj.b" />
              </el-dropdown-item>
              <el-dropdown-item @click.native="goMessage('3')">
                归还消息
                <el-badge :value="messageObj.c" />
              </el-dropdown-item>
              <el-dropdown-item @click.native="goMessage('4')">
                报表消息
                <el-badge :value="messageObj.d" />
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>

          <!-- 用户头像 -->
          <div class="user-avator">
            <img :src="userInfo.avatar || userAvatar" />
          </div>
          <!-- 用户名下拉菜单 -->
          <el-dropdown class="user-name" trigger="hover">
            <span class="el-dropdown-link">
              {{ userInfo.userName || "" }}
              <i class="el-icon-caret-bottom"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native="setUp">设置</el-dropdown-item>
              <el-dropdown-item @click.native="setPassword">修改密码</el-dropdown-item>
              <el-dropdown-item divided @click.native="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <!--导航菜单-未折叠-->

    <el-aside
      class="sidebar"
      :style="'background-color:' + variables.menuTheme.menuBg"
      width="220px"
    >
      <el-menu
        :default-active="onRoutes"
        class="sidebar-el-menu"
        :class="variables.menuTheme.menuBg == '#ffffff' ? 'defaultMenu' : ''"
        unique-opened
        router
        :collapse="collapsed"
        :background-color="variables.menuTheme.menuBg"
        :text-color="variables.menuTheme.menuText"
        :active-text-color="variables.menuTheme.menuActiveText"
      >
        <template v-for="item in routesArray">
          <template v-if="item.childrens && item.type == 'menu'">
            <el-submenu :index="'/' + item.index" :key="item.id">
              <template slot="title">
                <i
                  :class="item.icon"
                  class="iconfont"
                  :style="'color:' + variables.menuTheme.menuText"
                ></i>
                <span slot="title">{{ item.title }}</span>
                <!-- <el-badge is-dot class="badgeJD" v-if="item.title == '档案鉴定'">
                </el-badge>-->
              </template>
              <template v-for="subItem in item.childrens">
                <el-submenu
                  v-if="subItem.childrens && item.type == 'menu'"
                  :index="'/' + subItem.index"
                  :key="subItem.index"
                >
                  <template slot="title">{{ subItem.title }}</template>
                  <el-menu-item
                    v-for="(threeItem, i) in subItem.childrens"
                    :key="i"
                    :index="'/' + threeItem.index"
                  >{{ threeItem.title }}</el-menu-item>
                </el-submenu>
                <el-menu-item v-else :index="'/' + subItem.index" :key="subItem.index">
                  <i
                    :class="subItem.icon"
                    class="iconfont"
                    v-if="subItem.icon"
                    :style="'color:' + variables.menuTheme.menuText"
                  ></i>
                  <span slot="title">{{ subItem.title }}</span>
                </el-menu-item>
              </template>
            </el-submenu>
          </template>
          <template v-else>
            <el-menu-item :index="'/' + item.index" :key="item.id">
              <i
                :class="item.icon"
                class="iconfont"
                :style="'color:' + variables.menuTheme.menuText"
              ></i>
              <span slot="title">{{ item.title }}</span>
            </el-menu-item>
          </template>
        </template>
      </el-menu>
    </el-aside>
    <!-- 主体部分 -->
    <el-row class="content-container" :class="collapsed ? 'content-collapse' : ''">
      <!-- 主体头部 -->
      <el-col :span="24" class="content-header clearBoth">
        <div class="pull-left content-title">
          <span class="shu-3">{{ $route.meta.title }}</span>
        </div>
        <div class="pull-left">
          <el-breadcrumb
            separator="/"
            style="display:inline-block;margin-right:5px;"
            class="breadcrumb"
          >
            <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index">{{ item }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="pull-right">
          <el-button icon="el-icon-refresh" size="small" @click="refresh" type="primary">刷新</el-button>
          <el-button
            icon="el-icon-arrow-left"
            size="small"
            @click="$router.back(-1)"
            type="success"
          >返回</el-button>
        </div>
      </el-col>
      <el-main class="content-wrapper" :style="'background-color:' + variables.mainTheme">
        <!--使用keep-alive会将页面缓存-->
        <transition name="fade-transform" mode="out-in">
          <keep-alive :include="cachedViews">
            <router-view></router-view>
          </keep-alive>
        </transition>
      </el-main>
    </el-row>
    <!-- 返回顶部 -->
    <back-top></back-top>
  </el-container>
</template>

<script>
import { loginOut } from "@/api/user";
import backTop from "../components/backTop";
import { retrieveMessage } from "@/api/message";
import variables from "@/styles/variables.scss";
import { deepClone } from "@/common/js/util";
export default {
  inject: ["reload"],
  data() {
    return {
      message: 0,
      messageObj: {
        a: 0, //申请消息,
        b: 0, //催还消息,
        c: 0, //归还消息
        d: 0 //报表消息
      },
      fullscreen: false,
      collapsed: false,
      userAvatar: require("../assets/img/userAvatar.png"),
      logo: require("../assets/img/homeLogo.png"),
      timer: null,
      breadcrumbListStr: "",
      breadcrumbList: [],
      swipperMessageList: []
    };
  },
  computed: {
    variables() {
      let menuTheme = this.$store.getters.menuTheme;
      let headerTheme = this.$store.getters.headerTheme;
      let mainTheme = this.$store.getters.mainTheme;
      return { menuTheme, headerTheme, mainTheme };
    },
    onRoutes() {
      const { path, meta } = this.$route;
      let activeMenu = meta.activeMenu;
      if (activeMenu) {
        if (activeMenu.indexOf("/") > -1) {
          return activeMenu;
        } else {
          return "/" + activeMenu;
        }
      }
      return this.$route.path;
    },

    userInfo() {
      return this.$store.getters.userInfo || {};
    },
    cachedViews() {
      return this.$store.state.permission.cachedViews || [];
    },
    routesArray() {
      let data = deepClone(this.$store.state.user.sideBar);
      let tree = this.getSideBar(data);
      return tree;
    }
  },
  methods: {
    getSideBar(data) {
      //找到type= menu  然后把children = []变成null
      let newdata = data.filter(item => item.type == "menu");
      newdata.forEach(item => {
        item.childrens && (item.childrens = this.getSideBar(item.childrens));
        if (item.childrens.length == 0) {
          item.childrens = null;
        }
      });
      return newdata;
    },
    // 全屏事件
    handleFullScreen() {
      let element = document.documentElement;
      if (this.fullscreen) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitCancelFullScreen) {
          document.webkitCancelFullScreen();
        } else if (document.mozCancelFullScreen) {
          document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          document.msExitFullscreen();
        }
      } else {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.webkitRequestFullScreen) {
          element.webkitRequestFullScreen();
        } else if (element.mozRequestFullScreen) {
          element.mozRequestFullScreen();
        } else if (element.msRequestFullscreen) {
          // IE11
          element.msRequestFullscreen();
        }
      }
      this.fullscreen = !this.fullscreen;
    },
    setPassword() {
      this.$router.push("/changePassword");
    },
    // 退出登录
    logout: function() {
      var _this = this;
      this.$confirm("确认退出吗?", "提示", {
        type: "warning"
      })
        .then(() => {
          loginOut({ userCode: this.userInfo.userCode }).then(data => {
            if (data.success) {
              this.$message.success(data.msg);
              sessionStorage.removeItem("referrer");
              _this.$store.dispatch("user/logout"); //删除用户信息
              sessionStorage.removeItem("tableViewTreeStr");
              sessionStorage.removeItem("fondsList");
              sessionStorage.removeItem("departmentTree");
              _this.$router.push({
                path: "/login"
              });
            } else {
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    },
    // 折叠导航栏
    collapse: function() {
      this.collapsed = !this.collapsed;
    },
    refresh() {
      this.reload();
    },
    setUp() {
      this.$router.push({ path: "/theme" });
    },
    goMessage(flag) {
      this.$router.push({
        name: "messagePage",
        query: {
          flag: flag
        }
      });
    },
    getMessage() {
      let params = {
        limit: 9999,
        star: 1
      };
      retrieveMessage(params)
        .then(res => {
          if (res.success) {
            this.swipperMessageList = [];
            let arr = res.data.list || [];
            let noRead = arr.filter(item => item.messagestatus == 0);
            let sq = noRead.filter(item => item.type == 1).length; //申请消息未读个数
            let ch = noRead.filter(item => item.type == 2).length; //催还消息未读个数
            let gh = noRead.filter(item => item.type == 3).length; //归还还消息未读个数
            let bb = noRead.filter(item => item.type == 4).length; //报表消息未读个数
            arr.forEach((val, index) => {
              if (val.messagestatus == 0) {
                if (val.type == 4 && val.useStatus == "生成报表成功") {
                  if (val.messagetitle.indexOf("；") > -1) {
                    let json = JSON.parse(val.messagetitle.split("；")[1]);
                    let str = "";
                    for (let i in json) {
                      if (i == "sort") {
                        str += "排序：";
                        json[i].forEach(item => {
                          str += `${item.field}-${item.des}，`;
                        });
                      }
                      if (i == "condition") {
                        str += "<br />条件：";
                        json[i].forEach(item => {
                          str += `${item.field}-${item.des}，`;
                        });
                      }
                    }
                    val.messagetitle =
                      val.messagetitle.split("；")[0] + ";<br/>" + str;
                  }
                }
                this.swipperMessageList.push({
                  type: val.type,
                  text: val.messagetitle
                });
              }
            });
            this.message = noRead.length;
            this.messageObj = {
              a: sq || 0,
              b: ch || 0,
              c: gh || 0,
              d: bb || 0
            };
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {});
    }
  },
  mounted() {
    //面包屑
    this.bus.$on("breadcrumbListStr", str => {
      this.breadcrumbListStr = str;
      this.$route.meta.breadcrumbListStr = str;
      this.breadcrumbList = str.split(",");
    });
    this.bus.$on("messageNum", num => {
      this.message = num;
    });
    //1分钟调消息接口
    this.timer = setInterval(this.getMessage, 60000);
    this.getMessage();
  },

  components: {
    backTop
  },
  watch: {
    $route(newval, oldval) {
      //监听路由 每次跳转让他定位到顶部
      document.querySelector(".content-wrapper").scrollTop = 0;
      if (
        this.$route.meta.breadcrumbListStr &&
        this.cachedViews.includes(newval.name)
      ) {
        this.breadcrumbList = this.$route.meta.breadcrumbListStr.split(",");
      } else {
        this.breadcrumbList = [];
      }
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.bus.$off("breadcrumbListStr");
    this.bus.$off("messageNum");
  }
};
</script>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  overflow-y: hidden;
  .header {
    height: 60px;
    width: 100%;

    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    padding: 0;
    color: #fff;
    .logo {
      height: 60px;
      font-size: 22px;
      width: 220px;
      line-height: 60px;
      img {
        vertical-align: middle;
        width: 140px;
      }
    }
    .collapse-btn {
      width: 30px;
      height: 60px;
      cursor: pointer;
      margin-left: 20px;
      i {
        font-size: 24px;
      }
    }
    .swipperContent {
      flex: 1;
      height: 60px;
      .messageBtn {
        margin: 0 10px;
        i {
          vertical-align: middle;
          font-size: 22px;
        }
        em {
          font-size: 16px;
          font-style: normal;
        }
      }
      span {
        cursor: pointer;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
        display: block;
        line-height: 40px;
        font-size: 16px;
      }
    }
    .header-right {
      padding-right: 35px;
      line-height: 60px;
      .header-user-con {
        display: flex;
        height: 60px;
        align-items: center;
      }
      .btn-fullscreen {
        transform: rotate(45deg);
        margin-right: 15px;
      }
      .btn-bell,
      .btn-fullscreen {
        position: relative;
        // width: 30px;
        text-align: center;
        border-radius: 15px;
        cursor: pointer;
      }
      .btn-fullscreen i {
        font-size: 24px;
      }
      .btn-bell span {
        color: #fff;
        margin-left: 5px;
        font-size: 16px;
      }
      .btn-bell .el-icon-bell {
        color: #fff;
        font-size: 22px;
      }

      .user-name {
        margin-left: 10px;
      }
      .user-avator {
        margin-left: 20px;
      }
      .user-avator img {
        display: block;
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
      .el-dropdown-link {
        color: #fff;
        cursor: pointer;
        font-size: 16px;
      }
      .el-dropdown-menu__item {
        text-align: center;
      }
    }
  }
  .sidebar::-webkit-scrollbar {
    width: 0;
  }

  .sidebar {
    position: absolute;
    left: 0;
    top: 60px;
    bottom: 0;
    overflow-y: scroll;
    padding-bottom: 20px;
    scrollbar-width: none; //兼容火狐 滚动条不显示
    -ms-overflow-style: none; //兼容ie10
    .badgeJD {
      position: relative;
      top: -12px;
      border: none;
    }
    .sidebar-el-menu:not(.el-menu--collapse) {
      width: 220px;
    }
    .sidebar > ul {
      height: 100%;
    }
  }
  .content-container {
    position: absolute;
    top: 60px;
    left: 221px;
    bottom: 0;
    right: 0;
    -webkit-transition: left 0.3s ease-in-out;
    transition: left 0.3s ease-in-out;
    .content-header {
      border-bottom: 1px solid #d8dce5;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
      height: 50px;
      background-color: #fff;
      line-height: 50px;
      padding-left: 20px;
      padding-right: 40px;
      .content-title span {
        font-size: 16px;
        color: #666;
        padding-left: 5px;
        margin-right: 20px;
      }
      .breadcrumb {
        vertical-align: middle;
      }
    }
    .content-wrapper {
      background-color: #f0f3f6;
      padding: 20px;
      width: 100%;
      height: 100%;
      overflow-y: visible;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      section:first-child {
        box-sizing: border-box;
        margin-bottom: 50px;
        overflow: hidden;
      }
    }
  }
  .content-collapse {
    left: 65px;
  }
}
</style>

<style lang="scss">
body .btn-bell {
  .el-badge__content {
    top: 18px !important;
  }
}

.defaultMenu {
  //默认menu
  .el-submenu__title,
  .el-menu-item {
    &:hover {
      background-color: #ecf5ff !important;
    }
  }
}
</style>
