<template>
  <div class="formbox">
    <div class="btnwrapper1 clearboth">
      <!-- 添加数据 -->
      <slot name="add"></slot>
      <!-- 更新数据 -->
      <slot name="update" :prevCode="prevCode" :nextCode="nextCode"></slot>
      <div class="pull-right lineHeight">
        <span class="require">*</span>为必填项
      </div>
    </div>

    <el-form
      :model="form"
      ref="ruleForm"
      :rules="rules"
      :disabled="disabled"
      :class="disabled ? 'disabledForm' : ''"
    >
      <table class="formcontent" v-loading="loading">
        <tbody ref="contentForm" class="contentForm">
          <tr v-if="tableCardList.length == 0">
            <td colspan="3" rowspan="2" style="text-algin:center">无有效列</td>
          </tr>
          <tr v-for="(item, index) in trArray" v-else :key="index">
            <td
              :colspan="val.COLUMNNO"
              :rowspannum="val.ROWNO"
              v-for="(val, key) in item"
              :key="key"
            >
              <!-- style="width:100%;" -->
              <el-form-item
                :label="val.PROPERTIESINFO1"
                :prop="val.FIELDNAME + '-' + val.TYPE"
                label-width="110px"
                v-if="val.FIELDNAME != 'null'"
                :title="form[val.FIELDNAME + '-' + val.TYPE]"
                style="width:100%;"
              >
                <el-input
                  v-if="
                    val.CONTROLNAME === 'txtInfos' &&
                      val.ROWNO == 1 &&
                      val.INPUTTYPE == 'T' &&
                      val.FIELDNAME != 'fondsNo' &&
                      val.FIELDNAME != 'archiveCatalogNo' &&
                      val.FIELDNAME != 'archiveNo' &&
                      val.FIELDNAME != 'folderNo' &&
                      val.FIELDNAME != 'fillingYear' &&
                      val.TYPE != '4' &&
                      val.TYPE != '5'
                  "
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                  auto-complete="off"
                  :disabled="val.FIELDNAME == 'filetype' ? true : false"
                ></el-input>
                <!-- //归档年度 -->
                <el-input
                  v-if="
                    val.CONTROLNAME === 'txtInfos' &&
                      val.ROWNO == 1 &&
                      val.INPUTTYPE == 'T' &&
                      val.FIELDNAME == 'fillingYear' &&
                      val.TYPE != '4' &&
                      val.TYPE != '5'
                  "
                  @blur="changeFillingYear"
                  v-model="fillYearNotCatalog"
                  auto-complete="on"
                >
                  <template slot="prepend" v-if="catalogCode">{{catalogCode}}</template>
                </el-input>
                <!-- //档号生成 -->
                <el-input
                  v-if="
                    (val.CONTROLNAME === 'txtInfos' &&
                      val.ROWNO == 1 &&
                      val.INPUTTYPE == 'T' &&
                      val.FIELDNAME == 'archiveNo' &&
                      val.TYPE != '4' &&
                      val.TYPE != '5') ||
                      val.FIELDNAME == 'folderNo'
                  "
                  ref="inputCreateNo"
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                  auto-complete="on"
                  @focus="createNo($event,val.FIELDNAME)"
                  :placeholder="
                    val.FIELDNAME == 'archiveNo'
                      ? '点击生成档号'
                      : '点击生成案卷档号'
                  "
                >
                  <i
                    slot="suffix"
                    class="el-input__icon el-icon-help"
                    @click.stop.prevent="createNo($event,val.FIELDNAME)"
                    style="color:#409eff;cursor:pointer"
                  ></i>
                </el-input>

                <el-select
                  v-if="val.CONTROLNAME === 'cboInfos'"
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                  clearable
                >
                  <el-option
                    v-for="(option, key) in val.PROPERTIESINFO2"
                    :label="option.name"
                    :key="key"
                    :value="option.name"
                  ></el-option>
                </el-select>
                <el-input
                  v-if="val.CONTROLNAME === 'txtInfos' && val.ROWNO > 1"
                  type="textarea"
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                ></el-input>
                <!-- //全宗 -->
                <el-select
                  v-if="
                    val.CONTROLNAME === 'txtInfos' && val.FIELDNAME == 'fondsNo'
                  "
                  @change="selectChange"
                  v-model="fondsNo"
                  value-key="NO"
                  clearable
                >
                  <el-option
                    v-for="option in fondsList"
                    :label="option.NO + ' -- ' + option.NAME"
                    :key="option.NO"
                    :value="option"
                  ></el-option>
                </el-select>

                <el-date-picker
                  v-if="
                    val.CONTROLNAME === 'txtInfos' &&
                      val.FIELDNAME != 'createDate' &&
                      val.TYPE == 4
                  "
                  type="date"
                  placeholder="选择日期"
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                  value-format="yyyy-MM-dd"
                  format="yyyy-MM-dd"
                ></el-date-picker>
                <!-- 成文日期格式为yyyyMMdd -->
                <el-date-picker
                  v-if="
                    (val.CONTROLNAME === 'txtInfos' &&
                      val.FIELDNAME == 'createDate' &&
                      val.TYPE == 4) ||
                      val.TYPE == 5
                  "
                  type="date"
                  placeholder="选择日期"
                  v-model="form[val.FIELDNAME + '-' + val.TYPE]"
                  value-format="yyyyMMdd"
                  format="yyyyMMdd"
                ></el-date-picker>
                <el-cascader
                  :options="departmentList"
                  v-model="departmentCodeArr"
                  @change="selectDepartment"
                  v-if="val.FIELDNAME == 'departmentCode'"
                  :props="{
                    label: 'textId',
                    value: 'id',
                    checkStrictly: true,
                    expandTrigger: 'hover'
                  }"
                  :show-all-levels="false"
                  filterable
                  clearable
                  ref="cascader7"
                >
                  <template slot-scope="{ node, data }">
                    <div @click="selectCheked('cascader7', $event)">{{ data.id }} -- {{ data.text }}</div>
                  </template>
                </el-cascader>
                <el-cascader
                  class="archiveNo"
                  v-if="val.FIELDNAME == 'archiveCatalogNo'"
                  :options="systemClassFondsList"
                  :key="cascaderKey"
                  v-model="archiveCatalogNoArr"
                  :placeholder="Array.isArray(archiveCatalogNoArr)?archiveCatalogNoArr.join():archiveCatalogNoArr"
                  @change="selectSystemFond"
                  :props="{
                    label: 'textId',
                    value: 'id',
                    checkStrictly: true,
                    expandTrigger: 'hover'
                  }"
                  :show-all-levels="false"
                  ref="cascader8"
                  clearable
                >
                  <template slot-scope="{ node, data }">
                    <div @click="selectCheked('cascader8', $event)">{{ data.id }} -- {{ data.text }}</div>
                  </template>
                </el-cascader>
              </el-form-item>
            </td>
          </tr>
        </tbody>
      </table>
    </el-form>
  </div>
