<template>
  <!-- 智能检索 -->
  <section>
    <div class="content-title flex-start">
      <div class="shu-7">
        <p>请在下框中输入文件的文号、题名、责任者、成文日期，可以使用关键词</p>
        <p>
          多个关键词之间使用一个空格分开，然后点击查询。例如：“先进集体 苏交政
          1999”
        </p>
      </div>
    </div>
    <div class="content-header flex-center" :class="fixedDiv ? 'fixedDiv' : ''" ref="header">
      <div>
        <!-- <search-header title="智能检索"></search-header> 默认深度检索 也就是智能检索 后续未知是否放出 代码不修改-->
        <search-header title="深度检索"></search-header>
        <div class="search">
          <el-form :model="form" inline ref="form">
            <el-form-item
              :rules="[
                { required: true, message: '请输入关键词', trigger: 'blur' }
              ]"
              prop="keywords"
            >
              <el-input
                v-model="form.keywords"
                style="width:550px;"
                placeholder="请输入文号、题名、责任者、成文日期，多个关键词之间使用一个空格分开"
              ></el-input>
              <el-button @click="searchlist('form')" type="primary">搜索</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <el-col :span="24" style="min-height:500px;" class="contentFixed">
      <div class="content-bot flex-textCenter" ref="content">
        <div class="bot-item">
          <el-card class="box-card" shadow="never" v-loading="MlLoading">
            <div slot="header" class="flex-spaceBetween">
              <span class="title">档案门类列表</span>
              <el-button type="text" @click="$router.push('/specialCategory')">更多</el-button>
            </div>
            <div
              v-for="item in categoryList"
              :key="item.id"
              class="item"
              @click="handleNodeClick(item)"
            >{{ item.text }}</div>
            <div v-if="categoryList.length == 0">暂无档案门类</div>
          </el-card>
        </div>
        <div class="bot-item">
          <el-card class="box-card" shadow="never" v-loading="ztLoading">
            <div slot="header" class="flex-spaceBetween">
              <span class="title">专题目录列表</span>
              <el-button type="text" @click="$router.push('/thematicRetrieval')">更多</el-button>
            </div>
            <div
              v-for="item in thematicList"
              :key="item.topiccode"
              class="item"
              @click="goZt(item)"
            >{{ item.topicname }}</div>
            <div v-if="thematicList.length == 0">暂无专题</div>
          </el-card>
        </div>
        <div class="bot-item">
          <el-card class="box-card" shadow="never" v-loading="scLoading">
            <div slot="header" class="flex-spaceBetween">
              <span class="title">收藏目录列表</span>
              <el-button type="text" @click="$router.push('/collectSearch')">更多</el-button>
            </div>
            <div
              v-for="item in collectList"
              :key="item.id"
              class="item"
              @click="goSc(item)"
            >{{ item.collectionName }}</div>
            <div v-if="collectList.length == 0">暂无收藏夹</div>
          </el-card>
        </div>
      </div>
    </el-col>
  </section>
</template>

