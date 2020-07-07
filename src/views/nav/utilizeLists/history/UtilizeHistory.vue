<!-- 利用授权公共页面 -->
<template>
  <section>
    <el-tabs v-model="activeName" @tab-click="handleClick" class="tablist">
      <el-tab-pane label="综合历史" name="allHistory"></el-tab-pane>
      <el-tab-pane label="在线借阅" name="1"></el-tab-pane>
      <el-tab-pane label="实体借出" name="2"></el-tab-pane>
      <el-tab-pane label="下载打印" name="3"></el-tab-pane>
      <el-tab-pane label="实体查阅" name="4"></el-tab-pane>
      <el-tab-pane label="直接阅读" name="5"></el-tab-pane>
      <el-tab-pane label="利用效果登记" name="usingFeedback"></el-tab-pane>
      <el-tab-pane label="利用登记簿" name="uploadHistory"></el-tab-pane>
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot" v-show="activeName == 'uploadHistory'">
        <div class="item">
          <label for>题名：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入题名"
            v-model="searchForm.title"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>上传日期：</label>
          <el-date-picker
            v-model="searchForm.uploadDate"
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
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" v-show="activeName != 'uploadHistory'">
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
          <el-button
            size="small"
            type="primary"
            @click="addData"
            v-show="activeName == 'uploadHistory'"
          >新增</el-button>
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
          v-show="activeName == 'uploadHistory'"
        >
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1}}</template>
          </el-table-column>
          <el-table-column
            label="题名"
            align="left"
            :show-overflow-tooltip="true"
            prop="title"
            min-width="200"
          ></el-table-column>
          <el-table-column
            label="上传时间"
            align="center"
            :show-overflow-tooltip="true"
            prop="creatTime"
          >
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.creatTime).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column
            property="set"
            label="操作"
            align="center"
            :width="activeName == 'uploadHistory' ?250:50"
            fixed="right"
          >
            <template slot-scope="scope">
              <el-button size="mini" type="primary" @click="readHistory(scope.row)" title="查看">查看</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row.useId)"
                title="删除"
              >删除</el-button>
              <el-button size="mini" type="success" @click="handleDownload(scope.row)" title="下载">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          :span-method="objectSpanMethod"
          ref="tableBox"
          v-show="activeName !== 'uploadHistory'"
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
          <el-table-column property="set" label="操作" align="center" width="150" fixed="right">
            <template slot-scope="scope">
              <!-- <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button> -->
              <el-button
                size="mini"
                type="success"
                v-if="scope.row.anticipativeeffect && activeName!=5 && scope.row.lendflag!= 5"
                @click="readFk(scope.row)"
                title="查看利用登记详情"
              >反馈</el-button>
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
    <!-- 新增-->
    <el-dialog :visible.sync="addDialog" title="新增利用历史" width="700px" @close="closeDialog">
      <el-form :model="Form" ref="ruleForm" label-width="120px">
        <el-form-item label="题名：">
          <el-input v-model="Form.title"></el-input>
        </el-form-item>
        <el-form-item label="文件：">
          <el-upload
            ref="upload"
            :auto-upload="false"
            :with-credentials="true"
            :data="Form"
            :action="`${baseUrl}/userLend/addHistoricalUseBean/`"
            :on-change="uploadChange"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :limit="1"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传一个</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">上传</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { downloadFile } from "@/common/js/util";
