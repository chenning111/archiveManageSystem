<template>
  <!-- 编研原文查看 -->
  <section>
    <el-col :span="5" class="content-left">
      <div class="content-left-title">
        <span>原文列表</span>
      </div>
      <div class="btngroup flex-spaceBetween">
        <div>
          <el-button
            size="small"
            @click="download"
            style="margin-left:10px;"
            v-show="gridData.length!=0"
          >下载</el-button>
        </div>
        <div>
          <el-button
            size="small"
            @click="handleDelete(dataInfo.useId)"
            v-show="gridData.length!=0"
            style="margin-right:10px"
          >删除</el-button>
        </div>
      </div>
      <ul class="checkBox">
        <li v-if="gridData.length == 0">暂无数据</li>
        <li
          :class="dataInfo.useId == item.useId?'liChecked' : ''"
          @click="checkedFile(item)"
          v-for="(item,key) in gridData"
          :key="key"
          :title="item.fileName"
        >{{item.fileName}}</li>
      </ul>
    </el-col>
    <el-col :span="19" class="content-right">
      <el-col :span="24" class="content-title">
        <p class="shu-7">说明：本系统只展示pdf、常用视频音频格式文件，其他格式文件，请下载到本地浏览</p>
      </el-col>
      <el-col :span="24">
        <el-col :span="24" class="content-header" v-show="dataInfo.fileName">
          <div style="border-bottom:1px solid #ccc;padding-left:20px;">
            <div class="title">
              <div class="left">
                <h4 :title="dataInfo.fileName">{{dataInfo.fileName}}</h4>
                <p v-if="dataInfo.fileLength!=0">({{dataInfo.fileLength/1024 | toSize}})</p>
              </div>
              <div class="right"></div>
            </div>
          </div>
        </el-col>
        <el-col :span="24" style="background-color:#fff;padding:15px;">
          <iframe
            id="previewPdf"
            :src="pdfHtmlURL+'?file=' + baseUrl+'/'+pdfPath"
            height="800"
            width="100%"
            v-if="pdfPath"
          ></iframe>
          <video
            ref="video"
            controls="true"
            height="400"
            width="100%"
            v-if="videoPath"
            :src="baseUrl+'/'+videoPath"
            controlslist="nodownload"
          >您的浏览器不支持 video元素。</video>
          <audio
            :src="baseUrl+'/'+audioPath"
            v-if="audioPath"
            controls="true"
            controlslist="nodownload"
          >您的浏览器不支持 audio 标签。</audio>
        </el-col>
      </el-col>
    </el-col>
  </section>
