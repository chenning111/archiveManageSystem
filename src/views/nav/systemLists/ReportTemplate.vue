<template>
  <!-- 报表模版 -->
  <section>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="7" class="content-left" :class="colcased ?'' :'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>门类树</span>
            <i
              :class="colcased?'el-icon-d-arrow-left': 'el-icon-d-arrow-right'"
              @click="colcased = !colcased"
            ></i>
          </div>
          <div class="card">
            <span class="cardTitle">门类树</span>
            <el-tree
              :data="tableViewTree"
              :props="defaultProps"
              :default-expanded-keys="['D_DATA']"
              @node-click="handleNodeClick"
              node-key="id"
              class="tree"
              :highlight-current="true"
              default-expand-all
            >
              <span class="custom-tree-node" slot-scope="{ node, data }" :title="data.text">
                <!-- //中间门类和根节点 -->
                <span v-if="data.li_attr.TYPE === 'L'||data.li_attr.TYPE === 'I'">
                  <i class="iconfont icon-danganku treeIcon"></i>
                  {{data.text }}
                </span>
                <!-- 底层门类 -->
                <span v-else-if="data.li_attr.TYPE === 'C'">
                  <i class="iconfont icon-dangan1 treeIcon"></i>
                  {{data.text }}
                </span>
                <span v-else>
                  <i class="iconfont icon-danganheji catalogIcon"></i>
                  {{data.text }}
                </span>
              </span>
            </el-tree>
          </div>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 17 :24"
        class="content-right"
        :class="!colcased ?'paddingleft-30 ': ''"
      >
        <i
          :icon="colcased?'el-icon-d-arrow-left': 'el-icon-d-arrow-right'"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >门类树</i>
        <div class="flex-spaceBetween title">
          <span>报表模版</span>
          <div>
            <el-button
              size="small"
              type="primary"
              plain
              @click="addTemplateDialog = true"
              :disabled="tableCode?false:true"
            >新增</el-button>
            <el-button size="small" :disabled="tableCode?false:true" @click="funcTemplate">添加现有模版</el-button>
          </div>
        </div>
        <div class="clearboth" style="margin:0 20px;">
          <div>
            <el-table
              :data="gridData"
              border
              header-row-class-name="thClassName"
              v-loading="loading"
              ref="dataTable"
            >
              <el-table-column label="序号" align="center" prop="serial" width="80px">
                <template slot-scope="scope">{{scope.$index+1+index}}</template>
              </el-table-column>
              <el-table-column label="报表名" prop="name"></el-table-column>
              <el-table-column label="模板名" prop="templateName"></el-table-column>
              <el-table-column label="报表类型" prop="templateType">
                <template slot-scope="scope">
                  <span v-if="scope.row.templateType == '1'">格式报表</span>
                  <span v-else-if="scope.row.templateType == '2'">统计报表</span>
                  <span v-else-if="scope.row.templateType == '3'">多表报表</span>
                  <span v-else>封面报表</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" align="center" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button size="mini" type="primary" @click="downloadTemplate(scope.row)">下载</el-button>
                  <el-button size="mini" type="danger" @click="deleteTemplate(scope.row)">删除</el-button>
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
            :page-sizes="[20,50,100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>
    <!-- 新增或修改-->
    <el-dialog :visible.sync="addTemplateDialog" title="新增模版" width="700px" @close="closeDialog">
      <el-form :model="Form" ref="ruleForm" label-width="120px">
        <el-form-item label="报表名称：">
          <el-input v-model="Form.name"></el-input>
        </el-form-item>
        <el-form-item label="模板名称：" prop="name">
          <el-input v-model="Form.templateName"></el-input>
        </el-form-item>
        <el-form-item label="模板类型：">
          <el-select clearable v-model="Form.templateType">
            <el-option
              v-for="item in reportTypeArray"
              :label="item.label"
              :value="item.value"
              :key="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="模板文件：">
          <el-upload
            ref="upload"
            :auto-upload="false"
            :with-credentials="true"
            :data="Form"
            :action="`${baseUrl}/report/addReport/`"
            :on-change="uploadChange"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :limit="1"
            accept=".xlsx"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传xlsx格式的文件，且只能上传一个</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeDialog">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">上传</el-button>
      </span>
    </el-dialog>
    <!-- //添加现有模板 -->
    <el-dialog title="添加现有模板" :visible.sync="setTemplate" width="680px" custom-class="setdialogBox">
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入字段中文名名"
        v-model="checkedTemplateListKey"
        @left-check-change="((a,b)=>{changeLeftTransfer(a,b,checkedTemplateListKey)})"
        @right-check-change="((a,b)=>{changeRightTransfer(a,b,checkedTemplateListKey)})"
        :data="templateList"
        :props="{
          key: 'reportcode',
          label: 'templateName'
        }"
        :titles="['待添加', '已选']"
      >
        <span slot-scope="{ option }" :title="option.templateName">{{ option.templateName }}</span>
      </el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setTemplate = false">取 消</el-button>
        <el-button type="primary" @click="saveTemplate">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import { downloadFile } from "@/common/js/util";
