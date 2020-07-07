<template>
  <section>
    <el-col :span="7" class="content-left" :class="colcased ?'' :'content-left-colcased'">
      <section>
        <div class="content-left-title">
          <span>门类树</span>
          <el-button
            type="primary"
            size="small"
            @click="showbox"
            v-if="!showCheckbox && word!='handoverReception'&& word!='fileManage'"
          >综合门类统计</el-button>
          <el-button
            type="primary"
            size="small"
            @click="hidebox"
            v-if="showCheckbox && word!='handoverReception'&& word!='fileManage'"
          >档案数量统计</el-button>
          <!-- 如果是移交 不显示 -->
          <i :class="colcased?'el-icon-d-arrow-left': ''" @click="colcased = !colcased"></i>
        </div>
        <div class="card">
          <span class="cardTitle">档案门类</span>
          <el-tree
            :data="tableViewTree"
            :props="defaultProps"
            :default-expanded-keys="expandArr"
            @node-click="handleNodeClick"
            :show-checkbox="showCheckbox"
            default-expand-all
            style="margin:15px 0"
            node-key="id"
            class="tree"
            :highlight-current="true"
            ref="treeList"
            @check="checkNode"
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
      </section>
    </el-col>
    <el-col
      :span="colcased ? 17 :24"
      class="content-right"
      :class="!colcased ?'paddingleft-30 ': ''"
    >
      <i
        :icon="colcased?'el-icon-d-arrow-left': ''"
        @click="colcased = !colcased"
        class="showAsidebtn"
        v-show="!colcased"
        title="展开"
      >门类树</i>
      <router-view
        :cNodeCode="classnodeId"
        :tableCode="tableCode"
        :checkedKeys="checkedKeys"
        :selectedNode="node"
      ></router-view>
    </el-col>
  </section>
</template>
<script>
import { deepQuery, getDataFromId } from "@/common/js/util";
export default {
  name: "archives",
  props: {
    word: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      colcased: true,
      tableViewTree: [],
      defaultProps: {
        children: "children",
        label: "text"
      },
      classType: "D_ARCHIVE",
      selectData: null,
      breadcrumbList: [],
      classnodeId: "", //底层门类id
      id: "",
      expandArr: [],
      tableCode: "",
      node: null,
      checkedKeys: [] //已选择的档案门类
    };
  },
  methods: {
    showbox() {
      this.showCheckbox = true;
      this.$router.push("/categoryStatistics");
    },
    hidebox() {
      this.showCheckbox = false;
      this.$router.push("/statisticsType");
    },
    checkNode() {
      let node = this.$refs.treeList.getCheckedNodes();
      this.checkedKeys = [];
      if (node.length > 0) {
        node.forEach(item => {
          if (item.li_attr.TABLECODE) {
            this.checkedKeys.push(item.li_attr.TABLECODE);
          }
        });
      }
    },
    handleNodeClick(data, node, e) {
      if (!this.showCheckbox) {
        //如果不是综合门类和利用情况统计
        if (data.li_attr.TYPE == "E") {
          //如果是实体表 拿数据
          this.selectData = data;
          this.node = node;
        }
      }
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
    createList(node) {
      this.breadcrumbList = [];
      let arr = this.getFamilyTree(this.tableViewTree, node.id);
      arr.forEach(n => {
        this.breadcrumbList.push(n.text);
      });
      this.breadcrumbList.reverse();
      this.bus.$emit("breadcrumbListStr", this.breadcrumbList.join());
    }
  },
  mounted() {
    this.$store.dispatch("tree/tableViewTree").then(() => {
      let obj = getDataFromId(
        [this.$store.getters.tableViewTree],
        this.classType
      );
      this.tableViewTree = [obj];
    });
    this.expandArr = [this.classType];
    let tableCode = this.$route.query.tableCode;
  },
  computed: {
    showCheckbox: {
      get() {
        if (
          this.$route.path == "/categoryStatistics" ||
          this.$route.path == "/lyIndex"
        ) {
          return true;
        } else {
          return false;
        }
      },
      set() {}
    }
  },
  watch: {
    selectData: {
      handler(newval, oldval) {
        if (newval) {
          this.classnodeId = newval.li_attr.cNodeCode;
          this.tableCode = newval.li_attr.TABLECODE;
          this.id = newval.id;
          this.createList(newval);
          if (this.word == "statistics") {
            //如果是统计页 跳转到统计
            this.$router.push({
              name: "statisticsType",
              params: {
                cNodeCode: this.classnodeId
              }
            });
          } else {
          }
        }
      },
      deep: true
    }
  }
};
</script>
 <style lang="scss" scoped>
.content-right {
  padding: 0;
}
section {
  background-color: #fff;
}
</style>
