<template>
  <!-- 档案调整 -->
  <section>
    <el-row>
      <el-col :span="7" class="content-left" :class="colcased ?'' :'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>门类树</span>
            <i :class="colcased?'el-icon-d-arrow-left': 'el-icon-d-arrow-right'" @click="showLeft"></i>
          </div>
          <div class="card">
            <!-- 档案 -->
            <span class="cardTitle">档案调整</span>
            <el-tree
              :data="tableViewTree"
              :props="defaultProps"
              @node-click="handleNodeClick"
              highlight-current
              style="margin:15px 0"
              default-expand-all
              node-key="id"
              class="tree"
              ref="treeList"
            >
              <span class="custom-tree-node" slot-scope="{ node, data }" :title="data.text">
                <span>
                  <i
                    :class="data.li_attr.TYPE == 'C'? 'icon-dangan1' : 'icon-danganku'"
                    class="iconfont treeIcon"
                  ></i>
                  {{ data.text }}
                </span>
              </span>
            </el-tree>
          </div>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 17 :24"
        class="content-right"
        :class="!colcased ?'paddingleft-30 ': ''"
      >
        <i
          :icon="colcased?'el-icon-d-arrow-left': ''"
          @click="showLeft"
          class="showAsidebtn"
          v-show="!colcased"
        >门类树</i>
        <div class="flex-center">
          <label for style="color:#666;margin-right:10px">调整年度：</label>
          <el-select v-model="searchForm.year" @change="submitSearch">
            <el-option
              :label="year"
              :value="year"
              v-for="(year,index) in fileYearData"
              :key="index"
            ></el-option>
          </el-select>
        </div>
        <div class="searchForm" v-if="showForm" v-loading="showRight">
          <div class="type">
            <h3>档案调整类型</h3>
            <dl>
              <dt>立卷调整</dt>
              <dd>
                <el-radio
                  label="1"
                  v-model="searchForm.type"
                  :disabled="checkedType ==='pieceNo'?true :false"
                  @change.native="submitSearch"
                >卷内调整</el-radio>
              </dd>
              <dd>
                <el-radio
                  label="2"
                  v-model="searchForm.type"
                  @change.native="submitSearch"
                  :disabled="checkedType ==='pieceNo'?true :false"
                >合卷调整</el-radio>
              </dd>
              <dd>
                <el-radio
                  label="4"
                  v-model="searchForm.type"
                  :disabled="checkedType ==='pieceNo'?true :false"
                  @change.native="submitSearch"
                >卷序调整</el-radio>
              </dd>
            </dl>
            <dl>
              <dt>立件调整</dt>
              <dd style="border:none">
                <el-radio
                  label="3"
                  v-model="searchForm.type"
                  :disabled="checkedType ==='yearFolderNo'?true :false"
                  @change="submitSearch"
                >件号顺序调整</el-radio>
              </dd>
            </dl>
          </div>
        </div>
        <el-col :span="24" v-if="showTable">
          <div v-if="searchForm.type=='2'">
            <div class="flex-spaceBetween" style="margin-bottom:15px;">
              <div>
                <label for style="color:#666">原案卷档号列表：</label>
                <el-select size="small" v-model="oldCheckedArchiveNo" filterable>
                  <el-option
                    v-for="(item,index) in archiveNoData"
                    :label="item"
                    :key="index"
                    :value="item"
                    :disabled="item == checkedArchiveNo"
                  ></el-option>
                </el-select>
              </div>
              <div>
                <el-button size="medium" @click="addData">添加</el-button>
              </div>
            </div>
            <!-- //原案卷档号的表格 -->
            <el-table
              :data="editData"
              border
              header-row-class-name="thClassName"
              v-loading="editLoading"
              tooltip-effect="dark"
              ref="editTable"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column label="现号" width="55" align="center" prop="pieceNO"></el-table-column>
              <el-table-column label="题名" align="left" prop="mainTitle"></el-table-column>
            </el-table>
          </div>

          <div style="margin-top:20px">
            <div class="flex-spaceBetween" style="margin-bottom:15px;">
              <div>
                <label for style="color:#666" v-if="searchForm.type =='3'">档号列表：</label>
                <label for style="color:#666" v-else-if="searchForm.type =='1'">原案卷档号列表：</label>
                <label for style="color:#666" v-else-if="searchForm.type =='4'">案卷档号：</label>
                <label for style="color:#666" v-if="searchForm.type == '2'">卷间卷档号列表：</label>
                <el-select size="small" v-model="checkedArchiveNo" filterable>
                  <el-option
                    v-for="(item,index) in archiveNoData"
                    :label="item"
                    :key="index"
                    :value="item"
                    :disabled="item == oldCheckedArchiveNo"
                  ></el-option>
                </el-select>
              </div>
              <div>
                <el-button size="medium" @click="deleteData" v-if="searchForm.type=='2'">移出</el-button>
                <el-button
                  size="medium"
                  @click="submitPieceNo"
                  :disabled="$is_disabled(['fileAdjustment-edit']) ? false : true"
                >调整</el-button>
                <el-button
                  size="medium"
                  @click="submitUnknit"
                  v-if="searchForm.type=='1'"
                  :disabled="$is_disabled(['fileAdjustment-delete']) ? false : true"
                >拆卷</el-button>
              </div>
            </div>
            <el-table
              :data="gridData"
              border
              header-row-class-name="thClassName"
              v-loading="loading"
              tooltip-effect="dark"
              @select="checkedPieceNo"
              @select-all="checkedAllPieceNo"
              ref="dataTable"
              @cell-dblclick="dbClick"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column label="应号" width="80" align="center">
                <template slot-scope="scope">
                  <el-input
                    v-if="scope.row.isShow"
                    v-model.number="scope.row.nowPieceNo"
                    style="width:100%;hight:100%"
                    @blur="scope.row.isShow = false"
                  ></el-input>
                  <span v-if="!scope.row.isShow">{{scope.row.nowPieceNo}}</span>
                </template>
              </el-table-column>
              <el-table-column label="现号" width="55" align="center" prop="pieceNO"></el-table-column>
              <el-table-column label="题名" align="left" prop="mainTitle"></el-table-column>
            </el-table>
          </div>
        </el-col>
      </el-col>
    </el-row>
  </section>
