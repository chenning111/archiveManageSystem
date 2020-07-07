<!-- 接口配置 -->
<template>
  <section>
    <header>数据录入接口控制台(XML)</header>
    <div class="content">
      <el-tabs type="border-card" @tab-click="handleClick" v-model="activeName">
        <el-tab-pane
          :label="tab.label"
          v-for="tab in tabList"
          :key="tab.name"
          :name="tab.name"
        >
          <keep-alive>
            <router-view></router-view>
          </keep-alive>
        </el-tab-pane>
      </el-tabs>
    </div>
  </section>
</template>

<script>
export default {
  name: "interFace",
  data() {
    return {
      activeName: "monitor",
      tabList: [
        {
          label: "系统监控",
          name: "monitor"
        }
        // {
        //   label: "系统状态",
        //   name: "systemState"
        // }
        // {
        //   label: "字段映射",
        //   name: "main_mapping"
        // },
        // {
        //   label: "存储清单",
        //   name: "manifest_list"
        // },
        // {
        //   label: "错误清单",
        //   name: "error_list"
        // },
        // {
        //   label: "系统日志",
        //   name: "sys_log"
        // },
        // {
        //   label: "帮助手册",
        //   name: "handbook"
        // }
      ]
    };
  },
  methods: {
    handleClick(tab) {
      this.$router.push("/interFace/" + tab.name);
    }
  },
  //生命周期 - 创建完成（访问当前this实例）
  created() {},
  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
};
</script>
<style scoped lang="scss">
/* @import url(); 引入css类 */
section {
  header {
    height: 60px;
    line-height: 60px;
    font-size: 22px;
    color: #333;
    padding: 0 10px;
    border: 1px solid #dcdfe6;
    margin-bottom: 10px;
    border-bottom: none;
    background-color: #fff;
  }
  .content {
    /deep/ .el-tabs__content {
      min-height: 500px;
      max-height: 500px;
      overflow: auto;
    }
  }
}
</style>
