<template>
  <!-- 档号组成项 -->
  <section>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for style="width:120px">输入档案门类：</label>
          <el-input
            size="small"
            type="text"
            placeholder="请输入门类名称"
            v-model="keywords"
            @keyup.enter.native="search"
          ></el-input>
        </div>
        <el-button type="primary" size="small" @click="search">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle">
        <div>数据列表</div>
        <div></div>
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
            <template slot-scope="scope">{{scope.$index+1}}</template>
          </el-table-column>
          <el-table-column
            label="档案门类名称"
            align="center"
            :show-overflow-tooltip="true"
            min-width="20%"
            prop="NAME"
          ></el-table-column>
          <el-table-column
            label="仿真显示"
            align="center"
            :show-overflow-tooltip="true"
            min-width="40%"
            prop="EMULATIONSHOW"
          ></el-table-column>
          <el-table-column property="set" label="操作" align="center" width="200" fixed="right">
            <template slot-scope="scope">
              <el-button size="mini" type="success" @click="handleWithdraw(scope.row.ENTITYCODE)">明细</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-col>

    <!-- 修改档号格式 -->
    <el-dialog
      title="修改档号格式"
      :visible.sync="dialogFormVisible1"
      custom-class="addDhao"
      width="850px"
    >
      <div class="title">
        <div>
          <p>{{editTitle}}</p>
        </div>
        <div>
          <el-button type="primary" size="small" plain @click="setdialogVisible = true">档号项设置</el-button>
          <el-button type="primary" size="small" @click="add">添加</el-button>
        </div>
      </div>
      <el-table
        border
        header-row-class-name="thClassName"
        :data="entiyList"
        max-height="375"
        style="min-height:150px;max-height:400px;"
      >
        <el-table-column type="index" label="序号" width="55" align="center"></el-table-column>
        <el-table-column label="档号组成项" align="center" property="set">
          <template slot-scope="scope">
            <el-select size="small" v-model="scope.row.columnName">
              <el-option
                :label="item.chineseName"
                :value="item.name"
                v-for="(item,key) in selectCoumnList"
                :key="key"
              ></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column label="长度" align="center" :show-overflow-tooltip="true" property="set">
          <template slot-scope="scope">
            <el-input type="text" v-model="scope.row.lenth"></el-input>
          </template>
        </el-table-column>
        <el-table-column label="分隔符" align="center" property="set">
          <template slot-scope="scope">
            <el-select v-model="scope.row.separator" size="small">
              <el-option label="-" value="-"></el-option>
              <el-option label="*" value="*"></el-option>
              <el-option label="/" value="/"></el-option>
              <el-option label="+" value="+"></el-option>
              <el-option label="`" value="`"></el-option>
              <el-option label="." value="."></el-option>
              <el-option label="^" value="^"></el-option>
              <el-option label="~" value="~"></el-option>
              <el-option label="@" value="@"></el-option>
              <el-option label="空" value></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column property="set" label="操作" align="center" width="100" fixed="right">
          <template slot-scope="scope">
            <el-button size="mini" type="text" @click="deletedraw(scope.$index,scope.row)">删除行</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible1 = false">取 消</el-button>
        <el-button
          type="primary"
          @click="saveData"
          :disabled="$is_disabled(['formatDefinition-edit']) ? false : true"
        >确 定</el-button>
      </div>
    </el-dialog>
    <!-- 设置查询项 -->
    <el-dialog
      title="设置查询项"
      :visible.sync="setdialogVisible"
      width="600px"
      custom-class="setdialogBox"
      v-if="setdialogVisible"
    >
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入字段中文名名"
        v-model="checkedCoumnListKey"
        @left-check-change="((a,b)=>{changeLeftTransfer(a,b,checkedCoumnListKey)})"
        @right-check-change="((a,b)=>{changeRightTransfer(a,b,checkedCoumnListKey)})"
        :data="tableList"
        :props="{
          key: 'NAME',
          label: 'CHINESENAME'
        }"
        :titles="['待添加', '已选']"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveChecked">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>
