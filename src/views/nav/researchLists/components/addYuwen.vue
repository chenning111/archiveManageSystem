<template>
  <el-form class="formbox">
    <!-- <el-form-item label="原文上传" class="nopadding" label-width="110px" style="width:100%;"> -->
    <el-upload
      class="upload-demo"
      ref="upload"
      drag
      :action="`${baseUrl}/editor/uploadEditorOriginal/`"
      :auto-upload="false"
      :with-credentials="true"
      :data="params"
      :file-list="fileList"
      :on-change="uploadChange"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :limit="3"
      :on-exceed="handleExceed"
      multiple
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">
        将文件拖到此处，或
        <em>点击上传</em>
        <p>最多可选3个文件上传</p>
      </div>
    </el-upload>
    <el-form-item style="margin-top:10px;">
      <el-button @click="cancel">取消</el-button>
      <el-button type="primary" @click="submitForm('ruleForm')">上传</el-button>
    </el-form-item>
  </el-form>
</template>
<script>
import axios from "axios";
export default {
  name: "addYuanwen", //添加原文数据
  props: {
    recordCode: String,
    tableCode: String
  },
  data() {
    return {
      fileList: [],
      baseUrl: this.baseURL,
      params: {
        recordCode: this.recordCode,
        tableCode: this.tableCode
      },
      successArr: [],
      firstError: true
    };
  },
  methods: {
    handleRemove(file, fileList) {
      this.fileList = fileList;
    },
    uploadChange(file, fileList) {
      this.fileList = fileList;
    },
    handleExceed(files, fileList) {
      this.$message.warning("最多可选择3个文件");
    },
    handleSuccess(res, file, fileList) {
      this.successArr.push({
        code: res.code,
        success: res.success,
        file: file
      });
      if (res.code === 403) {
        if (this.firstError) {
          this.$message.warning("暂无权限上传原文");
          this.firstError = false;
        }
      }
      if (res.success && res.code == 0) {
        this.$message.success("上传成功");
      } else if (!res.success) {
        this.$message.error(file.name + res.msg);
      }
      if (this.successArr.length == this.fileList.length) {
        this.$refs.upload.clearFiles();
        this.successArr = [];
        this.$emit("cancel", false);
      }

      this.$emit("getList");
    },

    handleError(err, file) {
      this.$message.error(err);
      this.$refs.upload.clearFiles();
    },
    cancel() {
      this.$emit("cancel", false);
    },
    submitForm() {
      if (this.fileList.length == 0) {
        this.$message.warning("请添加需要上传的文件");
        return;
      }
      this.$refs.upload.submit();
    }
  },
  created() {
    this.successArr = [];
  }
};
</script>
<style lang="scss" scoped>
.formbox {
  .btnwrapper1 {
    padding: 10px 15px;
    border-bottom: 1px solid #ccc;
    .lineHeight {
      margin-top: 12px;
      .require {
        color: #ff0036;
        margin-right: 3px;
      }
    }
  }
  table {
    padding: 10px;
    width: 100%;
    tbody {
      width: 100%;
      td {
        width: 33%;
        vertical-align: top;
      }
    }
  }

  .el-form-item {
    margin: 0 0 5px 0;
    text-align: center;
  }
}
</style>
<style lang="scss">
.upload-demo {
  // position: relative;
  // left: -38px;
  text-align: center;
}
.el-upload-list__item {
  font-size: 16px;
}
</style>




