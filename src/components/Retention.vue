<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
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
        <div class="item">
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

        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" style="margin-top:-15px">
        <div class="item">
          <label for>归档范围：</label>
          <el-input
            style="width:500px"
            size="small"
            type="text"
            placeholder="请输入内容"
            v-model="searchForm.title"
            @keyup.enter.native="search"
          ></el-input>
        </div>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;">
      <div style="padding:15px 15px 100px 15px;">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          ref="tableBox"
          tooltip-effect="dark"
          :row-key="isSearch?'':'nodeCode'"
          :row-class-name="getRowClassName"
          :expand-row-keys="expandKeys"
        >
          <el-table-column label="编号" align="left" prop="description" min-width="20%"></el-table-column>
          <!-- <el-table-column label="分类" align="left" prop="departmentName" width="180px"></el-table-column> -->
          <el-table-column label="归档范围" align="left" prop="title" min-width="70%"></el-table-column>
          <el-table-column label="归档期限" align="center" prop="dateOfCustody" width="90px;"></el-table-column>
        </el-table>
      </div>
    </el-col>
  </section>
</template>
<script>
import { getFilingScopeTreeMenu, getFilingScopeTreeByParms } from "@/api/file";
import { deepQuery, deepClone } from "@/common/js/util";
//***
// 注意 接口传的是参数是departmentCoDE 实际的值是实体分类的code
//
export default {
  data() {
    return {
      loading: false,
      gridData: [],
      expandKeys: [],
      cNodeCode: "",
      departmentCode: "",
      searchForm: {
        //搜索的表单
        name: "",
        departmentCode: "",
        selectedOptions: "",
        title: ""
      },
      isSearch: false,
      oldData: [],
      fondsCode: "",
      systemClassFondsList: [] //实体分类数组
    };
  },
  methods: {
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
      this.dialogVisible = false;
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
            this.categoryList = list.map(item => {
              return {
                name: item.name,
                code: item.nodeCode
              };
            });
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
        this.Form.departmentName = arr[0].data.id;
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




