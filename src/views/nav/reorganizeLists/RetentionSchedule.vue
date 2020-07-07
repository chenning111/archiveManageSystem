<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>分类：</label>
          <el-cascader
            :options="systemClassFondsList"
            v-model="searchForm.selectedOptions"
            @change="selectDepartment($event,'search')"
            :props="{label:'textId',value:'id',checkStrictly:true,expandTrigger:'hover'}"
            :show-all-levels="false"
            filterable
            size="small"
            ref="cascader11"
          >
            <template slot-scope="{ node, data }">
              <div @click="selectCheked('cascader11',$event)">{{ data.id }} -- {{ data.text }}</div>
            </template>
          </el-cascader>
        </div>
        <div class="item">
          <label for>归档范围：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入内容"
            v-model="searchForm.title"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div class="center">
          <label for>全宗：</label>
          <el-select v-model="fondsCode" size="small">
            <el-option
              :label="item.NO+' -- '+item.NAME"
              v-for="item in fondsList"
              :key="item.FONDSCODE"
              :value="item.FONDSCODE"
            ></el-option>
          </el-select>
          <label for>档案门类：</label>
          <el-select v-model="cNodeCode" size="small" @change="changeNodeCode">
            <el-option
              :label="item.text"
              v-for="item in categoryList"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <div>
          <el-button size="small" type="primary" @click="addData(null)">新增</el-button>
          <el-button size="small" type="primary" @click="printContent">打印</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="tableBox"
          id="myTable"
          tooltip-effect="dark"
          :row-key="isSearch?'':'nodeCode'"
          :row-class-name="getRowClassName"
          :expand-row-keys="expandKeys"
        >
          <el-table-column label="编号" align="left" prop="serial" min-width="20%">
            <template slot-scope="scope">{{scope.row.description}}</template>
          </el-table-column>
          <!-- <el-table-column label="分类" align="left" prop="departmentName" width="180px"></el-table-column> -->
          <el-table-column label="归档范围" align="left" prop="title" min-width="70%"></el-table-column>
          <el-table-column label="保管期限" align="center" prop="dateOfCustody" width="90px;"></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="300" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                @click="handleWrite(scope.row)"
                :disabled="$is_disabled(['retentionSchedule-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleDelete(scope.row)"
                :disabled="$is_disabled(['retentionSchedule-delete']) ? false : true"
              >删除</el-button>
              <el-button
                size="mini"
                type="primary"
                @click="addData(scope.row)"
                :disabled="$is_disabled(['retentionSchedule-add']) ? false : true"
              >添加子节点</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>
    <!--  -->
    <el-dialog :title="isUpdate? '修改分类信息':'添加分类信息'" :visible.sync="dialogVisible">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="110px">
        <el-form-item label="全宗" required>
          <el-select v-model="Form.fondsCode" disabled>
            <el-option
              :label="item.NO+' -- '+item.NAME"
              v-for="item in fondsList"
              :key="item.FONDSCODE"
              :value="item.FONDSCODE"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="档案门类" prop="name">
          <el-select v-model="Form.name" disabled>
            <el-option
              :label="item.text"
              v-for="item in categoryList"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上级归档范围" v-if="!isAddDeparment" disabled>
          <el-input v-model="Form.parentTitle" disabled></el-input>
        </el-form-item>
        <el-form-item label="上级编号" prop="parentDescription" v-if="!isAddDeparment">
          <el-input v-model="Form.parentDescription" disabled></el-input>
        </el-form-item>
        <el-form-item label="编号" prop="description">
          <el-input v-model="Form.description"></el-input>
        </el-form-item>
        <el-form-item label="分类">
          <el-cascader
            :disabled="isUpdate?true:false"
            :options="systemClassFondsList"
            v-model="Form.departmentCode"
            @change="selectDepartment"
            :props="{label:'textId',value:'id',checkStrictly:true,expandTrigger:'hover'}"
            :show-all-levels="false"
            filterable
            ref="cascader1"
          >
            <template slot-scope="{ node, data }">
              <div @click="selectCheked('cascader1',$event)">{{ data.id }} -- {{ data.text }}</div>
            </template>
          </el-cascader>
        </el-form-item>
        <el-form-item label="归档范围" v-if="!isAddDeparment">
          <el-input v-model="Form.title"></el-input>
        </el-form-item>
        <el-form-item label="保管期限" v-if="!isAddDeparment">
          <el-select v-model="Form.dateOfCustody" placeholder="请选择保管期限">
            <el-option label="永久" value="永久"></el-option>
            <el-option label="30年" value="30年"></el-option>
            <el-option label="10年" value="10年"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
    <el-dialog width="880px" title="打印" :visible.sync="printDialog" custom-class="noPaddingDialog">
      <div class="btnwrapper" style="padding:10px 15px;border-bottom: 1px solid #ccc">
        <el-button type="primary" v-print="'#printContent'">打 印</el-button>
        <el-button @click="printDialog = false">取 消</el-button>
      </div>
      <div style="background-color:#fff;padding:0 15px;page-break-before:always;" id="printContent">
        <div class="listitem">
          <div class="tableTitle">
            <div>{{printTitle}}</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable printTableTdLeft">
              <thead>
                <tr>
                  <th width="11%">编号</th>
                  <th>归档范围</th>
                  <th width="11%" algin="center">保管期限</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in printTableData" :key="index">
                  <td>{{ item.description }}</td>
                  <td>{{ item.title }}</td>
                  <td>{{ item.dateOfCustody }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import {
  getFilingScopeTreeMenu,
  upFilingScopeNodeCode,
  delFilingScopeByNodeCode,
  getFilingScopeMaxNodeCode,
  addFilingScope,
  getDepartementTree,
  getFilingScopeTreeByParms
} from "@/api/file";
import {
  getDataFromId,
  deepQuery,
  deepClone,
  toChinesNum
} from "@/common/js/util";
//***
// 注意 接口传的是参数是departmentCoDE 实际的值是实体分类的code
//
export default {
  data() {
    return {
      printTitle: "",
      printDialog: false,
      dialogVisible: false,
      isUpdate: false, //是否是修改
      isAddDeparment: false,
      gridData: [],
      expandKeys: [],
      loading: false,
      departmentCode: "",
      rules: {
        name: [{ required: true, message: "请输入", trigger: "blur" }],
        description: [{ required: true, message: "请输入", trigger: "blur" }],
        parentDescription: [
          { required: true, message: "请输入", trigger: "blur" }
        ]
      },
      Form: {
        departmentCode: "",
        name: "",
        title: "",
        serial: "",
        fondsCode: "",
        parentTitle: "",
        parentDescription: ""
      },

      parentNode: {},
      searchForm: {
        //搜索的表单
        name: "",
        departmentCode: "",
        selectedOptions: "",
        title: ""
      },
      isSearch: false,
      oldData: [],
      printTableData: [],
      fondsCode: "",
      cNodeCode: "", //底层门类id
      systemClassFondsList: [] //实体分类数组
    };
  },
  methods: {
    printContent() {
      if (this.gridData.length > 0) {
        let data = deepClone(this.gridData);
        this.printTableData = this.getPrintTableData(data, []);
        this.printDialog = true;
        this.printTitle = this.categoryList.find(
          t => t.id === this.cNodeCode
        ).text;
      } else {
        this.$message.warning("暂无数据");
        return false;
      }
    },
    getPrintTableData(data, res) {
      for (let i = 0; i < data.length; i++) {
        res.push(data[i]);
        if (data[i].children && data[i].children.length > 0) {
          this.getPrintTableData(data[i].children, res);
        }
      }
      return res;
    },
    getRowClassName({ row }) {
      if (this.isSearch) {
        return "row-expand-cover";
      } else if (!this.isSearch && row.children.length == 0) {
        return "row-expand-cover";
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
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      let parentCode = row.parentCode;
      this.parentNode = getDataFromId(
        this.gridData,
        row.parentCode,
        "nodeCode"
      );
      this.Form = {
        name: row.name,
        departmentCode: row.departmentCode,
        serial: row.serial,
        description: row.description,
        parentCode: row.parentCode,
        title: row.title,
        dateOfCustody: row.dateOfCustody,
        nodeCode: row.nodeCode,
        fondsCode: row.fondsCode
      };
      if (this.parentNode) {
        this.isAddDeparment = false;
        this.Form.parentTitle = this.parentNode.title;
        this.Form.parentDescription = this.parentNode.description;
      } else {
        this.isAddDeparment = true;
      }
      this.dialogVisible = true;
    },
    handleDelete(row) {
      //删除
      if (row.children && row.children.length > 0) {
        this.$alert("该分类下有子细目，不允许删除", "提示", {
          type: "warning"
        })
          .then(() => {})
          .catch(() => {});
        return;
      }
      this.$confirm("是否将此节点删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          delFilingScopeByNodeCode({
            nodeCode: row.nodeCode,
            fondsCode: row.fondsCode
          }).then(res => {
            if (res.success) {
              this.$message.success("删除成功");
              this.initData();
            } else {
              this.$message.success(res.msg);
              this.initData();
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    addData(row) {
      //添加档案门类
      this.isUpdate = false;
      if (row) {
        this.isAddDeparment = false;
      } else {
        this.isAddDeparment = true;
      }
      this.Form = {
        departmentCode: row ? row.departmentCode : "",
        name: row ? row.name : this.cNodeCode,
        title: "",
        serial: "",
        departmentName: row ? row.departmentName : "",
        description: "",
        fondsCode: row ? row.fondsCode : this.fondsCode,
        parentTitle: row ? row.title : "",
        parentCode: row ? row.nodeCode : "ROOT",
        parentDescription: row ? row.description : "ROOT"
      };
      getFilingScopeMaxNodeCode({
        parentCode: row ? row.nodeCode : "ROOT",
        fondsCode: this.fondsCode
      }).then(res => {
        if (res.success) {
          this.$set(this.Form, "serial", Number(res.data) + 1);
          if (!row || row.parentCode == "ROOT") {
            this.$set(
              this.Form,
              "description",
              `(${toChinesNum(Number(res.data) + 1)})`
            );
          } else {
            this.$set(
              this.Form,
              "description",
              row.description + "." + (Number(res.data) + 1)
            );
          }
          this.dialogVisible = true;
        }
      });
    },

    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              nodeCode: this.Form.nodeCode,
              title: this.Form.title,
              description: this.Form.description,
              departmentCode: this.Form.departmentCode,
              departmentName: this.Form.departmentName,
              dateOfCustody: this.Form.dateOfCustody,
              fondsCode: this.fondsCode
            };
            upFilingScopeNodeCode(params).then(res => {
              this.dialogVisible = false;
              if (res.success) {
                this.$message.success("修改成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
                this.initData();
              }
            });
          } else {
            let filingScopeTree = {
              serial: this.Form.serial,
              parentCode: this.Form.parentCode,
              title: this.Form.title,
              dateOfCustody: this.Form.dateOfCustody,
              description: this.Form.description,
              departmentCode: this.Form.departmentCode,
              departmentName: this.Form.departmentName,
              name: this.Form.name,
              fondsCode: this.fondsCode
            };
            if (filingScopeTree.parentCode === "ROOT") {
              filingScopeTree.nodeCode = this.Form.serial;
              filingScopeTree.title = this.Form.departmentName;
            } else {
              filingScopeTree.nodeCode =
                this.Form.parentCode + "-" + this.Form.serial;
            }
            addFilingScope(filingScopeTree).then(res => {
              if (res.success) {
                this.$message.success("添加成功");
                this.initData();

                let parentCode = filingScopeTree.parentCode;
                this.parentNode = getDataFromId(
                  this.gridData,
                  parentCode,
                  "nodeCode"
                );
                if (this.parentNode) {
                  this.addData(this.parentNode);
                } else {
                  this.addData(null);
                }
              } else {
                this.$message.error(res.msg);
                this.initData();
              }
            });
          }
        } else {
          return false;
        }
      });
    },

    search() {
      let data = {};
      data.name = this.cNodeCode;
      data.title = this.searchForm.title;
      data.departmentCode = this.searchForm.departmentCode;
      data.fondsCode = this.fondsCode;
      this.loading = true;
      this.isSearch = true;
      getFilingScopeTreeByParms(data).then(res => {
        this.loading = false;
        if (res.success) {
          let list = res.data;
          if (res.data.length > 0) {
            this.gridData = list;
          } else {
            this.gridData = [];
          }
        } else {
          this.loading = false;
        }
      });
    },
    reset() {
      this.isSearch = false;
      this.searchForm = {
        name: "",
        departmentCode: "",
        selectedOptions: [],
        title: ""
      };
      this.gridData = this.oldData;
    },
    changeNodeCode() {
      this.initData();
    },
    initData() {
      this.loading = true;
      this.searchForm = {
        name: "",
        departmentCode: "",
        selectedOptions: [],
        title: ""
      };
      let params = {
        fondsCode: this.fondsCode,
        cNodeCode: this.cNodeCode
      };
      getFilingScopeTreeMenu(params).then(res => {
        this.loading = false;
        if (res.success) {
          let list = res.data;
          if (list.length > 0) {
            this.gridData = list;
            this.expandKeys = list.map(item => {
              return item.nodeCode;
            });
            this.oldData = list;
          } else {
            this.gridData = [];
            this.oldData = [];
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    selectDepartment(value, word) {
      //选择所属部门
      if (value.length > 1) {
        this.departmentCode = value[value.length - 1];
      } else {
        this.departmentCode = value[0];
      }
      if (word == "search") {
        let arr = this.$refs.cascader11.getCheckedNodes();
        this.searchForm.departmentCode = arr[0].data.id;
        this.search();
      } else {
        let arr = this.$refs.cascader1.getCheckedNodes();
        this.Form.departmentCode = arr[0].data.id;
        if (this.Form.parentCode == "ROOT") {
          this.Form.title = arr[0].data.text;
        }
        this.Form.departmentName = arr[0].data.text;
      }
    },
    getCategoryList(data = [], res = []) {
      //获取所有的底层门类
      data.forEach(item => {
        if (item.children) {
          if (item.children.length > 0) {
            this.getCategoryList(item.children, res);
          }
        }
        if (item.li_attr.TYPE === "C") {
          res.push(item);
        }
      });
      return res;
    }
  },
  async mounted() {
    this.$store.dispatch("tree/tableViewTree");
    await this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗
  },
  computed: {
    fondsList() {
      //全宗数组
      if (this.$store.state.fondsCatalog.fondsList.length > 0) {
        this.fondsCode =
          this.fondsCode ||
          this.$store.state.fondsCatalog.fondsList[0].FONDSCODE;
      }
      return this.$store.state.fondsCatalog.fondsList;
    },
    categoryList: {
      get() {
        let archiveData = deepQuery(
          [this.$store.getters.tableViewTree],
          "D_ARCHIVE",
          []
        ); //获取档案的数组
        let categoryData = [];
        if (archiveData.length > 0) {
          categoryData = this.getCategoryList(
            deepClone(archiveData[0].children),
            []
          );
        }
        return categoryData;
      },
      set() {}
    }
  },
  watch: {
    async fondsCode(newval, oldval) {
      if (oldval != newval && newval) {
        let fondscode = newval;
        this.searchForm = {
          name: "",
          departmentCode: "",
          selectedOptions: [],
          title: ""
        };
        if (this.categoryList.length > 0) {
          this.cNodeCode = this.categoryList[0].id;
        }
        this.systemClassFondsList = await this.$store.dispatch(
          "fondsCatalog/getCatalogTree",
          { fondsCode: fondscode, classnodeId: this.cNodeCode }
        );
        this.initData();
      }
    }
  },
  filters: {
    filterSerial(value) {
      return value.replace(/-/g, ".");
    }
  }
};
</script>




