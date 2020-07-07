<template>
  <section>
    <el-col :span="24" class="content-title">
      <div class="pull-left" style="margin-right:20px;">
        <img src="../../assets/img/apply.png" alt style="width:70px;height:70px" />
      </div>
      <div class="pull-left">
        <p class="p1">申请借阅</p>
        <p class="p2">请点击借阅方式，简要填写利用目的，点击保存，稍后等待系统消息通知，系统会将通知发送到“个人消息”中。</p>
      </div>
    </el-col>
    <el-col :span="24" class="content-header">
      <h3 style="border:none">借阅条目信息</h3>
    </el-col>
    <el-col :span="24" style="background-color:#fff;padding:20px 15px;">
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>借阅单列表
          </div>
        </div>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            v-loading="loading"
            tooltip-effect="dark"
          >
            <el-table-column label="序号" width="55" align="center">
              <template slot-scope="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column
              label="档案类型"
              align="center"
              :show-overflow-tooltip="true"
              prop="archiveType"
            ></el-table-column>
            <el-table-column
              label="档号"
              align="center"
              :show-overflow-tooltip="true"
              prop="archiveNo"
              min-width="200"
            ></el-table-column>
            <el-table-column
              label="题名"
              align="center"
              :show-overflow-tooltip="true"
              prop="mainTitle"
              min-width="200"
            ></el-table-column>
            <el-table-column
              label="保管期限"
              align="center"
              :show-overflow-tooltip="true"
              prop="retention"
            ></el-table-column>
            <el-table-column
              label="密级"
              align="center"
              :show-overflow-tooltip="true"
              prop="securityClass"
            ></el-table-column>
            <el-table-column
              min-width="160"
              label="所属部门"
              align="center"
              :show-overflow-tooltip="true"
              prop="departmentName"
            ></el-table-column>

            <el-table-column property="set" label="操作" align="center" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="handleDelete(scope.$index, scope.row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>借阅申请单
          </div>
        </div>
        <div style="padding:0 15px">
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="140px"
            class="applyForm"
          >
            <el-form-item label="借阅方式" prop="applyType">
              <el-radio-group v-model="ruleForm.applyType">
                <el-radio label="1">在线借阅</el-radio>
                <el-radio label="2">实体借出</el-radio>
                <el-radio label="3">下载打印</el-radio>
                <el-radio label="4">实体查阅</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="申请人" prop="name">
              <el-input v-model="ruleForm.name" placeholder="申请人" disabled></el-input>
            </el-form-item>
            <el-form-item label="申请人电话" prop="phone">
              <el-input v-model.number="ruleForm.phone" placeholder="申请人电话"></el-input>
            </el-form-item>
            <el-form-item label="申请日期" prop="applyDate">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="ruleForm.applyDate"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="借阅时间" required>
              <el-col :span="11">
                <el-form-item prop="startDate">
                  <el-date-picker
                    type="date"
                    placeholder="开始日期"
                    v-model="ruleForm.startDate"
                    value-format="yyyy-MM-dd"
                    style="width: 100%;"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col class="line" :span="2">-</el-col>
              <el-col :span="11">
                <el-form-item prop="endDate">
                  <el-date-picker
                    type="date"
                    placeholder="结束日期"
                    v-model="ruleForm.endDate"
                    value-format="yyyy-MM-dd"
                    style="width: 100%;"
                  ></el-date-picker>
                </el-form-item>
              </el-col>
            </el-form-item>
            <el-form-item label="利用目的" prop="remark">
              <el-autocomplete
                style="width:100%"
                v-model="ruleForm.remark"
                :fetch-suggestions="querySearch"
                placeholder="请输入利用目的"
              ></el-autocomplete>
            </el-form-item>
            <el-form-item style="margin-top:50px;">
              <el-button type="primary" @click="submitForm('ruleForm')">提交</el-button>
              <el-button @click="resetForm('ruleForm')">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-col>
  </section>
