<template>
  <!-- 档案汇编 -->
  <section>
    <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
      <section>
        <div class="content-left-title">
          <span>档案汇编</span>
          <i
            :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
            @click="colcased = !colcased"
          ></i>
        </div>
        <div class="card">
          <nav-tree :type="type" @tableView="tableView" @tableCard="getTableCard"></nav-tree>
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
        title="展开"
      >门类树</i>

      <div class="flex-spaceBetween btngroup">
        <div>
          <el-button
            @click="addData"
            size="medium"
            type="primary"
            :disabled="tableCode ? false : true"
          >新增</el-button>
          <el-button
            plain
            @click="validTrash"
            v-if="this.type == 0"
            size="medium"
            :disabled="tableCode ? false : true"
          >回收站</el-button>
          <el-button
            plain
            @click="getTableList(0)"
            v-if="this.type == 1"
            size="medium"
            :disabled="tableCode ? false : true"
          >返回列表</el-button>
        </div>
        <div>
          <el-button
            size="medium"
            :type="!showGroup ? 'primary' : ''"
            @click="showGroup = false"
          >简单查询</el-button>
          <el-button size="medium" :type="showGroup ? 'primary' : ''" @click="showGroup = true">分组查询</el-button>
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
            :model="form"
            label-width="90px"
            inline
            size="small"
            v-if="!showGroup"
          >
            <el-col :span="24">
              <search-form
                :checkedNode="checkedNode"
                :fieldArray="checkedCoumnList"
                :form="form"
                :defaultProps="{ fileldName: 'FIELDNAME', type: 'type' }"
                :classnodeId="classnodeId"
                ref="searchForm"
                :submitFunc="submitForm"
              ></search-form>
            </el-col>
          </el-form>

          <div class="groupBox" v-show="showGroup">
            <div v-for="(item, index) in groupList" :key="index" class="margin15 clearboth">
              <span class="pull-left">{{ item.chineseName }}</span>
              <div class="labelbox pull-left">
                <label
                  :class="isChecked(item, '') ? 'labelChecked' : ''"
                  @click="getTableViewbyGroup(item, '')"
                >不限</label>
                <label
                  v-for="(val, index) in item.groupList"
                  @click="getTableViewbyGroup(item, val)"
                  :key="index"
                  :class="isChecked(item, val) ? 'labelChecked' : ''"
                >{{ val }}</label>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="6" class="buttonGroup">
          <el-button
            type="primary"
            icon="el-icon-search"
            size="small"
            :loading="loading"
            @click="submitForm"
            v-show="!showGroup"
          >查询</el-button>
          <el-button
            type="primary"
            size="small"
            plain
            @click="resetForm('form')"
            icon="el-icon-refresh-left"
            :disabled="tableCode ? false : true"
          >重置</el-button>
          <el-button
            type="primary"
            size="small"
            plain
            @click="setdialogVisible = true"
            v-show="!showGroup"
            :disabled="tableCode ? false : true"
          >设置查询项</el-button>
          <el-button
            type="primary"
            size="small"
            plain
            @click="setGroupVisible = true"
            v-show="showGroup"
            :disabled="tableCode ? false : true"
          >设置分组项</el-button>
          <!-- <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="HighdialogVisible = true"
                v-show="archiveFlag!='待归档'"
                :disabled="tableCode ? false : true"
              >高级查询</el-button>
              <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="relationSearch"
                v-show="archiveFlag!='待归档'"
                :disabled="tableCode ? false : true"
          >关联查询</el-button>-->
        </el-col>
      </div>
      <div class="slidebtn">
        <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
        <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
      </div>

      <div
        class="clearboth"
        style="border:1px solid #f2f2f2;padding-bottom:100px;"
        v-show="tableCode"
      >
        <el-col :span="24" class="clearboth tabList" style="margin:20px 0;padding:0 20px;">
          <el-tabs v-model="archiveFlag">
            <el-tab-pane label="全部" name="全部" v-if="type == 0"></el-tab-pane>
            <el-tab-pane label="回收站" name="回收站" v-else></el-tab-pane>
          </el-tabs>

          <div class="title flex-spaceBetween">
            <p class="pull-left">
              共
              <em>{{ total }}条</em>记录
            </p>
          </div>
        </el-col>
        <div class="dataTable">
          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            v-loading="loading"
            ref="dataTable"
            tooltip-effect="dark"
            @sort-change="sortTable"
            v-if="showTable"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column prop="ROW_ID" label="序号" align="center" width="70"></el-table-column>
            <el-table-column
              :prop="coulmnItem.NAME"
              :label="coulmnItem.TITLE"
              :min-width="coulmnItem.WIDTH"
              align="center"
              v-for="(coulmnItem, index) in columnList"
              :key="index"
              :show-overflow-tooltip="true"
              sortable="custom"
            >
              <template slot-scope="scope">
                <span
                  class="text-link"
                  v-if="coulmnItem.NAME == 'MAINTITLE'"
                  @click="handleWrite(scope.row, true)"
                >{{ scope.row[coulmnItem.NAME] }}</span>
                <!-- //过滤归档年度 保留最后四位数 -->
                <span v-else-if="coulmnItem.NAME.toUpperCase() == 'FILLINGYEAR'">
                  {{
                  scope.row[coulmnItem.NAME.toUpperCase()] | filterFillingYear
                  }}
                </span>
                <span v-else>{{ scope.row[coulmnItem.NAME] }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="DELETEDATE"
              label="删除日期"
              align="center"
              width="110"
              v-if="type == 1"
            >
              <template slot-scope="scope">
                <span v-if="scope.row.DELETEDATE">
                  {{
                  new Date(scope.row.DELETEDATE).format("yyyy-MM-dd")
                  }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="245" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  title="查看原文"
                  class="fixedWidth"
                  @click="handleRead(scope.row.RECORDCODE, scope.row.MAINTITLE)"
                  v-if="type == 0&& scope.row.YUAN_WEN_SHU_LIANG !== 0"
                >原({{ scope.row.YUAN_WEN_SHU_LIANG }})</el-button>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleUpload(scope.row.RECORDCODE)"
                  v-if="type == 0 && scope.row.YUAN_WEN_SHU_LIANG == 0"
                  title="上传原文"
                  class="fixedWidth"
                >上传</el-button>
                <el-button
                  size="mini"
                  type="warning"
                  @click="handleWrite(scope.row, false)"
                  style="margin-left:0"
                  v-if="type == 0"
                  title="修改"
                >修改</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                  style="margin-left:0"
                  v-if="type == 0"
                  title="删除"
                >删除</el-button>
                <el-button
                  size="mini"
                  type="warning"
                  @click="validWithdraw(scope.row)"
                  style="margin-left:0"
                  v-if="type == 1"
                  title="撤回"
                >撤回</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="clearboth">
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
            v-if="showTable"
          ></el-pagination>
        </div>
      </div>
    </el-col>

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
        :data="transferCoulmnList"
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

    <!-- 设置目录分组查询项 -->
    <el-dialog
      title="设置分组"
      :visible.sync="setGroupVisible"
      width="600px"
      custom-class="setdialogBox"
    >
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入字段中文名名"
        v-model="checkedGroupCoumnListKey"
        :data="transferGroupCoulmnList"
        @left-check-change="
          (a, b) => {
            changeLeftTransfer(a, b, checkedGroupCoumnListKey);
          }
        "
        @right-check-change="
          (a, b) => {
            changeRightTransfer(a, b, checkedGroupCoumnListKey);
          }
        "
        :props="{
          key: 'FIELDNAME',
          label: 'PROPERTIESINFO1'
        }"
        :titles="['待添加', '已选']"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setGroupVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveGroupChecked">保存</el-button>
      </span>
    </el-dialog>

    <!-- 高级搜索 -->
    <el-dialog
      title="高级搜索"
      :visible.sync="HighdialogVisible"
      width="840px"
      custom-class="highdialogBox"
    >
      <el-button type="primary" plain size="medium" style="margin-bottom:15px;">新增条件</el-button>
      <div>
        <el-table border style="width: 100%" header-row-class-name="thClassName">
          <el-table-column align="center" prop="date" label="查询项选择"></el-table-column>
          <el-table-column align="center" prop="name" label="关系操作"></el-table-column>
          <el-table-column align="center" prop="address" label="查询值"></el-table-column>
          <el-table-column align="center" prop="address2" label="逻辑操作"></el-table-column>
          <el-table-column align="center" prop="address3" label="操作">
            <template slot-scope="scope">
              <el-button @click="delClick(scope.row)" type="text" size="small">删除条件</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="HighdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="HighdialogVisible = false">保存</el-button>
      </span>
    </el-dialog>
    <!-- 添加和修改一条数据 -->
    <el-dialog
      title="基本信息"
      :visible.sync="dialogFormVisible"
      custom-class="formdialog"
      ref="dialog"
      width="935px"
      @close="cancel"
      v-if="dialogFormVisible"
    >
      <Formbox
        ref="formbox"
        :tableCardList="tableCardList"
        @cancel="cancel"
        :gridData="gridData"
        :recordCode.sync="recordCode"
        :tableCode="tableCode"
        v-if="dialogFormVisible"
        :archivesData.sync="archivesData"
        @formData="formData"
        @updateformData="updateformData"
        :disabled="disabled"
        :classnodeId="classnodeId"
        :checkedNode="checkedNode"
      >
        <template slot="add">
          <div class="pull-left" v-if="!isUpdateData">
            <el-button
              size="small"
              @click="$refs.formbox.appendData('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >追加</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.addFormData('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >保存</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.resetForm('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >重置</el-button>
            <el-button size="small" @click="cancel">取消</el-button>
          </div>
        </template>
        <template slot="update" slot-scope="scope">
          <div class="pull-left" v-if="isUpdateData">
            <el-button
              size="small"
              @click="$refs.formbox.prevData()"
              :disabled="scope.prevCode ? false : true"
            >上一条</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.nextData()"
              :disabled="scope.nextCode ? false : true"
            >下一条</el-button>
            <el-button
              size="small"
              @click="
                handleRead(
                  archivesData['recordCode-1'],
                  archivesData['mainTitle-1']
                )
              "
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >
              查看原文
              <span
                v-if="archivesData['YUAN_WEN_SHU_LIANG-2']"
              >({{ archivesData["YUAN_WEN_SHU_LIANG-2"] }})</span>
            </el-button>

            <el-button
              size="small"
              @click="$refs.formbox.appendData('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
              v-if="!disabled"
            >追加</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.updateformData('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
              v-if="!disabled"
            >保存</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.resetForm('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
              v-if="!disabled"
            >重置</el-button>
            <el-button size="small" @click="cancel">取消</el-button>
          </div>
        </template>
      </Formbox>
    </el-dialog>
    <!-- 收藏 -->
    <collect :recordCode="recordCode" :tableCode="tableCode" v-show="collectDialog" ref="collect"></collect>

    <!-- 验证登录 -->
    <el-dialog title="验证账户" :visible.sync="loginDialog" width="500px" custom-class="foldClassName">
      <validate-form ref="validateForm" @validLogin="validLogin"></validate-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="loginDialog = false">取 消</el-button>
        <el-button type="primary" @click="$refs.validateForm.checkLogin('loginForm')">验 证</el-button>
      </div>
    </el-dialog>
    <!-- 上传原文 -->
    <el-dialog title="原文上传" :visible.sync="uploadVisible" ref="dialog" width="935px">
      <add-yuanwen
        @cancel="cancel"
        :tableCode="tableCode"
        :recordCode="recordCode"
        @getList="getTableList"
      ></add-yuanwen>
    </el-dialog>
  </section>
</template>

<script>
import navTree from "./components/NavTree";
import addYuanwen from "./components/addYuwen";
import validateForm from "@/components/validateForm";
import searchForm from "@/components/SearchForm";
import collect from "@/components/Collect";
import Formbox from "@/components/Formbox";
import {
  retrieveEditorTableView,
  addEditorTableView,
  deleteEditorTableView,
  updateEditorTableView,
  retrieveEditorTableViewDetail
} from "@/api/editor";
import { getGroup } from "@/api/tableView";
export default {
  name: "archivesDescription",
  data() {
    return {
      collectDialog: false,
      loginDialog: false,
      uploadVisible: false,
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

      showGroup: false, //展示目录分组
      showTable: false, //展示右边表格 初始化不显示
      flag: false, //控制查询项的图标
      colcased: true, //是否显示左边
      setdialogVisible: false, //设置查询项变量,
      setGroupVisible: false, //设置目录分组
      HighdialogVisible: false, //高级搜索
      loading: false, //表格加载动画,
      columnList: [], //表头数据,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      tableCode: "", //实体表tablecode
      tableCardList: [], //实体表录入视图列
      archiveFlag: "",
      checkedCoumnListKey: ["createDate", "mainTitle"], //已选试图列下标
      transferCoulmnList: [],
      checkedCoumnList: [], //已选视图列

      checkedGroupCoumnListKey: [], //已选目录视图列下标
      transferGroupCoulmnList: [],
      checkedGroupCoumnList: [], //已选目录视图列
      groupList: [],
      groupConditions: [], //分组查询条件

      sorts: [], //排序条件
      form: {}, //选择项表单
      gridData: [], //数据表格
      filterMethod(query, item) {
        return item.PROPERTIESINFO1.indexOf(query) > -1;
      },
      type: 0, //是否是回收站 0表示全部数据 1代表获取回收站数据
      recordCode: "",
      selectedData: null,
      classnodeId: "",
      checkedNode: null,
      rowData: null, //发送到树组件的数据
      disabled: false,
      archivesData: {},
      isUpdateData: false,
      dialogFormVisible: false
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
    handleCollect(row) {
      this.recordCode = row.RECORDCODE;
      this.collectDialog = true;
      this.$refs.collect.getIsCollect();
    },

    cancel() {
      this.dialogFormVisible = false;
      this.isUpdateData = false;
      this.uploadVisible = false;
    },
    handleUpload(code) {
      this.recordCode = code;
      this.uploadVisible = true;
    },
    handleDelete(row) {
      //删除
      this.delAndDraw(row, 1);
    },
    handleWithdraw(row) {
      //撤回
      this.delAndDraw(row, 0);
    },
    handleWrite(row, bol) {
      //修改
      this.disabled = bol;
      this.archivesData = {};
      this.isUpdateData = true;
      let params = {
        tableCode: this.tableCode,
        recordCode: row.RECORDCODE
      };
      this.recordCode = row.RECORDCODE;
      retrieveEditorTableViewDetail(params).then(data => {
        if (data.code == 403) {
          this.$message.warning("暂无权限查看当前条目信息");
        } else {
          this.dialogFormVisible = true;
          this.archivesData = data.data;
        }
      });
    },
    delAndDraw(row, status) {
      //删除加撤回 改变trashStatus 0恢复,1放入回收站
      let message = "";
      let msg = "";
      if (status == 0) {
        message = "是否将此文件恢复?";
        msg = "恢复成功";
      } else {
        message = "是否将此文件删除?";
        msg = "删除成功";
      }

      this.$confirm(message, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let arr = [];
          arr.push(row.RECORDCODE);
          let params = {
            tableCode: this.tableCode,
            recordCode: JSON.stringify(arr),
            trashStatus: status
          };
          deleteEditorTableView(params).then(data => {
            if (data.code == 403) {
              this.$message.warning("暂无权限删除");
              return;
            } else {
              if (data.success) {
                this.$message.success(data.msg);
              } else {
                this.$message.error(data.msg);
              }
              this.loading = true;
              this.getTableList();
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    getArchiveObj(obj) {
      //返回保管期限
      let data = {};
      for (let i in obj) {
        if (i === "RETENTION") {
          data[i] = obj[i];
        }
      }
      return data;
    },

    selectCheked(name, event) {
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    },
    trash() {
      this.type = 1;
      this.loading = true;
      let params = {
        tableCode: this.tableCode,
        pageSize: 20,
        pageNum: 1,
        type: this.type,
        catalogCode: this.checkedNode.id
      };
      retrieveEditorTableView(params)
        .then(data => {
          this.tableView(data.data);
        })
        .catch(res => {
          this.loading = false;
        });
    },
    showLeft() {
      this.colcased = !this.colcased;
    },
    sortTable({ column, prop, order }) {
      if (this.sorts != null) {
        let temp = [];
        this.sorts.forEach((item, index) => {
          for (var i in item) {
            if (i == column.property) {
              temp.push(index);
            }
          }
        });
        if (temp.length > 0) {
          for (let i = 0; i < temp.length; i++) {
            this.sorts.splice(temp[i], 1);
          }
        }
        if (column.order == "descending") {
          this.sorts.push({
            [column.property]: "desc"
          });
        } else if (column.order == "ascending") {
          this.sorts.push({
            [column.property]: "asc"
          });
        }
      }
      this.getTableList();
    },

    saveChecked() {
      //保存查询项
      this.archiveFlag = "全部";
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
    saveGroupChecked() {
      //保存目录分组
      if (this.checkedGroupCoumnListKey.length > 6) {
        this.$message.warning("最多选择6个分组项");
        return;
      }
      this.archiveFlag = "全部";

      this.setGroupVisible = false;
      this.checkedGroupCoumnList = [];
      this.checkedGroupCoumnListKey.forEach(val => {
        this.tableCardList.forEach(item => {
          if (item.FIELDNAME == val) {
            this.checkedGroupCoumnList.push(item);
          }
        });
      });
      let grouparr = [];
      this.checkedGroupCoumnList.forEach(val => {
        grouparr.push(
          val.PROPERTIESINFO1 + "-" + val.FIELDNAME + "-" + val.TYPE
        );
      });

      let params = {
        tableCode: this.tableCode,
        group: JSON.stringify(grouparr)
      };
      getGroup(params).then(data => {
        if (data.success) {
          this.groupList = data.data || [];
          this.groupList.forEach(val => {
            let field = val.englishName + "-" + val.columnType;
            if (
              this.groupConditions.find(t => {
                if (t.hasOwnProperty(field)) {
                  return true;
                }
              })
            ) {
            } else {
              this.groupConditions.push({
                [field]: ""
              });
            }
          });
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    isChecked(obj, label) {
      //判断是否选中
      let field = obj.englishName + "-" + obj.columnType;
      if (this.groupConditions.find(val => val[field] == label)) {
        return true;
      }
    },
    getTableViewbyGroup(obj, label) {
      let field = obj.englishName + "-" + obj.columnType;
      let f = this.groupConditions.find((val, index) => {
        if (val.hasOwnProperty(field)) {
          val[field] = label;
          return true;
        }
        {
          return false;
        }
      });
      if (!f) {
        this.groupConditions.push({
          [field]: label
        });
      }
      this.getTableList();
    },
    updateformData(data, bol) {
      //修改
      let dataObj = {
        tableCode: this.tableCode,
        recordCode: this.recordCode,
        params: JSON.stringify(data)
      };
      if (dataObj.params == "{}") {
        this.isUpdateData = false;
        this.dialogFormVisible = false;
        return false;
      }
      updateEditorTableView(dataObj).then(res => {
        this.$refs.formbox.loading = false;
        if (res.code == 403) {
          this.$message.warning("暂无权限修改");
          return;
        } else {
          if (res.success) {
            this.$message.success("修改成功");
            this.getTableList();
          } else {
            this.$message.error("修改失败");
          }
        }
      });
      if (bol) {
        this.dialogFormVisible = false;
        this.isUpdateData = false;
      }
    },
    addData() {
      this.disabled = false;
      this.archivesData = {};
      this.dialogFormVisible = true;
    },
    formData(data, bol, name) {
      if (data.hasOwnProperty("mainTitle-1")) {
        if (data["mainTitle-1"] == "") {
          this.$message.warning("请输入题名");
          this.$refs.formbox.loading = false;
          return false;
        }
      }
      let params = {
        tableCode: this.tableCode,
        tableInfo: JSON.stringify(data)
      };
      if (params.tableInfo == "{}") {
        this.dialogFormVisible = false;
        this.isUpdateData = false;
        return false;
      }
      addEditorTableView(params).then(data => {
        this.$refs.formbox.loading = false;
        if (data.code == 403) {
          this.$message.warning("暂无权限添加");
          return;
        } else {
          if (data.success) {
            this.$message.success("添加成功");
            this.submitForm();
          } else {
            this.$message.error(data.msg);
          }
        }
      });
      if (bol) {
        this.dialogFormVisible = false;
      }
    },
    gettableCode(code, type) {
      //获取tablecode并存储
      this.tableCode = code;
      this.type = type;
      this.showTable = true;
    },
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      this.loading = true;
      this.getTableList();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.loading = true;
      this.getTableList();
    },
    getTableCard(data, checkedNode) {
      this.checkedNode = checkedNode;
      this.showTable = true;
      this.tableCode = this.checkedNode.li_attr.TABLECODE;
      this.tableCardList = data;
      let list = this.tableCardList.filter(
        item => item.FIELDNAME != "null" && item.FIELDNAME != "archiveFlag" //过滤掉归档标识 因为tab有 防止冲突
      );
      this.transferCoulmnList = list;
      this.transferGroupCoulmnList = list;
      this.checkedCoumnListKey = ["mainTitle", "remark", "createDate"];
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
    tableView(data) {
      //获取展示列表
      let columnList = data.tableColums || [];
      this.sorts = data.sorts || [];
      if (this.type == "0") {
        this.archiveFlag = "全部";
      } else {
        this.archiveFlag = "回收站";
      }
      if (data.pageInfo) {
        this.total = data.pageInfo.total || 0;
        this.gridData = data.pageInfo.list || [];
      } else {
        this.total = 0;
        this.gridData = [];
      }

      let width = document.querySelector(".dataTable").offsetWidth - 100;
      columnList.forEach(val => {
        val.WIDTH = (val.WIDTH * width) / (100).toFixed(2);
      });
      this.columnList = columnList;
      this.setSortTable();
      this.loading = false;
    },
    setSortTable() {
      if (this.sorts.length == 0) {
        if (this.$refs.dataTable) {
          for (let i of this.$refs.dataTable.columns) {
            i.order = "";
          }
        } else if (this.$refs.dataTableGdang) {
          for (let i of this.$refs.dataTableGdang.columns) {
            i.order = "";
          }
        }
      } else {
        if (this.archiveFlag != "待归档") {
          this.sorts.forEach(item => {
            for (let j in item) {
              for (let i of this.$refs.dataTable.columns) {
                if (i.property == j) {
                  let sort = item[j] == "desc" ? "descending" : "ascending";
                  i.order = sort;
                  break;
                }
              }
            }
          });
        } else {
          this.sorts.forEach(item => {
            for (let j in item) {
              for (let i of this.$refs.dataTableGdang.columns) {
                if (i.property == j) {
                  let sort = item[j] == "desc" ? "descending" : "ascending";
                  i.order = sort;
                  break;
                }
              }
            }
          });
        }
      }
    },
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
    submitForm() {
      //查询
      this.getTableList();
    },
    getTableList(type) {
      //执行函数
      this.loading = true;
      if (type == 0) {
        //返回全部数据时
        this.type = type;

        this.pageSize = 20;
        this.currentPage = 1;
        this.archiveFlag = "全部";
      }
      let params = {
        tableCode: this.tableCode,
        pageSize: this.pageSize,
        pageNum: this.currentPage,
        type: this.type,
        catalogCode: this.checkedNode.id
      };

      let data = [];
      let temp = this.archiveFlag;
      if (temp == "全部" || temp == "回收站") {
        temp = "";
      }
      if (!this.showGroup) {
        for (let i in this.form) {
          let key = i;
          if (
            this.form[key] != "" &&
            this.form[key] != null &&
            this.form[key] != "null" &&
            !Array.isArray(this.form[key])
          ) {
            data.push({
              [key]: this.form[key]
            });
          } else if (Array.isArray(this.form[key])) {
            data.push({
              [key]: this.form[key][0] + "@" + this.form[key][1] //日期拼接
            });
          }
        }
        params.conditions = JSON.stringify(data);
      } else {
        let conditions = [];
        this.groupConditions.forEach((val, index) => {
          for (let i in val) {
            if (val[i]) {
              conditions.push({
                [i]: val[i]
              });
            }
          }
        });
        params.conditions = JSON.stringify(conditions);
      }
      params.sorts = JSON.stringify(this.sorts);
      let a = new Date();

      retrieveEditorTableView(params)
        .then(data => {
          if (data.data.pageInfo) {
            this.total = data.data.pageInfo.total || 0;
            this.gridData = data.data.pageInfo.list || [];
          } else {
            this.total = 0;
            this.gridData = [];
          }
          this.loading = false;
          this.sorts = data.data.sorts;
          this.setSortTable();
        })
        .catch(res => {
          this.loading = false;
        });
    },
    resetForm(formName) {
      this.$refs.dataTable.clearSort();
      for (let i of this.$refs.dataTable.columns) {
        i.order = "";
      }
      if (!this.showGroup) {
        this.$refs.searchForm.resetForm();
      } else {
        this.groupConditions.forEach(val => {
          for (let i in val) {
            val[i] = "";
          }
        });
        this.sorts = [];
      }
      this.selectData = [];
      this.getTableList();
    },
    handleRead(recordCode, title) {
      this.dialogFormVisible = false;
      //查看原文
      this.$router.push({
        path: "/original",
        query: {
          mainTitle: title,
          recordCode: recordCode,
          tableCode: this.tableCode
        }
      });
    },
    validTrash() {
      this.istrash = true;
      this.isWithdraw = false;
      this.loginDialog = true;
    },
    validWithdraw(row) {
      this.istrash = false;
      this.isWithdraw = true;
      this.loginDialog = true;
      this.recordCode = row.RECORDCODE;
    },
    validLogin(val) {
      if (val) {
        this.loginDialog = false;
        if (this.istrash) {
          this.trash();
        } else if (this.isWithdraw) {
          let row = this.gridData.filter(
            item => item.RECORDCODE == this.recordCode
          )[0];
          this.delAndDraw(row, 0);
        }
      }
    },
    selectCheked(name, event) {
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    }
  },
  components: {
    navTree,
    Formbox,
    searchForm,
    collect,
    validateForm,
    addYuanwen
  },
  computed: {},
  watch: {
    $route: {
      handler(newval, oldval) {
        if (newval.name == "archivesCompilation" && this.tableCode) {
          this.submitForm("form");
        }
      },
      deep: true
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch("permission/add_cachedViews", from.name); //添加缓存组件
    next();
  }
};
</script>
<style scoped lang="scss">
section {
  background-color: #fff;
  .lineHeight {
    margin-top: 12px;
    .require {
      color: #ff0036;
      margin-right: 3px;
    }
  }
  .btnwrapper1 {
    padding: 10px 15px;
    border-bottom: 1px solid #ccc;
  }
  .content-right {
    padding-top: 0;
    .inline {
      display: inline-block;
      .input {
        width: 180px;
      }
    }
  }
}
</style>
<style lang="scss">
.highdialogBox {
  .el-dialog__body {
    padding: 15px 20px;
  }
}

.tabList {
  .el-range-editor {
    vertical-align: middle;
  }
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
@media screen and (max-width: 1360px) {
  .tabList {
    .el-range-editor {
      width: 220px !important;
    }
  }
}
@media screen and (max-width: 1280px) {
  .tabList {
    .el-range-editor {
      width: 200px !important;
    }
  }
}
</style>
