<!-- 正常异常数据统计 -->
<template>
  <div>
    <div class="search" :class="$route.name == 'dataMonitoring'?'flex-center':'flex-start'">
      <el-radio-group size="medium" class="radio" v-model="utilizeDate" @change="changeUtilizeYear">
        <el-radio-button label="week">本周</el-radio-button>
        <el-radio-button label="month">本月</el-radio-button>
      </el-radio-group>
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
      ></el-date-picker>
    </div>
    <div class="chartContent">
      <div :id="id" class="chart"></div>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import { retrieveListMsg } from "@/api/interface";
import {
  getWeekStartDate,
  getWeekEndDate,
  getMonthStartDate,
  getMonthEndDate
} from "@/common/js/date";
export default {
  props: {
    id: {
      type: String,
      required: true
    },
    word: {
      type: String,
      required: true,
      default: "oa"
    }
  },
  data() {
    return {
      chart: null,
      utilizeTime: [
        new Date().format("yyyy-MM-dd"),
        new Date().format("yyyy-MM-dd")
      ],
      utilizeDate: "week",
      result: []
    };
  },
  methods: {
    changeUtilizeYear() {
      let starDate = new Date().format("yyyy-MM-dd");
      let endDate = new Date().format("yyyy-MM-dd");
      if (this.utilizeDate == "week") {
        //本周
        let start = getWeekStartDate();
        let end = getWeekEndDate();
        this.utilizeTime = [start, end];
      } else if (this.utilizeDate == "month") {
        //本月
        let start = getMonthStartDate();
        let end = getMonthEndDate();
        this.utilizeTime = [start, end];
      }
      this.initData();
    },

    initCharts() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.showLoading();
    },
    setOptions(xAxisData, normalData, abnormalData) {
      this.chart.hideLoading();
      this.chart.setOption({
        legend: {
          data: ["正常", "异常"],
          bottom: 0
        },
        color: ["#409eff", "#fa7978"],
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        toolbox: {
          right: 20,
          show: true,
          feature: {
            dataZoom: {
              yAxisIndex: "none"
            },
            dataView: {
              readOnly: true,
              optionToContent: function(opt) {
                let axisData = opt.xAxis[0].data; //坐标数据
                let series = opt.series; //折线图数据
                let tdHeads = "<td>时间</td>"; //表头
                let tdBodys = ""; //数据
                series.forEach(function(item) {
                  //组装表头
                  tdHeads += `<td>${item.name}</td>`;
                });
                let table = `<table border="1" class="dataView"><tbody><tr>${tdHeads} </tr>`;
                for (let i = 0, l = axisData.length; i < l; i++) {
                  for (let j = 0; j < series.length; j++) {
                    //组装表数据
                    tdBodys += `<td>${series[j].data[i]}</td>`;
                  }
                  table += `<tr><td>${axisData[i]}</td>${tdBodys}</tr>`;
                  tdBodys = "";
                }
                table += "</tbody></table>";
                return table;
              }
            },
            magicType: { type: ["line", "bar"] },
            restore: {},
            saveAsImage: {}
          }
        },
        xAxis: [
          {
            type: "category",
            data: xAxisData,
            axisLabel: {
              //横坐标显示完全
              interval: 0
            },
            axisTick: {
              alignWithLabel: true
            }
          }
        ],
        yAxis: [
          {
            type: "value"
          }
        ],
        series: [
          {
            name: "正常",
            type: "bar",
            stack: "个数",
            data: normalData,
            itemStyle: {
              //上方显示数值
              normal: {
                label: {
                  show: true, //开启显示
                  position: "top", //在上方显示
                  textStyle: {
                    //数值样式
                    color: "#409eff",
                    fontSize: 16
                  }
                }
              }
            }
          },
          {
            name: "异常",
            type: "bar",
            stack: "个数",
            data: abnormalData,
            itemStyle: {
              //上方显示数值
              normal: {
                label: {
                  show: true, //开启显示
                  position: "top", //在上方显示
                  textStyle: {
                    //数值样式
                    color: "#fa7978",
                    fontSize: 16
                  }
                }
              }
            }
          }
        ]
      });
    },
    handleData() {
      let xAxisData = [];
      let normalData = [];
      let abnormalData = [];
      this.result.forEach(item => {
        normalData.push(item.normal);
        abnormalData.push(item.abnormal);
        xAxisData.push(item.time);
      });
      this.setOptions(xAxisData, normalData, abnormalData);
    },
    initData() {
      let params = {};
      if (this.utilizeTime && this.utilizeTime.length > 0) {
        params.starTime = this.utilizeTime[0];
        params.endTime = this.utilizeTime[1];
      }

      params.type = 1;

      this.result = [];
      retrieveListMsg(params).then(res => {
        if (res.success) {
          let total = res.data.total;
          let success = res.data.success || [];
          total.sort((b, a) => b.CREATETIME.localeCompare(a.CREATETIME));
          success.sort((b, a) => b.CREATETIME.localeCompare(a.CREATETIME));
          if (params.type == 2) {
            for (let i in success) {
              this.result.push({
                normal: success[i],
                abnormal: total[i] - success[i],
                time: i
              });
            }
          } else {
            success = success.reverse() || [];
            total.forEach(item => {
              let obj = success.find(val => val.CREATETIME == item.CREATETIME);
              if (obj) {
                this.result.push({
                  normal: obj.NUMBERS,
                  abnormal: item.NUMBERS - obj.NUMBERS,
                  time: item.CREATETIME
                });
              } else {
                this.result.push({
                  normal: 0,
                  abnormal: item.NUMBERS,
                  time: item.CREATETIME
                });
              }
            });
          }
          this.handleData();
        } else {
          this.result = [];
          // this.$message.error(res.msg);
        }
      });
    }
  },
  created() {
    // this.initData();
    this.changeUtilizeYear();
  },
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
.search {
  margin: 20px 0;
  padding: 0 15px;
  .radio {
    margin-right: 15px;
  }
}
.chart {
  min-height: 500px;
}
</style>