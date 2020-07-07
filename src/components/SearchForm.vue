<template>
  <!-- 根据字段返回form表单 -->
  <div style="min-height:300px">
    <!-- 搜索的 -->
    <div v-if="isAddType" class="flex-wrap">
      <el-form-item
        :label="showLabel?field.PROPERTIESINFO1:''"
        v-for="(field,index) in fieldArray"
        :key="index"
        class="searchForm"
        :class="field.TYPE == '4' ||field.TYPE == '5'?'itemContentAutoWidth':''"
        :title="field.PROPERTIESINFO1"
        :prop="required?field.FIELDNAME:''"
      >
        <!-- 如果是日期选择框 将宽度设为自动 补充class -->
        <el-input
          v-if="getIsShowInput(field)"
          v-model="form[field.FIELDNAME+'-'+field.TYPE]"
          auto-complete="off"
          :placeholder="showLabel?'请输入':field.PROPERTIESINFO1"
          @keydown.enter.native="changeFunc"
        ></el-input>
        <el-select
          v-if="field.CONTROLNAME === 'cboInfos' && field.FIELDNAME !='archiveCatalogNo'&& field.FIELDNAME !='fondsNo'"
          v-model="form[field.FIELDNAME+'-'+field.TYPE]"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
          @change="changeFunc"
        >
          <el-option
            v-for="(option,key) in field.PROPERTIESINFO2"
            :label="option.name"
            :key="key"
            :value="option.name"
          ></el-option>
        </el-select>
        <!-- //全宗 -->
        <el-select
          v-if="field.CONTROLNAME === 'txtInfos' && field.FIELDNAME =='fondsNo'"
          v-model="fondsNo"
          @change="changeFond"
          value-key="FONDSCODE"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <el-option
            v-for="option in fondsList"
            :label="option.NO+' -- '+option.NAME"
            :key="option.FONDSCODE"
            :value="option"
          ></el-option>
        </el-select>

        <el-date-picker
          v-if="field.CONTROLNAME === 'txtInfos' && field.TYPE == '4' ||field.TYPE == '5'"
          type="daterange"
          placeholder="选择日期"
          v-model="form[field.FIELDNAME+'-'+field.TYPE]"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="changeFunc"
        ></el-date-picker>
        <el-cascader
          clearable
          :options="departmentList"
          v-model="departmentCodeArr"
          @change="selectDepartment"
          v-if="field.FIELDNAME == 'departmentCode'"
          :props="{label:'textId',value:'id',checkStrictly: true ,expandTrigger:'hover'}"
          :show-all-levels="false"
          filterable
          ref="cascader1"
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <template slot-scope="{ node, data }">
            <div @click="selectCheked('cascader1',$event)">{{ data.id }} -- {{ data.text }}</div>
          </template>
        </el-cascader>

        <!-- 实体分类 -->
        <el-cascader
          v-if="field.FIELDNAME == 'archiveCatalogNo'"
          :options="systemClassFondsList"
          v-model="archiveCatalogNoArr"
          @change="selectSystemFond"
          :props="{label:'textId',value:'id',checkStrictly: true,expandTrigger:'hover'}"
          :show-all-levels="false"
          ref="cascader3"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <template slot-scope="{ node, data }">
            <div @click="selectCheked('cascader3',$event)">{{ data.id }} -- {{ data.text }}</div>
          </template>
        </el-cascader>
      </el-form-item>
    </div>
    <div v-else class="flex-wrap">
      <el-form-item
        :label="showLabel?field.PROPERTIESINFO1:''"
        v-for="(field,index) in fieldArray"
        :key="index"
        class="searchForm"
        :title="field.PROPERTIESINFO1"
        :prop="required?field.FIELDNAME:''"
        :rules="field.FIELDNAME==='fillingYear'?[{validator: validateFillingYear, trigger: 'blur'},{required: true, message: '请输入必填项'}]:{required: true, message: '请输入必填项'}"
      >
        <el-input
          v-if="getIsShowInput(field)"
          v-model="form[field.FIELDNAME]"
          auto-complete="off"
          :placeholder="showLabel?'请输入':field.PROPERTIESINFO1"
        ></el-input>
        <el-input
          v-if="field.FIELDNAME =='fillingYear'"
          @blur="changeFillingYear"
          v-model="fillYearNotCatalog"
          auto-complete="off"
          :placeholder="showLabel?'请输入':field.PROPERTIESINFO1"
        >
          <template slot="prepend" v-if="catalogCode">{{catalogCode}}</template>
        </el-input>

        <el-select
          v-if="field.CONTROLNAME === 'cboInfos'  "
          v-model="form[field.FIELDNAME]"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <el-option
            v-for="(option,key) in field.PROPERTIESINFO2"
            :label="option.name"
            :key="key"
            :value="option.name"
          ></el-option>
        </el-select>
        <!-- //全宗 -->
        <el-select
          v-if="field.CONTROLNAME === 'txtInfos' && field.FIELDNAME =='fondsNo'"
          v-model="fondsNo"
          @change="changeFond"
          value-key="FONDSCODE"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <el-option
            v-for="option in fondsList"
            :label="option.NO+' -- '+option.NAME"
            :key="option.FONDSCODE"
            :value="option"
          ></el-option>
        </el-select>

        <el-date-picker
          v-if="field.CONTROLNAME === 'txtInfos' && field.TYPE == '4' ||field.TYPE == '5'"
          type="daterange"
          placeholder="选择日期"
          v-model="form[field.FIELDNAME+'-'+field.TYPE]"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
        <el-cascader
          clearable
          :options="departmentList"
          v-model="departmentCodeArr"
          @change="selectDepartment"
          v-if="field.FIELDNAME == 'departmentCode'"
          :props="{label:'textId',value:'id',checkStrictly: true ,expandTrigger:'hover'}"
          :show-all-levels="false"
          filterable
          ref="cascader1"
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <template slot-scope="{ node, data }">
            <div @click="selectCheked('cascader1',$event)">{{ data.id }} -- {{ data.text }}</div>
          </template>
        </el-cascader>

        <!-- 实体分类 -->
        <el-cascader
          v-if="field.FIELDNAME == 'archiveCatalogNo'"
          :options="systemClassFondsList"
          v-model="archiveCatalogNoArr"
          @change="selectSystemFond"
          :props="{label:'textId',value:'id',checkStrictly: true,expandTrigger:'hover'}"
          :show-all-levels="false"
          ref="cascader3"
          clearable
          :placeholder="showLabel?'请选择':field.PROPERTIESINFO1"
        >
          <template slot-scope="{ node, data }">
            <div @click="selectCheked('cascader3',$event)">{{ data.id }} -- {{ data.text }}</div>
          </template>
        </el-cascader>
      </el-form-item>
    </div>
  </div>
