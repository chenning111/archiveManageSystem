<!-- 鉴定查看 -->
<template>
  <section>
    <el-col :span="24" class="content-header flex-spaceBetween">
      <h3>鉴定意见单信息</h3>
      <el-button type="primary" size="medium" @click="printDialog = true">打印</el-button>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px 15px;">
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>鉴定列表
          </div>
        </div>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            v-loading="loading"
            tooltip-effect="dark"
            :span-method="objectSpanMethod"
          >
            <el-table-column label="单号" align="center" prop="destroyjudgeopinionNumber"></el-table-column>
            <el-table-column label="题名" align="center" prop="maintitle" min-width="200"></el-table-column>
            <el-table-column label="鉴定人" align="center" prop="person"></el-table-column>

            <el-table-column label="鉴定日期" align="center">
              <template slot-scope="scope">
                <span>{{new Date(scope.row.judgedate).format('yyyy-MM-dd')}}</span>
              </template>
            </el-table-column>
            <el-table-column label="档号" align="center" prop="archiveno" min-width="200"></el-table-column>
            <el-table-column label="原保管期限" align="center" prop="retentionold"></el-table-column>
            <el-table-column label="鉴定意见" align="center" prop="opinion"></el-table-column>
          </el-table>
        </div>
      </div>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>鉴定意见信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>鉴定信息</label>
                    <span>{{dataInfo.reason}}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>鉴定人</label>
                    <span>{{dataInfo.person}}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>鉴定日期</label>
                    <span>{{new Date(dataInfo.judgedate).format('yyyy-MM-dd')}}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>鉴定意见</label>
                    <span>{{dataInfo.opinion}}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem" v-if="isshow">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>小组意见信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>小组负责人</label>
                    <span>{{form.groupprincipal}}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>小组签字日期</label>
                    <span>
                      <el-date-picker
                        type="date"
                        placeholder="选择日期"
                        v-model="form.groupinkdate"
                        value-format="yyyy-MM-dd"
                      ></el-date-picker>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>小组意见</label>
                    <span>
                      <el-select v-model="form.status">
                        <el-option value="2" label="同意"></el-option>
                        <el-option value="4" label="不同意"></el-option>
                      </el-select>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>补充说明</label>
                    <span>
                      <el-input type="textarea" v-model="form.groupopinion" size="small"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem" v-if="isshow">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>会签信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>单位领导鉴定</label>
                    <span>
                      <el-input
                        type="textarea"
                        v-model="form.dwWord"
                        size="small"
                        maxlength="20"
                        show-word-limit
                      ></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>档案领导鉴定</label>
                    <span>
                      <el-input
                        type="textarea"
                        v-model="form.daWord"
                        size="small"
                        maxlength="20"
                        show-word-limit
                      ></el-input>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>涉档部门领导鉴定</label>
                    <span>
                      <el-input
                        type="textarea"
                        v-model="form.sdWord"
                        size="small"
                        maxlength="20"
                        show-word-limit
                      ></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem textCenter" style="margin-top:50px;">
        <el-button
          type="primary"
          v-if="dataInfo.status===4&& audit ==='true'"
          @click="resetJudge"
        >重新鉴定</el-button>
        <el-button type="primary" v-if="dataInfo.status ===1 && audit ==='false'" @click="submit">提交</el-button>
      </div>
    </el-col>
    <el-dialog width="880px" title="打印" :visible.sync="printDialog" custom-class="noPaddingDialog">
      <div class="btnwrapper" style="padding:10px 15px;border-bottom: 1px solid #ccc">
        <el-button type="primary" v-print="'#printContent'">打 印</el-button>
        <el-button @click="printDialog = false">取 消</el-button>
      </div>
      <div style="background-color:#fff;min-height:500px;padding:0 15px;" id="printContent">
        <div class="listitem">
          <div class="tableTitle">
            <div>鉴定单</div>
          </div>
          <p class="dh">鉴定单号：{{destroyjudgeopinionNumber}}</p>
          <div style="padding:0 15px">
            <table class="cntable printTable">
              <thead>
                <tr>
                  <th width="8%">序号</th>
                  <th>题名</th>
                  <th width="10%">鉴定人</th>
                  <th>鉴定日期</th>
                  <th>档号</th>
                  <th>原保管期限</th>
                  <th>鉴定意见</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item,index) in gridData" :key="index">
                  <td>{{index+1}}</td>
                  <td>{{item.maintitle}}</td>
                  <td>{{item.person}}</td>
                  <td>{{new Date(item.judgedate).format('yyyy-MM-dd')}}</td>
                  <td>{{item.archiveno}}</td>
                  <td>{{item.retentionold}}</td>
                  <td>{{item.opinion}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="listitem">
          <div class="tableTitle">
            <div>鉴定意见信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>鉴定信息</label>
                      <span>{{dataInfo.reason}}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>鉴定人</label>
                      <span>{{dataInfo.person}}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>鉴定日期</label>
                      <span>{{new Date(dataInfo.judgedate).format('yyyy-MM-dd')}}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>鉴定意见</label>
                      <span>{{dataInfo.opinion}}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="listitem" v-if="isshow">
          <div class="tableTitle">
            <div>小组意见信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>小组负责人</label>
                      <span>{{form.groupprincipal}}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>小组签字日期</label>
                      <span>
                        {{new Date(form.groupinkdate).format('yyyy-MM-dd')}}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>小组意见</label>
                      <span>
                        {{form.status == 2?'同意': '不同意'}}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>补充说明</label>
                      <span>
                        {{form.groupopinion}}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="listitem" v-if="isshow">
          <div class="tableTitle">
            <div>会签信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>单位领导鉴定</label>
                      <span>
                        {{form.dwWord}}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>档案领导鉴定</label>
                      <span>
                        {{form.daWord}}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>涉档部门领导鉴定</label>
                      <span>
                        {{form.sdWord}}
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </el-dialog>
  </section>
</template>
<script>
import { Base64 } from "js-base64";
import {
  retrieveFirstDestroyJudgeOpinionMsg,
  approvalDestroyJudgeOpinion
} from "@/api/judge";
export default {
  provide() {
    return {
      form: this.form
    };
  },
  data() {
    return {
      printDialog: false,
      searchForm: {
        //搜索的表单
        searial: "",
        title: "",
        remark: ""
      },
      dataInfo: {},
      gridData: [],
      loading: false,
      destroyjudgeopinionNumber: "",
      spanArr: [],
      form: {
        groupprincipal: "",
        groupopinion: "",
        groupinkdate: new Date().format("yyyy-MM-dd"),
        remark: "",
        dwWord: "",
        daWord: "",
        sdWord: "",
        status: "2"
      },
      audit: null, //判断是否是从审核记录还是小组审批进来的
      isshow: null
    };
  },

  methods: {
    resetJudge() {
      let recordCodeList = [];
      this.gridData.forEach(item => {
        recordCodeList.push(item.recordcode);
      });
      this.$router.push({
        path: "appraisalContent",
        query: {
          tableCode: this.gridData[0].tablecode,
          recordCodeList: recordCodeList.join()
        }
      });
    },

    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex !== 1 && columnIndex !== 4) {
        const _row = this.spanArr[rowIndex];
        const _col = _row > 0 ? 1 : 0;
        return {
          rowspan: _row,
          colspan: _col
        };
      }
    },
    handleData() {
      let contactDot = 0;
      this.gridData.forEach((item, index) => {
        item.index = index;
        if (index === 0) {
          this.spanArr.push(1);
        } else {
          if (
            item.destroyjudgeopinionNumber ===
            this.gridData[index - 1].destroyjudgeopinionNumber
          ) {
            this.spanArr[contactDot] += 1;
            this.spanArr.push(0);
          } else {
            this.spanArr.push(1);
            contactDot = index;
          }
        }
      });
    },
    submit() {
      let remark = {
        dwWord: this.form.dwWord,
        daWord: this.form.daWord,
        sdWord: this.form.sdWord
      };
      let params = {
        destroyjudgeopinionNumber: this.destroyjudgeopinionNumber,
        groupopinion: this.form.groupopinion,
        groupprincipal: this.form.groupprincipal,
        remark: JSON.stringify(remark),
        status: Number(this.form.status)
      };
      approvalDestroyJudgeOpinion(params).then(res => {
        if (res.success) {
          if (params.status == 2) {
            this.$notify({
              title: "成功",
              message: "审核通过",
              type: "success"
            });
          }
          this.$router.push("/panelApproval");
        } else {
          this.$message.error(res.msg);
        }
      });
    },

    searchFunc(params) {
      params.destroyjudgeopinionNumber = this.destroyjudgeopinionNumber;
      this.loading = true;
      retrieveFirstDestroyJudgeOpinionMsg(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.handleData();

            this.dataInfo = this.gridData[0];
            if (this.audit == "false") {
              //如果是小组审批过来的 显示小组意见和会签意见
              this.isshow = true;
            } else if (this.audit == "true" && this.dataInfo.status != 1) {
              //如果是审核记录过来的并且已经是审核过的 显示小组意见和会签意见
              this.isshow = true;
            }
            if (this.dataInfo.status != 1) {
              //如果是已经审核过的 绑定值
              this.form = Object.assign({}, this.form, this.dataInfo);
            }
            this.form.status = String(this.form.status); //转换类型 select绑定为string
            let obj = JSON.parse(this.form.remark);
            this.form.dwWord = obj.dwWord; //单位
            this.form.daWord = obj.daWord; //档案
            this.form.sdWord = obj.sdWord; //涉档
          } else {
            this.gridData = [];
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    initData() {
      let params = {
        limit: 10000,
        star: 1
      };
      this.searchFunc(params);
    }
  },
  mounted() {
    this.destroyjudgeopinionNumber = Base64.decode(this.$route.query.num);
    this.audit = Base64.decode(this.$route.query.audit);
    this.$set(
      this.form,
      "groupprincipal",
      this.$store.getters.userInfo.userCode
    );
    this.initData();
  },
  components: {},
  beforeRouteEnter(to, from, next) {
    // 注意，在路由进入之前，组件实例还未渲染，所以无法获取this实例，只能通过vm来访问组件实例
    next(vm => {
      to.meta.title = Base64.decode(vm.$route.query.title);
    });
  },
  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    }
  }
};
</script>

<style lang="scss" scoped>
.content-header {
  h3 {
    border: none;
  }
  button {
    margin-right: 20px;
  }
}
</style>

