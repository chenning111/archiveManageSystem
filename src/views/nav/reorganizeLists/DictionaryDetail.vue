
<template>
  <!-- // 字典详情 -->
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>项目名称：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入名称"
            v-model="searchForm.name"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>编码代号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入代号"
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
            :disabled="$is_disabled(['dictionaryDetail-add']) ? false : true"
          >新增</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          ref="tableBox"
          @sort-change="sortsFn"
        >
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column
            label="类目名称"
            align="center"
            :show-overflow-tooltip="true"
            prop="categoryName"
          ></el-table-column>
          <el-table-column
            label="项目名称"
            align="center"
            :show-overflow-tooltip="true"
            prop="name"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            label="编码代号"
            align="center"
            :show-overflow-tooltip="true"
            prop="code"
            sortable="custom"
          ></el-table-column>
          <el-table-column
            label="显示顺序"
            align="center"
            :show-overflow-tooltip="true"
            prop="serial"
            sortable="custom"
          ></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['dictionaryDetail-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="$is_disabled(['dictionaryDetail-delete']) ? false : true"
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
    <!-- 新增或修改-->
    <el-dialog :visible.sync="dialogVisible" :title="isUpdate? '修改字典':'新增字典'">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="编码代号" prop="code">
          <el-input v-model="Form.code"></el-input>
        </el-form-item>
        <el-form-item label="项名称" prop="name">
          <el-input v-model="Form.name"></el-input>
        </el-form-item>
        <el-form-item label="项注释">
          <el-input v-model="Form.remark"></el-input>
        </el-form-item>
        <el-form-item label="项目级别">
          <span v-text="Form.type==0?'系统级别':'用户级别'" style="margin-left:15px;"></span>
        </el-form-item>
        <el-form-item label="显示顺序" prop="serial">
          <el-input v-model.number="Form.serial"></el-input>
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
  selecSystemDictionary,
  addSystemDictionary,
  updateSystemDictionary,
  deleteSystemDictionary
} from "@/api/dictionary";
import sorts from "@/mixins/sort";
export default {
  mixins: [sorts],
  data() {
    var validatePass = (rule, value, callback) => {
      if (this.dictionarycatalogcode == "catalogCode") {
        let reg = /^[A-Z,.]+$/;
        if (!reg.test(value)) {
          callback(new Error("请输入大写字母"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      dictionarycatalogcode: "", //目录编号
      dictionarycode: "", //字典编号
      isUpdate: false,
      searchForm: {
        code: "",
        name: "",
        remark: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      Form: {
        words: ""
      },
      rules: {
        code: [
          { required: true, message: "请输入", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ],
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        remark: [{ required: true, message: "请输入", trigger: "blur" }],
        serial: [
          { required: true, message: "请输入" },
          { type: "number", message: "请输入数字" }
        ]
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
      this.loading = true;
      this.initData();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.loading = true;
      this.initData();
    },
    addData() {
      //添加
      this.isUpdate = false;
      this.dialogVisible = true;
      this.Form = {
        code: "",
        name: "",
        type: 1,
        serial: "",
        remark: ""
      };
    },
    sortsFn({ column, prop, order }) {
      this.handleSort({ column, prop, order }, this.initData);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              code: this.Form.code,
              name: this.Form.name,
              type: this.Form.type,
              remark: this.Form.remark,
              serial: this.Form.serial,
              dictionarycode: this.dictionarycode,
              dictionarycatalogcode: this.dictionarycatalogcode
            };
            this.sorts = {};
            updateSystemDictionary(params)
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
              code: this.Form.code,
              name: this.Form.name,
              type: this.Form.type,
              remark: this.Form.remark,
              serial: this.Form.serial,
              dictionarycatalogcode: this.dictionarycatalogcode
            };
            this.sorts = {};
            addSystemDictionary(params)
              .then(res => {
                this.dialogVisible = false;
                if (res.success) {
                  this.$message.success("添加成功");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {
                this.$message.error(res.msg);
              });
          }
        } else {
          return false;
        }
      });
    },
    search() {
      let params = {
        limit: 50,
        star: 1,
        name: this.searchForm.name,
        code: this.searchForm.code,
        dictionarycatalogcode: this.dictionarycatalogcode
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        code: "",
        name: "",
        remark: ""
      };
      this.sorts = {};
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogVisible = true;
      this.dictionarycode = row.dictionarycode;
      this.Form = {
        code: row.code,
        name: row.name,
        type: row.type,
        remark: row.remark,
        serial: row.serial
      };
    },
    handleDelete(row) {
      //删除
      this.dictionarycode = row.dictionarycode;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.sorts = {};
          deleteSystemDictionary({
            dictionarycode: this.dictionarycode
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
      this.loading = true;
      params.sorts = this.sorts;
      selecSystemDictionary(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.setSortTable();
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
          this.$message.error(res.msg);
        });
    },
    initData() {
      this.dictionarycatalogcode = this.$route.query.code;
      let params = {
        limit: this.pageSize,
        star: this.currentPage,
        dictionarycatalogcode: this.dictionarycatalogcode
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
