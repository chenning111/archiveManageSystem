<!-- 鉴定清册 -->
<template>
  <section>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tablist">
      <el-tab-pane label="续存" name="first"></el-tab-pane>
      <el-tab-pane label="待销毁" name="second"></el-tab-pane>
      <el-tab-pane label="销毁" name="third"></el-tab-pane>
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>题名：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入题名"
            v-model="searchForm.maintitle"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>鉴定人：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入鉴定人名称"
            v-model="searchForm.person"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>原保管期限：</label>
          <el-select v-model="searchForm.retentionold" size="small" clearable @change="search">
            <el-option value="永久" label="永久"></el-option>
            <el-option value="长期" label="长期"></el-option>
            <el-option value="短期" label="短期"></el-option>
            <el-option value="定期10年" label="定期10年"></el-option>
            <el-option value="定期30年" label="定期30年"></el-option>
          </el-select>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" style="margin-top:-15px">
        <div class="item">
          <label for>鉴定日期：</label>
          <el-date-picker
            v-model="searchForm.judgedate"
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
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div>
          <el-button
            type="primary"
            size="small"
            v-if="activeName =='second'"
            @click="handleListDestory"
          >批量销毁</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          ref="dataTable"
        >
          <el-table-column align="center" type="selection"></el-table-column>
          <el-table-column label="序号" align="center" width="55">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="档号" align="center" prop="archiveno" min-width="200"></el-table-column>
          <el-table-column label="题名" align="center" prop="maintitle" min-width="200"></el-table-column>
          <el-table-column label="原保管期限" align="center" prop="retentionold"></el-table-column>
          <el-table-column label="鉴定人" align="center" prop="person"></el-table-column>
          <el-table-column label="鉴定意见" align="center" prop="opinion"></el-table-column>
          <el-table-column label="鉴定日期" align="center">
            <template slot-scope="scope">
              <span>{{new Date(scope.row.judgedate).format('yyyy-MM-dd')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="销毁时间" align="center" v-if="activeName === 'third'" key="2">
            <template slot-scope="scope">
              <span>{{new Date(scope.row.destroydate).format('yyyy-MM-dd')}}</span>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            align="center"
            width="200"
            fixed="right"
            v-if="activeName === 'second'"
            key="3"
          >
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="resetXh(scope.row)">放弃销毁</el-button>
              <el-button size="mini" type="danger" @click="handledelete(scope.row)">确认销毁</el-button>
            </template>
          </el-table-column>
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
import {
  retrieveFirstDestroyJudgeOpinionMsg,
  retrieveDestroyInfo,
  cancelDestroyByRecordCodes
} from "@/api/judge";
import { Base64 } from "js-base64";

export default {
  name: "appraisaList",
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
        judgedate: [],
        person: "",
        maintitle: "",
        retentionold: ""
      }
    };
  },
  methods: {
    resetXh(row) {
      //取消销毁
      this.$confirm("是否确定取消销毁", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          cancelDestroyByRecordCodes({
            recordCodes: row.recordcode
          })
            .then(res => {
              if (res.success) {
                this.$message.success("取消成功");
                this.searchDestory();
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
    handleListDestory() {
      //批量销毁
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要销毁的文件");
        return;
      }
      let recordCodeList = [];
      selectData.forEach(item => {
        recordCodeList.push(item.recordcode);
      });
      this.$router.push({
        path: "/destructionList",
        query: {
          recordCodeList: recordCodeList.join()
        }
      });
    },
    handleClick() {
      let params = {
        limit: 50,
        star: 1
      };
      if (this.activeName == "first") {
        //tab切换 续存 和待销毁 销毁
        this.initData();
      } else if (this.activeName == "second") {
        this.searchDestory(params);
      } else if (this.activeName == "third") {
        this.searchDestory(params);
      }
    },
    searchDestory(params) {
      //获取销毁清册
      if (this.activeName == "second") {
        params.isdestroy = 0;
      } else if (this.activeName == "third") {
        params.isdestroy = "T";
      }
      params.person = this.searchForm.person;
      params.retentionold = this.searchForm.retentionold;
      params.maintitle = this.searchForm.maintitle;
      if (this.searchForm.judgedate.length > 0) {
        params.judgedate = this.searchForm.judgedate[0];
        params.endJudgedate = this.searchForm.judgedate[1];
      }
      this.loading = true;
      retrieveDestroyInfo(params)
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
    handledelete(row) {
      this.$router.push({
        path: "/destructionList",
        query: {
          recordCodeList: row.recordcode
        }
      });
    },

    searchFunc(params) {
      //续存
      params.person = this.searchForm.person;
      params.retentionold = this.searchForm.retentionold;
      params.maintitle = this.searchForm.maintitle;
      params.status = 2; //小组同意
      params.type = 1; //鉴定
      if (this.searchForm.judgedate && this.searchForm.judgedate.length > 0) {
        params.judgedate = this.searchForm.judgedate[0];
        params.endJudgedate = this.searchForm.judgedate[1];
      }
      this.loading = true;
      retrieveFirstDestroyJudgeOpinionMsg(params)
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
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      if (this.activeName != "first") {
        this.searchDestory(params);
      } else {
        this.searchFunc(params);
      }
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      if (this.activeName != "first") {
        this.searchDestory(params);
      } else {
        this.searchFunc(params);
      }
    },
    search() {
      let params = {
        limit: 50,
        star: 1
      };
      if (this.activeName != "first") {
        this.searchDestory(params);
      } else {
        this.searchFunc(params);
      }
    },
    reset() {
      this.searchForm = {
        person: "",
        judgedate: [],
        retentionold: "",
        maintitle: ""
      };
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      if (this.activeName != "first") {
        this.searchDestory(params);
      } else {
        this.searchFunc(params);
      }
    }
  },
  mounted() {
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>
<style lang="scss" scoped>
</style>




