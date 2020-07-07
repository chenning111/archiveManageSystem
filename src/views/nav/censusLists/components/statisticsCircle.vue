<template>
  <!-- 饼图 -->
  <div :id="id" class="chart"></div>
</template>
<script>
import echarts from "echarts";
export default {
  name: "statisticsCircle",
  props: {
    id: {
      type: String,
      required: true
    },
    result: {
      type: Array,
      required: true
    },
    tableColumns: {
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
    setOptions(legendData, seriesData, title) {
      this.chart.hideLoading();
      if(title == '已加原文文件数（原文个数，原文长度）'){
        title = '已加原文文件数'
      }
      this.chart.setOption({
        title: {
          text: title,
          x: "center",
          left:15,
          top:15
        },
        tooltip: {
          trigger: "item",
          formatter: "{a} <br/>{b} : {c} ({d}%)",
          
        },
        legend: {
          type: "scroll",
          orient: "horizontal",
          bottom: 20,
          data: legendData
          
        },
        series: [
          {
            name: "属性",
            type: "pie",
            radius: "50%",
            center: ["50%", "50%"],
            data: seriesData,
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
      let title = "";
      this.result.forEach(item => {
        legendData.push(item.NAME);
        if(item[this.id]){
          seriesData.push({name: item.NAME, value: item[this.id]});
        }
      });
      title = this.tableColumns.find(val => val.name == this.id).label;
      this.setOptions(legendData, seriesData, title);
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
      this.handleData()
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
<style lang="scss" scoped>
.chart {
  min-height: 500px;
}
</style>