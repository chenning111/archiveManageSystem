<template>
  <!-- 录入查询等功能和commonData差不多 更复杂 复用组件 -->
  <section>
    <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
      <Tree
        @tableView="tableView"
        @gettableCode="gettableCode"
        @tableCard="gettableCard"
        @relation="getRelation"
        :classType="classType"
        :rowData="rowData"
        :relationObj="relationObj"
        :isDataEntry="isDataEntry"
        ref="tree"
        :verificate.sync="verificate"
      >
        <template slot-scope="scope" slot="ad">
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
            <!-- 编研 -->
            <slot name="by"></slot>
            <!-- 档案 -->
            <slot name="archive"></slot>
            <el-tree
              :data="scope.tree.tableViewTree"
              :props="scope.tree.defaultProps"
              @node-click="scope.tree.handleNodeClick"
              style="margin:15px 0"
              ref="treeList"
              :default-expanded-keys="expandArr"
              node-key="id"
              class="tree"
              :expand-on-click-node="false"
              highlight-current
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
      :class="!colcased ? 'paddingleft-30' : ''"
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
      <div class="flex-spaceBetween btngroup">
        <div>
          <el-button
            plain
            size="medium"
            @click="watchRetionTable"
            :disabled="
              $is_disabled(['archivesDescription-range']) && tableCode
                ? false
                : true
            "
            v-if="classType == 'D_ARCHIVE'"
          >分类和归档范围</el-button>
          <el-button
            @click="addData"
            size="medium"
            type="primary"
            :disabled="
              $is_disabled(['archivesDescription-add', 'material-add']) &&
              tableCode
                ? false
                : true
            "
          >新增</el-button>
          <el-button
            plain
            @click="validTrash"
            v-if="this.type == 0"
            size="medium"
            :disabled="
              $is_disabled(['archivesDescription-trash', 'material-trash']) &&
              tableCode
                ? false
                : true
            "
          >回收站</el-button>
          <el-button
            plain
            @click="getTableList(0)"
            v-if="this.type == 1"
            size="medium"
            :disabled="tableCode ? false : true"
          >返回列表</el-button>
        </div>
        <div class="pull-right">
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
          >筛选查询</el-button>
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
            v-show="!showGroup && archiveFlag != '待归档'"
          >
            <el-col :span="24">
              <search-form
                :checkedNode="checkedNode"
                :fieldArray="checkedCoumnList"
                :form="form"
                :submitFunc="submitForm"
                :defaultProps="{ fileldName: 'FIELDNAME', type: 'type' }"
                :classnodeId="classnodeId"
                :nodeCode="nodeCode"
                ref="searchForm"
              ></search-form>
            </el-col>
          </el-form>
          <el-form
            ref="form"
            :model="form"
            inline
            size="small"
            v-show="archiveFlag == '待归档'"
            class="dGdang"
          >
            <el-col :span="24">
              <search-form
                :fieldArray="searchgDanngtableColums"
                :form="form"
                :defaultProps="{ fileldName: 'FIELDNAME', type: 'type' }"
                :classnodeId="classnodeId"
                :nodeCode="nodeCode"
                :showLabel="false"
                ref="toGDSearchForm"
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
            @click="submitForm('form')"
            v-show="!showGroup || archiveFlag == '待归档'"
            :disabled="
              $is_disabled(['archivesDescription-search', 'material-search']) &&
              tableCode
                ? false
                : true
            "
          >查询</el-button>
          <el-button
            type="primary"
            size="small"
            icon="el-icon-refresh-left"
            plain
            @click="resetForm('form')"
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
          <el-tabs v-model="archiveFlag" @tab-click="handarchiveFlag">
            <el-tab-pane label="全部" name="全部" v-if="type == '0'"></el-tab-pane>
            <el-tab-pane label="预归档" name="待整理" v-if="isshowGdang && type == '0'"></el-tab-pane>
            <el-tab-pane label="编档号" name="待归档" v-if="isshowGdang && type == '0'"></el-tab-pane>
            <el-tab-pane label="已归档" name="已归档" v-if="isshowGdang && type == '0'"></el-tab-pane>
            <el-tab-pane label="不归档" name="不归档" v-if="isshowGdang && type == '0'"></el-tab-pane>
            <el-tab-pane label="回收站" name="回收站" v-if="type == 1"></el-tab-pane>
          </el-tabs>
          <div class="clearboth title">
            <p class="pull-left">
              共
              <em>{{ total }}条</em>记录
            </p>

            <p
              v-if="selectedLength"
              style="margin:0 15px"
              class="pull-left"
            >当前档案最大{{ lastFormDatSystemObj.chineseName }}：{{ maxNum }}</p>
            <div class="pull-right" v-if="isshowGdang">
              <el-button type="primary" size="medium" v-if="archiveFlag == '全部'" @click="putRk">文件入库</el-button>
              <el-button
                type="primary"
                size="medium"
                v-if="archiveFlag == '待整理'"
                @click="putNoGdang"
                :disabled="
                  $is_disabled(['archivesDescription-putNoGd']) ? false : true
                "
              >放入不归档</el-button>
              <el-button
                type="primary"
                size="medium"
                v-if="archiveFlag == '待整理'"
                @click="putDaiGdang"
                :disabled="
                  $is_disabled(['archivesDescription-putDgd']) ? false : true
                "
              >放入待归档</el-button>
              <el-button
                type="primary"
                size="medium"
                v-if="archiveFlag == '待归档'"
                @click="putGdang"
                :disabled="
                  $is_disabled(['archivesDescription-saveArchiveNo'])
                    ? false
                    : true
                "
              >确认档号</el-button>
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
            v-show="showTable"
            v-if="archiveFlag != '待归档'"
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column prop="ROW_ID" label="序号" align="center" width="70"></el-table-column>
            <el-table-column
              :label="coulmnItem.TITLE"
              :min-width="coulmnItem.WIDTH"
              align="center"
              v-for="(coulmnItem, index) in columnList"
              :key="index"
              :show-overflow-tooltip="true"
              sortable="custom"
              :prop="coulmnItem.NAME"
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
              align="center "
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
            <el-table-column label="操作" align="center" :width="getWidth()" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  class="fixedWidth"
                  @click="handleRead(scope.row.RECORDCODE, scope.row.MAINTITLE)"
                  v-if="type == 0 && scope.row.YUAN_WEN_SHU_LIANG"
                  :disabled="
                    $is_disabled([
                      'archivesDescription-readFile',
                      'material-readFile'
                    ])
                      ? false
                      : true
                  "
                  title="查看原文"
                >
                  <span
                    v-if="
                      scope.row.YUAN_WEN_SHU_LIANG &&
                        scope.row.YUAN_WEN_SHU_LIANG > 0
                    "
                  >原({{ scope.row.YUAN_WEN_SHU_LIANG }})</span>
                  <span v-else>原文</span>
                </el-button>
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleUpload(scope.row.RECORDCODE)"
                  v-if="type == 0 && scope.row.YUAN_WEN_SHU_LIANG == 0||!scope.row.YUAN_WEN_SHU_LIANG"
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
                  :disabled="
                    $is_disabled(['archivesDescription-edit', 'material-edit'])
                      ? false
                      : true
                  "
                >修改</el-button>

                <el-button
                  size="mini"
                  type="danger"
                  @click="handleDelete(scope.row)"
                  style="margin-left:0"
                  v-if="type == 0"
                  title="删除"
                  :disabled="
                    $is_disabled([
                      'archivesDescription-delete',
                      'material-delete'
                    ])
                      ? false
                      : true
                  "
                >删除</el-button>
                <el-button
                  size="mini"
                  type="warning"
                  @click="validWithdraw(scope.row)"
                  style="margin-left:0"
                  v-if="type == 1"
                  title="撤回"
                  :disabled="
                    $is_disabled([
                      'archivesDescription-reset',
                      'material-reset'
                    ])
                      ? false
                      : true
                  "
                >撤回</el-button>
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

          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            v-loading="loading"
            ref="dataTableGdang"
            tooltip-effect="dark"
            @sort-change="sortTable"
            @select="checkedPieceNo"
            @select-all="checkedAllPieceNo"
            v-show="archiveFlag == '待归档'"
            :row-class-name="tableRowClassName"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
            <el-table-column
              :label="coulmnItem.PROPERTIESINFO1"
              align="center"
              v-for="(coulmnItem, index) in gDanngtableColums"
              :key="index"
              :show-overflow-tooltip="true"
              sortable="custom"
              :prop="coulmnItem.FIELDNAME"
            >
              <template slot-scope="scope">
                <el-input
                  type="text"
                  v-model.number="scope.row.QUANTITY"
                  v-if="coulmnItem.FIELDNAME == 'quantity'"
                ></el-input>
                <!-- //过滤归档年度 保留最后四位数 -->
                <span
                  v-else-if="
                    coulmnItem.FIELDNAME.toUpperCase() == 'FILLINGYEAR'
                  "
                >
                  {{
                  scope.row[coulmnItem.FIELDNAME.toUpperCase()]
                  | filterFillingYear
                  }}
                </span>
                <span v-else>
                  {{
                  scope.row[coulmnItem.FIELDNAME.toUpperCase()]
                  }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total, prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
          v-if="showTable"
        ></el-pagination>
      </div>
    </el-col>
    <!-- 设置预归档 -->
    <el-dialog title="预归档分类" :visible.sync="dialogVisible1" width="900px" custom-class="formdialog">
      <div class="tableTitle">
        <div style="width:100%">
          <el-button @click="submitFiled('toFiledForm')" size="small" type="primary" plain>提交</el-button>
          <el-button @click="resetFiledForm('toFiledForm')" size="small" type="primary" plain>重置</el-button>
          <el-button @click="dialogVisible1 = false" size="small" type="primary" plain>取消</el-button>
          <el-button
            style="float:right;"
            @click="watchRetionTable"
            size="small"
            type="primary"
            icon="el-icon-search"
          >归档范围和保管期限表</el-button>
        </div>
      </div>
      <el-form
        :inline="true"
        :model="toFiledObj"
        ref="toFiledForm"
        label-width="110px"
        :rules="rules"
      >
        <search-form
          :checkedNode="checkedNode"
          :fieldArray="toFiledList"
          :form="toFiledObj"
          :defaultProps="{ fileldName: 'FIELDNAME', type: 'type' }"
          :isAddType="false"
          :classnodeId="classnodeId"
          :showLabel="true"
          :nodeCode="nodeCode"
          :required="true"
          ref="toGdForm"
        ></search-form>
      </el-form>
    </el-dialog>
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
        :data="transferGroupCoulmnList"
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
        <el-table border style="width: 100%">
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
      @close="closeFunc"
      v-if="dialogFormVisible"
    >
      <Formbox
        ref="formbox"
        :tableCardList="tableCardList"
        :formDatSystem="formDatSystem"
        :FoldformDatSystem="FoldformDatSystem"
        @formData="formData"
        @updateformData="updateformData"
        @cancel="cancel"
        :gridData="gridData"
        :recordCode.sync="recordCode"
        :tableCode="tableCode"
        :retentionArray="retentionArray"
        :archivesData.sync="archivesData"
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
              v-if="archivesData['YUAN_WEN_SHU_LIANG-2'] != 0"
            >
              查看原文
              <span
                v-if="archivesData['YUAN_WEN_SHU_LIANG-2']"
              >({{ archivesData["YUAN_WEN_SHU_LIANG-2"] }})</span>
            </el-button>

            <el-button
              size="mini"
              type="primary"
              @click="handleUpload(archivesData['recordCode-1'])"
              v-if="archivesData['YUAN_WEN_SHU_LIANG-2'] == 0"
              title="上传原文"
            >上传</el-button>
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
    <!-- 添加案卷 -->
    <el-dialog
      title="添加案卷"
      :visible.sync="addFoldDialog"
      custom-class="formdialog"
      ref="dialog"
      width="935px"
      @close="addFoldDialog = false"
      v-if="addFoldDialog"
    >
      <Formbox
        ref="foldformbox"
        :tableCardList="FoldtableCardList"
        :formDatSystem="formDatSystem"
        :FoldformDatSystem="FoldformDatSystem"
        @FoldformData="FoldformData"
        :tableCode="FoldtableCode"
        :retentionArray="retentionArray"
        :archivesData.sync="FoldarchivesData"
        :classnodeId="classnodeId"
        :checkedNode="checkedNode"
        :gridData="gridData"
        :isAddFold="true"
      >
        <template slot="add">
          <div class="pull-left">
            <el-button
              size="small"
              @click="$refs.foldformbox.addFormData('ruleForm')"
              type="primary"
              :disabled="FoldtableCardList.length == 0 ? true : false"
            >保存</el-button>
            <el-button
              size="small"
              @click="$refs.foldformbox.resetForm('ruleForm')"
              type="primary"
              :disabled="FoldtableCardList.length == 0 ? true : false"
            >重置</el-button>
            <el-button size="small" @click="cancel">取消</el-button>
          </div>
        </template>
      </Formbox>
    </el-dialog>

    <!-- 保管期限表 -->
    <el-dialog
      title="归档范围和保管期限表"
      :visible.sync="retionTable"
      width="60%"
      custom-class="formdialog"
      v-dialogDrag
      ref="dialog__wrapper"
    >
      <Retention></Retention>
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
    <!-- 验证登录 -->
    <el-dialog title="验证账户" :visible.sync="loginDialog" width="500px" custom-class="foldClassName">
      <validate-form ref="validateForm" @validLogin="validLogin"></validate-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="loginDialog = false">取 消</el-button>
        <el-button type="primary" @click="$refs.validateForm.checkLogin('loginForm')">验 证</el-button>
      </div>
    </el-dialog>
  </section>
</template>

<script>
import validateForm from "@/components/validateForm";
import Tree from "../views/search/Tree";
import addYuanwen from "../views/search/addYuwen";
import searchForm from "@/components/SearchForm";
import Formbox from "./Formbox";
import Retention from "./Retention";
import { PrefixZero, isObjectValueEqual, deepQuery } from "@/common/js/util";
import {
  getTableView,
  addTableInfo,
  upArchives,
  getArchives,
  upArchivesByRecordCode,
  getGroup,
  updateArchivesFiled,
  updateArchives,
  updateNoArchives,
  getJHMaxBysystemNoFormat,
  getInputCard
} from "@/api/tableView";
import { Base64 } from "js-base64";
import { getSystemNoFormatListByEntityCode } from "@/api/archiveNoformat";

export default {
  props: {
    isDataEntry: Boolean, //是否是档案门类检索,
    classType: {
      type: String,
      default: ""
    } //传入不同的显示不同的门类 例如档案 编研
  },
  data() {
    return {
      loginDialog: false,
      uploadVisible: false,
      queryCode: "",
      verificate: false, //校验页面来的变量 用于绑定搜索框值
      addFoldDialog: false, //添加案卷
      FoldtableCardList: [], // 案卷列
      FoldformDatSystem: [], //案卷档号组成项
      FoldarchivesData: {}, //案卷信息
      FoldtableCode: "", //案卷tablecode
      disabled: false, //是否是点击题名查看的 如果是不给修改
      retionTable: false, //保管期限表
      isshowGdang: false, //是否显示表格头的归档等操作
      showGroup: false, //展示目录分组
      showTable: false, //展示右边表格 初始化不显示
      flag: false, //控制查询项的图标
      colcased: true, //是否显示左边
      setdialogVisible: false, //设置查询项变量,
      setGroupVisible: false, //设置目录分组
      HighdialogVisible: false, //高级搜索
      dialogFormVisible: false, //添加记录,
      isUpdateData: false, //是否修改记录,
      loading: false, //表格加载动画,
      columnList: [], //表头数据,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      tableCode: "", //实体表tablecode
      tableCardList: [], //实体表录入视图列
      expandArr: [], //左侧导航默认展开列
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
      archivesData: {},
      recordCode: "",
      archiveFlag: "",
      relationList: [], //实体表关系
      relationObj: {}, //发送到树组件的查询项
      dialogVisible1: false, //预归档分类
      toFiledObj: {},
      warnIndex: [], //信息不完整数据下标
      rules: {},

      dialogVisible2: false, //归档
      searchgDanngtableColums: [],
      nodeCode: "",
      formDatSystem: [],
      lastFormDatSystemObj: {}, //档号组成项最后一项
      selectData: [],
      num: 0, //件号,
      maxNum: 0,
      selectedLength: 0,
      classnodeId: "", //底层门类id
      tableClassType: "",

      parentNodeCode: "",

      checkedClassNodeData: {
        entityTable: []
      }, //树节点选中的底层门类
      checkedNode: null, //树节点选中节点
      rowData: null, //发送到树组件的数据
      istrash: false,
      isWithdraw: false
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

    watchRetionTable() {
      //查看归档范围表
      this.retionTable = true;
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
    handleUpload(code) {
      this.recordCode = code;
      this.uploadVisible = true;
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
    getArchiveObj(obj) {
      //返回档号项除了档号项最后一项
      let data = {};
      for (let i in obj) {
        this.formDatSystem.forEach(item => {
          let name = item.columnName.toUpperCase();
          if (
            i == name &&
            i != this.lastFormDatSystemObj.columnName.toUpperCase()
          ) {
            data[i] = obj[i];
          }
        });
      }
      return data;
    },

    checkedAllPieceNo(selection) {
      //全选
      let fieldname = this.lastFormDatSystemObj.columnName.toUpperCase(); //需要自动生成的字段大写
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
          this.$confirm(
            "已选内容不属于同一批文件，不能归档，已根据第一条数据作为查询条件为您查询",
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning"
            }
          )
            .then(() => {
              this.letRowSelected(indexData, "next", selection[0], false);
              this.$refs.dataTableGdang.clearSelection();
              this.submitForm("form");
            })
            .catch(() => {
              this.letRowSelected(indexData, "next", selection[0], false);
              this.$refs.dataTableGdang.clearSelection();
            });

          return;
        } else {
          this.letRowSelected(indexData, "next", selection[0], true);
        }
      } else if (selection.length == 0) {
        this.gridData.forEach(valitem => {
          this.$set(valitem, fieldname, "");
        });
        this.num = 0;
      }
      this.selectedLength = selection.length;
    },
    letRowSelected(indexData, next, row, flag) {
      //如果next存在说明是点击的全选 如果是flag是false 说明全选的时候生成件号失败
      this.searchgDanngtableColums.forEach(item => {
        this.$set(this.form, item.FIELDNAME + "-" + item.TYPE, "");
      });
      let selectData = this.$refs.dataTableGdang.selection;
      let fieldname = this.lastFormDatSystemObj.columnName.toUpperCase(); //需要自动生成的字段大写
      for (let i in indexData) {
        for (let j in this.form) {
          if (j.toUpperCase().indexOf(i) > -1) {
            this.form[j] = indexData[i];
          }
        }
      }
      this.loading = true;
      this.$refs.toGDSearchForm.fondsNo = this.form["fondsNo-1"] || ""; //全宗号
      this.$refs.toGDSearchForm.departmentCodeArr =
        this.form["departmentCode-1"] || ""; //部门
      this.$refs.toGDSearchForm.archiveCatalogNoArr =
        this.form["archiveCatalogNo-1"] || ""; //实体
      getJHMaxBysystemNoFormat({
        tableCode: this.tableCode,
        ysParms: fieldname,
        parmsList: JSON.stringify(indexData)
      }).then(res => {
        if (res.success) {
          this.num = res.data || 0;
          this.maxNum = this.num;
          this.num++;
          this.$set(row, fieldname, this.num);
          this.loading = false;
          if (next && flag) {
            for (let i = 1; i < selectData.length; i++) {
              this.num++;
              this.$set(selectData[i], fieldname, this.num);
            }
          } else if (!flag) {
            selectData.forEach(valitem => {
              this.$set(valitem, fieldname, "");
            });
          }
        } else {
          this.$message.error(res.msg);
          this.$refs.dataTableGdang.toggleRowSelection(row, false);
        }
      });
    },
    checkedPieceNo(selection, row) {
      //勾选checkbox
      let selected = selection.length && selection.indexOf(row) !== -1; //判断当前行是否选中
      let indexData = {};
      let fieldname = this.lastFormDatSystemObj.columnName.toUpperCase(); //需要自动生成的字段大写
      if (selected) {
        if (selection.length == 1) {
          indexData = this.getArchiveObj(selection[0]); //获取到第一个除了档号组成项 件号 页数的数据，选择的第一个当作归档条件
          //  和之后选择的比对 如何不相同不给选
          // 同时把筛选条件变成第一条数据
          this.letRowSelected(indexData, "", row, true);
        } else if (selection.length > 1) {
          let index = this.getArchiveObj(selection[0]);
          let nextData = this.getArchiveObj(row);
          let temp = isObjectValueEqual(index, nextData);
          if (temp) {
            this.$refs.dataTableGdang.toggleRowSelection(row, true);
            this.num++;

            row[fieldname] = this.num;
          } else {
            this.$confirm(
              "当前选择的条目和已选择的不属于同一批文件，不可同时归档,可通过点击查询按钮查找同一批文件再进行归档",
              "提示",
              {
                confirmButtonText: "确定",
                type: "warning"
              }
            )
              .then(() => {
                this.$refs.dataTableGdang.toggleRowSelection(row, false);
              })
              .catch(() => {
                this.$refs.dataTableGdang.toggleRowSelection(row, false);
              });
          }
        }
      } else {
        selection.forEach(item => {
          if (item[fieldname] > row[fieldname]) {
            item[fieldname] -= 1;
          }
        });
        row[fieldname] = "";
        this.num--;
      }
      this.selectedLength = selection.length;
    },
    tableRowClassName({ row, rowIndex }) {
      //行高亮
      if (this.warnIndex.includes(row.RECORDCODE)) {
        return "warning-row";
      }
      return "";
    },
    putRk() {
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要入库的内容");
        return;
      }
      this.$confirm(
        "是否将所选" + this.selectData.length + "条内容入库",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          let params = [];
          this.selectData.forEach((item, index) => {
            let obj = {};
            obj.recordCode = item.RECORDCODE;
            obj.archivehistoryFlag = "已入库";
            params.push(obj);
          });

          updateNoArchives({
            tableCode: this.tableCode,
            params: JSON.stringify(params)
          })
            .then(res => {
              if (res.code === 403) {
                this.$message.warning("暂无权限修改");
                return;
              }
              if (res.success) {
                this.$message.success(res.msg);
                this.getTableList();
              }
            })
            .catch(err => {
              this.$message.warning("已取消");
            });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    putNoGdang() {
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要不归档的内容");
        return;
      }
      this.$confirm(
        "是否将所选" + this.selectData.length + "条内容放入不归档",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          let params = [];
          this.selectData.forEach((item, index) => {
            let obj = {};
            obj.recordCode = item.RECORDCODE;
            obj.archiveFlag = "不归档";

            params.push(obj);
          });

          updateNoArchives({
            tableCode: this.tableCode,
            params: JSON.stringify(params)
          })
            .then(res => {
              if (res.code === 403) {
                this.$message.warning("暂无权限修改");
                return;
              }
              if (res.success) {
                this.$message.success(res.msg);
                this.getTableList();
              }
            })
            .catch(err => {
              this.$message.warning("已取消");
            });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    putGdang() {
      // 归档
      this.warnIndex = [];
      this.selectData = this.$refs.dataTableGdang.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要进行归档的内容");
        return;
      }
      let has_quantity = this.formDatSystem.filter(
        item => item.columnName == "quantity"
      ); //如果档号组成项有页数 在判断
      if (has_quantity.length > 0) {
        this.selectData.forEach(item => {
          if (item.QUANTITY == "" || item.QUANTITY == undefined) {
            this.warnIndex.push(item.RECORDCODE);
          }
        });
      }

      if (this.warnIndex.length > 0) {
        this.$alert("请填写表格高亮处条目内的页数", "提示", {
          type: "warning"
        })
          .then(() => {})
          .catch(err => {});
        return;
      }
      if (has_quantity.length > 0) {
        if (
          this.selectData.filter(val => /^[0-9]+$/.test(val.QUANTITY))
            .length !== this.selectData.length
        ) {
          this.$alert("页数请输入数字", "提示", {
            type: "warning"
          })
            .then(() => {})
            .catch(err => {});
          return;
        }
      }

      this.$confirm(
        "是否将所选" + this.selectData.length + "条内容归档",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          //如果是文件类的实体表且上一级为案卷的 需要检测是否包含该案卷

          let anode = this.checkedClassNodeData.entityTable.find(
            item => item.li_attr.TABLECLASSTYPE == "A"
          );
          let fnode = this.checkedClassNodeData.entityTable.find(
            item => item.li_attr.TABLECLASSTYPE == "F"
          );
          let inode = this.checkedClassNodeData.entityTable.find(
            item => item.li_attr.TABLECLASSTYPE == "I"
          );
          if (fnode) {
            let yearFolderNo = this.selectData[0].YEARFOLDERNO; //获取案卷号 查询上一级是否有该案卷
            let parentTableCode = fnode.li_attr.TABLECODE;
            let dataobj = {
              tableCode: parentTableCode,
              pageSize: 20,
              pageNum: 1,
              type: 0,
              conditions: JSON.stringify([{ "yearFolderNo-1": yearFolderNo }])
            };
            this.FoldtableCode = parentTableCode;
            getTableView(dataobj).then(res => {
              if (res.success) {
                if (res.data.pageInfo) {
                  let total = res.data.pageInfo.total;
                  if (total > 0) {
                    //如果有案卷
                    this.handleGuidang(has_quantity, this.formDatSystem); //生成档号
                  } else {
                    this.$alert(
                      "暂无案卷号为" + yearFolderNo + "的案卷,点击确定添加",
                      "提示",
                      {
                        type: "warning"
                      }
                    )
                      .then(() => {
                        getInputCard({ tableCode: parentTableCode }).then(
                          res => {
                            this.FoldtableCardList = res.data || [];
                            this.FoldarchivesData = this.form;
                            this.FoldarchivesData[
                              "yearFolderNo-1"
                            ] = yearFolderNo;
                            this.addFoldDialog = true;
                          }
                        );
                      })
                      .catch(err => {});
                    return;
                  }
                }
              } else {
                this.$message.error(res.msg);
              }
            });
          } else if (!fnode && !inode) {
            this.handleGuidang(has_quantity, this.formDatSystem);
          }
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    handleGuidang(has_quantity, formDatList = []) {
      let fieldname = this.lastFormDatSystemObj.columnName.toUpperCase(); //需要自动生成的字段大写
      let params = [];
      let noValueField = [];
      this.selectData.forEach((item, index) => {
        let obj = {};
        obj.recordCode = item.RECORDCODE;
        obj.archiveFlag = "已归档";
        obj[fieldname] = item[fieldname];
        if (has_quantity.length > 0) {
          obj.QUANTITY = item.QUANTITY;
        }
        let archiveStr = "";
        formDatList.forEach(newitem => {
          let name = newitem.columnName.toUpperCase();
          let itemStr = "";
          let value = item[name];
          if (newitem.columnName === "fillingYear") {
            let reg = /^[a-z,A-Z,.]*[0-9]{4}$/;
            if (!reg.test(value)) {
              noValueField.push(newitem.chineseName);
            }
          } else if (
            !value ||
            parseInt(value) === 0 ||
            String(value).trim() == ""
          ) {
            noValueField.push(newitem.chineseName);
          }

          if (newitem.columnName == "retention") {
            if (value != "") {
              if (
                this.retentionArray.filter(arritem => arritem.name == value)
                  .length == 0
              ) {
                value = "";
              } else {
                value = this.retentionArray.filter(
                  arritem => arritem.name == value
                )[0].code;
              }
            }
          }
          itemStr = PrefixZero(value, newitem.lenth, newitem.columnName);
          if (newitem.separator) {
            archiveStr += itemStr + newitem.separator;
          } else {
            archiveStr += itemStr + "";
          }
        });
        obj.archiveNo = archiveStr.slice(0, archiveStr.length - 1);
        params.push(obj);
      });
      noValueField = Array.from(new Set(noValueField));
      if (noValueField.length > 0) {
        this.$alert(
          `档号组成项必填字段：${noValueField.join()}不能为空`,
          "提示",
          {
            type: "warning"
          }
        );
        return false;
      } else {
        updateArchives({
          tableCode: this.tableCode,
          params: JSON.stringify(params)
        })
          .then(res => {
            if (res.code === 403) {
              this.$message.warning("暂无权限修改");
              return;
            }
            if (res.success) {
              this.$message.success("归档成功");
              this.resetForm("form");
            }
          })
          .catch(err => {});
      }
    },
    putDaiGdang() {
      //放入待归档
      this.selectData = this.$refs.dataTable.selection;
      if (this.selectData.length == 0) {
        this.$message.warning("请勾选需要进行预归档的内容");
        return;
      }
      this.toFiledObj = {};
      this.toFiledList.forEach(val => {
        this.$set(this.toFiledObj, val.FIELDNAME, "");
        this.$set(this.rules, val.FIELDNAME, [
          { required: true, message: "请输入必填项" }
        ]);
      });

      this.dialogVisible1 = true;
      this.$nextTick(() => {
        this.$refs.toGdForm.resetForm();
        this.$refs["toFiledForm"].resetFields();
      });
    },

    submitFiled(formName) {
      //放入待归档
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.loading = true;
          this.requestPutWgdang();
        } else {
          return false;
        }
      });
    },
    requestPutWgdang() {
      //放入待归档
      let params = [];
      this.selectData.forEach((item, index) => {
        let obj = {};
        for (let i in this.toFiledObj) {
          obj[i] = this.toFiledObj[i];
        }
        obj.recordCode = item.RECORDCODE;
        obj.archiveFlag = "未归档";
        params.push(obj);
      });
      let data = {
        tableCode: this.tableCode,
        params: JSON.stringify(params)
      };
      updateArchivesFiled(data)
        .then(res => {
          this.loading = false;
          if (res.code === 403) {
            this.$message.warning("暂无权限修改");
            return;
          }
          this.dialogVisible1 = false;
          if (res.success) {
            this.$confirm("是否对当前预归档的数据进行编档号", "提示", {
              type: "warning",
              confirmButtonText: "确定",
              cancelButtonText: "取消"
            })
              .then(() => {
                this.toFiledList.forEach(item => {
                  for (let i in this.toFiledObj) {
                    if (item.FIELDNAME == i) {
                      this.$set(
                        this.form,
                        i + "-" + item.TYPE,
                        this.toFiledObj[i]
                      );
                    }
                  }
                });
                this.archiveFlag = "待归档";
                this.getTableList().then(() => {
                  this.$refs.dataTableGdang.toggleAllSelection();
                });
                this.$refs["toFiledForm"].resetFields();
                this.$refs.toGdForm.resetForm();
              })
              .catch(() => {
                this.getTableList();
              });
          } else {
            this.$message.error("操作失败");
          }
        })
        .catch(err => {});
    },

    resetFiledForm(formName) {
      this.$refs.toGdForm.resetForm();
    },

    handarchiveFlag(tab) {
      this.archiveFlag = tab.name;
      this.selectedLength = 0;
      this.sorts = [];
      this.groupConditions.forEach(val => {
        for (let i in val) {
          val[i] = "";
        }
      });
      //切换tab 重置表单
      if (this.archiveFlag != "待归档") {
        this.$refs.searchForm.resetForm();
      } else {
        this.$refs.toGDSearchForm.resetForm();
      }

      this.currentPage = 0;
      this.getTableList();
    },

    trash() {
      this.archiveFlag = "回收站";
      this.type = 1;
      this.loading = true;
      if (this.$refs.dataTable) {
        this.$refs.dataTable.clearSort();
        for (let i of this.$refs.dataTable.columns) {
          i.order = "";
        }
      }
      this.$refs.searchForm.resetForm();
      this.$refs.toGDSearchForm.resetForm();
      this.groupConditions.forEach(val => {
        for (let i in val) {
          val[i] = "";
        }
      });
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
    closeFunc() {
      this.dialogFormVisible = false;
      this.isUpdateData = false;
    },
    saveChecked() {
      //保存查询项
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
      this.$refs.searchForm.resetForm();
    },
    saveGroupChecked() {
      //保存目录分组
      if (this.checkedGroupCoumnListKey.length > 6) {
        this.$message.warning("最多选择6个分组项");
        return;
      }
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
    changeTableGetData(node) {
      this.tableCode = node.li_attr.TABLECODE;
      this.resetForm();
    },
    gettableCode(code, type) {
      //获取tablecode并存储
      this.tableCode = code;
      this.type = type;
      this.showTable = true;
    },
    tableView(data, time) {
      //渲染表格
      this.selectedLength = 0;
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
      return new Promise((resolve, reject) => {
        this.loading = true;
        //执行函数
        if (type == 0) {
          //返回全部数据时
          this.type = type;
          this.pageSize = 20;
          this.currentPage = 1;
          this.archiveFlag = "全部";
          this.groupConditions.forEach(val => {
            for (let i in val) {
              val[i] = "";
            }
          });
          if (this.archiveFlag != "待归档") {
            this.$refs.searchForm.resetForm();
          } else {
            this.$refs.toGDSearchForm.resetForm();
          }
          if (this.$refs.dataTable) {
            //清空排序
            this.$refs.dataTable.clearSort();
            for (let i of this.$refs.dataTable.columns) {
              i.order = "";
            }
          }
        }
        let params = {
          tableCode: this.tableCode,
          pageSize: this.pageSize,
          pageNum: this.currentPage,
          type: this.type
        };
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
        this.setSortTable();
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

          if (temp != "") {
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
          if (temp) {
            conditions.push({
              ["archiveFlag-1"]: temp
            });
          }
          params.conditions = JSON.stringify(conditions);
        }
        params.sorts = JSON.stringify(this.sorts);
        getTableView(params)
          .then(data => {
            if (data.data.pageInfo) {
              this.total = data.data.pageInfo.total || 0;
              this.gridData = data.data.pageInfo.list || [];
              this.sorts = data.data.sorts || [];
              resolve();
            } else {
              this.total = 0;
              this.gridData = [];
              this.sorts = data.data.sorts || [];
            }

            this.loading = false;
          })
          .catch(err => {
            console.log(err);
          });
      });
    },
    submitForm(formName) {
      //查询
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
    gettableCard(
      data,
      nodeCode,
      classnodeId,
      tableClassType,
      isshowGdang,
      bol,
      checkedNodeData,
      isDataEntry
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
      this.tableCardList = data;
      let list = this.tableCardList.filter(item => {
        if (item.FIELDNAME != "null" && item.FIELDNAME != "archiveFlag") {
          //过滤掉归档标识 因为tab有 防止冲突
          return true;
        }
      });
      if (this.checkedNode.li_attr.TYPE === "catalog") {
        list = list.filter(item => item.FIELDNAME !== "fondsNo");
      }
      this.transferCoulmnList = list;
      this.transferGroupCoulmnList = list;
      this.checkedCoumnListKey = ["departmentCode", "mainTitle"];
      if (this.checkedNode.li_attr.TYPE === "catalog") {
        // this.checkedCoumnListKey.push("fondsNo");
        this.checkedCoumnListKey.push("archiveCatalogNo");
      }
      if (bol) {
        this.relationObj.fieldArray.forEach(item => {
          if (!this.checkedCoumnListKey.includes(item.y)) {
            this.checkedCoumnListKey.push(item.y);
          }
        });
      } else {
        if (this.queryCode && this.verificate) {
          //如果是从校验那边过来的 添加档号
          if (this.tableClassType == "F") {
            //如果是案卷 加案卷档号
            this.checkedCoumnListKey.push("folderNo");
          } else if (this.tableClassType == "A") {
            //如果是文件 加档号
            this.checkedCoumnListKey.push("archiveNo");
          }
        }
      }
      this.checkedCoumnListKey = Array.from(new Set(this.checkedCoumnListKey));
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
        //搜索框赋值
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
      this.$nextTick(() => {
        if (this.queryCode && this.verificate) {
          if (this.tableClassType == "F") {
            //如果是案卷
            this.$set(this.form, "folderNo-1", this.rowData.archiveNo);
          } else if (this.tableClassType == "A") {
            //如果是文件 加档号
            this.$set(this.form, "archiveNo-1", this.rowData.archiveNo);
          }
        }
      });
    },

    resetForm(formName) {
      this.warnIndex = [];
      this.maxNum = 0;
      if (this.$refs.dataTable) {
        this.$refs.dataTable.clearSort();
        for (let i of this.$refs.dataTable.columns) {
          i.order = "";
        }
      }
      if (this.$refs.dataTableGdang) {
        this.$refs.dataTableGdang.clearSort();
        for (let i of this.$refs.dataTableGdang.columns) {
          i.order = "";
        }
      }
      if (!this.showGroup) {
        this.$refs.searchForm.resetForm();
        this.$refs.toGDSearchForm.resetForm();
        this.sorts = [];
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
          isSearch: false
        }
      });
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
          upArchives(params).then(data => {
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
    updateformData(data, bol) {
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
      upArchivesByRecordCode(dataObj).then(res => {
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
    relationSearch() {
      //关系查询
      this.$prompt("输入查询：", "关系查询", {
        confirmButtonText: "查询",
        cancelButtonText: "取消",
        inputValue: "公司名称/联系人",
        customClass: "prompt-box"
      }).then(({ value }) => {
        // this.$message({
        //   type: "success",
        //   message: "你的邮箱是: " + value
        // });
      });
    },
    delClick(rwo) {
      //删除条件
    }, //添加数据
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

      addTableInfo(params).then(data => {
        this.$refs.formbox.loading = false;
        if (data.code == 403) {
          this.$message.warning("暂无权限添加");
          return;
        } else {
          if (data.success) {
            this.$message.success("添加成功");

            var params = {
              tableCode: this.tableCode,
              pageSize: 20,
              pageNum: 1,
              type: this.type
            };
            if (name == "formbox") {
              this.tableCardList.forEach(item => {
                if (item.INHERIT != "T" && item.FIELDNAME != "pieceNo") {
                  this.$set(
                    this.$refs.formbox.form,
                    item.FIELDNAME + "-" + item.TYPE,
                    ""
                  );
                }
                if (item.FIELDNAME == "departmentCode" && item.INHERIT != "T") {
                  this.$refs.formbox.departmentCodeArr = "";
                }
                if (item.FIELDNAME == "fondsNo" && item.INHERIT != "T") {
                  this.$refs.formbox.fondsNo = "";
                }
                if (
                  item.FIELDNAME == "archiveCatalogNo" &&
                  item.INHERIT != "T"
                ) {
                  this.$refs.formbox.archiveCatalogNo = "";
                }
              });
              if (this.$refs.formbox.form.hasOwnProperty("pieceNo-2")) {
                if (this.$refs.formbox.form["pieceNo-2"] != "") {
                  this.$refs.formbox.form["pieceNo-2"] =
                    parseInt(this.$refs.formbox.form["pieceNo-2"]) + 1;
                }
              }
            }
            this.submitForm("form");
          } else {
            this.$message.error(data.msg);
          }
        }
      });
      if (bol) {
        this.dialogFormVisible = false;
      }
    },
    FoldformData(data, bol, name) {
      if (data.hasOwnProperty("mainTitle-1")) {
        if (data["mainTitle-1"] == "") {
          this.$message.warning("请输入题名");
          this.$refs.foldformbox.loading = false;
          return false;
        }
      }
      let params = {
        tableCode: this.FoldtableCode,
        tableInfo: JSON.stringify(data)
      };
      if (params.tableInfo == "{}") {
        this.addFoldDialog = false;
        return false;
      }
      addTableInfo(params).then(data => {
        this.$refs.foldformbox.loading = false;
        if (data.code == 403) {
          this.$message.warning("暂无权限添加");
          return;
        } else {
          if (data.success) {
            this.$message.success("添加成功");
            this.addFoldDialog = false;
            this.putGdang();
          } else {
            this.$message.error(data.msg);
          }
        }
      });
      if (bol) {
        this.dialogFormVisible = false;
      }
    },
    cancel() {
      this.dialogFormVisible = false;
      this.isUpdateData = false;
      this.uploadVisible = false;
      this.addFoldDialog = false;
    },

    getWidth() {
      if (this.relationList.length > 0) {
        return "300";
      } else {
        return "250";
      }
    },
    handleRelation(item, row) {
      this.$refs.searchForm.resetForm();
      this.relationObj = item;
      this.rowData = row;
      this.$refs.tree.queryCode = ""; //清除从校验来的form 档号
    }
  },
  components: {
    Tree,
    Formbox,
    Retention,
    searchForm,
    addYuanwen,
    validateForm
  },
  created() {
    this.queryCode = this.$route.params.code;
    this.rowData = this.$route.params.rowData;
    this.verificate = this.$route.params.verificate;
  },
  mounted() {
    this.expandArr = [this.classType];
    if (this.queryCode) {
      this.expandArr = [this.queryCode];
    }
  },
  watch: {
    $route: {
      handler(newval, oldval) {
        if (newval.name == "archivesDescription" && this.tableCode) {
          this.submitForm("form");
        }
      },
      deep: true
    },

    classnodeId(newval, oldval) {
      //查询档号组成项
      if (newval && oldval != newval) {
        getSystemNoFormatListByEntityCode({ entityCode: newval }).then(res => {
          if (res.success) {
            if (res.data) {
              this.formDatSystem = res.data || [];
              this.FoldformDatSystem = this.formDatSystem.slice(
                0,
                this.formDatSystem.length - 1
              );
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    tableCode(newval, oldval) {
      if (oldval && oldval != newval) {
        //清除搜索框的档号
        this.queryCode = "";
        this.$delete(this.form, "archiveNo-1");
      }
    }
  },
  computed: {
    gDanngtableColums: {
      //待归档的表头数据
      get() {
        let arr = [];
        this.searchgDanngtableColums = [];
        this.lastFormDatSystemObj = this.formDatSystem[
          this.formDatSystem.length - 1
        ];
        let mainTitleObj = {}; //题名字段
        let lastFieldObj = {};
        this.formDatSystem.forEach(val => {
          this.tableCardList.forEach(item => {
            if (
              item.FIELDNAME == val.columnName &&
              item.FIELDNAME != this.lastFormDatSystemObj.columnName &&
              item.FIELDNAME != "mainTitle"
            ) {
              arr.push(item);
              this.searchgDanngtableColums.push(item);
            }
            if (item.FIELDNAME == "mainTitle") {
              mainTitleObj = item;
            }
            if (item.FIELDNAME == this.lastFormDatSystemObj.columnName) {
              lastFieldObj = item;
            }
          });
        });

        arr.unshift(mainTitleObj);

        arr.unshift(lastFieldObj);
        arr = arr.filter(item => item.FIELDNAME);
        return arr;
      },
      set() {}
    },
    toFiledList: {
      get() {
        let arr = [];
        this.lastFormDatSystemObj = this.formDatSystem[
          this.formDatSystem.length - 1
        ];
        this.formDatSystem.forEach(val => {
          this.tableCardList.forEach(item => {
            if (
              item.FIELDNAME == val.columnName &&
              val.columnName != this.lastFormDatSystemObj.columnName
            ) {
              arr.push(item);
            }
          });
        });
        return arr;
      },
      set() {}
    },
    retentionArray() {
      let arr = this.tableCardList.filter(
        item => item.FIELDNAME == "retention"
      );
      if (arr.length > 0) {
        return arr[0].PROPERTIESINFO2;
      }
    }
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
    .entityTable {
      height: 60px;
      border-bottom: 1px solid #eee;
      margin-bottom: 10px;
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

.dGdang {
  .searchForm {
    .el-date-editor--daterange.el-input__inner {
      width: 100px;
    }
    .el-form-item__content {
      width: 150px;
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
