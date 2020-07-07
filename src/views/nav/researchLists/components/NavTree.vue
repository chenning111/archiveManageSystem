<template>
  <div>
    <el-tree
      v-loading="loading"
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
      @node-drop="nodeDrap"
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      draggable
    >
      <div
        class="hoverTreeNode"
        slot-scope="{ node, data }"
        :title="data.text"
        @mouseenter="mouseenter(data)"
        @mouseleave="mouseleave(data)"
      >
        <span v-if="data.li_attr.TYPE === 'C'">
          <i class="iconfont icon-danganku treeIcon"></i>
          {{data.text}}
        </span>
        <span v-else>
          <i class="iconfont icon-danganheji catalogIcon"></i>
          {{data.text}}
        </span>
        <div class="btn">
          <span v-if="data.li_attr.TYPE === 'C'">
            <el-button type="text" @click="addList(data)">添加</el-button>
          </span>
          <!-- <el-dropdown v-else>
            <span class="el-dropdown-link">
              <i class="el-icon-arrow-down el-icon--right"></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item @click.native.stop="() => handleWrite(data)">
                <i class="el-icon-edit"></i>修改
              </el-dropdown-item>
              <el-dropdown-item @click.native.stop="() => handleDelete(data)">
                <i class="el-icon-delete"></i>删除
              </el-dropdown-item>
              <el-dropdown-item >
                <i class="el-icon-top"></i>置顶
              </el-dropdown-item>
              <el-dropdown-item @click.native.stop="() => addList(data)" v-if="getIsShow(data.id)">
                <i class="el-icon-plus"></i>添加子节点
              </el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>-->
          <span v-else v-show="data.del">
            <i class="el-icon-edit" @click.stop="() => handleWrite(data)" title="修改"></i>
            <i class="el-icon-delete" @click.stop="() => handleDelete(data)" title="删除"></i>
            <i class="el-icon-top" @click.stop="() => handleTop(data)" title="置顶"></i>
            <i
              class="el-icon-plus"
              @click.stop="() => addList(data)"
              title="添加子节点"
              v-if="getIsShow(data.id)"
            ></i>
          </span>
        </div>
      </div>
    </el-tree>
    <!-- 新增或修改-->
    <el-dialog :visible.sync="dialogVisible" :title="isUpdate? '修改目录':'新增目录'">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="上级目录" prop="parentTitle">
          <el-input v-model="Form.parentTitle" disabled></el-input>
        </el-form-item>
        <el-form-item label="题 名" prop="title">
          <el-input v-model="Form.title"></el-input>
        </el-form-item>
        <el-form-item label="创建日期" prop="createTime">
          <el-date-picker
            v-model="Form.createTime "
            type="date"
            placeholder="选择日期"
            value-format="yyyy-MM-dd"
          ></el-date-picker>
        </el-form-item>

        <el-form-item label="创建人" prop="author">
          <el-input v-model="Form.author"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { getDataFromId, familyTree } from "@/common/js/util";