</template>
<script>
import { PrefixZero, getDataFromId } from "@/common/js/util";
import { updateNoArchives } from "@/api/tableView";
import {
  retrieveFillingYears,
  retrieveArchiveNOs,
  retrieveAdjustArchiveParam,
  archiveAdjust,
  retrieveTableType
} from "@/api/archiveAdjust";
export default {
  name: "fileAdjustment",
  data() {
    return {
      showForm: false, //是否显示提交form
      showTable: false, //是否显示表格
      colcased: true, //是否显示左边
      checkedType: "", //选择的档案调整类型
      searchForm: {
        year: "",
        type: ""
      },
      classType: "D_ARCHIVE",
      loading: false,
      editLoading: false,
      showRight: true,
      tableCode: "", //文件表编号
      fileYearData: [], //归档年度列表
      gridData: [], //表格数据
      editData: [], //需要将这个表格合卷的表格数据
      archiveNoData: [], //档号列表
      checkedArchiveNo: "", //选择的档号，查询档案
      oldCheckedArchiveNo: "", //合卷时原案卷选择的档号
      num: 0, //件号
      breadcrumbList: [], //面包屑数组
      defaultProps: {
        children: "children",
        label: "text"
      },
      tableViewTree: [],
      selectData: "",
      nodeCode: "" //底层门类nodeid
    };
  },
  methods: {
    showLeft() {
      this.colcased = !this.colcased;
    },
    createList(newval) {
      this.breadcrumbList = [];
      let arr = this.getFamilyTree(this.tableViewTree, newval.id);
      arr.forEach(n => {
        this.breadcrumbList.push(n.text);
      });
      this.breadcrumbList.reverse();
      this.bus.$emit("breadcrumbListStr", this.breadcrumbList.join());
    },
    getFamilyTree(tree, id) {
      var temp = [];
      var forFn = function(arr, id) {
        for (var i = 0; i < arr.length; i++) {
          var item = arr[i];
          if (item.id == id) {
            temp.push(item);
            let parentCode = item.li_attr.PARENTCODE;
            forFn(tree, parentCode);
            break;
          } else {
            if (item.children) {
              forFn(item.children, id);
            }
          }
        }
      };
      forFn(tree, id);
      return temp;
    },
    filterData(tree) {
      for (var j = 0; j < tree.length; j++) {
        if (tree[j].li_attr) {
          if (tree[j].li_attr.TYPE == "C") {
            tree[j].childrenNode = tree[j].children;
            tree[j].children = [];
          }
        }
        if (tree[j].children && tree[j].children.length > 0) {
          this.filterData(tree[j].children);
        }
      }
      return tree;
    },
    handleNodeClick(data, node, e) {
      let nodeData = data;
      if (nodeData.li_attr.TYPE == "C") {
        this.selectData = data;
        //如果是底层门类
        this.searchForm = {
          year: "",
          type: ""
        };
        this.showForm = true;
        this.showRight = true;
        this.showTable = false;
        if (this.$refs["searchForm"]) {
          this.$refs["searchForm"].resetFields();
        }
        this.gridData = [];
        this.editData = [];
        this.checkedArchiveNo = "";
        this.oldCheckedArchiveNo = "";
        this.nodeCode = nodeData.li_attr.NODECODE;
        this.tableCode = nodeData.childrenNode.filter(
          node => node.li_attr.TABLECLASSTYPE == "A"
        )[0].li_attr.TABLECODE;
        var params = {
          nodeCode: this.nodeCode
        };
        retrieveTableType(params).then(result => {
          this.showRight = false;
          //获取调整类型 pieceNo：按件调整，yearFolderNo：按卷调整
          if (result.success) {
            this.checkedType = result.data;
            if (this.checkedType == "pieceNo") {
              this.searchForm.type = "3";
            }
          } else {
            this.$message.error(result.msg);
          }
        });
        retrieveFillingYears({ tableCode: this.tableCode }).then(res => {
          //获取调整年度
          if (res.success) {
            this.fileYearData = res.data.filter(item => item != null) || [];
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    submitSearch() {
      this.archiveNoData = [];
      this.gridData = [];
      this.editData = [];
      this.checkedArchiveNo = "";
      this.oldCheckedArchiveNo = "";
      if (!this.nodeCode) {
        this.$message.warning("请选择调整门类");
        return false;
      }
      if (!this.searchForm.type) {
        this.$message.warning("请选择调整类型");
        return false;
      }
      if (!this.searchForm.year) {
        this.$message.warning("请选择调整年度");
        return false;
      }
      let tableCode = this.tableCode;
      if (this.searchForm.type == "4") {
        //卷序调整
        tableCode = this.selectData.childrenNode.find(
          node => node.li_attr.TABLECLASSTYPE == "F"
        ).li_attr.TABLECODE;
      }
      this.showTable = true;
      this.showForm = false;
      let params = {
        tableCode: tableCode,
        fillingYear: this.searchForm.year
      };
      if (this.searchForm.type == "1") {
        params.adjustType = "yearFolderNo1";
      } else if (this.searchForm.type == "2") {
        params.adjustType = "yearFolderNo2";
      } else if (this.searchForm.type == "4") {
        params.adjustType = "yearFolderNo3";
      } else {
        params.adjustType = "pieceNo";
      }
      retrieveArchiveNOs(params).then(res => {
        if (res.success) {
          this.archiveNoData = res.data.filter(item => item != null) || [];
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    dbClick(row, column, cell, event) {
      this.$set(row, "isShow", true);
    },
    checkedPieceNo(selection, row) {
      //勾选radio
      row.isShow = false;
      let selected = selection.length && selection.indexOf(row) !== -1; //判断当前行是否选中
      if (selected) {
        if (!row.nowPieceNo) {
          if (selection.length == 1) {
            this.num = 1;
            row.nowPieceNo = this.num;
          } else {
            this.num++;
            row.nowPieceNo = this.num;
          }
        }
      } else {
        selection.forEach(item => {
          if (item.nowPieceNo > row.nowPieceNo) {
            item.nowPieceNo -= 1;
          }
        });
        row.nowPieceNo = "";
        this.num--;
      }
    },
    checkedAllPieceNo(selection) {
      //全选
      let selectData = this.$refs.dataTable.selection;
      this.num = 0;
      if (selection.length >= 1) {
        for (let i = 0; i < selectData.length; i++) {
          if (!selectData[i].nowPieceNo) {
            this.num++;
            this.$set(selectData[i], "nowPieceNo", this.num);
          }
        }
      } else if (selection.length == 0) {
        this.gridData.forEach(valitem => {
          this.$set(valitem, "nowPieceNo", "");
        });
        this.num = 0;
      }
    },
    submitPieceNo() {
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$alert("请选择需要调整的档案", "提示", {
          type: "warning"
        });
        return;
      }
      let tableCode = this.tableCode;
      if (this.searchForm.type == "4") {
        //卷序调整
        tableCode = this.selectData.childrenNode.find(
          node => node.li_attr.TABLECLASSTYPE == "F"
        ).li_attr.TABLECODE;
      }
      let adjustType;
      if (this.searchForm.type == "1") {
        adjustType = "yearFolderNo1";
      } else if (this.searchForm.type == "2") {
        adjustType = "yearFolderNo2";
      } else if (this.searchForm.type == "4") {
        adjustType = "yearFolderNo3";
      } else {
        adjustType = "pieceNo";
      }
      this.$confirm("是否调整" + selectData.length + "条档案", "确认提示", {
        type: "warning"
      })
        .then(() => {
          //获取需要修改的件号或者页数的长度
          let leng = selectData[0].archiveNO.substr(
            this.checkedArchiveNo.length,
            selectData[0].archiveNO.length
          ).length; //获取件号的位数

          let adjustParams = [];
          selectData.forEach(item => {
            let archiveNo =
              this.checkedArchiveNo + PrefixZero(item.nowPieceNo, leng);
            adjustParams.push({
              recordCode: item.recordCode,
              number: item.nowPieceNo,
              tableCode: tableCode,
              archiveNO: archiveNo,
              adjustType: adjustType
            });
          });
          archiveAdjust(adjustParams).then(res => {
            if (res.success) {
              this.$message.success("调整成功");
              this.getGridData(this.checkedArchiveNo);
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {});
    },
    submitUnknit() {
      //拆卷
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$alert("请选择需要拆分的档案", "提示", {
          type: "warning"
        });
        return;
      }
      this.$confirm(
        "所选文件将从当前案卷拆出，成为未归档文件，是否继续操作",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        let params = [];
        selectData.forEach((item, index) => {
          let obj = {};
          obj.recordCode = item.recordCode;
          obj.archiveFlag = "未归档";
          params.push(obj);
        });
        updateNoArchives({
          tableCode: this.tableCode,
          params: JSON.stringify(params)
        }).then(res => {
          if (res.success) {
            this.$message.success("拆卷成功");
            this.getGridData(this.checkedArchiveNo);
          } else {
            this.$message.error(res.msg);
          }
        });
      });
    },
    deleteData() {
      //移除
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$alert("请选择需要移出的档案", "提示", {
          type: "warning"
        });
        return;
      }
      this.$confirm(
        "是否将所选" + selectData.length + "条档案移出",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          selectData.forEach(item => {
            let index = this.gridData.findIndex(
              newitem => newitem.recordCode == item.recordCode
            );
            this.gridData.splice(index, 1);
          });
        })
        .catch(() => {});
    },
    addData() {
      //添加
      let selectData = this.$refs.editTable.selection;
      if (selectData.length == 0) {
        this.$alert("请选择需要添加的档案", "提示", {
          type: "warning"
        });
        return;
      }
      if (!this.checkedArchiveNo) {
        this.$alert("请选择需要合卷的档案", "提示", {
          type: "warning"
        });
        return;
      }
      selectData.forEach(item => {
        let index = this.editData.findIndex(
          newitem => newitem.recordCode == item.recordCode
        );
        this.gridData.push(item);
        this.editData.splice(index, 1);
      });
    },
    getGridData(id) {
      this.loading = true;
      let tableCode = this.tableCode;
      if (this.searchForm.type == "4") {
        //卷序调整
        tableCode = this.selectData.childrenNode.find(
          node => node.li_attr.TABLECLASSTYPE == "F"
        ).li_attr.TABLECODE;
      }
      let params = {
        tableCode: tableCode,
        archiveNO: id
      };
      if (this.searchForm.type == "1") {
        params.adjustType = "yearFolderNo1";
      } else if (this.searchForm.type == "2") {
        params.adjustType = "yearFolderNo2";
      } else if (this.searchForm.type == "4") {
        params.adjustType = "yearFolderNo3";
      } else {
        params.adjustType = "pieceNo";
      }
      retrieveAdjustArchiveParam(params).then(res => {
        this.loading = false;
        if (res.success) {
          let data = res.data || [];
          data.forEach(item => {
            item.isShow = false;
            item.nowPieceNo = "";
          });
          this.gridData = data;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    geEditData(id) {
      //获取原案卷档号的表格数据
      this.editLoading = true;
      let params = {
        tableCode: this.tableCode,
        archiveNO: id
      };
      if (this.searchForm.type == "1") {
        params.adjustType = "yearFolderNo1";
      } else if (this.searchForm.type == "2") {
        params.adjustType = "yearFolderNo2";
      } else if (this.searchForm.type == "4") {
        params.adjustType = "yearFolderNo3";
      } else {
        params.adjustType = "pieceNo";
      }
      retrieveAdjustArchiveParam(params).then(res => {
        this.editLoading = false;
        if (res.success) {
          this.editData = res.data || [];
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  },
  watch: {
    checkedArchiveNo(newval, oldval) {
      if (newval && newval != oldval) {
        this.getGridData(newval);
      }
    },
    oldCheckedArchiveNo(newval, oldval) {
      if (newval && newval != oldval) {
        this.geEditData(newval);
      }
    },
    selectData: {
      handler(newval, oldval) {
        if (newval) {
          this.breadcrumbList = [];
          this.createList(newval);
        }
      },
      deep: true
    }
  },
  mounted() {
    this.$store.dispatch("tree/tableViewTree").then(() => {
      let obj = getDataFromId(
        [this.$store.getters.tableViewTree],
        this.classType
      );
      this.tableViewTree = this.filterData([obj]);
    });
  }
};
</script>
<style scoped lang="scss">
section {
  background-color: #fff;
  .lineHeight {
    margin-top: 12px;
    .require {
      color: #ff0036;
      margin-right: 3px;
    }
  }
  .btnwrapper1 {
    padding: 10px 15px;
    border-bottom: 1px solid #ddd;
  }

  .content-right {
    padding: 20px 20px 200px 20px;
    min-height: 500px;
    border-left: 1px solid #eee;
    position: relative;
    .type {
      border: 1px solid #ddd;
      margin-top: 20px;

      h3 {
        color: #333;
        padding-left: 20px;
        border-bottom: 1px solid #ddd;
        height: 60px;
        line-height: 60px;
        margin: 0;
      }
      dl {
        margin: 0;
        dt,
        dd {
          height: 60px;
          line-height: 60px;
        }
        dt {
          padding: 0 30px;
          color: #333;
          font-weight: 700;
          border-bottom: 1px solid #ddd;
        }
        dd {
          margin: 0 30px;
          border-bottom: 1px solid #ddd;
        }
      }
    }
    .btngroup {
      padding-bottom: 15px;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .showAsidebtn {
      position: absolute;
      top: 20px;
      left: 5px;
      display: inline-block;
      width: 20px;
      color: white;
      text-align: center;
      font-style: normal;
      cursor: pointer;
    }
  }
  .padding-30 {
    padding-left: 30px;
  }
}
</style>