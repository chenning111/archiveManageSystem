<!-- 批量销毁-->
<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3 style="border:none">销毁信息</h3>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px 15px;">
      <div class="listitem" v-if="gridData.length>1">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>销毁列表
          </div>
        </div>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            v-loading="loading"
            header-row-class-name="thClassName"
            tooltip-effect="dark"
          >
            <el-table-column label="序号" align="center" width="55">
              <template slot-scope="scope">{{scope.$index+1}}</template>
            </el-table-column>
            <el-table-column label="档号" align="center" prop="archiveno" min-width="200"></el-table-column>
            <el-table-column label="题名" align="center" prop="maintitle" min-width="200"></el-table-column>
            <el-table-column label="原保管期限" align="center" prop="retentionold"></el-table-column>
            <el-table-column label="鉴定人" align="center" prop="person"></el-table-column>
            <el-table-column label="鉴定意见" align="center" prop="opinion"></el-table-column>
            <el-table-column label="鉴定日期" align="center">
              <template slot-scope="scope">
                <span>{{new Date(scope.row.judgedate).format('yyyy-MM-dd')}}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle" v-if="gridData.length>1">
          <div>
            <i class="el-icon-collection-tag"></i>销毁单
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr v-if="gridData.length==1">
                <td>
                  <div class="tableItem">
                    <label>档号</label>
                    <span>{{dataInfo.archiveno}}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>题名</label>
                    <span :title="dataInfo.maintitle">{{dataInfo.maintitle}}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>销毁原因</label>
                    <span>到期销毁</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>批准人</label>
                    <span>{{dataInfo.groupprincipal}}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>
                      <em style="color:#ff0036">*</em> 销毁时间
                    </label>
                    <span>
                      <el-date-picker
                        type="date"
                        placeholder="选择日期"
                        v-model="form.destroydate"
                        value-format="yyyy-MM-dd"
                        size="small"
                      ></el-date-picker>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>批准时间</label>
                    <span>{{new Date(dataInfo.groupinkdate).format('yyyy-MM-dd')}}</span>
                  </div>
                </td>
              </tr>
              <!-- <tr>
                <td>
                  <div class="tableItem">
                    <label>监督人</label>
                    <span>
                      <el-input type="text" v-model="form.custodian" size="small"></el-input>
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>监督销毁时间</label>
                    <span>
                      <el-date-picker
                        type="date"
                        placeholder="选择日期"
                        v-model="form.supedestroydate"
                        value-format="yyyy-MM-dd"
                        size="small"
                      ></el-date-picker>
                    </span>
                  </div>
                </td>
              
              </tr>-->
              <tr>
                <td>
                  <div class="tableItem">
                    <label>备注</label>
                    <span>
                      <el-input type="textarea" v-model="form.remark" size="small"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="textCenter" style="margin-top:50px">
        <el-button type="primary" @click="submit">销毁</el-button>
        <el-button @click="reset">重置</el-button>
      </div>
    </el-col>
  </section>
</template>
<script>
import { Base64 } from "js-base64";
import {
  retrieveDestroyInfoByRecordCodes,
  destroyOpinionByRecordCodes
} from "@/api/judge";
export default {
  data() {
    return {
      loading: false,
      gridData: [],
      form: {
        destroydate: new Date().format("yyyy-MM-dd"),
        custodian: "",
        supedestroydate: new Date().format("yyyy-MM-dd"),
        remark: ""
      },
      recordCodeList: "",
      dataInfo: {}
    };
  },

  methods: {
    handleCancel(index) {
      this.gridData.splice(index, 1);
    },

    searchFunc(params) {
      params.recordCodes = this.recordCodeList;
      this.loading = true;
      retrieveDestroyInfoByRecordCodes(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data || [];
            this.dataInfo = this.gridData[0];
            // if (this.dataInfo.status != 1) {
            //   //如果是已经审核过的 绑定值
            //   this.form = Object.assign({}, this.form, this.dataInfo);
            // }
          } else {
            this.gridData = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    submit() {
      let recordCodes = [];
      if (!this.form.destroydate) {
        this.$message.warning("请选择销毁时间");
        return;
      }
      this.gridData.forEach(item => {
        recordCodes.push(item.recordcode);
      });
      let params = {
        recordCodes: recordCodes.join(),
        destroyreason: "到期销毁", //销毁原因
        destroydate: this.form.destroydate, //销毁日期
        remark: this.form.remark, //
        authorizeperson: this.dataInfo.groupprincipal,
        authorizedate: new Date(this.dataInfo.groupinkdate).format("yyyy-MM-dd")
      };
      destroyOpinionByRecordCodes(params).then(res => {
        if (res.success) {
          this.$notify({
            title: "成功",
            message: "销毁成功",
            type: "success"
          });
          this.$router.push("/appraisaList");
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    reset() {
      this.form.remark = "";
      this.form.custodian = "";
    },
    initData() {
      this.loading = true;
      retrieveDestroyInfoByRecordCodes({ recordCodes: this.recordCodeList })
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data || [];
            this.dataInfo = this.gridData[0];
          } else {
            this.gridData = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    }
  },
  mounted() {
    this.recordCodeList = this.$route.query.recordCodeList;
    this.initData();
  },
  components: {}
};
</script>



