<template>
  <!-- 角色管理 -->
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>角色名称：</label>
          <el-input
            v-model="searchForm.name"
            size="small"
            @keydown.enter.native="search"
            placeholder="请输入角色名"
          ></el-input>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div>
          <el-button
            size="small"
            type="primary"
            @click="addData"
            :disabled="$is_disabled(['rolePage-add']) ? false : true"
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
        >
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column label="角色名称" align="left" prop="name" width="250px"></el-table-column>
          <el-table-column label="角色分类" align="left" prop="groupName" width="250px">
            <template slot-scope="scope">{{getRoleTypeName(scope.row.category)}}</template>
          </el-table-column>
          <el-table-column label="角色描述" align="left" prop="description"></el-table-column>、
          <el-table-column property="set" label="操作" align="center" width="300" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['rolePage-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="success"
                @click="handleRole(scope.row)"
                :disabled="$is_disabled(['rolePage-role']) ? false : true"
              >权限管理</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="$is_disabled(['rolePage-delete']) ? false : true"
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
    </el-col>
    <!-- 新增角色修改 -->
    <el-dialog
      :title="isUpdate? '修改角色':'新增角色'"
      :visible.sync="dialogVisible"
      width="600px"
      v-if="dialogVisible"
    >
      <el-form :rules="rules" :model="Form" ref="ruleForm" label-width="100px">
        <el-form-item label="角色分类：" prop="category">
          <el-select v-model="Form.category">
            <el-option
              :label="val.groupName"
              :value="val.groupCode"
              v-for="(val,key) in roleGroupDataName"
              :key="key"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色名称：" prop="name">
          <el-input v-model="Form.name"></el-input>
        </el-form-item>
        <el-form-item label="角色描述：">
          <el-input v-model="Form.description" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="继承：">
          <el-select v-model="Form.role" placeholder="请选择继承的角色">
            <el-option-group
              v-for="group in roleGroupList"
              :key="group.groupCode"
              :label="group.groupName"
            >
              <el-option
                v-for="item in group.children"
                :key="item.rolecode"
                :label="item.name"
                :value="item.rolecode"
                :disabled="item.rolecode == rolecode"
              ></el-option>
            </el-option-group>
          </el-select>
          <span style="margin-left:8px;">的权限</span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm') ">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  getRoleGroupList,
  getRoleType,
  roleGroupDataName
} from "@/common/js/util";
import { addRole, deleteRole, queryRoles, updateRole } from "@/api/user";
export default {
  data() {
    return {
      roleGroupDataName,
      dialogVisible: false,
      rolecode: "",
      isUpdate: false,
      searchForm: {
        name: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      Form: {
        name: "",
        description: "",
        category: "",
        role: ""
      },
      rules: {
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        category: [{ required: true, message: "请选择", trigger: "change" }]
      },
      loading: false,
      roleGroupList: [],
      gridData: [] //渲染表格数据
    };
  },

  methods: {
    getRoleTypeName(type) {
      return getRoleType(type);
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
    addData() {
      //添加
      this.isUpdate = false;
      this.dialogVisible = true;
      this.Form = {
        name: "",
        description: ""
      };
    },
    handleRole(row) {
      this.$router.push({
        path: "/editRole",
        query: {
          code: row.rolecode
        }
      });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              name: this.Form.name,
              rolecode: this.rolecode,
              category: this.Form.category,
              description: this.Form.description,
              functioncollection: this.Form.role
            };
            updateRole(params)
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
            //
            let params = {
              name: this.Form.name,
              description: this.Form.description,
              category: this.Form.category,
              functioncollection: this.Form.role
            };
            addRole(params)
              .then(res => {
                this.dialogVisible = false;
                if (res.success) {
                  this.$message.success("添加成功");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          }
        } else {
          return false;
        }
      });
    },
    search() {
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        name: ""
      };
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogVisible = true;
      this.rolecode = row.rolecode;
      this.Form = {
        code: row.rolecode,
        name: row.name,
        category: row.category,
        description: row.description,
        role: row.functioncollection
      };
    },
    handleDelete(row) {
      //删除
      this.rolecode = row.rolecode;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteRole({
            rolecode: this.rolecode
          })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {
              this.$message.error(res.msg);
            });
        })
        .catch(() => {});
    },

    searchFunc(params) {
      params.name = this.searchForm.name;
      this.loading = true;
      queryRoles(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.roleGroupList = getRoleGroupList(this.gridData);
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
    },
    initData() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    }
  },
  mounted() {
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>
<style scoped>
</style>