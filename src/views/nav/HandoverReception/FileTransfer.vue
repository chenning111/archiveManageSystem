<template>
  <section>
    <div class="content-right-title">
      <span>接收的移交</span>
    </div>
    <div class="content-right-form">
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>移交信息
          </div>
        </div>
        <div style="padding:0 15px" v-loading="loading">
          <table class="cntable">
            <tbody>
              <tr>
                <td colspan="2">
                  <div class="tableItem">
                    <label>日期</label>
                    <span>
                      <el-date-picker
                        v-model="form.transferDate"
                        type="date"
                        value-format="yyyy-MM-dd"
                        placeholder="选择日期"
                      ></el-date-picker>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <div class="tableItem">
                    <label>概述</label>
                    <span>
                      <el-input type="text" v-model="form.description"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td colspan="2">
                  <div class="tableItem">
                    <label>标题</label>
                    <span>
                      <el-input type="text" v-model="form.title"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>移交单位</label>
                    <span>
                      <el-cascader
                        :options="departmentList"
                        v-model="departmentCodeArr"
                        @change="selectDepartment"
                        :props="{label:'textId',value:'id',checkStrictly:true,expandTrigger:'hover'}"
                        :show-all-levels="false"
                        filterable
                        clearable
                        ref="cascader7"
                      >
                        <template slot-scope="{ node, data }">
                          <div
                            @click="selectCheked('cascader7',$event)"
                          >{{ data.id }} -- {{ data.text }}</div>
                        </template>
                      </el-cascader>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>移交人</label>
                    <span>
                      <el-input type="text" v-model="form.transferUser"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>接收单位</label>
                    <span>
                      <el-input type="text" v-model="form.receiveDepartment"></el-input>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>接收人</label>
                    <span>
                      <el-input type="text" v-model="form.receiveUser"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>总件数</label>
                    <span>
                      <el-input type="text" v-model.number="form.totalNumber"></el-input>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>总页数</label>
                    <span>
                      <el-input type="text" v-model.number="form.totalPages"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>其中电子件</label>
                    <span>
                      <el-input type="text" v-model.number="form.electronicNumber"></el-input>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>纸质件</label>
                    <span>
                      <el-input type="text" v-model.number="form.paperNumber"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>移交核对单
          </div>
        </div>
        <div style="padding:0 15px">
          <el-upload
            style="width:50%"
            ref="upload"
            action="/"
            :auto-upload="false"
            :file-list="checkList"
            accept=".jpg, .png"
            :limit="1"
            :on-change="uploadChange1"
            :on-remove="handleRemove1"
          >
            <el-button slot="trigger" size="small" type="primary" icon="el-icon-upload">选取文件</el-button>
            <div
              slot="tip"
              class="el-upload__tip"
              style="display:inline-block;margin-left:15px;margin-top:0"
            >只能上传jpg、png格式文件</div>
          </el-upload>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>移交文件列表
          </div>
        </div>
        <div style="padding:0 15px">
          <el-upload
            style="width:50%"
            ref="upload"
            action="/"
            :auto-upload="false"
            :file-list="transferList"
            accept=".xls, .xlsx"
            :limit="1"
            :on-change="uploadChange2"
            :on-remove="handleRemove2"
          >
            <el-button slot="trigger" size="small" type="primary" icon="el-icon-upload">导入</el-button>
            <div
              slot="tip"
              class="el-upload__tip"
              style="display:inline-block;margin-left:15px;margin-top:0"
            >只能导入xls、xlsx格式的文件，且只能导入一个</div>
          </el-upload>
        </div>
      </div>
      <div class="textCenter" style="margin-top:50px;">
        <el-button type="primary" @click="submitForm">移交</el-button>
        <el-button type="primary" plain @click="reset">重置</el-button>
      </div>
    </div>
  </section>
