<template>
  <div class="bgcolor flex-center" style="flex-direction:column">
    <div class="content" :style="isLogin? 'height:320px':'height:380px'">
      <div class="cn-logo">
        <img src="../assets/img/logo.png" alt />
      </div>
      <h3 class="title">文盛档案综合管理系统</h3>
      <el-form
        v-if="isLogin"
        :model="loginForm"
        :rules="loginRules"
        ref="loginForm"
        label-position="left"
        label-width="0px"
      >
        <el-form-item prop="account">
          <el-input
            type="text"
            v-model="loginForm.account"
            auto-complete="on"
            placeholder="账号"
            clearable
            ref="account"
            name="account"
            @keyup.enter.native="handleSubmit"
          ></el-input>
        </el-form-item>
        <el-form-item prop="checkPass">
          <el-input
            type="password"
            v-model="loginForm.checkPass"
            auto-complete="on"
            placeholder="密码"
            show-password
            clearable
            name="checkPass"
            ref="checkPass"
            @keyup.enter.native="handleSubmit"
          ></el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button
            type="primary"
            style="width:100%;"
            @click.native.prevent="handleSubmit"
            :loading="logining"
            class="btn"
          >登录</el-button>
        </el-form-item>
      </el-form>
      <el-form
        v-loading="sourceLoading"
        v-if="!isLogin"
        :model="dataSource"
        :rules="dataRules"
        ref="dataSource"
        label-position="left"
        label-width="0px"
      >
        <el-form-item prop="username">
          <el-input
            type="text"
            v-model="dataSource.username"
            auto-complete="on"
            placeholder="用户名"
            clearable
            name="username"
            @keyup.enter.native="handleDataSource"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            type="text"
            v-model="dataSource.password"
            auto-complete="on"
            placeholder="密码"
            clearable
            name="password"
            @keyup.enter.native="handleDataSource"
          ></el-input>
        </el-form-item>
        <el-form-item prop="address">
          <el-input
            type="text"
            v-model="dataSource.address"
            auto-complete="on"
            clearable
            placeholder="数据库路径"
            name="address"
            @keyup.enter.native="handleDataSource"
          ></el-input>
        </el-form-item>
        <el-form-item style="width:100%;">
          <el-button
            type="primary"
            style="width:100%;"
            @click.native.prevent="handleDataSource"
            class="btn"
            :loading="sourceLoading"
          >保存</el-button>
        </el-form-item>
      </el-form>
      <el-link
        :underline="false"
        class="setDB"
        v-html="isLogin?'更换数据库':'登录用户'"
        @click="tabChange"
        type="primary"
        v-if="isEditDataSource"
      ></el-link>
    </div>
    <p style="color:white;margin-top:45px;">Copyright © www.wenshengkeji.com, All Rights Reserved.</p>
  </div>
</template>

<script>
import { loginCheck } from "@/api/user";
import { Base64 } from "js-base64";
import { getDB, setDB } from "@/api/dataSource";
export default {
  data() {
    return {
      isLogin: true,
      logining: false,
      sourceLoading: false,
      loginForm: {
        account: "",
        checkPass: ""
      },
      dataSource: {
        username: "",
        password: "",
        address: ""
      },
      loginRules: {
        account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        checkPass: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      dataRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" }
        ],
        password: [{ required: true, message: "请输入密码", trigger: "blur" }],
        address: [
          { required: true, message: "请输入数据库路径", trigger: "blur" }
        ]
      },
      user: {},
      driverClassName: ""
    };
  },
  methods: {
    tabChange() {
      this.isLogin = !this.isLogin;
      // this.$nextTick(() => {
      //   if (this.$refs.loginForm) {
      //     this.$refs.loginForm.resetFields();
      //   }
      // });
    },
    handleDataSource() {
      this.$refs.dataSource.validate(valid => {
        if (valid) {
          this.sourceLoading = true;
          // 设置数据源
          var dataParams = {
            driverClassName: this.driverClassName,
            url: this.dataSource.address,
            username: this.dataSource.username,
            password: this.dataSource.password
          };
          setDB(dataParams).then(res => {
            this.sourceLoading = false;
            if (res.success) {
              this.$message.success("保存成功");
              this.isLogin = !this.isLogin;
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    handleSubmit(ev) {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.logining = true;
          var loginParams = {
            username: this.loginForm.account,
            password: Base64.encode(this.loginForm.checkPass)
          };
          loginCheck(loginParams)
            .then(res => {
              this.logining = false;
              if (res.success) {
                if (res.data.pagesIndex.length > 0) {
                  this.$message.success(res.msg);
                  this.user = res.data;
                  this.$store.dispatch("user/recordUser", this.user); //存储用户信息
                  //获取来源页路由
                  let referrer = sessionStorage.getItem("referrer");
                  if (
                    referrer != null &&
                    referrer !== "" &&
                    referrer !== "/login"
                  ) {
                    this.$router.push(referrer);
                  } else {
                    this.$router.push("/");
                  }
                } else {
                  this.$alert("暂未分配页面，请联系管理员", "提示", {
                    type: "error",
                    confirmButtonText: "确定"
                  })
                    .then(() => {})
                    .catch(() => {});
                  return;
                }
              } else {
                this.logining = false;
                this.$message.error(res.msg);
              }
            })
            .catch(err => {
              this.logining = false;
            });
        } else {
          return false;
        }
      });
    },
    getDataDB() {
      // 获取数据源
      this.sourceLoading = true;
      getDB()
        .then(res => {
          if (res.success) {
            this.sourceLoading = false;
            this.driverClassName = res.data.driverClassName;
            this.dataSource.username = res.data.username;
            this.dataSource.password = res.data.password;
            this.dataSource.address = res.data.url;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  mounted() {
    if (this.isEditDataSource) {
      this.getDataDB();
    }
  }
};
</script>

<style lang="scss" scoped>
.bgcolor {
  background-color: #409eff;
  position: relative;
  top: 0;
  width: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  height: 100%;
}
.content {
  background: #fff;
  width: 370px;
  padding: 35px 25px 45px 25px;
  border: 1px solid #eaeaea;
  border-radius: 10px;
  text-align: center;
  transition: all 0.5s;
  position: relative;
  .title {
    margin: 10px auto 20px auto;
    text-align: center;
    color: #006bd8;
    font-size: 28px;
  }
  .cn-logo {
    img {
      width: 63px;
      height: 63px;
    }
  }
  .el-form,
  .setDB {
    width: 85%;
    display: inline-block;
  }
  .setDB {
    font-size: 12px;
    text-align: right;
  }
}
</style>
