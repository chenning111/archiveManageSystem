<template>
  <section>
    <el-col :span="5" class="content-left">
      <div class="content-left-title">
        <span>原文列表</span>
        <el-link type="primary" @click="addData" title="上传原文" v-show="!isSearch">上传</el-link>
      </div>
      <div class="btngroup">
        <el-button
          size="small"
          @click="download"
          style="margin-left:10px;"
          v-show="gridData.length != 0"
          :disabled="
            $is_disabled(['searchContent-download']) && !ismerge ? false : true
          "
        >下载</el-button>
        <el-button
          size="small"
          @click="putTop(dataInfo.FILECODE)"
          v-show="gridData.length != 0"
          :disabled="
            $is_disabled(['searchContent-top']) && !ismerge ? false : true
          "
        >置顶</el-button>
        <el-button
          size="small"
          @click="mergeFunc"
          :disabled="!ismerge ? false : true"
          v-show="gridData.length != 0"
          v-if="!isSearch"
        >合并</el-button>

        <el-button
          size="small"
          @click="delAndDraw('', 1)"
          v-show="gridData.length != 0"
          :disabled="
            $is_disabled(['searchContent-delete']) && !ismerge ? false : true
          "
          v-if="!isSearch"
          style="margin-right:10px"
        >删除</el-button>
      </div>
      <ul class="checkBox">
        <li v-if="gridData.length == 0">暂无数据</li>
        <li
          :class="
            dataInfo.FILECODE == item.FILECODE && !ismerge ? 'liChecked' : ''
          "
          @click="checkedFile(item)"
          v-for="(item, key) in gridData"
          :key="key"
        >
          <el-checkbox
            v-model="item.checked"
            v-if="ismerge"
            @click.stop.native="changeCheked(item)"
          >{{ item.FILE_NAME_ZH_CN || item.FILENAME }}</el-checkbox>
          <el-tooltip
            effect="dark"
            :content="item.FILE_NAME_ZH_CN || item.FILENAME"
            placement="right"
            v-else
          >
            <div class="ellipsis">{{ item.FILE_NAME_ZH_CN || item.FILENAME }}</div>
          </el-tooltip>
        </li>
        <li v-show="ismerge">
          <el-button type="primary" size="small" @click="mergeOriginalText">确定</el-button>
          <el-button type="primary" size="small" @click="ismerge = false">取消</el-button>
        </li>
      </ul>
    </el-col>
    <el-col :span="19" class="content-right">
      <el-col :span="24" class="content-title">
        <p class="shu-7">说明：本系统只展示pdf、常用视频音频格式文件，其他格式文件，请下载到本地浏览</p>
      </el-col>
      <no-auth v-if="isAuthReadFile"></no-auth>
      <el-col :span="24" v-else>
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
              <el-button
                plain
                @click="addWatermark"
                size="small"
                v-if="!isSearch && !watermarkTxt"
              >加水印</el-button>
              <el-button
                plain
                @click="deleteWatermark"
                size="small"
                v-if="!isSearch && watermarkTxt"
              >清除水印</el-button>
              <el-button plain @click="addGdang" size="small" v-if="!isSearch">加归档章</el-button>
            </div>
          </div>
        </el-col>
        <el-col :span="24" style="background-color:#fff;padding:15px;">
          <div class="no" v-if="gridData.length == 0">
            <img src="../../assets/img/text.png" alt="无原文" />
            <p class="cp">您还没上传任何原文</p>
            <p class="last">需要添加原文后才能执行相关操作</p>
            <div class="textCenter" v-if="!isSearch">
              <el-button
                size="small"
                @click="addData"
                type="primary"
                :disabled="
                  $is_disabled(['searchContent-upload']) ? false : true
                "
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
        :tableCode="tableCode"
        :fondsList="fondsList"
        :archivesData="archivesData"
        :classnodeId="classnodeId"
      >
        <template slot="update" v-if="!isSearch">
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

    <!-- 添加一条数据 -->
    <el-dialog title="原文上传" :visible.sync="dialogFormVisible" ref="dialog" width="935px">
      <add-yuanwen
        @cancel="cancel"
        :tableCode="tableCode"
        :recordCode="recordCode"
        @getList="getData"
      ></add-yuanwen>
    </el-dialog>
    <!-- 添加归档章 -->
    <el-dialog
      title="添加归档章"
      :visible.sync="dialogFormVisible2"
      ref="dialog"
      width="850px"
      custom-class="addGdangBox"
    >
      <div class="title">
        <span>编辑归档章</span>
        <div class="flex-spaceBetween">
          <div>
            <label for>选择列数:</label>
            <el-select v-model="colNum" @change="selectColnum">
              <el-option label="2" value="2"></el-option>
              <el-option label="3" value="3"></el-option>
              <el-option label="4" value="4"></el-option>
            </el-select>
          </div>
          <div style="margin:0 15px">
            <label for>选择位置:</label>
            <el-select v-model="textAlgin">
              <el-option label="左" value="L"></el-option>
              <el-option label="中" value="C"></el-option>
              <el-option label="右" value="R"></el-option>
            </el-select>
          </div>
          <div>
            <el-checkbox v-model="isshowAll">是否每页显示</el-checkbox>
          </div>
        </div>
      </div>
      <table>
        <tbody cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td v-for="index in Number(colNum)" :key="index">
              <el-select v-model="selectObj['selectVal' + index]" filterable>
                <el-option
                  :value="item.columnname"
                  v-for="item in selectArray"
                  :label="item.chinesename"
                  :key="item.columnname"
                ></el-option>
              </el-select>
            </td>
          </tr>
          <tr>
            <td v-for="index in Number(colNum)" :key="index">
              <el-select v-model="selectObj['selectVal' + (Number(colNum) + index)]" filterable>
                <el-option
                  :value="item.columnname"
                  v-for="item in selectArray"
                  :label="item.chinesename"
                  :key="item.columnname"
                ></el-option>
              </el-select>
            </td>
          </tr>
        </tbody>
      </table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible2 = false">取 消</el-button>
        <el-button type="primary" @click="submitGdang">确 定</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import addYuanwen from "./addYuwen";
