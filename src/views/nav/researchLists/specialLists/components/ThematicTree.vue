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
        :title="data.topicname"
        @mouseenter="mouseenter(data)"
        @mouseleave="mouseleave(data)"
      >
        <span v-if="data.id == '0'">
          <i class="iconfont icon-danganku treeIcon"></i>
          {{data.topicname}}
        </span>
        <span v-else>
          <i class="iconfont icon-danganheji catalogIcon"></i>
          {{data.topicname}}
        </span>
        <div class="btn">
          <span v-if="data.id != '0'" v-show="data.del">
            <i class="el-icon-edit" @click.stop="() => handleWrite(data)" title="修改"></i>
            <i class="el-icon-delete" @click.stop="() => handleDelete(data)" title="删除"></i>
            <i
              class="el-icon-plus"
              @click.stop="() => addList(data)"
              title="添加子节点"
              v-if="getIsShow(data.id)"
            ></i>
          </span>
          <span v-else>
            <el-button type="text" @click="addList">添加</el-button>
          </span>
        </div>
      </div>
    </el-tree>
    <!-- 新增或修改-->
    <el-dialog :visible.sync="dialogVisible" :title="isUpdate ? '修改目录' : '新增目录'">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="80px">
        <el-form-item label="上级目录" prop="parentTitle">
          <el-input v-model="Form.parentTitle" disabled></el-input>
        </el-form-item>
        <el-form-item label="题 名" prop="topicname">
          <el-input v-model="Form.topicname"></el-input>
        </el-form-item>
        <el-form-item label="创建日期" prop="creattime">
          <el-date-picker
            v-model="Form.creattime"
            type="date"
            placeholder="选择日期"
            :disabled="isUpdate ? true : false"
            value-format="yyyy-MM-dd"
            :picker-options="options"
          ></el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="statusdescription">
          <el-select v-model="Form.statusdescription">
            <el-option label="公开" value="公开"></el-option>
            <el-option label="不公开" value="不公开"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="Form.remark" type="textarea"></el-input>
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
import { getDataFromId, familyTree, addTreeAttr } from "@/common/js/util";

import {
  selecSpecialTopicCatalog,
  addSpecialTopicCatalog,
  updateSpecialTopicCatalog,
  deleteSpecialTopicCatalog,
  selecSpecialTopicUtab
} from "@/api/special";
export default {
  name: "thematicTree",
  data() {
    return {
      options: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      loading: false,
      navTreeData: [],
      gridData: [],
      dialogVisible: false,
      isUpdate: false,
      defaultProps: {
        children: "children",
        label: "topicname"
      },
      rules: {
        topicname: [{ required: true, message: "请输入", trigger: "blur" }],
        creattime: [{ required: true, message: "请输入", trigger: "blur" }],
        statusdescription: [
          { required: true, message: "请输入", trigger: "blur" }
        ]
      },
      Form: {
        topicname: "",
        creattime: "",
        statusdescription: "",
        remark: "",
        parentTitle: "",
        parentId: ""
      },
      selectedData: {},
      dataInfo: {}
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
          topiccode: startNode.data.id
        };
        if (type === "inner") {
          params.parent = endNode.data.id;
        } else {
          params.parent = endNode.data.parent;
        }
        updateSpecialTopicCatalog(params)
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
      let arr = familyTree(this.navTreeData, id, "parent");
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
        topicname: "",
        creattime: new Date(),
        statusdescription: "",
        remark: "",
        parentTitle: row ? row.topicname : "",
        parentId: row ? row.id : ""
      };
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogVisible = true;
      this.dataInfo = row;
      let parent = getDataFromId(this.gridData, row.parent);
      this.Form = {
        topicname: row.topicname,
        creattime: row.creattime,
        statusdescription: row.statusdescription,
        remark: row.remark,
        parentTitle: parent ? parent.topicname : "",
        parentId: ""
      };
    },
    handleAdd() {},
    handleDelete(row) {
      //删除
      this.dataInfo = row;
      let params = {
        limit: 20,
        star: 1,
        topiccode: row.topiccode
      };

      selecSpecialTopicUtab(params).then(res => {
        if (res.success) {
          let total = res.data.total;
          let msg = total > 0 ? "该节点下有记录，是否删除" : "是否删除";
          this.$confirm(msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              deleteSpecialTopicCatalog({
                topiccode: row.topiccode
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
              topicname: this.Form.topicname,
              remark: this.Form.remark,
              topiccode: this.dataInfo.id,
              statusdescription: this.Form.statusdescription
            };
            updateSpecialTopicCatalog(params)
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
            let params = Object.assign({}, this.Form, { status: 1 });
            if (this.Form.parentId) {
              params.parent = this.Form.parentId;
            }
            addSpecialTopicCatalog(params)
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
    initData() {
      let params = {
        limit: 9999,
        star: 1
      };

      this.searchFunc(params);
    },
    searchFunc(params) {
      //查询
      this.loading = true;
      selecSpecialTopicCatalog(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            let data = res.data.list || [];
            data = addTreeAttr(data, "id", "topiccode");
            this.gridData = data;
            this.navTreeData = [
              {
                topicname: "专题索引",
                id: "0",
                children: this.gridData
              }
            ];
          } else {
            this.gridData = [];
            this.navTreeData = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    handleNodeClick(data, node, e) {
      if (data.id != "0") {
        this.selectedData = data;
        let arr = familyTree(this.navTreeData, data.id, "parent");
        this.emitBreadList(arr);
        this.$emit("changeData", this.selectedData);
      }
    },
    emitBreadList(arr) {
      let list = arr.map(item => {
        return item.topicname;
      });
      list.reverse();
      this.bus.$emit("breadcrumbListStr", list.join());
    }
  },
  mounted() {
    this.initData();
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
