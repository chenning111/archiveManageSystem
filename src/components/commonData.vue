<template>
  <!-- 公用组件 和dataEntry组件差不多，少了归档等操作防止耦合太高 -->
  <section>
    <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
      <Tree
        @tableView="tableView"
        @gettableCode="gettableCode"
        @tableCard="gettableCard"
        @relation="getRelation"
        :relationObj="relationObj"
        :classType="classType"
        :isDataEntry="isDataEntry"
        :jd="jd"
        :rowData="rowData"
      >
        <template slot-scope="scope" slot="ad">
          <div class="content-left-title">
            <span>门类树</span>
            <i
              :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
              @click="showLeft"
            ></i>
          </div>
          <div class="card">
            <!-- 编研 -->
            <slot name="by"></slot>

            <!-- 档案 -->
            <slot name="archive"></slot>
            <el-tree
              :data="scope.tree.tableViewTree"
              :props="scope.tree.defaultProps"
              @node-click="scope.tree.handleNodeClick"
              highlight-current
              style="margin:15px 0"
              ref="treeList"
              :default-expanded-keys="expandArr"
              :expand-on-click-node="false"
              default-expand-all
              node-key="id"
              class="tree"
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
                <!-- //实体分类 -->
                <span v-else>
                  <i class="iconfont icon-danganheji catalogIcon"></i>
                  {{ data.NO}} -- {{data.text }}（{{data.FONDSNO}}）
                </span>
              </span>
            </el-tree>
          </div>
        </template>
      </Tree>
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
      <div class="flex-center entityTable">
        <p
          v-for="(node,index) in checkedClassNodeData.entityTable"
          :key="index"
          :class="node.li_attr.TABLECODE === tableCode?'checked':''"
          @click="changeTableGetData(node)"
        >{{node.text}}</p>
      </div>
      <div class="flex-spaceBetween btngroup" style="flex-direction: row-reverse;">
        <div v-if="isDataEntry">
          <el-button
            plain
            size="medium"
            @click="watchRetionTable"
            v-if="classType == 'D_ARCHIVE'"
          >分类和归档范围</el-button>
          <el-button @click="addData" size="medium" :disabled="tableCode ? false : true">添加</el-button>
          <el-button
            plain
            @click="trash"
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
          <!-- <el-button plain size="medium" :disabled="tableCode ? false : true">导入</el-button>
          <el-button plain size="medium" :disabled="tableCode ? false : true">导出</el-button>-->
        </div>
        <div>
          <el-button
            size="medium"
            :type="!showGroup ? 'primary' : ''"
            @click="showGroup = false"
            :disabled="archiveFlag == '待归档'"
            v-if="classType == 'D_ARCHIVE'"
          >简单查询</el-button>
          <el-button
            size="medium"
            :type="showGroup ? 'primary' : ''"
            @click="showGroup = true"
            :disabled="archiveFlag == '待归档'"
            v-if="classType == 'D_ARCHIVE'"
          >分组查询</el-button>
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
            v-if="!showGroup && archiveFlag != '待归档'"
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

          <div class="groupBox" v-show="showGroup && archiveFlag != '待归档'">
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
            v-show="!showGroup || archiveFlag == '待归档'"
            :disabled="
              $is_disabled([
                'specialCategory-search',
                'expirationAppraisa-search'
              ]) && tableCode
                ? false
                : true
            "
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
            v-show="!showGroup && archiveFlag != '待归档'"
            :disabled="tableCode ? false : true"
            v-if="classType == 'D_ARCHIVE'"
          >设置查询项</el-button>
          <el-button
            type="primary"
            size="small"
            plain
            @click="setGroupVisible = true"
            v-show="showGroup && archiveFlag != '待归档'"
            v-if="classType == 'D_ARCHIVE'"
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
          <el-tabs v-if="type == 1" v-model="archiveFlag">
            <el-tab-pane label="回收站" name="回收站"></el-tab-pane>
          </el-tabs>

          <div class="title flex-spaceBetween">
            <div v-if="jd">
              <el-radio-group v-model="utilizeYear" @change="changeUtilizeYear" size="medium">
                <el-radio-button label="all">全部</el-radio-button>
                <el-radio-button label="2">近两年</el-radio-button>
                <el-radio-button label="5">近五年</el-radio-button>
              </el-radio-group>
              <el-date-picker
                size="medium"
                v-model="utilizeTime"
                v-if="jd"
                type="daterange"
                placeholder="选择日期"
                value-format="yyyy-MM-dd"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                @change="changeUtilizeTime"
              ></el-date-picker>
            </div>
            <p v-if="!jd">
              为您找到相关结果
              <em>{{ total }}</em>个， 搜索用时 (
              <em>{{ searchTime || 0 }}</em>秒)
            </p>
            <div>
              <el-button
                type="primary"
                size="medium"
                @click="putZti"
                v-if="addZt"
                :disabled="
                  $is_disabled(['specialCategory-addZt']) ? false : true
                "
              >加入专题</el-button>
              <el-button type="primary" size="medium" @click="putJd" v-if="jd">批量鉴定</el-button>
              <el-button type="primary" size="medium" @click="putJy" v-if="!jd">批量借阅</el-button>
            </div>
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
            @select="checkedFile"
            @select-all="checkedAllFile"
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
            <el-table-column prop="USERSIZE" label="利用人数" align="center" width="90" v-if="jd"></el-table-column>
            <el-table-column prop="USETIMES" label="利用次数" align="center" width="90" v-if="jd"></el-table-column>
            <el-table-column label="操作" align="center" width="245" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  title="查看原文"
                  class="fixedWidth"
                  @click="handleRead(scope.row.RECORDCODE, scope.row.MAINTITLE)"
                  v-if="type == 0 && !jd"
                  :disabled="
                    $is_disabled(['specialCategory-readFile']) ? false : true
                  "
                >原({{ scope.row.YUAN_WEN_SHU_LIANG || 0 }})</el-button>
                <el-button
                  size="mini"
                  type="success "
                  @click="handleCollect(scope.row)"
                  v-if="type == 0 && !jd"
                  title="收藏"
                  style="margin-left:0"
                >收藏</el-button>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleJd(scope.row)"
                  v-if="type == 0 && jd"
                  style="margin-left:0"
                  title="鉴定"
                >鉴定</el-button>
                <el-dropdown v-if="relationList.length">
                  <el-button type="primary" size="mini">
                    关联
                    <i class="el-icon-arrow-down el-icon--right"></i>
                  </el-button>
                  <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item
                      @click.native="handleRelation(item, scope.row)"
                      v-for="item in relationList"
                      :key="item.stableCode"
                    >{{ item.stableName }}</el-dropdown-item>
                  </el-dropdown-menu>
                </el-dropdown>
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
        <div class="clearboth" style="padding:0 20px 20px 20px">
          <div class="pull-right">
            <el-button
              type="primary"
              size="medium"
              @click="putZti"
              v-if="addZt"
              :disabled="$is_disabled(['specialCategory-addZt']) ? false : true"
            >加入专题</el-button>
            <el-button type="primary" size="medium" @click="putJd" v-if="jd">批量鉴定</el-button>
            <el-button type="primary" size="medium" @click="putJy" v-if="!jd">批量借阅</el-button>
          </div>
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
    <!-- 加入专题 -->
    <el-dialog title="专题目录" :visible.sync="ztdiolag" width="935px" custom-class="formdialog">
      <el-form
        class="formbox ztform"
        ref="ztForm"
        :inline="true"
        :model="ztform"
        label-width="110px"
      >
        <div class="btnwrapper1 clearboth">
          <div class="pull-left">
            <el-button size="small" @click="addzt('ztForm')" type="primary">添加</el-button>
            <el-button size="small" @click="ztdiolag = false">取消</el-button>
          </div>
          <div class="pull-right lineHeight">
            <span class="require">*</span>为必填项
          </div>
        </div>
        <div class="ab">
          <el-form-item
            label="专题名"
            prop="zt"
            :rules="[
              { required: true, message: '请选择一个专题', trigger: 'change' }
            ]"
          >
            <el-select v-model="ztform.zt">
              <el-option
                v-for="special in specialList"
                :key="special.topiccode"
                :value="special.topiccode"
                :label="special.topicname"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-link type="primary" @click="newztdiloag = true">添加新专题</el-link> -->
        </div>
      </el-form>
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
        :disabled="disabled"
        :classnodeId="classnodeId"
        :checkedNode="checkedNode"
      >
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
  </section>
