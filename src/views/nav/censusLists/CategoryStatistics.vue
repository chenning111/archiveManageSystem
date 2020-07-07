<template>
<!-- 档案综合门类统计 -->
  <div>
    <div class="content-right-title flex-spaceBetween">
      <span>利用统计</span>
      <div v-if="showContent">
        <el-link :type="showTable" style="margin-right:30px" @click="handleShowTable">报表统计</el-link>
        <el-link :type="showCharts" @click="handleShowCharts">图表统计</el-link>
      </div>
    </div>
    <div class="content-right-form" v-if="!showContent">
       <div class="info">
        <p class="shu-7">综合门类统计查询：选择档案门类点击统计进行查询</p>
      </div>
      <div class="textCenter">
        <el-button type="primary" @click="submitForm" v-if="!showContent">统计</el-button>
      </div>
    </div>
   
    <div class="content-right-form" v-if="showContent">
       <div class="flex-end title" v-show="showCharts">
        <el-button :type="chartType=='bar'?'primary':''" size="medium" @click="chartType='bar'">柱状图</el-button>
        <el-button
          :type="chartType=='line'?'primary':''"
          size="medium"
          @click="chartType='line'"
        >折线图</el-button>
        <el-button
          :type="chartType=='dbar'?'primary':''"
          size="medium"
          @click="chartType='dbar'"
        >堆砌柱状图</el-button>
        <el-button
          :type="chartType=='circle'?'primary':''"
          size="medium"
          @click="chartType='circle'"
        >饼状图</el-button>
      </div>
    <div class="content">
        <statistics-table :tableColumns="tableColumns" :model="gridData" v-if="showTable" ref="table" lengIndex="4">
        </statistics-table>
        <statistics-chart
          id="chart"
          :result="gridData"
          v-if="showCharts&&chartType!='circle'"
          :chartColumns="chartColumns"
          :chartType="chartType"
        ></statistics-chart>
        <!-- 饼状图 -->
        <div class="circleClass" v-if="showCharts&&chartType=='circle'">
          <div class="circleItem" v-for="item in chartColumns" :key="item.name">
            <statistics-circle :tableColumns="chartColumns" :result="gridData" :id="item.name"></statistics-circle>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<script>
import {categoryStatistic} from '@/api/statistics'
import statisticsTable from "./components/statisticsTable";
import statisticsChart from "./components/statisticsChart";
import statisticsCircle from "./components/statisticsCircle";
export default {
    name:"categoryStatistics",
    props:{
      checkedKeys:{
        type:Array
      }
    },
  data() {
    return {
      showContent:false, //是否已经统计了
      showTable:'primary',
      showCharts:'',
      chartType: "bar",
      gridData:[],
      tableColumns: [
        {
          name:"CHINESENAME",
          label:"档案门类",
          width:200
        },
        {
          name: "TOTAL",
          label: "文件总数"
        },
        {
          name: "ORIGINALARCHIVENUMBER",
          label: "已加原文文件数"
        },
        {
          name: "TOTALORIGINALNUMBER",
          label: "原文个数"
        },
        {
          name: "originalfilelength",
          label: "原文长度"
        },
        {
          name: "hasnotoriginalcount",
          label: "未加原文文件数"
        }
       
      ],
    };
  },
  methods:{
    searchFunc(){
        this.showContent = true;
        this.$nextTick(()=>{
          this.$refs.table.loading = true;
        })
        categoryStatistic({tableCodes:this.checkedKeys.join()}).then(res=>{
          this.$refs.table.loading = false;
          if(res.success){
            if(res.data.length>0){
              res.data.forEach(item=>{
                item.NAME = item.CHINESENAME;
                item.originalfilelength = item.FILESIZE||0
                delete item.FILESIZE
                item.hasnotoriginalcount = item.TOTAL-item.ORIGINALARCHIVENUMBER
              })
            }
            this.gridData = res.data||[];
          }else{  
            this.$message.error(res.msg)
          }
        }).catch(()=>{
          this.$refs.table.loading = false;
        })
    },
    submitForm(){
        if(this.checkedKeys.length == 0){
          this.$message.warning("请选择需要统计的门类")
          return 
        }
        this.searchFunc();
    },
    handleShowTable(){
      this.showTable = "primary";
      this.showCharts = "";
    },
    handleShowCharts(){
      this.showCharts = "primary";
      this.showTable = "";
    }
  },
  components: {
    statisticsTable,
    statisticsChart,
    statisticsCircle
  },
  mounted(){
  },
  watch:{
    checkedKeys(newval,oldval){
      if(newval!=oldval){
        this.showContent = false;
      }
    }
  },
  computed:{
    chartColumns(){
      return this.tableColumns.filter(
        item => item.name != "countdate" &&item.name!='originalfilelength'&&item.name!='CHINESENAME'
      );
    },
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
  margin: 30px 15px;
  .info {
    box-sizing: content-box;
    height: 70px;
    line-height: 70px;
    margin-bottom: 65px;
    p {
      margin: 0;
      padding-left: 25px;
      color: #666;
      background-color: #f3f3f3;
    }
  }
  .content {
    padding: 15px;
    .circleClass {
      display: flex;
      flex-wrap: wrap;
      .circleItem {
        width: 49%;
        margin-right: -1px;
        margin-top: -1px;
        border: 1px solid #eee;
      }
    }
  }
}
</style>