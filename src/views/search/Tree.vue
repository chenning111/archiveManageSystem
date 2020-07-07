<template>
  <section>
    <slot></slot>
    <slot :tree="this" name="ad"></slot>
  </section>
</template>

<script>
import { deepQuery, familyTree, getDataFromId } from "@/common/js/util";

import {
  getTableView,
  getTableViewTree,
  getInputCard,
  getRelationByCNodeCode
} from "@/api/tableView";
export default {
  name: "tree",
  props: {
    classType: {
      type: String,
      default: "D_DATA"
    },
    isDataEntry: {
      type: Boolean,
      default: true
    },
    jd: {
      //鉴定 如果是表示点击节点时 加载快过期的文件
      type: Boolean,
      default: false
    },
    verificate: {
      //校验
      type: Boolean,
      default: false
    },
    rowData: {
      type: Object
    },
    relationObj: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "text"
      },
      tableViewTree: [],
      loading: false,
      selectData: null, //已选择的数据
      breadcrumbList: [], //面包屑数组
      isshowGdang: false,
      classnodeId: "", //底层门类id
      tableClassType: "",
      tableCard: [],
      node: null,
      queryCode: "" //传参数
    };
  },
  methods: {
    handleNodeClick(data, node, e) {
      this.queryCode = "";
      if (data.li_attr.TYPE == "C" || data.li_attr.TYPE === "catalog") {
        //如果是底层门类或者实体分类 拿数据
        // this.$parent.$parent.relationObj = {};
        this.selectData = data;
        this.$emit("update:verificate", false);
        this.getClassTable(this.selectData, false, false); //第三个参数代表重置校验属性
      }
    },
    createList(newval) {
      this.breadcrumbList = [];
      let arr = this.getFamilyTree(this.tableViewTree, newval.id);
      let isshowGdang = arr.find(n => n.id === "D_ARCHIVE");
      if (isshowGdang) {
        this.isshowGdang = true;
      } else {
        this.isshowGdang = false;
      }
      arr.forEach(n => {
        this.breadcrumbList.push(n.text);
      });
      this.breadcrumbList.reverse();
      this.bus.$emit("breadcrumbListStr", this.breadcrumbList.join());
    },

    getCard(selectFile, obj, flag) {
      return new Promise((resolve, reject) => {
        getInputCard({ tableCode: selectFile.li_attr.TABLECODE }).then(res => {
          //获取录入列
          if (res.success) {
            this.tableCard = res.data;
            resolve(this.tableCard);
            this.$nextTick(() => {
              if (flag) {
                this.$emit(
                  "tableCard",
                  res.data,
                  selectFile.li_attr.NODECODE,
                  this.classnodeId,
                  this.tableClassType,
                  this.isshowGdang,
                  true, //表示是否在简单查询加入字段  主要在点击明细 或者案卷显示
                  obj
                );
              } else {
                this.$emit(
                  "tableCard",
                  res.data,
                  selectFile.li_attr.NODECODE,
                  this.classnodeId,
                  this.tableClassType,
                  this.isshowGdang,
                  false,
                  //表示是否在简单查询加入字段  主要在点击明细 或者案卷显示
                  obj
                );
              }
            });
          } else {
            reject(this.tableCard);
            this.$parent.$parent.loading = false;
            this.$message.error(res.msg);
          }
        });
      });
    },
    getTableList(selectFile, flag) {
      var params = {
        tableCode: selectFile.li_attr.TABLECODE,
        pageSize: 20,
        pageNum: 1,
        type: 0,
        conditions: []
      };
      if (this.selectData.li_attr.TYPE == "catalog") {
        params.catalogCode = this.selectData.CATALOGCODE;
      } else {
        params.catalogCode = "";
      }
      if (!this.isDataEntry) {
        //如果是检索和鉴定那边的 只显示已归档
        params.conditions = [{ "archiveFlag-1": "已归档" }];
      }
      let arr = [];
      if (flag) {
        //如果点击的是关联
        this.relationObj.fieldArray.forEach(field => {
          let fieldObj = this.tableCard.find(item => item.FIELDNAME == field.y);
          if (fieldObj) {
            arr.push({
              [fieldObj.FIELDNAME + "-" + fieldObj.TYPE]:
                this.rowData[field.x.toLocaleUpperCase()] || ""
            });
          }
        });
      }
      if (this.queryCode && this.rowData && this.verificate) {
        //校验来的
        if (
          this.selectData.entityTable.find(t => t.id == this.queryCode).li_attr
            .TABLECLASSTYPE == "A"
        ) {
          arr.push({ "archiveNo-1": this.rowData.archiveNo });
        } else if (
          this.selectData.entityTable.find(t => t.id == this.queryCode).li_attr
            .TABLECLASSTYPE == "F"
        ) {
          arr.push({ "folderNo-1": this.rowData.archiveNo });
        }
      }
      params.conditions = JSON.stringify(arr.concat(params.conditions));
      params.sorts = JSON.stringify([]);

      let a = new Date();
      let time = "";
      if (this.jd) {
        params.destroyJudgeOpinion = true; //鉴定的数据
      }
      getTableView(params)
        .then(res => {
          //获取表格数据
          let b = new Date();
          if (res.success) {
            this.$nextTick(() => {
              time = ((b - a) / 1000).toFixed(2); //搜索用时
              this.$emit("tableView", res.data, time);
            });
          } else {
            this.$parent.$parent.$parent.loading = false;
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    handleTableData(tree) {
      for (var j = 0; j < tree.length; j++) {
        if (tree[j].li_attr) {
          if (
            tree[j].li_attr.TYPE == "C" &&
            tree[j].li_attr &&
            tree[j].li_attr.catalogs
          ) {
            let entityTable = tree[j].children || [];
            if (
              tree[j].children[0] &&
              tree[j].children[0].li_attr.TYPE !== "catalog"
            ) {
              let catalogs = JSON.parse(tree[j].li_attr.catalogs);
              tree[j].children = [];
              tree[j].entityTable = entityTable;
              catalogs.forEach(item => {
                if (item) {
                  item.id = item.CATALOGCODE + "-" + tree[j].id;
                  item.text = item.NAME;
                  item.li_attr = {};
                  item.li_attr.TYPE = "catalog";
                  item.li_attr.catalogCode = item.CATALOGCODE;
                  item.li_attr.PARENTCODE = tree[j].id;
                  item.li_attr.cNodeCode = entityTable[0].li_attr.cNodeCode;
                  tree[j].children.push(item);
                }
              });
            }
          }
        }

        if (tree[j].children && tree[j].children.length > 0) {
          this.handleTableData(tree[j].children);
        }
      }
      return tree;
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
    searchForm(selectFile, obj, flag) {
      this.$emit("gettableCode", selectFile.li_attr.TABLECODE, 0); //0表示全部数据1表示回收站
      this.$parent.$parent.loading = true;
      this.getCard(selectFile, obj, flag)
        .then(res => {
          //获取录入列
          this.getTableList(selectFile, flag); //获取数据列表
        })
        .catch(() => {});
      getRelationByCNodeCode({
        cNodeCode: selectFile.li_attr.cNodeCode
      }).then(res => {
        //获取关系列表
        if (res.success) {
          this.$emit("relation", res.data);
        } else {
          this.$message.error(res.msg);
          this.$emit("relation", []);
        }
      });
    },
    getClassTable(newval, flag, verificate = true) {
      this.createList(newval);
      let aFile = {};
      let fFile = {};
      let iFile = {};
      let selectFile = null;
      let obj = {}; //底层门类
      if (newval.li_attr.TYPE == "catalog") {
        //如果是实体分类
        obj = deepQuery(this.tableViewTree, newval.li_attr.PARENTCODE, [])[0];
      } else if (newval.li_attr.TYPE == "C") {
        //底层门类
        obj = newval;
      }
      if (obj) {
        aFile = obj.entityTable.find(t => t.li_attr.TABLECLASSTYPE === "A");
        fFile = obj.entityTable.find(t => t.li_attr.TABLECLASSTYPE === "F");
        iFile = obj.entityTable.find(t => t.li_attr.TABLECLASSTYPE === "I");
      }
      if (flag) {
        //点击节点 不是关联按钮
        selectFile = obj.entityTable.find(
          t => t.li_attr.TABLECODE == this.relationObj.stableCode
        );
      } else {
        if (verificate) {
          if (this.verificate) {
            //如果是校验的
            let verificateNode = obj.entityTable.find(
              t => t.id == this.queryCode
            );
            if (verificateNode.li_attr.TABLECLASSTYPE == "A") {
              selectFile = aFile;
            } else if (verificateNode.li_attr.TABLECLASSTYPE == "F") {
              selectFile = fFile;
            }
          }
        } else {
          if (aFile) {
            //如果没有文件表 加载案卷表 再没有加载项目表
            selectFile = aFile;
          } else if (fFile) {
            selectFile = fFile;
          } else if (iFile) {
            selectFile = iFile;
          }
        }
      }
      if (!selectFile) {
        this.$message.warning("门类无实体表");
        return;
      } else {
        this.classnodeId = selectFile.li_attr.cNodeCode;
        this.tableClassType = selectFile.li_attr.TABLECLASSTYPE;
      }
      this.searchForm(selectFile, obj, flag);
    }
  },

  mounted() {
    this.$store.dispatch("tree/tableViewTree").then(() => {
      let obj = getDataFromId(
        [this.$store.getters.tableViewTree],
        this.classType
      );
      this.tableViewTree = this.handleTableData([obj]);
      this.$nextTick(() => {
        if (this.selectData) {
          this.$parent.$parent.$refs.treeList.setCurrentNode(this.selectData);
        }
      });
      this.queryCode = this.$route.params.code;
    });
  },
  watch: {
    queryCode(newval, oldval) {
      if (newval) {
        this.$store.dispatch("tree/tableViewTree").then(() => {
          let arr = [this.$store.getters.tableViewTree];
          let obj = getDataFromId(arr, this.queryCode);
          this.selectData = this.getFamilyTree(
            this.tableViewTree,
            obj.li_attr.cNodeCode,
            []
          )[0];
          this.$nextTick(() => {
            this.$parent.$parent.$refs.treeList.setCurrentNode(this.selectData);
          });
          this.getClassTable(this.selectData, false, false);
        });
      }
    },

    relationObj: {
      handler(newval, oldval) {
        let arr = [this.$store.getters.tableViewTree];
        if (this.selectData.li_attr.TYPE === "catalog") {
          this.selectData = this.getFamilyTree(
            arr,
            this.selectData.li_attr.cNodeCode,
            []
          )[0];
          this.$nextTick(() => {
            this.$parent.$parent.$refs.treeList.setCurrentNode(this.selectData);
          });
          this.getClassTable(this.selectData, true);
        } else {
          this.getClassTable(this.selectData, true);
        }
      },
      deep: true
    }
  }
};
</script>




