<!-- 监控详情 -->
<template>
  <section>
    <div class="wrapper_top">
      <div class="header" style="padding:0">
        <div class="title" style="padding:0 15px">OA接口监控</div>
        <charts :id="'chart1'" :word="'oa'"></charts>
      </div>
      <div class="content" id="chart1"></div>
    </div>
    <div class="wrapper_mid flex-spaceBetween" style="margin:20px 0;">
      <detail-chart :id="'chart2'" :title="'档案统计'"></detail-chart>
      <detail-chart :id="'chart3'" :title="'原文统计'"></detail-chart>
    </div>
    <div class="classification">
      <div class="header">
        <div class="title">当日各分类占比</div>
      </div>
      <div
        style="color:#333;font-weight:700;line-height:20px;padding:0 15px;"
      >共{{classTotalNumber}}条</div>
      <div
        class="classContent"
        v-loading="classLoading"
        :class="classData.length>0 ?'flex-wrap' :'flex-center'"
      >
        <h4 v-show="classData.length==0">暂无数据</h4>
        <div class="item flex-start" v-for="(item,index) in classData" :key="index">
          <el-progress
            type="circle"
            :percentage="item.proportion"
            :color="item.color"
            :width="100"
            :stroke-width="10"
          ></el-progress>
          <div class="item_right">
            <div class="text ellipsis">{{item.text}}</div>
            <div class="num">
              <span>{{item.number}}</span>条
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tableContent clearboth" style="margin:20px 0;">
      <div class="header flex-spaceBetween">
        <div class="title">操作列表</div>
        <div>
          <el-date-picker
            size="medium"
            type="daterange"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            v-model="utilizeTime"
            :picker-options="pickerOptions"
            @change="initTable"
          ></el-date-picker>
        </div>
      </div>
      <div style="margin:20px">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="dataTable"
          tooltip-effect="dark"
        >
          <el-table-column label="序号" align="center" prop="serial" width="80px">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="操作时间" align="center" prop="creatTime">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.creatTime).format("yyyy-MM-dd hh:mm:ss")}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="题名"
            align="center"
            prop="title"
            :show-overflow-tooltip="true"
            min-width="300"
          ></el-table-column>
          <el-table-column
            label="操作人"
            align="center"
            prop="creator"
            :show-overflow-tooltip="true"
            width="180"
          ></el-table-column>
          <el-table-column label="IP地址" align="center" prop="ip" :show-overflow-tooltip="true"></el-table-column>
          <el-table-column
            label="原文数量"
            align="center"
            prop="originalNumber"
            :show-overflow-tooltip="true"
            width="180"
          ></el-table-column>
        </el-table>
      </div>
      <el-pagination
        class="pull-right pagina"
        background
        layout="total,prev, pager, next,sizes"
        :total="total"
        @size-change="handleSizeChange"
        :page-sizes="[20,50,100]"
        :page-size="pageSize"
        :current-page="currentPage"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </section>
</template>

<script>
import {
  retrieveInterfaceLog,
  retrieveInterfaceNumbers
} from "@/api/interface";
import { getColor } from "@/common/js/util";
import charts from "./components/charts";
import detailChart from "./components/detailCharts";
export default {
  data() {
    return {
      utilizeTime: [],
      loading: false,
      classLoading: false,
      gridData: [],
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

      pageSize: 50,
      currentPage: 1,
      total: 0,
      classTotalNumber: 0, //当日档案总数
      classData: []
    };
  },
  methods: {
    changeUtilizeTime() {},
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        pageSize: this.pageSize,
        pageNumber: this.currentPage
      };
      this.searchFunc(params);
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        pageSize: this.pageSize,
        pageNumber: this.currentPage
      };
      this.searchFunc(params);
    },
    initTable() {
      let params = {
        pageSize: this.pageSize,
        pageNumber: this.currentPage
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      this.loading = true;
      if (this.utilizeTime && this.utilizeTime.length > 0) {
        params.starTime = this.utilizeTime[0];
        params.endTime = this.utilizeTime[1];
      }
      retrieveInterfaceLog(params).then(res => {
        this.loading = false;
        if (res.success) {
          this.gridData = res.data.list;
          this.total = res.data.total;
        } else {
          this.gridData = [];
          this.$message.error(res.msg);
        }
      });
    },
    initClassNumber() {
      let params = {
        starTime: new Date().format("yyyy-MM-dd"),
        endTime: new Date().format("yyyy-MM-dd")
      };
      this.classLoading = true;
      retrieveInterfaceNumbers(params).then(res => {
        //当日
        this.classLoading = false;
        if (res.success) {
          let list = res.data || [];
          let total = 0;
          list.forEach(val => {
            total += val.NUMBERS;
          });
          this.classTotalNumber = total;
          list.forEach(val => {
            this.classData.push({
              text: val.NAME,
              number: val.NUMBERS,
              proportion: Number(((val.NUMBERS / total) * 100).toFixed(0)),
              color: getColor()
            });
          });
        } else {
          this.classData = [];
          this.$message.error(res.msg);
        }
      });
    }
  },
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {
    this.initTable();
    this.initClassNumber();
  },
  components: {
    detailChart,
    charts
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>
<style scoped lang='scss'>
/* @import url(); 引入css类 */
section {
  .wrapper_top,
  .tableContent,
  .classification {
    padding: 10px 0;
    background-color: #fff;
  }
  .header {
    padding: 0 15px;
    .title {
      height: 40px;
      line-height: 40px;
      color: #333;
      font-weight: 700;
    }
  }
  .classContent {
    min-height: 160px;
    .item {
      width: 20%;
      height: 120px;
      padding: 20px;
      .item_right {
        line-height: 30px;
        flex: 1;
        margin-left: 20px;
        .num span {
          font-size: 28px;
          font-weight: 700;
          color: #666;
        }
      }
    }
  }
}
</style>