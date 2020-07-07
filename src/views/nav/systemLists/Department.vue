<template>
  <!-- 组织机构 -->
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>内容：</label>
          <el-input
            size="small"
            type="text"
            placeholder="名称/编号"
            v-model="searchForm.text"
            @keyup.enter.native="search"
          ></el-input>
        </div>

        <div class="item">
          <label for>机构代号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入"
            v-model="searchForm.organizationCode"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" style="margin-top:-15px">
        <div class="item">
          <label for>设立时间：</label>
          <el-date-picker
            v-model="searchForm.setupDate"
            type="daterange"
            align="left"
            size="small"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="search"
          ></el-date-picker>
        </div>
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
            :disabled="$is_disabled(['department-add']) ? false : true"
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
          :row-key="isSearch?'':'id'"
          :row-class-name="getRowClassName"
          default-expand-all
        >
          <el-table-column align="center" type="index" width="70" label="序号"></el-table-column>
          <el-table-column label="单位（机构）名称" align="left" prop="text" width="200px"></el-table-column>
          <el-table-column label="单位（机构）编号" prop="id"></el-table-column>
          <el-table-column label="机构代号" align="center" width="200px">
            <template slot-scope="scope">
              <span>{{scope.row.li_attr.organizationCode||scope.row.li_attr.organizationcode}}</span>
            </template>
          </el-table-column>
          <el-table-column label="设立时间" align="center">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.li_attr.setupDate||scope.row.li_attr.setupdate).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column label="注销时间" align="center">
            <template slot-scope="scope">
              <span>{{ new Date(scope.row.li_attr.logoutDate||scope.row.li_attr.logoutdate).format("yyyy-MM-dd")}}</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="300" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['department-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="$is_disabled(['department-delete']) ? false : true"
              >删除</el-button>
              <el-button
                size="mini"
                type="primary"
                @click="add(scope.row)"
                :disabled="$is_disabled(['department-add']) ? false : true"
              >添加子栏目</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>
    <el-dialog
      :title="isUpdate? '修改机构':'添加机构'"
      :visible.sync="dialogVisible"
      width="700px"
      v-if="dialogVisible"
    >
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="110px">
        <el-form-item label="单位编号" prop="id">
          <el-input v-model="Form.id" :disabled="isUpdate ? true :false"></el-input>
        </el-form-item>

        <el-form-item label="单位名称" prop="text">
          <el-input v-model="Form.text"></el-input>
        </el-form-item>
        <el-form-item label="机构代号">
          <el-input v-model="Form.organizationCode" ref="warnInput"></el-input>
        </el-form-item>
        <el-form-item label="设立时间" prop="setupDate">
          <el-date-picker
            v-model="Form.setupDate "
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="注销时间" prop="logoutDate">
          <el-date-picker
            v-model="Form.logoutDate "
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="上级单位编号">
          <el-input v-model="Form.parentCode" disabled></el-input>
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
  addDepartment,
  deleteDepartment,
  updateDepartment,
  selectDepartment
} from "@/api/department";
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      let reg = /^[0-9,A-Z,.]+$/;
      if (this.Form.parentCode != "00000000") {
        // let isTrue = this.compareId();

        if (value == this.Form.parentCode) {
          callback(new Error("单位编号不能和上级单位编号相同"));
        } else {
          callback();
        }
        // else if (!isTrue) {
        //   callback(new Error("当前单位编号前缀须和上一级单位编号一致"));
        // }
      } else if (!reg.test(value)) {
        callback(new Error("请输入大写字母或者数字"));
      } else {
        callback();
      }
    };
    var timeCompare = (rule, value, callback) => {
      if (this.Form.setupDate < this.Form.logoutDate) {
        callback();
      } else {
        callback(new Error("请设置正确的注销时间"));
      }
    };

    return {
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
      dialogVisible: false,
      isUpdate: false, //是否是修改
      isAddRoot: false, //是否是添加第一级实体分类 因为第一级实力分类的上级分类不存在
      gridData: [],
      departmentCode: "",
      loading: false,
      gridData: [],
      rules: {
        id: [
          { required: true, message: "请输入", trigger: "blur" },
          { validator: validatePass, trigger: "blur" }
        ],
        text: [{ required: true, message: "请输入", trigger: "blur" }],
        logoutDate: [
          { validator: timeCompare, trigger: "change" },
          { required: true, message: "请选择", trigger: "change" }
        ],
        setupDate: [{ required: true, message: "请选择", trigger: "change" }]
      },
      Form: {
        id: "",
        text: "",
        organizationCode: "",
        setupDate: "",
        logoutDate: "",
        parentCode: ""
      },
      searchForm: {
        //搜索的表单
        setupDate: "",
        text: "",
        organizationCode: ""
      },
      isSearch: false
    };
  },
  methods: {
    getRowClassName({ row }) {
      if (this.isSearch) {
        return "row-expand-cover";
      }
    },
    selectCheked(event) {
      event.target.parentElement.parentElement.firstChild.click();
    },

    handleWrite(row) {
      this.isUpdate = true;
      this.Form = {
        id: row.id,
        text: row.text,
        organizationCode:
          row.li_attr.organizationCode || row.li_attr.organizationcode,
        setupDate: row.li_attr.setupDate || row.li_attr.setupdate,
        logoutDate:
          row.li_attr.logoutDate || row.li_attr.logoutdate || "2099-01-01",
        parentCode: row.li_attr.parentCode || row.li_attr.parentcode
      };
      this.dialogVisible = true;
    },
    handleDelete(row) {
      //删除
      if (row.children && row.children.length > 0) {
        this.$alert("该机构下有子细目，不允许删除", "提示", {
          type: "warning"
        })
          .then(() => {})
          .catch(() => {});
        return;
      }
      this.$confirm("是否删除当前机构", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteDepartment({ departmentcode: row.id })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                sessionStorage.removeItem("departmentTree");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    addData() {
      //添加
      this.isUpdate = false;
      this.isAddRoot = true;
      this.Form = {
        id: "",
        text: "",
        organizationCode: "",
        setupDate: new Date().format("yyyy-MM-dd"),
        logoutDate: "2099-01-01",
        parentCode: "00000000"
      };
      this.dialogVisible = true;
    },
    add(row) {
      //添加
      this.isUpdate = false;
      this.isAddRoot = false;
      this.Form = {
        id: row.id,
        text: "",
        organizationCode: "",
        setupDate: new Date().format("yyyy-MM-dd"),
        logoutDate: "2099-01-01",
        parentCode: row.id
      };
      this.dialogVisible = true;
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              name: this.Form.text,
              departmentcode: this.Form.id,
              setupdate: new Date(this.Form.setupDate).format("yyyy-MM-dd"),
              logoutdate:
                new Date(this.Form.logoutDate).format("yyyy-MM-dd") ||
                "2099-01-01",
              organizationcode: this.Form.organizationCode
            };
            updateDepartment(params)
              .then(res => {
                if (res.success) {
                  this.$message.success("修改成功");
                  sessionStorage.removeItem("departmentTree");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //添加
            let params = {
              name: this.Form.text,
              departmentcode: this.Form.id,
              setupdate: this.Form.setupDate,
              logoutdate: this.Form.logoutDate || "2099-01-01",
              organizationcode: this.Form.organizationCode,
              parentcode: this.Form.parentCode
            };

            addDepartment(params)
              .then(res => {
                if (res.success) {
                  this.$message.success("添加成功");
                  sessionStorage.removeItem("departmentTree");
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
    compareId() {
      //比较代号前缀是否是父节点的代号
      let id = "";
      if (this.Form.parentCode) {
        id = this.Form.id.substr(0, this.Form.parentCode.length);
      }
      if (id == this.Form.parentCode) {
        return true;
      } else {
        return false;
      }
    },
    search() {
      this.isSearch = true;
      this.loading = true;
      let params = {
        organizationcode: this.searchForm.organizationCode,
        departmentcode: this.searchForm.text
      };
      if (this.searchForm.setupDate && this.searchForm.setupDate.length > 0) {
        params.setupdate = this.searchForm.setupDate[0];
        params.setupdateEnd = this.searchForm.setupDate[1];
      }
      selectDepartment(params)
        .then(res => {
          this.loading = false;
          this.gridData = res.data || [];
        })
        .catch(res => {});
    },
    reset() {
      this.isSearch = false;
      this.searchForm = {
        setupDate: "",
        text: "",
        organizationCode: ""
      };
      this.initData();
    },

    initData() {
      this.dialogVisible = false;
      this.loading = true;
      this.$store
        .dispatch("tree/departmentTree")
        .then(res => {
          this.loading = false;
          if (res.length > 0) {
            this.gridData = res;
          }
        })
        .catch(res => {
          this.loading = false;
        });
    }
  },
  mounted() {
    this.initData();
  }
};
</script>
<style lang="scss" scoped>
.content-header {
  background-color: #fff;
  h3 {
    line-height: 50px;
    padding-left: 15px;
    font-weight: 700;
    margin: 0;
    border-bottom: 1px solid #ddd;
    font-size: 16px;
    color: #666;
  }
  .header-bot {
    height: 70px;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding-left: 15px;
    .item {
      margin-right: 10px;
      label {
        color: #666;
      }
      .el-input,
      .el-input__inner {
        width: 180px;
      }
    }
  }
}
.tableTitle {
  padding: 0 15px;
  align-items: center;
  height: 55px;
  color: #666;
  font-weight: 700;
  font-size: 16px;
  label {
    font-weight: normal;
    margin-left: 40px;
    font-size: 14px;
  }
}
</style>