import {
  secondGetUseLend,
  retrieveHistoricalUseBean,
  deleteHistoricalUseBean,
  downLoadHistoricalUse
} from "@/api/borrow";
export default {
  data() {
    return {
      baseUrl: this.baseURL,
      activeName: "allHistory",
      Form: {
        title: ""
      },
      addDialog: false,
      fileList: [],
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
        enddate: "",
        title: "",
        uploadDate: []
      },
      gridData: [],
      loading: false,
      pageSize: 50,
      currentPage: 1,
      total: 0,
      spanArr: []
    };
  },
  components: {},
  methods: {
    addData() {
      this.addDialog = true;
      this.fileList = [];
      this.Form.title = "";
    },
    readHistory(row) {
      this.$router.push({
        path: "/utilizeOriginal",
        query: {
          useId: row.useId
        }
      });
    },
    closeDialog() {
      this.addDialog = false;
      this.Form.title = "";
      this.fileList = [];
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    uploadChange(file, fileList) {
      this.fileList = fileList;
      var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
      if (!this.Form.title) {
        this.Form.title = file.name.substr(
          0,
          file.name.length - (testmsg.length + 1)
        );
      }
    },
    handleSuccess(res, file, fileList) {
      if (res.success) {
        this.$message.success("上传成功");
        this.addDialog = false;

        this.initData();
      } else {
        file.status = "ready";
        this.$message.error(res.msg);
      }
    },
    handleError(err, file) {
      this.$message.error(err);
      this.$refs.upload.clearFiles();
    },
    submitForm() {
      if (this.fileList.length == 0) {
        this.$message.warning("请选择文件");
        return;
      }
      var testmsg = this.fileList[0].name.substring(
        this.fileList[0].name.lastIndexOf(".") + 1
      );
      if (!this.Form.title) {
        this.Form.title = this.fileList[0].name.substr(
          0,
          this.fileList[0].name.length - (testmsg.length + 1)
        );
      }
      this.$refs.upload.submit();
    },
    handleDelete(code) {
      this.$confirm("是否将此文件删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            useId: code
          };
          deleteHistoricalUseBean(params).then(data => {
            if (data.success) {
              this.$message.success("删除成功");
            } else {
              this.$message.error(data.msg);
            }
            this.initData();
          });
        })
        .catch(() => {});
    },
    handleDownload(row) {
      //下载
      let params = {
        useId: row.useId
      };
      downLoadHistoricalUse(params).then(res => {
        let fileName = row.fileName;
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          downloadFile(fileName, res.data);
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
    readFk(row) {
      //查看反馈
      this.$alert("利用效果：" + row.anticipativeeffect, "利用效果登记", {
        confirmButtonText: "确定"
      })
        .then(() => {})
        .catch(() => {});
    },
    handleClick(tab) {
      this.activeName = tab.name;
      this.gridData = [];
      this.search();
    },
    handleRead(row) {
      //审核
      let title = "";
      if (row.useStatus == "一级核准" || row.useStatus == "一级否决") {
        title = "审核";
      } else {
        title = "查看";
      }
      this.$router.push({
        path: "/secondDetails",
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
      if (this.activeName != "uploadHistory") {
        this.searchFunc(params);
      } else {
        this.searchHistoryFunc(params);
      }
    },

    reset() {
      this.searchForm = {
        lendtype: "",
        maintitle: "",
        lendusercode: "",
        enddate: "",
        title: "",
        uploadDate: []
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
      if (this.activeName != "uploadHistory") {
        this.searchFunc(params);
      } else {
        this.searchHistoryFunc(params);
      }
    },
    searchHistoryFunc(params) {
      this.loading = true;
      params.title = this.searchForm.title;
      if (this.searchForm.uploadDate && this.searchForm.uploadDate.length > 0) {
        params.starTime = this.searchForm.uploadDate[0];
        params.endTime = this.searchForm.uploadDate[1];
      }
      retrieveHistoricalUseBean(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
          } else {
            this.gridData = [];
            this.total = 0;
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    searchFunc(params) {
      if (this.activeName == "allHistory") {
        //全部
        params.lendflag = "";
        params.useStatus = "全部";
      } else if (this.activeName == "usingFeedback") {
        params.effectFlag = "是";
        params.useStatus = "利用反馈";
        params.ifRead = false;
      } else {
        params.lendflag = this.activeName;
        params.useStatus = "全部";
      }

      params.username = this.searchForm.username;
      if (this.searchForm.enddate && this.searchForm.enddate.length > 0) {
        params.starTime = this.searchForm.enddate[0];
        params.endTime = this.searchForm.enddate[1];
      }
      params.maintitle = this.searchForm.maintitle;
      this.loading = true;
      secondGetUseLend(params)
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
    }
  },

  mounted() {
    this.initData();
  }
};
</script>




