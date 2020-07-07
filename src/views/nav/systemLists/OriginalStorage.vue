<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>服务类型：</label>
          <el-select clearable v-model="searchForm.storeType" @change="search" size="small">
            <el-option label="硬盘存储" value="LOCAL" :key="1"></el-option>
            <el-option label="FTP存储" value="FTP" :key="2"></el-option>
          </el-select>
        </div>
        <div class="item">
          <label for>存放位置：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入名称"
            v-model="searchForm.fileLoc"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <div class="item">
          <label for>加密：</label>
          <el-select clearable v-model="searchForm.encrypted" @change="search">
            <el-option label="加密" value="是" :key="1"></el-option>
            <el-option label="不加密" value="否" :key="2"></el-option>
          </el-select>
        </div>
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle">
        <div>数据列表</div>
        <div>
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
            <template slot-scope="scope">
              {{
              scope.$index + 1 + index
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="服务名称"
            align="center"
            :show-overflow-tooltip="true"
            prop="storeName"
          ></el-table-column>
          <el-table-column
            label="服务类型"
            align="center"
            :show-overflow-tooltip="true"
            prop="storeType"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.storeType == 'LOCAL'">硬盘存储</span>
              <span v-else>FTP存储</span>
            </template>
          </el-table-column>
          <el-table-column
            label="原文存放位置"
            align="center"
            :show-overflow-tooltip="true"
            prop="fileLoc"
          ></el-table-column>
          <el-table-column label="IP地址" align="center" :show-overflow-tooltip="true" prop="ftpIp"></el-table-column>
          <el-table-column
            label="原文存放路径的时间设置"
            align="center"
            :show-overflow-tooltip="true"
            prop="timeStylePos"
          ></el-table-column>
          <el-table-column
            label="是否压缩"
            align="center"
            :show-overflow-tooltip="true"
            prop="compressed"
          ></el-table-column>
          <el-table-column
            label="是否加密"
            align="center"
            :show-overflow-tooltip="true"
            prop="encrypted"
          ></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="250" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="warning" @click="handleWrite(scope.row)">修改</el-button>
              <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total,prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
    <!-- 新增或修改-->
    <el-dialog :visible.sync="dialogVisible" :title="isUpdate ? '修改记录' : '新增记录'" width="70%">
      <el-form :model="Form" :rules="rules" ref="ruleForm" label-width="180px">
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="服务名称" prop="storeName">
              <el-input v-model="Form.storeName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否压缩" prop="compressed">
              <el-select clearable v-model="Form.compressed">
                <el-option value="是" label="压缩"></el-option>
                <el-option value="否" label="不压缩"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="服务类型" prop="storeType">
              <el-select clearable v-model="Form.storeType">
                <el-option value="LOCAL" label="硬盘存储"></el-option>
                <el-option value="FTP" label="FTP存储"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否加密" prop="encrypted">
              <el-select clearable v-model="Form.encrypted">
                <el-option value="是" label="加密"></el-option>
                <el-option value="否" label="不加密"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="服务器的IP地址" prop="ftpIp">
              <el-input v-model="Form.ftpIp" :disabled="Form.storeType =='LOCAL' ?true :false"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户登陆名" prop="ftpUserName">
              <el-input
                v-model="Form.ftpUserName"
                :disabled="Form.storeType =='LOCAL' ?true :false"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="服务器端口" prop="ftpPort">
              <el-input v-model="Form.ftpPort" :disabled="Form.storeType =='LOCAL' ?true :false"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户登陆密码" prop="ftpPassword">
              <el-input
                v-model="Form.ftpPassword"
                :disabled="Form.storeType =='LOCAL' ?true :false"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="原文存放路径的时间设置" prop="timeStylePos">
              <el-checkbox-group v-model="Form.timeStylePos" class="checkboxInline">
                <el-checkbox label="yyyy">年</el-checkbox>
                <el-checkbox label="MM">月</el-checkbox>
                <el-checkbox label="dd">日</el-checkbox>
                <el-checkbox label="HH">时</el-checkbox>
                <el-checkbox label="mm">分</el-checkbox>
                <el-checkbox label="ss">秒</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" :prop="Form.storeType =='FTP'?'checkPass':''">
              <el-input v-model="Form.checkPass" :disabled="Form.storeType =='LOCAL' ?true :false"></el-input>
            </el-form-item>
          </el-col>
        </el-col>
        <el-col :span="24">
          <el-col :span="12">
            <el-form-item label="文档存放路径" prop="fileLoc">
              <el-input v-model="Form.fileLoc"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12"></el-col>
        </el-col>

        <el-col :span="24">
          <el-form-item label="描述说明" prop="description">
            <el-input v-model="Form.description" type="textarea"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="选择门类表">
            <el-transfer
              filterable
              :filter-method="filterMethod"
              :data="categoryList"
              v-model="Form.catalogNodeCode"
              filter-placeholder="请输入字段中文名名"
              @left-check-change="
                (a, b) => {
                  changeLeftTransfer(a, b,Form.catalogNodeCode);
                }
              "
              @right-check-change="
                (a, b) => {
                  changeRightTransfer(a, b,Form.catalogNodeCode);
                }
              "
              :props="{
                key: 'id',
                label: 'text'
              }"
              :titles="['待添加', '已选']"
            ></el-transfer>
          </el-form-item>
        </el-col>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  getUpLoadFilePath,
  getUpLoadFilePathNodeCodes,
  deleteUpLoadFilePath,
  creatUpLoadFilePath,
  updateUpLoadFilePath
} from "@/api/originalStorage";
import { deepClone } from "@/common/js/util";