</template>
<script>
import { upLoadRequest } from "@/api/api";
import { commitTransfer } from "@/api/fileTransfer";
export default {
  inject: ["reload"],
  name: "fileTransfer",
  data() {
    return {
      textarea: "",
      value1: new Date().format("yyyy-MM-dd"),
      transferList: [],
      checkList: [],
      departmentCodeArr: [],
      departmentCode: "",
      loading: false,
      form: {
        transferDate: new Date().format("yyyy-MM-dd"),
        description: "",
        title: "",
        transferUser: "",
        receiveDepartment: "",
        receiveUser: "",
        totalNumber: 0,
        totalPages: 0,
        electronicNumber: 0,
        paperNumber: 0
      }
    };
  },
  methods: {
    reset() {
      this.form = {
        transferDate: new Date().format("yyyy-MM-dd"),
        description: "",
        title: "",
        transferUser: "",
        receiveDepartment: "",
        receiveUser: "",
        totalNumber: 0,
        totalPages: 0,
        electronicNumber: 0,
        paperNumber: 0
      };
      this.checkList = [];
      this.transferList = [];
      this.departmentCodeArr = [];
      this.departmentCode = "";
    },
    handleRemove1(file, fileList) {
      this.checkList = fileList;
    },
    uploadChange1(file, fileList) {
      var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
      const extension = testmsg === "jpg";
      const extension2 = testmsg === "png";
      if (!extension && !extension2) {
        this.$message.warning("上传文件只能是 jpg、png格式!");
        this.checkList = [];
        return false;
      }
      this.checkList = fileList;
    },
    handleRemove2(file, fileList) {
      this.transferList = fileList;
    },
    uploadChange2(file, fileList) {
      var testmsg = file.name.substring(file.name.lastIndexOf(".") + 1);
      const extension = testmsg === "xls";
      const extension2 = testmsg === "xlsx";
      if (!extension && !extension2) {
        this.$message.warning("上传文件只能是 xls、xlsx格式!");
        this.transferList = [];
        return false;
      }
      this.transferList = fileList;
    },
    submitForm() {
      let param = new FormData();
      if (this.checkList.length == 0) {
        this.$message.warning("请上传确认单");
        return;
      }
      if (this.transferList.length == 0) {
        this.$message.warning("请上传文件列表");
        return;
      }
      if (!this.form.transferDate) {
        this.form.transferDate = new Date().format("yyyy-MM-dd");
      }
      for (let i in this.form) {
        param.append(i, this.form[i]);
      }
      if (this.departmentCode) {
        param.append(
          "transferDepartment",
          this.$refs["cascader7"].getCheckedNodes()[0].data.text
        );
      }
      param.append("confirmationFile", this.checkList[0].raw); //移交确认单
      param.append("documentsFile", this.transferList[0].raw); //文件列表
      this.loading = true;
      upLoadRequest("/transfer/commitTransfer", param).then(res => {
        this.loading = false;
        if (res.data.success) {
          this.$confirm("操作成功，是否进入移交清册", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "success"
          })
            .then(() => {
              this.$router.push("/fileTransferList");
            })
            .catch(() => {
              this.reload();
            });
        } else {
          this.$message.error(res.data.msg);
        }
      });
    },
    selectDepartment(value) {
      //选择所属部门
      let code = "";
      if (value) {
        if (value.length > 1) {
          code = value[value.length - 1];
        } else {
          code = value[0] || "";
        }
      }

      this.departmentCode = code;
    },
    selectCheked(name, event) {
      //点击文字直接绑定
      event.target.parentElement.parentElement.firstChild.click();
      if (this.$refs[name].toggleDropDownVisible) {
        this.$refs[name].toggleDropDownVisible(false);
      } else {
        this.$refs[name][0].toggleDropDownVisible(false);
      }
    }
  },
  components: {},
  computed: {
    departmentList() {
      return this.$store.getters.departmentTree;
    }
  }
};
</script>
<style lang="scss" scoped>
section {
  background-color: #fff;
}
.content-right-title {
  height: 60px;
  border-bottom: 1px solid #eee;
  padding: 0 20px;
  display: flex;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  align-items: center;
  justify-content: space-between;
  span {
    font-weight: 700;
    color: #666;
    font-size: 15px;
  }
}
.content-right-form {
  padding: 15px 15px 30px 15px;
  .textCenter button {
    margin: 0 15px;
  }
}
</style>