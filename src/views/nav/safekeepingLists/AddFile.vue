<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for style="width:100px">请选择门类：</label>
          <el-select size="small" v-model="nodeCode" placeholder="请选择">
            <el-option v-for="item in classData" :label="item.text" :key="item.id" :value="item.id"></el-option>
          </el-select>
        </div>
        <div class="item" style="color:#ff0036">档案上架时，请完整填写下方档号组成项（不包括件号）并查询档案才可上架</div>
      </div>
      <el-form
        :model="searchForm"
        size="small"
        label-width="0"
        ref="searchForm"
        :inline="true"
        v-if="searchFiledList.length"
        label-position="left"
        :rules="rules"
      >
        <el-form-item
          v-for="(item,index) in searchFiledList"
          :key="index"
          class="searchForm"
          :title="item.chineseName"
        >
          <el-input
            v-if="item.inputType == 'T'&& item.type != '4' && item.type != '5'&& item.columnName !='fondsNo' && item.columnName !='archiveCatalogNo' "
            v-model="searchForm[item.columnName+'-'+item.type]"
            auto-complete="off"
            :placeholder="item.chineseName"
          ></el-input>
          <el-select
            v-if="item.inputType === 'S' && item.columnName !='archiveCatalogNo'&& item.columnName !='fondsNo'"
            v-model="searchForm[item.columnName+'-'+item.type]"
            :placeholder="item.chineseName"
            clearable
          >
            <el-option
              v-for="(option,key) in item.dictionaryList"
              :label="option.name"
              :key="key"
              :value="option.name"
            ></el-option>
          </el-select>
          <!-- //全宗 -->
          <el-select
            v-if="item.columnName =='fondsNo'"
            v-model="fondsNo"
            @change="changeFond"
            value-key="FONDSCODE"
            :placeholder="item.chineseName"
            clearable
          >
            <el-option
              v-for="option in fondsList"
              :label="option.NO+' -- '+option.NAME"
              :key="option.FONDSCODE"
              :value="option"
            ></el-option>
          </el-select>
          <!-- 实体分类 -->

          <el-cascader
            v-if="item.columnName == 'archiveCatalogNo'"
            :placeholder="item.chineseName"
            :options="systemClassFondsList"
            v-model="archiveCatalogNoArr"
            @change="selectSystemFond"
            :props="{label:'textId',value:'id',checkStrictly: true,expandTrigger:'hover'}"
            :show-all-levels="false"
            ref="cascader13"
            clearable
          >
            <template slot-scope="{ node, data }">
              <div @click="selectCheked('cascader13',$event)">{{ data.id }} -- {{ data.text }}</div>
            </template>
          </el-cascader>
          <el-date-picker
            v-if="item.type == '4' ||item.type == '5'"
            type="daterange"
            align="right"
            unlink-panels
            placeholder="选择日期"
            v-model="searchForm[item.columnName+'-'+item.type]"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
          <el-cascader
            :options="departmentList"
            v-model="departmentCodeArr"
            :placeholder="item.chineseName"
            @change="selectDepartment"
            v-if="item.columnName == 'departmentCode'"
            :props="{label:'textId',value:'id',checkStrictly: true ,expandTrigger:'hover'}"
            :show-all-levels="false"
            filterable
            clearable
            ref="cascader14"
          >
            <template slot-scope="{ node, data }">
              <div @click="selectCheked('cascader14',$event)">{{ data.id }} -- {{ data.text }}</div>
            </template>
          </el-cascader>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="search">查询</el-button>
        </el-form-item>
        <el-form-item>
          <el-button size="small" @click="reset">重置</el-button>
        </el-form-item>
        <el-form-item style="display:block" label="件号区间：" label-width="85px">
          <el-col :span="11">
            <el-form-item prop="starPieceNo">
              <el-input
                type="text"
                v-model.number="searchForm.starPieceNo"
                size="small"
                placeholder="起始件号"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2" class="line">-</el-col>
          <el-col :span="11">
            <el-form-item prop="endPieceNo">
              <el-input
                type="text"
                v-model.number="searchForm.endPieceNo"
                size="small"
                placeholder="终止件号"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表 （ {{`第${column}列第${row}层`}} ）</div>
        <div>
          <el-button size="small" type="primary" @click="addData">上架</el-button>
          <!-- <el-button size="small" type="primary" @click="addData">创建并上架</el-button> -->
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="dataTable"
          tooltip-effect="dark"
        >
          <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" align="center" width="80px">
            <template slot-scope="scope">{{(scope.$index)+1+index}}</template>
          </el-table-column>
          <el-table-column label="档号" prop="ARCHIVENO" width="200">
            <template slot-scope="scope">
              <span>{{scope.row.ARCHIVENO||scope.row.FOLDERNO}}</span>
            </template>
          </el-table-column>
          <el-table-column label="题名" prop="MAINTITLE"></el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total, prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20,50,100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
  </section>