</template>
<script>
import { downloadFile } from "@/common/js/util";
import {
  retrieveHistoricalUseBean,
  downLoadHistoricalUse,
  deleteHistoricalUseBean,
  retrieveHistoricalUsePath
} from "@/api/borrow";
export default {
  name: "utilizeOriginal",
  data() {
    return {
      dialogFormVisible: false,
      dialogFormVisible1: false, //修改原文信息
      pdfHtmlURL: this.pdfHtmlURL,
      baseUrl: this.baseURL,
      current: 1,
      showPdf: false,
      gridData: [],
      archivesData: {},
      useId: "", //文件号
      dataInfo: {},
      pdfPath: "", //pdf显示地址
      videoPath: "", //视频d地址
      audioPath: "", //音频地址
      videoType: ["webm", "mp4", "ogg"],
      audioType: ["mp3", "wav", "ogg"]
    };
  },
  methods: {
    download() {
      //下载
      let params = {
        useId: this.dataInfo.useId
      };
      downLoadHistoricalUse(params).then(res => {
        let fileName = this.dataInfo.fileName;
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8"
        ) {
          this.$message.error("下载失败");
        } else {
          downloadFile(fileName, res.data);
        }
      });
    },

    getData(flag = true) {
      this.videoPath = "";
      this.pdfPath = "";
      this.audioPath = "";
      let params = {
        star: 1,
        limit: 9999
      };
      retrieveHistoricalUseBean(params)
        .then(res => {
          if (res.success) {
            this.gridData = res.data.list || [];
            this.pdfPath = "";
            if (res.data.list.length > 0) {
              let obj = this.gridData.find(item => item.useId == this.useId);
              if (obj) {
                this.dataInfo = obj;
              } else {
                this.dataInfo = this.gridData[0];
              }
              this.handRead(this.dataInfo.useId);
            } else {
              this.dataInfo = {};
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.pdfPath = "";
        });
    },

    checkedFile(row) {
      //查看原文xinx
      this.pdfPath = "";
      this.useId = row.useId;
      this.dataInfo = row;
      this.handRead(this.useId);
    },
    handRead(code) {
      //获取详细信息
      if (code) {
        this.useId = code;
      }
      let params = {
        useId: this.useId
      };
      this.getPDFUrl();
    },
    getPDFUrl() {
      let params = {
        useId: this.useId
      };
      retrieveHistoricalUsePath(params).then(res => {
        if (res.success) {
          if (this.videoType.indexOf(this.dataInfo.FILETYPE) >= 0) {
            this.videoPath = res.data;
            this.audioPath = "";
            this.pdfPath = "";
          } else if (this.audioType.indexOf(this.dataInfo.FILETYPE) >= 0) {
            this.videoPath = "";
            this.audioPath = res.data;
            this.pdfPath = "";
          } else {
            this.pdfPath = res.data;
            this.videoPath = "";
            this.audioPath = "";
          }
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    handleDelete(code) {
      this.$confirm("是否将此文件删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let arr = [];
          let params = {
            useId: code
          };
          deleteHistoricalUseBean(params).then(data => {
            if (data.code == 403) {
              this.$message.warning("暂无权限删除");
              return;
            }
            if (data.success) {
              this.$message.success("删除成功");
            } else {
              this.$message.error(data.msg);
            }
            this.getData();
          });
        })
        .catch(() => {});
    }
  },
  created() {
    this.useId = this.$route.query.useId;
    this.getData();
  }
};
</script>
<style scoped lang="scss">
section {
  background-color: #fff;
  overflow: hidden;
  .content-left {
    min-height: 500px;
    .content-left-title {
      .edit {
        color: #409eff;
        cursor: pointer;
      }
    }
    .btngroup {
      margin-top: 10px;
      padding: 0 5px;
      button {
        margin-top: 5px;
      }
    }
    ul {
      list-style: none;
      padding: 20px 10px;
      margin: 0;
      min-height: 200px;
      li {
        height: 40px;
        line-height: 40px;
        padding-left: 10px;
        cursor: pointer;
        border-radius: 3px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      li:hover {
        color: #666;
      }

      li.liChecked {
        color: #fff;
      }
    }
  }
  .content-right {
    padding: 20px;
    min-height: 500px;
    border-left: 1px solid #eee;
  }
  .content-title {
    padding: 15px 0 15px 0;

    box-sizing: border-box;
    p {
      margin: 0;
      line-height: 60px;
      padding-left: 25px;
      color: #666;
      background-color: #f3f3f3;
    }
  }
  .content-header {
    background-color: #fff;
    // padding: 0 0px 15px 0;
    margin-top: 20px;
    .title {
      line-height: 60px;
      display: -webkit-box;
      display: -moz-box;
      display: -ms-flexbox;
      display: -webkit-flex;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-right: 20px;
      .left {
        display: -webkit-box;
        display: -moz-box;
        display: -ms-flexbox;
        display: -webkit-flex;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        max-width: 50%;
      }
      h4 {
        display: inline-block;
        color: #666;
        font-size: 20px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
        margin: 0;
        margin-right: 10px;
      }
      h3:hover {
        color: #555;
      }
      p {
        display: inline-block;
        margin: 0 20px;
        font-size: 14px;
        color: #777;
      }
    }
  }
  .btnwrapper1 {
    padding: 10px 0;
    border-bottom: 1px solid #ccc;
    .btn1 {
      margin-left: 15px;
    }
  }
  .pagina {
    margin: 15px 0px;
  }
  .tableTitle {
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    justify-content: space-between;
    padding: 0 15px;
    align-items: center;
    height: 55px;
    color: #666;
    border-bottom: 1px solid #f2f2f2;
    font-weight: 700;
    font-size: 16px;
  }
  .no {
    text-align: center;
    padding: 50px 20px 0 20px;

    img {
      height: 150px;
    }
    .cp {
      font-size: 18px;
      color: #666;
      font-weight: 700;
    }
    .last {
      color: #666;
    }
  }
}
</style>
<style lang="scss">
.addGdangBox {
  .el-dialog__body {
    padding: 10px 0px 0px 20px;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 30px 0 20px;
    .el-select {
      width: 100px;
      input {
        height: 35px;
      }
    }
  }
  table {
    margin-top: 20px;
    margin-left: 20px;
    border-collapse: collapse;
    tr {
      height: 35px;
    }
    td {
      width: 100px;
      border: 1px solid #ddd;
      height: 35px;
      text-align: center;
      overflow: hidden;
      vertical-align: middle;

      .el-select {
        .el-input--suffix .el-input__inner {
          padding: 0;
        }
        .el-input__suffix {
          display: none;
        }
        input {
          padding: 0;
          height: 35px;
          width: 100%;
          border: none;
          text-align: center;
        }
      }
    }
  }
}
</style>

