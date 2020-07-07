<!-- 借出处置 -->
<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3 style>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>借阅人：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入借阅人名称"
            v-model="searchForm.username"
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
          <el-button size="small" type="primary" @click="Reminder">批量催还</el-button>
          <el-button size="small" type="primary" plain @click="handleReturn">批量归还</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          :span-method="objectSpanMethod"
          ref="tableBox"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1}}</template>
          </el-table-column>
          <el-table-column label="借阅人" align="center" :show-overflow-tooltip="true" prop="username"></el-table-column>
          <el-table-column label="结束日期" align="center" :show-overflow-tooltip="true" prop="enddate">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.enddate).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column label="所属部门" align="center" :show-overflow-tooltip="true" prop="depName"></el-table-column>
          <el-table-column
            label="题名"
            align="center"
            :show-overflow-tooltip="true"
            prop="maintitle"
            min-width="200"
          ></el-table-column>

          <el-table-column
            label="存放位置"
            align="center"
            :show-overflow-tooltip="true"
            prop="auxiName"
          ></el-table-column>
          <el-table-column label="状态" align="center">
            <template slot-scope="scope">
              <span v-html="getStatus(scope.row)"></span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="handleRead(scope.row)">处理</el-button>
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
    <el-dialog width="300px" title="催还处置信息" :visible.sync="dialogVisible">
      <el-form ref="form" :model="form" label-width="0" :rules="rules">
        <el-form-item prop="value">
          <el-select v-model="form.value" clearable>
            <el-option value="逾期催还" label="逾期催还"></el-option>
            <el-option value="提早收回" label="提早收回"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postCH('form')">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { Base64 } from "js-base64";
import { lendAndBack, takeBackAndLend } from "@/api/borrow";
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
      searchForm: {
        //搜索的表单
        maintitle: "",
        username: "",
        enddate: ""
      },
      gridData: [],
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0,
      spanArr: [],
      form: {
        value: ""
      },
      rules: {
        value: [{ required: true, message: "请选择一项", trigger: "change" }]
      },
      dialogVisible: false
    };
  },
  methods: {
    handleRead(row) {
      let title = "借出处理";
      this.$router.push({
        path: "/lendingDisposal",
        query: {
          num: Base64.encode(row.danghao),
          title: Base64.encode(title)
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
    getStatus(row) {
      let enddate = new Date(row.enddate);
      let nowdate = new Date();
      let x = nowdate - enddate;
      if (x <= 0) {
        return '<span style="color:#1ABC9C">借出中</span>';
      } else {
        let day = parseInt(x / (1000 * 60 * 60 * 24));
        return '<span style="color:#ff0036">逾期' + day + "天</span>";
      }
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
        star: 1,
        useStatus: "借出",
        useStatusFlag: "借出"
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        maintitle: "",
        enddate: "",
        username: ""
      };
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },
    initData() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage,
        useStatus: "借出",
        useStatusFlag: "借出"
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      params.username = this.searchForm.username;
      if (this.searchForm.enddate && this.searchForm.enddate.length > 0) {
        params.starTime = this.searchForm.enddate[0];
        params.endTime = this.searchForm.enddate[1];
      }
      params.maintitle = this.searchForm.maintitle;
      this.loading = true;
      lendAndBack(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
            this.spanArr = [];
            this.handleData();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    Reminder() {
      let selectData = this.$refs.tableBox.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要催还的记录");
        return;
      }
      this.dialogVisible = true;
      this.form.value = "逾期催还";
    },
    postCH(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          let selectData = this.$refs.tableBox.selection;
          let danghaos = [];
          selectData.forEach(item => {
            danghaos.push(item.danghao);
          });
          danghaos = Array.from(new Set(danghaos));
          let params = {
            useStatus: "催还",
            danghaos: danghaos.join(),
            recallReason: this.form.value
          };
          takeBackAndLend(params).then(res => {
            if (res.success) {
              this.$message.success("操作成功");
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
    handleReturn() {
      let selectData = this.$refs.tableBox.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要归还的记录");

        return;
      }
      let danghaos = [];
      selectData.forEach(item => {
        danghaos.push(item.danghao);
      });
      danghaos = Array.from(new Set(danghaos));
      let params = {
        useStatus: "归还",
        danghaos: danghaos.join()
      };
      takeBackAndLend(params).then(res => {
        if (res.success) {
          this.$message.success("操作成功");
          this.initData();
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  },
  mounted() {
    this.initData();
  }
};
</script>





