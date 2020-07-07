<template>
  <!-- 档案统计 统计方式-->
  <div>
    <div class="content-right-title">
      <span>统计方式</span>
    </div>
    <div class="content-right-form">
      <div class="info">
        <p class="shu-7">实时统计查询：统计当前档案系统数据，统计速度较慢</p>
        <p class="shu-7">历史统计查询：统计最近更新的档案统计数据，统计速度快建议使用历史统计</p>
      </div>
      <div class="textCenter">
        <el-button type="primary" @click="realTime">实时统计</el-button>
        <el-button type="primary" @click="history">历史统计</el-button>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "statisticsType",
  props:{
    cNodeCode:{
      type:String,
      default:""
    },
    tableCode:{
      type:String,
      default:""
    }
  },
  data() {
    return {
    };
  },
  methods: {
    realTime() {
      if (this.cNodeCode) {
        this.$router.push('/realtimeStatistics');
      } else {
        this.$message.warning("请选择需要统计的档案");
      }
    },
    history(){
      if (this.cNodeCode) {
        this.$router.push({
          name:"historyStatistics",
          query:{
            tableCode:this.tableCode
          }
        });
      } else {
        this.$message.warning("请选择需要统计的档案");
      }
    }
  },
  components: {},
  mounted() {
  },
 
 
};
</script>
<style lang="scss" scoped>
.content-right-title {
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
.content-right-form {
  margin: 30px 15px;
  .info {
    box-sizing: content-box;
    height: 70px;
    line-height: 35px;
    margin-bottom: 65px;
    p {
      margin: 0;
      padding-left: 25px;
      color: #666;
      background-color: #f3f3f3;
    }
  }
}
</style>