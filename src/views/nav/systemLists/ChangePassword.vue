<template>
  <!-- 修改密码 -->
  <section>
    <el-col :span="24" class="content-header">
      <h3 style="border:none">修改密码</h3>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px 0">
      <el-form
        :model="Form"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        style="width:500px;margin:20px 0 0 20px"
      >
        <el-form-item label="旧密码" prop="oldPassWord">
          <el-input v-model="Form.oldPassWord" type="password" show-password placeholder="请输入旧密码"></el-input>
        </el-form-item>
        <el-form-item label="新密码" prop="newPassWord">
          <el-input v-model="Form.newPassWord" type="password" show-password placeholder="请输入新密码"></el-input>
        </el-form-item>
        <el-form-item label="重复新密码" prop="checkPass">
          <el-input v-model="Form.checkPass" type="password" show-password placeholder="请再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')">确认修改</el-button>
          <el-button @click="resetForm('ruleForm')">重置</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </section>
</template>
<script>
import { updatePassWord } from "@/api/user";
import { Base64 } from "js-base64";

export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入新密码"));
      } else {
        //先判断字符串6-12位有效无效
        if (/^[\w|\W]{6,12}$/.test(value)) {
          //规则：同一种字符的就是弱密码（exp:全是数字，全是英文字母，全是特殊字符）
          if (
            /^\d{6,12}$|^([a-z|A-Z]{6,12})$|^(~`!@#$%^&*()_+<>?:"{},.\/'[\]]'"])$/.test(
              value
            )
          ) {
            callback(new Error("请设置6-20位数字与字母组合密码"));
          }
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入新密码"));
      } else if (value != this.Form.newPassWord) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      Form: {
        oldPassWord: "",
        newPassWord: "",
        checkPass: ""
      },
      rules: {
        newPassWord: [
          { validator: validatePass, trigger: "blur" },
          {
            min: 6,
            max: 20,
            message: "长度在 6 到 20 个字符"
          },
          { required: true, message: "请输入新密码", trigger: "blur" }
        ],
        oldPassWord: [
          { required: true, message: "请输入旧密码", trigger: "blur" }
        ],
        checkPass: [
          { validator: validatePass2, trigger: "blur" },
          { required: true, message: "请输入", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    submitForm(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          updatePassWord({
            newPassword: Base64.encode(this.Form.newPassWord),
            oldPassword: Base64.encode(this.Form.oldPassWord)
          }).then(res => {
            if (res.success) {
              this.$alert("修改成功，请重新登录", "提示", {
                confirmButtonText: "确定",
                callback: action => {
                  this.$store.dispatch("user/logout"); //删除用户信息
                  this.$store.dispatch("user/del_token");
                  this.$router.push({
                    path: "/login"
                  });
                }
              });
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    resetForm(formname) {
      this.$refs[formname].resetFields();
    }
  }
};
</script>