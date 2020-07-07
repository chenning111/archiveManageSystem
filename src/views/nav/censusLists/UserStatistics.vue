<template>
  <!-- //用户登录统计 -->
  <section>
    <el-col :span="24" class="content-top flex-spaceBetween">
      <div class="content-top-item flex-center" style="backgroundColor:#409EFF">
        <animated-integer :value="number1">
          <p>全部用户数</p>
        </animated-integer>
      </div>
      <div class="content-top-item flex-center" style="backgroundColor:#FEC03D">
        <animated-integer :value="number2">
          <p>昨日新增用户数</p>
        </animated-integer>
      </div>
      <div class="content-top-item flex-center" style="backgroundColor:#52C1F5">
        <animated-integer :value="number3">
          <p>昨日查档人数</p>
        </animated-integer>
      </div>
      <div class="content-top-item flex-center" style="backgroundColor:#FB6260">
        <animated-integer :value="number4">
          <p>查档文件数</p>
        </animated-integer>
      </div>
    </el-col>
    <el-col :span="24" class="content-mid flex-spaceBetween">
      <div class="content-mid-item">
        <div class="header">各全宗用户分析</div>
        <div class="content">
          <Graphical :id="'chart1'" :result="fondsNoData"></Graphical>
        </div>
      </div>
      <div class="content-mid-item">
        <div class="header">用户登录情况分析</div>
        <div class="content">
          <Graphical :id="'chart2'" :result="userOnlineData"></Graphical>
        </div>
      </div>
    </el-col>
    <el-col :span="24" class="content-bot" style="margin-top:0">
      <div class="content-mid-item" style="width:100%">
        <div class="header flex-spaceBetween">
          <span>查档人次统计</span>
          <div>
            <el-button-group>
              <el-button size="medium" @click="handleDate(1)" :type="btnType1"
                >本日</el-button
              >
              <el-button size="medium" @click="handleDate(2)" :type="btnType2"
                >本周</el-button
              >
              <el-button size="medium" @click="handleDate(3)" :type="btnType3"
                >本月</el-button
              >
            </el-button-group>
            <el-date-picker
              @change="changeDate"
              v-model="logindate"
              type="daterange"
              size="medium"
              align="right"
              unlink-panels
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
            ></el-date-picker>
          </div>
        </div>
        <div class="content">
          <div id="chart3"></div>
        </div>
      </div>
    </el-col>
  </section>
