<template>
  <section>
    <div v-if="dataInfo.messagecode">
      <div class="content-header">
        <h2>{{dataInfo.messagetitle}}</h2>
        <p>发件人： {{dataInfo.fromusername||"系统消息"}} &nbsp; &nbsp;&nbsp;发信时间： {{dataInfo.senddate | filterTime}}</p>
      </div>
      <div class="detail">
        <p>
          {{dataInfo.messagebody}}
          <span v-if="dataInfo.useStatus=='二级核准'">
            ，请
            <em @click="$router.push('/authorizedRead')">点击这里</em>查看！
          </span>
          <span v-if="dataInfo.useStatus == '生成报表成功'">
            <em @click="downloadFile">请点击下载</em>
          </span>
        </p>
        <div class="pl" v-if="getIsshow()">
          <div class="pl-title">
            <span class="shu-3">发表评论</span>
          </div>
          <div class="pl-content">
            <el-select v-model="content">
              <el-option value="档案很有帮助" label="档案很有帮助"></el-option>
              <el-option value="没有用" label="没有用"></el-option>
            </el-select>
          </div>
          <div class="pl-submit">
            <el-button type="primary" size="meduim" @click="handleFk">提交</el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="content-header">
        <h2>暂未获取到相关信息</h2>
      </div>
    </div>
  </section>
</template>
<script>
import { downExcel } from "@/api/report";
import { useFeedback } from "@/api/borrow";
import { downloadFile } from "@/common/js/util";
import { readMessage, retrieveMessage } from "@/api/message";
export default {
  name: "messageDetail",
  data() {
    return {
      messagecode: "", //消息编号
      dataInfo: {},
      content: ""
    };
  },
  methods: {
    downloadFile() {
      let code = this.dataInfo.messagebody.split("：")[1];
      let params = {
        reportCode: code,
        type: 1
      };
      downExcel(params).then(res => {
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          let filename = this.dataInfo.messagetitle.split("：")[1];
          downloadFile(filename, res.data);
        }
      });
    },
    getIsshow() {
      if (this.dataInfo.messagestatus == 0) {
        if (
          this.dataInfo.useStatus == "归还" ||
          this.dataInfo.useStatus == "收回"
        ) {
          this.content = "档案很有帮助";
          return true;
        }
      } else {
        return false;
      }
    },
    handleFk() {
      //提交反馈
      if (this.content == "") {
        this.$message.warning("请选择一项");
        return;
      }
      useFeedback({
        anticipativeeffect: this.content,
        danghao: this.dataInfo.lendcode
      }).then(res => {
        if (res.success) {
          this.res.msg$message.success("操作成功");
          this.initData();
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    initData() {
      readMessage({ messagecode: this.messagecode }).then(res => {
        //获取详细信息
        if (res.success) {
          this.dataInfo = res.data;
        } else {
          this.$message.error(res.msg);
        }
      });
      //获取右上角信息个数
      let params = {
        limit: 9999,
        star: 1
      };
      retrieveMessage(params)
        .then(res => {
          if (res.success) {
            let arr = res.data.list || [];
            let noRead = arr.filter(item => item.messagestatus == 0);
            this.bus.$emit("messageNum", noRead.length);
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {});
    }
  },
  mounted() {
    this.messagecode = this.$route.query.code;
    this.initData();
  },
  filters: {
    filterTime(value) {
      return new Date(value).format("yyyy-MM-dd hh:mm");
    }
  }
};
</script>
<style scoped lang="scss">
section {
  .content-header {
    background-color: #fafafa;
    padding: 15px 15px;
    border-bottom: 1px solid #eee;
    p,
    h2 {
      line-height: 1.5;
    }
    h2 {
      color: #666;
    }
  }
  .detail {
    min-height: 500px;
    background-color: #fff;
    padding: 15px;
    p {
      em {
        color: #ff0036;
        text-decoration: underline;
        margin: 0 3px;
        cursor: pointer;
        font-style: normal;
      }
    }
    .pl {
      line-height: 30px;
      .shu-3 {
        padding-left: 5px;
        color: #333;
        font-size: 16px;
      }
      .pl-content {
        width: 70%;
        margin: 20px 0;
      }
      .pl-submit {
        width: 70%;
        text-align: right;
      }
    }
  }
}
</style>