export default {
  name: "originalStorage",
  data() {
    var validatePass2 = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请再次输入密码"));
      } else if (value != this.Form.ftpUserName) {
        callback(new Error("两次输入密码不一致!"));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: false,
      storeId: "",
      isUpdate: false,
      searchForm: {
        storeType: "",
        fileLoc: "",
        encrypted: ""
      },
      pageSize: 50,
      currentPage: 1,
      total: 0,
      Form: {
        storeName: "",
        storeType: "",
        ftpIp: "",
        ftpPort: "",
        ftpUserName: "",
        ftpPassword: "",
        fileLoc: "",
        catalogNodeCode: [],
        timeStylePos: [],
        compressed: "",
        encrypted: "",
        description: "",
        checkPass: ""
      },
      rules: {
        storeName: [{ required: true, message: "请输入", trigger: "blur" }],
        storeType: [{ required: true, message: "请输入", trigger: "blur" }],
        checkPass: [
          { validator: validatePass2, trigger: "blur" },
          { required: true, message: "请输入", trigger: "blur" }
        ]
      },
      filterMethod(query, item) {
        return item.text.indexOf(query) > -1;
      },
      loading: false,
      categoryList: [],
      checkedNodeCode: [], //已经设置过的表
      gridData: [] //渲染表格数据
    };
  },

  methods: {
    changeLeftTransfer(a, b, data) {
      data.push(...b);
    },
    changeRightTransfer(a, b, data) {
      b.forEach(item => {
        let index = data.findIndex(val => item == val);
        data.splice(index, 1);
      });
    },
    handleSizeChange(val) {
      //当前显示多少条
      this.currentPage = 1;
      this.pageSize = val;
      this.initData();
    },
    handleCurrentChange(val) {
      //当前页码
      this.currentPage = val;
      this.initData();
    },
    addData() {
      //添加
      this.isUpdate = false;
      this.Form = {
        storeName: "",
        storeType: "LOCAL",
        ftpIp: "",
        ftpPort: "",
        ftpUserName: "",
        ftpPassword: "",
        fileLoc: "",
        catalogNodeCode: [],
        timeStylePos: [],
        compressed: "否",
        encrypted: "否",
        description: "",
        checkPass: ""
      };
      this.getCheckedCatalog();
    },
    getCheckedCatalog() {
      getUpLoadFilePathNodeCodes().then(res => {
        if (res.success) {
          this.checkedNodeCode = res.data || [];
          this.checkedNodeCode.forEach(val => {
            this.categoryList = this.categoryList.filter(
              item => item.id !== val
            );
          });
          this.dialogVisible = true;
        } else {
          this.$message.error(res.msg);
          this.checkedNodeCode = [];
        }
      });
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.isUpdate) {
            //如果是true 修改
            let params = deepClone(this.Form);
            params.timeStylePos = this.Form.timeStylePos.join("/");
            params.catalogNodeCode = this.Form.catalogNodeCode.join(",");
            params.storeId = this.storeId;
            updateUpLoadFilePath(params)
              .then(res => {
                this.dialogVisible = false;
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
            let params = deepClone(this.Form);
            params.timeStylePos = this.Form.timeStylePos.join("/");
            params.catalogNodeCode = this.Form.catalogNodeCode.join(",");
            creatUpLoadFilePath(params)
              .then(res => {
                this.dialogVisible = false;
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
        pageSize: 50,
        pageNum: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        storeType: "",
        fileLoc: "",
        encrypted: ""
      };
      this.currentPage = 1;
      this.pageSize = 20;
      this.initData();
    },
    handleWrite(row) {
      //修改
      this.isUpdate = true;

      this.storeId = row.storeId;
      this.Form = deepClone(row);
      if (this.Form.timeStylePos) {
        this.Form.timeStylePos = row.timeStylePos.split("/");
      } else {
        this.Form.timeStylePos = [];
      }
      if (row.catalogNodeCode) {
        this.Form.catalogNodeCode = row.catalogNodeCode.split(",");
      } else {
        this.Form.catalogNodeCode = [];
      }
      this.categoryList = this.getCategoryList(
        deepClone([this.$store.getters.tableViewTree]),
        []
      );
      getUpLoadFilePathNodeCodes().then(res => {
        if (res.success) {
          let listCode = res.data || [];
          this.Form.catalogNodeCode.forEach(t => {
            listCode = listCode.filter(val => val !== t);
          });
          this.checkedNodeCode = listCode;
          listCode.forEach(v => {
            this.categoryList = this.categoryList.filter(item => item.id != v);
          });

          this.dialogVisible = true;
        } else {
          this.$message.error(res.msg);
          this.checkedNodeCode = [];
        }
      });
    },

    handleDelete(row) {
      //删除
      this.storeId = row.storeId;
      this.$confirm("是否删除", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          deleteUpLoadFilePath({
            storeId: this.storeId
          })
            .then(res => {
              if (res.success) {
                this.$message.success("删除成功");
                this.initData();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(res => {
              this.$message.error(res.msg);
            });
        })
        .catch(() => {});
    },

    searchFunc(params) {
      params.storeType = this.searchForm.storeType;
      params.fileLoc = this.searchForm.fileLoc;
      params.encrypted = this.searchForm.encrypted;
      this.loading = true;
      getUpLoadFilePath(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
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
    initData() {
      let params = {
        pageSize: this.pageSize,
        pageNum: this.currentPage
      };
      this.searchFunc(params);
    },

    getCategoryList(data = [], res = []) {
      //获取所有的底层门类
      data.forEach(item => {
        if (item.children) {
          if (item.children.length > 0) {
            this.getCategoryList(item.children, res);
          }
        }
        if (item.li_attr.TYPE === "C") {
          res.push(item);
        }
      });
      return res;
    }
  },
  mounted() {
    this.initData();
    this.$store.dispatch("tree/tableViewTree").then(() => {
      this.categoryList = this.getCategoryList(
        deepClone([this.$store.getters.tableViewTree]),
        []
      );
    });
  },
  computed: {
    index() {
      return this.pageSize * (this.currentPage - 1);
    }
  }
};
</script>

