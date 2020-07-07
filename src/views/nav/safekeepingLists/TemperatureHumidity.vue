<!-- 温湿度管理 -->
<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>库房号：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入库房号"
            v-model="searchForm.warehouseno"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>登记日期：</label>
          <el-date-picker
            v-model="searchForm.Registerdate"
            type="daterange"
            align="left"
            size="small"
            unlink-panels
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="yyyy-MM-dd"
            :picker-options="pickerOptions"
            @change="search"
          ></el-date-picker>
        </div>

        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:18px;min-height:500px;">
      <div class="tableTitle">
        <div>数据列表</div>
        <div>
          <el-button size="small" type="primary" plain @click="handleCensus">统计</el-button>
          <el-button size="small" type="primary" plain @click="setParams">参数设置</el-button>
          <el-button size="small" type="primary" @click="addData">新增</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          header-row-class-name="thClassName"
          v-loading="loading"
          tooltip-effect="dark"
        >
          <el-table-column label="序号" width="55" align="center">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>
          </el-table-column>
          <el-table-column
            label="库房号"
            align="center"
            :show-overflow-tooltip="true"
            prop="warehouseno"
          ></el-table-column>
          <el-table-column
            label="登记日期"
            align="center"
            :show-overflow-tooltip="true"
            prop="registerdate"
          >
            <!-- <template slot-scope="scope">{{new Date(scope.row.registerdate).format('yyyy-MM-dd')}}</template> -->
          </el-table-column>
          <el-table-column label="温度（早）" align="center" :show-overflow-tooltip="true">
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.temprature1,standardData.standardtemprature)"
              >{{scope.row.temprature1}}°c</span>
            </template>
          </el-table-column>
          <el-table-column
            label="湿度（早）"
            align="center"
            :show-overflow-tooltip="true"
            prop="humidity1"
          >
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.humidity1,standardData.standardhumidity)"
              >{{scope.row.humidity1}}%</span>
            </template>
          </el-table-column>
          <el-table-column
            label="温度（午）"
            align="center"
            :show-overflow-tooltip="true"
            prop="temprature2"
          >
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.temprature2,standardData.standardtemprature)"
              >{{scope.row.temprature2}}°c</span>
            </template>
          </el-table-column>
          <el-table-column
            label="湿度（午）"
            align="center"
            :show-overflow-tooltip="true"
            prop="humidity2"
          >
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.humidity2,standardData.standardhumidity)"
              >{{scope.row.humidity1}}%</span>
            </template>
          </el-table-column>
          <el-table-column
            label="温度（晚）"
            align="center"
            :show-overflow-tooltip="true"
            prop="temprature3"
          >
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.temprature3,standardData.standardtemprature)"
              >{{scope.row.temprature3}}°c</span>
            </template>
          </el-table-column>
          <el-table-column
            label="湿度（晚）"
            align="center"
            :show-overflow-tooltip="true"
            prop="humidity3"
          >
            <template slot-scope="scope">
              <span
                :style="getColor(scope.row.humidity3,standardData.standardhumidity)"
              >{{scope.row.humidity3}}%</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="handleWrite(scope.row)">修改</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
              <!-- <el-button size="mini" type="text" @click="handleDelete(scope.row)">打印</el-button> -->
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total,prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20,50,100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
    <!-- 参数设置-->
    <el-dialog :visible.sync="dialogVisible" title="参数设置" v-if="dialogVisible" width="600px">
      <el-form :model="standardData" ref="standardForm" label-width="140px">
        <el-form-item label="标准温度：">
          <el-input v-model="standardData.standardtemprature">
            <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          </el-input>
        </el-form-item>
        <el-form-item label=" 标准湿度：">
          <el-input v-model="standardData.standardhumidity">
            <span slot="suffix" style="font-size:18px;color:#999">%</span>
          </el-input>
        </el-form-item>
        <el-form-item label="登记时间（早）：">
          <el-time-select
            format="HH 时 mm 分"
            value-format="HH 时 mm 分"
            v-model="standardData.registerdate1"
            :picker-options="{
                  start: '08:00',
                  step: '01:00',
                  end: '20:00'
                }"
            placeholder="选择时间"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="登记时间（午）：">
          <el-time-select
            format="HH 时 mm 分"
            value-format="HH 时 mm 分"
            v-model="standardData.registerdate2"
            :picker-options="{
                  start: '08:00',
                  step: '01:00',
                  end: '20:00'
                }"
            placeholder="选择时间"
          ></el-time-select>
        </el-form-item>
        <el-form-item label="登记时间（晚）：">
          <el-time-select
            format="HH 时 mm 分"
            value-format="HH 时 mm 分"
            v-model="standardData.registerdate3"
            :picker-options="{
                  start: '08:00',
                  step: '01:00',
                  end: '20:00'
                }"
            placeholder="选择时间"
          ></el-time-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitStandardForm('standardForm')">保存</el-button>
      </span>
    </el-dialog>
    <!-- //新增或者修改 -->
    <el-dialog
      :visible.sync="dialogSet"
      :title="isUpdate? '修改温湿度信息':'新增温湿度信息'"
      v-if="dialogSet"
      width="935px"
      custom-class="center-form"
    >
      <el-form
        :model="Form"
        :rules="rules"
        ref="ruleForm"
        label-width="130px"
        :inline="true"
        label-position="right"
      >
        <el-form-item label="选择库房：" prop="warehouseno">
          <el-select v-model="Form.warehouseno" :disabled="isUpdate? true :false">
            <el-option
              v-for="item in houseData"
              :key="item.storeroomCode"
              :value="String(item.storeroomCode)"
              :label="item.storeroomAddress"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="登记日期：" prop="registerdate">
          <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          <el-date-picker
            style="width:210px"
            v-model="Form.registerdate"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            placeholder="选择登记日期"
          ></el-date-picker>
        </el-form-item>
        <el-form-item :label="'温度早：('+standardData.registerdate1+')'">
          <el-input v-model="Form.temprature1">
            <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          </el-input>
        </el-form-item>
        <el-form-item :label="'湿度早：('+standardData.registerdate1+')'">
          <el-input v-model="Form.humidity1">
            <span slot="suffix" style="font-size:18px;color:#999">％</span>
          </el-input>
        </el-form-item>
        <el-form-item :label="'温度午：('+standardData.registerdate2+')'">
          <el-input v-model="Form.temprature2">
            <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          </el-input>
        </el-form-item>
        <el-form-item :label="'湿度午：('+standardData.registerdate2+')'">
          <el-input v-model="Form.humidity2">
            <span slot="suffix" style="font-size:18px;color:#999">％</span>
          </el-input>
        </el-form-item>
        <el-form-item :label="'温度晚：('+standardData.registerdate3+')'">
          <el-input v-model="Form.temprature3">
            <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          </el-input>
        </el-form-item>
        <el-form-item :label="'湿度晚：('+standardData.registerdate3+')'">
          <el-input v-model="Form.humidity3">
            <span slot="suffix" style="font-size:18px;color:#999">％</span>
          </el-input>
        </el-form-item>
        <el-form-item label="室外平均温度：">
          <el-input v-model="Form.tempratureout">
            <span slot="suffix" style="font-size:18px;color:#999">°c</span>
          </el-input>
        </el-form-item>
        <el-form-item label="室外平均湿度：">
          <el-input v-model="Form.humidityout">
            <span slot="suffix" style="font-size:18px;color:#999">％</span>
          </el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogSet = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
    <router-view></router-view>
  </section>