</template>
<script>
import echarts from "echarts";
import animatedInteger from "./components/AnimatedInteger";
import Graphical from "./components/Graphical";
import {
  retrieveUserStatistic,
  retrieveLoginStatistic,
  retrieveSearchArchiveStatistic
} from "@/api/statistics";
import {
  getWeekStartDate,
  getWeekEndDate,
  getMonthStartDate,
  getMonthEndDate,
  getXAxis
} from "@/common/js/date";
export default {
  name: "userStatistics",
  data() {
    return {
      number1: 0,
      number2: 0,
      number3: 0,
      number4: 0,
      logindate: "",
      chart3: null,
      btnType1: "",
      btnType2: "primary",
      btnType3: "",
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
      },
      fondsNoData: [], //全宗数据
      userOnlineData: [], //用户登录情况分析
      userSearchData: [] //用户登录统计
    };
  },
  methods: {
    handleDate(index) {
      if (index == 1) {
        this.btnType1 = "primary";
        this.btnType2 = "";
        this.btnType3 = "";
      } else if (index == 2) {
        this.btnType1 = "";
        this.btnType2 = "primary";
        this.btnType3 = "";
      } else {
        this.btnType1 = "";
        this.btnType2 = "";
        this.btnType3 = "primary";
      }
      this.logindate = "";
      this.getLoginData();
    },
    setOptions(dateData, seriesData) {
      this.chart3.hideLoading();
      this.chart3.setOption({
        tooltip: {
          trigger: "axis"
        },
        color: ["#409eff"],
        legend: {
          data: ["登录数量（个）"],
          bottom: 0
        },
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: dateData
        },
        toolbox: {
          top: 10,
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
        yAxis: {
          type: "value",
          minInterval: 1,
          axisLabel: {
            formatter: "{value} 个"
          }
        },
        series: [
          {
            data: seriesData,
            type: "line",
            areaStyle: {},
            name: "登录数量（个）",
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
          }
        ]
      });
    },
    getUserData() {
      retrieveUserStatistic().then(res => {
        if (res.success) {
          this.number1 = res.data.totalSize || 0; //全部用户
          this.number2 = res.data.yesterdayAddSize || 0; //昨日新增用户数
          this.number3 = res.data.userSearchSize || 0; //昨日查档
          this.number4 = res.data.totalSearchSize || 0; //查档文件
          let fondsData = res.data.fondsUserSize;
          fondsData.forEach(item => {
            this.fondsNoData.push({
              name: item.NAME,
              num: item.USERSIZE
            });
          });
          this.userOnlineData.push(
            {
              name: "在线用户",
              num: res.data.onlineSize
            },
            {
              name: "离线用户",
              num: res.data.totalSize - res.data.onlineSize
            }
          );
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    getLoginData() {
      //获取用户登录个数
      let params = {};
      if (this.btnType1) {
        //本日
        params.starDate = new Date().format("yyyy-MM-dd");
        params.endDate = new Date().format("yyyy-MM-dd");
      } else if (this.btnType2) {
        //本周
        let start = getWeekStartDate();
        let end = getWeekEndDate();
        params.starDate = start;
        params.endDate = end;
      } else if (this.btnType3) {
        let start = getMonthStartDate();
        let end = getMonthEndDate();
        params.starDate = start;
        params.endDate = end;
      } else if (this.logindate.length > 0) {
        params.starDate = this.logindate[0];
        params.endDate = this.logindate[1];
      }
      let dateArr = getXAxis({
        tab: 0,
        startTime: params.starDate,
        endTime: params.endDate
      });
      retrieveSearchArchiveStatistic(params).then(res => {
        if (res.success) {
          this.userSearchData = res.data || [];
          this.handleData(dateArr);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    changeDate() {
      this.btnType1 = "";
      this.btnType2 = "";
      this.btnType3 = "";
      if (this.logindate.length > 0) {
        this.getLoginData();
      }
    },
    initData() {
      this.getUserData();
      this.getLoginData();
    },
    handleData(dateArr) {
      let dateData = [];
      let seriesData = [];
      let d = new Date().format("yyyy-MM-dd");
      dateArr.forEach(item => {
        if (item <= d) {
          let t = this.userSearchData.find(val => val.USETIME == item);
          if (t) {
            dateData.push(item);
            seriesData.push(t.TOTALSIZE);
          } else {
            dateData.push(item);
            seriesData.push(0);
          }
        }
      });

      this.setOptions(dateData, seriesData);
    },
    initCharts() {
      this.chart3 = echarts.init(document.getElementById("chart3"));
      this.chart3.showLoading();
    }
  },

  mounted() {
    this.initData();
    this.$nextTick(() => {
      this.initCharts();
    });
  },

  components: {
    animatedInteger,
    Graphical
  },
  beforeDestroy() {
    if (!this.chart3) {
      return;
    }
    this.chart3.dispose();
    this.chart3 = null;
  }
};
</script>
<style lang="scss" scoped>
section {
  .content-top {
    .content-top-item {
      width: 24%;
      color: #fff;
      text-align: center;
      height: 100px;
      line-height: 1.5;
    }
  }
  .content-mid,
  .content-bot {
    margin: 20px 0;
    .content-mid-item {
      background: #fff;
      min-height: 370px;
      width: 49.3%;
      padding: 20px;
      box-sizing: border-box;
      .header {
        color: #333;
        font-weight: 700;
        .el-range-editor {
          margin-left: 15px;
          width: 230px !important;
        }
      }
      .content > div {
        min-height: 300px;
      }
    }
  }
}
</style>