import { getInputCard } from "@/api/tableView";
import {
  addEditorCatalog,
  deleteEditorCatalog,
  retrieveEditorCatalog,
  updateEditorCatalog,
  retrieveEditor,
  retrieveEditorTableView
} from "@/api/editor";
export default {
  name: "navTree",
  data() {
    return {
      loading: false,
      navTreeData: [],
      dialogVisible: false,
      isUpdate: false,
      defaultProps: {
        children: "children",
        label: "text"
      },
      type: 2,
      Form: {
        title: "",
        author: "",
        createTime: new Date().format("yyyy-MM-dd"),
        parentTitle: "",
        parentId: ""
        // catalogStatus: ""
      },
      rules: {
        title: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      selectedData: {},
      dataInfo: {},
      tableViewTree: []
    };
  },
  methods: {
    mouseenter(data) {
      this.$set(data, "del", true);
    },
    mouseleave(data) {
      this.$set(data, "del", false);
    },
    allowDrag(node) {
      if (!node.parent.parent) {
        return false;
      }
      return true;
    },
    allowDrop(draggingNode, dropNode, type) {
      if (!dropNode.parent.parent) {
        return false;
      }
      return true;
    },
    nodeDrap(startNode, endNode, type) {
      if (startNode.data.id !== endNode.data.id) {
        let params = {
          type: this.type,
          id: startNode.data.id
        };
        if (type === "inner") {
          params.parentId = endNode.data.id;
        } else {
          params.parentId = endNode.data.parentId;
        }
        updateEditorCatalog(params)
          .then(res => {
            if (res.success) {
              this.$message.success("修改成功");
              this.initData();
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(res => {});
      }
    },

    getIsShow(id) {
      let arr = familyTree(this.navTreeData, id, "parentNodeId");
      if (arr.length == 3) {
        return false;
      } else {
        return true;
      }
    },
    addList(row) {
      this.isUpdate = false;
      this.dialogVisible = true;
      this.Form = {
        title: "",
        author: this.userInfo.userName,
        createTime: new Date().format("yyyy-MM-dd"),
        parentTitle: row.text,
        parentId: row.id
      };
      if (row.li_attr.TYPE === "C") {
        this.Form.parentId = 0;
      }
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogVisible = true;
      this.dataInfo = row;
      let parent = getDataFromId(this.navTreeData, row.parentNodeId);
      this.Form = {
        id: row.id,
        title: row.title,
        author: row.author,
        createTime: new Date(row.createTime).format("yyyy-MM-dd"),
        parentTitle: parent ? parent.text : ""
      };
    },
    handleTop(row) {
      this.$confirm("是否将此节点置顶", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            type: this.type,
            id: row.id,
            remark: new Date().format("yyyy-MM-dd hh:mm:ss")
          };
          updateEditorCatalog(params)
            .then(res => {
              if (res.success) {
                this.$message.success("修改成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    handleDelete(row) {
      //删除
      this.dataInfo = row;
      let params = {
        tableCode: row.li_attr.TABLECODE,
        pageNum: 1,
        pageSize: 20,
        catalogCode: row.id,
        type: 0
      };
      retrieveEditorTableView(params).then(res => {
        if (res.success) {
          let total = res.data.pageInfo.total;
          let msg = total > 0 ? "该节点下有记录，是否删除" : "是否删除";
          this.$confirm(msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              deleteEditorCatalog({
                id: row.id
              })
                .then(res => {
                  if (res.success) {
                    this.$message.success("删除成功");
                    this.initData();
                  } else {
                    this.$message.error(res.msg);
                  }
                })
                .catch(res => {
                  this.$message.error(res.msg);
                });
            })
            .catch(() => {});
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              type: this.type,
              title: this.Form.title,
              author: this.Form.author,
              createTime: this.Form.createTime,
              id: this.dataInfo.id
            };
            updateEditorCatalog(params)
              .then(res => {
                this.dialogVisible = false;
                if (res.success) {
                  this.$message.success("修改成功");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //
            let params = {
              type: this.type,
              title: this.Form.title,
              author: this.Form.author,
              createTime: this.Form.createTime
            };
            if (this.Form.parentId) {
              params.parentId = this.Form.parentId;
            }
            addEditorCatalog(params)
              .then(res => {
                this.dialogVisible = false;
                if (res.success) {
                  this.$message.success("添加成功");
                  this.initData();
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

    handleNodeClick(data, node, e) {
      if (data.li_attr.TYPE !== "C") {
        this.selectedData = data;
        let arr = familyTree(this.navTreeData, data.id, "parentNodeId");
        this.emitBreadList(arr);
      }
    },
    emitBreadList(arr) {
      let list = arr.map(item => {
        return item.text;
      });
      list.reverse();
      this.bus.$emit("breadcrumbListStr", list.join());
    },
    handleTableData(tree, obj) {
      // obj =>档案汇编节点
      let entityTable = obj.entityTable;
      for (var j = 0; j < tree.length; j++) {
        let item = tree[j];
        item.text = item.title;
        if (item.parentId == "0") {
          item.parentNodeId = obj.id;
        } else {
          item.parentNodeId = tree[j].parentId;
        }
        item.li_attr = {};
        item.li_attr.TYPE = "classify";
        item.li_attr.TABLECODE = entityTable[0].li_attr.TABLECODE;
        item.li_attr.cNodeCode = entityTable[0].li_attr.cNodeCode;
        if (tree[j].children && tree[j].children.length > 0) {
          this.handleTableData(tree[j].children, obj);
        }
      }
      return tree;
    },
    getNavTreeData(o) {
      //获取分类
      let params = {
        pageSize: 9999,
        pageNumber: 1,
        type: this.type
      };
      retrieveEditorCatalog(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            let list = this.handleTableData(res.data.list, o);
            o.children = list;
            this.navTreeData = [o];
          } else {
            this.navTreeData = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    initData() {
      this.$store.dispatch("tree/tableViewTree").then(res => {
        let obj = getDataFromId([this.$store.getters.tableViewTree], "D_STUDY");
        let o = null;
        if (obj && obj.children && obj.children.length > 0) {
          o = obj.children[0];
          if (o.children && o.children.length > 0) {
            let entityTable = o.children || [];
            o.entityTable = entityTable || [];
            o.parentNodeId = "0";
          }
          this.getNavTreeData(o);
        }
      });
    },
    getTableList(params) {
      this.loading = true;
      retrieveEditorTableView(params).then(res => {
        this.loading = false;
        if (res.success) {
          this.$emit("tableView", res.data);
        }
      });
    },
    getTableCard() {
      return new Promise((resolve, reject) => {
        getInputCard({ tableCode: this.selectedData.li_attr.TABLECODE }).then(
          res => {
            this.tableCardList = res.data;
            if (res.success) {
              resolve(res.data);
              this.$emit("tableCard", res.data, this.selectedData);
            }
          }
        );
      });
    }
  },
  mounted() {
    this.initData();
  },
  watch: {
    "selectedData.id": {
      handler(newval, oldval) {
        if (newval) {
          this.tableCode = this.selectedData.li_attr.TABLECODE;
          let params = {
            tableCode: this.tableCode,
            pageNum: 1,
            pageSize: 20,
            catalogCode: newval,
            type: 0
          };
          this.getTableCard().then(res => {
            this.getTableList(params);
          });
        }
      }
    }
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    }
  }
};
</script>
<style lang="scss" scoped>
.tree {
  .hoverTreeNode {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .btn {
      margin-right: 5px;
      span i {
        margin-right: 5px;
      }
    }
  }
}
</style>