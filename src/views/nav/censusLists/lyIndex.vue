<template>
  <!-- 档案利用统计 -->
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
        <p class="shu-7">利用情况统计查询：选择档案门类点击统计进行查询</p>
      </div>
      <div class="textCenter">
        <el-button type="primary" @click="submitForm" v-if="!showContent">统计</el-button>
      </div>
    </div>
    <div class="content-right-form" v-if="showContent">
      <el-form :model="form" label-width="120px" ref="form" :inline="true">
        <el-form-item prop="date" label="利用时间：">
          <el-date-picker
            @change="changeDate"
            v-model="form.date"
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
        </el-form-item>
        <el-form-item>
            <el-button type="primary" size="medium" @click="reset">重置</el-button>
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
        <statistics-table
          :tableColumns="tableColumns"
          :model="gridData"
          v-if="showTable"
          ref="table"
          lengIndex="4"
        ></statistics-table>
        <statistics-chart
          id="chart"
          :result="chartData"
          v-if="showCharts&&chartType!='circle'"
          :chartColumns="chartColumns"
          :chartType="chartType"
        ></statistics-chart>
        <!-- 饼状图 -->
        <div class="circleClass" v-if="showCharts&&chartType=='circle'">
          <div class="circleItem" v-for="item in chartColumns" :key="item.name">
            <statistics-circle :tableColumns="chartColumns" :result="chartData" :id="item.name"></statistics-circle>
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
import {
  retrieveUseStatisticMsg,
  retrieveUseStatisticPictureMsg
} from "@/api/statistics";
export default {
  name: "lyindex",
  props: {
    checkedKeys: {
      type: Array
    }
  },
  data() {
    return {
      form: {
        date: ""
      },
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
      showContent: false, //是否已经统计了
      showTable: "primary",
      showCharts: "",
      chartType: "bar",
      gridData: [], //报表数据
      chartData: [], //图表数据
      tableColumns: [
        {
          name: "category",
          label: "实体类别",
          width: 200
        },
        {
          name: "useType2",
          label: "实体借出",
          children: [
            {
              name: "useType2-1",
              label: "查档量"
            },
            {
              name: "useType2-2",
              label: "查档人数"
            },
            {
              name: "useType2-3",
              label: "利用件(卷)次"
            }
          ]
        },
        {
          name: "useType4",
          label: "实体查阅",
          children: [
            {
              name: "useType4-1",
              label: "查档量"
            },
            {
              name: "useType4-2",
              label: "查档人数"
            },
            {
              name: "useType4-3",
              label: "利用件(卷)次"
            }
          ]
        },
        {
          name: "useType3",
          label: "下载打印",
          children: [
            {
              name: "useType3-1",
              label: "查档量"
            },
            {
              name: "useType3-2",
              label: "查档人数"
            },
            {
              name: "useType3-3",
              label: "利用件(卷)次"
            }
          ]
        },
        {
          name: "useType1",
          label: "在线借阅",
          children: [
            {
              name: "useType1-1",
              label: "查档量"
            },
            {
              name: "useType1-2",
              label: "查档人数"
            },
            {
              name: "useType1-3",
              label: "利用件(卷)次"
            }
          ]
        },
        {
          name: "useType5",
          label: "直接查看",
          children: [
            {
              name: "useType5-1",
              label: "查档量"
            },
            {
              name: "useType5-2",
              label: "查档人数"
            },
            {
              name: "useType5-3",
              label: "利用件(卷)次"
            }
          ]
        },
        {
          name: "useType6",
          label: "直接下载",
          children: [
            {
              name: "useType6-1",
              label: "查档量"
            },
            {
              name: "useType6-2",
              label: "查档人数"
            },
            {
              name: "useType6-3",
              label: "利用件(卷)次"
            }
          ]
        }
      ],
      chartColumns: [
        {
          name: "totalUserNumber",
          label: "人次总数"
        },
        {
          name: "totalRecordCodeNumber",
          label: "卷次总数"
        },
        {
          name: "lendRecordCodeNumber",
          label: "借阅卷次"
        },
        {
          name: "lendUserNumber",
          label: "借阅人次"
        },
        {
          name: "readRecordCodeNumber",
          label: "查阅卷次"
        },
        {
          name: "readUserNumber",
          label: "查阅人次"
        }
      ]
    };
  },
  methods: {
    changeDate() {
      this.searchFunc();
    },
    reset(){
     this.form.date = [];
     this.searchFunc();
    },
    searchFunc() {
      this.showContent = true;
      this.getTableData();
      this.getChartData();
    },
    getTableData() {
      let params = {
        tableCodes: this.checkedKeys.join()
      };
      if (this.form.date && this.form.date.length > 0) {
        params.starTime = this.form.date[0];
        params.endTime = this.form.date[1];
      }
      if (this.showTable) {
        this.$nextTick(() => {
          this.$refs.table.loading = true;
        });
      }

      retrieveUseStatisticMsg(params)
        .then(res => {
          // useType: 1=在线借阅 2=实体借出 3=下载打印 4=实体查阅 5=直接阅读 6=直接下载
          if (this.showTable) {
            this.$nextTick(() => {
              this.$refs.table.loading = false;
            });
          }
          this.gridData = [];
          if (res.success) {
            if (JSON.stringify(res.data) != "{}") {
              let result = res.data;
              for (let i in result) {
                let obj = {};
                let arr = result[i];
                if (arr.length > 0) {
                  obj.tablecode = i;
                  obj.category = arr[0].tableName;
                  for (let j = 1; j <= 3; j++) {
                    //让值为0
                    obj["useType1" + "-" + j] = 0;
                    obj["useType2" + "-" + j] = 0;
                    obj["useType3" + "-" + j] = 0;
                    obj["useType4" + "-" + j] = 0;
                    obj["useType5" + "-" + j] = 0;
                    obj["useType6" + "-" + j] = 0;
                  }
                  arr.forEach(item => {
                    obj["useType" + item.useType + "-1"] =
                      Number(item.total) || 0; //查档量
                    obj["useType" + item.useType + "-2"] =
                      Number(item.userCodeNumber) || 0; //查档人数
                    obj["useType" + item.useType + "-3"] =
                      Number(item.recordCodeNumber) || 0; //利用卷次
                  });
                  this.gridData.push(obj);
                }
              }
            } else {
              this.gridData = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {
          this.$refs.table.loading = false;
        });
    },
    getChartData() {
      let params = {
        tableCodes: this.checkedKeys.join()
      };
      if (this.form.date && this.form.date.length > 0) {
        params.starTime = this.form.date[0];
        params.endTime = this.form.date[1];
      }
      //图表数据
      retrieveUseStatisticPictureMsg(params)
        .then(res => {
          this.chartData = [];
          if (res.success) {
            if (JSON.stringify(res.data) != "{}") {
              let result = res.data;
              for (let i in result) {
                let obj = result[i];
                obj.NAME = obj.tableName;
                this.chartData.push(obj);
              }
            } else {
              this.chartData = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {
          // this.$refs.table.loading = false;
        });
    },
    submitForm() {
      if (this.checkedKeys.length == 0) {
        this.$message.warning("请选择需要统计的门类");
        return;
      }
      this.searchFunc();
    },
    async handleShowTable() {
      await this.getTableData();
      this.showTable = "primary";
      this.showCharts = "";
    },
    async handleShowCharts() {
      await this.getChartData();
      this.showTable = "";
      this.showCharts = "primary";
    }
  },
  components: {
    statisticsTable,
    statisticsChart,
    statisticsCircle
  },
  mounted() {},
  watch: {
    checkedKeys(newval, oldval) {
      if (newval != oldval) {
        this.showContent = false;
        this.showTable = "primary";
        this.showCharts = "";
        this.form.date = [];
      }
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
  margin: 30px 15px;
  .el-form {
    padding: 0 10px;
  }
  .title {
    border-top: 1px solid #eee;
    padding: 20px 10px;
  }
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