import {
  retrieveReport,
  deleteReport,
  addExistsReport,
  downExcel
} from "@/api/report";
export default {
  data() {
    return {
      filterMethod(query, item) {
        return item.templateName.indexOf(query) > -1;
      },
      templateList: [], //全部模版
      checkedTemplateListKey: [], //已选的模板key
      baseUrl: this.baseURL,
      colcased: true,
      loading: false,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      gridData: [],
      tableViewTree: [],
      defaultProps: {
        children: "children",
        label: "text"
      },
      fileList: [],
      Form: {
        name: "",
        templateName: "",
        templateType: "",
        tableCode: ""
      },
      addTemplateDialog: false, //新增
      setTemplate: false, //添加现有模版
      tableCode: "",
      reportTypeArray: [
        {
          label: "格式报表",
          value: "1"
        },
        {
          label: "统计报表",
          value: "2"
        },
        {
          label: "多表报表",
          value: "3"
        },
        {
          label: "封面报表",
          value: "4"
        }
      ]
    };
  },
  methods: {
    changeLeftTransfer(a, b, data) {
      data.push(...b);
    },
    changeRightTransfer(a, b, data) {
      b.forEach(item => {
        let index = data.findIndex(val => item == val);
        data.splice(index, 1);
      });
    },
    funcTemplate() {
      //获取全部模版
      let params = {
        pageSize: 9999,
        pageNumber: 1
      };
      retrieveReport(params)
        .then(res => {
          this.setTemplate = true;
          if (res.success) {
            this.templateList = res.data.list || [];
            this.templateList.forEach(item => {
              //把已设置的模版变成不可选的
              let checked = this.gridData.find(
                newitem => newitem.reportcode == item.reportcode
              );
              if (checked) {
                item.disabled = true;
              }
            });
          } else {
            this.templateList = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    closeDialog() {
      this.addTemplateDialog = false;
      this.Form.name = "";
      this.Form.templateName = "";
      this.Form.templateType = "";
      this.fileList = [];
    },
    saveTemplate() {
      //保存模版
      let arr = [];
      this.checkedTemplateListKey.forEach(item => {
        //过滤初始值
        let r = this.gridData.find(val => val.reportcode == item);
        if (!r) {
          arr.push(item);
        }
      });
      if (arr.length == 0) {
        this.$message.warning("请选择模版文件");
        return;
      }
      addExistsReport({
        tableCode: this.tableCode,
        reportCodes: arr.join()
      }).then(res => {
        this.setTemplate = false;
        if (res.success) {
          let params = {
            pageSize: 20,
            pageNumber: 1
          };
          this.searchFunc(params);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    uploadChange(file, fileList) {
      var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
      const extension = testmsg === "xlsx";
      if (!extension) {
        this.$message.warning("保证生成报表质量，上传文件只能是xlsx格式!");
        this.fileList = [];
        return false;
      }
      this.fileList = fileList;
      if (!this.Form.name) {
        this.Form.name = file.name.substr(
          0,
          file.name.length - (testmsg.length + 1)
        );
      }
      if (!this.Form.templateName) {
        this.Form.templateName = file.name;
      }
      if (!this.Form.templateType) {
        this.Form.templateType = "1";
      }
    },
    handleSuccess(res, file, fileList) {
      if (res.success) {
        this.$message.success("上传成功");
        this.addTemplateDialog = false;
        let params = {
          pageSize: 20,
          pageNumber: 1
        };
        this.searchFunc(params);
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
        this.$message.warning("请选择模版文件");

        return;
      }

      this.Form.tableCode = this.tableCode;
      this.$refs.upload.submit();
    },
    handleNodeClick(data, node, e) {
      if (data.li_attr.TYPE == "E") {
        this.tableCode = data.li_attr.TABLECODE;
      }
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

    searchFunc(params) {
      //查询
      this.loading = true;
      params.tableCode = this.tableCode;
      this.checkedTemplateListKey = [];
      retrieveReport(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
            this.gridData.forEach(item => {
              this.checkedTemplateListKey.push(item.reportcode);
            });
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
    deleteTemplate(row) {
      this.$confirm("是否删除此模版", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteReport({
            reportCode: row.reportcode
          }).then(data => {
            if (data.success) {
              this.$message.success("删除成功");

              let params = {
                pageSize: this.pageSize,
                pageNumber: this.currentPage
              };
              this.searchFunc(params);
            } else {
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    },
    downloadTemplate(row) {
      //下载文件
      const fileName = row.templateName;
      downExcel({ reportCode: row.reportcode }).then(res => {
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          downloadFile(fileName, res.data);
        }
      });
    }
  },
  mounted() {
    this.$store.dispatch("tree/tableViewTree").then(() => {
      this.tableViewTree = [this.$store.getters.tableViewTree];
    });
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  watch: {
    tableCode(newval, oldval) {
      if (newval && newval !== oldval) {
        let params = {
          pageSize: 20,
          pageNumber: 1
        };
        this.searchFunc(params);
      }
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

  .content-right {
    min-height: 500px;
    border-left: 1px solid #eee;
    position: relative;
    padding: 0;
    .title {
      padding: 0 20px;
      margin-bottom: 20px;
      height: 60px;
      border-bottom: 1px solid #eee;
      span {
        font-size: 15px;
        font-weight: 700;
        color: #666;
      }
    }
  }

  .setdialogBox {
    .el-transfer {
      margin: 0 auto;
      display: flex;
      justify-content: center;
      align-items: center;
      /deep/ .el-transfer-panel {
        width: 250px;
      }
      /deep/ .el-transfer-panel__body {
        height: 346px;
      }
      /deep/ .el-transfer-panel__list.is-filterable {
        height: 300px;
      }
    }
  }
}
</style>
