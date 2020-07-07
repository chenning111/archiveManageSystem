<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>标题：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入标题"
            v-model="searchForm.title"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>移交人：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入移交人名称"
            v-model="searchForm.transferUser"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>日期：</label>
          <el-date-picker
            v-model="searchForm.transferDate"
            type="daterange"
            size="small"
            align="right"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="search"
          ></el-date-picker>
        </div>
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle">
        <div>数据列表</div>
        <div>
          <el-button size="small" type="primary" @click="$router.push('/fileTransfer')">新增</el-button>
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
          <el-table-column
            label="标题"
            align="left"
            :show-overflow-tooltip="true"
            prop="title"
            min-width="200"
          ></el-table-column>
          <el-table-column
            label="概述"
            align="center"
            :show-overflow-tooltip="true"
            prop="description"
          ></el-table-column>
          <el-table-column
            label="移交日期"
            align="center"
            :show-overflow-tooltip="true"
            prop="transferDate"
          >
            <template slot-scope="scope">{{new Date(scope.row.transferDate).format('yyyy-MM-dd')}}</template>
          </el-table-column>
          <el-table-column
            label="移交人"
            align="center"
            :show-overflow-tooltip="true"
            prop="transferUser"
          ></el-table-column>
          <el-table-column
            label="接收人"
            align="center"
            :show-overflow-tooltip="true"
            prop="receiveUser"
          ></el-table-column>
          <el-table-column
            label="总件数"
            align="center"
            :show-overflow-tooltip="true"
            prop="totalNumber"
          ></el-table-column>
          <el-table-column
            label="总页数"
            align="center"
            :show-overflow-tooltip="true"
            prop="totalPages"
          ></el-table-column>
          <el-table-column
            label="其中电子件"
            align="center"
            :show-overflow-tooltip="true"
            prop="electronicNumber"
          ></el-table-column>
          <el-table-column
            label="纸质件"
            align="center"
            :show-overflow-tooltip="true"
            prop="paperNumber"
          ></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="250" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)" title="删除">删除</el-button>
              <el-dropdown>
                <el-button type="primary" size="mini">
                  下载
                  <i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="handleDownload(1,scope.row)">确认移交单</el-dropdown-item>
                  <el-dropdown-item @click.native="handleDownload(2,scope.row)">移交文件</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
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
    </el-col>
  </section>
</template>
<script>
import { downloadFile } from "@/common/js/util";
import {
  retrieveTransfer,
  deleteTransfer,
  downloadTransferFile,
  updateTransfer
} from "@/api/fileTransfer";
export default {
  data() {
    return {
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
      transferId: "",
      searchForm: {
        title: "",
        transferUser: "",
        transferDate: []
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      loading: false,
      gridData: [] //渲染表格数据
    };
  },

  methods: {
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      this.initData();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.initData();
    },
    handleDownload(code, row) {
      downloadTransferFile({ transferId: row.transferId, type: code }).then(
        res => {
          let fileName = res.headers["content-disposition"]
            .split(";")[1]
            .split("filename=")[1];
          if (
            res.data.type == "application/json" ||
            res.data.type == "application/json;charset=UTF-8"
          ) {
            this.$message.error("下载失败");
          } else {
            downloadFile(decodeURI(fileName), res.data);
          }
        }
      );
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
        title: "",
        transferUser: "",
        transferDate: []
      };
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },

    handleDelete(row) {
      //删除
      this.transferId = row.transferId;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteTransfer({
            transferId: this.transferId
          })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {
              this.$message.error(res.msg);
            });
        })
        .catch(() => {});
    },

    searchFunc(params) {
      params.title = this.searchForm.title;
      params.transferUser = this.searchForm.transferUser;
      if (
        this.searchForm.transferDate &&
        this.searchForm.transferDate.length > 0
      ) {
        params.starTime = this.searchForm.transferDate[0];
        params.endTime = this.searchForm.transferDate[1];
      }
      this.loading = true;
      retrieveTransfer(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
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
      let params = {
        pageSize: this.pageSize,
        pageNumber: this.currentPage
      };
      this.searchFunc(params);
    }
  },
  mounted() {
    this.initData();
  }
};
</script>


