<template>
  <section>
    <el-row>
      <el-col :span="5" class="content-left">
        <Tree></Tree>
      </el-col>
      <el-col :span="19" class="content-right">
        <div style="padding:15px;border:1px solid #eee;position:relative;" class="clearboth">
          <el-col :span="18">
            <el-form ref="form" :model="form" label-width="90px" inline size="small">
              <el-col :span="24">
                <el-form-item label="密级" class="inline">
                  <el-select v-model="form.name" placeholder="公开" class="input">
                    <el-option label="公开" value="shanghai"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="年度" class="inline">
                  <el-date-picker v-model="form.name" class="input" type="date"></el-date-picker>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="部门" class="inline">
                  <el-select v-model="form.name" placeholder="公开" class="input">
                    <el-option label="部门" value="shanghai"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="文号" class="inline">
                  <el-input v-model="form.name" class="input"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="全宗" class="inline">
                  <el-input v-model="form.name" class="input"></el-input>
                </el-form-item>
                <el-form-item label="题名" class="inline">
                  <el-input v-model="form.name" class="input"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="保管期限" class="inline">
                  <el-input v-model="form.name" class="input"></el-input>
                </el-form-item>
                <el-form-item label="实体分类号" class="inline">
                  <el-input v-model="form.name" class="input"></el-input>
                </el-form-item>
              </el-col>
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-col :span="12">
              <el-button
                type="primary"
                icon="el-icon-search"
                size="small"
                class="btn"
                :loading="false"
              >查询</el-button>
              <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="setdialogVisible = true"
              >设置查询项</el-button>
              <el-button
                type="primary"
                size="small"
                plain
                class="btn"
                @click="HighdialogVisible = true"
              >高级查询</el-button>
              <el-button type="primary" size="small" plain class="btn" @click="relationSearch">关联查询</el-button>
            </el-col>
            <el-col :span="12">
              <el-button type="primary" size="small" plain @click="resetForm('form')" class="btn">重置</el-button>
            </el-col>
          </el-col>
          <!-- <el-button  class="slideup" size="mini" @click="flag = true" v-show="!flag">收起</el-button>
          <el-button  class="slideup" size="mini" @click="flag = false" v-show="flag">展开</el-button>-->
        </div>
        <div style="margin:20px 0;">
          <el-button-group>
            <el-button plain>门类树</el-button>
            <el-button plain>排序</el-button>
          </el-button-group>
        </div>
        <div class="clearboth">
          <el-table
            :data="gridData"
            border
            header-row-class-name="thClassName"
            style="border:1px solid #f2f2f2;"
          >
            <el-table-column property="serial" label="序号" align="center"></el-table-column>
            <el-table-column property="num" label="编号" align="center"></el-table-column>
            <el-table-column property="title" label="题名"></el-table-column>
            <el-table-column property="length" label="文件长度" align="center"></el-table-column>
            <el-table-column property="userNum" label="用户编号" align="center"></el-table-column>
            <el-table-column property="date" label="上载时间" align="center"></el-table-column>
            <el-table-column property="set" label="操作" align="center">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="el-icon-document"
                  @click="handleClick(scope.row)"
                >查看</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            class="pull-right pagina"
            background
            layout="prev, pager, next"
            :total="1000"
          ></el-pagination>
        </div>
      </el-col>
    </el-row>

    <!-- 设置查询项 -->
    <el-dialog
      title="设置查询项"
      :visible.sync="setdialogVisible"
      width="600px"
      custom-class="setdialogBox"
    >
      <el-transfer
        filterable
        :filter-method="filterMethod"
        filter-placeholder="请输入城市拼音"
        v-model="value2"
        :data="data2"
      ></el-transfer>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setdialogVisible = false">保存</el-button>
      </span>
    </el-dialog>

    <!-- 高级搜索 -->
    <el-dialog
      title="高级搜索"
      :visible.sync="HighdialogVisible"
      width="840px"
      custom-class="highdialogBox"
    >
      <el-button type="primary" plain size="medium" style="margin-bottom:15px;">新增条件</el-button>
      <div>
        <el-table border style="width: 100%">
          <el-table-column align="center" prop="date" label="查询项选择"></el-table-column>
          <el-table-column align="center" prop="name" label="关系操作"></el-table-column>
          <el-table-column align="center" prop="address" label="查询值"></el-table-column>
          <el-table-column align="center" prop="address2" label="逻辑操作"></el-table-column>
          <el-table-column align="center" prop="address3" label="操作">
            <template slot-scope="scope">
              <el-button @click="delClick(scope.row)" type="text" size="small">删除条件</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="HighdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="HighdialogVisible = false">保存</el-button>
      </span>
    </el-dialog>
  </section>
</template>

<script>
import Tree from "../../search/Tree";
export default {
  data() {
    return {
      // flag:true,
      setdialogVisible: false, //设置查询项变量,
      HighdialogVisible: false, //高级搜索
      form: {
        name: ""
      },
      gridData: [
        {
          serial: 1,
          num: 200000,
          date: "2016-05-02",
          title: "王小虎",
          length: 20,
          userNum: 111111
        },
        {
          serial: 2,
          num: 200000,
          length: 20,
          date: "2016-05-04",
          title: "王小虎",
          userNum: 111111
        },
        {
          length: 20,
          serial: 3,
          num: 200000,
          date: "2016-05-01",
          title: "王小虎",
          userNum: 111111
        },
        {
          serial: 4,
          length: 20,
          num: 200000,
          date: "2016-05-03",
          title: "王小虎",
          userNum: 111111
        }
      ],
      value2: [],
      filterMethod(query, item) {
        return item.pinyin.indexOf(query) > -1;
      }
    };
  },
  methods: {
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    handleClick(row) {
      //查看原文
      this.$router.push({ path: "/searchContent" });
    },
    relationSearch() {
      //关系查询
      this.$prompt("输入查询：", "关系查询", {
        confirmButtonText: "查询",
        cancelButtonText: "取消",
        inputValue: "公司名称/联系人",
        customClass: "prompt-box"
      }).then(({ value }) => {});
    },
    delClick(rwo) {
      //删除条件
    }
  },
  components: {
    Tree
  }
};
</script>
<style scoped lang="scss">
@import "../../../styles/vars";

section {
  background-color: #fff;
  overflow: hidden;
  // min-height: 500px;
  box-sizing: border-box;
  .content-left {
    min-height: 500px;
  }
  .content-right {
    padding: 20px;
    min-height: 500px;
    border-left: 1px solid #ccc;
    .slideup {
      position: absolute;
      bottom: -18px;
      left: 50%;
      border: none;
      margin: 0;
    }
    .inline {
      display: inline-block;
      .input {
        width: 180px;
      }
    }
    .btn {
      margin-bottom: 18px;
      text-align: center;
      margin-left: 0;
    }
    .pagina {
      margin: 15px 0px;
    }
  }
}
</style>

<style lang="scss">
.highdialogBox {
  .el-dialog__body {
    padding: 15px 20px;
  }
}
</style>


