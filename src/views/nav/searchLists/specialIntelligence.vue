<template>
  <!-- 智能检索 -->
  <section>
    <div class="content-header flex-spaceBetween" :class="fixedDiv?'fixedDiv':''" ref="header">
      <search-header title="深度检索" :addZt="addZt"></search-header>
      <div class="search">
        <el-form :model="form" inline ref="form">
          <el-link type="primary" @click="$router.push('/special')" v-if="addZt">查看专题目录</el-link>
          <el-form-item style="margin-bottom:0;">
            <el-button @click="searchlist('form')" type="primary">搜索</el-button>
            <el-button type="primary" v-show="fixedDiv">申请借阅</el-button>
          </el-form-item>
          <el-form-item
            style="margin-bottom:0;width:50%"
            :rules="[{ required: true,message: '请输入关键词',trigger: 'blur'}]"
            prop="keywords"
          >
            <el-input v-model="form.keywords" placeholder="请输入文号、题名、责任者、成文日期，多个关键词之间使用一个空格分开"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-col
      :span="24"
      style="background-color:#fff;min-height:500px;padding:20px;"
      class="contentFixed"
    >
      <searchList></searchList>
    </el-col>
  </section>
</template>

<script>
import searchHeader from "./searchHeader";
import searchList from "../../search/SearchList";
export default {
  data() {
    return {
      form: {
        keywords: ""
      },
      addZt: false,
      fixedDiv: false
    };
  },
  methods: {
    handleScroll() {
      var scrollTop = this.$parent.$el.scrollTop;
      if (scrollTop > 100) {
        this.fixedDiv = true;
        this.$refs.header.style.width =
          document.querySelector(".contentFixed").offsetWidth + "px";
      } else {
        this.fixedDiv = false;
      }
    }
  },
  components: {
    searchList,
    searchHeader
  },
  mounted() {
    this.form.keywords = this.$route.params.keywords || "";
    this.addZt = String(this.$route.query.addZt) == "true" ? true : false;
    window.addEventListener("scroll", this.handleScroll, true);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll, true);
  }
};
</script>

<style lang="scss" scoped>
section {
  .content-header {
    background-color: #fafafa;
    padding: 15px;
    border-bottom: 1px solid #eee;
    z-index: 100;
    box-sizing: border-box;
    .search {
      flex: 1;
      margin-right: 23px;
      .el-form {
        display: inline-block;
        vertical-align: middle;
        display: flex;
        flex-direction: row-reverse;
        /deep/ .el-form-item__content {
          width: 100%;
        }
      }
    }
  }
  .fixedDiv {
    position: fixed;
    top: 110px;
  }
}
</style>