</template>
<script>
import { selecSystemDictionary } from "@/api/dictionary";
import { getArchives } from "@/api/tableView";
import { PrefixZero, familyTree, getDataFromId } from "@/common/js/util";
export default {
  name: "Formbox",
  props: {
    FoldformDatSystem: Array,
    formDatSystem: Array,
    tableCardList: Array,
    retentionArray: Array,
    archivesData: Object,
    gridData: Array,
    recordCode: String,
    tableCode: String,
    disabled: Boolean,
    classnodeId: String,
    checkedNode: {
      type: Object,
      default: () => null
    },
    isAddFold: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      validateFillingYear: (rule, value, callback) => {
        if (value) {
          let reg = /^[a-z,A-Z,.]*[0-9]{4}$/;
          if (!reg.test(value)) {
            callback(new Error("请输入4位整数"));
          } else {
            callback();
          }
        } else {
          callback();
        }
      },
      loading: false,
      trArray: [],
      prevCode: "",
      nextCode: "",
      form: {},
      rules: {},
      fillYearNotCatalog: "", //归档年度后四位
      catalogCodeList: [], // 辅助字典门类代码
      departmentCodeArr: [],
      archiveCatalogNoArr: [], //实体分类默认展示
      systemClassFondsList: [], //实体分类数组
      cascaderKey: 1
    };
  },
  methods: {
    selectChange() {
      ++this.cascaderKey;
    },
    getPrevAndNextCode() {
      //获取上一条code和下一条code
      let index = this.gridData.findIndex(item => {
        return item.RECORDCODE == this.$parent.$parent.recordCode;
      });
      if (this.gridData.length == 1) {
        //说明只有一个
        this.prevCode = "";
        this.nextCode = "";
      } else {
        if (index == 0) {
          this.prevCode = "";
          this.nextCode = this.gridData[index + 1].RECORDCODE;
        } else if (index == this.gridData.length - 1) {
          this.prevCode = this.gridData[index - 1].RECORDCODE;
          this.nextCode = "";
        } else {
          this.prevCode = this.gridData[index - 1].RECORDCODE;
          this.nextCode = this.gridData[index + 1].RECORDCODE;
        }
      }

      this.loading = false;
    },
    prevData() {
      //上一条
      ++this.cascaderKey;
      this.loading = true;
      let params = {
        tableCode: this.tableCode,
        recordCode: this.prevCode
      };
      getArchives(params).then(data => {
        if (data.code === 403) {
          this.$message.warning("暂无权限访问");
          return;
        } else {
          if (data.success) {
            this.$emit("update:archivesData", data.data);
            this.$emit("update:recordCode", this.prevCode);
            this.getPrevAndNextCode();
          } else {
            this.$message.error(data.msg);
          }
        }
      });
    },
    nextData() {
      //下一条
      ++this.cascaderKey;
      this.loading = true;
      let params = {
        tableCode: this.tableCode,
        recordCode: this.nextCode
      };
      getArchives(params).then(data => {
        if (data.code === 403) {
          this.$message.warning("暂无权限访问");
          return;
        } else {
          if (data.success) {
            this.$emit("update:archivesData", data.data);
            this.$emit("update:recordCode", this.nextCode);
            this.getPrevAndNextCode();
          } else {
            this.$message.error(data.msg);
          }
        }
      });
    },
    createNo(e, filedname) {
      if (filedname == "folderNo") {
        this.createArchiveNo(this.FoldformDatSystem, filedname + "-1"); //案卷档号
      } else {
        this.createArchiveNo(this.formDatSystem, filedname + "-1");
      }
    },
    createArchiveNo(formDatSystemList, filedname) {
      //生成档号
      if (formDatSystemList.length == 0) {
        this.$message.warning("暂未设置档号格式，请设置");
        return false;
      }
      let noValueField = [];
      formDatSystemList.forEach(item => {
        let name = item.columnName + "-" + item.type;
        let value = this.form[name];
        if (item.columnName === "fillingYear") {
          let reg = /^[a-z,A-Z,.]*[0-9]{4}$/;
          if (!reg.test(value)) {
            noValueField.push(item.chineseName);
          }
        } else if (
          !value ||
          parseInt(value) === 0 ||
          String(value).trim() == ""
        ) {
          noValueField.push(item.chineseName);
        }
      });

      if (noValueField.length > 0) {
        this.$alert(
          `请输入档号组成项必填字段：${noValueField.join()}`,
          "提示",
          {
            type: "warning"
          }
        );
        let r = this.$refs.inputCreateNo;
        if (r.length) {
          r.forEach(t => {
            t.blur();
          });
        }
        return false;
      } else {
        let archiveStr = "";
        let ok;
        let flag = true;
        ok: for (let i = 0; i < formDatSystemList.length; i++) {
          let item = formDatSystemList[i];
          let name = item.columnName + "-" + item.type;
          let itemStr = "";
          let value = this.form[name];

          if (item.columnName == "retention") {
            if (value) {
              if (
                this.retentionArray.filter(newitem => newitem.name == value)
                  .length == 0
              ) {
                this.$message.error({
                  type: "error",
                  message: "当前已选保管期限不属于已定义保管期限表，请重新选择",
                  duration: 5000
                });
                flag = false;
                break ok;
              } else {
                value = this.retentionArray.filter(
                  newitem => newitem.name == value
                )[0].code;
              }
            }
          }

          itemStr = PrefixZero(value, item.lenth, item.columnName);
          if (item.separator) {
            archiveStr += itemStr + item.separator;
          } else {
            archiveStr += itemStr + "";
          }
        }
        if (flag) {
          this.$set(
            this.form,
            filedname,
            archiveStr.slice(0, archiveStr.length - 1)
          );
          return true;
        } else {
          this.$set(this.form, "archiveNo-1", "");
          return false;
        }
      }
    },
    selectCheked(name, event) {
      //点击文字直接绑定
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    },
    getDepartmentcode() {
      //获取所属部门对应的数组
      let code = this.form["departmentCode-1"];
      if (code != "") {
        return code;
      } else {
        return "";
      }
    },

    cancel() {
      this.$emit("cancel", false);
    },
    editTemplateForm() {
      let _this = this;
      let dataList = this.tableCardList || [];
      let trArray = []; //存储每一行的td
      let arr = [];
      dataList.forEach(function(val, index) {
        arr.push(val.TRNUM);
      });
      arr.sort(_this.comparyMaxTrNum); //获取最大的tr数
      for (var i = 0; i < arr[0]; i++) {
        let tr1 = [];
        dataList.forEach(function(val, index) {
          if (val.TRNUM == i + 1) {
            tr1.push(val);
          }
        });
        if (tr1.length > 0) {
          trArray.push(tr1);
        }
      }
      _this.trArray = trArray;
    },

    comparyMaxTrNum(a, b) {
      return b - a;
    },
    submitFormData(formName, type, isappend) {
      if (this.isAddFold) {
        type = "FoldformData";
      }
      if (this.form.hasOwnProperty("fondsNo-1")) {
        this.form["fondsNo-1"] = this.fondsNo;
      }
      let flag = true;
      if (this.form["archiveFlag-1"] == "已归档") {
        if (this.form.hasOwnProperty("folderNo-1")) {
          flag = this.createArchiveNo(this.FoldformDatSystem, "folderNo-1");
        }
        if (this.form.hasOwnProperty("archiveNo-1")) {
          flag = this.createArchiveNo(this.formDatSystem, "archiveNo-1");
        }
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (flag) {
            this.loading = true;
            this.$emit(type, this.form, false, isappend);
          }
        } else {
          this.loading = false;
          return false;
        }
      });
    },
    addFormData(formName) {
      //添加
      this.submitFormData(formName, "formData");
    },
    appendData(formName) {
      //追加
      this.submitFormData(formName, "formData", "formbox");
    },
    updateformData(formName) {
      //修改
      this.submitFormData(formName, "updateformData");
    },
    resetForm(formName) {
      this.$refs[formName].resetFields(); //因为这个置空是将值恢复为默认值
      for (let i in this.form) {
        this.form[i] = "";
      }
      this.fillYearNotCatalog = "";
      this.departmentCodeArr = "";
      this.systemClassFondsList = [];
      this.archiveCatalogNoArr = [];
    },
    selectDepartment(value) {
      //选择所属部门
      let code = "";
      if (value) {
        if (value.length > 1) {
          code = value[value.length - 1];
        } else {
          code = value[0] || "";
        }
      }

      this.form["departmentCode-1"] = code;
    },

    selectSystemFond(value) {
      //选择实体分类号
      let code = "";
      if (value.length > 1) {
        code = value[value.length - 1];
      } else {
        code = value[0] || "";
      }

      this.form["archiveCatalogNo-1"] = code;
      let arr = this.$refs.cascader8[0].getCheckedNodes();
      if (arr.length) {
        this.form["catalogCode-1"] = arr[0].data.catalogcode;
      }
      this.changeFillingYear();
    },
    changeFillingYear(value) {
      let list = this.catalogCodeList;
      if (
        this.form.hasOwnProperty("fillingYear-1") &&
        this.form.hasOwnProperty("archiveCatalogNo-1")
      ) {
        let code = this.form["archiveCatalogNo-1"];
        let o = getDataFromId(this.systemClassFondsList, code);
        let t;
        let arr = [];
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
            this.form["fillingYear-1"] = t.id + this.fillYearNotCatalog;
          } else {
            this.form["fillingYear-1"] = this.fillYearNotCatalog;
          }
        } else {
          this.form["fillingYear-1"] = this.fillYearNotCatalog;
        }
        // if (this.catalogCode) {
        //   this.form["fillingYear-1"] =
        //     this.catalogCode + this.fillYearNotCatalog;
        // } else {
        //   this.form["fillingYear-1"] = this.fillYearNotCatalog;
        // }
      }
    },
    getDepartmentandArchiveNo() {
      this.departmentCodeArr = [];
      this.archiveCatalogNoArr = [];
      if (this.form.hasOwnProperty("departmentCode-1")) {
        this.departmentCodeArr = this.form["departmentCode-1"];
      }
      if (this.form.hasOwnProperty("archiveCatalogNo-1")) {
        this.archiveCatalogNoArr = this.form["archiveCatalogNo-1"];
      }
    },
    getFillYear() {
      if (this.form.hasOwnProperty("fillingYear-1")) {
        let reg = /[0-9]+/g; //匹配数字
        if (this.form["fillingYear-1"]) {
          let arr = this.form["fillingYear-1"].match(reg);
          if (arr) {
            this.fillYearNotCatalog = arr[arr.length - 1];
          } else {
            this.fillYearNotCatalog = "";
          }
        } else {
          this.fillYearNotCatalog = "";
        }
      }
    },
    getCreateDate() {
      if (this.form.hasOwnProperty("createDate-4")) {
        let date = new Date().format("yyyyMMdd");
        if (Object.keys(this.archivesData).length === 0) {
          this.$set(this.form, "createDate-4", date);
        } else {
          this.$set(this.form, "createDate-4", this.form["createDate-4"]);
        }
      }
    },
    getDocumentNo() {
      if (this.form.hasOwnProperty("documentNo-1")) {
        if (this.form["documentNo-1"] == "" || !this.form["documentNo-1"]) {
          this.$set(this.form, "documentNo-1", "〔〕");
        }
      }
    },
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
        let reg = /[a-z,A-Z]+/g; //匹配字母
        let t = String(code).match(reg);

        if (t) {
          return t.join();
        }
        return t;
        // let o = getDataFromId(this.systemClassFondsList, code);
        // let t;
        // if (o) {
        //   arr = familyTree(
        //     this.systemClassFondsList,
        //     o.catalogcode,
        //     "parentcatalogcode",
        //     "catalogcode"
        //   );
        // }
        // if (arr.length > 0) {
        //   t = arr[arr.length - 1];
        // }
        // if (t) {
        //   if (list.find(val => val.id === t.id)) {
        //     return t.id;
        //   }
        // } else {
        //   return "";
        // }
      } else {
        if (this.checkedNode.li_attr.TYPE === "catalog") {
          return this.checkedNode.NO;
        }
      }
    }
  },
  created() {
    this.loading = true;
    this.getCatalogCodeList();
  },
  mounted() {
    this.editTemplateForm();
    this.tableCardList
      .filter(item => item.FIELDNAME != "null")
      .forEach(val => {
        if (Object.keys(this.archivesData).length == 0) {
          this.$set(this.form, val.FIELDNAME + "-" + val.TYPE, "");
        } else {
          this.$set(
            this.form,
            val.FIELDNAME + "-" + val.TYPE,
            this.archivesData[val.FIELDNAME + "-" + val.TYPE] || ""
          );
        }
        if (val.CANNULL == "T") {
          this.$set(this.rules, val.FIELDNAME + "-" + val.TYPE, [
            { required: true, message: "请输入必填项" }
          ]);
        }
        if (val.FIELDNAME === "fillingYear") {
          this.$set(this.rules, "fillingYear" + "-" + val.TYPE, [
            { validator: this.validateFillingYear, trigger: "blur" }
          ]);
        }
      });

    if (this.checkedNode) {
      if (this.checkedNode.li_attr.TYPE === "catalog") {
        this.$set(this.form, "catalogCode-1", this.checkedNode.CATALOGCODE);
      } else if (this.checkedNode.li_attr.TYPE === "classify") {
        //编研
        this.$set(this.form, "CATALOG_CODE-1", this.checkedNode.id);
      } else {
        this.$set(this.form, "catalogCode-1", "");
      }
    }
    if (JSON.stringify(this.archivesData) != "{}") {
      if (!this.isAddFold) {
        this.getPrevAndNextCode();
      }
    } else {
      //添加已选的全宗和实体
      if (this.checkedNode) {
        if (this.checkedNode.li_attr.TYPE === "catalog") {
          if (this.form.hasOwnProperty("archiveCatalogNo-1")) {
            this.$set(this.form, "archiveCatalogNo-1", this.checkedNode.NO);
          }
          if (this.form.hasOwnProperty("fondsNo-1")) {
            this.$set(this.form, "fondsNo-1", this.checkedNode.FONDSNO);
          }
        }
      }
    }
    this.getFillYear(); //处理归档年度
    this.getCreateDate(); //处理成文日期
    this.getDepartmentandArchiveNo(); //处理部门和实体分类号
    this.getDocumentNo(); //处理文号
    this.loading = false;
  },

  computed: {
    fondsNo: {
      //全宗号
      get() {
        let code = "";
        if (this.form.hasOwnProperty("fondsNo-1")) {
          code = this.form["fondsNo-1"];
        }
        return this.form["fondsNo-1"];
      },
      set(val) {
        this.form["fondsNo-1"] = val.NO;
      }
    },
    archiveCatalogNo() {
      //实体分类号
      let code = this.form["archiveCatalogNo-1"];
      return code;
    },
    departmentList() {
      return this.$store.getters.departmentTree;
    },
    fondsList() {
      return this.$store.state.fondsCatalog.fondsList;
    },
    catalogCode() {
      let code = this.form["fillingYear-1"];
      return this.getCataLogCode(code);
    }
  },
  watch: {
    archivesData: {
      handler(newval, oldval) {
        this.form = {};
        this.tableCardList
          .filter(item => item.FIELDNAME != "null")
          .forEach(val => {
            this.$set(this.form, val.FIELDNAME + "-" + val.TYPE, "");
          });
        for (let i in newval) {
          this.$set(this.form, i, newval[i]);
        }
        this.getFillYear();
        this.getDepartmentandArchiveNo();
      },
      deep: true
    },
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
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.formbox {
  min-height: 500px;
  .btnwrapper1 {
    padding: 10px 15px;
    border-bottom: 1px solid #ccc;
    .lineHeight {
      margin-top: 12px;
      .require {
        color: #ff0036;
        margin-right: 3px;
      }
    }
  }
  .formcontent {
    padding: 10px;
    width: 100%;
    tbody {
      width: 100%;

      td {
        width: 33%;
        vertical-align: top;
      }
    }
  }
  .el-form-item {
    margin: 0 0 5px 0;
    text-align: center;
  }

  .archiveNo /deep/ .el-input__inner::placeholder {
    color: #606266 !important;
  }
  /* 谷歌 */
  .archiveNo /deep/ .el-input__inner::-webkit-input-placeholder {
    color: #606266 !important;
  }
  /* 火狐 */
  .archiveNo /deep/ .el-input__inner:-moz-placeholder {
    color: #606266 !important;
  }
  /*ie*/
  .archiveNo /deep/ .el-input__inner:-ms-input-placeholder {
    color: #606266 !important;
  }
}
</style>
