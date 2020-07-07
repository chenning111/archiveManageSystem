<template>
  <!-- 编研原文查看 -->
  <section>
    <el-col :span="5" class="content-left">
      <div class="content-left-title">
        <span>原文列表</span>
        <el-link
          type="primary"
          @click="addData"
          title="上传原文"
          :disabled="$is_disabled(['original-upload']) ? false : true"
        >上传</el-link>
      </div>
      <div class="btngroup flex-spaceBetween">
        <div>
          <el-button
            size="small"
            @click="download"
            style="margin-left:10px;"
            v-show="gridData.length != 0"
            :disabled="$is_disabled(['original-download']) ? false : true"
          >下载</el-button>
          <el-button
            size="small"
            @click="putTop(dataInfo.FILECODE)"
            v-show="gridData.length != 0"
            :disabled="$is_disabled(['original-top']) ? false : true"
          >置顶</el-button>
        </div>
        <div>
          <el-button
            size="small"
            @click="handleDelete(dataInfo.FILECODE)"
            v-show="gridData.length != 0"
            :disabled="$is_disabled(['original-delete']) ? false : true"
            style="margin-right:10px"
          >删除</el-button>
        </div>
      </div>
      <ul class="checkBox">
        <li v-if="gridData.length == 0">暂无数据</li>
        <li
          :class="dataInfo.FILECODE == item.FILECODE ? 'liChecked' : ''"
          @click="checkedFile(item)"
          v-for="(item, key) in gridData"
          :key="key"
          :title="item.FILENAME"
        >
          <el-tooltip effect="dark" :content="item.FILENAME" placement="right">
            <div class="ellipsis">{{ item.FILENAME }}</div>
          </el-tooltip>
        </li>
      </ul>
    </el-col>
    <el-col :span="19" class="content-right">
      <el-col :span="24" class="content-title">
        <p class="shu-7">说明：本系统只展示pdf、常用视频音频格式文件，其他格式文件，请下载到本地浏览</p>
      </el-col>
      <el-col :span="24">
        <el-col :span="24" class="search-content-head" v-show="dataInfo.FILENAME">
          <el-tooltip effect="dark" :content="mainTitle" placement="top-start">
            <span class="top ellipsis">{{ mainTitle }}</span>
          </el-tooltip>
          <div class="bot flex-spaceBetween">
            <div class="bot-l flex-start">
              <el-tooltip
                effect="dark"
                :content="dataInfo.FILE_NAME_ZH_CN || dataInfo.FILENAME"
                placement="bottom"
              >
                <div
                  class="ellipsis"
                  style="max-width:75%"
                >{{ dataInfo.FILE_NAME_ZH_CN || dataInfo.FILENAME }}</div>
              </el-tooltip>
              <span v-if="dataInfo.FILELENGTH != 0">({{ (dataInfo.FILELENGTH / 1024) | toSize }})</span>
            </div>
            <div class="bot-r">
              <el-button plain @click="readFile(dataInfo.FILECODE)" size="small">原文信息</el-button>
            </div>
          </div>
          <!-- <div style="border-bottom:1px solid #ccc;padding-left:20px;">
            <div class="title">
              <div class="left">
                <h4
                  :title="dataInfo.FILENAME"
                  @click="readFile(dataInfo.FILECODE)"
                >
                  {{ dataInfo.FILENAME }}
                </h4>
                <p v-if="dataInfo.FILELENGTH != 0">
                  ({{ (dataInfo.FILELENGTH / 1024) | toSize }})
                </p>
              </div>
              <div class="right">
                <el-button plain @click="readFile(dataInfo.fileCode)" size="small">原文信息</el-button>
              </div>
            </div>
          </div>-->
        </el-col>
        <el-col :span="24" style="background-color:#fff;padding:15px;">
          <div class="no" v-if="gridData.length == 0">
            <img src="../../../assets/img/text.png" alt="无原文" />
            <p class="cp">您还没上传任何原文</p>
            <p class="last">需要添加原文后才能执行相关操作</p>
            <div class="textCenter">
              <el-button
                size="small"
                @click="addData"
                type="primary"
                :disabled="$is_disabled(['original-upload']) ? false : true"
              >添加原文</el-button>
            </div>
          </div>
          <iframe
            id="previewPdf"
            :src="pdfHtmlURL + '?file=' + baseUrl + '/' + pdfPath"
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
            :src="baseUrl + '/' + videoPath"
            controlslist="nodownload"
          >您的浏览器不支持 video元素。</video>
          <audio
            :src="baseUrl + '/' + audioPath"
            v-if="audioPath"
            controls="true"
            controlslist="nodownload"
          >您的浏览器不支持 audio 标签。</audio>
        </el-col>
      </el-col>
    </el-col>
    <!-- 添加一条数据 -->
    <el-dialog title="原文上传" :visible.sync="dialogFormVisible" ref="dialog" width="935px">
      <add-yuanwen
        @cancel="cancel"
        :recordCode="recordCode"
        :tableCode="tableCode"
        @getList="getData"
      ></add-yuanwen>
    </el-dialog>
    <!-- 修改数据 -->
    <el-dialog
      title="基本信息"
      :visible.sync="dialogFormVisible1"
      custom-class="formdialog"
      ref="dialog"
      width="935px"
    >
      <Formbox
        ref="formbox"
        :tableCardList="tableCardList"
        :departmentList="departmentList"
        @updateformData="updateformData"
        @cancel="cancel"
        :gridData="gridData"
        :recordCode="recordCode"
        :fondsList="fondsList"
        :archivesData="archivesData"
        :classnodeId="classnodeId"
      >
        <template slot="update">
          <div class="pull-left">
            <el-button
              size="small"
              @click="$refs.formbox.updateformData('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >保存</el-button>
            <el-button
              size="small"
              @click="$refs.formbox.resetForm('ruleForm')"
              type="primary"
              :disabled="tableCardList.length == 0 ? true : false"
            >重置</el-button>
            <el-button size="small" @click="cancel">取消</el-button>
          </div>
        </template>
      </Formbox>
    </el-dialog>
  </section>
