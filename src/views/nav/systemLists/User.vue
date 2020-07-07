<template>
  <!-- 用户管理 -->
  <section>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="5" class="content-left" :class="colcased ?'' :'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>组织机构</span>
            <i
              :class="colcased?'el-icon-d-arrow-left': 'el-icon-d-arrow-right'"
              @click="colcased = !colcased"
            ></i>
          </div>
          <ul class="checkBox">
            <li v-if="departmentList.length == 0">暂无部门</li>
            <li
              :class="dataInfo.id == '' ?'liChecked':''"
              @click="handleChecked({id:''})"
              v-if="departmentList.length !== 0"
            >全部</li>
            <li
              :class="dataInfo.id == department.id?'liChecked':''"
              v-for="department in departmentList"
              @click="handleChecked(department)"
              :key="department.id"
            >{{department.text}}</li>
          </ul>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 19 :24"
        class="content-right"
        :class="!colcased ?'paddingleft-30 ': ''"
      >
        <i
          :icon="colcased?'el-icon-d-arrow-left': 'el-icon-d-arrow-right'"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >组织机构</i>

        <div
          style="padding:15px;border:1px solid #eee;position:relative;"
          class="clearboth searchBox"
          ref="searchBox"
        >
          <el-col :span="18" style="min-height:200px">
            <el-form ref="searchForm" :model="searchForm" label-width="90px" inline size="small">
              <el-col :span="24" class="searchForm">
                <el-form-item label="用户名称">
                  <el-input v-model="searchForm.username" @keyup.enter.native="searchFormFunc"></el-input>
                </el-form-item>
                <el-form-item label="所属部门">
                  <el-cascader
                    size="small"
                    :options="departmentList"
                    v-model="searchForm.departmentCodeArr"
                    @change="selectDepartment($event,'search','cascader1')"
                    :props="{label:'textId',value:'id',checkStrictly:true,expandTrigger:'hover'}"
                    :show-all-levels="false"
                    filterable
                    ref="cascader1"
                  >
                    <template slot-scope="{ node, data }">
                      <div
                        @click="selectCheked('cascader1',$event)"
                      >{{ data.id }} -- {{ data.text }}</div>
                    </template>
                  </el-cascader>
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <el-col :span="6" class="buttonGroup">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="searchFormFunc"
              :disabled="$is_disabled(['user-search']) ? false : true"
            >查询</el-button>
            <el-button
              type="primary"
              size="small"
              plain
              @click="resetForm('form')"
              icon="el-icon-refresh-left"
            >重置</el-button>
          </el-col>
        </div>
        <div class="slidebtn">
          <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
          <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
        </div>
        <div class="clearboth" style="border:1px solid #f2f2f2;">
          <el-col :span="24" class="clearboth tabList" style="margin:20px 0;padding:0 20px;">
            <div class="clearboth title">
              <p class="pull-left">
                为您找到相关结果
                <em>{{total}}</em>个
              </p>
              <div class="pull-right">
                <el-button
                  size="medium"
                  type="primary"
                  @click="addData"
                  :disabled="$is_disabled(['user-add']) ? false : true"
                >新增</el-button>
              </div>
            </div>
          </el-col>
          <div ref="tableBox">
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
              <el-table-column label="用户名称" align="left" prop="username"></el-table-column>
              <el-table-column label="用户标识" align="left" prop="usercode"></el-table-column>
              <el-table-column label="所属部门" align="center" prop="depName"></el-table-column>
              <el-table-column label="状态" align="center" prop="status" width="160">
                <template slot-scope="scope">
                  <el-switch
                    v-model="scope.row.activestate"
                    active-value="1"
                    inactive-value="0"
                    active-text="使用"
                    inactive-text="禁用"
                    :width="54"
                    @change="changeActiveState(scope.row,scope.$index)"
                  ></el-switch>
                </template>
              </el-table-column>

              <el-table-column label="注册时间" align="center" prop="registertime">
                <template slot-scope="scope">
                  <span>{{ new Date(scope.row.registertime).format("yyyy-MM-dd")}}</span>
                </template>
              </el-table-column>

              <el-table-column property="set" label="操作" align="center" width="320" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="warning"
                    @click="handleWrite(scope.row)"
                    :disabled="$is_disabled(['user-edit']) ? false : true"
                  >修改</el-button>
                  <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.row)"
                    :disabled="$is_disabled(['user-delete']) ? false : true"
                  >删除</el-button>
                  <el-button
                    size="mini"
                    type="success"
                    @click="resetPassword(scope.row)"
                    :disabled="$is_disabled(['user-resetPassWord']) ? false : true"
                  >恢复原始密码</el-button>
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
            :page-sizes="[20,50,100]"
            :page-size="pageSize"
            :current-page="currentPage"
            @current-change="handleCurrentChange"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>
    <el-dialog
      :title="isUpdate?'修改信息':'新增用户'"
      width="900px"
      custom-class="userdialog"
      :visible.sync="dialogVisible"
      v-if="dialogVisible"
    >
      <div class="content flex-wrap">
        <div class="content-right" ref="scollBox">
          <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="100px" :inline="true">
            <div id="baseMessage" class="item">
              <div class="title flex-spaceBetween">
                <span>用户基本信息</span>
                <span>
                  <em>*</em>为必填项
                </span>
              </div>
              <div class="content-wrap">
                <el-form-item label="员工姓名：" prop="username">
                  <el-input v-model="Form.username"></el-input>
                </el-form-item>
                <el-form-item label="所属部门：" prop="departmentcode">
                  <el-cascader
                    style="width:100%"
                    :options="departmentList"
                    v-model="Form.departmentCodeArr"
                    @change="selectDepartment($event,'','cascader')"
                    :props="{label:'textId',value:'id',checkStrictly:true,expandTrigger:'hover'}"
                    :show-all-levels="false"
                    filterable
                    ref="cascader"
                  >
                    <template slot-scope="{ node, data }">
                      <div @click="selectCheked('cascader',$event)">{{ data.id }} -- {{ data.text }}</div>
                    </template>
                  </el-cascader>
                </el-form-item>
                <el-form-item label="用户标识：" prop="usercode">
                  <el-input v-model="Form.usercode" :disabled="isUpdate ? true : false"></el-input>
                </el-form-item>
                <el-form-item label="注册时间：" prop="registertime">
                  <el-date-picker
                    style="width:100%"
                    v-model="Form.registertime "
                    type="date"
                    placeholder="选择日期"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                </el-form-item>
                <el-form-item label="用户口令：" prop="password" v-if="isUpdate ? false : true">
                  <el-input v-model="Form.password" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="确认口令：" prop="checkPass" v-if="isUpdate ? false : true">
                  <el-input v-model="Form.checkPass" type="password" show-password></el-input>
                </el-form-item>
                <el-form-item label="用户电话：" prop="officephone">
                  <el-input v-model.number="Form.officephone" type="text"></el-input>
                </el-form-item>
                <el-form-item label="状态：" prop="activestate">
                  <el-switch
                    v-model="Form.activestate"
                    :validate-event="true"
                    active-text="使用"
                    inactive-text="禁用"
                    :width="54"
                    active-value="1"
                    inactive-value="0"
                  ></el-switch>
                </el-form-item>
              </div>
            </div>
            <div id="roleMessage" class="item">
              <div class="title flex-spaceBetween">
                <span>用户角色信息</span>
              </div>
              <div class="content-wrap">
                <el-checkbox-group v-model="Form.roleList">
                  <el-form-item
                    style="display:block;margin-bottom:0"
                    label-width="120px"
                    v-for="item in roleGroupList"
                    :key="item.groupCode"
                    class="roleList"
                  >
                    <span for slot="label">
                      <el-popover
                        placement="top-start"
                        title="提示"
                        width="200"
                        offset="20"
                        trigger="hover"
                      >
                        <span slot="reference">{{item.groupName+'：'}}</span>
                      </el-popover>
                    </span>

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
  </section>