import Formbox from "@/components/Formbox";
import noAuth from "./NoAuthority";
import { downloadFile } from "@/common/js/util.js";
import {
  getOriginaFileSByRecordCode,
  getOriginaFilesArchives,
  upOriginaFilesArchives,
  upOriginaFilesByFileCode,
  getPDFUrlByParameter,
  upWatermarkTxt,
  getWatermarkTxt,
  download,
  upTopByFileCode,
  originalSynthesis
} from "@/api/originalText";
import { retrieveSystemNoItemByEntityCode } from "@/api/archiveNoformat";

import { getInputCard, getArchives } from "@/api/tableView";
import { getArchivesSeal, addArchivesSeal } from "@/api/file";

export default {
  inject: ["reload"],
  name: "searchContent",
  components: {
    addYuanwen,
    Formbox,
    noAuth
  },
  data() {
    return {
      isGdang: false, //是否归档
      isshowAll: false,
      textAlgin: "R",
      ismerge: false,
      isSearch: true,
      isAuthReadFile: false, //是否有查看原文的权限
      pdfHtmlURL: this.pdfHtmlURL,
      baseUrl: this.baseURL,
      current: 1,
      colNum: 3, //归档章的列数
      selectObj: {},
      showPdf: false,
      columnList: [], //表头数据,
      gridData: [],
      dialogFormVisible: false, //新增数据变量
      dialogFormVisible1: false, //修改数据变量
      dialogFormVisible2: false, // 添加归档章变量,
      fileCode: "", //文件号
      recordCode: "", //档案条目号
      tableCode: "",
      archivesData: {},
      tableCardList: [], //实体表录入视图列,
      dataInfo: {},
      pdfPath: "", //pdf显示地址
      videoPath: "", //视频d地址
      audioPath: "", //音频地址

      showContent: true, //是否显示单个原文 点击回收站变化
      selectArray: [], //选择归档章列表
      videoType: ["webm", "mp4", "ogg"],
      audioType: ["mp3", "wav", "ogg"],
      classnodeId: "", //底层门类id
      noPermission: false, //是否有权限查看原文内容
      mainTitle: "",
      watermarkTxt: "" //水印内容 展示按钮
    };
  },
  methods: {
    changeCheked(item) {},
    mergeFunc() {
      this.$alert("勾选原文，按确定合成", "提示")
        .then(() => {
          this.ismerge = true;
        })
        .catch(() => {});
    },
    mergeOriginalText() {
      let filecodeArr = [];
      this.gridData.forEach(item => {
        if (item.checked) {
          filecodeArr.push(item.FILECODE);
        }
      });
      if (!filecodeArr.length) {
        this.$message.warning("请选择需要合成的原文");
        return;
      }
      let params = {
        fileCodes: filecodeArr.join(),
        tableCode: this.tableCode,
        recordCode: this.recordCode
      };
      this.$confirm(
        "是否隐藏被合并的原文，隐藏后，隐藏的原文仅档案员可见！",
        "提示",
        {
          distinguishCancelAndClose: true,
          confirmButtonText: "合并不隐藏",
          cancelButtonText: "合并并且隐藏",
          type: "warning"
        }
      )
        .then(() => {
          params.ifHide = false;
          this.submitMerge(params);
        })
        .catch(action => {
          if (action == "cancel") {
            //合并并且隐藏
            params.ifHide = true;
            this.submitMerge(params);
          } else {
            //关闭弹框
            this.ismerge = false;
          }
        });
    },
    submitMerge(params) {
      originalSynthesis(params)
        .then(res => {
          if (res.code === 403) {
            this.$message.warning("暂无权限合并原文");
            return;
          }
          if (res.success) {
            this.$message.success("合并成功");
          } else {
            this.$message.error(res.msg);
          }
          this.getData();
          this.ismerge = false;
        })
        .catch(() => {
          this.getData();
          this.ismerge = false;
        });
    },
    putTop() {
      //置顶
      this.$confirm("是否将此原文置顶", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let params = {
            fileCode: this.dataInfo.FILECODE,
            recordCode: this.recordCode,
            tableCode: this.tableCode
          };
          upTopByFileCode(params).then(res => {
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
    putJy() {
      this.$router.push({
        path: "applyRead",
        query: {
          tableCode: this.tableCode,
          recordCodeList: this.recordCode
        }
      });
    },
    selectColnum(value) {
      this.selectObj = {};
    },
    addGdang() {
      //添加归档章
      if (!this.isGdang) {
        this.$alert("当前档案未归档", "提示", {
          type: "warning"
        });
        return;
      }
      this.dialogFormVisible2 = true;

      if (JSON.stringify(this.selectObj) == "{}") {
        getArchivesSeal({ tableCode: this.tableCode }).then(res => {
          if (res.data) {
            let arr = res.data.columnContent.split(",");
            this.colNum = arr.length / 2;
            arr.forEach((item, index) => {
              this.$set(this.selectObj, "selectVal" + (index + 1), item);
            });
            this.isshowAll = res.data.everyPage == "T" ? true : false;
            this.textAlgin = res.data.location || "R";
          }
        });
      }
      if (this.selectArray.length == 0) {
        retrieveSystemNoItemByEntityCode({
          entityCode: this.classnodeId
        }).then(res => {
          if (res.success) {
            if (res.data) {
              let list = res.data || [];
              this.selectArray = list;
            }
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    },
    submitGdang() {
      //提交归档字段信息
      let data = [];

      for (let i in this.selectObj) {
        data.push(this.selectObj[i]);
      }
      if (new Set(data).size !== data.length) {
        this.$message.warning("请勿选择重复字段");
        return;
      }
      if (data.length != Number(this.colNum) * 2) {
        this.$message.warning("请选择字段");
        return;
      }
      if (!this.textAlgin) {
        this.$message.warning("请选择显示位置");
        return;
      }
      addArchivesSeal({
        tableCode: this.tableCode,
        columnContent: data.join(),
        entityTableCode: this.tableCode,
        everyPage: this.isshowAll ? "T" : "F",
        location: this.textAlgin || "R"
      })
        .then(res => {
          if (data.code === 403) {
            this.$message.warning("暂无权限添加归档章");
            return;
          }
          if (res.success) {
            this.$message.success("添加成功");
            this.reload();
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(err => {});
    },
    download() {
      //下载
      const reader = new FileReader();
      download({
        fileCode: this.dataInfo.FILECODE,
        entityTableCode: this.tableCode
      }).then(res => {
        if (
          res.data.type == "application/json" ||
          res.data.type == "application/json;charset=UTF-8" //表示返回的不是文件流
        ) {
          reader.onload = e => {
            //文件读取完成后触发
            const data = JSON.parse(e.target.result);

            if (data.code === 403) {
              this.$message.warning("暂无权限下载原文");
              return;
            } else {
              this.$message.error("下载失败");
            }
          };
          reader.readAsText(res.data);
        } else {
          let filename = this.dataInfo.FILENAME;
          downloadFile(filename, res.data);
        }
      });
    },
    addWatermark() {
      //添加水印  首先获取之前设置的水印文字给初始值
      this.$prompt("请输入水印内容", "添加水印", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[\s\S]*.*[^\s][\s\S]*$/,
        inputErrorMessage: "请输入水印内容",
        inputValue: this.watermarkTxt
      })
        .then(({ value }) => {
          let params = {
            watermarkTxt: value,
            entityTableCode: this.tableCode
          };
          upWatermarkTxt(params).then(data => {
            if (data.code === 403) {
              this.$message.warning("暂无权限添加水印");
              return;
            }
            if (data.success) {
              this.reload();
            } else {
              this.videoPath = "";
              this.audioPath = "";
              this.pdfPath = "";

              this.$message.error(res.msg);
            }
          });
        })
        .catch(() => {
          this.$message.info("取消输入");
        });
      // let inputValue = "";
      // getWatermarkTxt().then(data => {
      //   if (data.success) {
      //     if (data.data) {
      //       inputValue = data.data;
      //     } else {
      //       inputValue = "";
      //     }

      //   }
      // });
    },
    deleteWatermark() {
      let params = {
        watermarkTxt: "",
        entityTableCode: this.tableCode
      };
      this.$alert("是否清除水印", "提示", {
        type: "warning"
      })
        .then(res => {
          upWatermarkTxt(params).then(data => {
            if (data.code === 403) {
              this.$message.warning("暂无权限清除水印");
              return;
            }
            if (data.success) {
              this.reload();
            } else {
              this.videoPath = "";
              this.audioPath = "";
              this.pdfPath = "";
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    },
    updateformData(data, bol) {
      let params = {
        fileCode: this.fileCode,
        params: JSON.stringify(data),
        entityTableCode: this.tableCode
      };
      if (params.params == "{}") {
        this.dialogFormVisible1 = false;
        return false;
      }
      upOriginaFilesByFileCode(params).then(data => {
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
        type: 0, //0加载全部数据 1是回收站
        pageNum: 1,
        pageSize: 9999,
        entityTableCode: this.tableCode
      };
      getOriginaFileSByRecordCode(params)
        .then(data => {
          if (data.code !== 403) {
            this.total = data.data.originaFilePageInfo.total || 0;
            this.gridData = data.data.originaFilePageInfo.list || [];
            if (flag) {
              //如果是true 加载第一个 否则就是点击不是第一个原文修改
              this.pdfPath = "";
              if (data.data.originaFilePageInfo.list.length > 0) {
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

            this.fileCode = this.dataInfo.FILECODE;
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
        fileCode: this.fileCode,
        entityTableCode: this.tableCode
      };
      getOriginaFilesArchives(params).then(data => {
        if (data.code == 403) {
          this.$message.warning("暂无权限访问该原文");
          this.isAuthReadFile = true;
          return;
        }
        if (data.success) {
          this.isAuthReadFile = false;
          this.archivesData = data.data;
          this.getPDFUrl();
        }
      });
    },
    getPDFUrl() {
      let params = {
        fileCode: this.fileCode,
        tableCode: this.tableCode,
        entityTableCode: this.tableCode,
        recordCode: this.recordCode
      };
      getPDFUrlByParameter(params).then(res => {
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
    // handleDelete(row) {
    //   //列表内删除
    //   //删除
    //   this.delAndDraw(row);
    // },

    delAndDraw(row, status) {
      this.$confirm("是否将此文件删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          let arr = [];
          let params = {
            tableCode: this.tableCode,
            trashStatus: 0
          };
          if (row != "") {
            params.fileCode = row.FILECODE;
          } else {
            params.fileCode = this.dataInfo.FILECODE;
          }
          upOriginaFilesArchives(params).then(data => {
            if (data.code == 403) {
              this.$message.warning("暂无权限删除");
              return;
            }
            if (data.success) {
              this.$message.success("删除成功");
              if (this.gridData.length == 0) {
                this.dataInfo = {};
              }
            } else {
              this.$message.error(data.msg);
            }
            this.getData();
          });
        })
        .catch(() => {
          this.$message.info("已取消");
        });
    }
  },
  created() {
    this.recordCode = this.$route.query.recordCode;
    this.tableCode = this.$route.query.tableCode;
    this.classnodeId = this.$route.query.classnodeId;
    this.mainTitle = this.$route.query.mainTitle;
    this.isSearch =
      String(this.$route.query.isSearch) == "false" ? false : true;
    this.$store.dispatch("tree/departmentTree"); //获取部门树
    this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗数组
    getInputCard({ tableCode: "187530" }).then(data => {
      this.tableCardList = data.data;
    });

    this.getData();
  },
  mounted() {
    let params = {
      tableCode: this.tableCode,
      recordCode: this.recordCode
    };
    getWatermarkTxt().then(res => {
      if (res.success) {
        this.watermarkTxt = res.data.trim() || "";
      } else {
        this.$message.error("获取水印文字失败");
        this.watermarkTxt = "";
      }
    });
    getArchives(params).then(data => {
      if (data.code == 403) {
        this.$message.warning("暂无权限查看当前条目信息");
      } else {
        if (data.success) {
          this.isGdang = data.data["archiveFlag-1"] === "已归档" ? true : false;
        } else {
          this.$message.error(data.msg);
        }
      }
    });
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

  .btnwrapper1 {
    padding: 10px 0;
    border-bottom: 1px solid #ccc;
    .btn1 {
      margin-left: 15px;
    }
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
