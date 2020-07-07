<template>
  <div>
    <div class="content-right-title">
      <span>移交信息</span>
    </div>
    <div class="content-right-form">
      <el-form label-width="120px" style="width:50%">
        <el-form-item label="移交原因：">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="接收单位：">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="发起人：">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="年度：">
          <el-input></el-input>
        </el-form-item>
        <el-form-item label="发起时间：">
          <el-date-picker v-model="value1" type="date" placeholder="选择日期"></el-date-picker>
        </el-form-item>
        <el-form-item label="补充说明：">
          <el-input type="textarea" :rows="2" placeholder="请输入内容" v-model="textarea"></el-input>
        </el-form-item>
      </el-form>
      <div class="textCenter" style="margin-top:50px;">
        <el-button type="primary">移交</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name:"fileTransferIndex",
  data() {
    return {
      textarea: "",
      value1: ""
    };
  },
  components: {
    
  }
};
</script>
<style lang="scss" scoped>
.content-right-title{
    height: 60px;
    border-bottom: 1px solid #eee;
    padding: 0 20px;
    display: flex;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    align-items: center;
    justify-content: space-between;
    span {
        font-weight: 700;
        color: #666;
        font-size: 15px;
    }
}
.content-right-form{
      padding: 15px;
    }
</style>