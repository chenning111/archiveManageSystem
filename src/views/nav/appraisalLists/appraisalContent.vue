<template>
<!-- 鉴定 -->
  <section>
    <el-col :span="24" class="content-title">
      <div class="pull-left" style="margin-right:20px;">
        <img src="../../../assets/img/apply.png" alt style="width:70px;height:70px" />
      </div>
      <div class="pull-left">
        <p class="p1">鉴定</p>
        <p class="p2">每份鉴定书针对同一保管期限到期资料，系统会将鉴定单发送到 “到期鉴定，审核记录” 中。</p>
      </div>
    </el-col>
    <el-col :span="24" class="content-header">
      <h3 style="border:none">鉴定意见单</h3>
    </el-col>
    <el-col :span="24" style="background-color:#fff;padding:20px 15px;">
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>鉴定申请列表
          </div>
        </div>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            header-row-class-name='thClassName'
            v-loading="loading"
            tooltip-effect="dark"
          >
            <el-table-column label="序号" width="55" align="center">
              <template slot-scope="scope">{{scope.$index+1}}</template>
            </el-table-column>
            <el-table-column label="档案类型" align="center" :show-overflow-tooltip="true" prop="archiveType"></el-table-column>
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
              label="所属部门"
              align="center"
              :show-overflow-tooltip="true"
              prop="departmentName"
            ></el-table-column>
            <el-table-column label="利用" align="center">
                <el-table-column label="利用次数" align="center">
                  <el-table-column label="近两年" prop="twoYearsOldUseTimes" align="center"></el-table-column>
                  <el-table-column label="近五年" prop="fiveYearsOldUseTimes" align="center"></el-table-column>
                  <el-table-column label="全部" prop="useTimes" align="center"></el-table-column>
                </el-table-column>
                <el-table-column label="利用人次" align="center">
                  <el-table-column label="近两年" prop="twoYearsOldUserSize" align="center"></el-table-column>
                  <el-table-column label="近五年" prop="fiveYearsOldUserSize" align="center"></el-table-column>
                  <el-table-column label="全部" prop="userSize" align="center"></el-table-column>
                </el-table-column>
            </el-table-column>
            <el-table-column property="set" label="操作" align="center" width="200" fixed="right">
              <template slot-scope="scope">
                <el-button size="mini" type="text" @click="handleDelete(scope.$index,scope.row)">取消</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>鉴定意见单
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
            <el-form-item label="鉴定原因" prop="applyType">
              <el-radio-group v-model="ruleForm.applyType">
                <el-radio label="1">到期鉴定</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="鉴定人" prop="name">
              <el-input v-model="ruleForm.name" placeholder="鉴定人"></el-input>
            </el-form-item>
            <el-form-item label="鉴定日期" prop="applyDate">
              <el-date-picker
                type="date"
                placeholder="选择日期"
                v-model="ruleForm.applyDate"
                value-format="yyyy-MM-dd"
                style="width: 100%;"
              ></el-date-picker>
            </el-form-item>
            
            <el-form-item label="鉴定意见" prop="retention">
              <el-select v-model="ruleForm.retention">
                  <el-option :value="item.NAME" :label="item.NAME" :key="item.Name" v-for="item in retentionArr"></el-option>
              </el-select>
              <span class="border">修改保管期限</span>
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
import {retrieveDestroyJudgeArchive,retrieveStorageTime,insertDestroyJudge} from '@/api/judge'
export default {
  name: "appraisalContent",
  data() {
    return {
      gridData: [],
      loading: false,
      ruleForm: {
        applyType: "1",
        name: "",
        applyDate: new Date().format('yyyy-MM-dd'),
        retention: ""
      },
      rules: {
        applyType: [
          { required: true, message: "请选择鉴定原因", trigger: "change" }
        ],
        name: [{ required: true, message: "请输入鉴定人", trigger: "blur" }],
        applyDate: [
          {
            required: true,
            message: "请选择鉴定日期",
            trigger: "change"
          }
        ],
        
        retention: [{ required: true, message: "请选择要修改的保管期限", trigger: "change" }]
      },
      recordCodeList:'',//档案编号
      tableCode:"",
      retentionArr:[]//保管期限
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if(this.gridData.length == 0){
            this.$message.warning("请选择资料进行鉴定");
            return ;
          }
          let recordCodes = [];
          this.gridData.forEach(item=>{
            recordCodes.push(item.recordCode)
          })
          let params = {
            reason:this.ruleForm.retention == "销毁"?"到期销毁":"到期鉴定",
            tableCode :this.tableCode,
            retentionnew:this.ruleForm.retention,
            type:this.ruleForm.retention == "销毁"?2:1,
            recordCodes:recordCodes.join(),
            opinion:"修改保管期限 "+this.ruleForm.retention
          }
          
          insertDestroyJudge(params).then(res=>{
            if(res.success){
              this.$notify({
                title: '成功',
                message: '申请成功，信息已发出，注意查收审批结果。',
                type: 'success'
              });
              this.$router.push('/audit')
            }else{
              this.$message.error(res.msg)
            }
            
          })
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    
    handleDelete(index,row){
      this.gridData.splice(index,1)
    },
    initData(){
      this.loading = true;
      let params = {
        tableCode:this.tableCode,
        recordCodes:this.recordCodeList
      }
      retrieveDestroyJudgeArchive(params).then(res=>{ //加载列表
        this.loading = false;
        if(res.success){
          this.gridData = res.data;
        }else{
          this.gridData = [];
          this.$message.error(res.msg)
        }
      })
      retrieveStorageTime({tableCode:this.tableCode}).then(res=>{//获取保管期限
        if(res.success){
          this.retentionArr = res.data;
          this.retentionArr.push({
            NAME:"销毁",
            REMARK:"销毁"
          })
        }else{
          this.retentionArr.push({
            NAME:"销毁",
            REMARK:"销毁"
          })
          this.$message.error(res.msg)
        }
      })
    }
  },
  mounted(){
    this.recordCodeList = this.$route.query.recordCodeList;
    this.tableCode = this.$route.query.tableCode;
    this.ruleForm.name = this.userInfo.userName;
    this.initData();
  },
  computed:{
    userInfo(){
      return this.$store.getters.userInfo
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
    .border{
        border: 1px solid #dcdfe6;
        line-height: 38px;
        width: 90px;
        display: inline-block;
        text-align: left;
        padding:0 8px;
        margin-right: 10px;
        border-radius: 4px;
    }
  }
  
  
}
</style>

