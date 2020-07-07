<template>
  <section style="background-color:#fff;">
    <div class="app-container">
      <!-- <div class="flex-spaceBetween">
      <el-card class="box-card">
      <div slot="header">
        <span style="line-height: 36px;">主题色设置</span>
      </div>
      <div class="mulColor">
        <el-radio-group v-model="themeColor" @change='handlerChangeColorFont' >
          <el-radio label="409eff">默认-409eff</el-radio>
          <el-radio label="ff9040">橙黄-ff9040</el-radio>
          <el-radio label="ff5340">红色-ff5340</el-radio>
        </el-radio-group>
      </div>
    </el-card>
    <el-card class="box-card">
      <div slot="header">
        <span style="line-height: 36px;">字体大小</span>
      </div>
      <div class="mulColor">
        <el-radio-group v-model="fontSize" @change='handlerChangeColorFont'>
          <el-radio label="16px">默认-16px</el-radio>
          <el-radio label="18px">中等-18px</el-radio>
          <el-radio label="20px">大-20px</el-radio>
        </el-radio-group>
      </div>
    </el-card>
      </div>-->
      <el-form ref="form" :model="form" label-width="200px" size="medium">
        <el-form-item label="侧边栏背景色：">
          <el-radio-group v-model="form.menuBg" @change="submitTheme">
            <el-radio label="#304156" >深蓝色</el-radio>
            <el-radio label="#ffffff" >白色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头部背景色：">
          <el-radio-group v-model="form.headerBg" @change="submitTheme">
            <el-radio label="#304156">深蓝色</el-radio>
            <el-radio label="#409eff">蓝色</el-radio>
          </el-radio-group>
        </el-form-item>
     
         <el-form-item label="表格是否显示斑马线：">
            <el-radio-group v-model="form.stripe" @change="submitTheme">
              <el-radio label="T">是</el-radio>
              <el-radio label="F">否</el-radio>
            </el-radio-group>
        </el-form-item>
           <el-form-item label="主体内容背景色：" >
          <el-color-picker v-model="form.mainBg" :predefine="predefineColors"  @change="submitTheme"></el-color-picker>
        </el-form-item>
         <el-form-item label="字体大小：">
          <el-radio-group v-model="form.fontSize" @change="submitTheme">
            <el-radio label="16px">16px-默认</el-radio>
            <el-radio label="18px">18px-中等</el-radio>
            <el-radio label="20px">20px-大</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </div>
  </section>
</template>

<script>

export default {
  data() {
    return {
      form: {
        menuBg: "",
        headerBg: "",
        mainBg: "",
        stripe:"",
        fontSize:""
      },
      predefineColors: [
        "#e3edcd",
        "#ff8c00",
        "#ffd700",
        "#90ee90",
        "#00ced1",
        "#1e90ff",
        "#c71585"
      ]
    };
  },
  methods: {
    submitTheme(){
      this.$store.dispatch('user/setThemeColor',this.form)
    }
  },

  mounted() {
    this.form.menuBg = this.$store.getters.menuTheme.menuBg;
    this.form.headerBg = this.$store.getters.headerTheme;
    this.form.mainBg = this.$store.getters.mainTheme;
    this.form.stripe = this.$store.getters.stripe;
    this.form.fontSize = this.$store.getters.fontSize;
  },
  
};
</script>
<style scoped>
.app-container {
  margin: 0 auto;
  width: 80%;
  padding-top: 20px;
  min-height: 500px;
}

</style>