</template>

<script>
import { getRoleGroupList } from "@/common/js/util";
import { Base64 } from "js-base64";
import {
  queryUsers,
  deleteUser,
  updateUser,
  addUser,
  queryRoles
} from "@/api/user";
export default {
  name: "user",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        //先判断字符串6-12位有效无效
        if (/^[\w|\W]{6,12}$/.test(value)) {
          //规则：同一种字符的就是弱密码（exp:全是数字，全是英文字母，全是特殊字符）
          if (
            /^\d{6,12}$|^([a-z|A-Z]{6,12})$|^(~`!@#$%^&*()_+<>?:"{},.\/'[\]]'"])$/.test(
              value
            )
          ) {
            callback(new Error("密码强度弱"));
          }
        }
        if (this.Form.checkPass !== "") {
          this.$refs.ruleForm.validateField("checkPass");
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value !== this.Form.password) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      flag: false,
      colcased: true,
      loading: false,
      isUpdate: false,
      dialogVisible: false,
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
      searchForm: {
        code: "",
        username: "",
        departmentCodeArr: [] //所属部门展示
      },
      rules: {
        activestate: [{ required: true, message: "请输入", trigger: "blur" }],
        usercode: [
          { required: true, message: "请输入", trigger: "blur" },
          {
            min: 2,
            max: 25,
            message: "长度在 4 到 25 个字符"
          }
        ],
        departmentcode: [
          { required: true, message: "请选择", trigger: "change" }
        ],
        registertime: [
          { required: true, message: "请选择", trigger: "change" }
        ],
        username: [
          { required: true, message: "请输入", trigger: "blur" },
          {
            min: 2,
            max: 25,
            message: "长度在 4 到 25 个字符"
          }
        ],

        password: [
          { validator: validatePass, trigger: "blur" },
          {
            min: 6,
            max: 30,
            message: "长度在 6 到 30 个字符"
          },
          { required: true, message: "请输入", trigger: "blur" }
        ],
        checkPass: [
          { validator: validatePass2, trigger: "blur" },
          { required: true, message: "请输入", trigger: "blur" }
        ],
        officephone: [
          { required: true, message: "请输入", trigger: "blur" },
          { type: "number", message: "电话必须为数字", trigger: "blur" }
        ]
      },
      pageSize: 20,
      currentPage: 1,
      total: 0,
      gridData: [],
      collectList: [],
      dataInfo: {
        id: ""
      },
      roleGroupList: [],
      Form: {
        usercode: "",
        username: "",
        password: "",
        checkPass: "",
        officephone: "",
        departmentcode: "",
        registertime: "",
        activestate: "",
        roleList: [],
        departmentCodeArr: [] //所属部门展示
      },
      usercode: ""
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
    selectCheked(name, event) {
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
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
    handleChecked(data) {
      this.dataInfo = data;
      this.searchForm = {
        code: "",
        username: "",
        departmentCodeArr: []
      };
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    changeActiveState(row, index) {
      //修改状态
      let msg = row.activestate == 0 ? "禁用" : "启用";
      let code = row.activestate == 0 ? "0" : "1";
      this.$confirm("是否将此用户" + msg, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            usercode: row.usercode,
            activestate: code
          };
          updateUser(params)
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
        })
        .catch(() => {
          if (code == 0) {
            this.$set(this.gridData[index], "activestate", "1");
          } else if (code == 1) {
            this.$set(this.gridData[index], "activestate", "0");
          }
        });
    },
    selectDepartment(value, word, formname) {
      let code = "";
      let name = "";
      let arr = this.$refs[formname].getCheckedNodes();
      code = arr[0].data.id;
      name = arr[0].data.text;
      if (word) {
        this.searchForm.code = code;
      } else {
        this.Form.departmentcode = code;
        this.Form.depName = name;
      }
    },
    initData() {
      //获取角色树
      queryRoles({
        limit: 1000,
        star: 1
      }).then(res => {
        let list = res.data.list;
        this.roleGroupList = getRoleGroupList(list);
      });
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
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
        code: "",
        username: "",
        departmentCodeArr: []
      };
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      //查询
      params.departmentCode = this.searchForm.code;
      params.username = this.searchForm.username;
      params.superDepartmentCode = this.dataInfo.id;
      this.loading = true;
      queryUsers(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.gridData.forEach(item => {
              item.roleList = [];
              item.roles.forEach(val => {
                item.roleList.push(val.ROLECODE);
              });
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
        .catch(res => {
          this.loading = false;
        });
    },
    handleWrite(row) {
      //修改
      this.tabindex = 0;
      this.isUpdate = true;
      this.dialogVisible = true;
      this.usercode = row.usercode;

      this.Form = {
        usercode: row.usercode,
        username: row.username,
        depName: row.depName,
        activestate: row.activestate,
        officephone: Number(row.officephone),
        roleList: row.roleList,
        departmentcode: row.departmentcode,
        departmentCodeArr: row.departmentcode,
        registertime: row.registertime
      };
    },
    resetPassword(row) {
      this.usercode = row.usercode;
      this.$confirm("是否重置密码为000000", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            usercode: this.usercode,
            password: "abcd"
          };
          updateUser(params)
            .then(res => {
              if (res.success) {
                this.$message.success("重置成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    handleDelete(row) {
      //删除
      this.usercode = row.usercode;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteUser({
            usercode: this.usercode
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
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              usercode: this.Form.usercode,
              username: this.Form.username,
              depName: this.Form.depName,
              roleCodes: this.Form.roleList,
              officephone: this.Form.officephone,
              activestate: this.Form.activestate,
              departmentcode: this.Form.departmentcode,
              registertime: this.Form.registertime
            };
            updateUser(params)
              .then(res => {
                this.dialogVisible = false;
                if (res.success) {
                  this.$message.success("修改成功");
                  this.$store.dispatch("user/getUserInfo");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //增加
            let params = {
              usercode: this.Form.usercode,
              username: this.Form.username,
              password: Base64.encode(this.Form.password),
              depName: this.Form.depName,
              officephone: this.Form.officephone,
              roleCodes: this.Form.roleList,
              activestate: this.Form.activestate,
              themecolor: "409eff",
              departmentcode: this.Form.departmentcode,
              registertime:
                this.Form.registertime || new Date().format("yyyy-MM-dd")
            };
            addUser(params)
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
    addData() {
      //添加
      this.tabindex = 0;
      this.isUpdate = false;
      this.dialogVisible = true;
      this.Form = {
        usercode: "",
        username: "",
        password: "",
        departmentcode: "",
        departmentCodeArr: [],
        activestate: "1",
        roleList: [],
        creationdate: new Date().format("yyyy-MM-dd"),
        registertime: new Date().format("yyyy-MM-dd"),
        checkPass: ""
      };
    }
  },

  mounted() {
    this.initData();
    this.$store.dispatch("tree/departmentTree");
    //获取角色树
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
<style lang="scss">
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
      padding: 0;
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
        span:lase-child {
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
</style>
<style lang="scss" scoped>
section {
  .content-header {
    background-color: #fafafa;
    padding: 15px 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
  }
  .content-left {
    min-height: 500px;
    // -webkit-transition: width 0.3s ease-in-out;
    // transition: width 0.3s ease-in-out;
    ul {
      list-style: none;
      padding: 20px 10px;
      margin: 0;
      min-height: 200px;
      li {
        height: 40px;
        line-height: 40px;
        padding: 0 10px;
        cursor: pointer;
        border-radius: 3px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      li:hover {
        color: #666;
      }

      li.liChecked {
        color: #fff;
      }
    }
  }

  .content-right {
    padding: 20px;
    min-height: 500px;
    border-left: 1px solid #eee;
    position: relative;
    .btngroup {
      padding-bottom: 15px;
      margin-bottom: 20px;
      border-bottom: 1px solid #eee;
    }

    .searchBox {
      height: 85px;
      overflow: hidden;
    }
    .slidebtn {
      text-align: center;
      position: relative;
      top: -20px;
      i {
        display: inline-block;
        padding: 0 15px;
        border: none;
        margin: 0;
        cursor: pointer;
        font-size: 20px;
      }
    }

    .inline {
      display: inline-block;
      .input {
        width: 180px;
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
  }
}
</style>