</template>
<script>
import { Base64 } from "js-base64";
import { deepQuery, deepClone, PrefixZero } from "@/common/js/util";
import { createCellArchive } from "@/api/storeRoom";
import { getTableView } from "@/api/tableView";
import { getSystemNoFormatListByEntityCode } from "@/api/archiveNoformat";
export default {
  data() {
    let validatePieceNo = (rule, value, callback) => {
      if (this.searchForm.starPieceNo) {
        if (/^[0-9]*$/.test(this.searchForm.starPieceNo)) {
          if (!/^[0-9]*$/.test(this.searchForm.endPieceNo)) {
            callback(new Error("件号必须是数字值"));
          }
          if (this.searchForm.starPieceNo >= this.searchForm.endPieceNo) {
            callback(new Error("起始件号不能小于或等于终止件号"));
          } else {
            callback();
          }
        }
      } else {
        callback();
      }
    };
    let validateStarPieceNo = (rule, value, callback) => {
      if (this.searchForm.starPieceNo) {
        if (!/^[0-9]*$/.test(this.searchForm.starPieceNo)) {
          callback(new Error("件号必须是数字值"));
        } else {
          callback();
        }
      } else {
        callback();
      }
    };
    return {
      cellId: "", //阁子id
      column: "", //阁子列
      row: "", //阁子层
      classType: "", //档案门类id
      classData: [], //全部实体表
      nodeCode: "", //已选实体表id
      tableCode: "", //底层门类id
      bottomData: [], //底层门类
      searchFiledList: [], //档号组成项
      departmentCodeArr: "", //已选的所属部门
      fondsNo: "", //全宗号
      systemClassFonds: "", //实体分类号
      archiveCatalogNoArr: [], //实体分类默认展示
      systemClassFondsList: [], //实体分类数组
      rules: {
        starPieceNo: [{ validator: validateStarPieceNo, trigger: "blur" }],
        endPieceNo: [{ validator: validatePieceNo, trigger: "blur" }]
      },
      departmentCode: "",
      diolag: false, //实体分类弹框
      dialogVisible: false,
      loading: false,
      isUpdate: false, //是否是修改
      pageSize: 50,
      currentPage: 1,
      total: 0,
      gridData: [],
      searchForm: {
        starPieceNo: "",
        endPieceNo: ""
      },
      cNodeCode: "" //获取档号组成
    };
  },
  methods: {
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
      this.initData();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.initData();
    },

    addData() {
      //上架
      if (this.searchFiledList.length == 0) {
        this.$message.warning("暂未设置档号组成项，请先设置");
        return;
      }
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要上架的记录");
        return;
      }
      let recordCodes = [];
      selectData.forEach(val => {
        recordCodes.push(val.RECORDCODE);
      });
      let description = "";

      this.searchFiledList.forEach(newitem => {
        let name = newitem.columnName + "-" + newitem.type;
        let itemStr = "";
        let value = this.searchForm[name];
        if (newitem.columnName == "retention") {
          if (value != "") {
            if (
              newitem.dictionaryList.filter(arritem => arritem.name == value)
                .length == 0
            ) {
              value = "";
            } else {
              value = newitem.dictionaryList.filter(
                arritem => arritem.name == value
              )[0].code;
            }
          }
        }
        itemStr = PrefixZero(value, newitem.lenth, newitem.columnName);
        if (newitem.separator) {
          description += itemStr + newitem.separator;
        } else {
          description += itemStr + "";
        }
        // description += itemStr + newitem.separator;
      });
      description = description.slice(0, description.length - 1);

      let params = {
        cellId: this.cellId,
        tableCode: this.tableCode,
        recordCodes: recordCodes.join(","),
        archiveNumber: description,
        description
      };
      this.$confirm(
        "是否将所选" + selectData.length + "条内容上架",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          createCellArchive(params).then(res => {
            if (res.success) {
              this.$message.success("上架成功");
              this.$router.push("/warehouse");
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },

    search() {
      let params = {
        pageSize: 50,
        pageNum: 1
      };
      this.searchFunc(params);
    },
    reset() {
      for (let i in this.searchForm) {
        this.$set(this.searchForm, i, "");
      }
      this.archiveCatalogNoArr = [];
      this.departmentCodeArr = "";
      this.fondsNo = "";
      this.systemClassFonds = "";
      this.departmentCode = "";
      this.currentPage = 1;
      this.pageSize = 50;
      this.initData();
    },

    initData() {
      let params = {
        pageSize: this.pageSize,
        pageNum: this.currentPage
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      let data = [];
      for (let i in this.searchForm) {
        if (this.searchForm[i] && i != "starPieceNo" && i != "endPieceNo") {
          data.push({
            [i]: this.searchForm[i]
          });
        }
      }
      params.type = 0;
      data.push({ "archiveFlag-1": "已归档" });
      params.tableCode = this.tableCode;
      params.shelfFlag = true;
      params.conditions = JSON.stringify(data);
      this.loading = true;
      if (this.searchForm.starPieceNo && this.searchForm.endPieceNo) {
        this.$refs["searchForm"].validate(valid => {
          if (valid) {
            params.starPieceNo = this.searchForm.starPieceNo;
            params.endPieceNo = this.searchForm.endPieceNo;
            getTableView(params)
              .then(res => {
                this.loading = false;
                if (res.data.pageInfo) {
                  this.total = res.data.pageInfo.total || 0;
                  this.gridData = res.data.pageInfo.list || [];
                } else {
                  this.total = 0;
                  this.gridData = [];
                }
              })
              .catch(res => {
                this.loading = false;
              });
          }
        });
      } else {
        getTableView(params)
          .then(res => {
            this.loading = false;
            if (res.data.pageInfo) {
              this.total = res.data.pageInfo.total || 0;
              this.gridData = res.data.pageInfo.list || [];
            } else {
              this.total = 0;
              this.gridData = [];
            }
          })
          .catch(res => {
            this.loading = false;
          });
      }
    },
    getClassData() {
      let data = [];
      this.$store.dispatch("tree/tableViewTree").then(res => {
        data = deepQuery([res], this.classType, data);
        this.classData = this.getCategoryList(deepClone(data[0].children), []);
      });
    },
    getCategoryList(data = [], res = []) {
      //获取所有的底层门类下的实体表
      data.forEach(item => {
        if (item.children) {
          if (item.children.length > 0) {
            this.getCategoryList(item.children, res);
          }
        }
        if (item.li_attr.TYPE === "E") {
          res.push(item);
        }
      });
      return res;
    },
    selectSystemFond(value) {
      //选择实体分类
      if (value.length > 1) {
        this.systemClassFonds = value[value.length - 1];
      } else {
        this.systemClassFonds = value[0] || "";
      }
      this.diolag = false;
      this.searchForm["archiveCatalogNo-1"] = this.systemClassFonds;
    },
    changeFond(value) {
      //选择全宗
      this.fondsNo = value.NO || "";
      this.searchForm["fondsNo-1"] = this.fondsNo;
    },
    selectDepartment(value) {
      //选择所属部门
      if (value.length > 1) {
        this.departmentCode = value[value.length - 1];
      } else {
        this.departmentCode = value[0] || "";
      }
      this.searchForm["departmentCode-1"] = this.departmentCode;
    }
  },
  mounted() {
    // this.initData();
    this.getClassData(); //获取可选的档案底层门类
    this.cellId = Base64.decode(this.$route.query.cellId);
    this.column = Base64.decode(this.$route.query.column);
    this.row = Base64.decode(this.$route.query.row);
    this.classType = Base64.decode(this.$route.query.classType);
    this.$store.dispatch("tree/departmentTree"); //获取部门树
    this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗数组
  },
  watch: {
    nodeCode(newval, oldval) {
      if (newval == "" || oldval != newval) {
        this.searchFiledList = [];
        this.searchForm = {};
        let data = this.classData.filter(item => item.id === newval);

        this.tableCode = data[0].li_attr.TABLECODE; //获取已选实体表的底层门类的tablecode
        this.cNodeCode = data[0].li_attr.cNodeCode; //获取已选实体表的底层门类的tablecode

        getSystemNoFormatListByEntityCode({ entityCode: this.cNodeCode }).then(
          res => {
            if (res.success) {
              let list = res.data || [];
              list.forEach(item => {
                if (item.chineseName != "件号" && item.chineseName != "页数") {
                  this.searchFiledList.push(item);
                  this.$set(
                    this.searchForm,
                    item.columnName + "-" + item.type,
                    ""
                  );
                }
              });
              this.reset();
            }
          }
        );
      }
    },
    async fondsNo(newval, oldval) {
      if (newval !== "") {
        let classnodeId = this.classData.filter(
          item => item.id === this.nodeCode
        )[0].li_attr.cNodeCode; //获取已选实体表的底层门类的id
        let t = this.fondsList.find(item => item.NO == newval);
        if (t) {
          let fondscode = t.FONDSCODE;
          this.systemClassFondsList = await this.$store.dispatch(
            "fondsCatalog/getCatalogTree",
            { fondsCode: fondscode, classnodeId: classnodeId }
          );
        }
      }
    }
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    },
    departmentList() {
      return this.$store.getters.departmentTree;
    },
    fondsList() {
      return this.$store.state.fondsCatalog.fondsList;
    }
  }
};
</script>
<style scoped lang="scss">
.content-header {
  .el-form {
    padding: 0 20px 20px 20px;
    .line {
      text-align: center;
      position: relative;
      left: -5px;
    }
  }
}
</style>




