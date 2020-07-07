<template>
  <!-- 借出处理 -->
  <examine-content ref="examineContent" :words="words">
    <template slot="disposal">
      <div
        class="flex-spaceBetween"
        style="margin:0 15px;padding:0 15px;background-color:#e6e6e6;height:50px"
      >
        <span style="color:#444">勾选后，选择处理方式：催还或归还</span>
        <div>
          <el-button size="small" type="primary" @click="clickCh">催还</el-button>
          <el-button size="small" @click="clickGh">归还</el-button>
        </div>
      </div>
    </template>
  </examine-content>
</template>
<script>
import { Base64 } from "js-base64";
import examineContent from "../ExamineContent";
export default {
  data() {
    return {
      words: "lend"
    };
  },
  components: {
    examineContent
  },
  methods: {
    clickCh() {
      this.$refs.examineContent.Reminder();
    },
    clickGh() {
      this.$refs.examineContent.handleReturn();
    }
  },
  beforeRouteEnter(to, from, next) {
    // 注意，在路由进入之前，组件实例还未渲染，所以无法获取this实例，只能通过vm来访问组件实例
    next(vm => {
      to.meta.title = Base64.decode(vm.$route.query.title || "");
    });
  }
};
</script>