<script>
import {
  getSystemNoFormatList,
  getSystemNoFormatListByEntityCode,
  getSystemNoFormatColumnsByEntityCode,
  addSystemNoFormat,
  updateSystemNoItemByEntityCode,
  retrieveSystemNoItemByEntityCode
} from "@/api/archiveNoformat";
export default {
  data() {
    return {
      filterMethod(query, item) {
        return item.CHINESENAME.indexOf(query) > -1;
      },
      setdialogVisible: false,
      checkedCoumnListKey: [], //已选择的key
      selectCoumnList: [], //已选择的对象
      dialogFormVisible1: false,

      entiyList: [],
      entityCode: "",
      loading: false,
      keywords: "",
      tableList: [],
      gridData: [], //渲染表格数据
      oldList: [] //初始化数据,
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
    saveData() {
      if (this.entiyList.length > 0) {
        let params = [];

        let flag = true;
        let find = false;
        for (var i = 0; i < this.entiyList.length; i++) {
          for (var j = i + 1; j < this.entiyList.length; j++) {
            if (this.entiyList[i].columnName == this.entiyList[j].columnName) {
              find = true;
              break;
            }
          }
          if (find) break;
        }
        if (find) {
          this.$message.warning("档号组成项不能相同");
          return;
        }
        this.entiyList.forEach((item, index) => {
          if (item.columnName == "") {
            this.$message.warning("请选择字段");
            flag = false;
            return;
          }
          if (item.lenth == "") {
            this.$message.warning("请填写字段长度");
            flag = false;
            return;
          }
          this.selectCoumnList.forEach(newitem => {
            if (newitem.name == item.columnName) {
              item.chineseName = newitem.chineseName;
            }
          });

          item.emulationShow = "";
          this.entiyList.forEach((val, index) => {
            item.emulationShow += `${val.chineseName}(${val.lenth})${val.separator}`;
          });
          item.emulationShow = item.emulationShow.slice(
            0,
            item.emulationShow.length - 1
          );
          item.no = index + 1;
          params.push(item);
        });
        let lastName = this.entiyList[this.entiyList.length - 1].columnName;
        if (lastName != "pieceNo" && lastName != "quantity") {
          this.$message.warning("档号组成项末项必须为件号或页数");
          return;
        }
        if (flag) {
          addSystemNoFormat(params)
            .then(res => {
              this.dialogFormVisible1 = false;
              if (res.success) {
                this.$message.success("添加成功");
                sessionStorage.removeItem("tableViewTreeStr");
                this.$store.dispatch("tree/tableViewTree");
                this.$store.dispatch(
                  "permission/del_cachedViews",
                  "archivesDescription"
                ); //添加缓存组件
                this.getList();
              } else {
                this.$message.error(res.msg);
              }
            })
            .catch(err => {
              this.dialogFormVisible1 = false;
            });
        }
      } else {
        this.$message.warning("请添加档号组成项");
      }
    },
    saveChecked() {
      let saveCheckedParam = {
        columnName: [],
        entityCode: "",
        chineseNames: []
      }; //保存设置项
      this.selectCoumnList = [];
      this.checkedCoumnListKey.forEach(val => {
        let obj = this.tableList.find(t => t.NAME === val);
        if (obj) {
          this.selectCoumnList.push({
            chineseName: obj.CHINESENAME,
            name: obj.NAME
          });
        }
      });
      saveCheckedParam.entityCode = this.entiyList[0].entityCode;
      this.selectCoumnList.forEach(val => {
        saveCheckedParam.columnName.push(val.name);
        saveCheckedParam.chineseNames.push(val.chineseName);
      });
      saveCheckedParam.columnName = saveCheckedParam.columnName.join();
      saveCheckedParam.chineseNames = saveCheckedParam.chineseNames.join();
      updateSystemNoItemByEntityCode(saveCheckedParam).then(res => {
        if (res.success) {
          this.$message.success("保存设置项成功");
        } else {
          this.$message.error("保存设置项失败");
        }
      });
      this.setdialogVisible = false;
    },

    add() {
      this.entiyList.push({
        chineseName: "",
        columnName: "",
        emulationShow: "",
        entityCode: this.entityCode,
        lenth: "4",
        no: this.entiyList.length + 1,
        noFormatCode: "",
        separator: "-"
      });
    },
    search() {
      if (this.keywords == "") {
        this.$message.warning("请输入");

        return;
      }
      let words = this.keywords;

      this.gridData = this.oldList.filter(item => {
        if (item.NAME.indexOf(words) > -1) {
          return true;
        }
      });
    },
    reset() {
      this.keywords = "";
      this.gridData = this.oldList;
    },

    handleWithdraw(ENTITYCODE) {
      //明细
      this.checkedCoumnListKey = [];
      this.selectCoumnList = [];
      this.dialogFormVisible1 = true;
      this.entityCode = ENTITYCODE;
      this.getListByEntityCode(ENTITYCODE);
      getSystemNoFormatColumnsByEntityCode({ entityCode: ENTITYCODE })
        .then(res => {
          if (res.success) {
            if (res.data.length > 0) {
              this.tableList =
                res.data.filter(item => item.NAME != "null") || [];
            } else {
              this.tableList = [];
            }
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch(() => {});
    },
    getListByEntityCode(ENTITYCODE) {
      retrieveSystemNoItemByEntityCode({ entityCode: ENTITYCODE }).then(res => {
        let checkedArr = [];
        if (res.success) {
          checkedArr = res.data;
          getSystemNoFormatListByEntityCode({ entityCode: ENTITYCODE })
            .then(res => {
              if (res.success) {
                if (res.data.length > 0) {
                  this.entiyList = res.data || [];
                  this.entiyList.forEach(item => {
                    this.checkedCoumnListKey.push(item.columnName);
                    this.selectCoumnList.push({
                      chineseName: item.chineseName,
                      name: item.columnName
                    });
                    item.separator = item.separator || "";
                  });
                  checkedArr.forEach(t => {
                    if (!this.checkedCoumnListKey.includes(t.columnname)) {
                      this.checkedCoumnListKey.push(t.columnname);
                      this.selectCoumnList.push({
                        chineseName: t.chineseName,
                        name: t.columnname
                      });
                    }
                  });
                } else {
                  this.entiyList = [];
                  this.checkedCoumnListKey = [];
                  this.selectCoumnList = [];
                }
              }
            })
            .catch(err => {});
        } else {
          this.$message.error("获取档号设置项失败");
        }
      });
    },
    deletedraw(index) {
      this.entiyList.splice(index, 1);
    },
    getList() {
      this.loading = true;
      getSystemNoFormatList()
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data || [];
            this.oldList = res.data || [];
          }
        })
        .catch(err => {
          this.loading = false;
        });
    }
  },
  mounted() {
    this.getList();
  },
  computed: {
    editTitle() {
      let entityCodeObj = this.gridData.find(
        item => item.ENTITYCODE === this.entityCode
      );
      if (entityCodeObj) {
        return entityCodeObj.NAME;
      } else {
        return "";
      }
    }
  }
};
</script>
<style lang="scss">
.addDhao {
  /deep/ .el-dialog__body {
    padding: 0 20px;
  }
  .title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    margin-bottom: 10px;
    p {
      font-size: 18px;
      font-weight: 700;
      color: #666;
    }
  }
}
</style>
