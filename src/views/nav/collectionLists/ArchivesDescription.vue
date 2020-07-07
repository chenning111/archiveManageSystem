<template>
  <Dataentry classType="D_ARCHIVE" :isDataEntry="isDataEntry">
    <span class="cardTitle" slot="archive">档案门类</span>
  </Dataentry>
</template>

<script>
import Dataentry from "@/components/dataEntry";

export default {
  name: "archivesDescription",
  data() {
    return {
      isDataEntry: true
    };
  },
  components: {
    Dataentry
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch("permission/add_cachedViews", from.name); //添加缓存组件
    next();
  },
  watch: {}
};
</script>

<style lang="scss" scoped>
</style>
