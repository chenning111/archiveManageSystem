<!-- 我的申请 -->
<template>
  <section>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tablist">
      <el-tab-pane label="综合历史" name="allHistory"></el-tab-pane>
      <el-tab-pane label="在线借阅" name="1"></el-tab-pane>
      <el-tab-pane label="下载打印" name="3"></el-tab-pane>
      <el-tab-pane label="实体查阅" name="4"></el-tab-pane>
      <el-tab-pane label="实体借出" name="2"></el-tab-pane>
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
    <el-col
      :span="24"
      style="background-color:#fff;margin-top:20px;min-height:500px;"
    >
      <div class="tableTitle">
        <div>数据列表</div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="tableBox"
          tooltip-effect="dark"
        >
          <el-table-column
            type="selection"
            width="55"
            align="center"
          ></el-table-column>
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{
              scope.$index + 1 + index
            }}</template>
          </el-table-column>

          <el-table-column
            label="档号"
            align="center"
            prop="archiveNo"
          ></el-table-column>
          <el-table-column
            label="文号"
            align="center"
            prop="documentNo"
          ></el-table-column>
          <el-table-column
            label="题名"
            align="center"
            min-width="200"
            prop="maintitle"
          ></el-table-column>
          <el-table-column label="结束日期" align="center">
            <template slot-scope="scope">
              <span>{{
                new Date(scope.row.enddate).format("yyyy-MM-dd")
              }}</span>
            </template>
          </el-table-column>
          <el-table-column label="借阅类型" align="center">
            <template slot-scope="scope">
              <span v-if="scope.row.lendflag == 1">在线借阅</span>
              <span v-if="scope.row.lendflag == 2">实体借出</span>
              <span v-if="scope.row.lendflag == 3">下载打印</span>
              <span v-if="scope.row.lendflag == 4">实体查阅</span>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" prop="useStatus">
            <template slot-scope="scope">
              <span
                v-if="
                  scope.row.useStatus == '收回' || scope.row.useStatus == '归还'
                "
                style="color:#ff0036"
                >失效</span
              >
              <span v-else style="color:#1ABC9C">授权</span>
            </template>
          </el-table-column>
          <el-table-column
            property="set"
            label="操作"
            align="center"
            width="200"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="handleRead(scope.row)"
                title="查看原文"
                v-if="
                  scope.row.useStatus !== '收回' &&
                    scope.row.useStatus !== '归还'
                "
                >原({{ scope.row.yuanWenShuLiang }})</el-button
              >
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
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
  </section>
</template>
<script>
import { getUseLend } from "@/api/borrow";
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
        lendtype: "",
        maintitle: "",
        lendusercode: "",
        enddate: ""
      },
      activeName: "allHistory",
      gridData: [],
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0
    };
  },
  methods: {
    async handleRead(row) {
      let tableViewTree = await this.$store.dispatch("tree/tableViewTree");
      let data = this.getClassNode([tableViewTree], row.tablecode, []);
      if (data.length == 0) {
        this.$message.error("该文件所在门类不存在");
        return;
      }

      this.$router.push({
        path: "/searchContent",
        query: {
          recordCode: row.recordcode,
          tableCode: row.tablecode,
          mainTitle: row.maintitle || row.mainTitle,
          classnodeId: data[0].li_attr.cNodeCode,
          isSearch: true
        }
      });
    },
    handleClick(tab) {
      this.activeName = tab.name;
      this.search();
    },
    getClassNode(tree, id, arr) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].li_attr) {
          if (tree[i].li_attr.TABLECODE == id) {
            arr.push(tree[i]);
            return arr;
          } else {
            if (tree[i].hasOwnProperty("children") && tree[i].children) {
              if (tree[i].children.length > 0) {
                this.getClassNode(tree[i].children, id, arr);
              }
            }
          }
        }
      }
      return arr;
    },
    getIsWrite(row) {
      if (row.anticipativeeffect) {
        return false;
      } else {
        return true;
      }
    },
    handleClick() {
      this.search();
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
      params.useStatus = "授权阅读";
      if (this.searchForm.enddate && this.searchForm.enddate.length > 0) {
        params.starTime = this.searchForm.enddate[0];
        params.endTime = this.searchForm.enddate[1];
      }
      if (this.activeName == "allHistory") {
        //全部
        params.lendflag = "";
      } else {
        params.lendflag = this.activeName;
      }
      params.maintitle = this.searchForm.maintitle;
      params.expire = true;
      // params.lendflag = this.searchForm.lendtype;
      params.archiveNo = this.searchForm.archiveNo;
      params.documentNo = this.searchForm.documentNo;
      this.loading = true;
      getUseLend(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            let list = res.data.list || [];
            this.gridData = list.filter(
              item =>
                item.useStatus != "收回" &&
                item.useStatus != "归还" &&
                item.lendflag != 5
            );
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
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