<script>
import searchHeader from "./searchHeader";
import { getAllCreateCollectionFiles } from "@/api/collect";
import { retrieveSpecialTopicCatalog } from "@/api/special";
import { deepQuery, deepClone, getDataFromId } from "@/common/js/util";
export default {
  data() {
    return {
      defaultProps: {
        children: "children",
        label: "text"
      },
      form: {
        keywords: ""
      },
      MlLoading: false, //门类
      scLoading: false, //收藏
      ztLoading: false,
      collectList: [],
      thematicList: [],
      tableViewTree: [],
      classType: "D_ARCHIVE",
      fixedDiv: false
    };
  },
  methods: {
    searchlist() {
      this.$router.push({
        name: "specialIntelligence",
        params: {
          keywords: this.form.keywords
        }
      });
    },
    handleNodeClick(data) {
      let code = "";
      if (data.children && data.children.length > 0) {
        let wj = data.children.filter(
          node => node.li_attr.TABLECLASSTYPE == "A"
        )[0]; //是文件类
        let aj = data.children.filter(
          node => node.li_attr.TABLECLASSTYPE == "F"
        )[0]; //是案卷类
        let kj = data.children.filter(
          node => node.li_attr.TABLECLASSTYPE == "I"
        )[0]; //项目类
        if (wj) {
          //如果只有文件
          code = wj.id;
        } else {
          code = data.children[0].id;
        }
      }
      this.$router.push({
        name: "specialCategory",
        params: {
          code: code
        }
      });
    },
    goZt(data) {
      //去专题
      data.id = data.topiccode;
      this.$router.push({
        name: "thematicRetrieval",
        params: {
          data: data
        }
      });
    },
    goSc(data) {
      //去收藏
      this.$router.push({
        name: "collectSearch",
        params: {
          code: data.id
        }
      });
    },
    getZtList() {
      let params = {
        limit: 99999,
        star: 1
      };
      this.ztLoading = true;
      retrieveSpecialTopicCatalog(params)
        .then(res => {
          this.ztLoading = false;
          if (res.success) {
            let list = res.data.list || [];
            this.thematicList = this.getAllZtList(list, []);
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    getAllZtList(data = [], res = []) {
      //获取所有的底层门类
      data.forEach(item => {
        if (item.children && item.children.length > 0) {
          this.getAllZtList(item.children, res);
        }
        res.push(item);
      });
      return res;
    },
    getScList() {
      this.scLoading = true;
      getAllCreateCollectionFiles()
        .then(res => {
          this.scLoading = false;
          if (res.success) {
            this.collectList = res.data || [];
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {});
    },
    initData() {
      this.getZtList(); //获取专题
      this.getScList(); //获取收藏夹
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
    },
    handleScroll() {
      var scrollTop = this.$parent.$el.scrollTop;
      if (scrollTop > 300) {
        this.fixedDiv = true;
        this.$refs.header.style.width =
          document.querySelector(".contentFixed").offsetWidth + "px";
      } else {
        this.fixedDiv = false;
      }
    }
  },
  components: {
    searchHeader
  },
  mounted() {
    this.initData();
    this.MlLoading = true;
    this.$store.dispatch("tree/tableViewTree").then(() => {
      this.MlLoading = false;
      let obj = getDataFromId(
        [this.$store.getters.tableViewTree],
        this.classType
      );
      this.tableViewTree = [obj];
    });
    window.addEventListener("scroll", this.handleScroll, true);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll, true);
  },
  computed: {
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
  }
};
</script>

<style lang="scss" scoped>
section {
  position: relative;
  .content-title {
    padding: 15px 20px;
    background-color: #fff;
    box-sizing: content-box;
    height: 90px;
    p {
      margin: 0;
      line-height: 35px;
      padding-left: 25px;
      color: #666;
    }
  }
  .content-header {
    background-color: #fafafa;
    padding-top: 30px;
    border-bottom: 1px solid #eee;
    margin: 20px 0;
    width: 100%;
    .search {
      margin-top: 10px;
      .el-form {
        display: inline-block;
        margin-right: 20px;
        vertical-align: middle;
      }
      .el-link {
        position: relative;
        top: -12px;
      }
    }
  }
  .fixedDiv {
    position: fixed;
    top: 90px;
  }
  .fixedDiv + .contentFixed {
    padding-top: 120px;
  }
  .content-bot {
    .bot-item {
      width: 32%;
      min-height: 700px;
      .box-card {
        min-height: 500px;
        padding-bottom: 9999px;
        margin-bottom: -9999px;
        background-color: #fff;
        .title {
          color: #409eff;
          font-weight: 700;
          font-size: 16px;
        }
        /deep/ .el-card__header {
          padding: 10px 20px;
        }
        .item {
          line-height: 40px;
          padding: 0 10px;
          cursor: pointer;
          border-radius: 3px;
        }
        .item:hover {
          background-color: #eee;
        }
      }
    }
  }
}
</style>
