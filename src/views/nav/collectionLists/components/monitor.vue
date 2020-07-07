<!--  -->
<template>
  <div class="block">
    <el-timeline :reverse="true">
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :timestamp="activity.timestamp"
      >{{activity.msg}}</el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
export default {
  name: "monitor",
  data() {
    return {
      websock: null,
      activities: []
    };
  },
  methods: {
    initWebSocket() {
      let wsurl = `${this.webSocketUrl}`;
      //初始化weosocket

      this.websock = new WebSocket(wsurl);
      this.websock.onmessage = this.websocketonmessage;
      this.websock.onopen = this.websocketonopen;
      this.websock.onerror = this.websocketonerror;
      this.websock.onclose = this.websocketclose;
    },
    websocketonopen() {
      //连接建立之后执行send方法发送数据
      let actions = { userId: "admin" };
      this.websocketsend(JSON.stringify(actions));
    },
    websocketonerror() {
      //连接建立失败重连
      this.$message.warning("连接建立失败");
    },
    websocketonmessage(e) {
      //数据接收
      this.activities.push({
        timestamp: new Date().format("yyyy-MM-dd hh:mm:ss"),
        msg: e.data
      });
      if (this.activities.length > 500) {
        //保留500条
        this.activities.splice(0, this.activities.length - 500);
      }
    },
    websocketsend(Data) {
      //数据发送
      this.websock.send(Data);
    },
    websocketclose(e) {
      //关闭
      this.$message.warning("断开连接");
      console.log("断开连接", e);
    }
  },
  created() {
    this.initWebSocket();
  }

  // beforeRouteLeave(to, from, next) {
  //   if (this.websock) {
  //     this.websock.close();
  //   }
  //   next();
  // }
};
</script>
<style scoped lang='scss'>
/* @import url(); 引入css类 */
</style>