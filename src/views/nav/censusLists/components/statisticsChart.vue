<template>
  <div :id="id" class="chart"></div>
</template>
<script>
import echarts from "echarts";
export default {
  name: "statisticsChart",
  props: {
    id: {
      type: String,
      required: true
    },
    result: {
      type: Array,
      required: true
    },
    chartColumns: {
      type: Array,
      required: true
    },
    chartType: {
      type: String,
      default: "bar" //类型
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
    setOptions(legendData,xAxisData, seriesData) {
      this.chart.hideLoading();
      
      this.chart.setOption({
        legend: {
          data: legendData,
          bottom:0,
          type: "scroll",
          orient: "horizontal",
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
            label: {
              backgroundColor: "#6a7985"
            }
          }
        },
        
        xAxis: [
          {
            type: "category",
            data: xAxisData,
            "axisLabel":{ //横坐标显示完全
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
        series: seriesData
      });
    },
    
    handleData() {
      let legendData = [];
      let seriesData = [];
      let xAxisData = [];
      this.result.forEach(item => {
        legendData.push(item.NAME);
        let value = '';
        let obj = {};
        obj = {
            name:item.NAME,
            data:[],
            itemStyle: {     
              normal:{
                //上方显示数值
                    label: {
                        show: true, //开启显示
                        position: 'top', //在上方显示
                        textStyle: { //数值样式
                            color: 'black',
                            fontSize: 16
                        },
                        formatter: function(params) {
                          if (params.value > 0) {
                            return params.value;
                          } else {
                            return ' ';
                          }
                        }
                    }
                  }   
            }
        }
        if(this.chartType == 'bar'){
            obj.type = 'bar'
            obj.stack = null
            
        }else if(this.chartType == 'dbar'){ //堆砌
            obj.type = 'bar'
            obj.stack = '个数'
            obj.itemStyle.normal.label.position = 'inside'
        }else if(this.chartType =='line'){
            obj.type = 'line'
        }
        for(let i in item){
            let r = this.chartColumns.find(col=>col.name == i);
            if(r){
              if(r.label == '已加原文文件数（原文个数，原文长度）'){
                xAxisData.push('已加原文文件数')
              }else{
                xAxisData.push(r.label)
              }
              obj.data.push(item[i])
            }
        }
        seriesData.push(obj)
      });
      xAxisData = Array.from(new Set(xAxisData));
      
      this.setOptions(legendData,xAxisData, seriesData);
    }
    
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
      this.handleData();
    });
  },
  watch: {
    chartType:{
      handler(newval,oldval){
        if(newval&&newval!=oldval){
             if(newval !='circle'){
                this.handleData();
            }
        }
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
<style lang="scss" scoped>
    .chart{
        min-height: 500px;
    }
</style>