</template>

<script>
import searchForm from "@/components/SearchForm";
import collect from "@/components/Collect";
import Tree from "../views/search/Tree";
import Formbox from "./Formbox";
import { isObjectValueEqual, deepQuery } from "@/common/js/util";
import {
  getTableView,
  addTableInfo,
  upArchives,
  getArchives,
  upArchivesByRecordCode,
  getGroup,
  getSystemNoFormatListByEntityCode,
  updateArchivesFiled,
  updateArchives,
  updateNoArchives,
  getJHMaxBysystemNoFormat
} from "@/api/tableView";

import {
  selecSpecialTopicCatalog,
  addSpecialTopicCatalog,
  addSpecialTopicUtab
} from "@/api/special";
export default {
  props: {
    classType: String, //传入不同的显示不同的门类 例如档案 编研
    addZt: Boolean, //档案门类检索加入专题
    isDataEntry: Boolean, //是否是档案门类检索,
    jd: Boolean //是否是到期鉴定
  },
  data() {
    return {
      collectDialog: false,
      utilizeYear: "", //近几年利用
      utilizeTime: [], //选择框利用时间
      checkedTwoYear: "",
      checkedFiveYear: "",
      checkedAll: "",
      searchTime: "",
      options: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
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
      ztdiolag: false, //加入专题
      // newztdiloag: false, //创建专题
      isshowGdang: false, //是否显示表格头的归档等操作
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
      checkedCoumnListKey: ["departmentCode", "mainTitle"], //已选试图列下标
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

      nodeCode: "",
      formDatSystem: [],
      selectData: [],
      ztrules: {
        topicname: [{ required: true, message: "请输入", trigger: "blur" }],
        creattime: [{ required: true, message: "请输入", trigger: "blur" }],
        statusdescription: [
          { required: true, message: "请输入", trigger: "blur" }
        ]
      },
      specialList: [],
      ztform: {
        //专题目录
        zt: ""
      },
      newztForm: {
        //创建专题
        topicname: "",
        creattime: "",
        statusdescription: "",
        remark: ""
      },
      classnodeId: "",
      tableClassType: "",
      expandArr: [], //树节点打开的数组
      parentNodeCode: "",
      checkedClassNodeData: {
        entityTable: []
      }, //树节点选中的底层门类
      checkedNode: null,
      rowData: null, //发送到树组件的数据
      disabled: false,
      archivesData: {},
      isUpdateData: false,
      dialogFormVisible: false,
      queryCode: "",
      relationList: [], //实体表关系
      relationObj: {} //发送到树组件的查询项
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
    changeUtilizeYear() {
      let nowdate = new Date().getTime();
      let oldDate = "";
      if (this.utilizeYear == "all") {
        this.utilizeTime = [];
      } else {
        oldDate = nowdate - 365 * Number(this.utilizeYear) * 24 * 3600 * 1000;
        this.utilizeTime = [
          new Date(oldDate).format("yyyy-MM-dd"),
          new Date(nowdate).format("yyyy-MM-dd")
        ];
      }

      this.submitForm();
    },
    changeUtilizeTime() {
      this.utilizeYear = "all";
      this.submitForm();
    },
    cancel() {
      this.dialogFormVisible = false;
      this.isUpdateData = false;
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
      getArchives(params).then(data => {
        if (data.code == 403) {
          this.$message.warning("暂无权限查看当前条目信息");
        } else {
          this.dialogFormVisible = true;
          if (data.success) {
            this.archivesData = data.data;
          } else {
            this.archivesData = {};
            this.$message.error(data.msg);
          }
        }
      });
    },
    putJy() {
      //批量借阅
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要借阅的文件");
        return;
      }
      let recordCodeList = [];
      this.selectData.forEach(item => {
        recordCodeList.push(item.RECORDCODE);
      });
      this.$router.push({
        path: "applyRead",
        query: {
          tableCode: this.tableCode,
          recordCodeList: recordCodeList.join()
        }
      });
    },
    putJd() {
      //批量鉴定
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要鉴定的文件");
        return;
      }
      let recordCodeList = [];
      this.selectData.forEach(item => {
        recordCodeList.push(item.RECORDCODE);
      });
      this.$router.push({
        path: "appraisalContent",
        query: {
          tableCode: this.tableCode,
          recordCodeList: recordCodeList.join()
        }
      });
    },
    putZti() {
      //加入专题
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要加入专题的文件");
        return;
      }
      this.ztdiolag = true;
      this.getZtlist();
    },
    getZtlist() {
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
    addzt(formName) {
      //添加专题
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = [];
          this.selectData.forEach(val => {
            params.push({
              archivescode: val.RECORDCODE,
              topiccode: this.ztform.zt,
              tablecode: this.tableCode
            });
          });
          addSpecialTopicUtab(params)
            .then(res => {
              this.ztdiolag = false;
              if (res.success) {
                this.$message.success("添加成功");
                this.$refs.dataTable.clearSelection();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(() => {
              this.ztdiolag = false;
            });
        } else {
          return false;
        }
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
    changeJudge(index) {
      //根据鉴定日期查询
      if (index == 1) {
        this.checkedTwoYear = "primary";
        this.checkedFiveYear = "";
        this.checkedAll = "";
      }
      if (index == 2) {
        this.checkedTwoYear = "";
        this.checkedFiveYear = "primary";
        this.checkedAll = "";
      }
      if (index == 3) {
        this.checkedTwoYear = "";
        this.checkedFiveYear = "";
        this.checkedAll = "primary";
      }
    },
    checkedFile(selection, row) {
      let selected = selection.length && selection.indexOf(row) !== -1; //判断当前行是否选中
      let indexData = {};
      if (selected) {
        if (this.jd) {
          if (selection.length == 1) {
            indexData = this.getArchiveObj(selection[0]); //获取全宗号 部门 保管期限
            //  和之后选择的比对 如何不相同不给选
          } else if (selection.length > 1) {
            let index = this.getArchiveObj(selection[0]);
            let nextData = this.getArchiveObj(row);
            let temp = isObjectValueEqual(index, nextData);
            if (temp) {
              this.$refs.dataTable.toggleRowSelection(row, true);
            } else {
              this.$alert(
                "每份鉴定书针对同一保管期限到期资料,请重新选择相同保管期限资料或根据条件查询",
                "提示",
                {
                  confirmButtonText: "确定",
                  type: "warning"
                }
              )
                .then(() => {
                  this.$refs.dataTable.toggleRowSelection(row, false);
                })
                .catch(() => {
                  this.$refs.dataTable.toggleRowSelection(row, false);
                });
            }
          }
        } else {
          if (selection.length > 1) {
            let indexDepartment = selection[0].DEPARTMENTCODE;
            let nextDepartment = row.DEPARTMENTCODE;
            if (indexDepartment) {
              //如果部门存在
              if (nextDepartment) {
                if (indexDepartment == nextDepartment) {
                  this.$refs.dataTable.toggleRowSelection(row, true);
                } else {
                  this.$alert(
                    "当前选择的条目和已选择的不属于同一部门，请重新选择",
                    "提示",
                    {
                      confirmButtonText: "确定",
                      type: "warning"
                    }
                  )
                    .then(() => {
                      this.$refs.dataTable.toggleRowSelection(row, false);
                    })
                    .catch(() => {
                      this.$refs.dataTable.toggleRowSelection(row, false);
                    });
                }
              } else {
                this.$refs.dataTable.toggleRowSelection(row, true);
              }
            }
          }
        }
      }
    },
    checkedAllFile(selection) {
      //全选
      if (this.jd) {
        if (selection.length >= 1) {
          let indexData = this.getArchiveObj(selection[0]);
          let flag = false;
          for (let i = 1; i < selection.length; i++) {
            let nextData = this.getArchiveObj(selection[i]);
            let temp = isObjectValueEqual(indexData, nextData);
            if (!temp) {
              flag = true;
              break;
            }
          }
          if (flag) {
            //如果其中有不同属于同一类的
            this.$alert(
              "每份鉴定书针对同一保管期限到期资料,请重新选择相同保管期限资料或根据条件查询",
              "提示",
              {
                confirmButtonText: "确定",
                type: "warning"
              }
            )
              .then(() => {
                this.$refs.dataTable.toggleAllSelection();
              })
              .catch(() => {
                this.$refs.dataTable.toggleAllSelection();
              });
            return;
          }
        }
      } else {
        if (selection.length >= 1) {
          let indexData = selection.find(item => item.DEPARTMENTCODE != "");
          let indexDepartment = "";
          let flag = false;
          if (indexData) {
            indexDepartment = indexData.DEPARTMENTCODE;
          }
          if (indexDepartment) {
            for (let i = 1; i < selection.length; i++) {
              let nextDepartment = selection[i].DEPARTMENTCODE;
              let temp;
              if (nextDepartment) {
                temp = nextDepartment == indexDepartment ? true : false;
              }
              if (!temp) {
                flag = true;
                break;
              }
            }
          }
          if (flag) {
            //如果其中有不同属于同一类的
            this.$alert(
              "当前选择的条目包含不属于同一部门的档案，请重新选择",
              "提示",
              {
                confirmButtonText: "确定",
                type: "warning"
              }
            )
              .then(() => {
                this.$refs.dataTable.toggleAllSelection();
              })
              .catch(() => {
                this.$refs.dataTable.toggleAllSelection();
              });
            return;
          }
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
    },
    trash() {
      this.type = 1;
      this.loading = true;
      let params = {
        tableCode: this.tableCode,
        pageSize: 20,
        pageNum: 1,
        type: this.type
      };
      getTableView(params)
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
    getRelation(val) {
      let list = val;
      this.relationList = [];
      if (list.length == 0) {
        this.relationList = [];
        return;
      }
      let arr = list.filter(
        item =>
          item.MASTERTABLECODE == this.tableCode ||
          item.SLAVETABLECODE == this.tableCode
      );
      let data = [];
      let mobj = {
        fieldArray: [],
        stableCode: "",
        stableName: ""
      };
      let sobj = {
        fieldArray: [],
        stableCode: "",
        stableName: ""
      };
      let m = arr.filter(item => item.MASTERTABLECODE == this.tableCode);
      m.forEach(item => {
        mobj.stableCode = item.SLAVETABLECODE;
        mobj.stableName = item.SLAVETABLENAME;
        mobj.fieldArray.push({ x: item.MASTERNAME, y: item.SLAVENAME });
      });
      let s = arr.filter(item => item.SLAVETABLECODE == this.tableCode);
      s.forEach(item => {
        sobj.stableCode = item.MASTERTABLECODE;
        sobj.stableName = item.MASTERTABLENAME;
        sobj.fieldArray.push({ x: item.SLAVENAME, y: item.MASTERNAME });
      });
      if (mobj.stableCode) {
        data.push(mobj);
      }
      if (sobj.stableCode) {
        data.push(sobj);
      }
      this.relationList = data;
    },
    gettableCode(code, type) {
      //获取tablecode并存储
      this.tableCode = code;
      this.type = type;
      this.showTable = true;
    },
    changeTableGetData(node) {
      this.tableCode = node.li_attr.TABLECODE;
      this.resetForm();
    },
    tableView(data, time) {
      this.searchTime = time; //搜索用时
      this.utilizeTime = [];
      this.utilizeYear = "all";

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
    getTableList(type) {
      //执行函数
      this.loading = true;
      if (type == 0) {
        //返回全部数据时
        this.type = type;
        if (this.classType == "D_ARCHIVE") {
          this.isshowGdang = true;
        }
        this.pageSize = 20;
        this.currentPage = 1;
        this.archiveFlag = "全部";
      }
      let params = {
        tableCode: this.tableCode,
        pageSize: this.pageSize,
        pageNum: this.currentPage,
        type: this.type
      };
      if (this.jd) {
        params.destroyJudgeOpinion = true; //鉴定
        if (this.utilizeTime && this.utilizeTime.length > 0) {
          params.destroyJudgeStarTime = this.utilizeTime[0];
          params.destroyJudgeEndTime = this.utilizeTime[1];
        }
      }
      if (this.checkedNode.li_attr.TYPE === "catalog") {
        params.catalogCode = this.checkedNode.CATALOGCODE;
      } else {
        params.catalogCode = "";
      }
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
        if (!this.isDataEntry) {
          data.push({ "archiveFlag-1": "已归档" });
        } else if (temp != "" && this.isDataEntry) {
          data.push({ "archiveFlag-1": temp });
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
        if (!this.isDataEntry) {
          conditions.push({ "archiveFlag-1": "已归档" });
        } else if (temp != "" && this.isDataEntry) {
          conditions.push({ "archiveFlag-1": temp });
        }

        params.conditions = JSON.stringify(conditions);
      }
      params.sorts = JSON.stringify(this.sorts);
      let a = new Date();

      getTableView(params)
        .then(data => {
          let b = new Date();
          this.searchTime = ((b - a) / 1000).toFixed(2); //搜索用时
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
    gettableCard(
      data,
      nodeCode,
      classnodeId,
      tableClassType,
      isshowGdang,
      bol,
      checkedNodeData
    ) {
      if (checkedNodeData) {
        this.checkedClassNodeData = checkedNodeData;
      }
      this.checkedNode = this.$refs.treeList.getCurrentNode();
      this.isshowGdang = isshowGdang;
      this.tableClassType = tableClassType; //表类型 案卷还是文件还是项目 F A I
      //获取当前视图列
      this.classnodeId = classnodeId;
      this.nodeCode = nodeCode;
      this.showTable = true;
      this.tableCardList = data;
      let list = this.tableCardList.filter(
        item => item.FIELDNAME != "null" && item.FIELDNAME != "archiveFlag" //过滤掉归档标识 因为tab有 防止冲突
      );
      if (this.checkedNode.li_attr.TYPE === "catalog") {
        //如果点击实体分类 删除全宗
        list = list.filter(item => item.FIELDNAME !== "fondsNo");
      }
      this.transferCoulmnList = list;
      this.transferGroupCoulmnList = list;

      if (this.classType == "D_STUDY") {
        //如果是编研 默认给年度
        this.checkedCoumnListKey = [
          "departmentCode",
          "mainTitle",
          "createdyear"
        ];
      } else {
        this.checkedCoumnListKey = ["departmentCode", "mainTitle"];
        if (this.checkedNode.li_attr.TYPE === "catalog") {
          this.checkedCoumnListKey.push("archiveCatalogNo");
        }
        if (bol) {
          this.relationObj.fieldArray.forEach(item => {
            if (!this.checkedCoumnListKey.includes(item.y)) {
              this.checkedCoumnListKey.push(item.y);
            }
          });
        }
      }
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
      if (bol) {
        //搜索框赋值案卷档号和项目号
        this.relationObj.fieldArray.forEach(item => {
          for (let i in this.form) {
            if (i.indexOf(item.y) > -1 && this.rowData) {
              this.$set(
                this.form,
                i,
                this.rowData[item.x.toLocaleUpperCase()] || ""
              );
            }
          }
        });
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
    resetForm(formName) {
      this.warnIndex = [];
      this.maxNum = 0;
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
        path: "/searchContent",
        query: {
          recordCode: recordCode,
          tableCode: this.tableCode,
          classnodeId: this.classnodeId,
          mainTitle: title,
          isSearch: true
        }
      });
    },
    handleJd(row) {
      this.$router.push({
        path: "appraisalContent",
        query: {
          tableCode: this.tableCode,
          recordCodeList: [row.RECORDCODE].join()
        }
      });
    },
    handleReadJd() {
      this.$router.push("/readAppraisal");
    },
    relationSearch() {
      //关系查询
      this.$prompt("输入查询：", "关系查询", {
        confirmButtonText: "查询",
        cancelButtonText: "取消",
        inputValue: "公司名称/联系人",
        customClass: "prompt-box"
      }).then(({ value }) => {
        this.$message.success("你的邮箱是: " + value);
      });
    },
    delClick(rwo) {
      //删除条件
    }, //添加数据

    selectCheked(name, event) {
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    },

    submitForm() {
      //查询
      this.getTableList();
    },
    handleRelation(item, row) {
      this.$refs.searchForm.resetForm();
      this.relationObj = item;
      this.rowData = row;
    }
  },
  components: {
    Tree,
    Formbox,
    searchForm,
    collect
  },
  created() {
    this.queryCode = this.$route.params.code;
  },
  mounted() {
    this.expandArr = [this.classType];
    if (this.queryCode) {
      this.expandArr = [this.queryCode];
    }
  },
  computed: {},
  watch: {}
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
    .entityTable {
      height: 60px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
      position: stricky;
      top: 0;
      p {
        cursor: pointer;
        margin: 0 10px;
        color: #333;
        border-bottom: 1px solid #666;
        padding-bottom: 0.5px;
      }
      p:hover {
        color: #409eff;
        border-bottom: 1px solid #409eff;
      }
      p.checked {
        font-weight: 700;
        border-bottom: 1px solid #409eff;
        color: #409eff;
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
.dGdang {
  .searchForm {
    .el-date-editor--daterange.el-input__inner {
      width: 100px;
    }
    .el-form-item__content {
      width: 100px;
    }
    .el-date-editor.el-input {
      width: auto;
    }
  }
}
.ztform {
  min-height: 300px;
  .ab {
    padding: 20px 15px;
    width: 60%;
  }
  .el-link {
    position: relative;
    top: 9px;
  }
}
</style>
