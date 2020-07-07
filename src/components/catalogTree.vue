<template>
  <!-- // 适用于点击门类只传递tableCode classnodeid ，加载录入列 -->
  <!-- 目前在 档案生成报表report 中使用 -->
  <div>
    <el-tree
      :data="tableViewTree"
      :props="defaultProps"
      @node-click="handleNodeClick"
      node-key="id"
      class="tree"
      :highlight-current="true"
      default-expand-all
      ref="treeList"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }" :title="data.text">
        <!-- //中间门类和根节点 -->
        <span v-if="data.li_attr.TYPE === 'L'||data.li_attr.TYPE === 'I'">
          <i class="iconfont icon-danganku treeIcon"></i>
          {{data.text }}
        </span>
        <!-- 底层门类 -->
        <span v-else-if="data.li_attr.TYPE === 'C'">
          <i class="iconfont icon-dangan1 treeIcon"></i>
          {{data.text }}
        </span>
        <span v-else>
          <i class="iconfont icon-danganheji catalogIcon"></i>
          {{data.text }}
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import { deepQuery } from "@/common/js/util";

import { getInputCard } from "@/api/tableView";
export default {
  name: "catalogTree",
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "text"
      },
      arr: null,
      tableViewTree: [],
      selectData: null, //已选择的数据
      breadcrumbList: [], //面包屑数组
      classnodeId: "", //底层门类id
      tableClassType: "",
      tableCard: [],
      nodeCode: "",
      node: null,
      queryCode: "" //传参数
    };
  },
  methods: {
    handleNodeClick(data, node, e) {
      this.queryCode = "";
      if (data.li_attr.TYPE == "E") {
        //如果是实体表 拿数据
        this.node = node;
        this.selectData = data;
      }
    },

    createList(node) {
      if (node.parent) {
        if (node.data.text != "门类信息") {
          this.breadcrumbList.push(node.data.text);
          this.createList(node.parent);
        } else {
          this.breadcrumbList.reverse();
          this.bus.$emit("breadcrumbListStr", this.breadcrumbList.join());
        }
      } else {
        this.breadcrumbList.reverse();
        this.bus.$emit("breadcrumbListStr", this.breadcrumbList.join());
        return;
      }
    }
  },

  mounted() {
    this.$store.dispatch("tree/tableViewTree").then(() => {
      this.tableViewTree = [this.$store.getters.tableViewTree];
    });
  },
  watch: {
    selectData: {
      handler(newval, oldval) {
        if (newval) {
          this.classnodeId = newval.li_attr.cNodeCode;
          this.breadcrumbList = [];
          this.createList(this.node);

          getInputCard({ tableCode: this.selectData.li_attr.TABLECODE }).then(
            res => {
              //获取录入列
              if (res.success) {
                this.tableCard = res.data;
                this.$nextTick(() => {
                  this.$emit(
                    "tableCard",
                    res.data,
                    this.selectData.li_attr.TABLECODE,
                    this.classnodeId
                  );
                });
              } else {
                this.$message.error(res.msg);
              }
            }
          );
        }
      },
      deep: true
    }
  }
};
</script>




