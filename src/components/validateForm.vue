<!--  -->
<template>
  <div>
    <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="70px" @submit.native.prevent>
      <!-- <el-form-item prop="account" label="账号：">
        <el-input
          type="text"
          v-model="loginForm.account"
          auto-complete="on"
          placeholder="账号"
          name="account"
        ></el-input>
      </el-form-item> -->
      <el-form-item prop="checkPass" label="密码：">
        <el-input
          type="password"
          v-model="loginForm.checkPass"
          auto-complete="on"
          placeholder="密码"
          show-password
          clearable
          name="checkPass"
          @keyup.enter.native="checkLogin('loginForm')"
        ></el-input>
      </el-form-item>
    </el-form>
   
  </div>
</template>

<script>
import { loginCheck } from "@/api/user";
import { Base64 } from "js-base64";
export default {
  
  data() {
    return {
      loginForm: {
        // account: "",
        checkPass: ""
      },
      loginRules: {
        // account: [{ required: true, message: "请输入账号", trigger: "blur" }],
        checkPass: [{ required: true, message: "请输入密码", trigger: "blur" }]
      }
    };
  },
  methods: {
    checkLogin(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          let params = {
            username: this.userInfo.userCode,
            password: Base64.encode(this.loginForm.checkPass)
          };
          loginCheck(params).then(res => {
            if (res.success) {
              this.$emit('validLogin',true)
            } else {
              this.$emit('validLogin',false)
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    }
  },
  //生命周期 - 创建完成（访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {

  },
  computed:{
    userInfo(){
      return this.$store.getters.userInfo
    }
  }
};
</script>
<style scoped lang='scss'>
/* @import url(); 引入css类 */
</style>