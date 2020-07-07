<template>
  <!-- 专题检索 -->
  <section>
    <div class="content-header flex-spaceBetween">
      <search-header title="汇编检索"></search-header>
    </div>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="7" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>专题索引</span>
            <i
              :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
              @click="colcased = !colcased"
            ></i>
          </div>
          <div class="card">
            <el-tree
              v-loading="treeLoading"
              :data="navTreeData"
              style="margin:15px 0"
              :props="defaultProps"
              ref="treeList"
              node-key="id"
              class="tree"
              highlight-current
              default-expand-all
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            >
              <template slot-scope="{ node, data }">
                <span v-if="data.id == '0'">
                  <i class="iconfont icon-danganku treeIcon"></i>
                  {{data.topicname}}
                </span>
                <span v-else>
                  <i class="iconfont icon-danganheji catalogIcon"></i>
                  {{data.topicname}}
                </span>
              </template>
            </el-tree>
          </div>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 17 : 24"
        class="content-right"
        :class="!colcased ? 'paddingleft-30 ' : ''"
      >
        <i
          :icon="colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >专题索引</i>

        <div
          style="padding:15px;border:1px solid #eee;position:relative;"
          class="clearboth searchBox"
          ref="searchBox"
        >
          <el-col :span="18" style="min-height:200px">
            <el-form ref="form" :model="searchForm" label-width="90px" inline size="small">
              <el-col :span="24" class="searchForm">
                <el-form-item label="题名">
                  <el-input
                    v-model="searchForm.mainTitle"
                    @keyup.enter.native="submitForm"
                    placeholder="请输入题名"
                  ></el-input>
                </el-form-item>
                <el-form-item label="档号">
                  <el-input
                    v-model="searchForm.archiveNo"
                    @keyup.enter.native="submitForm"
                    placeholder="请输入档号"
                  ></el-input>
                </el-form-item>
                <el-form-item label="文号">
                  <el-input
                    v-model="searchForm.documentNo"
                    @keyup.enter.native="submitForm"
                    placeholder="请输入文号"
                  ></el-input>
                </el-form-item>
                <el-form-item label="责任者">
                  <el-input
                    v-model="searchForm.responsibleBy"
                    @keyup.enter.native="submitForm"
                    placeholder="请输入责任者"
                  ></el-input>
                </el-form-item>
                <el-form-item label="成文日期">
                  <el-date-picker
                    v-model="searchForm.uploadDate"
                    type="daterange"
                    align="right"
                    size="small"
                    unlink-panels
                    range-separator="至"
                    start-placeholder="开始日期"
                    end-placeholder="结束日期"
                    value-format="yyyy-MM-dd"
                    :picker-options="pickerOptions"
                    @change="submitForm"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <el-col :span="6" class="buttonGroup">
            <el-button
              type="primary"
              icon="el-icon-search"
              size="small"
              @click="submitForm('form')"
              :disabled="dataInfo.topiccode ? false : true"
            >查询</el-button>

            <!-- <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="HighdialogVisible = true"
                v-show="archiveFlag!='待归档'"
                :disabled="tableCode ? false : true"
              >高级查询</el-button>
              <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="relationSearch"
                v-show="archiveFlag!='待归档'"
                :disabled="tableCode ? false : true"
            >关联查询</el-button>-->
            <el-button
              type="primary"
              size="small"
              plain
              @click="resetForm('form')"
              icon="el-icon-refresh-left"
              :disabled="dataInfo.topiccode ? false : true"
            >重置</el-button>
          </el-col>
        </div>
        <div class="slidebtn">
          <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
          <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
        </div>

        <div class="clearboth" style="border:1px solid #f2f2f2;" v-if="dataInfo.topiccode">
          <el-col :span="24" class="clearboth tabList" style="margin:20px 0;padding:0 20px;">
            <div class="clearboth title">
              <p class="pull-left">
                为您找到相关结果
                <em>{{ total }}</em>个， 搜索用时 (
                <em>{{ searchTime || 0 }}</em>秒)
              </p>
              <div class="pull-right">
                <el-button size="medium" type="primary" @click="putJy">批量借阅</el-button>
              </div>
            </div>
          </el-col>
          <div ref="tableBox">
            <el-table
              :data="gridData"
              border
              header-row-class-name="thClassName"
              v-loading="loading"
              ref="dataTable"
              tooltip-effect="dark"
              @select="checkedPieceNo"
              @select-all="checkedAllPieceNo"
            >
              <el-table-column type="selection" width="55" align="center"></el-table-column>
              <el-table-column label="序号" align="center" prop="serial" width="80px">
                <template slot-scope="scope">
                  {{
                  scope.$index + 1 + index
                  }}
                </template>
              </el-table-column>
              <el-table-column
                label="档号"
                align="center"
                prop="archiveNo"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                label="题名"
                align="center"
                prop="mainTitle"
                min-width="200"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                label="文号"
                align="center"
                prop="documentNo"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column
                label="责任者"
                align="center"
                prop="responsibleBy"
                :show-overflow-tooltip="true"
              ></el-table-column>
              <el-table-column label=" 文件形成时间" align="center" prop="createDate">
                <template slot-scope="scope">
                  <span>
                    {{
                    new Date(scope.row.createDate).format("yyyyMMdd")
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="页数" align="center" prop="quantity" width="100"></el-table-column>
              <el-table-column label="原文" align="center" prop="yuanWenShuLiang" width="100"></el-table-column>
              <el-table-column label="操作" align="center" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    @click="handleRead(scope.row)"
                    :disabled="
                      $is_disabled(['thematicRetrieval-readFile'])
                        ? false
                        : true
                    "
                    title="查看原文"
                    class="fixedWidth"
                  >原({{ scope.row.yuanWenShuLiang }})</el-button>
                  <el-button
                    size="mini"
                    type="success "
                    @click="handleCollect(scope.row)"
                    title="删除"
                  >收藏</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="clearboth">
            <el-pagination
              class="pull-right pagina"
              background
              layout="total,prev, pager, next,sizes"
              :total="total"
              @size-change="handleSizeChange"
              :page-sizes="[20, 50, 100]"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handleCurrentChange"
            ></el-pagination>
          </div>

          <div class="clearboth" style="padding:0 20px 20px 20px">
            <div class="pull-right">
              <el-button size="medium" type="primary" @click="putJy">批量借阅</el-button>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
    <!-- 收藏 -->
    <collect :recordCode="recordCode" :tableCode="tableCode" v-show="collectDialog" ref="collect"></collect>
  </section>
</template>

<script>
import { getDataFromId, familyTree, addTreeAttr } from "@/common/js/util";
import collect from "@/components/Collect";
import searchHeader from "./searchHeader";
import {
  retrieveSpecialTopicCatalog,
  deleteSpecialTopicCatalog,
  selecSpecialTopicUtab
} from "@/api/special";
export default {
  name: "thematicRetrieval",
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "topicname"
      },
      navTreeData: [],
      collectDialog: false,
      flag: false,
      colcased: true,
      loading: false,
      searchTime: 0,
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
        mainTitle: "",
        archiveNo: "",
        uploadDate: "",
        documentNo: "",
        responsibleBy: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      gridData: [],
      thematicList: [],
      dataInfo: {},
      queryCode: "",
      recordCode: "",
      tableCode: "",
      treeLoading: false
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
    handleCollect(row) {
      this.recordCode = row.recordCode;
      this.tableCode = row.tableCode;
      this.collectDialog = true;
      this.$refs.collect.getIsCollect();
    },
    checkedAllPieceNo(selection) {
      //全选
      if (selection.length >= 1) {
        let indexTableCode = selection[0].tableCode;
        let flag = false;
        for (let i = 1; i < selection.length; i++) {
          let nextTableCode = selection[i].tableCode;
          if (indexTableCode != nextTableCode) {
            flag = true;
            break;
          }
        }
        if (flag) {
          //如果其中有不同属于同一类的
          this.$confirm(
            "当前选择的条目和已选择的不属于同一实体表下的数据，请重新选择",
            "提示",
            {
              confirmButtonText: "确定",
              type: "warning"
            }
          )
            .then(() => {
              this.$refs.dataTable.clearSelection();
            })
            .catch(() => {
              this.$refs.dataTable.clearSelection();
            });

          return;
        }
      }
    },

    checkedPieceNo(selection, row) {
      //勾选checkbox
      let selected = selection.length && selection.indexOf(row) !== -1; //判断当前行是否选中
      let indexData = {};
      if (selected) {
        if (selection.length > 1) {
          let indexTableCode = selection[0].tableCode;
          let nextTableCode = row.tableCode;
          if (indexTableCode == nextTableCode) {
            this.$refs.dataTable.toggleRowSelection(row, true);
          } else {
            this.$confirm(
              "当前选择的条目和已选择的不属于同一实体表下的数据，请重新选择",
              "提示",
              {
                confirmButtonText: "确定",
                type: "warning"
              }
            )
              .then(() => {
                this.$refs.dataTable.toggleRowSelection(row, false);
              })
              .catch(() => {
                this.$refs.dataTable.toggleRowSelection(row, false);
              });
          }
        }
      }
    },
    putJy() {
      //批量借阅
      let selectData = this.$refs.dataTable.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要借阅的文件");
        return;
      }
      let recordCodeList = [];
      selectData.forEach(item => {
        recordCodeList.push(item.recordCode);
      });
      this.$router.push({
        path: "applyRead",
        query: {
          tableCode: selectData[0].tableCode,
          recordCodeList: recordCodeList.join()
        }
      });
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

    handleRead(row) {
      //查看原文
      this.$router.push({
        path: "/searchContent",
        query: {
          recordCode: row.recordCode,
          tableCode: row.tableCode,
          isSearch: true
        }
      });
    },
    handleNodeClick(data, node, e) {
      if (data.id != "0") {
        this.dataInfo = data;
      }
    },
    emitBreadList(arr) {
      let list = arr.map(item => {
        return item.topicname;
      });
      list.reverse();
      this.bus.$emit("breadcrumbListStr", list.join());
    },
    initData() {
      let params = {
        limit: 9999,
        star: 1
      };
      this.treeLoading = true;
      retrieveSpecialTopicCatalog(params)
        .then(res => {
          this.treeLoading = false;

          if (res.success) {
            let data = res.data.list || [];
            data = addTreeAttr(data, "id", "topiccode");
            this.navTreeData = [
              {
                topicname: "专题索引",
                id: "0",
                children: data
              }
            ];
            if (this.dataInfo.id) {
              let arr = familyTree(
                this.navTreeData,
                this.dataInfo.id,
                "parent"
              );
              this.emitBreadList(arr);
              this.$nextTick(() => {
                this.$refs.treeList.setCurrentKey(this.dataInfo.id);
              });
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.treeLoading = false;
        });
    },

    submitForm() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    resetForm() {
      this.searchForm = {
        mainTitle: "",
        uploadDate: "",
        archiveNo: ""
      };
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    searchFunc(params) {
      //查询
      params.mainTitle = this.searchForm.mainTitle;
      params.archiveNo = this.searchForm.archiveNo;
      params.documentNo = this.searchForm.documentNo;
      params.responsibleBy = this.searchForm.responsibleBy;
      params.topiccode = this.dataInfo.topiccode;
      if (this.searchForm.uploadDate && this.searchForm.uploadDate.length > 0) {
        params.starTime = this.searchForm.uploadDate[0];
        params.endTime = this.searchForm.uploadDate[1];
      }
      this.loading = true;
      let a = new Date();
      selecSpecialTopicUtab(params)
        .then(res => {
          let b = new Date();
          this.searchTime = ((b - a) / 1000).toFixed(2);
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
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
    deleteCollect(cid) {
      this.$confirm("是否删除此专题", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteSpecialTopicCatalog({
            topiccode: cid
          }).then(data => {
            this.queryCode = "";
            if (data.success) {
              this.$message.success("删除成功");

              this.initData();
            } else {
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.initData();
    this.dataInfo = this.$route.params.data || {};
  },
  watch: {
    dataInfo: {
      handler(newval, oldval) {
        if (newval.id) {
          this.resetForm();
        }
      },
      deep: true
    }
  },
  components: { searchHeader, collect },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  },
  beforeRouteLeave(to, from, next) {
    if (to.name == "searchContent") {
      this.$store.dispatch("permission/add_cachedViews", from.name).then(() => {
        next();
      });
    } else {
      this.$store.dispatch("permission/del_cachedViews", from.name).then(() => {
        next();
      });
    }
  }
};
</script>

<style lang="scss" scoped>
section {
  .content-header {
    background-color: #fafafa;
    padding: 15px 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
    .btngroup {
      span {
        display: inline-block;
        padding: 8px 10px;
        color: #666;
        margin-left: 10px;
        border-radius: 3px;
        cursor: pointer;
      }
      .liChecked {
        color: white;
      }
    }
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
