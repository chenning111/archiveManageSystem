<template>
  <section>
    <el-col :span="24" style="background-color:#fff;min-height:500px;" v-loading="loading">
      <div class="tableTitle">
        <div>库房管理</div>
      </div>
      <div class="flex-wrap house border">
        <div 
        class="textCenter houseItem"
         v-for="houseItem in houseData" 
         :key="houseItem.storeroomId" 
         @click.stop="checkedHouse(houseItem)" 
         :title="houseItem.storeroomAddress">
          <p :style="houseCode == houseItem.storeroomId?checkedColor:''">
            <!-- <i class="el-icon-s-home"></i> -->
            <i class="iconfont icon-Dkufang"></i>

          </p>
          <p>{{houseItem.storeroomCode}}</p>
          <p>{{houseItem.storeroomAddress}}</p>
          <div class="edit">
            <el-button type="primary" plain icon="el-icon-edit" size="mini" @click.stop="updateHouse(houseItem)" title="修改"></el-button>
            <el-button type="primary" plain icon="el-icon-delete" size="mini" @click.stop="deleteHouse(houseItem.storeroomId)" title="删除"></el-button>
          </div>
        </div>
        
        <div class="textCenter houseItem" @click.stop="addHouse">
          <p class="add">
            <i class="el-icon-circle-plus-outline"></i>
          </p>
        </div>
      </div>
      <div class="flex-wrap fold border" v-if="houseData.length>0">
        <div class="textCenter foldItem clearBoth"  
        v-for="foldItem in foldData"
         :key="foldItem.shelfId" 
         @click="checkedFold(foldItem)" 
         :style="foldCode == foldItem.shelfId?checkedColor:''"
         
         >
          <div class="left pull-left" :title="getFoldName(foldItem.leftClassType)">
            <p>{{ getFoldName(foldItem.leftClassType )}}</p>
            <p>{{foldItem.shelfCode}}</p>
            <p>
              <i class="el-icon-orange"></i>
            </p>
            <p>左侧</p>
          </div>
          <div class="right pull-left" :title="getFoldName(foldItem.rightClassType)">
            <p>{{getFoldName(foldItem.rightClassType)}}</p>
            <p>{{foldItem.shelfCode}}</p>
            <p>
              <i class="el-icon-orange"></i>
            </p>
            <p>右侧</p>
          </div>
          <div class="edit">
            <el-button type="primary" plain icon="el-icon-edit" size="mini" @click.stop="updateFold(foldItem)" title="修改"></el-button>
            <el-button type="primary" plain icon="el-icon-delete" size="mini" @click.stop="deleteFold(foldItem.shelfId)" title="删除"></el-button>
          </div>
        </div>
        
        <div class="textCenter foldItem clearBoth" @click="addFold">
          <p class="add">
            <i class="el-icon-circle-plus-outline"></i>
          </p>
        </div>
      </div>
      <div class="border">
        <el-tabs v-model="foldPosition" @tab-click="handlePosition">
          <el-tab-pane label="左侧" name="L"></el-tab-pane>
          <el-tab-pane label="右侧" name="R"></el-tab-pane>
        </el-tabs>
        <div class="file">
          <div class="fileItem" v-for="item in cellData" :key="item.column">
            <div class="item" @click="handlePlank(cell)" v-for="cell in item.listInfo" :key="cell.cellId">
              <p>
                <span>{{cell.cellColumn+'-'+cell.cellRow}}</span>（{{`第${cell.cellColumn}列第${cell.cellRow}层`}}）
              </p>
              <div>
                <p v-for="des in cell.archiveMsg" :key="des.cellArchiveId">{{des.description}}</p>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </el-col>
     <!-- 验证登录 -->
    <el-dialog 
      title="修改提示"
      :visible.sync="loginDialog"
      width="500px"
      custom-class="foldClassName"
     >
     <p style="color:#333;font-weight:700;font-size:14px;margin:20px 0 20px 40px">验证账户后修改</p>
     <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="70px" @submit.native.prevent>
       <!-- <el-form-item prop="account" label="账号：">
          <el-input type="text" v-model="loginForm.account" auto-complete="on" placeholder="账号"  name="account"></el-input>
        </el-form-item> -->
        <el-form-item prop="checkPass" label="密码：">
          <el-input
            type="password"
            v-model="loginForm['checkPass']"
            auto-complete="on"
            placeholder="密码"
            show-password
            clearable
            name="checkPass"
            @keyup.enter.native="checkLogin('loginForm')"
          ></el-input>
        </el-form-item>
        
     </el-form>
     <div slot="footer" class="dialog-footer">
        <el-button @click="loginDialog = false">取 消</el-button>
        <el-button type="primary" @click="checkLogin('loginForm')">验 证</el-button>
      </div>
     </el-dialog>
    <!-- //添加修改库房 -->
    <el-dialog 
      :title="isUpdateHouse?'修改库房':'添加库房'"
      :visible.sync="houseDialog"
      width="600px"
     >
     <el-form :model="houseForm" :rules="houseRules" ref="houseForm" label-width="100px" >
       <el-form-item label="库房编号：" prop="id">
         <el-input type="text" v-model.number="houseForm.id"></el-input>
       </el-form-item>
        <el-form-item label="库房说明：" prop="address">
         <el-input type="text" v-model="houseForm.address"></el-input>
       </el-form-item>
     </el-form>
     <div slot="footer" class="dialog-footer">
        <el-button @click="houseDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitHouse('houseForm')">确定</el-button>
      </div>
     </el-dialog>
     <!-- //添加修改密集柜 -->
    <el-dialog 
      :title="isUpdateFold?'修改库房':'添加库房'"
      :visible.sync="foldDialog"
      width="1150px"
      custom-class="foldClassName"
     >
     <div class="demo-input-suffix">
       <span style="color:#f56c6c;margin-left:15px;">*</span>
        密集架编号：
       <el-input type="text" v-model.number="foldLeftForm.shelfCode" placeholder="请输入密集架编号" size="medium" style="width:180px"></el-input>
      </div>
      
     <div class="flex-wrap">
       <div class="detail"  style="border-right:1px solid #eee">
         <div class="title flex-spaceBetween">
           <span>密集架：左侧</span>
           <span>(L)</span>
         </div>
          <el-form :model="foldLeftForm" :rules="foldRules" ref="foldLeftForm" label-width="110px" >
            <el-form-item label="档案门类：" prop="id">
              <el-select v-model="foldLeftForm.id" placeholder="请选择" style="width:100%">
                <el-option-group
                  v-for="group in classData"
                  :key="group.id"
                  :label="group.text">
                  <el-option
                    v-for="item in group.children"
                    :key="item.id"
                    :label="item.text"
                    :value="item.id">
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
             
            <el-form-item label="层数：" prop="row">
              <el-input type="text" v-model.number="foldLeftForm.row"></el-input>
            </el-form-item>
            <el-form-item label="列数：" prop="column">
              <el-input type="text" v-model.number="foldLeftForm.column"></el-input>
            </el-form-item>
          </el-form>
       </div>
        <div class="detail">
         <div class="title flex-spaceBetween">
           <span>密集架：右侧</span>
           <span>(R)</span>
         </div>
          <el-form :model="foldRightForm" :rules="foldRules" ref="foldRightForm" label-width="110px">
            <el-form-item label="档案门类：" prop="id">
               <el-select v-model="foldRightForm.id" placeholder="请选择" style="width:100%">
                <el-option-group
                  v-for="group in classData"
                  :key="group.id"
                  :label="group.text">
                  <el-option
                    v-for="item in group.children"
                    :key="item.id"
                    :label="item.text"
                    :value="item.id">
                  </el-option>
                </el-option-group>
              </el-select>
            </el-form-item>
            
              <el-form-item label="层数：" prop="row">
              <el-input type="text" v-model.number="foldRightForm.row"></el-input>
            </el-form-item>
            <el-form-item label="列数：" prop="column">
              <el-input type="text" v-model.number="foldRightForm.column"></el-input>
            </el-form-item>
          </el-form>
       </div>
     </div>
     
     <div slot="footer" class="dialog-footer">
        <el-button @click="foldDialog = false">取 消</el-button>
        <!-- <el-button @click="resetFold">重置</el-button> -->
        <el-button type="primary" @click="submitFold()">确 定</el-button>
      </div>
     </el-dialog>
  </section>
