<!-- 一级审核处置 -->
<template>
  <section>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tablist">
      <el-tab-pane label="全部" name="全部"></el-tab-pane>
      <el-tab-pane label="待审核" name="待审核"></el-tab-pane>
      <el-tab-pane label="已审核" name="已审核"></el-tab-pane>
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>借阅类型：</label>
          <el-select size="small" v-model="searchForm.lendtype" clearable @change="search">
            <el-option label="在线借阅" value="1"></el-option>
            <el-option label="实体借出" value="2"></el-option>
            <el-option label="下载打印" value="3"></el-option>
            <el-option label="实体查阅" value="4"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label for>申请人：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入申请人名称"
            v-model="searchForm.lendusercode"
            @keyup.enter.native="search"
          ></el-input>
        </div>
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
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" style="margin-top:-15px">
        <div class="item">
          <label for>结束日期：</label>
          <el-date-picker
            v-model="searchForm.enddate"
            type="daterange"
            align="right"
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
      <div class="tableTitle">
        <div>
          数据列表
          <span class="tag">相同处理方式的文件，才可以进行批量处理</span>
        </div>
        <div>
          <el-button size="small" type="primary" @click="PLexamine" v-if="activeName =='待审核'">批量审核</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="tableBox"
          tooltip-effect="dark"
          :span-method="objectSpanMethod"
          @sort-change="handleSort"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="申请人" align="center" prop="username"></el-table-column>
          <el-table-column label="结束日期" align="center" prop="enddate">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.enddate).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请人部门" align="center" prop="useDepName"></el-table-column>
          <el-table-column label="题名" align="center" min-width="200" prop="maintitle"></el-table-column>
          <el-table-column label="借阅类型" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.lendflag == 1">在线借阅</span>
              <span v-if="scope.row.lendflag == 2">实体借出</span>
              <span v-if="scope.row.lendflag == 3">下载打印</span>
              <span v-if="scope.row.lendflag == 4">实体查阅</span>
            </template>
          </el-table-column>
          <el-table-column label="所在位置" align="center" prop="auxiName"></el-table-column>
          <el-table-column label="状态" align="center" prop="useStatus">
            <template slot-scope="scope">
              <span v-if="scope.row.useStatus == '未处理'">待审核</span>
              <span v-else>已审核</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="handleRead(scope.row)"
                v-if="scope.row.useStatus == '未处理'"
              >审核</el-button>
              <el-button size="mini" type="success" @click="handleRead(scope.row)" v-else>查看</el-button>
              <!-- <el-button size="mini" type="text" @click="handleDelete(scope.row)" v-if="activeName =='已审核'">删除</el-button> -->
              <!-- <el-button size="mini" type="text" @click="handleDelete(scope.row)">打印</el-button> -->
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
    <!-- 批量审核 -->
    <el-dialog title="借阅批量处置" :visible.sync="dialogVisible" width="560px">
      <el-form :model="examineForm" ref="examineForm" label-width="110px">
        <el-form-item
          label="借阅处理："
          prop="name"
          :rules="[{ required: true, message: '请选择', trigger: 'change' }]"
        >
          <el-select v-model="examineForm.name">
            <el-option label="同意" value="同意"></el-option>
            <el-option label="不同意" value="不同意"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitexamineForm('examineForm')">提交</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { Base64 } from "js-base64";

import { firstGetUseLend, firstCheck } from "@/api/borrow";
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
      dialogVisible: false,
      examineForm: {
        name: ""
      },
      activeName: "全部",
      searchForm: {
        //搜索的表单
        lendtype: "",
        maintitle: "",
        lendusercode: "",
        enddate: ""
      },
      gridData: [],
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0,
      spanArr: [],
      sorts: {
        username: "asc",
        depName: "desc"
      }
    };
  },
  methods: {
    handleSort({ column, prop, order }) {
      if (order) {
        this.sorts[prop] = order == "ascending" ? "asc" : "desc";
      } else {
        this.$delete(this.sorts, prop);
      }
    },
    setSortTable() {
      if (this.sorts) {
        for (let i of this.$refs.tableBox.columns) {
          let name = i.property;
          if (this.sorts.hasOwnProperty(name)) {
            i.order = this.sorts[name] == "asc" ? "ascending" : "descending";
          } else {
            i.order = "";
          }
        }
      }
    },
    handleDelete() {},
    submitexamineForm(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          let selectData = this.$refs.tableBox.selection;
          let danghaos = [];
          selectData.forEach(item => {
            danghaos.push(item.danghao);
          });
          danghaos = Array.from(new Set(danghaos));
          let params = {
            checkResult: this.examineForm.name,
            checkTime: new Date().format("yyyy-MM-dd hh:mm:ss"),
            checkPerson: this.userInfo.userCode,
            danghaos: danghaos.join()
          };
          if (params.checkResult == "同意") {
            params.checkOpinion = "同意本次请求";
          } else {
            params.checkOpinion = "不同意本次请求";
          }
          firstCheck(params).then(res => {
            if (res.success) {
              this.$message.success("审核成功");
              this.dialogVisible = false;
              this.initData();
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex !== 5) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        };
      }
    },
    handleData() {
      let contactDot = 0;
      this.gridData.forEach((item, index) => {
        item.index = index;
        if (index === 0) {
          this.spanArr.push(1);
        } else {
          if (item.danghao === this.gridData[index - 1].danghao) {
            this.spanArr[contactDot] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            contactDot = index;
          }
        }
      });
    },
    handleClick() {
      this.search();
    },
    handleRead(row) {
      //审核
      let title = "";
      if (row.useStatus == "未处理") {
        title = "审核";
      } else {
        title = "查看";
      }
      this.$router.push({
        path: "/firstDetails",
        query: {
          num: Base64.encode(row.danghao),
          title: Base64.encode(title)
        }
      });
    },
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
    search() {
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        lendtype: "",
        maintitle: "",
        lendusercode: "",
        enddate: ""
      };
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },
    initData() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      params.useStatus = this.activeName;
      params.username = this.searchForm.lendusercode;
      if (this.searchForm.enddate && this.searchForm.enddate.length > 0) {
        params.starTime = this.searchForm.enddate[0];
        params.endTime = this.searchForm.enddate[1];
      }
      params.maintitle = this.searchForm.maintitle;
      params.lendflag = this.searchForm.lendtype;
      params.ifRead = false;
      this.loading = true;
      firstGetUseLend(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
            this.spanArr = [];
            this.handleData();
            // this.setSortTable();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    PLexamine() {
      let selectData = this.$refs.tableBox.selection;
      let flag = true;

      if (selectData.length == 0) {
        this.$message.warning("请勾选需要审核的内容");

        return;
      }
      for (let i = 0; i < selectData.length; i++) {
        if (selectData[0].lendflag != selectData[i].lendflag) {
          flag = false;
          break;
        }
      }
      if (!flag) {
        this.$alert("请选择相同借阅类型的记录或根据条件查询", "提示", {
          type: "warning"
        })
          .then(() => {})
          .catch(err => {});
        return;
      }
      this.dialogVisible = true;
    }
  },
  mounted() {
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    },
    userInfo() {
      return this.$store.getters.userInfo;
    }
  }
};
</script>





