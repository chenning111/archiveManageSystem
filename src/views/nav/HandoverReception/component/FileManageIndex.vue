<template>
  <div>
    <div class="content-right-title">
      <span>操作方式</span>
    </div>
    <div class="content-right-form">
      <!-- <el-button size="medium" icon="el-icon-download" @click="importFunc">导入</el-button> -->
      <el-button size="medium" icon="el-icon-upload2" @click="exportFunc">导出</el-button>
      <el-button size="medium" @click="verificateFunc">著录校验</el-button>
      <el-button size="medium" @click="handupFunc">原文挂接</el-button>
    </div>
    <div v-show="showValidate">
      <div class="tableTitle flex-spaceBetween">
        <div v-if="loading">校验中。。。</div>
        <div v-if="!loading">
          共校验{{total}}条，问题文件{{errorTotal}}条
          <label for>问题：</label>
          <el-select size="small" v-model="value" @change="filterData" clearable>
            <el-option label="无原文" value="无原文"></el-option>
            <el-option label="必填字段不完整" value="必填字段不完整"></el-option>
            <el-option label="档号重复" value="档号重复"></el-option>
            <el-option label="原文数据异常" value="原文数据异常"></el-option>
            <el-option label="原文数量错误" value="原文数量错误"></el-option>
          </el-select>
        </div>
        <div v-if="!loading">
          <el-button size="small" @click="resetData">重置</el-button>
          <el-button
            size="small"
            @click="handOriginalNumFunc"
            v-show="originalNumberErrorSiZe"
          >原文数量校准</el-button>
        </div>
      </div>
      <!-- 导入的数据表格 -->
      <div
        style="padding-bottom:100px;margin:0 15px"
        v-show="showValidate"
        v-loading="loading"
        ref="dataTable"
        element-loading-text="正在校验中"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.7)"
      >
        <el-table :data="gridData" border header-row-class-name="thClassName">
          <el-table-column label="序号" align="center" width="70">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="档号" align="left" prop="archiveNo"></el-table-column>
          <el-table-column label="问题" align="center">
            <template slot-scope="scope">
              <div style="color:#ff0036" v-for="res in scope.row.reason" :key="res">{{res}}</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" size="small" @click="readFile(scope.row,scope.$index)">修订</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total,prev, pager, next,sizes"
          :total="errorTotal"
          @size-change="handleSizeChange"
          :page-sizes="[20,50,100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </div>
    <!-- 导入文件 -->
    <el-dialog :visible.sync="dialogImport" title="导入文件" width="700px">
      <el-form :model="Form" ref="ruleForm" label-width="120px">
        <el-form-item label="上传文件：" required>
          <el-upload
            ref="upload"
            :action="`${baseUrl}/`"
            :auto-upload="false"
            :with-credentials="true"
            :data="Form"
            :on-change="uploadChange"
            :on-remove="handleRemove"
            :on-success="handleSuccess"
            :on-error="handleError"
            :limit="1"
            accept=".xls, .xlsx"
            :file-list="fileList"
          >
            <el-button size="small" type="primary">选择文件</el-button>
            <div slot="tip" class="el-upload__tip">只能上传xls、xlsx格式的文件，且只能上传一个</div>
          </el-upload>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogImport = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </span>
    </el-dialog>
    <!-- 导出文件 -->
    <el-dialog :visible.sync="dialogExport" title="导出文件" width="500px">
      <el-form
        v-show="!showLoading"
        :model="exportForm"
        ref="exportForm"
        label-width="120px"
        :rules="exportRules"
      >
        <el-form-item label="文件名称：" prop="title">
          <el-input v-model="exportForm.title"></el-input>
        </el-form-item>
        <el-form-item label="导出文件格式：" required>
          <el-select v-model="exportForm.excelType">
            <el-option label="xlsx" value="xlsx" key="xlsx"></el-option>
            <el-option label="xls" value="xls" key="xls"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="导出内容：" prop="name" required>
          <el-input v-model="exportForm.name" disabled></el-input>
        </el-form-item>
      </el-form>
      <div v-show="showLoading">
        <p style="margin:0 120px" class="textCenter">本次导出{{exportNumber}}条数据，请稍等</p>
        <div class="textCenter" style="margin-top:15px">
          <img :src="loadingGif" alt="加载中" />
        </div>
      </div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogExport = false">取 消</el-button>
        <el-button type="primary" @click="submitExportForm('exportForm')" :disabled="showLoading">导出</el-button>
      </span>
    </el-dialog>
    <!-- 原文挂接 -->
    <el-dialog :visible.sync="dialogHangUp" title="原文挂接" width="700px" @close="closeHangup">
      <el-form :model="hangupForm" ref="hangupForm" label-width="120px">
        <el-form-item label="上传文件：" required>
          <el-button size="small" type="primary" @click="clickFile">选择文件夹</el-button>
          <div class="el-form-item__error" v-if="errorMessage">{{errorMessage}}</div>
          <input
            ref="file"
            id="fileUploaderClass"
            type="file"
            name="file"
            style="display:none"
            webkitdirectory
            @change.stop="changesData"
          />
        </el-form-item>
      </el-form>
      <p style="margin:0 120px">已选择{{fileLength}}个文件</p>
      <div class="textCenter" style="margin-top:15px" v-show="showLoading">
        <img :src="loadingGif" alt="加载中" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeHangup">取 消</el-button>
        <el-button type="primary" @click="submitHangupForm" :disabled="showLoading">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  exportTable,
  verification,
  originalSizeCalibrate,
  exportTableDataNumbers
} from "@/api/file";
import { downloadFile } from "@/common/js/util";
import { upLoadRequest } from "@/api/api";
export default {
  name: "fileManageIndex",
  props: {
    cNodeCode: {
      type: String,
      default: ""
    },
    tableCode: {
      type: String,
      default: ""
    },
    selectedNode: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      loadingGif: require("../../../../assets/img/loading.gif"),
      isShowChromeTip: true,
      value: "",
      loading: false,
      gridData: [],
      totalData: [], //全部的校验表格 因数据量较大 前端分页
      pageSize: 20,
      currentPage: 1,
      total: 0,
      errorTotal: 0,
      baseUrl: this.baseURL,
      dialogImport: false,
      fileList: [],
      Form: {},
      exportForm: {
        title: "",
        excelType: "xlsx",
        name: ""
      },
      dialogExport: false,
      exportRules: {
        title: [
          { required: true, message: "请输入导出文件标题", trigger: "blur" }
        ]
      },
      exportNumber: 0,
      dialogHangUp: false,
      hangupForm: {
        fileList: []
      },
      errorMessage: "",
      fileLength: 0,
      originalNumberErrorSiZe: 0, //原文数量异常数量 有显示校准按钮
      showLoading: false, //loading显示
      showValidate: false //是否显示校验结果
    };
  },
  methods: {
    clickFile() {
      this.$refs.file.click();
    },
    changesData() {
      let arr = Array.from(this.$refs.file.files); //获取所有文件集合
      let fileList = [];
      this.fileLength = arr.length;
      let foldNameArr = [];
      if (arr.length > 0) {
        //如果有文件
        if (arr[0].webkitRelativePath.split("/").length != 3) {
          //可能是直接选择文件
          //判断层级关系
          // this.errorMessage = "请选择正确的文件夹层级关系";
          // this.hangupForm.fileList = [];
          // this.fileLength = 0;
          arr.forEach(file => {
            //档号命名文件上传
            let name = file.name.substr(0, file.name.lastIndexOf(".")); //获取name
            foldNameArr.push(name);
            file.foldName = name;
          });
          foldNameArr = Array.from(new Set(foldNameArr));
          foldNameArr.forEach(name => {
            let param = new FormData();
            param.append("tableCode", this.tableCode);
            param.append("archiveNo", name);
            let a = arr.filter(val => val.foldName == name);
            a.forEach(file => {
              param.append("files", file);
            });
            fileList.push(param);
          });
          // return;
        } else {
          this.errorMessage = "";
          arr.forEach(file => {
            let r = file.webkitRelativePath.split("/");
            foldNameArr.push(r[1]);
            file.foldName = r[1];
          });
          foldNameArr = Array.from(new Set(foldNameArr));
          foldNameArr.forEach(name => {
            let param = new FormData();
            param.append("tableCode", this.tableCode);
            param.append("archiveNo", name);
            let a = arr.filter(val => val.foldName == name);
            a.forEach(file => {
              param.append("files", file);
            });
            fileList.push(param);
          });
        }
      } else {
        this.fileLength = 0;
        this.hangupForm.fileList = [];
      }
      this.hangupForm.fileList = fileList;
    },
    closeHangup() {
      this.errorMessage = "";
      this.hangupForm.fileList = [];
      this.dialogHangUp = false;
      this.fileLength = 0;
    },
    importFunc() {
      if (!this.cNodeCode) {
        this.$message.warning("请选择需要导入的实体表");
        return;
      }
      this.dialogImport = true;
    },
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    uploadChange(file, fileList) {
      var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
      const extension = testmsg === "xls";
      const extension2 = testmsg === "xlsx";
      if (!extension && !extension2) {
        this.$message.warning("上传文件只能是 xls、xlsx格式!");
        this.fileList = [];
        return false;
      }
      this.fileList = fileList;
    },
    handleSuccess(res, file, fileList) {
      if (res.success) {
        this.$message.success("上传成功");
        this.importFunc = false;
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
      this.$refs.upload.submit();
    },
    exportFunc() {
      if (!this.cNodeCode) {
        this.$message.warning("请选择需要导出的实体表");
        return;
      }
      this.dialogExport = true;
      this.showLoading = false;
      this.exportForm.title = this.selectedNode.data.text;
      this.exportForm.excelType = "xlsx";
      this.exportForm.name = this.selectedNode.data.text;
    },

    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      this.filterData();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.filterData();
    },
    searchFunc() {
      this.value = "";
      this.errorTotal = this.totalData.length;
      this.gridData = this.totalData.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      );
    },
    filterData() {
      let list = [];
      list = this.totalData.filter(item => {
        let flag;

        if (item.reason.length) {
          item.reason.forEach(val => {
            if (val.indexOf(this.value) >= 0) {
              flag = true;
            }
          });
        }

        return flag;
      });
      this.errorTotal = list.length;
      this.gridData = list.slice(
        this.pageSize * (this.currentPage - 1),
        this.pageSize * this.currentPage
      );
    },
    resetData() {
      this.value = "";
      this.currentPage = 1;
      this.pageSize = 20;
      this.searchFunc();
    },
    //导出文件
    submitExportForm(formName) {
      this.exportNumber = 0;
      this.$refs[formName].validate(valid => {
        if (valid) {
          exportTableDataNumbers({ tableCode: this.tableCode }).then(res => {
            //获取导出数量
            if (res.success) {
              this.showLoading = true;
              this.exportNumber = res.data;
              exportTable({ tableCode: this.tableCode }).then(res => {
                this.dialogExport = false;
                if (
                  res.data.type == "application/json" ||
                  res.data.type == "application/json;charset=UTF-8"
                ) {
                  this.$message.error("导出失败");
                } else {
                  let filename =
                    this.exportForm.title + "." + this.exportForm.excelType;
                  downloadFile(filename, res.data);
                }
              });
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    handupFunc() {
      if (!this.cNodeCode) {
        this.$message.warning("请选择需要挂接的实体表");
        return;
      }
      this.dialogHangUp = true;
      this.showLoading = false;
      this.$nextTick(() => {
        document.getElementById("fileUploaderClass").value = "";
      });
    },
    handOriginalNumFunc() {
      if (!this.cNodeCode) {
        this.$message.warning("请选择需要更新的实体表");
        return;
      }
      this.$confirm(
        "原文数量更新可能较慢，更新完成后进行提示，是否继续？",
        "提示",
        {
          type: "warning",
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        }
      )
        .then(() => {
          originalSizeCalibrate({ tableCode: this.tableCode }).then(res => {
            if (res.success) {
              this.$alert("原文数量已更新", "提示", {
                type: "success"
              })
                .then(() => {})
                .catch(() => {});
            } else {
              this.$alert(res.msg, "提示", { type: "error" })
                .then(() => {})
                .catch(() => {});
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    submitHangupForm() {
      if (this.hangupForm.fileList.length > 0) {
        let promiseArr = [];
        this.showLoading = true;

        this.hangupForm.fileList.forEach(item => {
          let p = upLoadRequest("/file/originalHook", item);
          promiseArr.push(p);
        });
        Promise.all(promiseArr)
          .then(result => {
            this.showLoading = false;
            this.dialogHangUp = false;
            let successTotal = 0;
            let errorTotal = 0;
            result.forEach(item => {
              if (item.data.success) {
                let resArr = item.data.data;
                if (Array.isArray(resArr)) {
                  resArr.forEach(n => {
                    if (n.indexOf("上传成功") > 0) {
                      successTotal++;
                    } else {
                      errorTotal++;
                    }
                  });
                } else {
                  errorTotal++;
                }
              } else {
                errorTotal++;
              }
            });
            if (successTotal == 0) {
              this.$alert(
                "原文挂接失败，请检查文件名或者文件夹是否以档号命名",
                "提示",
                {
                  type: "error"
                }
              )
                .then(() => {})
                .catch(() => {});
            } else {
              this.$alert(
                `成功挂接${successTotal}条原文，失败<em style="color:#ff0036;font-style: normal;margin:0 3px">${errorTotal}</em>条<br /> 点击确定查看详情`,
                "提示",
                {
                  type: "success",
                  dangerouslyUseHTMLString: true
                }
              )
                .then(() => {
                  this.$router.push({
                    name: "systemLog",
                    query: {
                      flag: 3
                    }
                  });
                })
                .catch(err => {});
            }

            //  this.$alert(
            //   `挂接结束，点击确定查看详情`,
            //   "提示",
            //   {
            //     type: "success",
            //   }
            // )
            //   .then(() => {
            //     this.$router.push({
            //       name: "systemLog",
            //       query: {
            //         flag: 3
            //       }
            //     });
            //   })
            //   .catch(err => {});
          })
          .catch(error => {
            this.$message.error("挂接失败");
          });
      }
    },
    verificateFunc() {
      if (!this.cNodeCode) {
        this.$message.warning("请选择需要校验的实体表");
        return;
      }
      this.loading = true;
      this.showValidate = true;
      this.currentPage = 1;
      this.pageSize = 20;
      verification({ tableCode: this.tableCode }).then(res => {
        this.loading = false;
        if (res.success) {
          this.total = res.data.totalSize;
          this.errorTotal = res.data.errorSize;
          this.totalData = res.data.data;
          this.originalNumberErrorSiZe = res.data.originalNumberErrorSiZe;
          this.gridData = this.totalData.slice(0, this.pageSize);
        } else {
          this.$message.error(res.msg);
          this.total = 0;
          this.errorTotal = 0;
          this.totalData = [];
          this.gridData = [];
        }
      });
    },
    readFile(row) {
      this.$router.push({
        name: "archivesDescription",
        params: {
          code: this.selectedNode.data.id,
          rowData: row,
          verificate: true
        }
      });
    }
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  watch: {
    tableCode(newval, oldval) {
      if (newval && newval != oldval) {
        this.showValidate = false;
        this.gridData = [];
      }
    },
    value(newval, oldval) {
      if (newval != oldval && newval) {
        this.currentPage = 1;
        this.pageSize = 20;
        this.filterData();
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name == "archivesDescription") {
      this.$store.dispatch("permission/del_cachedViews", to.name);
    }
    next();
  }
};
</script>
<style lang="scss" scoped>
.content-right-title {
  height: 60px;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  display: flex;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  align-items: center;
  justify-content: space-between;
  span {
    font-weight: 700;
    color: #666;
    font-size: 15px;
  }
}
.content-right-form {
  padding: 15px;
}
</style>