</template>
<script>
import { Base64 } from 'js-base64';
import {retrieveStorerooms,createStoreroom,deleteStoreroom,updateStoreroom,
retrieveShelf,createShelf,updateShelf,deleteShelf,retrieveCells
} from '@/api/storeRoom'
import { loginCheck} from "@/api/user";
import{deepQuery} from '@/common/js/util'
export default {
  data() {
    return {
      isShowHouse:false,//是否显示修改库房的变量 false表示修改密集架 否则是库房
      loginForm:{ //登录form
        checkPass:""
      },
      loginDialog:false,
      loginRules: {
        checkPass: [{ required: true, message: "请输入密码", trigger: "blur" }]
      },
      houseDialog:false,//库房
      loading:false,
      isUpdateHouse:false,//修改增加库房
      houseCode:"",//库房id
      houseData:[],//库房数组
      houseForm:{
        id:"",
        address:""
      },
      houseRules:{
        id:[{ required: true, message: '请输入编号', trigger: 'blur' },{ type: 'number', message: '必须为数字值'}],
        address:[{ required: true, message: '请输入库房说明', trigger: 'blur' }],
      },
      foldCode:"",//密集架id
      foldDialog:false,//库房
      isUpdateFold:false,//修改增加库房
      foldData:[],//密集架数组
      foldLeftForm:{
        id:"",
        row:"",
        column:"",
        shelfCode:""
      },
      foldRightForm:{
        id:"",
        row:"",
        column:""
      },

      foldRules:{
        id:[{ required: true, message: '请输入编号', trigger: 'blur' }],
        shelfCode:[{ required: true, message: '请输入密集架编号', trigger: 'blur' },{ type: 'number', message: '必须为数字值'}],
        row:[{ required: true, message: '请输入行数', trigger: 'blur' }, { type: 'number', message: '必须为数字值'}],
        column:[{ required: true, message: '请输入列数', trigger: 'blur' }, { type: 'number', message: '必须为数字值'}],
      },
      houseInfo:null,//库房选中单位
      foldInfo:null,//密集架选中单位
      classData:[],
      loginMessage:"修改后，库房所在楼层位置也会改变，请谨慎修改", //验证登录提示语
      foldPosition:"L",
      cellData:[] //格子数组
    };
  },
  methods:{
    addHouse(){
      this.isUpdateHouse = false;
      this.houseDialog = true;
    },
    submitHouse(formname){ //创建或者修改库房
      this.$refs[formname].validate(valid=>{
        if(valid){
          let params = {
            storeroomCode :this.houseForm.id,
            storeroomAddress :this.houseForm.address
          }
          if(this.isUpdateHouse){ //修改
            params.storeroomId = this.houseInfo.storeroomId;
            updateStoreroom(params).then(res=>{
              if(res.success){
                  this.$message.success('修改成功')
                  this.houseDialog = false;
                  this.getHouseData();
                }else{
                  this.$message.error(res.msg)
                }
            })
          }else{
            createStoreroom(params).then(res=>{
              if(res.success){
                this.$message.success("创建成功")
                this.houseDialog = false;
                this.getHouseData();
              }else{
                this.$message.error(res.msg)
              }
            })
          }
          
        }else{
          return false
        }
      })
    },
    addFold(){
      this.isUpdateFold = false;
      this.foldDialog = true;
      // this.foldLeftForm.shelfCode = '';
      // this.foldLeftForm.id= '';
      // this.foldLeftForm.column= '';
      // this.foldLeftForm.row= '';
      // this.foldRightForm.id= '';
      // this.foldRightForm.column= '';
      // this.foldRightForm.row= '';
    },
    submitFold(){
      if(this.foldLeftForm.shelfCode){
        if(!/^[0-9]*$/.test(this.foldLeftForm.shelfCode)){
          this.$message.warning("密集架编号请输入数字值");
          return
        }
      }else{
        this.$message.warning("请输入密集架编号");
        return;
      }
      this.$refs['foldLeftForm'].validate(valid=>{
        if(valid){
          this.$refs['foldRightForm'].validate(valid=>{
            if(valid){
              let params = {
                storeroomId:this.houseInfo.storeroomId,
                shelfCode :this.foldLeftForm.shelfCode,
                shelfLeftColumns :this.foldLeftForm.column,
                shelfLeftRows :this.foldLeftForm.row,
                leftClassType :this.foldLeftForm.id,
                shelfRightColumns :this.foldRightForm.column,
                shelfRightRows :this.foldRightForm.row,
                rightClassType:this.foldRightForm.id,
              }
              if(this.isUpdateFold){ //修改密集架
                params.shelfId = this.foldInfo.shelfId;
                updateShelf(params).then(res=>{
                  if(res.success){
                    this.$message.success('修改成功')
                    this.foldDialog = false;
                    this.getFoldData()
                  }else{
                    this.$message.error(res.msg)
                  }
                })
              }else{
                createShelf(params).then(res=>{
                  if(res.success){
                    this.$message.success('创建成功')
                    this.foldDialog = false;
                    this.getFoldData()
                  }else{
                    this.$message.error(res.msg)
                  }
                })
              }
              
            }else{
              return false
            }
          })
        }else{
          return false
        }
      })
    },
    resetFold(){
      this.foldLeftForm.shelfCode = '';
      this.$refs['foldLeftForm'].resetFields()
      this.$refs['foldRightForm'].resetFields()
    },
    async checkedHouse(data){ //选中库房
      this.houseInfo = data;
      this.houseCode = this.houseInfo.storeroomId;
      this.foldPosition = 'L';
      this.foldData = [];
      this.cellData = [];
      let foldCode = await this.getFoldData();
      if(foldCode){
        await this.getCellData();
      }
    },
    deleteHouse(id){//删除库房
      let lastId =  this.houseData[this.houseData.length-1].storeroomId;
      if(this.houseData.length>1){ //如果大于1个库房 判断当前删除是否是最后一个
        if(id!== lastId){
          this.$alert('只能删除最后一个空库房，其他库房，不能删除','提示',{
           type: "warning"
          }).then(()=>{}).catch(()=>{})
        }else{
          this.deleteHouseFunc(id)
        }
      }else{
          this.deleteHouseFunc(id)
      }
    },
    deleteHouseFunc(id){
      this.$confirm(
        "是否删除当前库房",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(res=>{
        deleteStoreroom({storeroomId:id}).then(res=>{
          if(res.success){
            this.$message.success('删除成功')
            this.initData()
          }else{
            this.$message.error(res.msg)
          }
        })
      })
    },
    updateHouse(data){//修改库房
      this.loginDialog = true;
      this.houseInfo = data; //赋值选中库房数据
      this.isShowHouse = true;
      // this.loginMessage = '修改后，库房所在楼层位置也会改变，请谨慎修改';
    }, 
    checkedFold(data){ //选中密集架
      this.foldInfo = data;
      this.foldCode = this.foldInfo.shelfId;
      this.foldPosition = 'L';
      this.getCellData();
    },
    deleteFold(id){//删除密集架
      let lastId =  this.foldData[this.foldData.length-1].shelfId;
      if(this.foldData.length>1){ //如果大于1个库房 判断当前删除是否是最后一个
        if(id!== lastId){
          this.$alert('只能删除最后一个空密集架，其他密集架，不能删除','提示',{
           type: "warning"
          }).then(()=>{}).catch(()=>{})
        }else{
          this.deleteFoldFunc(id)
        }
      }else{
          this.deleteFoldFunc(id)
      }
    },
    deleteFoldFunc(id){
      this.$confirm(
        "是否删除当前密集架",
        "确认提示",
        {
          confirmButtonText: "确认",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(res=>{
        deleteShelf({shelfId:id}).then(res=>{
          if(res.success){
            this.$message.success('删除成功')
            this.initData()
          }else{
            this.$message.error(res.msg)
          }
        })
      })
    },
    updateFold(data){//修改密集架
      this.loginDialog = true;
      this.foldInfo = data; //赋值选中密集架数据
      this.isShowHouse = false;//是否修改库房为false 说明修改的是密集架 打开修改密集架的弹框
      this.loginMessage = '验证';
    }, 
    checkLogin(formname){
       this.$refs[formname].validate(valid=>{
        if(valid){
          let params = {
            username: this.userInfo.userCode,
            password: Base64.encode(this.loginForm.checkPass)
          }
           loginCheck(params).then(res=>{
             if(res.success){
               this.loginDialog = false; //关闭验证框
               if(this.isShowHouse){ //显示修改库房
                  this.houseForm.id= this.houseInfo.storeroomCode;
                  this.houseForm.address= this.houseInfo.storeroomAddress;
                  this.isShowHouse = true;//
                  this.isUpdateHouse = true;//
                  this.houseDialog = true;//打开修改库房
               }else{
                  this.foldLeftForm.shelfCode = this.foldInfo.shelfCode;
                  this.foldLeftForm.id= this.foldInfo.leftClassType;
                  this.foldLeftForm.column= this.foldInfo.shelfLeftColumns;
                  this.foldLeftForm.row= this.foldInfo.shelfLeftRows;
                  this.foldRightForm.id= this.foldInfo.rightClassType;
                  this.foldRightForm.column= this.foldInfo.shelfRightColumns;
                  this.foldRightForm.row= this.foldInfo.shelfRightRows;
                  this.isShowHouse = false;//
                  this.isUpdateFold = true;//
                  this.foldDialog = true;//打开修改密集架
               }
               
             }else{
               this.$message.error(res.msg)
             }
           })
        }else{
          return false
        }
      })
    },
    async initData(){
      let houseCode = await this.getHouseData()
      if(houseCode){
        let foldCode = await this.getFoldData();
        if(foldCode){
          await this.getCellData();
        }
      }
    },
    getHouseData(){ //获取库房信息
      this.loading = true;
      return new Promise((resolve,reject)=>{
        let params = {
          limit:10000,
          star:1
        }
        retrieveStorerooms(params).then(res=>{ //获取库房
          if(res.success){
            this.loading = false;
            this.houseData = res.data.list;
            if(res.data.list.length>0){
              this.houseCode = res.data.list[0].storeroomId;
              this.houseInfo = res.data.list[0];
              resolve(this.houseCode)
            }else{
              this.loading = false;
              this.houseCode = '';
            }
          }else{
            this.loading = false;
            this.$message.error(res.msg)
          }
        })
      })
     
    },
    getFoldData(){//获取密集架信息
      this.loading = true;
      return new Promise((resolve,reject)=>{
        let params = {
          limit:10000,
          star:1,
          storeroomId:this.houseCode
        }
        retrieveShelf(params).then(res=>{ //获取库房
          if(res.success){
            this.loading = false;
            this.foldData = res.data.list;
            if(res.data.list.length>0){
              this.foldCode = res.data.list[0].shelfId;
              this.foldInfo = res.data.list[0];
              resolve(this.foldCode)
            }else{
              this.loading = false;
              this.foldCode = '';

              return false
            }
          }else{
            this.loading = false;
            this.$message.error(res.msg)
          }
        })
      })
     
    },
    getCellData(){//获取格子信息
      this.loading = true;
      return new Promise((resolve,reject)=>{
        let params = {
          shelfId:this.foldCode,
          shelfPosition:this.foldPosition
        }
        retrieveCells(params).then(res=>{ //获取库房
          if(res.success){
            this.loading = false;
            if(res.data.length){
              this.handleCellData(res.data)
            }
           
          }else{
            this.loading = false;
            this.$message.error(res.msg)
          }
        })
      })
     
    },
    handleCellData(data){//处理拿到的格子数据 
        let list = [];
        data.forEach((item,index)=>{
          for(let i=0;i<list.length;i++){
            if(list[i].column == item.cellColumn){
              list[i].listInfo.push(item)
              return;
            };
          }
          // 第一次对比没有参照，放入参照
          list.push({
            column: item.cellColumn,
            listInfo: [item]
          });	
        })
        this.cellData = list;
    },
    getClassData(){ //获取待选的档案中间门类列表
      let data = []
      this.$store.dispatch('tree/tableViewTree').then(res=>{
          this.classData = deepQuery([res],"D_ARCHIVE",data);
      });
    },
    getFoldName(id){//获取密集架对应的名称
      if(this.classData.length>0){
        if(this.classData[0].children.length>0){
         return this.classData[0].children.filter(item=>item.id == id)[0].text||'';
        }
      } 
    },
    handlePlank(cell){
      let classType = '';
      if(this.shelfPosition ==='L'){
        classType = this.foldInfo.leftClassType;
      }else{
        classType = this.foldInfo.rightClassType;
      }
      let cellArchiveIdList =[];
      if(cell.archiveMsg.length>0){
        cell.archiveMsg.forEach(item=>{
          cellArchiveIdList.push(item.cellArchiveId)
        })
      }
      this.$router.push({
        name:"plank",
        query:{
          cellId:Base64.encode(cell.cellId),
          column:Base64.encode(cell.cellColumn),
          row :Base64.encode(cell.cellRow),
          classType:Base64.encode(classType),
          cellArchiveIdList:cellArchiveIdList.length>0?Base64.encode(cellArchiveIdList.join()):''
        }
      })
    },
    handlePosition(tab, event){
      this.getCellData()
    }
  },
  mounted(){
    this.initData()
    this.getClassData()
  },
  computed: {
    checkedColor() {//选中的边框颜色
      return `border:2px solid #${this.$store.getters.themeColor}`;
    },
    userInfo(){
      return this.$store.getters.userInfo
    }
  },
  watch:{
    
  }
};
</script>
<style lang="scss" scoped>
section {
  .border {
    border: 1px solid #eee;
    padding: 15px;
    margin: 15px;
    .houseItem {
      cursor: pointer;
      width: 120px;
      margin-right: 20px;
      position: relative;
      p {
        margin: 10px 0;
      }

      p:nth-child(1) {
        border: 1px solid #eee;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        i {
          font-size: 70px;
          width: 70px;
        }
      }
      p:nth-child(2) {
        color: #444;
      }
      .edit {
        position: absolute;
        top: 11px;
        right: -3px;
        width: 50px;
        display: none;
      }
      .el-button {
        margin: 0;
      }
      .add {
        i {
          font-size: 50px !important;
        }
      }
    }
    .houseItem:hover {
      .edit {
        display: block;
      }
    }
    .foldItem {
      cursor: pointer;
      width: 160px;
      height: 219px;
      margin-right: 20px;
      position: relative;
      border: 1px solid #ccc;
      background-color: rgba(240, 242, 245, 1);
      .left {
        border-right: 1px solid #ccc;
      }
      .add {
        font-size: 50px;
        margin-top: 80px;
      }
      .left,
      .right {
        width: 79px;
        p:nth-child(1) {
          color: #444;
          font-weight: bold;
          height: 20px;
        }
        p:nth-child(2) {
          color: green;
          margin-top: 25px;
          font-weight: bold;
        }
        p:nth-child(3) {
          height: 80px;
          i {
            font-size: 40px;
          }
        }
      }
      .edit {
        position: absolute;
        top: 0;
        right: -3px;
        width: 50px;
        display: none;
      }
      .el-button {
        margin: 0;
      }
    }
    .foldItem:hover {
      .edit {
        display: block;
      }
    }
    .file {
      overflow-x: scroll;
			overflow-y: hidden;
			white-space:nowrap; 
      padding-bottom: 50px;
      .fileItem {
        width: 170px;
        border: 1px solid #eee;
        margin: 0 0 -1px -1px;
        display: inline-block;
        .item > p {
          height: 45px;
          line-height: 45px;
          margin: 0;
          font-size: 14px;
          text-align: center;
          color: #444;
          font-weight: bold;
          background-color: #f0f2f5;
          border-bottom: 1px solid #eee;
          span {
            font-size: 16px;
          }
        }
        .item > div {
          height: 100px;
          padding: 5px;
          cursor: pointer;
          p {
            margin: 0;
            font-size: 12px;
            white-space:normal;
          }
        }
      }
      .fileItem:nth-child(1){
        margin: 0 0 -1px 0;
      }
    }
    
  }
}
</style>
<style lang="scss">
.foldClassName{
  .el-dialog__body{
    padding-top: 0; 
  }
  .detail{
    width: 49%;
    .title{
      line-height: 50px;
      border-bottom: 1px solid #eee;
      color: #333;
      font-weight: 700;
      padding: 0 15px;
    }
    .el-form{
      margin:10px 15px 0 0;
    }
  }
}
</style>