<template>
  <div :id="id"></div>
</template>
<script>
import echarts from "echarts";
export default {
  name: "Graphical",
  props: {
    id: {
      type: String,
      required: true
    },
    result: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      chart: null
    };
  },
  methods: {
    initCharts() {
      this.chart = echarts.init(document.getElementById(this.id));
      this.chart.showLoading();
    },
    setOptions(legendData, seriesData) {
      this.chart.hideLoading();
      let color = [];
      if (this.id == "chart2") {
        //用户登录情况
        color = ["#FEC959", "#D3D3D3"];
      }
      this.chart.setOption({
        tooltip: {
          trigger: "item",
          formatter: "{b} : {c} ({d}%)"
        },

        legend: {
          type: "scroll",
          orient: "vertical",
          right: "10",
          y: "center",
          data: legendData,
          formatter: function(name) {
            var total = 0;
            var target;
            for (var i = 0, l = seriesData.length; i < l; i++) {
              total += seriesData[i].value;
              if (seriesData[i].name == name) {
                target = seriesData[i].value;
              }
            }
            let nameStr = name.length > 8 ? name.slice(0, 8) + "..." : name;
            var arr = [
              "{a|" + nameStr + "}",
              "{b|" + target + "}",
              "{c|" + ((target / total) * 100).toFixed(1) + "%}"
            ];
            return arr.join("");
          },
          textStyle: {
            rich: {
              a: {
                verticalAlign: "top",
                fontSize: 16,
                width: 150
              },
              b: {
                verticalAlign: "top",
                fontSize: 16,
                fontWeight: 700,
                padding: [0, 20]
              },
              c: {
                verticalAlign: "top",
                fontSize: 16
              }
            }
          }
        },
        series: [
          {
            name: "属性",
            type: "pie",
            radius: "55%",
            center: ["22%", "50%"],
            data: seriesData,
            labelLine: {
              show: false
            },
            label: {
              show: false
            },
            itemStyle: {
              emphasis: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: "rgba(0, 0, 0, 0.5)"
              }
            }
          }
        ]
      });
    },

    handleData() {
      let legendData = [];
      let seriesData = [];
      this.result.forEach(item => {
        legendData.push(item.name);
        seriesData.push({ name: item.name, value: item.num });
      });
      this.setOptions(legendData, seriesData);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
    });
  },
  watch: {
    result(newval, oldval) {
      if (newval) {
        this.handleData();
      }
    }
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