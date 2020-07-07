<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>类目名称：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入名称"
            v-model="searchForm.name"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>类目编号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入编号"
            v-model="searchForm.code"
            @keyup.enter.native="search"
          ></el-input>
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
            :disabled="$is_disabled(['dictionary-add']) ? false : true"
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

          <el-table-column label="类目名称" align="center" :show-overflow-tooltip="true" prop="name"></el-table-column>
          <el-table-column
            label="类目编号"
            align="center"
            :show-overflow-tooltip="true"
            prop="dictionarycatalogcode"
          ></el-table-column>
          <el-table-column label="类目级别" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span v-text="scope.row.type==0?'系统级别':'用户级别'"></span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="250" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['dictionary-edit']) ? false : true"
                v-if="scope.row.type != 0"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                v-if="scope.row.type != 0"
                :disabled="$is_disabled(['dictionary-delete']) ? false : true"
              >删除</el-button>
              <el-button size="mini" type="success" @click="handleWithdraw(scope.row)">明细</el-button>
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
    <!-- 新增或修改-->
    <el-dialog :visible.sync="dialogVisible" :title="isUpdate? '修改字典':'新增字典'" v-if="dialogVisible">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="类目编号" prop="code">
          <el-input v-model="Form.code" :disabled="isUpdate?true:false"></el-input>
        </el-form-item>
        <el-form-item label="类目名称" prop="name">
          <el-input v-model="Form.name"></el-input>
        </el-form-item>
        <el-form-item label="项目级别" prop="type">
          <span v-text="Form.type==0?'系统级别':'用户级别'" style="margin-left:15px;"></span>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  selecSystemDictionaryCatalog,
  addSystemDictionaryCatalog,
  updateSystemDictionaryCatalog,
  deleteSystemDictionaryCatalog
} from "@/api/dictionary";
export default {
  data() {
    return {
      dialogVisible: false,
      dictionarycatalogcode: "",
      isUpdate: false,
      searchForm: {
        code: "",
        name: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      Form: {
        code: "",
        name: "",
        type: ""
      },
      rules: {
        code: [{ required: true, message: "请输入", trigger: "blur" }],
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        type: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      loading: false,
      gridData: [] //渲染表格数据
    };
  },

  methods: {
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
        code: "",
        name: "",
        type: 1
      };
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              name: this.Form.name,
              dictionarycatalogcode: this.dictionarycatalogcode
            };
            updateSystemDictionaryCatalog(params)
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
              dictionarycatalogcode: this.Form.code,
              name: this.Form.name,
              type: this.Form.type
            };
            addSystemDictionaryCatalog(params)
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
        code: "",
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
      this.dictionarycatalogcode = row.dictionarycatalogcode;
      this.Form = {
        code: row.dictionarycatalogcode,
        name: row.name,
        type: row.type
      };
    },
    handleDelete(row) {
      //删除
      this.dictionarycatalogcode = row.dictionarycatalogcode;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteSystemDictionaryCatalog({
            dictionarycatalogcode: this.dictionarycatalogcode
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
    handleWithdraw(row) {
      this.$router.push({
        path: "/dictionaryDetail",
        query: {
          code: row.dictionarycatalogcode
        }
      });
    },
    searchFunc(params) {
      params.dictionarycatalogcode = this.searchForm.code;
      params.name = this.searchForm.name;
      this.loading = true;
      selecSystemDictionaryCatalog(params)
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

