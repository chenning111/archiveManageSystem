<template>
  <!-- 档案实时统计详情 -->
  <div>
    <div class="content-right-title flex-spaceBetween">
      <span>利用统计</span>
      <div>
        <el-link :type="showTable" style="margin-right:30px" @click="handleShowTable">报表统计</el-link>
        <el-link :type="showCharts" @click="handleShowCharts">图表统计</el-link>
      </div>
    </div>
    <div class="content-right-form">
      <div class="flex-end title" v-show="showTable">
        <el-button type="primary" size="medium" @click="getFileLength">统计原文</el-button>
      </div>
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
        <statistics-table :tableColumns="tableColumns" :model="gridData" v-if="showTable" ref="table" lengIndex="7"></statistics-table>
        <statistics-chart
          id="chart"
          :result="gridData"
          v-if="showCharts&&chartType!='circle'"
          :chartColumns="circleColumns"
          :chartType="chartType"
        ></statistics-chart>
        <!-- 饼状图 -->
        <div class="circleClass" v-if="showCharts&&chartType=='circle'">
          <div class="circleItem" v-for="item in circleColumns" :key="item.name">
            <statistics-circle :tableColumns="circleColumns" :result="gridData" :id="item.name"></statistics-circle>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import statisticsTable from "./components/statisticsTable";
import statisticsChart from "./components/statisticsChart";
import statisticsCircle from "./components/statisticsCircle";
import { retrieveArchiveStatistic ,retrieveOriginalFilesSize} from "@/api/statistics";
export default {
  name: "utilizationStatistics",
  props: {
    cNodeCode: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      showTable: "primary",
      showCharts: "",
      chartType: "bar",
      tableColumns: [
        {
          name: "ARCHIVECATALOGNO",
          label: "实体分类号"
        },
        {
          name: "NAME",
          label: "实体分类名称"
        },
        {
          name: "TOTALNUMBER",
          label: "文件总件数"
        },

        {
          name: "ARCHIVEDNUMBER",
          label: "已归档案文件数"
        },
        {
          name: "NOTARCHIVEDNUMBER",
          label: "未归档案文件数"
        },
        {
          name: "FOLDERNUMBER",
          label: "归档案卷数"
        },
        
        {
          name: "other",
          label: "其他文件数"
        },
        {
          name: "ORIGINALARCHIVENUMBER",
          label: "已加原文文件数（原文个数，原文长度）",
          width:200
        },
        {
          name: "NOORIGINALARCHIVENUMBER",
          label: "未加原文文件数"
        }
      ],
      gridData: [],
      catalogs: "",
      fondsNo: ""
    };
  },
  methods: {
    getFileLength(){
      this.$alert('统计原文速度较慢，是否继续','提示',{
        type:'warning'
      }).then(()=>{
        let params = {
          fondNo:this.fondsNo,
          tableCode:this.tableCode,
          catalogNos:this.catalogs
        }
        this.$refs.table.loading = true;
        retrieveOriginalFilesSize(params).then(res=>{
          this.$refs.table.loading = false;
          if(res.success){ 
            if(res.data.length){
              let fileData = res.data;
              this.$nextTick(()=>{
                this.gridData.forEach(item=>{
                  let obj = fileData.find(val=>val.ARCHIVECATALOGNO == item.ARCHIVECATALOGNO);
                  if(obj){
                    this.$set(item,'FILESIZE',obj.FILESIZE)
                  }else{
                    this.$set(item,'FILESIZE',0)

                  }
                })
              })
              
            }
          }else{
            this.$refs.error(res.msg)
          }
        })
      }).catch(()=>{
        this.$refs.table.loading = false;
      })
      
    },
    handleShowTable() {
      this.showTable = "primary";
      this.showCharts = "";
    },
    handleShowCharts() {
      this.showCharts = "primary";
      this.showTable = "";
    },
    getOtherNum(row) {
      //获取其他文件
      return row.TOTALNUMBER - row.ARCHIVEDNUMBER - row.NOTARCHIVEDNUMBER;
    },
    getNoOrNum(row) {
      //获取未加原文文件
      return row.TOTALNUMBER - row.ORIGINALARCHIVENUMBER;
    },
    initData() {
      let params = {
        fondNo: this.fondsNo,
        tableCode: this.tableCode,
        catalogNos: this.catalogs
      };
      this.$refs.table.loading = true;
      retrieveArchiveStatistic(params).then(res => {
        this.$refs.table.loading = false;
        if (res.success) {
          if (res.data.length) {
            res.data.forEach(item => {
              item.other = this.getOtherNum(item);
              item.NOORIGINALARCHIVENUMBER = this.getNoOrNum(item);
            });
          }
          this.gridData = res.data || [];
        }else{
          this.$message.error(res.msg)
        }
      });
    }
  },
  components: {
    statisticsTable,
    statisticsChart,
    statisticsCircle
  },
  mounted() {
    this.fondsNo = this.$route.query.fondsNo;
    this.catalogs = this.$route.query.catalogs;
    this.tableCode = this.$route.query.tableCode;
    if (!this.tableCode) {
      this.$message.warning("请选择需要统计的档案");
    } else {
      this.initData();
    }
  },
  watch: {},
  computed: {
    circleColumns() {
      return this.tableColumns.filter(
        item => item.name != "ARCHIVECATALOGNO" && item.name != "NAME"
      );
    },
    
  }
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
  .title {
    border-bottom: 1px solid #eee;
    padding: 20px 10px;
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