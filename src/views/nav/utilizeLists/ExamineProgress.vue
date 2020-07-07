<!-- 审核 -->
<template>
  <section>
    <el-col :span="24" class="content-header">
      <h3>借阅条目信息</h3>
    </el-col>
    <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px 15px;">
      <div class="listitem">
        <div class="tableTitle">
          <div>
            <i class="el-icon-collection-tag"></i>授权处理信息
          </div>
        </div>
        <div style="padding:0 15px">
          <el-table
            :data="gridData"
            border
            header-row-class-name='thClassName'
            v-loading="loading"
            tooltip-effect="dark"
            :cell-class-name="cellClass"
          >
            <el-table-column label="单号" align="center" :show-overflow-tooltip="true" prop="NAME"></el-table-column>
            <el-table-column label="题名" align="center" :show-overflow-tooltip="true" prop="NAME"></el-table-column>
            <el-table-column
              label="申请人"
              align="center"
              :show-overflow-tooltip="true"
              prop="EMULATIONSHOW"
            ></el-table-column>
            <el-table-column
              label="借阅类型"
              align="center"
              :show-overflow-tooltip="true"
              prop="EMULATIONSHOW"
            ></el-table-column>
            <el-table-column
              label="借阅时间"
              align="center"
              :show-overflow-tooltip="true"
              prop="EMULATIONSHOW"
            ></el-table-column>
            <el-table-column
              label="借阅单详情"
              align="center"
            >
            <template>
                <el-button type="text" @click="$router.push('/borrowingDetails')">查看详情</el-button>
            </template>
            </el-table-column>
             <el-table-column
              label="是否同意授权"
              align="center"
            >
            <template>
                <el-select placeholder="是否授权" size="mini" v-model="form.nam">
                    <el-option label="同意" value="同意"></el-option>
                    <el-option label="拒绝" value="拒绝"></el-option>
                </el-select>
            </template>
            </el-table-column>
            <el-table-column
              label="理由"
              align="center"
              :show-overflow-tooltip="true"
              prop="EMULATIONSHOW"
            >
            <template>
                <el-input type="textarea" size="mini" v-model="form.nam"></el-input>
            </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
        <div class="textCenter">
            <el-button type="primary">提交</el-button>
            <el-button>重置</el-button>
        </div>
    </el-col>
  </section>
</template>
<script>
export default {
  data() {
    return {
      searchForm: {
        //搜索的表单
        searial: "",
        title: "",
        remark: ""
      },
      form: {
        name: "qq"
      },
      gridData: [
          {
              NAME:"111",
              EMULATIONSHOW:"1212"
          }
      ],
      oldData: [],
      loading: false,
      isSearch: false
    };
  },
  methods: {
    cellClass({ row, rowIndex }) {
      
    //   if (row.address.length > 1) {
    //     return "nopadding";
    //   } else {
    //     return "";
    //   }
    },

    search() {
      let data = {};
      for (let i in this.searchForm) {
        if (this.searchForm[i] != "" && i != "selectedOptions") {
          data[i] = this.searchForm[i];
        }
      }
      if (JSON.stringify(data) == "{}") {
        return;
      } else {
        this.loading = true;
        this.isSearch = true;
      }
    },
    reset() {
      this.isSearch = false;
      this.searchForm = {};

      this.gridData = this.oldData;
    },
    getList() {
      // this.loading = true;
    },
    addData() {}
  },
  mounted() {
    this.getList();
  },
  components: {
  
  }
};
</script>
<style lang="scss" scoped>
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
.pagina {
  margin: 15px 0px;
}
.textCenter{
    margin-top: 100px;
}
</style>