</template>
<script>
import {
  updateStoreStandard,
  retrieveStoreStandard,
  retrieveStoreRegister,
  createStoreRegister,
  updateStoreRegister,
  deleteStoreRegister,
  retrieveStorerooms
} from "@/api/storeRoom";
export default {
  data() {
    return {
      rules: {
        warehouseno: [
          { required: true, message: "请选择库房", trigger: "blur" }
        ],
        registerdate: [
          { required: true, message: "请选择登记日期", trigger: "change" }
        ]
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      dialogVisible: false,
      dialogSet: false,
      recordcode: "",
      isUpdate: false,
      searchForm: {
        warehouseno: "",
        Registerdate: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      Form: {
        warehouseno: "",
        registerdate: new Date().format("yyyy-MM-dd hh:mm:ss"),
        humidity1: "",
        humidity2: "",
        humidity3: "",
        temprature1: "",
        temprature2: "",
        temprature3: "",
        tempratureout: "",
        humidityout: ""
      },
      setForm: {
        standardtemprature: "", //温度
        standardhumidity: "", //湿度
        registerdate1: "",
        registerdate2: "",
        registerdate3: ""
      },

      loading: false,
      gridData: [], //渲染表格数据
      standardData: {}, //标准数据
      houseData: [] //库房数据
    };
  },
  components: {},
  methods: {
    handleCensus() {
      this.$router.push("/statistics");
    },
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      this.searchFunc(params);
    },
    setParams() {
      //参数设置
      this.dialogVisible = true;
    },
    submitStandardForm() {
      let params = {
        registerdate1: this.standardData.registerdate1,
        registerdate2: this.standardData.registerdate2,
        registerdate3: this.standardData.registerdate3,
        standardhumidity: this.standardData.standardhumidity,
        standardtemprature: this.standardData.standardtemprature,
        standardcode: this.standardData.standardcode
      };
      updateStoreStandard(params).then(res => {
        this.dialogVisible = false;
        if (res.success) {
          this.$message.success("修改成功");
          this.initData();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = {
              recordcode: this.recordcode,
              warehouseno: this.Form.warehouseno,
              registerdate: this.Form.registerdate,
              humidity1: this.Form.humidity1,
              humidity2: this.Form.humidity2,
              humidity3: this.Form.humidity3,
              temprature1: this.Form.temprature1,
              temprature2: this.Form.temprature2,
              temprature3: this.Form.temprature3,
              tempratureout: this.Form.tempratureout,
              humidityout: this.Form.humidityout
            };
            updateStoreRegister(params)
              .then(res => {
                this.dialogSet = false;
                if (res.success) {
                  this.$message.success("修改成功");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          } else {
            //
            let params = {
              warehouseno: this.Form.warehouseno,
              registerdate: this.Form.registerdate,
              humidity1: this.Form.humidity1,
              humidity2: this.Form.humidity2,
              humidity3: this.Form.humidity3,
              temprature1: this.Form.temprature1,
              temprature2: this.Form.temprature2,
              temprature3: this.Form.temprature3,
              tempratureout: this.Form.tempratureout,
              humidityout: this.Form.humidityout
            };
            createStoreRegister(params)
              .then(res => {
                this.dialogSet = false;
                if (res.success) {
                  this.$message.success("添加成功");
                  this.initData();
                } else {
                  this.$message.error(res.msg);
                }
              })
              .catch(res => {});
          }
        } else {
          return false;
        }
      });
    },
    search() {
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        warehouseno: "",
        Registerdate: ""
      };
      this.search();
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;
      this.dialogSet = true;
      this.recordcode = row.recordcode;
      this.Form = {
        warehouseno: row.warehouseno,
        registerdate: new Date(row.registerdate).format("yyyy-MM-dd hh:mm:ss"),
        humidity1: row.humidity1,
        humidity2: row.humidity2,
        humidity3: row.humidity3,
        temprature1: row.temprature1,
        temprature2: row.temprature2,
        temprature3: row.temprature3,
        tempratureout: row.tempratureout,
        humidityout: row.humidityout
      };
    },
    addData() {
      //添加
      this.isUpdate = false;
      this.dialogSet = true;
      this.Form = {
        warehouseno: "",
        registerdate: new Date().format("yyyy-MM-dd hh:mm:ss"),
        humidity1: "",
        humidity2: "",
        humidity3: "",
        temprature1: "",
        temprature2: "",
        temprature3: "",
        tempratureout: "",
        humidityout: ""
      };
    },
    getColor(num, standardNum) {
      if (num && standardNum) {
        let standard = Number(standardNum);
        if (num < standard - 5 || num > standard + 5) {
          return "color:#ff0036";
        }
      }
    },
    handleDelete(row) {
      //删除
      this.recordcode = row.recordcode;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteStoreRegister({
            recordcode: this.recordcode
          })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {});
        })
        .catch(() => {});
    },
    handleWithdraw(row) {
      this.$router.push({
        path: "/dictionaryDetail",
        query: {
          code: row.recordcode
        }
      });
    },

    searchFunc(params) {
      params.warehouseno = this.searchForm.warehouseno;
      if (
        this.searchForm.Registerdate &&
        this.searchForm.Registerdate.length > 0
      ) {
        params.starRegisterdate = this.searchForm.Registerdate[0];
        params.endRegisterdate = this.searchForm.Registerdate[1];
      }
      this.loading = true;
      retrieveStoreRegister(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
          } else {
            this.gridData = [];
            this.total = 0;
            this.currentPage = 1;
            this.pageSize = 50;
            this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    async initData() {
      let params = {
        limit: this.pageSize,
        star: this.currentPage
      };
      await this.getStandard(); //获取标准参数
      await this.getWareHouse();
      await this.searchFunc(params);
    },
    getStandard() {
      retrieveStoreStandard().then(res => {
        if (res.success) {
          this.standardData = res.data;
        }
      });
    },
    getWareHouse() {
      let params = {
        limit: 10000,
        star: 1
      };
      retrieveStorerooms(params).then(res => {
        //获取库房
        if (res.success) {
          this.houseData = res.data.list;
        } else {
          this.$message.error(res.msg);
        }
      });
    }
  },
  mounted() {
    this.initData();
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>





