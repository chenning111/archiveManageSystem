<!--  -->
<template>
  <el-card class="box-card" shadow="never">
    <div class="header flex-spaceBetween">
      <div class="title">{{title}}</div>
      <div class="search">
        <el-date-picker
          size="medium"
          type="daterange"
          placeholder="选择日期"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          v-model="utilizeTime"
          @change="initData"
          :picker-options="pickerOptions"
        ></el-date-picker>
      </div>
    </div>
    <div class="chartContent">
      <div :id="id" class="chart"></div>
    </div>
  </el-card>
</template>

<script>
import echarts from "echarts";

import { retrieveInterfaceTimeNumbers } from "@/api/interface";
export default {
  props: {
    title: {
      type: String,
      required: true
    },
    id: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      utilizeTime: [],
      chart: null,
      type: 1,
      gridData: [],
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      }
    };
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.showLoading();
    },
    setOptions(xAxisData, yAxisData) {
      this.chart.hideLoading();
      this.chart.setOption({
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: xAxisData
        },
        tooltip: {
          trigger: "axis"
        },
        yAxis: {
          type: "value"
        },
        series: [
          {
            data: yAxisData,
            type: "line",
            areaStyle: {}
          }
        ]
      });
    },
    handleData() {
      let xAxisData = [];
      let yAxisData = [];
      this.gridData.forEach(item => {
        xAxisData.push(item.CREATETIME);
        yAxisData.push(item.NUMBERS);
      });
      this.setOptions(xAxisData, yAxisData);
    },
    initData() {
      let params = {};
      if (this.utilizeTime && this.utilizeTime.length > 0) {
        params.starTime = this.utilizeTime[0];
        params.endTime = this.utilizeTime[1];
      }
      params.type = this.type;
      retrieveInterfaceTimeNumbers(params).then(res => {
        if (res.success) {
          this.gridData = res.data.reverse() || [];
          this.gridData.sort((b, a) =>
            b.CREATETIME.localeCompare(a.CREATETIME)
          );
          this.handleData();
        } else {
          this.gridData = [];
          this.$message.error(res.msg);
        }
      });
    }
  },
  created() {
    this.type = this.title == "档案统计" ? 1 : 2;
    this.initData();
  },
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  }
};
</script>
<style scoped lang='scss'>
/* @import url(); 引入css类 */
.box-card {
  width: 49.3%;
  /deep/ .el-card__body {
    padding: 0;
  }
  .header {
    height: 70px;
    border-bottom: 1px solid #eee;
    padding: 0 15px;
    .title {
      font-weight: 700;
      color: #333;
    }
  }
  .chartContent {
    height: 400px;
    .chart {
      height: 100%;
    }
  }
}
</style>