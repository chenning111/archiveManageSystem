<template>
  <section>
    <div class="title flex-spaceBetween">
      <p>为您找到相关结果约100,000,0个， 搜索用时 (0.23秒)</p>
      <el-button type="primary">申请借阅</el-button>
    </div>
    <ul class="list-content">
      <li v-for="(item,key) in list" :key="key">
        <el-checkbox :key="key" @change="checkedText(key,$event)"></el-checkbox>
        <el-button type="success" size="mini" class="collectBtn">收藏</el-button>
        <h3 @click.stop="readText(item.id)" class="ellipsis">{{item.header}}</h3>
        <p>
          题名：
          <span>{{item.title}}</span>
        </p>
        <p>
          年度：
          <span class="year">{{item.year}}</span>
        </p>
      </li>
    </ul>
    <el-pagination
      class="pull-right"
      @current-change="handlecurrentChange"
      background
      layout="prev, pager, next"
      :total="list.length"
    ></el-pagination>
  </section>
</template>
<script>
export default {
  name: "searchList",
  data() {
    return {
      list: [
        {
          id: 1,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        },
        {
          id: 2,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        },
        {
          id: 3,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        },
        {
          id: 4,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        },
        {
          id: 5,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        },
        {
          id: 6,
          header: "【文书档案】JSJT-2013-001-0002-0034 苏交办【2013】019号",
          title: "关于召开2012年年终表彰总结大会的通知",
          year: "2015"
        }
      ]
    };
  },
  methods: {
    checkedText(index, e) {
      console.log(index, e);
    },
    handlecurrentChange(current) {
      console.log(current);
    },
    readText(id) {
      this.$confirm("您暂时没有阅读原文的权限，需像管理员申请", "原文提示", {
        confirmButtonText: "申请",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$router.push({ path: "/searchContent" });
        })
        .catch(() => {
          this.$message.info("已取消申请");
        });
    }
  },
  mounted() {}
};
</script>
<style scoped lang="scss">
section {
  .title {
    height: 40px;
    p {
      margin-right: 10px;
      color: #666;
    }
    .msg {
      color: #ff0036;
      margin-left: 100px;
    }
  }
  ul {
    margin-top: 20px;
    list-style: none;
    padding-left: 0;
    li {
      border: 1px solid #ccc;
      border-radius: 3px;
      padding-left: 40px;
      margin-bottom: 20px;
      position: relative;
      .el-checkbox {
        position: absolute;
        left: 15px;
        top: 19px;
        /deep/ .el-checkbox__inner {
          width: 20px;
          height: 20px;
        }
        /deep/ .el-checkbox__inner::after {
          top: 1px;
          left: 8px;
          height: 12px;
        }
      }
      .collectBtn {
        position: absolute;
        right: 15px;
        top: 14px;
      }
      h3,
      p {
        line-height: 20px;
        color: #999;
      }
      h3 {
        font-size: 20px;
        font-weight: 700;
        color: #666;
        cursor: pointer;
        width: 80%;
      }
      h3:hover {
        color: #333;
      }
      span {
        color: #ff0036;
      }
    }
  }
}
</style>

