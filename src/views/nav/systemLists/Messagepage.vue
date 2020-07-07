<template>
  <!-- 消息管理 -->
  <section>
    <div class="content-header flex-spaceBetween">
      <div class="btngroup">
        <span :class="type == ''?'liChecked':''" @click="changeType('')">全部消息</span>
        <span :class="type == '1'?'liChecked':''" @click="changeType('1')">申请消息</span>
        <span :class="type == '2'?'liChecked':''" @click="changeType('2')">催还消息</span>
        <span :class="type == '3'?'liChecked':''" @click="changeType('3')">归还消息</span>
        <span :class="type == '4'?'liChecked':''" @click="changeType('4')">报表消息</span>
      </div>
    </div>
    <el-col :span="24" style="background-color:#fff;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div>
          <!-- <el-button size="small" type="primary" @click="deleteData">删除</el-button> -->
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
          <el-table-column label="序号" align="center" width="80px">
            <template slot-scope="scope">{{(scope.$index)+1+index}}</template>
          </el-table-column>
          <el-table-column label="标记" align="center" width="150">
            <template slot-scope="scope">
              <span v-if="scope.row.messagestatus == 0" title="未读">
                <i class="fa fa-envelope-o" style="color:#FEC03D"></i>
              </span>
              <span v-else title="已读">
                <i class="fa fa-envelope-open-o"></i>
              </span>
            </template>
          </el-table-column>
          <el-table-column label="发信人" align="center" prop="fromusername" width="150">
            <template slot-scope="scope">{{scope.row.fromusername||'系统消息'}}</template>
          </el-table-column>
          <el-table-column label="主题" align="left" prop="messagetitle" min-width="200">
            <template slot-scope="scope">
              <div v-html="scope.row.messagetitle"></div>
            </template>
          </el-table-column>
          <el-table-column label="发信日期" align="center" prop="senddate">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.senddate).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="150" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="success"
                @click="handleDownLoad(scope.row)"
                v-if="scope.row.type == 4 && scope.row.useStatus == '生成报表成功'"
              >下载</el-button>
              <el-button size="mini" type="primary" @click="handleRead(scope.row)" v-else>查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total, prev, pager, next,sizes"
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
import merge from "webpack-merge";
import { downloadFile } from "@/common/js/util";
import { downExcel } from "@/api/report";
import { readMessage, retrieveMessage, sendMessage } from "@/api/message";
export default {
  name: "messagePage",
  data() {
    return {
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0,
      gridData: [],
      messagecode: "",
      type: ""
    };
  },
  methods: {
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        type: this.type,
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        type: this.type,
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },

    handleRead(row) {
      //查看
      this.messagecode = row.messagecode;
      this.$router.push({
        name: "messageDetail",
        query: {
          code: row.messagecode
        }
      });
    },
    handleDownLoad(row) {
      let code = row.messagebody.split("：")[1];
      let params = {
        reportCode: code,
        type: 1
      };
      if (row.messagestatus == 0) {
        readMessage({ messagecode: row.messagecode }); //读取消息
      }
      downExcel(params).then(res => {
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          let filename;
          if (row.messagetitle.indexOf(";")) {
            filename = row.messagetitle.split(";")[0].split("：")[1];
          } else {
            filename = row.messagetitle.split("：")[1];
          }
          downloadFile(filename, res.data);
        }
      });
    },
    // handleDelete(row) {
    //   //删除
    //   this.messagecode = row.messagecode;
    //   this.$confirm("是否删除", "提示", {
    //     confirmButtonText: "确定",
    //     cancelButtonText: "取消",
    //     type: "warning"
    //   })
    //     .then(() => {
    //       deleteSubjectFirst({ messagecode: this.messagecode })
    //         .then(res => {
    //           if (res.success) {
    //             this.$message.success("删除成功");
    //             this.initData();
    //           } else {
    //             this.$message.error(res.msg);
    //           }
    //         })
    //         .catch(res => {
    //           this.$message.error(res.msg);
    //         });
    //     })
    //     .catch(() => {});
    // },
    // 修改table header的背景色

    initData() {
      this.type = this.$route.query.flag || "";
      this.dialogVisible = false;
      let params = {
        limit: this.pageSize,
        star: this.currentPage,
        type: this.type
      };
      this.searchFunc(params);
    },
    changeType(type) {
      this.type = type;
      this.$router.replace({
        query: merge(this.$route.query, { flag: this.type })
      });
    },
    searchFunc(params) {
      this.loading = true;
      retrieveMessage(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            let list = res.data.list;
            list.forEach((val, index) => {
              if (val.type == 4 && val.useStatus == "生成报表成功") {
                if (val.messagetitle.indexOf("；") > -1) {
                  let json = JSON.parse(val.messagetitle.split("；")[1]);
                  let str = "";
                  for (let i in json) {
                    if (i == "sort") {
                      str += "排序：";
                      json[i].forEach(item => {
                        str += `${item.field}-${item.des}，`;
                      });
                    }
                    if (i == "condition") {
                      str += "<br />条件：";
                      json[i].forEach(item => {
                        str += `${item.field}-${item.des}，`;
                      });
                    }
                  }
                  val.messagetitle =
                    val.messagetitle.split("；")[0] + ";<br/>" + str;
                }
              }
              val.messagetitle = val.messagetitle.replace(/\n/g, "<br/>");
            });
            // console.log(JSON.parse(data[0].messagetitle))
            this.gridData = list || [];
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
    }
  },
  mounted() {
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  watch: {
    "$route.query": {
      handler(newval, oldval) {
        this.type = newval.flag || "";
      },
      deep: true,
      immediate: true
    },
    type(newval, oldval) {
      let params = {
        type: newval,
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    }
  }
};
</script>
<style lang="scss" scoped>
section {
  .content-header {
    background-color: #fafafa;
    padding: 15px 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    .btngroup {
      span {
        display: inline-block;
        padding: 8px 10px;
        color: #666;
        margin-left: 10px;
        cursor: pointer;
        border-radius: 3px;
      }
      .liChecked {
        color: white;
      }
    }
  }
}
</style>