<!-- 小组审批 -->
<template>
  <section>
    <el-tabs v-model="activeName" class="tablist" @tab-click="handleClick">
      <el-tab-pane label="登录日志" name="first"></el-tab-pane>
      <el-tab-pane label="操作日志" name="second"></el-tab-pane>
      <el-tab-pane label="原文挂接日志" name="third"></el-tab-pane>
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>用户标识：</label>
          <el-input size="small" type="text" placeholder="请输入用户标识" v-model="searchForm.userCode" @keyup.enter.native="search"></el-input>
        </div>
        <div class="item">
          <label for>客户端IP：</label>
          <el-input size="small" type="text" placeholder="请输入客户端IP" v-model="searchForm.macNumber" @keyup.enter.native="search"></el-input>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <!-- ceeshi -->
      <div class="header-bot" style="margin-top:-15px">
        <div class="item">
          <label for>操作时间：</label>
          <el-date-picker
            v-model="searchForm.operationTime"
            type="daterange"
            align="left"
            size="small"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="search"
          ></el-date-picker>
        </div>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div>
          <!-- <el-button type="primary" size="small">删除</el-button> -->
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
        >
          <el-table-column label="序号" align="center" width="55">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="用户标识" align="center" prop="usercode"></el-table-column>
          <el-table-column label="客户端IP" align="center" prop="macnumber"></el-table-column>
          <el-table-column label="操作时间" align="center" prop="judgedate">
            <template slot-scope="scope">
              <span>{{new Date(scope.row.time).format('yyyy-MM-dd hh:mm:ss')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="系统模块" align="center" prop="system"></el-table-column>
          <el-table-column label="所属部门" align="center" prop="departmentName"></el-table-column>
          <el-table-column label="操作描述" align="center" prop="content" min-width="200"></el-table-column>
    
          <!-- <el-table-column property="set" label="操作" align="center" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column> -->
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20,50,100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
  </section>
</template>
<script>
import { retrieveSystemLog } from "@/api/systemLog";
export default {
  name: "systemLog",
  data() {
    return {
      activeName: "first",
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
      loading: false,
      gridData: [],
      pageSize: 50,
      currentPage: 1,
      total: 0,
      searchForm: {
        //搜索的表单
        macNumber: "",
        operationTime: [],
        userCode: ""
      },
      type: ""
    };
  },
  methods: {
    handleClick(tab) {
      if (tab.name == "first") {
        //tab切换 登录=1 操作等于2
        this.type = 1;
      } else if (tab.name == "second") {
        this.type = 2;
      } else {
        this.type = 3;
      }
      let params = {
        pageSize: 50,
        pageNumber: 1
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      params.macNumber = this.searchForm.macNumber;
      params.userCode = this.searchForm.userCode;
      params.numbers = this.type;

      if (this.searchForm.operationTime && this.searchForm.operationTime.length > 0) {
        params.starTime = this.searchForm.operationTime[0];
        params.endTime = this.searchForm.operationTime[1];
      }
      this.loading = true;
      retrieveSystemLog(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
          } else {
            this.gridData = [];
            this.total = 0;
            this.currentPage = 1;
            this.pageSize = 50;
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    initData() {
      if (this.type == "1") {
        //tab切换 登录=1 操作等于2
        this.activeName = "first";
      } else if (this.type == "2") {
        this.activeName = "second";
      } else {
        this.activeName = "third";
      }
      let params = {
        pageSize: 50,
        pageNumber: 1
      };
      this.searchFunc(params);
    },
    handleDelete(row) {
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          // deleteUser({
          //   usercode: this.usercode
          // })
          //   .then(res => {
          //     if (res.success) {
          //       this.$message.success("删除成功");
          //       this.initData();
          //     } else {
          //       this.$message.error(res.msg);
          //     }
          //   })
          //   .catch(res => {});
        })
        .catch(() => {});
    },
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
    search() {
      let params = {
        pageSize: 50,
        pageNumber: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        macNumber: "",
        operationTime: [],
        userCode: ""
      };
      this.currentPage = 1;
      this.pageSize = 50;
      this.initData();
    }
  },
  mounted() {
    this.type = this.$route.query.flag || 1;
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>





