<!-- 小组审批 -->
<template>
  <section>
    <el-tabs v-model="activeName"  class="tablist" @tab-click="handleClick">
      <el-tab-pane label="全部" name="first"></el-tab-pane>
      <el-tab-pane label="待审核" name="second"></el-tab-pane>
      <el-tab-pane label="已审核" name="third"></el-tab-pane>
    </el-tabs>
    <el-col :span="24" class="content-header">
      <h3>数据筛选</h3>
      <div class="header-bot">
        <div class="item">
          <label for>题名：</label>
          <el-input size="small" type="text" placeholder="请输入题名" v-model="searchForm.maintitle" @keyup.enter.native="search"></el-input>
        </div>
        <div class="item">
          <label for>鉴定人：</label>
          <el-input size="small" type="text" placeholder="请输入鉴定人名称" v-model="searchForm.person" @keyup.enter.native="search"></el-input>
        </div>
         <div class="item">
          <label for>原保管期限：</label>
           <el-select v-model="searchForm.retentionold" size="small" clearable @change="search">
            <el-option value="永久" label="永久"></el-option>
            <el-option value="长期" label="长期"></el-option>
            <el-option value="短期" label="短期"></el-option>
            <el-option value="定期10年" label="定期10年"></el-option>
            <el-option value="定期30年" label="定期30年"></el-option>
          </el-select>
        </div>
        <el-button type="primary" size="small" @click="search" :loading="loading">查询</el-button>
        <el-button type="primary" size="small" @click="reset">重置</el-button>
      </div>
      <div class="header-bot" style="margin-top:-15px">
         <div class="item">
          <label for>鉴定日期：</label>
          <el-date-picker
            v-model="searchForm.judgedate"
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
        
      </div>
    </el-col>
    <el-col :span="24" style="background-color:#fff;margin-top:20px;min-height:500px;">
      <div class="tableTitle flex-spaceBetween">
        <div>数据列表</div>
        <div>
            <el-button type="primary" size="small" v-if="activeName =='second'">批量审核</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;" ref="tableBox">
        <el-table
          :data="gridData"
          border
          header-row-class-name='thClassName'
          v-loading="loading"
          tooltip-effect="dark"
          :span-method="objectSpanMethod"
        >
          <el-table-column label="序号" align="center"  width="55">
            <template slot-scope="scope">{{scope.$index+1+index}}</template>

          </el-table-column>
          <el-table-column label="鉴定人" align="center" prop="person" ></el-table-column>
          <el-table-column label="鉴定日期" align="center" prop="judgedate">
            <template slot-scope="scope">
              <span>{{new Date(scope.row.judgedate).format('yyyy-MM-dd')}}</span>
            </template>
          </el-table-column>
          <el-table-column label="所属部门" align="center" prop="responsibleby"></el-table-column>
          <el-table-column label="题名" align="center" prop="maintitle" min-width="200"></el-table-column>
          <el-table-column label="原保管期限" align="center" prop="retentionold"></el-table-column>
          <el-table-column label="鉴定意见" align="center" prop="opinion"></el-table-column>
          <el-table-column label="状态" align="center">
           <template slot-scope="scope">
              <span>{{scope.row.isjudge==="T" ?'已审核':"待审核"}}</span>
            </template>
          </el-table-column>
          <el-table-column property="set" label="操作" align="center" width="100" fixed="right">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="primary"
                @click="handleRead(scope.row)"
                v-if="scope.row.status==1"
              >审核</el-button>
              <el-button
                size="mini"
                type="success"
                @click="handleRead(scope.row)"
                v-else
              >查看</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="prev, pager, next,sizes"
          :total="total"
          @size-change="handleSizeChange"
          :page-sizes="[20,50,100]"
          :page-size="pageSize"
          :current-page="currentPage"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-col>
  </section>
</template>
<script>
import { retrieveFirstDestroyJudgeOpinionMsg } from '@/api/judge';
import { Base64 } from 'js-base64';

export default {
  data() {
    return {
      activeName: "first",
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
      loading: false,
      gridData: [
        
      ],
      pageSize: 50,
      currentPage: 1,
      total: 0,
     
      searchForm: {
        //搜索的表单
        maintitle: "",
        judgedate:[],
        person:"",
        retentionold:""
      },
      spanArr:[]
    };
  },
  methods: {
    handleClick() {
      this.initData();
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
       if(columnIndex!==4){
          const _row = this.spanArr[rowIndex]
          const _col = _row>0?1:0;
          return{
                rowspan:_row,
                colspan:_col                  
              }
      }
    },
    handleData(){
      let contactDot = 0;
      this.gridData.forEach((item,index) => {
          item.index = index;
          if(index === 0){
              this.spanArr.push(1);
          }else{
              if(item.destroyjudgeopinionNumber === this.gridData[index - 1].destroyjudgeopinionNumber){
                  this.spanArr[contactDot] +=1;
                  this.spanArr.push(0);
              }else{
                  this.spanArr.push(1);
                  contactDot = index;
              }
          }
      })
    },
    handleRead(row) {
      //查看信息
      this.$router.push({
        path: "/readAppraisal",
        query:{
          num:Base64.encode(row.destroyjudgeopinionNumber),
          title:Base64.encode( row.isjudge ==="T" ?"查看":"审核"),
          audit:Base64.encode(false)
        }
      });
    },
     searchFunc(params) {
      params.maintitle = this.searchForm.maintitle;
      params.person = this.searchForm.person;
      params.retentionold = this.searchForm.retentionold;
      if(this.activeName =="second"){ //tab切换 待审核已审核
        params.isjudge =  'F'
      }else if(this.activeName =="third"){
        params.isjudge = 'T' 
      }else{
        params.isjudge = ''
      }
      if( this.searchForm.judgedate && this.searchForm.judgedate.length>0){
        params.judgedate = this.searchForm.judgedate[0]
        params.endJudgedate = this.searchForm.judgedate[1]
      }
      this.loading = true;
      retrieveFirstDestroyJudgeOpinionMsg(params)
        .then(res => {
          this.loading = false;
          if (res.success) {
            this.gridData = res.data.list || [];
            this.total = res.data.total || 0;
            this.currentPage = res.data.pageNum;
            this.pageSize = res.data.pageSize;
            this.spanArr = [];
            this.handleData();
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
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
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
    search() {
      let params = {
        limit: 50,
        star: 1
      };
      this.searchFunc(params);
    },
    reset() {
      this.searchForm = {
        maintitle:"",
        person:"",
        retentionold:"",
        judgedate:[]
      };
      this.currentPage = 1;
      this.pageSize = 50;
      this.initData();
    },
    
  },
  mounted() {
    this.initData();
  },
  computed:{
    index(){
      return this.pageSize * (this.currentPage - 1);
    }
  },
  

};
</script>
<style lang="scss" scoped>

</style>