</template>
<script>
import { downloadFile } from "@/common/js/util";
import Formbox from "@/components/Formbox";
import addYuanwen from "./components/addYuwen";
import { getInputCard } from "@/api/tableView";
import {
  retrieveEditorOriginal,
  deleteEditorOriginal,
  topFile,
  downLoadEditorOriginal,
  retrieveEditorOriginalPath,
  retrieveEditorOriginalDetailed,
  updateEditorOriginal
} from "@/api/editor";
export default {
  inject: ["reload"],
  name: "original",
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
      tableCardList: [], //录入列
      fileCode: "", //文件号
      recordCode: "", //档案条目号
      dataInfo: {},
      pdfPath: "", //pdf显示地址
      videoPath: "", //视频d地址
      audioPath: "", //音频地址
      videoType: ["webm", "mp4", "ogg"],
      audioType: ["mp3", "wav", "ogg"],
      classnodeId: "",
      mainTitle: "",
      tableCode: ""
    };
  },
  methods: {
    putTop() {
      //置顶
      this.$confirm("是否将此原文置顶", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            fileCode: this.dataInfo.FILECODE
          };
          topFile(params).then(res => {
            if (res.code === 403) {
              this.$message.warning("暂无权限置顶原文");
              return;
            }
            if (res.success) {
              this.$message.success("置顶成功");
              this.getData();
            } else {
              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    },
    updateformData(data, bol) {
      let params = {
        fileCode: this.fileCode,
        params: JSON.stringify(data)
      };
      if (params.params == "{}") {
        this.dialogFormVisible1 = false;
        return false;
      }
      updateEditorOriginal(params).then(data => {
        this.$refs.formbox.loading = false;
        if (data.code === 403) {
          this.$message.warning("暂无权限修改");
          return;
        }
        if (data.success) {
          this.$message.success("修改成功");
          this.getData(false);
        } else {
          this.$message.error("修改失败");
        }
      });
      this.dialogFormVisible1 = false;
    },
    download() {
      //下载
      let params = {
        fileCode: this.dataInfo.FILECODE
      };
      downLoadEditorOriginal(params).then(res => {
        let fileName = this.dataInfo.FILENAME;
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
    addData() {
      this.dialogFormVisible = true;
    },
    cancel() {
      this.dialogFormVisible1 = false;
      this.dialogFormVisible = false;
    },
    getData(flag = true) {
      this.videoPath = "";
      this.pdfPath = "";
      this.audioPath = "";
      let params = {
        recordCode: this.recordCode,
        pageNumber: 1,
        pageSize: 9999
      };
      retrieveEditorOriginal(params)
        .then(res => {
          if (res.success) {
            this.gridData = res.data.originaFilePageInfo.list || [];
            if (flag) {
              //如果是true 加载第一个 否则就是点击不是第一个原文修改
              this.pdfPath = "";

              if (res.data.originaFilePageInfo.list.length > 0) {
                this.dataInfo = this.gridData[0];
                this.handRead(this.dataInfo.FILECODE);
              } else {
                this.dataInfo = {};
              }
            } else {
              this.dataInfo = this.gridData.filter(
                item => item.FILECODE == this.dataInfo.FILECODE
              )[0];
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
      this.fileCode = row.FILECODE;
      this.dataInfo = row;
      this.handRead(this.fileCode);
    },
    handRead(code) {
      //获取详细信息
      if (code) {
        this.fileCode = code;
      }
      let params = {
        fileCode: this.fileCode
      };
      retrieveEditorOriginalDetailed(params).then(res => {
        if (res.success) {
          this.archivesData = res.data;
          this.getPDFUrl();
        } else {
          this.$message.error("获取原文详情失败");
        }
      });
    },
    getPDFUrl() {
      let params = {
        fileCode: this.fileCode
      };
      retrieveEditorOriginalPath(params).then(res => {
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
    readFile(code) {
      if (JSON.stringify(this.archivesData) === "{}") {
        this.$message.warning("暂无权限访问该原文");
        return;
      }
      this.dialogFormVisible1 = true;
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
            fileCode: code,
            tableCode: this.tableCode
          };
          deleteEditorOriginal(params).then(data => {
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
    this.recordCode = this.$route.query.recordCode;
    this.classnodeId = this.$route.query.classnodeId;
    this.tableCode = this.$route.query.tableCode;
    this.mainTitle = this.$route.query.mainTitle;
    this.$store.dispatch("tree/departmentTree"); //获取部门树
    this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗数组
    getInputCard({ tableCode: "187530" }).then(res => {
      if (res.success) {
        this.tableCardList = res.data;
      } else {
        thiis.$message.error(res.msg);
      }
    });

    this.getData();
  },
  components: {
    addYuanwen,
    Formbox
  },
  computed: {
    departmentList() {
      return this.$store.getters.departmentTree;
    },
    fondsList() {
      return this.$store.state.fondsCatalog.fondsList;
    }
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
        text-decoration: underline;
        cursor: pointer;
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
