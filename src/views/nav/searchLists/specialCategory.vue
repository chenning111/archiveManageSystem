<template>
  <!-- 档案门类检索 -->
  <section>
    <div class="content-header flex-spaceBetween">
      <search-header title="档案门类检索" :addZt='addZt'></search-header>
    </div>
    <commonData classType="D_ARCHIVE" :isDataEntry="isDataEntry" :addZt="addZt">
      <span class="cardTitle" slot="archive">档案门类</span>
    </commonData>
  </section>
</template>

<script>
import commonData from "@/components/commonData";
import searchHeader from './searchHeader'

export default {
  name:"specialCategory",
  data() {
    return {
      isDataEntry: false,
      addZt:false
    };
  },
  components: {
    commonData,searchHeader
  },
  mounted(){
    // this.addZt = String(this.$route.query.addZt) =='true' ?true:false
  },
 
  beforeRouteEnter(to,from,next){
      next(vm=>{
        if(from.name =='search'){
          vm.$store.dispatch('permission/del_cachedViews',to.name)
        }
        vm.addZt = String(vm.$route.query.addZt) =='true' ?true:false //因为门类检索是缓存组件 需要修改变量
      });
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
  overflow: hidden;
  .content-header {
    background-color: #fafafa;
    padding: 15px 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
  }
}
</style>
