<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>选择库房：</label>
          <el-select v-model="searchForm.warehouseno" size="small" @change="search">
            <el-option
              v-for="item in houseData"
              :key="item.storeroomCode"
              :value="String(item.storeroomCode)"
              :label="item.storeroomAddress"
            ></el-option>
          </el-select>
        </div>
        <div class="item">
          <label for style="width:100px">选择时间点：</label>
          <el-select v-model="searchForm.time" size="small" @change="search">
            <el-option value="早上" label="早上"></el-option>
            <el-option value="中午" label="中午"></el-option>
            <el-option value="晚上" label="晚上"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label for style="width:100px">选择时间段：</label>
          <el-date-picker
            v-model="searchForm.Registerdate"
            type="daterange"
            align="left"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            size="small"
            :picker-options="pickerOptions"
            @change="search"
          ></el-date-picker>
        </div>
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <!-- <el-button type="primary" size="small" @click="reset">重置</el-button> -->
      </div>
    </el-col>
    <el-col
      :span="24"
      style="background-color:#fff;margin-top:18px;min-height:500px;padding:20px"
      id="charts"
    ></el-col>
  </section>
</template>
<script>
import {
  retrieveStoreRegister,
  retrieveStoreStandard,
  retrieveStorerooms
} from "@/api/storeRoom";
import echarts from "echarts";
export default {
  data() {
    return {
      chart: null,
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
      standardData: {}, //标准数据
      gridData: [],
      searchForm: {
        warehouseno: "",
        Registerdate: "",
        time: ""
      },
      houseData: [] //库房
    };
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  mounted() {
    this.initData();
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  methods: {
    search() {
      let params = {
        limit: 10000,
        star: 1
      };
      this.searchFunc(params);
    },
    initCharts() {
      this.chart = echarts.init(document.getElementById("charts"));
      this.chart.showLoading();
    },
    setOptions(tempratureData, humidityData, timeData) {
      //温度 湿度 时间数据
      this.chart.hideLoading();
      this.chart.setOption({
        title: {
          text:
            this.houseData.filter(
              item => item.storeroomCode == this.searchForm.warehouseno
            )[0].storeroomAddress +
            this.searchForm.time +
            "温湿度变化表",
          x: "center",
          subtext: "红色表示异常数据",
          subtextStyle: {
            //副标题文本样式{"color": "#aaa"}
            fontFamily: "微软雅黑",
            fontSize: 12,
            fontStyle: "normal",
            fontWeight: "normal",
            color: "#ff0036"
          }
        },
        grid: {
          top: "20%"
        },
        visualMap: [
          {
            top: "10%",
            left: "15%",
            pieces: [
              {
                max: this.standardData.standardtemprature + 5,
                min: this.standardData.standardtemprature - 5,
                color: "#409eff"
              }
            ],
            seriesIndex: 0,
            outOfRange: {
              symbol: "rect",
              symbolSize: [10, 10],
              color: "red"
            },
            orient: "horizontal",
            formatter: `正常温度范围(°C)：${this.standardData
              .standardtemprature - 5}-${this.standardData.standardtemprature +
              5}`
          },
          {
            top: "10%",
            left: "35%",
            pieces: [
              {
                max: this.standardData.standardhumidity + 5,
                min: this.standardData.standardhumidity - 5,
                color: "#53FF53"
              }
            ],
            seriesIndex: 1,
            outOfRange: {
              symbol: "rect",
              symbolSize: [10, 10],
              color: "red"
            },
            orient: "horizontal",
            formatter: `正常湿度范围(%)：${this.standardData.standardhumidity -
              5}-${this.standardData.standardhumidity + 5}`
          }
        ],
        legend: {
          data: ["温度(°C)", "湿度(%)"],
          bottom: 0
        },
        color: ["#409eff", "#53FF53"],
        tooltip: { trigger: "axis" },
        toolbox: {
          top: -10,
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
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: timeData
        },
        yAxis: [
          {
            type: "value",
            name: "温度",
            axisLabel: {
              formatter: "{value} °C"
            }
          },
          {
            type: "value",
            name: "湿度",
            axisLabel: {
              formatter: "{value} %"
            }
          }
        ],
        label: {
          show: true
        },
        series: [
          {
            name: "温度(°C)",
            type: "line",
            data: tempratureData,
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
                  },
                  formatter(obj) {
                    return obj.value + "°C";
                  }
                }
              }
            }
          },
          {
            name: "湿度(%)",
            type: "line",
            yAxisIndex: 1,
            data: humidityData,
            itemStyle: {
              //上方显示数值
              normal: {
                label: {
                  show: true, //开启显示
                  position: "top", //在上方显示
                  textStyle: {
                    //数值样式
                    color: "#53FF53",
                    fontSize: 16
                  },
                  formatter(obj) {
                    return obj.value + "%";
                  }
                }
              }
            }
          }
        ]
      });
    },
    searchFunc(params) {
      params.warehouseno = this.searchForm.warehouseno;
      if (
        this.searchForm.Registerdate &&
        this.searchForm.Registerdate.length > 0
      ) {
        params.starRegisterdate = this.searchForm.Registerdate[0];
        params.endRegisterdate = this.searchForm.Registerdate[1];
      }
      this.loading = true;
      retrieveStoreRegister(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            const tempratureData = [];
            const humidityData = [];
            const timeData = [];
            this.gridData.forEach(item => {
              if (this.searchForm.time == "早上") {
                tempratureData.push(item.temprature1);
                humidityData.push(item.humidity1);
              } else if (this.searchForm.time == "中午") {
                tempratureData.push(item.temprature2);
                humidityData.push(item.humidity2);
              } else {
                tempratureData.push(item.temprature3);
                humidityData.push(item.humidity3);
              }

              timeData.push(new Date(item.registerdate).format("yyyy-MM-dd"));
            });
            this.setOptions(tempratureData, humidityData, timeData);
          } else {
            this.gridData = [];
            this.setOptions([], [], []);
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    // reset() {
    //   this.searchForm = {
    //     warehouseno: "",
    //     Registerdate: "",
    //     time:""
    //   };
    //   this.search()
    // },
    getStandard() {
      retrieveStoreStandard().then(res => {
        if (res.success) {
          this.standardData = res.data;
        }
      });
    },
    getWareHouse() {
      let params = {
        limit: 9999,
        star: 1
      };
      retrieveStorerooms(params).then(res => {
        //获取库房
        if (res.success) {
          this.houseData = res.data.list;
          if (this.houseData.length > 0) {
            this.searchForm.warehouseno = String(
              this.houseData[0].storeroomCode
            );
            this.searchForm.time = "早上";
            this.searchFunc(params);
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    async initData() {
      await this.getStandard(); //获取标准参数
      await this.getWareHouse();
    }
  }
};
</script>