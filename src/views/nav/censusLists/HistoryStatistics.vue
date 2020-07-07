<template>
  <!-- 档案历史统计 -->
  <div>
    <div class="content-right-title flex-spaceBetween">
      <span>利用统计</span>
      <div>
        <el-link :type="showTable" style="margin-right:30px" @click="handleShowTable">报表统计</el-link>
        <el-link :type="showCharts" @click="handleShowCharts">图表统计</el-link>
      </div>
    </div>
    <div class="content-right-form">
      <el-form :model="form" :rules="rules" label-width="120px" ref="form" :inline="true">
        <el-form-item prop="fondsNo" label="全宗号：">
          <el-select v-model="form.fondsNo" @change="changeFond" value-key="FONDSCODE" clearable>
            <el-option
              v-for="option in fondsList"
              :label="option.NO+' -- '+option.NAME"
              :key="option.FONDSCODE"
              :value="option"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop="columnName" label="统计字段：">
          <el-select v-model="form.columnName"  clearable>
            <el-option :value="filed.name" :label="filed.label" v-for="filed in fieldNameArr" :key="filed.name"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
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
        <statistics-table :tableColumns="tableColumns" :model="gridData" v-if="showTable" ref="table" lengIndex="5">
            <el-pagination
            class="pull-right pagina"
            slot="pagination"
            background
            layout="total,prev, pager, next,sizes"
            :total="total"
            @size-change="handleSizeChange"
            :page-sizes="[20,50,100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
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
import statisticsTable from "./components/statisticsTable";
import statisticsChart from "./components/statisticsChart";
import statisticsCircle from "./components/statisticsCircle";
import { retrieveSystemDataCount} from "@/api/statistics";
export default {
  name: "historyStatistics",
  props: {
    cNodeCode: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      rules: {
        fondsNo: [{ required: true, message: "请选择全宗", trigger: "change" }],
        columnName: [
          { required: true, message: "请选择字段", trigger: "change" }
        ]
      },
      form: {
        fondsNo: "",
        columnName: ""
      },
      showTable: "primary",
      showCharts: "",
      chartType: "bar",
      tableColumns: [
        {
          name: "allfilescount",
          label: "文件总数"
        },

        {
          name: "hasoriginalcount",
          label: "已加原文文件数"
        },
        {
          name: "originalfilecount",
          label: "原文个数"
        },
        {
          name: "originalfilelength",
          label: "原文长度"
        },
        {
          name: "hasnotoriginalcount",
          label: "未加原文文件数"
        },
        {
          name: "countdate",
          label: "统计日期"
        }
      ],
      fieldNameArr: [
        {
          name: "DEPARTMENTCODE",
          label: "所属部门"
        },
        {
          name: "RETENTION",
          label: "保管期限"
        },
        {
          name: "FILLINGYEAR",
          label: "归档年度"
        }
      ],
      gridData: [],
      catalogs: "",
      pageSize:50,
      currentPage:1,
      total:0
    };
  },
  methods: {
    changeFond(value) {
      //全宗
      this.form.fondsNo = value.NO;
      this.showTable = 'primary'
      this.showCharts='';
      if(this.form.fondsNo){
        this.initData();
      }
    },
    handleShowTable() {
      this.showTable = "primary";
      this.showCharts = "";
    },
    handleShowCharts() {
      this.showCharts = "primary";
      this.showTable = "";
    },
    handleSizeChange(val){
      if(!this.form.fondsNo){
        this.$message.warning('请选择全宗')
        return false
      } else if(!this.form.columnName){
        this.$message.warning('请选择统计字段')
        return false
      }
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        star:this.currentPage,
        limit:this.pageSize
      };
      this.searchFunc(params)
      
    },
    handleCurrentChange(val){
      if(!this.form.fondsNo){
        this.$message.warning('请选择全宗')
        return
      } else if(!this.form.columnName){
        this.$message.warning('请选择统计字段')
        return
      }
       this.currentPage = val;
       let params = {
        star:this.currentPage,
        limit:this.pageSize
      };
      this.searchFunc(params)
     
      
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
        star:1,
        limit:50
      };
      this.searchFunc(params);
    },
    searchFunc(params){
      this.$nextTick(()=>{
        this.$refs.table.loading = true;
      })
      params.fondsCode = this.fondsList.find(item=>item.NO == this.form.fondsNo).FONDSCODE;
      params.tableCode = this.tableCode;
      params.columnName = this.form.columnName;
      retrieveSystemDataCount(params).then(res => {
        this.$nextTick(()=>{
          this.$refs.table.loading = false;
        })
        if (res.success) {
          this.gridData = res.data.list || [];
          this.gridData.forEach(item => {
            item[this.form.columnName] = String(item.countcolumvalue);
            // item.NAME = String(item.departmentName)||String(item.countcolumvalue);
            item.NAME = item.departmentName||item.countcolumvalue;
          });
          this.total = res.data.total;
          this.currentPage = res.data.pageNum
          this.pageSize = res.data.pageSize
        } else {
          this.$message.error(res.msg);
        }
      }).catch(()=>{
        this.$refs.table.loading = false;
      });
    }
  },
  components: {
    statisticsTable,
    statisticsChart,
    statisticsCircle
  },
  async mounted() {
    let arr = await this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗数组
    if (arr.length > 0) {
      this.form.fondsNo = arr[0].NO;
    }
    this.form.columnName = "DEPARTMENTCODE";
    this.tableCode = this.$route.query.tableCode;
    if (!this.tableCode) {
      this.$message.warning("请选择需要统计的档案");
    }
  },
  watch: {
    "form.columnName"(newval, oldval) {
      if (newval && newval != oldval&&this.form.fondsNo) {
        this.showTable = 'primary'
        this.showCharts='';
        this.initData();
        let index = this.tableColumns.findIndex(item => item.name == oldval);//删除上一个列
        if(index>-1){
          this.tableColumns.splice(index, 1);
        }
        let obj = this.fieldNameArr.find(item=>item.name == newval);
        let second = this.tableColumns.findIndex(item => item.name == 'NAME');//删除上一个列的中文名NAME
        if(second>-1){
          this.tableColumns.splice(second, 1);
        }
        this.tableColumns.unshift({name:'NAME',label:obj.label+'值'});
        this.tableColumns.unshift(obj);
        
      }
    }
  },
  computed: {
    
    chartColumns(){
      return this.tableColumns.filter(
        item => item.name != "countdate" && item.name != "NAME"&&item.name!=this.form.columnName&&item.name!='originalfilelength'
      );
    },
    fondsList() {
      return this.$store.state.fondsCatalog.fondsList;
    }
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
  .el-form {
    padding: 20px 10px 0 10px;
  }
  .title {
    border-top: 1px solid #eee;
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