</template>
<script>
import { selecSystemDictionary } from "@/api/dictionary";
import { familyTree, getDataFromId } from "@/common/js/util";

export default {
  name: "searchForm",
  props: {
    defaultProps: Object, //暂时不用
    fieldArray: Array,
    form: Object,
    classnodeId: String, //门类id 用于获取实体分类
    nodeCode: String, //实体表nodecode
    showLabel: {
      //是否显示label
      type: Boolean,
      default: true
    },
    required: {
      //字段是否必填
      type: Boolean,
      default: false
    },
    isAddType: {
      //v-model是否需要绑定type
      type: Boolean,
      default: true
    },
    submitFunc: {
      //传递查询函数 回车或者选择后执行
      type: Function,
      default: null
    },
    checkedNode: {
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      validateFillingYear: (rule, value, callback) => {
        let reg = /^[a-z,A-Z,.]*[0-9]{4}$/;
        if (!reg.test(value)) {
          callback(new Error("请输入4位整数"));
        } else {
          callback();
        }
      },
      departmentList: [],
      fondsList: [],
      fondsNo: "",
      systemClassFondsList: [],
      archiveCatalogNoArr: [],
      departmentCodeArr: [],
      fillYearNotCatalog: "", //归档年度后四位

      rowData: null
    };
  },
  methods: {
    getCatalogCodeList() {
      let params = {
        limit: 999,
        star: 1,
        dictionarycatalogcode: "catalogCode"
      };
      selecSystemDictionary(params).then(res => {
        if (res.success) {
          let arr = res.data.list || [];
          this.catalogCodeList = arr.map(t => {
            return {
              id: t.code,
              label: t.name
            };
          });
        } else {
          this.$message.error("获取门类代码失败");
        }
      });
    },
    getCataLogCode(code) {
      let list = this.catalogCodeList;
      let arr = [];
      if (code) {
        //是否有值 有的话获取最前面的门类代码
        let o = getDataFromId(this.systemClassFondsList, code);
        let t;
        if (o) {
          arr = familyTree(
            this.systemClassFondsList,
            o.catalogcode,
            "parentcatalogcode",
            "catalogcode"
          );
        }
        if (arr.length > 0) {
          t = arr[arr.length - 1];
        }
        if (t) {
          if (list.find(val => val.id === t.id)) {
            return t.id;
          }
        } else {
          return "";
        }
      } else {
        if (this.checkedNode.li_attr.TYPE === "catalog") {
          return this.checkedNode.NO;
        }
      }
    },
    getIsShowInput(field) {
      if (
        field.CONTROLNAME === "txtInfos" &&
        field.INPUTTYPE == "T" &&
        field.TYPE != "4" &&
        field.TYPE != "5" &&
        field.FIELDNAME != "fondsNo" &&
        field.FIELDNAME != "archiveCatalogNo"
      ) {
        if (field.FIELDNAME == "fillingYear") {
          if (this.isAddType) {
            return true;
          } else {
            return false;
          }
        } else {
          return true;
        }
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
    changeFunc() {
      if (this.isAddType && this.submitFunc) {
        this.submitFunc();
      }
    },
    changeFond(value) {
      //全宗
      this.fondsNo = value.NO || "";
      if (!this.isAddType) {
        //如果是预归档
        this.form["fondsNo"] = this.fondsNo;
        return;
      }
      this.form["fondsNo-1"] = this.fondsNo;
      this.changeFunc();
    },
    selectSystemFond(value) {
      let code = "";
      if (value.length > 1) {
        code = value[value.length - 1];
      } else {
        code = value[0] || "";
      }

      if (!this.isAddType) {
        //如果是预归档
        this.form["archiveCatalogNo"] = code;
        this.changeFillingYear();
        return;
      }

      this.form["archiveCatalogNo-1"] = code;
      this.changeFunc();
    },
    selectDepartment(value) {
      //选择所属部门
      let code = "";
      if (value.length > 1) {
        code = value[value.length - 1];
      } else {
        code = value[0] || "";
      }
      if (!this.isAddType) {
        //如果是预归档
        this.form["departmentCode"] = code;
        return;
      }
      this.form["departmentCode-1"] = code;
      this.changeFunc();
    },
    resetForm() {
      for (let i in this.form) {
        this.$set(this.form, i, "");
      }
      this.fillYearNotCatalog = "";
      this.fondsNo = "";
      this.departmentCodeArr = [];
      this.archiveCatalogNoArr = [];
    },
    changeFillingYear(value) {
      if (this.form.hasOwnProperty("fillingYear")) {
        if (this.catalogCode) {
          this.form["fillingYear"] = this.catalogCode + this.fillYearNotCatalog;
        } else {
          this.form["fillingYear"] = this.fillYearNotCatalog;
        }
      }
    },
    getCreateDate() {
      if (this.form.hasOwnProperty("createDate")) {
        let date = new Date().format("yyyyMMdd");
        this.$set(this.form, "createDate", date);
      }
    },
    getDocumentNo() {
      if (this.form.hasOwnProperty("documentNo-1")) {
        if (this.form["documentNo"] == "" || !this.form["documentNo"]) {
          this.$set(this.form, "documentNo", "〔〕");
        }
      }
    },
    getDepartmentandArchiveNo() {
      this.departmentCodeArr = [];
      this.archiveCatalogNoArr = [];
      if (this.form.hasOwnProperty("departmentCode")) {
        this.departmentCodeArr = this.form["departmentCode"];
      }
      if (this.form.hasOwnProperty("archiveCatalogNo")) {
        this.archiveCatalogNoArr = this.form["archiveCatalogNo"];
      }
    }
  },
  created() {
    this.getCatalogCodeList();
  },
  mounted() {
    this.$store.dispatch("tree/departmentTree").then(() => {
      this.departmentList = this.$store.getters.departmentTree;
    }); //获取部门树
    this.$store.dispatch("fondsCatalog/getFondsList").then(() => {
      this.fondsList = this.$store.state.fondsCatalog.fondsList;
    }); //获取全宗数组
    this.getCreateDate(); //处理成文日期
    this.getDepartmentandArchiveNo(); //处理部门和实体分类号
    this.getDocumentNo(); //处理文号
  },
  watch: {
    async fondsNo(newval, oldval) {
      if (newval != "") {
        let t = this.fondsList.find(item => item.NO == newval);
        if (t) {
          let fondscode = t.FONDSCODE;
          this.systemClassFondsList = await this.$store.dispatch(
            "fondsCatalog/getCatalogTree",
            { fondsCode: fondscode, classnodeId: this.classnodeId }
          );
        }
        if (!this.isAddType) {
          //如果是预归档
          if (this.form.hasOwnProperty("archiveCatalogNo")) {
            this.form["archiveCatalogNo"] = "";
          }
        } else {
          this.form["archiveCatalogNo-1"] = "";
        }
      }
    },
    checkedNode: {
      handler(newval) {
        if (newval && newval.li_attr.TYPE === "catalog") {
          this.resetForm();
          this.fondsNo = newval.FONDSNO;
        }
      },
      deep: true
    }
  },
  computed: {
    catalogCode() {
      let code = this.form["archiveCatalogNo"];
      return this.getCataLogCode(code);
    }
  }
};
</script>
<style scoped style="scss">
.itemContentAutoWidth >>> .el-form-item__content {
  width: auto;
}
</style>