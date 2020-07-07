<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>分类名称：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入分类名称"
            v-model="searchForm.text"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>分类号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入分类号"
            v-model="searchForm.id"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>门类代码：</label>
          <el-select v-model="classnodeType" size="small" @change="changeClssType" clearable>
            <el-option
              :label="item.id =='empty' ?item.label :item.label +'--'+item.id"
              v-for="item in categoryTypeList"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </el-select>
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
        </div>
        <div>
          <el-button
            size="small"
            type="primary"
            @click="addData"
            :disabled="$is_disabled(['entityClass-add']) ? false : true"
          >新增</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          ref="tableDom"
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
          :row-key="isSearch?'':'id'"
          :row-class-name="getRowClassName"
          default-expand-all
        >
          <el-table-column label="分类名称" sortable prop="id">
            <template slot-scope="scope">
              <span v-if="!scope.row.li_attr">{{scope.row.id}}&nbsp;&nbsp;&nbsp;{{scope.row.text}}</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="left" width="300" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="warning"
                style="margin-left:0"
                @click="handleWrite(scope.row)"
                title="修改"
                :disabled="$is_disabled(['entityClass-edit']) ? false : true"
              >修改</el-button>
              <el-button
                size="mini"
                type="danger"
                style="margin-left:0"
                title="删除"
                @click="handleDelete(scope.$index,scope.row)"
                :disabled="$is_disabled(['entityClass-delete']) ? false : true"
              >删除</el-button>
              <el-button
                size="mini"
                type="primary"
                style="margin-left:0"
                :disabled="$is_disabled(['entityClass-add']) ? false : true"
                @click="add(scope.row)"
                title="添加子栏目"
              >添加</el-button>
              <el-button
                size="mini"
                type="primary"
                style="margin-left:0"
                @click="addSystem(scope.row)"
                v-if="getIsshowAddSystem(scope.row)"
                title="分配门类"
              >分配</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>
    <el-dialog
      :title="isUpdate? '修改实体分类':'添加实体分类'"
      :visible.sync="dialogVisible"
      width="700px"
      v-if="dialogVisible"
    >
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="110px">
        <el-form-item label="全宗号" prop="NO">
          <el-select v-model="Form.NO" :disabled="isUpdate?true:false" @change="changeFormNo">
            <el-option
              :label="item.NO+' -- '+item.NAME"
              v-for="item in fondsList"
              :key="item.FONDSCODE"
              :value="item.NO"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="全宗名称" prop="NAME">
          <el-input v-model="Form.NAME" disabled></el-input>
        </el-form-item>
        <el-form-item label="门类代码" v-if="isAddRoot" prop="classnodeType">
          <el-select
            v-model="Form.classnodeType"
            @change="changeFormId"
            :disabled="isUpdate && isAddRoot? true :false"
          >
            <el-option
              :label="item.id =='empty' ?item.label :item.label +'--'+item.id"
              v-for="item in categoryTypeList"
              :key="item.id"
              :value="item.id"
              :disabled="getIsDiabled(item.id)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分类号" prop="id">
          <el-input
            v-model="Form.id"
            :disabled="isAddRoot && Form.classnodeType!=='empty'? true :false"
          >
            <template slot="prepend" v-if="Form.parentId">{{Form.parentId+'.'}}</template>
          </el-input>
        </el-form-item>
        <el-form-item label="分类名称" prop="text">
          <el-input v-model="Form.text"></el-input>
        </el-form-item>
        <el-form-item label="下级宽度" prop="childwidth">
          <el-input v-model.number="Form.childwidth"></el-input>
        </el-form-item>
        <el-form-item label="上级分类号">
          <el-input v-model="Form.parentId" disabled></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配门类" :visible.sync="fpdialog" width="700px">
      <el-form :model="fpForm" label-width="110px">
        <el-form-item label="门类代码">
          <el-select
            v-model="fpForm.classnodeType"
            @change="changeFormId"
            :disabled="fpdialog? true :false"
          >
            <el-option
              :label="item.id =='empty' ?item.label :item.label +'--'+item.id"
              v-for="item in categoryTypeList"
              :key="item.id"
              :value="item.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="整理类别">
          <el-transfer
            class="transferAddWidth"
            filterable
            :filter-method="filterMethod"
            :data="categoryList"
            v-model="fpForm.catalogNodeCode"
            filter-placeholder="请输入字段中文名名"
            @left-check-change="
                (a, b) => {
                  changeLeftTransfer(a, b,fpForm.catalogNodeCode);
                }
              "
            @right-check-change="
                (a, b) => {
                  changeRightTransfer(a, b,fpForm.catalogNodeCode);
                }
              "
            :props="{
                key: 'id',
                label: 'text'
              }"
            :titles="['待添加', '已选']"
          ></el-transfer>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="fpdialog = false">取 消</el-button>
        <el-button type="primary" @click="submitfpForm">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  addCatalog,
  deleteCatalog,
  updateCatalog,
  selectCatalog,
  getAllSystemFonds,
  getNodeCodesByCatalog,
  addSystemCatalogNodeCode
} from "@/api/archiveCatalog";
import { selecSystemDictionary } from "@/api/dictionary";
import { deepQuery, deepClone, getDataFromId } from "@/common/js/util";
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      if (this.Form.parentId) {
        let obj = this.compareChildwidth();
        let reg = /^[0-9,A-Z,.]+$/;
        if (!reg.test(value)) {
          callback(new Error("请输入大写字母或者数字"));
        }
        if (obj.bol) {
          callback();
        } else {
          callback(new Error(obj.msg));
        }
      } else if (value == "noCatelog") {
        callback(new Error("当前分类号已存在"));
      } else {
        callback();
      }
    };

    return {
      classnodeType: "",
      filterMethod(query, item) {
        return item.text.indexOf(query) > -1;
      },
      categoryTypeList: [],
      fpdialog: false,
      fpForm: {
        classnodeType: "",
        catalogNodeCode: []
      },
      catalogcode: "",
      dialogVisible: false,
      selectCurrRow: {},
      isUpdate: false, //是否是修改
      isAddRoot: false, //是否是添加第一级实体分类 因为第一级实力分类的上级分类不存在
      gridData: [],
      fondsCode: "",
      loading: false,
      rules: {
        NO: [{ required: true, message: "请输入", trigger: "blur" }],
        NAME: [{ required: true, message: "请输入", trigger: "blur" }],
        classnodeType: [
          { required: true, message: "请选择", trigger: "change" }
        ],
        id: [
          { validator: validatePass, trigger: "blur" },
          { required: true, message: "请输入", trigger: "blur" }
        ],
        text: [{ required: true, message: "请输入", trigger: "blur" }],
        parentId: [{ required: true, message: "请选择", trigger: "blur" }],
        childwidth: [
          { required: true, message: "请输入" },
          { type: "number", message: "请输入数字" }
        ]
      },
      Form: {
        NO: "",
        NAME: "",
        id: "",
        text: "",
        childwidth: "",
        classnodeType: "",
        parentId: "",
        fondsCode: ""
      },
      searchForm: {
        //搜索的表单
        id: "",
        text: ""
      },
      isSearch: false,
      oldList: []
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
    getRowClassName({ row }) {
      if (this.isSearch) {
        return "row-expand-cover";
      }
    },
    changeFormId(val) {
      if (val == "empty") {
        this.Form.id = "";
      } else {
        this.Form.id = val;
        this.Form.text = this.categoryTypeList.find(t => t.id === val).label;
      }
    },
    getIsshowAddSystem(row) {
      //是否显示分配门类
      if (row.parentcatalogcode == "0") {
        return true;
      }
    },
    changeFormNo(val) {
      let obj = this.fondsList.find(t => t.NO === val);
      if (obj) {
        this.Form.NAME = obj.NAME;
        this.Form.fondsCode = obj.FONDSCODE;

        this.fondsCode = obj.FONDSCODE;
      }
    },
    handleWrite(row) {
      this.selectCurrRow = row;
      this.isUpdate = true;
      let code = "";
      let name = "";
      this.fondsList.forEach(item => {
        if (item.FONDSCODE == this.fondsCode) {
          code = item.NO;
          name = item.NAME;
        }
      });
      this.Form = {
        NO: code,
        NAME: name,
        catalogcode: row.catalogcode,
        text: row.text,
        id: "",
        childwidth: row.childwidth,
        fondsCode: row.fondscode
      };
      if (Number(row.parentcatalogcode)) {
        this.isAddRoot = false;
        let parentNode = getDataFromId(
          this.gridData,
          row.parentcatalogcode,
          "catalogcode"
        );
        let id = row.id.substr(parentNode.id.length + 1, row.id.length);
        this.Form.parentId = parentNode.id;
        this.Form.id = id;
      } else {
        this.isAddRoot = true;
        if (this.categoryTypeList.find(val => val.id == row.id)) {
          this.Form.classnodeType = row.id;
        } else {
          this.Form.classnodeType = "empty";
        }
        this.Form.id = row.id;
      }
      this.dialogVisible = true;
    },
    handleDelete(index, row) {
      this.selectCurrRow = row;
      //删除
      if (row.children && row.children.length > 0) {
        this.$alert("该分类下有子细目，不允许删除", "提示", {
          type: "warning"
        })
          .then(() => {})
          .catch(() => {});
        return;
      }
      this.$confirm("是否删除当前实体分类", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteCatalog({ catalogcode: row.catalogcode })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.refreshRow();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    getClassName(id) {
      return this.categoryList.filter(item => item.id == id)[0].text;
    },
    getIsDiabled(val) {
      let t = getDataFromId(this.oldList, val);
      if (t) {
        return true;
      }
    },
    addData() {
      this.isUpdate = false;
      let code = "";
      let name = "";
      this.fondsList.forEach(item => {
        if (item.FONDSCODE == this.fondsCode) {
          code = item.NO;
          name = item.NAME;
        }
      });
      this.isAddRoot = true;
      this.Form = {
        NO: code,
        NAME: name,
        id: "",
        text: "",
        childwidth: "",
        classnodeType: "",
        parentId: 0,
        fondsCode: this.fondsCode
      };
      this.dialogVisible = true;
    },
    add(row) {
      this.selectCurrRow = row;
      //添加
      this.isUpdate = false;
      let code = "";
      let name = "";
      this.fondsList.forEach(item => {
        if (item.FONDSCODE == this.fondsCode) {
          code = item.NO;
          name = item.NAME;
        }
      });

      this.Form = {
        NO: code,
        NAME: name,
        id: "",
        text: "",
        childwidth: "",
        classnodeType: "",
        parentId: 0,
        fondsCode: row.fondscode
      };
      this.isAddRoot = false;
      this.Form.parentId = row.id;
      this.dialogVisible = true;
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              catalogcode: this.Form.catalogcode,
              fondscode: this.Form.fondsCode,
              text: this.Form.text,
              childwidth: this.Form.childwidth
            };
            if (this.Form.parentId) {
              params.id = this.Form.parentId + "." + this.Form.id;
            } else {
              params.id = this.Form.id;
            }
            updateCatalog(params)
              .then(res => {
                if (res.success) {
                  this.dialogVisible = false;
                  this.$message.success("修改成功");
                  this.refreshRow();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //添加
            let params = {
              fondscode: this.Form.fondsCode,
              text: this.Form.text,
              childwidth: this.Form.childwidth
            };
            if (this.Form.parentId) {
              params.id = this.Form.parentId + "." + this.Form.id;
              params.parentcatalogcode = this.selectCurrRow.catalogcode;
            } else {
              params.parentcatalogcode = 0;
              params.id = this.Form.id;
            }
            addCatalog(params)
              .then(res => {
                if (res.success) {
                  this.$message.success("添加成功");
                  this.refreshRow();
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

    compareChildwidth() {
      //判断下级宽度
      let childwidth = "";
      if (this.Form.parentId) {
        let rootData = deepQuery(this.gridData, this.Form.parentId, []); //获取上一级节点
        childwidth = rootData[0].childwidth;
        if (this.Form.id && this.Form.id.length > childwidth) {
          return {
            bol: false,
            msg: "宽度最大为" + childwidth
          };
        } else {
          return {
            bol: true
          };
        }
      }
    },
    search() {
      this.classnodeType = "";
      let data = {};
      for (let i in this.searchForm) {
        if (this.searchForm[i]) {
          data[i] = this.searchForm[i];
        }
      }
      if (JSON.stringify(data) == "{}") {
        return;
      }
      this.isSearch = true;
      this.loading = true;
      let params = {
        fondscode: this.fondsCode,
        id: this.searchForm.id,
        text: this.searchForm.text
      };
      selectCatalog(params)
        .then(res => {
          this.loading = false;
          this.gridData = res.data || [];
        })
        .catch(res => {});
    },
    addSystem(row) {
      this.selectCurrRow = row;
      getNodeCodesByCatalog({ catalogCode: row.catalogcode }).then(res => {
        if (res.success) {
          if (this.categoryTypeList.find(val => val.id == row.id)) {
            this.fpForm.classnodeType = row.id;
          } else {
            this.fpForm.catalogNodeCode = "empty";
          }
          this.fpForm.catalogNodeCode = res.data || [];
          this.fpdialog = true;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    submitfpForm() {
      let params = {
        catalogCode: this.selectCurrRow.catalogcode,
        nodeCode: this.fpForm.catalogNodeCode.join(),
        no: this.selectCurrRow.id
      };
      addSystemCatalogNodeCode(params).then(res => {
        this.fpdialog = false;
        if (res.success) {
          this.$message.success(res.msg);
          this.refreshRow();
          sessionStorage.removeItem("tableViewTreeStr");
          this.$store.dispatch("tree/tableViewTree");
          this.$store.dispatch(
            "permission/del_cachedViews",
            "archivesDescription"
          ); //添加缓存组件
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    reset() {
      this.isSearch = false;
      this.classnodeType = "";
      this.searchForm = {
        id: "",
        text: ""
      };
      this.getGridData();
    },
    async getGridData() {
      this.loading = true;
      if (this.fondsCode) {
        let arr = await this.$store.dispatch("fondsCatalog/getCatalogTree", {
          fondsCode: this.fondsCode
        });
        this.loading = false;
        this.gridData = arr;
        this.oldList = arr;
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
    },
    async changeClssType(value) {
      this.searchForm = {
        id: "",
        text: ""
      };
      if (this.fondsCode) {
        if (value) {
          let arr = await this.$store.dispatch("fondsCatalog/getCatalogTree", {
            fondsCode: this.fondsCode
          });
          if (value == "empty") {
            let t = arr.filter(obj => {
              if (this.categoryTypeList.find(val => val.id == obj.id)) {
                return false;
              } else {
                return true;
              }
            });
            if (t.length == 0) {
              this.gridData = [];
              this.catalogcode = "";
            } else {
              this.catalogcode = t[0].catalogcode;
              this.gridData = t;
            }
          } else {
            let t = arr.find(val => val.id == value);
            if (t) {
              this.catalogcode = t.catalogcode;
              this.gridData = [t];
            } else {
              this.gridData = [];
              this.catalogcode = "";
            }
          }
        } else {
          this.refreshRow();
        }
      }
    },
    async refreshRow() {
      let arr = await this.$store.dispatch("fondsCatalog/getCatalogTree", {
        fondsCode: this.fondsCode
      });
      this.gridData = arr;
      this.oldList = arr;
    },
    getDetailFromCatalog() {
      let params = {
        limit: 999,
        star: 1,
        dictionarycatalogcode: "catalogCode"
      };
      selecSystemDictionary(params).then(res => {
        if (res.success) {
          let arr = res.data.list || [];
          this.categoryTypeList = arr.map(t => {
            return {
              id: t.code,
              label: t.name
            };
          });
        } else {
          this.$message.error("获取门类代码失败");
        }
      });
    }
  },
  async created() {
    await this.$store.dispatch("tree/tableViewTree");
    this.getDetailFromCatalog();
    await this.$store.dispatch("fondsCatalog/getFondsList");
  },
  computed: {
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
    },
    fondsList() {
      //全宗数组
      if (this.$store.state.fondsCatalog.fondsList.length > 0) {
        this.fondsCode =
          this.fondsCode ||
          this.$store.state.fondsCatalog.fondsList[0].FONDSCODE;
      }
      return this.$store.state.fondsCatalog.fondsList;
    }
  },
  watch: {
    async fondsCode(newval, oldval) {
      if (oldval != newval && newval) {
        this.loading = true;
        let arr = await this.$store.dispatch("fondsCatalog/getCatalogTree", {
          fondsCode: this.fondsCode
        });
        this.loading = false;
        this.gridData = arr;
        this.oldList = arr;
      }
    }
  }
};
</script>





