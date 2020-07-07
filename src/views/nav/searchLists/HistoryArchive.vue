<!-- 利用历史 -->
<template>
  <section>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tablist">
      <el-tab-pane label="综合历史" name="allHistory"></el-tab-pane>
      <el-tab-pane label="在线借阅" name="1"></el-tab-pane>
      <el-tab-pane label="下载打印" name="3"></el-tab-pane>
      <el-tab-pane label="实体查阅" name="4"></el-tab-pane>
      <el-tab-pane label="实体借出" name="2"></el-tab-pane>
      <el-tab-pane label="直接阅读" name="5"></el-tab-pane>
      <el-tab-pane label="写反馈" name="6"></el-tab-pane>
      <!-- <el-tab-pane label="直接阅读" name="directRead"></el-tab-pane> -->
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>档号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入档号"
            v-model="searchForm.archiveNo"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>文号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入文号"
            v-model="searchForm.documentNo"
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
        <div>数据列表</div>
        <div>
          <!-- <el-button size="small" type="primary" @click="deleteData">批量删除</el-button> -->
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          ref="tableBox"
        >
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">
              {{
              scope.$index + 1 + index
              }}
            </template>
          </el-table-column>
          <el-table-column label="档号" align="center" prop="archiveNo"></el-table-column>
          <el-table-column label="文号" align="center" prop="documentNo"></el-table-column>
          <el-table-column label="题名" align="center" min-width="200" prop="maintitle"></el-table-column>
          <el-table-column label="结束日期" align="center">
            <template slot-scope="scope">
              <span>
                {{
                new Date(scope.row.enddate).format("yyyy-MM-dd")
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="存放位置" align="center" prop="auxiName"></el-table-column>
          <el-table-column label="借阅类型" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.lendflag == 1">在线借阅</span>
              <span v-if="scope.row.lendflag == 2">实体借出</span>
              <span v-if="scope.row.lendflag == 3">下载打印</span>
              <span v-if="scope.row.lendflag == 4">实体查阅</span>
              <span v-if="scope.row.lendflag == 5">直接阅读</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="left" width="250" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                class="fixedWidth"
                @click="handleRead(scope.row)"
                title="查看原文"
              >原({{ scope.row.yuanWenShuLiang }})</el-button>
              <el-button
                size="mini"
                type="warning"
                @click="handleWriteFk(scope.row)"
                v-if="getIsshow(scope.row)"
                title="填利用效果"
              >登记</el-button>
              <el-button
                size="mini"
                type="success"
                @click="handleReadFk(scope.row)"
                v-if="getShowWatch(scope.row)"
                title="查看利用登记详情"
              >反馈</el-button>
              <el-button
                size="mini"
                type="primary"
                @click="handlePrint(scope.row)"
                v-if="scope.row.lendflag != 5"
              >打印</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
    <el-dialog width="300px" title="效果登记信息" :visible.sync="dialogVisible">
      <el-form ref="form" :model="form" label-width="0" :rules="rules">
        <el-form-item prop="value">
          <el-select v-model="form.value" clearable>
            <el-option value="档案很有帮助" label="档案很有帮助"></el-option>
            <el-option value="没有用" label="没有用"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postFk('form')">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { Base64 } from "js-base64";
import { getUseLend, useFeedback } from "@/api/borrow";
export default {
  data() {
    return {
      activeName: "allHistory",
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
      searchForm: {
        //搜索的表单
        maintitle: "",
        enddate: "",
        documentNo: "",
        archiveNo: ""
      },
      gridData: [],
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0,
      spanArr: [],

      dialogVisible: false,
      form: {
        value: ""
      },
      rules: {
        value: [{ required: true, message: "请选择一项", trigger: "change" }]
      },
      dataInfo: {}
    };
  },
  components: {},
  methods: {
    handleRead(row) {
      //查看原文
      this.$router.push({
        path: "/searchContent",
        query: {
          recordCode: row.recordcode,
          tableCode: row.tablecode,
          mainTitle: row.maintitle || row.mainTitle,
          isSearch: true
        }
      });
    },
    handleWriteFk(row) {
      //填写反馈信息
      this.dialogVisible = true;
      this.dataInfo = row;
      this.form.value = "档案很有帮助";
    },

    postFk(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          useFeedback({
            anticipativeeffect: this.form.value,
            danghao: this.dataInfo.danghao
          }).then(res => {
            this.dialogVisible = false;
            if (res.success) {
              this.$message.success("成功");
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
    getIsshow(row) {
      let arr = ["二级核准", "归还", "催还", "借出", "收回"];
      if (row.lendflag != 5) {
        if (arr.includes(row.useStatus)) {
          if (!row.anticipativeeffect) {
            return true;
          } else {
            return false;
          }
        }
      }
    },
    getShowWatch(row) {
      let arr = ["二级核准", "归还", "催还", "借出", "收回"];
      if (row.lendflag != 5) {
        if (arr.includes(row.useStatus)) {
          if (row.anticipativeeffect) {
            return true;
          }
        }
      }
    },
    handleReadFk(row) {
      this.$alert("利用效果：" + row.anticipativeeffect, "利用效果登记", {
        confirmButtonText: "确定"
      })
        .then(() => {})
        .catch(() => {});
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex !== 3) {
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
    handleClick(tab) {
      this.activeName = tab.name;
      this.search();
    },
    handlePrint(row) {
      let title = "打印";
      this.$router.push({
        path: "/useDetail",
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
    handleDelete() {
      alert("暂未做");
      // this.$confirm(message, "提示", {
      //   confirmButtonText: "确定",
      //   cancelButtonText: "取消",
      //   type: "warning"
      // })
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
        maintitle: "",
        enddate: "",
        documentNo: "",
        archiveNo: ""
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
      params.useStatus = "全部";
      if (this.activeName == "allHistory") {
        //全部
        params.lendflag = "";
      } else if (this.activeName != "6") {
        params.lendflag = this.activeName;
      }
      if (this.activeName == 6) {
        params.effectFlag = "否";
        params.ifRead = false;
        params.useStatus = "授权阅读";
      }
      if (this.searchForm.enddate && this.searchForm.enddate.length > 0) {
        params.starTime = this.searchForm.enddate[0];
        params.endTime = this.searchForm.enddate[1];
      }
      params.maintitle = this.searchForm.maintitle;
      params.archiveNo = this.searchForm.archiveNo;
      params.documentNo = this.searchForm.documentNo;
      this.loading = true;
      getUseLend(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
            // this.spanArr = [];
            // this.handleData();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    }
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  mounted() {
    this.initData();
  }
};
</script>
