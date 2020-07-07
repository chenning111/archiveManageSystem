<template>
  <section style="background-color:#fff;">
    <el-row>
      <el-col :span="24">
        <header class="nobot">
          <el-tabs v-model="activeName">
            <el-tab-pane label="角色功能权限设置" name="first"></el-tab-pane>
            <el-tab-pane label="数据权限设置" name="second"></el-tab-pane>
            <el-tab-pane label="员工角色分配" name="third"></el-tab-pane>
          </el-tabs>
        </header>
      </el-col>
      <el-col class="content" :span="24">
        <el-col :span="4" class="contianer-left">
          <el-tree
            :data="roleGroupList"
            :props="defaultProps"
            @node-click="handleNodeClick"
            class="roleList"
            :default-expand-all="true"
            :highlight-current="highlight"
            node-key="id"
            ref="tree"
          ></el-tree>
        </el-col>
        <el-col :span="20" class="contianer-right" style="min-height:500px">
          <div class="info shu-3">
            <div v-if="dataInfo.name">
              <h3>{{dataInfo.parentName}}</h3>
              <p>{{dataInfo.name}}</p>
            </div>
            <div v-else style="line-height:80px;color:#666;padding:0 15px;">未选择角色</div>
          </div>
          <div>
            <!-- 员工角色分配 -->
            <div v-show="activeName == 'third'">
              <div class="flex-spaceBetween" style="margin-top:15px">
                <div>
                  <label for style="color:#666">选择部门：</label>
                  <el-cascader
                    :options="departmentList"
                    v-model="searchForm.code"
                    @change="selectDepartment"
                    :props="{label:'textId',value:'id',checkStrictly: true ,expandTrigger:'hover'}"
                    :show-all-levels="false"
                    filterable
                    size="small"
                    ref="cascader2"
                  >
                    <template slot-scope="{ node, data }">
                      <div
                        @click="selectCheked('cascader2', $event)"
                      >{{ data.id }} -- {{ data.text }}</div>
                    </template>
                  </el-cascader>
                  <el-button type="primary" size="small" @click="searchFormFunc">查询</el-button>
                  <el-button type="primary" plain size="small" @click="resetForm">重置</el-button>
                </div>
                <el-button
                  type="primary"
                  class="pull-right"
                  size="small"
                  @click="addUser"
                  :disabled="$is_disabled(['editRole-add']) ? false : true"
                >新增</el-button>
              </div>
              <div class style="margin:15px 0">
                <el-table
                  :data="gridData"
                  border
                  header-row-class-name="thClassName"
                  v-loading="loading"
                  tooltip-effect="dark"
                >
                  <el-table-column label="序号" width="55" align="center">
                    <template slot-scope="scope">{{scope.$index+1+index}}</template>
                  </el-table-column>
                  <el-table-column label="用户名称" align="center" prop="username" width="200"></el-table-column>
                  <el-table-column label="所属部门" align="center" prop="depName"></el-table-column>
                  <el-table-column label="角色" align="center">
                    <template slot-scope="scope">{{createRole(scope.row.roles)}}</template>
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
                        type="warning"
                        @click="handleWrite(scope.row)"
                        :disabled="$is_disabled(['editRole-edit']) ? false : true"
                      >修改</el-button>
                      <el-button
                        size="mini"
                        type="danger"
                        @click="handleDelete(scope.row)"
                        v-if="scope.row.roles.length>0"
                        :disabled="$is_disabled(['editRole-delete']) ? false : true"
                      >删除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
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
            </div>
            <!-- 功能权限设置 -->
            <ul v-show="activeName == 'first'">
              <li class="clearboth">
                <el-button
                  type="success"
                  size="small"
                  class="pull-left"
                  @click="checkRole('all')"
                >全部功能</el-button>
                <!-- <el-radio v-model="radio" label="1" class="pull-left">全部功能</el-radio> -->
                <span class="pull-left">全部功能是指系统中包含的所有的功能，一般的系统管理员使用这个选项！</span>
              </li>
              <li class="clearboth">
                <el-button
                  type="success"
                  size="small"
                  class="pull-left"
                  @click="checkRole('query')"
                >一般利用</el-button>
                <!-- <el-radio v-model="radio" label="2" class="pull-left">一般利用</el-radio> -->
                <span class="pull-left">一般利用是指这个系统一般的查询人员，只需具有几个查询模块的功能！</span>
              </li>
              <li class="clearboth">
                <label
                  for
                  class="pull-left"
                  style="font-size:16px;color:#666;margin-right:7px"
                >功能菜单：</label>
                <!-- <el-radio v-model="radio" label="3" class="pull-left">自选功能</el-radio> -->
                <div class="pull-left tree">
                  <div style="margin-left:43px;text-algin:right">
                    <el-button size="mini" type="text" @click="append(null)">添加根节点</el-button>
                  </div>
                  <el-tree
                    :data="routesList"
                    :props="props"
                    show-checkbox
                    highlight-current
                    node-key="id"
                    ref="roletree"
                    :default-checked-keys="routesKeys"
                    v-loading="loading"
                    :check-strictly="strictly"
                    @check="strictly = false"
                    :default-expanded-keys="expandArr"
                  >
                    <!-- {{data.title+' -- '+ getType(data.type)}} -->
                    <span
                      class="custom-tree-node"
                      slot-scope="{ node, data }"
                      :title="data.title+'--'+ getType(data.type)"
                    >
                      <span>
                        <i :class="getTypeClass(data.type)"></i>
                        {{data.title+' -- '+ getType(data.type) }}
                      </span>
                      <span>
                        <el-button type="text" size="mini" @click="() => append(data)">添加</el-button>
                        <el-button type="text" size="mini" @click="() => edit(data)">修改</el-button>
                        <el-button type="text" size="mini" @click="() => putTop(node, data)">置顶</el-button>

                        <el-button type="text" size="mini" @click="() => remove(node, data)">删除</el-button>
                      </span>
                    </span>
                  </el-tree>
                </div>
              </li>
              <li>
                <el-button
                  @click="saveData"
                  type="primary"
                  :disabled="$is_disabled(['editRole-funcRole']) ? false : true"
                >保存</el-button>
              </li>
            </ul>
            <!-- 数据权限设置 -->
            <ul v-show="activeName == 'second'" v-loading="loading">
              <li>
                <el-radio label="9" v-model="dataPermission" style="width:150px">全部权限</el-radio>
                <span>全部权限是指系统中包含的所有数据权限</span>
              </li>
              <li>
                <el-radio label="2" v-model="dataPermission" style="width:150px">所在全宗数据权限</el-radio>
                <span>全部权限是指系统中本全宗的所有数据权限和管理权限，其他数据需要借阅</span>
              </li>
              <li>
                <el-radio label="3" v-model="dataPermission" style="width:150px">所在部门数据权限</el-radio>
                <span>全部权限是指系统中本部门的所有数据权限和管理权限，其他数据需要借阅</span>
              </li>
              <li class="clearboth">
                <el-radio label="1" v-model="dataPermission" style="width:150px;">自定义权限</el-radio>
                <span>自定义所有数据的权限</span>
                <div class="tree" style="margin:15px 0 0 184px">
                  <div v-show="dataPermission == '1'">
                    <div class="item">
                      <div class="title">
                        条目
                        <el-link type="success" @click="fieldDialogVisible = true">设置字段</el-link>
                      </div>
                      <div class="ctx">
                        <span>
                          <el-checkbox
                            label="全部列表"
                            :indeterminate="getIsindeterminate('list')"
                            v-model="permission.list"
                            @change="changePermissionList($event,'list')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('list')">设置数据范围</el-link>
                        </span>
                        <span>
                          <el-checkbox
                            label="全部卡片信息"
                            :indeterminate="getIsindeterminate('card')"
                            v-model="permission.card"
                            @change="changePermissionList($event,'card')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('card')">设置数据范围</el-link>
                        </span>
                      </div>
                    </div>
                    <div class="item">
                      <div class="title">原文</div>
                      <div class="ctx">
                        <span>
                          <el-checkbox
                            label="原文列表"
                            :indeterminate="getIsindeterminate('fileList')"
                            v-model="permission.fileList"
                            @change="changePermissionList($event,'fileList')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('fileList')">设置数据范围</el-link>
                        </span>

                        <span>
                          <el-checkbox
                            label="查看"
                            :indeterminate="getIsindeterminate('readFile')"
                            v-model="permission.readFile"
                            @change="changePermissionList($event,'readFile')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('readFile')">设置数据范围</el-link>
                        </span>
                        <span>
                          <el-checkbox
                            label="下载"
                            :indeterminate="getIsindeterminate('downloadFile')"
                            v-model="permission.downloadFile"
                            @change="changePermissionList($event,'downloadFile')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('downloadFile')">设置数据范围</el-link>
                        </span>
                      </div>
                    </div>
                    <div class="item">
                      <div class="title">管理</div>
                      <div class="ctx">
                        <span>
                          <el-checkbox
                            label="管理权限（原文管理和条目管理）"
                            :indeterminate="getIsindeterminate('manger')"
                            v-model="permission.manger"
                            @change="changePermissionList($event,'manger')"
                          ></el-checkbox>
                          <el-link type="success" @click="handleShowType('manger')">设置数据范围</el-link>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <el-button @click="savePermissionData" type="primary">保存</el-button>
                <!-- :disabled="$is_disabled(['editRole-funcRole']) ? false : true" -->
              </li>
            </ul>
          </div>
        </el-col>
      </el-col>
    </el-row>

    <el-dialog
      :title="isUpdate?'修改用户':'新增用户'"
      width="900px"
      custom-class="userdialog"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
    >
      <div class="content flex-wrap">
        <div class="content-right" ref="scollBox">
          <el-form :model="Form" ref="ruleForm" label-width="100px" :inline="true">
            <div id="adduser" class="item" v-if="!isUpdate">
              <el-form-item label="当前角色：" style="display:block">
                <el-input disabled v-model="dataInfo.name"></el-input>
              </el-form-item>
              <el-form-item label="选择部门：">
                <el-cascader
                  :options="departmentList"
                  v-model="addUserForm.code"
                  @change="selectDepartment"
                  :props="{label:'textId',value:'id',checkStrictly: true ,expandTrigger:'hover'}"
                  :show-all-levels="false"
                  filterable
                  size="small"
                  ref="cascader1"
                >
                  <template slot-scope="{ node, data }">
                    <div @click="selectCheked('cascader1', $event)">{{ data.id }} -- {{ data.text }}</div>
                  </template>
                </el-cascader>
                <el-button type="primary" size="small" @click="addUserSearch">查询</el-button>
                <el-button type="primary" size="small" @click="addUserReset">重置</el-button>
              </el-form-item>
              <el-form-item label="选择用户：">
                <el-transfer
                  v-model="addUserForm.userCodeKey"
                  @left-check-change="((a,b)=>{changeLeftTransfer(a,b,addUserForm.userCodeKey)})"
                  @right-check-change="((a,b)=>{changeRightTransfer(a,b,addUserForm.userCodeKey)})"
                  :data="addUserGridData"
                  :props="{
                    key: 'usercode',
                    label: 'username'
                  }"
                  :titles="['待添加', '已选']"
                ></el-transfer>
              </el-form-item>
            </div>
            <div id="roleMessage" class="item" v-if="isUpdate">
              <div class="title flex-spaceBetween">
                <span>用户角色信息</span>
              </div>
              <div class="content-wrap">
                <el-checkbox-group v-model="Form.roleList">
                  <el-form-item
                    style="margin-bottom:0;display:block"
                    label-width="120px"
                    v-for="item in roleGroupList"
                    :key="item.groupCode"
                    :label="item.groupName+'：'"
                    class="roleList"
                  >
                    <el-checkbox
                      :label="val.rolecode"
                      v-for="val in item.children"
                      :key="val.rolecode"
                    >{{val.name}}</el-checkbox>
                  </el-form-item>
                </el-checkbox-group>
              </div>
            </div>
          </el-form>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm') ">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加修改节点 -->
    <el-dialog
      :title="isUpdate?'修改节点':'新增节点'"
      :visible.sync="nodeDialogVisible"
      v-if="nodeDialogVisible"
      width="500px"
    >
      <el-form :model="nodeForm" label-width="80px" ref="nodeForm" :rules="nodeRules">
        <el-form-item label="当前id">
          <el-input v-model="nodeForm.id" disabled></el-input>
        </el-form-item>
        <el-form-item label="上一级id" prop="parentId">
          <el-input v-model="nodeForm.parentId"></el-input>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="nodeForm.title"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="index">
          <el-input v-model="nodeForm.index"></el-input>
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="nodeForm.type">
            <el-option label="左侧菜单" value="menu"></el-option>
            <el-option label="页面" value="page"></el-option>
            <el-option label="功能按钮" value="btn"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="图标" v-if="nodeForm.type == 'menu'">
          <el-input v-model="nodeForm.icon"></el-input>
        </el-form-item>
        <el-form-item label="资源权限">
          <el-input v-model="nodeForm.resourcePermission"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="nodeDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitNodeForm('nodeForm') ">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 设置字段 -->
    <el-dialog title="设置字段" :visible.sync="fieldDialogVisible" width="700px" custom-class="field">
      <div class="item">
        <div class="title">密级</div>
        <div class="ctx">
          <!-- <el-checkbox
            label="全部"
            :indeterminate="isIndeterminateSecurityClass"
            v-model="checkAllSecurityClass"
            @change="handleCheckAllSecurityClass"
          ></el-checkbox>-->
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="permissionForm.securityClass" @change="changeSecurityClass">
            <el-checkbox v-for="item in securityClass" :label="item" :key="item"></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="item">
        <div class="title">保密审查结论</div>
        <div class="ctx">
          <!-- <el-checkbox
            label="全部"
            :indeterminate="isIndeterminatebaomicc"
            v-model="checkAllbaomicc"
            @change="handleCheckAllbaomicc"
          ></el-checkbox>-->
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="permissionForm.baomicc" @change="changeBaomicc">
            <el-checkbox v-for="item in baomicc" :label="item" :key="item"></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fieldDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="fieldDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 设置数据范围 -->
    <el-dialog
      title="设置数据范围"
      :visible.sync="permissionDialogVisible"
      v-if="permissionDialogVisible"
      width="700px"
    >
      <el-tree
        :props="permissionProps"
        show-checkbox
        :data="dataPermissionTree"
        ref="dataPermissionTree"
        :highlight-current="true"
        node-key="catalogcode"
        :default-expanded-keys="['all']"
        :default-checked-keys="checkedDataPermissionKeys"
      >
        <span slot-scope="{node,data}">
          <i :class="data.type == 'catalog'?'el-icon-mobile':''"></i>
          {{data.text}}
        </span>
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="permissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPermissionForm ">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import { getRoleGroupList } from "@/common/js/util";
import {
  queryRoles,
  queryUsers,
  deleteUser,
  updateUser,
  roleAddUsers,
  getResourceTree,
  getUserResource,
  resourceAllocation,
  createResource,
  updateResource,
  deleteResource,
  topResource,
  createRoleDateResource,
  retrieveRoleDateResource
} from "@/api/user";
import { getAllCatalogTree } from "@/api/archiveCatalog";
export default {
  name: "editRole",
  data() {
    return {
      strictly: true, //树形数据父子是否不互相关联
      nodeDialogVisible: false,
      nodeForm: {
        //添加资源节点form
        id: "",
        parentId: "",
        title: "",
        index: "",
        type: "",
        icon: "",
        resourcePermission: ""
      },
      nodeRules: {
        parentId: [{ required: true, message: "请输入", trigger: "blur" }],
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        index: [{ required: true, message: "请输入地址", trigger: "blur" }],
        type: [{ required: true, message: "请选择类型", trigger: "change" }]
      },
      expandArr: [], //资源树默认展开的节点
      loading: false,
      activeName: "first",
      roleGroupList: [], //左侧树
      dataInfo: {}, //选择的角色
      highlight: true, //是否高亮
      isUpdate: false,
      dialogVisible: false,
      pageSize: 20,
      currentPage: 1,
      total: 0,
      gridData: [],
      addUserGridData: [], //新增用户时的数据
      addUserForm: {
        userCodeKey: [],
        code: "" //部门id
      },
      searchForm: {
        code: ""
      },
      Form: {
        roleList: []
      },
      defaultProps: {
        children: "children",
        label: "name"
      },
      props: {
        children: "childrens",
        label: "title"
      },
      routesList: [], //资源树
      routesKeys: [], //角色的权限id
      dataPermission: "",
      securityClass: ["绝密", "机密", "秘密", "公开"],
      baomicc: ["不公开", "依申请公开", "能公开"], //
      permissionForm: {
        //自定义数据权限form
        list: [], //条目列表
        card: [], //条目卡片
        fileList: [], //原文列表
        readFile: [], //原文查看
        downloadFile: [], //原文下载
        manger: [], //原文管理和条目管理
        securityClass: [],
        baomicc: []
      },
      permission: {
        //是否全选
        list: false,
        card: false, //条目卡片
        fileList: false, //原文列表
        readFile: false, //原文查看
        downloadFile: false, //原文下载
        manger: false //原文管理和条目管理
      },
      fieldDialogVisible: false, //设置字段变量
      checkAllSecurityClass: true, //密级全选
      isIndeterminateSecurityClass: false, //半选密级
      checkAllbaomicc: true, //保密审查结论
      isIndeterminatebaomicc: false, //
      permissionDialogVisible: false, //设置数据范围变量
      dataPermissionTree: [], //数据范围树
      permissionProps: {
        children: "children",
        label: "text"
      },
      checkedDataPermissionKeys: [], //默认选中的数据范围的keys
      allCatelogKeys: [], //全部实体分类的key
      activeWord: "",
      noCatelog: false
    };
  },
  methods: {
    handleShowType(word) {
      this.activeWord = word;
      this.checkedDataPermissionKeys = this.permissionForm[word];
      this.permissionDialogVisible = true;
    },
    getIsindeterminate(word) {
      //获取是否是半选中
      if (this.permissionForm[word].length) {
        if (this.permissionForm[word].length < this.allCatelogKeys.length) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    },
    savePermissionData() {
      //保存数据权限
      let params = {
        roleCode: this.dataInfo.rolecode,
        righttype: this.dataPermission
      };

      if (params.righttype == 1) {
        params.catalogs1 = this.permissionForm.list;
        params.catalogs2 = this.permissionForm.card;
        params.catalogs3 = this.permissionForm.readFile;
        params.catalogs4 = this.permissionForm.downloadFile;
        params.catalogs5 = this.permissionForm.manger;
        params.catalogs6 = this.permissionForm.fileList;
      }
      if (
        this.permissionForm.baomicc.length == 0 ||
        this.permissionForm.baomicc.length == 3
      ) {
        params.baomiccs = ["all"];
      } else {
        params.baomiccs = this.permissionForm.baomicc;
      }
      if (
        this.permissionForm.securityClass.length == 0 ||
        this.permissionForm.securityClass.length == 4
      ) {
        params.securityClasses = ["all"];
      } else {
        params.securityClasses = this.permissionForm.securityClass;
      }
      createRoleDateResource(params).then(res => {
        if (res.success) {
          this.$message.success("修改成功");
          this.initData();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    submitPermissionForm() {
      //保存设置的数据范围
      let checkedData = this.$refs.dataPermissionTree.getCheckedNodes();
      let checkedKeys = [];
      checkedData.forEach(item => {
        if (item.type == "catalog" || item.type == "noCatelog") {
          checkedKeys.push(item.catalogcode);
        }
      });
      if (
        checkedKeys.length > 0 &&
        checkedKeys.length >= this.allCatelogKeys.length
      ) {
        this.permission[this.activeWord] = true;
      } else {
        this.permission[this.activeWord] = false;
      }
      this.$set(this.permissionForm, this.activeWord, checkedKeys);
      this.permissionDialogVisible = false;
    },
    changePermissionList(val, word) {
      this.permission[word] = val;
      if (!val) {
        //如果取消全选 清空
        this.permissionForm[word] = [];
      } else {
        //否则赋值
        this.permissionForm[word] = this.allCatelogKeys;
      }
    },
    handleCheckAllSecurityClass(val) {
      //密级全选函数
      this.permissionForm.securityClass = val ? this.securityClass : [];
      this.isIndeterminateSecurityClass = false;
    },
    changeSecurityClass(value) {
      let checkedCount = value.length;
      this.checkAllSecurityClass = checkedCount === this.securityClass.length;
      this.isIndeterminateSecurityClass =
        checkedCount > 0 && checkedCount < this.securityClass.length;
    },
    handleCheckAllbaomicc(val) {
      //保密审查全选函数
      this.permissionForm.baomicc = val ? this.baomicc : [];
      this.isIndeterminatebaomicc = false;
    },
    changeBaomicc(value) {
      let checkedCount = value.length;
      this.checkAllbaomicc = checkedCount === this.baomicc.length;
      this.isIndeterminatebaomicc =
        checkedCount > 0 && checkedCount < this.baomicc.length;
    },
    append(data) {
      this.nodeDialogVisible = true;
      this.isUpdate = false;
      if (data) {
        this.nodeForm = {
          id: "",
          parentId: data.id,
          title: "",
          index: "",
          type: "",
          icon: "",
          resourcePermission: ""
        };
      } else {
        this.nodeForm = {
          id: "",
          parentId: "0",
          title: "",
          index: "",
          type: "",
          icon: "",
          resourcePermission: ""
        };
      }
    },
    edit(data) {
      this.nodeDialogVisible = true;
      this.isUpdate = true;
      this.nodeForm = {
        id: data.id,
        parentId: data.parentId,
        title: data.title,
        index: data.index,
        type: data.type,
        icon: data.icon,
        resourcePermission: data.resourcePermission
      };
    },
    remove(node, data) {
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteResource({ id: data.id }).then(res => {
            if (res.success) {
              this.$message.success("删除成功");
              this.$store.dispatch("user/getUserInfo");
              this.initData();
              this.expandArr = [data.parentId];
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    putTop(node, data) {
      this.$confirm("是否置顶", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          topResource({ id: data.id }).then(res => {
            if (res.success) {
              this.$message.success("置顶成功");
              this.$store.dispatch("user/getUserInfo");
              this.initData();
              this.expandArr = [data.parentId];
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    submitNodeForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            let params = {
              parentId: this.nodeForm.parentId,
              id: this.nodeForm.id,
              title: this.nodeForm.title,
              index: this.nodeForm.index,
              type: this.nodeForm.type,
              icon: this.nodeForm.icon,
              resourcePermission: this.nodeForm.resourcePermission
            };
            updateResource(params).then(res => {
              this.nodeDialogVisible = false;
              if (res.success) {
                this.$message.success("修改成功");
                this.$store.dispatch("user/getUserInfo");
                this.initData();
                this.expandArr = [this.nodeForm.parentId];
              } else {
                this.$message.error(res.msg);
              }
            });
          } else {
            let params = {
              parentId: this.nodeForm.parentId,
              title: this.nodeForm.title,
              index: this.nodeForm.index,
              type: this.nodeForm.type,
              resourcePermission: this.nodeForm.resourcePermission
            };
            createResource(params).then(res => {
              this.nodeDialogVisible = false;
              if (res.success) {
                this.$message.success("添加成功");
                this.$store.dispatch("user/getUserInfo");
                this.initData();
                this.expandArr = [this.nodeForm.parentId];
              } else {
                this.$message.error(res.msg);
              }
            });
          }
        } else {
          return false;
        }
      });
    },

    changeLeftTransfer(a, b, data) {
      data.push(...b);
    },
    changeRightTransfer(a, b, data) {
      b.forEach(item => {
        let index = data.findIndex(val => item == val);
        data.splice(index, 1);
      });
    },
    createRole(data) {
      let str = "";
      if (data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          str += data[i].NAME + "，";
        }
        return str.substring(0, str.length - 1);
      } else {
        return "";
      }
    },
    selectCheked(name, event) {
      //点击文字直接绑定
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    },

    handleNodeClick(data) {
      if (data.type == "D") {
        //说明是角色
        this.highlight = true;
        this.dataInfo = data;
        let params = {
          limit: this.pageSize,
          star: this.currentPage
        };
        this.searchFunc(params); //查询角色用户和资源列表
      } else {
        this.highlight = false;
      }
    },

    getType(type) {
      let typeName = "";
      switch (type) {
        case "menu":
          typeName = "左侧菜单";
          break;
        case "page":
          typeName = "页面";
          break;
        case "btn":
          typeName = "功能按钮";
          break;
        default:
          typeName = "未定义";
      }
      return typeName;
    },
    checkRole(word) {
      this.strictly = false;
      this.$nextTick(() => {
        if (word == "all") {
          this.$refs.roletree.setCheckedKeys(
            this.getAllNodeKeys(this.routesList)
          );
        } else if (word == "query") {
          this.$refs.roletree.setCheckedKeys(["4130"]);
        }
      });
    },
    getAllNodeKeys(data) {
      let arr = [];
      data.forEach(node => {
        arr.push(node.id);
      });
      return arr;
    },
    saveData() {
      let params = {
        rolecode: this.dataInfo.rolecode,
        ids: this.$refs.roletree
          .getHalfCheckedKeys()
          .concat(this.$refs.roletree.getCheckedKeys())
          .join(",")
      };
      resourceAllocation(params).then(res => {
        if (res.success) {
          this.$message.success("分配成功");
          this.strictly = true;
          this.$store.dispatch("user/getUserInfo");
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    selectDepartment(value) {
      //选择所属部门
      let code = "";
      if (value.length > 1) {
        code = value[value.length - 1];
      } else {
        code = value[0];
      }
      if (this.dialogVisible) {
        this.addUserForm.code = code;
        this.addUserSearch();
        return;
      }
      this.searchForm.code = code;
      this.searchFormFunc();
    },
    searchFormFunc() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    resetForm(formname) {
      this.searchForm = {
        code: ""
      };
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogVisible = true;
      this.Form = {
        usercode: row.usercode,
        username: row.username,
        roleList: row.roleList
      };
    },
    addUser() {
      if (!this.dataInfo.name) {
        this.$message.warning("请在左侧选择角色添加用户");
        return;
      }
      this.addUserSearch();
      this.dialogVisible = true;
      this.isUpdate = false;
    },
    addUserReset() {
      this.addUserForm.code = "";
      this.addUserSearch();
    },
    addUserSearch() {
      //添加用户时查询
      let params = {
        limit: 99999,
        star: 1,
        departmentCode: this.addUserForm.code
      };
      queryUsers(params)
        .then(res => {
          if (res.success) {
            this.addUserGridData = this.unique(
              res.data.list.concat(this.gridData)
            );
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {});
    },
    unique(arr) {
      const res = new Map();
      return arr.filter(
        arr => !res.has(arr.usercode) && res.set(arr.usercode, 1)
      );
    },
    submitForm(formName) {
      if (this.isUpdate) {
        //修改
        updateUser({
          usercode: this.Form.usercode,
          roleCodes: this.Form.roleList,
          username: this.Form.username
        })
          .then(res => {
            this.dialogVisible = false;
            if (res.success) {
              this.$message.success("修改成功");
              this.initData();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(res => {});
      } else {
        //添加用户
        roleAddUsers({
          rolecode: this.dataInfo.rolecode,
          userCodes: this.addUserForm.userCodeKey.join(",")
        }).then(res => {
          this.dialogVisible = false;
          if (res.success) {
            this.$message.success("操作成功");
            this.initData();
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    handleDelete(row) {
      //删除
      let roleList = row.roleList.splice(
        row.roleList.indexOf(this.dataInfo.rolecode),
        1
      );
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          updateUser({
            usercode: row.usercode,
            roleCodes: row.roleList,
            username: row.username
          })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    async searchFunc(params) {
      //查询
      this.routesKeys = [];
      params.departmentCode = this.searchForm.code;
      params.rolecode = this.dataInfo.rolecode || "";
      this.loading = true;
      this.addUserForm.userCodeKey = [];
      try {
        await queryUsers(params)
          .then(res => {
            if (res.success) {
              this.gridData = res.data.list || [];
              this.gridData.forEach(item => {
                item.roleList = [];
                item.roles.forEach(val => {
                  item.roleList.push(val.ROLECODE);
                });
                this.addUserForm.userCodeKey.push(item.usercode);
              });
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
          .catch(res => {});
        await getResourceTree().then(res => {
          this.loading = false;
          if (res.success) {
            this.routesList = res.data;
          } else {
            this.$message.error(res.msg);
          }
        });
        await getUserResource({ rolecode: this.dataInfo.rolecode })
          .then(res => {
            //查询角色资源
            this.routesKeys = res.data || [];
            this.loading = false;
            this.$forceUpdate();
          })
          .catch(() => {});
        await retrieveRoleDateResource({
          roleCode: this.dataInfo.rolecode
        }).then(res => {
          this.loading = false;
          //查询角色的数据权限
          //清空
          this.permissionForm = {
            list: [], //条目列表
            card: [], //条目卡片
            fileList: [], //原文列表
            readFile: [], //原文查看
            downloadFile: [], //原文下载
            manger: [], //原文管理和条目管理
            securityClass: ["绝密", "机密", "秘密", "公开"],
            baomicc: ["不公开", "依申请公开", "能公开"]
          };
          this.isIndeterminateSecurityClass = false;
          this.isIndeterminatebaomicc = false;
          this.checkAllbaomicc = true;
          this.checkAllSecurityClass = true;
          this.permission = {
            list: false, //条目列表
            card: false, //条目卡片
            fileList: false, //原文列表
            readFile: false, //原文查看
            downloadFile: false, //原文下载
            manger: false //原文管理和条目管理
          };
          if (res.success) {
            if (res.data) {
              this.dataPermission = res.data.righttype || "";
              if (this.dataPermission == 1) {
                //如果是自定义
                let result = res.data.systemUserRoleTableScopeBeans || [];

                let obj = JSON.parse(
                  result.filter(item => item.dataType == 1)[0].remark
                ); //字段
                if (obj.securityClass == "all") {
                  //设置密级
                  this.permissionForm.securityClass = [];
                } else {
                  this.permissionForm.securityClass = obj.securityClass.split(
                    "|"
                  );
                }
                this.checkAllSecurityClass =
                  this.permissionForm.securityClass.length ==
                  this.securityClass.length
                    ? true
                    : false;
                if (this.permissionForm.securityClass.length) {
                  this.isIndeterminateSecurityClass =
                    this.permissionForm.securityClass.length <
                    this.securityClass.length
                      ? true
                      : false;
                } else {
                  this.isIndeterminateSecurityClass = false;
                }

                if (obj.baomiccs == "all") {
                  //设置保密审查结论
                  this.permissionForm.baomicc = [];
                } else {
                  this.permissionForm.baomicc = obj.baomiccs.split("|");
                }
                this.checkAllbaomicc =
                  this.permissionForm.baomicc.length == this.baomicc.length
                    ? true
                    : false;
                if (this.permissionForm.baomicc.length) {
                  this.isIndeterminatebaomicc =
                    this.permissionForm.baomicc.length < this.baomicc.length
                      ? true
                      : false;
                } else {
                  this.isIndeterminatebaomicc = false;
                }

                result.forEach(val => {
                  if (val.dataType == 1) {
                    //条目列表
                    if (val.dataCatalog) {
                      this.permissionForm.list = val.dataCatalog.split("|");
                    } else {
                      this.permissionForm.list = [];
                    }
                    this.permission.list =
                      this.permissionForm.list.length > 0 ? true : false;
                  } else if (val.dataType == 2) {
                    //条目卡片
                    if (val.dataCatalog) {
                      this.permissionForm.card = val.dataCatalog.split("|");
                    } else {
                      this.permissionForm.card = [];
                    }
                    this.permission.card =
                      this.permissionForm.card.length > 0 ? true : false;
                  } else if (val.dataType == 3) {
                    //原文查看
                    if (val.dataCatalog) {
                      this.permissionForm.readFile = val.dataCatalog.split("|");
                    } else {
                      this.permissionForm.readFile = [];
                    }
                    this.permission.readFile =
                      this.permissionForm.readFile.length > 0 ? true : false;
                  } else if (val.dataType == 4) {
                    //原文下载
                    if (val.dataCatalog) {
                      this.permissionForm.downloadFile = val.dataCatalog.split(
                        "|"
                      );
                    } else {
                      this.permissionForm.downloadFile = [];
                    }
                    this.permission.downloadFile =
                      this.permissionForm.downloadFile.length > 0
                        ? true
                        : false;
                  } else if (val.dataType == 5) {
                    //管理
                    if (val.dataCatalog) {
                      this.permissionForm.manger = val.dataCatalog.split("|");
                    } else {
                      this.permissionForm.manger = [];
                    }
                    this.permission.manger =
                      this.permissionForm.manger.length > 0 ? true : false;
                  } else if (val.dataType == 6) {
                    //原文列表
                    if (val.dataCatalog) {
                      this.permissionForm.fileList = val.dataCatalog.split("|");
                    } else {
                      this.permissionForm.fileList = [];
                    }
                    this.permission.fileList =
                      this.permissionForm.fileList.length > 0 ? true : false;
                  }
                });
              }
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      } catch (error) {}
    },
    initData() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    getActiveDataInfo(code) {
      this.$nextTick(() => {
        this.$refs.tree.setCurrentKey(code);
      });
      for (let i = 0; i < this.roleGroupList.length; i++) {
        for (let j = 0; j < this.roleGroupList[i].children.length; j++) {
          if (this.roleGroupList[i].children[j].rolecode == code) {
            this.dataInfo = this.roleGroupList[i].children[j];
            return;
          }
        }
      }
    },
    getTypeClass(type) {
      if (type == "menu") {
        return "fa fa-align-left";
      } else if (type == "page") {
        return "el-icon-document";
      } else {
        return "fa fa-dot-circle-o";
      }
    },
    handleAddProp(tree) {
      for (let i = 0; i < tree.length; i++) {
        if (!tree[i].catalogcode) {
          tree[i].catalogcode = tree[i].id;
        }
        if (tree[i].childwidth) {
          tree[i].type = "catalog";
        }
        if (tree[i].children && tree[i].children.length > 0) {
          this.handleAddProp(tree[i].children);
        }
      }
      return tree;
    },
    getKeysfromField(tree, val, arr) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].type == val) {
          arr.push(tree[i].catalogcode);
        }
        if (tree[i].hasOwnProperty("children") && tree[i].children.length > 0) {
          this.getKeysfromField(tree[i].children, val, arr);
        }
      }
      return arr;
    }
  },
  async mounted() {
    this.$store.dispatch("tree/departmentTree"); //获取部门树
    try {
      await queryRoles({
        //获取左侧角色的导航栏
        limit: 1000,
        star: 1
      }).then(res => {
        let list = res.data.list;
        let activeCode = this.$route.query.code; //角色id
        this.roleGroupList = getRoleGroupList(list);
        this.getActiveDataInfo(activeCode);
      });
      //获取数据范围树
      await getAllCatalogTree().then(res => {
        if (res.success) {
          if (res.data.length > 0) {
            let list = this.handleAddProp(res.data);
            this.dataPermissionTree = [
              {
                text: "全部分类范围",
                type: "ad",
                id: "all",
                catalogcode: "all",
                children: list || []
              }
            ];
            this.dataPermissionTree.push({
              text: "未分类",
              type: "noCatelog",
              id: "noCatelog",
              catalogcode: "noCatelog",
              children: []
            });
            let arr = this.getKeysfromField(
              this.dataPermissionTree,
              "catalog",
              []
            );
            this.allCatelogKeys = arr.concat("noCatelog");
          }
        } else {
          this.$message.error(res.msg);
        }
      });
      await this.initData();
    } catch (error) {}
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    },
    departmentList() {
      return this.$store.getters.departmentTree;
    }
  }
};
</script>
<style lang="scss" scoped>
section {
  overflow: hidden;
  header {
    margin: 10px 20px 0 20px;
  }
  .content {
    height: 100%;
    .contianer-left {
      height: 100%;
      padding: 15px 0;
    }
    .contianer-right {
      border-left: 1px solid #eee;
      // min-height: 500px;
      padding: 15px 15px 100px 15px;
      .info {
        height: 80px;
        background-color: #f3f3f3;
        div {
          padding: 15px;
          line-height: 28px;
          h3,
          p {
            margin: 0;
            color: #666;
          }
        }
      }
      ul li {
        list-style: none;
        margin-bottom: 20px;
        button {
          margin-right: 15px;
        }
        > span {
          color: #666;
          line-height: 32px;
        }
        .tree {
          width: 60%;
          > span {
            color: #666;
            margin-bottom: 20px;
            display: block;
          }
          .custom-tree-node {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 14px;
            padding-right: 8px;
          }
          .item {
            margin-bottom: 8px;
            .title {
              padding-bottom: 7px;
              color: #666;
              border-bottom: 1px solid #eee;
              font-size: 16px;
              .el-link {
                margin-left: 15px;
                vertical-align: bottom;
              }
            }
            .ctx {
              padding: 8px 10px;
              > span {
                margin-right: 15px;
              }
              .el-checkbox {
                display: inline-block !important;
                margin-right: 8px;
              }
              .el-link {
                vertical-align: bottom;
              }
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.nobot {
  .el-tabs__header {
    margin-bottom: 0;
  }
}

.roleList {
  .el-tree-node__content {
    height: 40px;
  }
}
.userdialog {
  .el-dialog__header {
    background-color: #f2f2f2;
  }
  .el-dialog__body {
    margin: 0;
    padding: 0;
    .content {
      border-bottom: 2px solid #eee;
    }
    .content-right {
      flex: 1;
      overflow-y: auto;
      padding: 15px 15px 100px;
      .item {
        .content-wrap {
          padding: 15px 10px;

          .el-form-item__content {
            width: 300px;
            .el-switch__label--left.is-active {
              position: relative;
              left: 18px;
            }
            .el-switch__label--left {
              margin-right: -28px;
            }
            .el-switch__label--right {
              margin-left: 10px;
            }
          }
          .roleList {
            display: flex;
            flex-wrap: wrap;
            .el-form-item__content {
              width: inherit;
              .el-checkbox {
                display: inline-block !important;
              }
            }
          }
        }
      }
      .title {
        line-height: 50px;
        padding: 0 15px;
        border-bottom: 1px solid #eee;
        span:first-child {
          color: #333;
        }
        span:last-child {
          color: #999;
        }
        em {
          color: #ff0036;
          margin: 0 3px;
        }
      }
    }
  }
}
.field {
  .el-dialog__body {
    padding: 20px 20px;
  }
  .item {
    margin-bottom: 8px;
    .title {
      padding-bottom: 7px;
      color: #666;
      border-bottom: 1px solid #eee;
      font-size: 16px;
      .el-link {
        margin-left: 15px;
        vertical-align: bottom;
      }
    }
    .ctx {
      padding: 8px 10px;
      > span {
        margin-right: 15px;
      }
      .el-checkbox {
        display: inline-block !important;
      }
      .el-link {
        vertical-align: bottom;
      }
    }
  }
}
</style>
