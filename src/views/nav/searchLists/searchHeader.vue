<template>
  <div class="flex-spaceBetween">
    <div class="btngroup">
      <!-- <span :class="title == '智能检索' ?'liChecked':''" @click="go('/specialIntelligence')">智能检索</span> -->
      <!-- <span :class="title == '全文检索' ?'liChecked':''" @click="go('/specialFulltext')">全文检索</span> -->
      <span :class="title == '深度检索' ?'liChecked':''" @click="go('/specialIntelligence')">深度检索</span>
      <span :class="title == '档案门类检索' ?'liChecked':''" @click="go('/specialCategory')">档案门类检索</span>
      <span
        :class="title == '收藏检索' ?'liChecked':''"
        @click="go('/collectSearch')"
        v-if="!addZt"
      >收藏检索</span>
      <span
        :class="title == '汇编检索' ?'liChecked':''"
        @click="go('/thematicRetrieval')"
        v-if="!addZt"
      >汇编检索</span>
    </div>
    <div style="margin:0 20px">
      <el-link
        type="primary"
        v-if="addZt && title=='档案门类检索'"
        @click="$router.push('/special')"
      >查看专题目录</el-link>
    </div>
  </div>
</template>
<script>
export default {
  name: "searchHeader",
  props: ["title", "addZt"],
  methods: {
    go(pathname) {
      this.$router.push({
        path: pathname,
        query: {
          addZt: this.addZt
        }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
.btngroup {
  span {
    display: inline-block;
    padding: 8px 10px;
    color: #666;
    margin-left: 10px;
    cursor: pointer;
    border-radius: 3px;
  }
  .liChecked {
    color: white;
  }
}
</style>