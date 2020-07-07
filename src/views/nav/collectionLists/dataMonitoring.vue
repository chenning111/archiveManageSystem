<!-- 数据监控 -->
<template>
  <section>
    <el-tabs v-model="activeName" class="tablist">
      <el-tab-pane label="OA接口" name="oa"></el-tab-pane>
      <!-- <el-tab-pane label="财务接口" name="cw"></el-tab-pane> -->
    </el-tabs>
    <div class="wrapper">
      <div class="header flex-spaceBetween">
        <span>{{activeName == 'oa'?'OA接口信息':'财务接口信息'}}</span>
        <el-button type="text" @click="$router.push('/monitorDetail')">查看更多</el-button>
      </div>
      <div class="content">
        <charts :id="'chart1'" :word="activeName" v-if="activeName == 'oa'"></charts>
        <charts :id="'chart2'" :word="activeName" v-if="activeName == 'cw'"></charts>
      </div>
    </div>
  </section>
</template>

<script>
import charts from "./components/charts";
export default {
  name: "dataMonitoring",
  data() {
    return {
      activeName: "oa"
    };
  },
  //生命周期 - 创建完成（访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {},
  components: {
    charts
  }
};
</script>
<style scoped lang='scss'>
/* @import url(); 引入css类 */
section {
  background-color: #fff;
  .wrapper {
    .header {
      padding: 0 30px 0 15px;
      span {
        color: #333;
        font-weight: 700;
      }
    }
  }
}
</style>