</template>
<script>
import { applyLend } from "@/api/borrow";
import { retrieveDestroyJudgeArchive } from "@/api/judge";
import { getNowFromDay } from "@/common/js/date";
export default {
  name: "ApplyRead",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value) {
        if (this.ruleForm.startDate >= value) {
          callback(new Error("请选择正确的借阅结束时间"));
        } else {
          callback();
        }
      } else {
        callback(new Error("请选择结束日期"));
      }
    };
    return {
      gridData: [],
      loading: false,
      ruleForm: {
        applyType: "1",
        name: "",
        phone: "",
        applyDate: new Date().format("yyyy-MM-dd"),
        startDate: new Date().format("yyyy-MM-dd"),
        endDate: "",
        remark: ""
      },
      recordCodeList: "", //档案编号
      tableCode: "",
      rules: {
        applyType: [
          { required: true, message: "请选择借阅方式", trigger: "blur" }
        ],
        name: [{ required: true, message: "请输入申请人", trigger: "blur" }],
        phone: [
          { required: true, message: "请输入申请人电话", trigger: "blur" },
          { type: "number", message: "电话必须为数字" }
        ],
        applyDate: [
          {
            required: true,
            message: "请选择申请日期",
            trigger: "change"
          }
        ],
        startDate: [
          {
            required: true,
            message: "请选择开始日期",
            trigger: "change"
          }
        ],
        endDate: [
          { validator: validatePass, trigger: "change", required: true }
        ],
        remark: [
          { required: true, message: "请输入利用目的", trigger: "change" }
        ]
      }
    };
  },
  methods: {
    querySearch(queryString, cb) {
      let arr = [{ value: "业务查询" }, { value: "工作汇报" }];
      // 调用 callback 返回建议列表的数据
      cb(arr);
    },
    handleDelete(index, row) {
      this.gridData.splice(index, 1);
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.gridData.length == 0) {
            this.$message.warning("请选择资料进行借阅");
            return;
          }
          let params = {
            lendflag: this.ruleForm.applyType,
            tablecode: this.tableCode,
            telephone: this.ruleForm.phone,
            begindate: this.ruleForm.startDate,
            enddate: this.ruleForm.endDate,
            registerdate: this.ruleForm.applyDate,
            anticipativeeffect: "", //预期收益 不明确作用 传空
            usepurpose: this.ruleForm.remark
          };
          let recordCodes = [];

          let securityClass = ["绝密", "机密", "秘密"];
          this.gridData.forEach(item => {
            recordCodes.push(item.recordCode);
          });
          let classified = this.gridData.find(t =>
            securityClass.includes(t.securityClass)
          );
          if (classified && params.lendflag != "4") {
            this.$message.warning("涉密档案请选择实体查阅");
            return;
          }
          params.recordCodes = recordCodes.join();
          applyLend(params).then(res => {
            if (res.success) {
              this.$notify({
                title: "成功",
                message: "申请成功，信息已发出，注意查收审批结果。",
                type: "success"
              });
              this.$router.go(-1);
            } else {
              this.$message.error({
                duration: 3000,
                type: "error",
                message: res.msg
              });
            }
          });
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    initData() {
      this.loading = true;
      let params = {
        tableCode: this.tableCode,
        recordCodes: this.recordCodeList
      };
      retrieveDestroyJudgeArchive(params).then(res => {
        //加载列表
        this.loading = false;
        if (res.success) {
          this.gridData = res.data;
        } else {
          this.gridData = [];
          this.$message.error(res.msg);
        }
      });
    }
  },
  mounted() {
    this.recordCodeList = this.$route.query.recordCodeList;
    this.tableCode = this.$route.query.tableCode;
    this.ruleForm.name = this.userInfo.userName;
    this.ruleForm.phone = this.userInfo.officePhone
      ? Number(this.userInfo.officePhone)
      : "";
    this.ruleForm.endDate = getNowFromDay(7);
    this.initData();
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    }
  }
};
</script>
<style scoped lang="scss">
section {
  .content-header {
    background-color: #fff;
    h3 {
      line-height: 50px;
      padding-left: 15px;
      font-weight: 700;
      margin: 0;
      border-bottom: 1px solid #ddd;
      font-size: 16px;
      color: #666;
    }
  }
  .content-title {
    padding: 20px;
    background-color: #fff;
    margin-bottom: 20px;
    box-sizing: border-box;
    p {
      margin: 0;
      line-height: 25px;
      margin-top: 7px;
    }
    .p1 {
      color: #666;
      font-weight: 700;
      font-size: 16px;
    }
    .p2 {
      color: #999;
    }
  }
  .applyForm {
    width: 600px;
    padding-top: 20px;
    padding-bottom: 50px;
    .line {
      text-align: center;
    }
  }
}
</style>
