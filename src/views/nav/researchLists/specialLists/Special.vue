<template>
  <!-- 专题 -->
  <section>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>专题索引</span>
            <i
              :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
              @click="colcased = !colcased"
            ></i>
          </div>
          <div class="card">
            <thematic-tree @changeData="getTableList"></thematic-tree>
          </div>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 17 : 24"
        class="content-right"
        :class="!colcased ? 'paddingleft-30 ' : ''"
      >
        <i
          :icon="colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >专题索引</i>
        <div class="flex-start btngroup">
          <div>
            <el-button
              size="medium"
              type="primary"
              @click="appendData"
              :disabled="!dataInfo.id"
            >添加专题文件</el-button>
          </div>
        </div>
        <div
          style="padding:15px;border:1px solid #eee;position:relative;"
          class="clearboth searchBox"
          ref="searchBox"
        >
          <el-col :span="18" style="min-height:200px">
            <el-form
              ref="form"
              :model="searchForm"
              label-width="90px"
              inline
              size="small"
              v-if="dataInfo.id"
            >
              <el-col :span="24" class="searchForm">
                <el-form-item label="题名">
                  <el-input
                    size="small"
                    type="text"
                    placeholder="请输入题名"
                    v-model="searchForm.mainTitle"
                    @keydown.enter.native="submitForm"
                  ></el-input>
                </el-form-item>
                <el-form-item label="档号">
                  <el-input
                    size="small"
                    type="text"
                    placeholder="请输入档号"
                    v-model="searchForm.archiveNo"
                    @keydown.enter.native="submitForm"
                  ></el-input>
                </el-form-item>
                <el-form-item label="文号">
                  <el-input
                    size="small"
                    type="text"
                    placeholder="请输入文号"
                    v-model="searchForm.documentNo"
                    @keydown.enter.native="submitForm"
                  ></el-input>
                </el-form-item>
                <el-form-item label="责任者">
                  <el-input
                    size="small"
                    type="text"
                    placeholder="请输入责任者"
                    v-model="searchForm.responsibleBy"
                    @keydown.enter.native="submitForm"
                  ></el-input>
                </el-form-item>
                <el-form-item label="成文日期">
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
                    @change="submitForm"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <el-col :span="6" class="buttonGroup">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="submitForm"
              :disabled="dataInfo.id ? false : true"
            >查询</el-button>
            <el-button
              type="primary"
              size="small"
              plain
              @click="resetForm"
              icon="el-icon-refresh-left"
              :disabled="dataInfo.id ? false : true"
            >重置</el-button>
          </el-col>
        </div>
        <div class="slidebtn">
          <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
          <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
        </div>
        <div
          class="clearboth"
          style="border:1px solid #f2f2f2;padding-bottom:100px"
          v-show="dataInfo.id"
        >
          <el-col :span="24" class="clearboth tabList" style="margin:20px 0;padding:0 20px;">
            <el-tabs v-model="tabFlag">
              <el-tab-pane label="全部" name="全部"></el-tab-pane>
            </el-tabs>
            <div class="clearboth title">
              <p class="pull-left">
                共
                <em>{{ total }}</em>条记录
              </p>
              <div class="pull-right">
                <el-dropdown>
                  <el-button type="primary" size="medium">
                    导出
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item @click.native="exportCatalog">目录导出</el-dropdown-item>
                    <el-dropdown-item @click.native="exportCatalogOriginal">原文导出</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
              </div>
            </div>
          </el-col>
          <div>
            <el-table
              :data="tableData"
              border
              header-row-class-name="thClassName"
              v-loading="loading"
              ref="tableBox"
              tooltip-effect="dark"
              @sort-change="sortsFn"
            >
              <el-table-column type="selection" align="center"></el-table-column>
              <el-table-column label="序号" align="center" prop="serial" width="80px">
                <template slot-scope="scope">
                  {{
                  scope.$index + 1 + index
                  }}
                </template>
              </el-table-column>
              <el-table-column
                label="档号"
                align="center"
                prop="archiveNo"
                :show-overflow-tooltip="true"
                sortable="custom"
              ></el-table-column>
              <el-table-column
                label="题名"
                align="center"
                prop="mainTitle"
                :show-overflow-tooltip="true"
                sortable="custom"
                min-width="200"
              ></el-table-column>
              <el-table-column
                label="文号"
                align="center"
                prop="documentNo"
                :show-overflow-tooltip="true"
                sortable="custom"
              ></el-table-column>
              <el-table-column
                label="责任者"
                align="center"
                prop="responsibleBy"
                sortable="custom"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column label=" 文件形成时间" align="center" prop="createDate" sortable="custom">
                <template slot-scope="scope">
                  <span>
                    {{
                    new Date(scope.row.createDate).format("yyyyMMdd")
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column
                label="页数"
                align="center"
                prop="quantity"
                width="100"
                sortable="custom"
              ></el-table-column>
              <el-table-column
                label="原文"
                align="center"
                prop="yuanWenShuLiang"
                width="100"
                sortable="custom"
              ></el-table-column>
              <el-table-column label="操作" align="center" width="250" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="handleRead(scope.row)"
                    :disabled="
                      $is_disabled(['special-content-readFile']) ? false : true
                    "
                    class="fixedWidth"
                    title="查看原文"
                  >
                    <span>原({{ scope.row.yuanWenShuLiang }})</span>
                  </el-button>
                  <el-button
                    size="mini"
                    type="warning"
                    @click="handleWrite(scope.row)"
                    title="修改专题"
                    :disabled="
                      $is_disabled(['special-content-edit']) ? false : true
                    "
                  >修改</el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    title="移除"
                    @click="handleDelete(scope.row)"
                    :disabled="
                      $is_disabled(['special-content-delete']) ? false : true
                    "
                  >移除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-pagination
            class="pull-right pagina"
            background
            layout="total,prev, pager, next,sizes"
            :total="total"
            @size-change="handleSizeChange"
            :page-sizes="[20, 50, 100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>
    <el-dialog title="修改专题" :visible.sync="dialogVisible" width="600px">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="专题名" prop="topiccode">
          <el-select v-model="Form.topiccode">
            <el-option
              v-for="special in specialList"
              :key="special.topiccode"
              :value="special.topiccode"
              :label="special.topicname"
              :disabled="special.topiccode == dataInfo.id ? true : false"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import thematicTree from "./components/ThematicTree";
import sorts from "@/mixins/sort";
import { downloadFile } from "@/common/js/util";

import {
  selecSpecialTopicCatalog,
  selecSpecialTopicUtab,
  updateSpecialTopicUtab,
  deleteSpecialTopicUtab,
  exportSpecialTopicUtabOriginal
} from "@/api/special";
export default {
  mixins: [sorts],
  name: "special",
  data() {
    return {
      dialogVisible: false,
      Form: {
        topiccode: ""
      },
      rules: {
        topiccode: [{ required: true, message: "请选择", trigger: "change" }]
      },
      tabFlag: "",
      flag: false,
      colcased: true,
      loading: false,
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
        mainTitle: "",
        archiveNo: "",
        uploadDate: "",
        documentNo: "",
        responsibleBy: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      dataInfo: {},
      tableData: [],
      topiccode: "", //专题编号
      topicUtabCode: "", //专题档案编号
      specialList: [] //专题目录列表
    };
  },
  methods: {
    slideDown() {
      //下拉
      this.flag = true;
      this.$refs.searchBox.classList.remove("searchBox");
    },
    slideUp() {
      //收起
      this.flag = false;
      this.$refs.searchBox.classList.add("searchBox");
    },
    exportCatalog() {
      let selection = this.$refs.tableBox.selection;
      this.loading = true;
      if (selection.length == 0) {
        this.$message.warning("请选择需要导出的档案");
        return;
      }
      import("@/vendor/Export2Excel").then(excel => {
        const tHeader = [
          "档号",
          "题名",
          "文号",
          "责任者",
          "文件形成时间",
          "页数",
          "原文"
        ];
        const filterVal = [
          "archiveNo",
          "mainTitle",
          "documentNo",
          "responsibleBy",
          "createDate",
          "quantity",
          "yuanWenShuLiang"
        ];
        const list = selection;
        const data = this.formatJson(filterVal, list);
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: this.dataInfo.topicname
        });
        this.$refs.tableBox.clearSelection();
        this.loading = false;
      });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v =>
        filterVal.map(j => {
          if (j == "createDate") {
            return new Date(v[j]).format("yyyyMMdd");
          }
          return v[j];
        })
      );
    },
    exportCatalogOriginal() {
      let selection = this.$refs.tableBox.selection;

      if (selection.length == 0) {
        this.$message.warning("请选择需要导出的档案");
        return;
      }
      this.loading = true;
      let params = {
        topiccode: this.dataInfo.id,
        recordCodes: []
      };
      selection.forEach(item => {
        params.recordCodes.push(item.recordCode);
      });
      params.recordCodes = params.recordCodes.join();
      exportSpecialTopicUtabOriginal(params).then(res => {
        this.loading = false;
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("导出失败");
        } else {
          let fileName = this.dataInfo.topicname + ".zip";
          downloadFile(fileName, res.data);
        }
      });
    },
    sortsFn({ column, prop, order }) {
      this.handleSort({ column, prop, order }, this.submitForm);
    },
    appendData() {
      this.$router.push({
        path: "/specialIntelligence",
        query: {
          addZt: true
        }
      });
    },
    handleWrite(row) {
      //修改
      this.topicUtabCode = row.topicUtabCode;
      this.Form.topiccode = this.dataInfo.id;
      this.dialogVisible = true;
      //获取专题目录列表
      let params = {
        limit: 1000,
        star: 1
      };
      selecSpecialTopicCatalog(params)
        .then(res => {
          if (res.success) {
            let list = res.data.list || [];
            this.specialList = this.getAllZtList(list, []);
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {});
    },
    getAllZtList(data = [], res = []) {
      data.forEach(item => {
        if (item.children && item.children.length > 0) {
          this.getAllZtList(item.children, res);
        }
        res.push(item);
      });
      return res;
    },
    handleDelete(row) {
      //删除
      this.topicUtabCode = row.topicUtabCode;
      this.$confirm("是否移除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            topicutabcode: this.topicUtabCode
          };
          deleteSpecialTopicUtab(params)
            .then(res => {
              if (res.success) {
                this.$message.success("移除成功");
                this.sorts = {};
                let params = {
                  limit: 50,
                  star: 1
                };
                this.getData(params);
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    editForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            topicutabcode: this.topicUtabCode,
            topiccode: this.Form.topiccode
          };
          updateSpecialTopicUtab(params)
            .then(res => {
              this.dialogVisible = false;
              if (res.success) {
                this.$message.success("修改成功");
                this.sorts = {};
                let params = {
                  limit: 50,
                  star: 1
                };
                this.getData(params);
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        } else {
          return false;
        }
      });
    },
    getTableList(data) {
      this.tabFlag = "全部";
      this.sorts = {};
      this.dataInfo = data;
    },
    getData(params) {
      //查询
      params.mainTitle = this.searchForm.mainTitle;
      params.archiveNo = this.searchForm.archiveNo;
      params.documentNo = this.searchForm.documentNo;
      params.responsibleBy = this.searchForm.responsibleBy;
      params.topiccode = this.dataInfo.id;
      if (this.searchForm.uploadDate && this.searchForm.uploadDate.length > 0) {
        params.starTime = this.searchForm.uploadDate[0];
        params.endTime = this.searchForm.uploadDate[1];
      }
      params.sorts = this.sorts;
      this.loading = true;
      selecSpecialTopicUtab(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.tableData = res.data.list || [];
            this.total = res.data.total || 0;
            this.setSortTable();
          } else {
            this.tableData = [];
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
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.getData(params);
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.getData(params);
    },
    submitForm() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.getData(params);
    },
    handleRead(row) {
      //查看原文
      this.$router.push({
        path: "/searchContent",
        query: {
          recordCode: row.recordCode,
          tableCode: row.tableCode,
          mainTitle: row.mainTitle,
          isSearch: true
        }
      });
    },

    resetForm(formname) {
      this.searchForm = {
        title: "",
        createDate: [],
        remark: "",
        documentNo: "",
        responsibleBy: ""
      };
      this.sorts = {};
      let params = {
        limit: 50,
        star: 1
      };
      this.getData(params);
    }
  },
  created() {
    // this.queryCode = this.$route.params.code;
  },
  mounted() {
    // this.initData();
  },
  components: {
    thematicTree
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  watch: {
    "dataInfo.id": {
      handler(newval, oldval) {
        if (newval && newval != oldval) {
          let params = {
            limit: 50,
            star: 1
          };
          this.getData(params);
        }
      },
      deep: true
    },
    $route: {
      handler(newval, oldval) {
        if (newval.name == "themmtic" && this.dataInfo.id) {
          this.submitForm();
        }
      },
      deep: true
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
  }
  .content-left {
    min-height: 500px;
  }

  .content-right {
    .tabList {
      .el-tabs__item {
        font-size: 15px;
      }
      .title {
        p {
          line-height: 36px;
          color: #666;
          margin: 0;
          em {
            font-style: normal;
            color: #ff0036;
            margin: 0 3px;
          }
        }
      }
    }
  }
}
</style>
