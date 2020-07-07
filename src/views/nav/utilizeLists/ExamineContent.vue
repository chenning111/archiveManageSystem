<!-- 借阅条目信息公用组件 -->
<template>
  <section>
    <div class="content-header flex-spaceBetween">
      <h3>借阅条目信息</h3>
      <el-button type="primary" size="medium" @click="printDialog = true">打印</el-button>
    </div>
    <el-col
      :span="24"
      style="background-color:#fff;min-height:500px;padding:20px 15px;"
      v-if="gridData.length > 0"
    >
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>借阅单
          </div>
        </div>
        <!-- 归还插槽 -->
        <slot name="disposal"></slot>
        <p class="dh">借阅单号：{{ danghao }}</p>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            v-loading="loading"
            ref="tableBox"
          >
            <el-table-column type="selection" width="55" align="center" v-if="title == '借出处理'"></el-table-column>
            <el-table-column label="序号" width="55" align="center">
              <template slot-scope="scope">{{ scope.$index + 1 }}</template>
            </el-table-column>
            <el-table-column label="档号" align="center" prop="archiveNo"></el-table-column>
            <el-table-column label="题名" align="center" prop="maintitle"></el-table-column>
            <el-table-column label="所属部门" align="center" prop="depName"></el-table-column>

            <el-table-column label="所在位置" align="center" prop="auxiName"></el-table-column>
            <el-table-column
              property="set"
              label="操作"
              align="center"
              width="200"
              fixed="right"
              v-if="
                title != '借出处理' && title != '收回处理' && title != '打印'
              "
            >
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  @click="handleRead(scope.row)"
                  title="查看原文"
                >原({{ scope.row.yuanWenShuLiang }})</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>借阅登记信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>申请人</label>
                    <span>{{ dataInfo.username }}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>借阅类型</label>
                    <span>{{ dataInfo.lendflag | getLendType }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>部门</label>
                    <span>{{ dataInfo.useDepName }}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>电话</label>
                    <span>{{ dataInfo.telephone }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>申请日期</label>
                    <span>
                      {{
                      new Date(dataInfo.registerdate).format("yyyy-MM-dd")
                      }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>借阅时间</label>
                    <span>
                      {{
                      new Date(dataInfo.begindate).format("yyyy-MM-dd")
                      }}&nbsp;至&nbsp;{{
                      new Date(dataInfo.enddate).format("yyyy-MM-dd")
                      }}
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>利用目的</label>
                    <span>{{ dataInfo.usepurpose }}</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem" v-if="title == '审核'">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>审批信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>审批人</label>
                    <span>{{ userInfo.userName }}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>是否同意授权</label>
                    <span>
                      <el-select v-model="form.checkResult" @change="changeResult">
                        <el-option value="同意" label="同意"></el-option>
                        <el-option value="不同意" label="不同意"></el-option>
                      </el-select>
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>备注</label>
                    <span>
                      <el-input type="textarea" size="small" v-model="form.checkOpinion"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="listitem" v-if="shenpiArr.length > 0">
        <div class="tableTitle">
          <div v-if="title == '审核'">
            <i class="el-icon-collection-tag"></i>借阅确认信息
          </div>
          <div v-else>
            <i class="el-icon-collection-tag"></i>审批历史信息
          </div>
        </div>
        <div style="padding:0 15px">
          <el-timeline>
            <el-timeline-item>
              <p>
                {{ shenpiArr[0].department }}：{{
                shenpiArr[0].firstCheckPerson
                }}
                <span
                  class="timestamp"
                >{{ shenpiArr[0].firstCheckTime }}</span>
              </p>
              <h4>审批结果：{{ shenpiArr[0].firstCheckResult }}</h4>
              <p>理由：{{ shenpiArr[0].firstCheckOpinion }}</p>
            </el-timeline-item>
            <el-timeline-item v-if="shenpiArr.length == 2">
              <p>
                {{ shenpiArr[1].department }}：{{
                shenpiArr[1].secondCheckPerson
                }}
                <span
                  class="timestamp"
                >
                  {{
                  shenpiArr[1].secondCheckTime
                  }}
                </span>
              </p>
              <h4>审批结果：{{ shenpiArr[1].secondCheckResult }}</h4>
              <p>理由：{{ shenpiArr[1].secondCheckOpinion }}</p>
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
      <div class="listitem" v-if="words == 'back'">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>借阅收回信息
          </div>
        </div>
        <div style="padding:0 15px">
          <table class="cntable">
            <tbody>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>处理人</label>
                    <span>{{ userInfo.userName }}</span>
                  </div>
                </td>
                <td>
                  <div class="tableItem">
                    <label>收回日期</label>
                    <span>{{ form.takeBackDate }}</span>
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div class="tableItem">
                    <label>备注</label>
                    <span>
                      <el-input type="textarea" size="small" v-model="form.takeBackContent"></el-input>
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="textCenter" style="margin-top:50px;" v-if="title == '审核' || title == '收回处理'">
        <el-button type="primary" @click="submitForm">提交</el-button>
        <el-button @click="resetForm">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px 15px;" v-else>
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>暂无信息
          </div>
        </div>
      </div>
    </el-col>
    <el-dialog width="300px" title="催还处置信息" :visible.sync="dialogVisible">
      <el-form ref="form1" :model="form1" label-width="0" :rules="rules">
        <el-form-item prop="value">
          <el-select v-model="form1.value" clearable>
            <el-option value="逾期催还" label="逾期催还"></el-option>
            <el-option value="提早收回" label="提早收回"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="postCH('form1')">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog width="880px" title="打印" :visible.sync="printDialog" custom-class="noPaddingDialog">
      <div class="btnwrapper" style="padding:10px 15px;border-bottom: 1px solid #ccc">
        <el-button type="primary" v-print="'#printContent'">打 印</el-button>
        <el-button @click="printDialog = false">取 消</el-button>
      </div>
      <div style="background-color:#fff;padding:0 15px;" id="printContent">
        <div class="listitem">
          <div class="tableTitle">
            <div>借阅单</div>
          </div>
          <p class="dh">借阅单号：{{ danghao }}</p>
          <div style="padding:0 15px">
            <table class="cntable printTable">
              <thead>
                <tr>
                  <th width="8%">序号</th>
                  <th>档号</th>
                  <th>题名</th>
                  <th>所属部门</th>
                  <th>所在位置</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in gridData" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.archiveNo }}</td>
                  <td>{{ item.maintitle }}</td>
                  <td>{{ item.depName }}</td>
                  <td>{{ item.auxiName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="listitem">
          <div class="tableTitle">
            <div>借阅登记信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>申请人</label>
                      <span>{{ dataInfo.username }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>借阅类型</label>
                      <span>{{ dataInfo.lendflag | getLendType }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>部门</label>
                      <span>{{ dataInfo.useDepName }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>电话</label>
                      <span>{{ dataInfo.telephone }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>申请日期</label>
                      <span>
                        {{
                        new Date(dataInfo.registerdate).format("yyyy-MM-dd")
                        }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>借阅时间</label>
                      <span>
                        {{
                        new Date(dataInfo.begindate).format("yyyy-MM-dd")
                        }}&nbsp;至&nbsp;{{
                        new Date(dataInfo.enddate).format("yyyy-MM-dd")
                        }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>利用目的</label>
                      <span>{{ dataInfo.usepurpose }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="listitem" v-if="title == '审核'">
          <div class="tableTitle">
            <div>审批信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>审批人</label>
                      <span>{{ userInfo.userName }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>是否同意授权</label>
                      <span>{{ form.checkResult }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>备注</label>
                      <span>{{ form.checkOpinion }}</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="listitem" v-if="shenpiArr.length > 0">
          <div class="tableTitle">
            <div v-if="title == '审核'">借阅确认信息</div>
            <div v-else>审批历史信息</div>
          </div>
          <div style="padding:0 15px">
            <el-timeline>
              <el-timeline-item>
                <p>
                  {{ shenpiArr[0].department }}：{{
                  shenpiArr[0].firstCheckPerson
                  }}
                  <span
                    class="timestamp"
                  >
                    {{
                    shenpiArr[0].firstCheckTime
                    }}
                  </span>
                </p>
                <h4>审批结果：{{ shenpiArr[0].firstCheckResult }}</h4>
                <p>理由：{{ shenpiArr[0].firstCheckOpinion }}</p>
              </el-timeline-item>
              <el-timeline-item v-if="shenpiArr.length == 2">
                <p>
                  {{ shenpiArr[1].department }}：{{
                  shenpiArr[1].secondCheckPerson
                  }}
                  <span
                    class="timestamp"
                  >
                    {{
                    shenpiArr[1].secondCheckTime
                    }}
                  </span>
                </p>
                <h4>审批结果：{{ shenpiArr[1].secondCheckResult }}</h4>
                <p>理由：{{ shenpiArr[1].secondCheckOpinion }}</p>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
        <div class="listitem" v-if="words == 'back'">
          <div class="tableTitle">
            <div>借阅收回信息</div>
          </div>
          <div style="padding:0 15px">
            <table class="cntable">
              <tbody>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>处理人</label>
                      <span>{{ userInfo.userName }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="tableItem">
                      <label>收回日期</label>
                      <span>{{ form.takeBackDate }}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div class="tableItem">
                      <label>备注</label>
                      <span>
                        <el-input type="textarea" size="small" v-model="form.takeBackContent"></el-input>
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
import { deepQuery } from "@/common/js/util";
import { Base64 } from "js-base64";
import {
  firstGetUseLend,
  secondGetUseLend,
  lendAndBack,
  firstCheck,
  secondCheck,
  takeBackAndLendByLendCode,
  takeBackAndLend,
  getUseLend
} from "@/api/borrow";
export default {
  props: ["back", "words"],
  data() {
    return {
      gridData: [],
      oldData: [],
      loading: false,
      printDialog: false,
      dataInfo: {},
      form: {
        checkResult: "同意",
        checkOpinion: "同意本次请求",
        takeBackDate: new Date().format("yyyy-MM-dd"),
        takeBackContent: ""
      },
      title: "", //显示标题
      danghao: "", //借阅单号
      shenpiArr: [],
      form1: {
        value: ""
      },
      rules: {
        value: [{ required: true, message: "请选择一项", trigger: "change" }]
      },
      dialogVisible: false
    };
  },

  methods: {
    //催还
    Reminder() {
      let selectData = this.$refs.tableBox.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要催还的记录");
        return;
      }
      this.dialogVisible = true;
      this.form1.value = "逾期催还";
    },
    postCH(formname) {
      this.$refs[formname].validate(valid => {
        if (valid) {
          let selectData = this.$refs.tableBox.selection;
          let lendCodes = [];
          selectData.forEach(item => {
            lendCodes.push(item.lendcode);
          });
          let params = {
            useStatus: "催还",
            lendCodes: lendCodes.join(),
            recallReason: this.form1.value
          };
          takeBackAndLendByLendCode(params).then(res => {
            if (res.success) {
              this.$message.success("操作成功");
              this.$router.go(-1);
            } else {
              this.$message.error(res.msg);
            }
          });
        } else {
          return false;
        }
      });
    },
    handleReturn() {
      //归还
      let selectData = this.$refs.tableBox.selection;
      if (selectData.length == 0) {
        this.$message.warning("请勾选需要归还的记录");
        return;
      }
      let lendCodes = [];
      selectData.forEach(item => {
        lendCodes.push(item.lendcode);
      });
      let params = {
        useStatus: "归还",
        lendCodes: lendCodes.join()
      };
      takeBackAndLendByLendCode(params).then(res => {
        if (res.success) {
          this.$message.success("操作成功");
          this.$router.go(-1);
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    changeResult(val) {
      if (val == "同意") {
        this.form.checkOpinion = "同意本次请求";
      } else {
        this.form.checkOpinion = "不同意本次请求";
      }
    },
    async handleRead(row) {
      let tableViewTree = await this.$store.dispatch("tree/tableViewTree");
      let data = this.getClassNode([tableViewTree], row.tablecode, []);
      if (data.length == 0) {
        this.$message.error("该文件所在门类不存在");
        return;
      }

      this.$router.push({
        path: "/searchContent",
        query: {
          recordCode: row.recordcode,
          tableCode: row.tablecode,
          maintitle: row.maintitle || row.mainTitle,
          classnodeId: data[0].li_attr.cNodeCode
        }
      });
    },
    getClassNode(tree, id, arr) {
      for (var i = 0; i < tree.length; i++) {
        if (tree[i].li_attr) {
          if (tree[i].li_attr.TABLECODE == id) {
            arr.push(tree[i]);
            return arr;
          } else {
            if (tree[i].hasOwnProperty("children") && tree[i].children) {
              if (tree[i].children.length > 0) {
                this.getClassNode(tree[i].children, id, arr);
              }
            }
          }
        }
      }
      return arr;
    },
    resetForm() {
      this.form = {
        checkResult: "同意",
        checkOpinion: "同意本次请求",
        takeBackDate: new Date().format("yyyy-MM-dd"),
        takeBackContent: ""
      };
    },
    handleData(res) {
      this.loading = false;
      if (res.success) {
        this.gridData = res.data.list || [];
        this.total = res.data.total || 0;
        this.dataInfo = this.gridData[0];
        this.shenpiArr = [];
        if (
          this.dataInfo.useStatus == "一级核准" ||
          this.dataInfo.useStatus == "一级否决"
        ) {
          let obj = JSON.parse(this.dataInfo.approving);
          this.shenpiArr.push(obj);
        }
        if (
          this.dataInfo.useStatus !== "一级核准" &&
          this.dataInfo.useStatus !== "一级否决" &&
          this.dataInfo.useStatus !== "未处理"
        ) {
          let obj1 = JSON.parse(this.dataInfo.approving);
          this.shenpiArr.push(obj1);
          let obj2 = JSON.parse(this.dataInfo.remark);
          this.shenpiArr.push(obj2);
        }
        this.currentPage = res.data.pageNum;
        this.pageSize = res.data.pageSize;
      } else {
        this.$message.error(res.msg);
      }
    },
    searchFunc(params) {
      params.danghao = this.danghao;
      this.loading = true;
      if (this.words == "first") {
        params.useStatus = "全部";
        firstGetUseLend(params).then(res => {
          this.handleData(res);
        });
      } else if (this.words == "second") {
        params.useStatus = "全部";
        secondGetUseLend(params).then(res => {
          this.handleData(res);
        });
      } else if (this.words == "lend") {
        params.useStatus = "借出";
        params.useStatusFlag = "借出";
        lendAndBack(params).then(res => {
          this.handleData(res);
        });
      } else if (this.words == "back") {
        params.useStatusFlag = "收回";
        lendAndBack(params).then(res => {
          this.handleData(res);
        });
      } else if (this.words == "useDetail") {
        params.useStatus = "全部";
        getUseLend(params).then(res => {
          this.handleData(res);
        });
      }
    },
    initData() {
      let params = {
        limit: 9999,
        star: 1
      };
      this.searchFunc(params);
    },
    submitForm() {
      let params = {
        checkResult: this.form.checkResult,
        danghaos: this.danghao,
        checkTime: new Date().format("yyyy-MM-dd hh:mm:ss"),
        checkPerson: this.userInfo.userCode,
        checkOpinion: this.form.checkOpinion
      };
      if (this.words == "first") {
        //一级审核
        firstCheck(params).then(res => {
          if (res.success) {
            this.$message.success("审核成功");
            this.$router.go(-1);
          } else {
            this.$message.error(res.msg);
          }
        });
      } else if (this.words == "second") {
        //二级审核
        secondCheck(params).then(res => {
          if (res.success) {
            this.$message.success("审核成功");
            this.$router.go(-1);
          } else {
            this.$message.error(res.msg);
          }
        });
      } else if (this.words == "back") {
        //收回确认信息
        let params = {
          useStatus: "收回",
          danghaos: this.danghao,
          recallReason: this.form.takeBackContent
        };
        takeBackAndLend(params).then(res => {
          if (res.success) {
            this.$message.success("操作成功");
            this.$router.go(-1);
          } else {
            this.$message.error(res.msg);
          }
        });
      }
    }
  },
  mounted() {
    this.danghao = Base64.decode(this.$route.query.num);
    this.title = Base64.decode(this.$route.query.title);
    this.initData();
  },

  computed: {
    userInfo() {
      return this.$store.getters.userInfo;
    }
  },
  filters: {
    getLendType(value) {
      let name = "";
      switch (value) {
        case "1":
          name = "在线借阅";
          break;
        case "2":
          name = "实体借出";
          break;
        case "3":
          name = "下载打印";
          break;
        case "4":
          name = "实体查阅";
          break;
      }
      return name;
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
.listitem .el-timeline-item__content h4 {
  margin: 10px 0;
}
.listitem .el-timeline-item__content p {
  margin: 0;
  .timestamp {
    margin-left: 30px;
    color: #ccc;
    font-size: 12px;
  }
}
.listitem .el-timeline-item__content p:last-child {
  font-weight: 700;
}
</style>
