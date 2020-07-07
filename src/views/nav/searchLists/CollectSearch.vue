<template>
  <!-- 收藏检索 -->
  <section>
    <div class="content-header flex-spaceBetween">
      <search-header title="收藏检索"></search-header>
    </div>
    <el-row style="background-color:#fff;height:100%">
      <el-col :span="5" class="content-left" :class="colcased ? '' : 'content-left-colcased'">
        <section>
          <div class="content-left-title">
            <span>收藏夹</span>
            <i
              :class="
                colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'
              "
              @click="colcased = !colcased"
            ></i>
          </div>
          <ul class="checkBox">
            <li v-if="collectList.length == 0">暂无收藏夹</li>
            <!-- <li>默认收藏夹</li> -->
            <li
              :class="dataInfo.id == collectItem.id ? 'liChecked' : ''"
              v-for="collectItem in collectList"
              @click="handleChecked(collectItem)"
              :key="collectItem.id"
            >
              {{ collectItem.collectionName }}
              <span
                class="pull-right"
                @click.stop="deleteCollect(collectItem.id)"
              >删除</span>
            </li>
          </ul>
        </section>
      </el-col>
      <el-col
        :span="colcased ? 19 : 24"
        class="content-right"
        :class="!colcased ? 'paddingleft-30 ' : ''"
      >
        <i
          :icon="colcased ? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'"
          @click="colcased = !colcased"
          class="showAsidebtn"
          v-show="!colcased"
        >收藏夹</i>

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
              :disabled="dataInfo.id ? false : true"
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
              :disabled="dataInfo.id ? false : true"
            >重置</el-button>
          </el-col>
        </div>
        <div class="slidebtn">
          <i class="iconfont icon-shuangjiantouxia" v-show="!flag" @click="slideDown"></i>
          <i class="iconfont icon-shuangjiantoushang" v-show="flag" @click="slideUp"></i>
        </div>

        <div class="clearboth" style="border:1px solid #f2f2f2;" v-if="dataInfo.id">
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
              <el-table-column label="文件形成时间" align="center" prop="createDate">
                <template slot-scope="scope">
                  <span>
                    {{
                    new Date(scope.row.createDate).format("yyyyMMdd")
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="状态" align="center" prop="ifAuthorize">
                <template slot-scope="scope">
                  <span
                    v-if="scope.row.ifAuthorize == '授权'"
                    style="color:#1ABC9C"
                  >{{ scope.row.ifAuthorize }}</span>
                  <span v-else style="color:#ff0036">
                    {{
                    scope.row.ifAuthorize
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="借阅到期时间" align="center" prop="createDate">
                <template slot-scope="scope">
                  <span v-if="scope.row.authorizeDate">
                    {{
                    new Date(scope.row.authorizeDate).format("yyyy-MM-dd")
                    }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="原文" align="center" prop="yuanWenShuLiang" width="100"></el-table-column>

              <el-table-column label="操作" align="center" width="200" fixed="right">
                <template slot-scope="scope">
                  <el-button
                    size="mini"
                    type="primary"
                    class="fixedWidth"
                    @click="handleRead(scope.row)"
                    title="查看原文"
                    :disabled="
                      $is_disabled(['collectSearch-readFile']) ? false : true
                    "
                  >原({{ scope.row.yuanWenShuLiang }})</el-button>
                  <el-button size="mini" type="warning" @click="cancelCollect(scope.row)">取消收藏</el-button>
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
  </section>
</template>

<script>
import searchHeader from "./searchHeader";

import {
  getAllCreateCollectionFiles,
  getAllCollectionByUserCode,
  delCreateCollectionFiles,
  delCollectionByUserCode
} from "@/api/collect";
export default {
  name: "collectSearch",
  data() {
    return {
      flag: false,
      colcased: true,
      loading: false,
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
      searchTime: "",
      searchForm: {
        mainTitle: "",
        archiveNo: "",
        uploadDate: "",
        documentNo: "",
        responsibleBy: ""
      },
      pageSize: 20,
      currentPage: 1,
      total: 0,
      gridData: [],
      collectList: [],
      dataInfo: {},
      queryCode: ""
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
    handleChecked(data) {
      this.dataInfo = data;
      this.queryCode = "";
      this.searchForm = {
        mainTitle: "",
        uploadDate: "",
        archiveNo: "",
        documentNo: "",
        responsibleBy: ""
      };
      let params = {
        limit: 50,
        star: 1
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
          mainTitle: row.maintitle || row.mainTitle,
          isSearch: true
        }
      });
    },
    initData() {
      getAllCreateCollectionFiles()
        .then(res => {
          if (res.success) {
            this.collectList = res.data || [];
            if (this.collectList.length > 0) {
              if (this.queryCode) {
                this.dataInfo = this.collectList.filter(
                  item => item.id == this.queryCode
                )[0];
              } else {
                this.dataInfo = this.collectList[0];
              }
              let data = {
                limit: this.pageSize,
                star: this.currentPage
              };
              this.searchFunc(data);
            } else {
              this.dataInfo = {};
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    submitForm() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    resetForm(formname) {
      this.searchForm = {
        mainTitle: "",
        uploadDate: "",
        archiveNo: "",
        documentNo: "",
        responsibleBy: ""
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
      params.cid = this.dataInfo.id;
      if (this.searchForm.uploadDate && this.searchForm.uploadDate.length > 0) {
        params.starTime = this.searchForm.uploadDate[0];
        params.endTime = this.searchForm.uploadDate[1];
      }
      this.loading = true;
      let a = new Date();
      getAllCollectionByUserCode(params)
        .then(res => {
          let b = new Date();
          this.searchTime = ((b - a) / 1000).toFixed(2); //搜索用时
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
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
      let params = {
        limit: 50,
        star: 1,
        cid: cid
      };
      getAllCollectionByUserCode(params).then(res => {
        if (res.success) {
          let total = res.data.total;
          let msg = total > 0 ? "该收藏夹下有记录，是否删除" : "是否删除";
          this.$confirm(msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              delCreateCollectionFiles({
                id: cid
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
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    cancelCollect(row) {
      this.$confirm("是否取消收藏", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        delCollectionByUserCode({ id: row.id }).then(data => {
          if (data.success) {
            this.$message.success("已取消");

            this.initData();
          } else {
            this.$message.error(data.msg);
          }
        });
      });
    }
  },
  created() {
    this.queryCode = this.$route.params.code;
  },
  mounted() {
    this.initData();
  },
  components: { searchHeader },
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
    .btn {
      margin-bottom: 18px;
      text-align: center;
      margin-left: 0;
      // width: 108px;
      // padding: 9px 10px;
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
