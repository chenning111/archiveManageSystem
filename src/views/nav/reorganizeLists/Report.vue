<template>
  <!-- 报表 -->
  <section>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>门类树</span>
            <i
              :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
              @click="colcased = !colcased"
            ></i>
          </div>
          <div class="card">
            <span class="cardTitle">门类树</span>
            <catalog-tree @tableCard="getTableCard"></catalog-tree>
          </div>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 17 : 24"
        class="content-right"
        :class="!colcased ? 'paddingleft-30 ' : ''"
      >
        <i
          :icon="colcased ? 'el-icon-d-arrow-left' : ''"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >门类树</i>

        <div class="btngroup"></div>
        <div
          style="padding:15px;border:1px solid #eee;position:relative;"
          class="clearboth searchBox"
          ref="searchBox"
        >
          <el-col :span="18" style="min-height:200px">
            <el-form ref="form" :model="form" label-width="90px" inline size="small">
              <el-col :span="24">
                <search-form
                  :fieldArray="checkedCoumnList"
                  :form="form"
                  :defaultProps="{ fileldName: 'FIELDNAME', type: 'type' }"
                  :classnodeId="classnodeId"
                  ref="searchForm"
                ></search-form>
              </el-col>
            </el-form>
          </el-col>
          <el-col :span="6" class="buttonGroup">
            <el-button
              type="primary"
              size="small"
              class="btn"
              @click="submitForm"
              :disabled="tableCode ? false : true"
            >生成报表</el-button>

            <el-button
              type="primary"
              size="small"
              plain
              @click="resetForm"
              icon="el-icon-refresh-left"
              class="btn"
              :disabled="tableCode ? false : true"
            >重置</el-button>
            <el-button
              type="primary"
              size="small"
              plain
              class="btn"
              @click="setdialogVisible = true"
              :disabled="tableCode ? false : true"
            >设置查询项</el-button>
          </el-col>
        </div>
        <div class="slidebtn">
          <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
          <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
        </div>
        <div class="clearboth" v-show="tableCode">
          <div>
            <el-table
              :data="gridData"
              border
              header-row-class-name="thClassName"
              v-loading="loading"
              ref="dataTable"
            >
              <el-table-column type="selection" width="55"></el-table-column>
              <el-table-column label="序号" align="center" prop="serial" width="80px">
                <template slot-scope="scope">
                  {{
                  scope.$index + 1 + index
                  }}
                </template>
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
              <el-table-column label="操作" align="center" width="150" fixed="right">
                <template slot-scope="scope">
                  <el-button type="primary" @click="setSort(scope.row)" size="small">排序</el-button>
                  <el-button type="primary" @click="handleHistory(scope.row)" size="small">历史</el-button>
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
    <!-- 设置查询项 -->
    <el-dialog
      title="设置查询项"
      :visible.sync="setdialogVisible"
      width="600px"
      custom-class="setdialogBox"
    >
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入字段中文名名"
        v-model="checkedCoumnListKey"
        :data="tableCardList"
        @left-check-change="
          (a, b) => {
            changeLeftTransfer(a, b, checkedCoumnListKey);
          }
        "
        @right-check-change="
          (a, b) => {
            changeRightTransfer(a, b, checkedCoumnListKey);
          }
        "
        :props="{
          key: 'FIELDNAME',
          label: 'PROPERTIESINFO1'
        }"
        :titles="['待添加', '已选']"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveChecked">保存</el-button>
      </span>
    </el-dialog>
    <!-- 设置排序项 -->
    <el-dialog
      title="设置排序项"
      :visible.sync="setSortdialogVisible"
      width="600px"
      custom-class="setdialogBox"
    >
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入字段中文名名"
        v-model="sortCheckedKey"
        :data="tableCardList"
        @left-check-change="
          (a, b) => {
            changeLeftTransfer(a, b, sortCheckedKey);
          }
        "
        @right-check-change="
          (a, b) => {
            changeRightTransfer(a, b, sortCheckedKey);
          }
        "
        :props="{
          key: 'FIELDNAME',
          label: 'PROPERTIESINFO1'
        }"
        :titles="['待添加', '已选']"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setSortdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveSort">保存</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="基本信息"
      :visible.sync="priviewTableDialog"
      custom-class="formdialog"
      ref="dialog"
      width="1200px"
    >
      <div class="tableTitle" style="margin-bottom:0">
        <el-button size="small" type="primary" @click="downloadExcel">下载</el-button>
      </div>
      <div class="previewTable" v-loading="priviewTableloading" v-html="tableHtml"></div>
    </el-dialog>
    <!-- 历史信息报表 -->
    <el-dialog title="报表历史信息" :visible.sync="historyDialog" ref="dialog" width="900px">
      <el-table :data="historyData" border header-row-class-name="thClassName" v-loading="loading">
        <el-table-column label="查询条件" prop="condition">
          <template slot-scope="scope">
            <p
              v-for="(item, index) in scope.row.condition"
              :key="index"
            >{{ item.field }}：{{ item.des }}</p>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort">
          <template slot-scope="scope">
            <p v-for="(item, index) in scope.row.sort" :key="index">{{ item.field }}：{{ item.des }}</p>
          </template>
        </el-table-column>
        <el-table-column label="报表类型" prop="filetype">
          <template slot-scope="scope">
            <span v-if="scope.row.filetype == '1'">格式报表</span>
            <span v-else-if="scope.row.filetype == '2'">统计报表</span>
            <span v-else-if="scope.row.filetype == '3'">多表报表</span>
            <span v-else>封面报表</span>
          </template>
        </el-table-column>
        <el-table-column label="形成时间" prop="createddate">
          <template
            slot-scope="scope"
          >{{ new Date(scope.row.createddate).format("yyyy-MM-dd hh:mm:ss") }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template slot-scope="scope">
            <el-button type="primary" @click="downloadData(scope.row)" size="small">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="historyDialog = false">取 消</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import searchForm from "@/components/SearchForm";
import catalogTree from "@/components/catalogTree";
import {
  retrieveReport,
  downExcel,
  createRepServerLog,
  getReportHistory
} from "@/api/report";
import { getInputCard } from "@/api/tableView";
import { downloadFile } from "@/common/js/util";
import XLSX from "xlsx";
export default {
  name: "report",
  data() {
    return {
      historyData: [],
      historyDialog: false,
      priviewTableDialog: false,
      priviewTableloading: false,
      filterMethod(query, item) {
        return item.PROPERTIESINFO1.indexOf(query) > -1;
      },
      tableHtml: "", //预览报表
      flag: false,
      setdialogVisible: false, //设置查询项
      colcased: true,
      loading: false,
      tableCode: "",
      checkedCoumnList: [],
      classnodeId: "",
      fondsNo: "",
      form: {},
      checkedCoumnListKey: [
        "fillingYear",
        "departmentCode",
        "fondsNo",
        "archiveCatalogNo",
        "retention",
        "securityClass",
        "responsibleBy"
      ], //设置查询项的已选则的key
      sortCheckedKey: [], //排序项的key
      setSortdialogVisible: false, //设置排序项的变量
      gridData: [], //模版
      pageSize: 20,
      currentPage: 1,
      total: 0,
      tableCardList: [], //录入列
      dataInfo: {}, //已选报表
      arrayBuffer: null //文件流blob对象
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
    changeLeftTransfer(a, b, data) {
      data.push(...b);
    },
    downloadData(row) {
      let params = {
        reportCode: row.recid,
        type: 1
      };
      downExcel(params).then(res => {
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          let filename = this.gridData.find(
            item => item.reportcode == row.reportid
          ).templateName;
          downloadFile(filename, res.data);
        }
      });
    },
    changeRightTransfer(a, b, data) {
      b.forEach(item => {
        let index = data.findIndex(val => item == val);
        data.splice(index, 1);
      });
    },
    setSort(row) {
      this.sortCheckedKey = [];
      this.dataInfo = row;
      let json = JSON.parse(row.remark);
      if (json) {
        for (let i in json) {
          this.sortCheckedKey.push(i);
        }
      }

      this.setSortdialogVisible = true;
    },
    saveSort() {
      let json = {};
      this.sortCheckedKey.forEach(item => {
        json[item] = "asc";
      });
      this.dataInfo.remark = JSON.stringify(json);
      this.setSortdialogVisible = false;
    },
    handleHistory(row) {
      this.loading = true;
      getReportHistory({ reportId: row.reportcode }).then(res => {
        this.loading = false;
        if (res.success) {
          let data = res.data;

          data.forEach(val => {
            let json = JSON.parse(val.reportgroupid);
            if (json) {
              val.sort = json.sort || [];
              val.condition = json.condition || [];
            } else {
              val.sort = [];
              val.condition = [];
            }
          });
          this.historyData = data;
          this.historyDialog = true;
        } else {
          this.historyData = [];
        }
      });
    },
    getTableCard(data, tableCode, classnodeId) {
      this.tableCardList = data.filter(item => item.FIELDNAME != "null");
      this.tableCode = tableCode;
      this.classnodeId = classnodeId;
      this.form = {};
      this.checkedCoumnList = [];
      this.checkedCoumnListKey.forEach(val => {
        this.tableCardList.forEach(item => {
          if (item.FIELDNAME == val && item.FIELDNAME != "null") {
            this.checkedCoumnList.push(item);
          }
        });
      });
      this.checkedCoumnList.forEach(val => {
        this.$set(this.form, val.FIELDNAME + "-" + val.TYPE, "");
      });
    },
    saveChecked() {
      this.form = {};
      this.setdialogVisible = false;
      this.checkedCoumnList = [];
      this.checkedCoumnListKey.forEach(val => {
        this.tableCardList.forEach(item => {
          if (item.FIELDNAME == val && item.FIELDNAME != "null") {
            this.checkedCoumnList.push(item);
          }
        });
      });
      this.checkedCoumnList.forEach(val => {
        this.$set(this.form, val.FIELDNAME + "-" + val.TYPE, "");
      });
    },

    submitForm() {
      let selection = this.$refs.dataTable.selection;
      this.dataInfo = selection[0];
      if (selection.length == 0) {
        this.$message.warning("请选择一个模版生成报表");
        return false;
      }
      if (selection.length > 1) {
        this.$message.warning("只能选择一个模版生成报表");
        return false;
      }
      let params = {
        reportId: selection[0].reportcode
      };
      let obj = {};
      for (let i in this.form) {
        if (this.form[i]) {
          if (Array.isArray(this.form[i])) {
            obj[i] = this.form[i][0] + "@" + this.form[i][1]; //日期拼接
          } else {
            obj[i] = this.form[i];
          }
        }
      }
      let sort = {};
      let json = JSON.parse(selection[0].remark); //排序
      if (json) {
        for (let i in json) {
          this.sortCheckedKey.push(i);
          sort[i] = "asc";
        }
      }

      let sortStr = [];
      let conditionStr = [];
      let depnode = this.$refs.searchForm.$refs[
        "cascader1"
      ][0].getCheckedNodes(); //获取部门选择节点
      let archiveNonode = this.$refs.searchForm.$refs[
        "cascader3"
      ][0].getCheckedNodes(); //获取实体分类选择节点
      this.tableCardList.forEach(val => {
        let name = val.FIELDNAME + "-" + val.TYPE;
        for (let i in sort) {
          if (name.indexOf(i) > -1) {
            sortStr.push({
              field: val.PROPERTIESINFO1,
              des: sort[i] == "asc" ? "正序" : "倒序"
            });
          }
        }
        for (let i in obj) {
          if (name.indexOf(i) > -1) {
            if (val.FIELDNAME == "departmentCode") {
              conditionStr.push({
                field: val.PROPERTIESINFO1,
                des: depnode[0].data.text
              });
            } else if (val.FIELDNAME == "archiveCatalogNo") {
              conditionStr.push({
                field: val.PROPERTIESINFO1,
                des: archiveNonode[0].data.text
              });
            } else {
              conditionStr.push({ field: val.PROPERTIESINFO1, des: obj[i] });
            }
          }
        }
      });
      if (JSON.stringify(obj) != "{}") {
        params.conditions = JSON.stringify(obj);
      }

      if (json) {
        params.sorts = JSON.stringify(sort);
      }
      params.description = JSON.stringify({
        sort: sortStr,
        condition: conditionStr
      });
      let logType = this.getName(selection[0].templateType);
      createRepServerLog(params)
        .then(res => {
          return new Promise((resolve, reject) => {
            if (res.success) {
              if (res.data) {
                //数据量较小 直接展示
                resolve(res.data);
              } else {
                this.$alert(
                  "本次提交了一份" +
                    logType +
                    "，由于记录太多，生成较慢，稍后系统生成报表后会发消息通知您",
                  "提示",
                  {
                    type: "warning"
                  }
                )
                  .then(() => {})
                  .catch(err => {});
                reject();
              }
            } else {
              reject();
              this.$message.error(res.msg);
            }
          });
        })
        .then(id => {
          this.tableHtml = "";
          this.priviewTableDialog = true;
          this.priviewTableloading = true;
          this.arrayBuffer = null;
          let params = {
            reportCode: id,
            type: 1
          };
          const reader = new FileReader();
          downExcel(params).then(res => {
            if (
              res.data.type == "application/json" ||
              res.data.type == "application/json;charset=UTF-8"
            ) {
              this.$message.error("下载失败");
            } else {
              this.arrayBuffer = res.data;

              reader.onload = e => {
                //文件读取完成后触发
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "array" });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                this.tableHtml = XLSX.utils.sheet_to_html(worksheet);
                this.priviewTableloading = false;
              };
              reader.readAsArrayBuffer(res.data);
            }
          });
        })
        .catch(() => {});
    },
    downloadExcel() {
      if (this.arrayBuffer) {
        let filename = this.dataInfo.templateName;
        downloadFile(filename, this.arrayBuffer);
      }
    },
    getName(type) {
      let name = "";
      type = Number(type);
      switch (type) {
        case 1:
          name = "格式报表";
          break;
        case 2:
          name = "统计报表";
          break;
        case 3:
          name = "多表报表";
          break;
        case 4:
          name = "封面报表";
          break;
      }
      return name;
    },
    resetForm() {
      this.$refs.searchForm.resetForm();
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
    this.$store.dispatch("tree/tableViewTree").then(() => {
      this.tableViewTree = [this.$store.getters.tableViewTree];
    });
    this.$store.dispatch("tree/departmentTree").then(() => {
      this.departmentList = this.$store.getters.departmentTree;
    }); //获取部门树
    this.$store.dispatch("fondsCatalog/getFondsList").then(() => {
      this.fondsList = this.$store.state.fondsCatalog.fondsList;
    }); //获取全宗数组
  },

  watch: {
    tableCode(newval, oldval) {
      if (newval && newval !== oldval) {
        let params = {
          pageSize: 20,
          pageNumber: 1
        };
        this.searchFunc(params); //获取报表模版
        this.$refs.searchForm.resetForm();
      }
    }
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  components: {
    catalogTree,
    searchForm
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
    .btn {
      margin-bottom: 18px;
      text-align: center;
      margin-left: 0;
    }
  }
}
</style>
<style lang="scss"></style>
