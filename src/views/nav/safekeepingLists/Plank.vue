<template>
  <section>
    <!-- <h3>库房：1，密集柜：2，第一列第一层</h3> -->
    
    <el-col :span="24" style="background-color:#fff;min-height:500px;">
      
      <div class="tableTitle flex-spaceBetween" style="border-bottom:1px solid #ccc">
        <div>数据列表 （ {{`第${column}列第${row}层`}} ）</div>
        <div>
          <el-button size="small" type="primary" @click="addData">新建</el-button>
        </div>
      </div>
      <div style="padding:0 15px 100px 15px;">
        <div class="tableItem clearboth" v-for="(item,index) in this.gridDataList" :key="item.cellArchiveId">
          <div class="flex-spaceBetween">
            <p style="color:#409bff;font-size:16px">{{item.description}}</p>
            <div>
              <!-- <el-button size="small">添加</el-button> -->
              <el-button size="small" @click="deleteItem(item.cellArchiveId)">下架</el-button>
            </div>
          </div>
          <el-table
            :data="item.archives.list"
            border
            header-row-class-name='thClassName'
            v-loading="loadingList[index]"
            tooltip-effect="dark"
          >
            <el-table-column type="selection" width="55" align="center"></el-table-column>
          <el-table-column label="序号" align="center" width="80px">
            <template slot-scope="scope">{{(scope.$index)+1+getIndex(pageSizeList[index],currentPageList[index])}}</template>
          </el-table-column>
          <el-table-column label="档号"  prop="ARCHIVENO" width="200">
             <template slot-scope="scope">
              <span>{{scope.row.ARCHIVENO||scope.row.FOLDERNO}}</span>
            </template>
          </el-table-column>
          <el-table-column label="题名"  prop="MAINTITLE"></el-table-column>
        </el-table>
        <el-pagination
          class="pull-right pagina"
          background
          layout="total, prev, pager, next,sizes"
          :total="totalList[index]"
          @size-change="handleSizeChange($event,index)"
          :page-sizes="[2,50,100]"
          :page-size="pageSizeList[index]"
          :current-page="currentPageList[index]"
          @current-change="handleCurrentChange($event,index)"
        ></el-pagination>
        </div>
        <div class="tableItem clearboth" v-show="this.cellArchiveIdList.length==0">
           <div class="flex-spaceBetween">
            <p><el-link type="primary" @click="addData" style="font-size:16px">暂无上架记录，点击按钮新建</el-link></p>
          </div>
          </div> 
      </div>
    </el-col>
   
  </section>
</template>
<script>
import { Base64 } from 'js-base64';

import merge from 'webpack-merge'
import {deepQuery,deepClone} from '@/common/js/util'
import {retrieveCell,deleteCellArchive} from '@/api/storeRoom'
export default {
  name:"plank",
  inject:['reload'],
  data() {
    return {
      cellId:"",//阁子id
      column:"",//阁子列
      row:"",//阁子层
      classType:"",//档案门类
      classData:[],//全部底层门类
      dialogVisible: false,
      loadingList: [],
      paginationList:[],//分页集合
      gridDataList:[],//数据集合
      totalList:[],//总数集合集合
      currentPageList:[],//第几页集合
      pageSizeList:[],//一页多少个集合
      cellArchiveIdList:[] //上架的集合id
     
    };
  },
  methods: {
    handleSizeChange(val,index) {
      //当前显示多少条
      this.currentPageList[index] = 1;
      this.pageSizeList[index] = val;
      this.searchTableData(index);
    },
    handleCurrentChange(val,index) {
      //当前页码
      this.currentPageList[index] = val;
      this.searchTableData(index);
    },
    searchTableData(index){
      this.loadingList[index] = true;
      let params = {
        limit:this.pageSizeList[index],
        star:this.currentPageList[index],
        cellArchiveId:this.cellArchiveIdList[index]
      }
      retrieveCell(params)
        .then(res => {
          this.$set(this.loadingList,index,false)
          if (res.success) {
            this.$set(this.gridDataList,index,res.data|| [])
            this.$set(this.totalList,index,res.data.archives.total||0)
          } else {
           this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loading = false;
        });
    },
    addData() {
      //添加
      this.$router.push({
        name:"addFile",
        query:{
          cellId:Base64.encode(this.cellId),
          column:Base64.encode(this.column),
          row :Base64.encode(this.row),
          classType:Base64.encode(this.classType)
        }
      })
    },
    deleteItem(id,index){
       this.$confirm(
        "是否下架",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(()=>{
        deleteCellArchive({cellArchiveId:id}).then(res=>{
          if(res.success){
            this.$message.success('下架成功');
            this.cellArchiveIdList.splice(this.cellArchiveIdList.findIndex(item=>item ==id),1)
            this.$router.replace({
              query:merge(this.$route.query,{cellArchiveIdList:this.cellArchiveIdList.length>0?Base64.encode(this.cellArchiveIdList.join()):''})
            })
            this.reload();
          }else{
            this.$message.error(res.msg)
          }
        })
      }).catch(()=>{})
    },
   
    initData() {
      if(this.cellArchiveIdList.length>0){
        this.cellArchiveIdList.forEach((item,index)=>{
          this.currentPageList.push(1);
          this.pageSizeList.push(50);
          this.loadingList.push(false);
          let params = {
            limit:50,
            star:1,
            cellArchiveId:item
          }
          this.searchFunc(params,index)
        })
      }
    },
    searchFunc(params,index){
      this.loadingList[index] = true;
      this.gridDataList = [];
      this.totalList = []
      retrieveCell(params)
        .then(res => {
          this.loadingList[index] = false;
          if (res.success) {
              this.gridDataList.push(res.data|| []);
              this.totalList.push(res.data.archives.total);
          } else {
           this.$message.error(res.msg);
          }
        })
        .catch(res => {
          this.loadingList[index] = false;
        });
    },
    getClassData(){ //获取待选的档案中间门类列表
      let data = []
      this.$store.dispatch('tree/tableViewTree').then(res=>{
          data = deepQuery([res],this.classType,data);
          this.classData =  this.getCategoryList(deepClone(data[0].children),[])
      });
    },
    getCategoryList(data = [],res = []){ //获取所有的底层门类
      data.forEach(item=>{
        if(item.children.length>0){
          this.getCategoryList(item.children,res)
          if(item.li_attr.TYPE === 'C'){
            res.push(item)
          }
        }
      })
      return res;
    },
    getIndex(pageSize,currentPage){
      return pageSize * (currentPage - 1);
    }
  },
  mounted() {
   
    // this.getClassData();//获取可选的档案底层门类
    this.cellId = Base64.decode(this.$route.query.cellId);
    this.column = Base64.decode(this.$route.query.column);
    this.row = Base64.decode(this.$route.query.row);
    this.classType = Base64.decode(this.$route.query.classType);
    let list = Base64.decode(this.$route.query.cellArchiveIdList).split(',')
    if(list[0]==''){
      this.cellArchiveIdList = [];
    }else{
      this.cellArchiveIdList = list;
    }
    this.initData();
  },
 
};
</script>




