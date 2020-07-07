<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>全宗号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入全宗号"
            v-model="searchForm.NO"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>全宗名称：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入全宗名称"
            v-model="searchForm.NAME"
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
          <!-- <el-button
            size="small"
            type="primary"
            @click="addData"
            :disabled="$is_disabled(['fonds-add']) ? false : true"
          >新增</el-button>-->
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
            <template slot-scope="scope">{{scope.$index+1}}</template>
          </el-table-column>
          <el-table-column label="全宗号" align="center" :show-overflow-tooltip="true" prop="NO"></el-table-column>
          <el-table-column label="全宗名称" align="center" :show-overflow-tooltip="true" prop="NAME"></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="300" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['fonds-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="$is_disabled(['fonds-delete']) ? false : true"
              >删除</el-button>
              <el-button
                size="mini"
                type="primary"
                @click="handleAdd(scope.row)"
                :disabled="$is_disabled(['fonds-addDepartment']) ? false : true"
              >添加部门</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>

    <!-- 修改 增加-->
    <el-dialog
      :title="isUpdate? '修改全宗':'添加全宗'"
      :visible.sync="dialogFormVisible"
      width="600px"
      v-if="dialogFormVisible"
    >
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="100px">
        <el-form-item label="全宗号" prop="NO">
          <el-input v-model="Form.NO"></el-input>
        </el-form-item>
        <el-form-item label="全宗名称" prop="NAME">
          <el-input v-model="Form.NAME"></el-input>
        </el-form-item>
        <el-form-item label="GDC编码" prop="UNIT">
          <el-input v-model="Form.UNIT"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
    <!-- 添加部门 -->
    <el-dialog title="添加部门" :visible.sync="dialogFormVisible1" v-if="dialogFormVisible1">
      <el-checkbox label="全选" @change="checkAll" v-model="allCheck" style="margin-left:24px"></el-checkbox>
      <el-tree
        :props="props"
        class="overAuto"
        show-checkbox
        :data="departmentStr"
        ref="departmentTree"
        :highlight-current="true"
        node-key="id"
        :default-checked-keys="defaultChecked"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button type="primary" @click="addDepartment">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  addSystemFonds,
  deleteSystemFonds,
  updateSystemFonds,
  addSystemFondsDepartment
} from "@/api/fondsNo";
import { getSystemFondsDepartment } from "@/api/department";

export default {
  name: "fonds",
  data() {
    return {
      allCheck: false,
      dialogFormVisible: false,
      dialogFormVisible1: false,
      isUpdate: false,
      defaultChecked: [],
      props: {
        label: "text",
        children: "children"
      },
      searchForm: {
        //搜索
        NO: "",
        NAME: "",
        UNIT: ""
      },
      Form: {
        //添加
        NO: "",
        NAME: "",
        UNIT: ""
      },
      fondsCode: "",
      rules: {
        NO: [{ required: true, message: "请输入", trigger: "blur" }],
        NAME: [{ required: true, message: "请输入", trigger: "blur" }],
        UNIT: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      loading: false,
      gridData: [], //渲染表格数据
      oldList: [] //初始化数据,
    };
  },

  methods: {
    checkAll() {
      if (this.allCheck) {
        this.$refs.departmentTree.setCheckedNodes(this.departmentStr);
      } else {
        this.$refs.departmentTree.setCheckedKeys([]);
      }
    },
    addDepartment() {
      let departmentList = this.$refs.departmentTree.getCheckedNodes();
      let departmentListCode = [];
      if (departmentList.length > 0) {
        departmentList.forEach(item => {
          departmentListCode.push(item.id);
        });
      }
      let params = {
        departments: departmentListCode,
        fondscode: this.fondsCode
      };
      addSystemFondsDepartment(params)
        .then(res => {
          this.dialogFormVisible1 = false;
          if (res.success) {
            this.$message.success("添加部门成功");
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    submitForm(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //修改
            let params = {
              no: this.Form.NO,
              name: this.Form.NAME,
              unit: this.Form.UNIT,
              fondscode: this.fondsCode
            };
            updateSystemFonds(params)
              .then(res => {
                this.dialogFormVisible = false;
                if (res.success) {
                  this.$message.success("修改成功");
                  sessionStorage.removeItem("fondsList");
                  this.getList();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //添加
            let params = {
              no: this.Form.NO,
              name: this.Form.NAME,
              unit: this.Form.UNIT
            };
            addSystemFonds(params)
              .then(res => {
                this.dialogFormVisible = false;
                if (res.success) {
                  this.$message.success("新增成功");
                  sessionStorage.removeItem("fondsList");
                  this.getList();
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

    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogFormVisible = true;
      this.Form = {
        NO: row.NO,
        NAME: row.NAME,
        UNIT: row.UNIT
      };
      this.fondsCode = row.FONDSCODE;
    },
    handleDelete(row) {
      //删除
      this.$confirm("是否删除当前全宗", "提示", {
        type: "warning"
      })
        .then(() => {
          deleteSystemFonds({ fondscode: row.FONDSCODE })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                sessionStorage.removeItem("fondsList");
                this.getList();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    addData() {
      //添加全宗
      this.isUpdate = false;
      this.dialogFormVisible = true;
      this.Form = {
        NO: "",
        NAME: "",
        UNIT: ""
      };
    },
    handleAdd(row) {
      //添加部门
      this.fondsCode = row.FONDSCODE;
      this.defaultChecked = [];

      getSystemFondsDepartment({ fondscode: row.FONDSCODE }).then(res => {
        this.dialogFormVisible1 = true;
        if (res.success && res.data) {
          if (res.data.length > 0) {
            res.data.forEach(item => {
              this.defaultChecked.push(item.departmentcode);
            });

            this.$forceUpdate();
          }
        }
      });
    },
    search() {
      this.gridData = this.oldList;
      if (Object.keys(this.searchForm).length > 0) {
        Object.keys(this.searchForm).forEach(val => {
          let value = this.searchForm[val];
          if (value) {
            this.gridData = this.gridData.filter(item => {
              if (item[val].indexOf(value) > -1) {
                return true;
              }
            });
          }
        });
      }
    },
    reset() {
      this.searchForm = {
        NO: "",
        NAME: "",
        UNIT: ""
      };
      this.gridData = this.oldList;
    },
    async getList() {
      this.loading = true;
      await this.$store.dispatch("fondsCatalog/getFondsList").then(res => {
        this.loading = false;
        this.oldList = res;
        this.gridData = res;
      });
    }
  },
  async mounted() {
    this.$store.dispatch("tree/departmentTree");
    this.getList();
  },
  computed: {
    departmentStr() {
      return this.$store.getters.departmentTree;
    }
  }
};
</script>



<style lang="scss">
.overAuto {
  max-height: 400px;
  overflow: auto;
}
</style>
