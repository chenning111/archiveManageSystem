<template>
<!-- 档案实时统计 -->
  <div>
    <div class="content-right-title flex-spaceBetween">
      <span>实时统计</span>
      <el-button type="primary" @click="submitForm('form')">统计</el-button>
    </div>
    <div class="content-right-form">
      <el-form :model="form" :rules="rules"  label-width="120px" ref="form">
        <el-form-item prop="fondsNo" label="全宗号：">
           <el-select
              v-model="form.fondsNo"
              @change="changeFond"
              value-key="FONDSCODE"
              clearable 
            >
              <el-option
                v-for="option in fondsList"
                :label="option.NO+' -- '+option.NAME"
                :key="option.FONDSCODE"
                :value="option"
              ></el-option>
            </el-select>
        </el-form-item>
        <div class="borderBox">
          <el-tree
              :data="systemClassFondsList"
              show-checkbox
              :default-checked-keys="form.archiveCatalogNoArr"
              default-expand-all
              empty-text="暂无实体"
              node-key="id"
              ref="archiveCatalogNoTree"
              highlight-current
              :props="{children: 'children', label: 'text'}">
            </el-tree>
        </div>
      </el-form>
      
    </div>
  </div>
</template>
<script>
export default {
    name:"realtimeStatistics",
     props:{
      cNodeCode:{ //底层门类id 获取实体分类的
        type:String,
        default:""
      },
      tableCode:{//实体表tablecode
        type:String,
        default:""
      }
    },
  data() {
    return {
      systemClassFondsList:[],//实体分类数组
      form:{
        fondsNo:"",
        archiveCatalogNoArr:[]
      },
      rules:{
        fondsNo:[{ required: true, message: '请选择全宗', trigger: 'change'}],
      },
      
    };
  },
  methods:{
    changeFond(value) {
      //全宗
      this.form.fondsNo = value.NO;
    },
    submitForm(name){
      this.$refs[name].validate((valid)=>{
        if(valid){
          let arr = this.$refs.archiveCatalogNoTree.getHalfCheckedKeys().concat(this.$refs.archiveCatalogNoTree.getCheckedKeys())
          this.form.archiveCatalogNoArr = arr;
          if(this.form.archiveCatalogNoArr.length==0){
            this.$message.warning('请选择实体分类');
            return
          }
          this.$router.push({
            name:"utilizationStatistics",
            query:{
              tableCode:this.tableCode,
              catalogs:this.form.archiveCatalogNoArr.join(),
              fondsNo:this.form.fondsNo
            }
          })
        }else{
          return false
        }
      })
    }
  },
  components: {
  },
  async mounted(){
    let arr = await this.$store.dispatch("fondsCatalog/getFondsList"); //获取全宗数组
    if(arr.length>0){
        this.form.fondsNo = this.fondsList[0].NO
    }
  },
  watch:{
    async 'form.fondsNo'(newval, oldval) {
      if (newval !== "") {
        if(!this.cNodeCode){
          this.$message.warning('请选择需要统计的档案')
          return;
        }
        let fondscode = this.fondsList.find(item => item.NO == newval).FONDSCODE;
        this.systemClassFondsList = await this.$store.dispatch(
          "fondsCatalog/getCatalogTree",
          { fondsCode: fondscode, classnodeId: this.cNodeCode }
        );
        // let data = await this.$store.dispatch(
        //   "fondsCatalog/getCatalogTree",
        //   { fondsCode: fondscode, classnodeId: this.cNodeCode }
        // );
        // this.systemClassFondsList = [{
        //   id:"all",
        //   text:this.fondsList.filter(item=>item.FONDSCODE == fondscode)[0].NAME,
        //   children:data
        // }]
      }
    },
    
  },
  computed:{
    fondsList() {
      return this.$store.state.fondsCatalog.fondsList;
    },
  }
};
</script>
<style lang="scss" scoped>
.content-right-title{
    height: 60px;
    border-bottom: 1px solid #eee;
    padding: 0 20px;
    display: flex;
    display: -webkit-box;
    display: -moz-box;
    display: -ms-flexbox;
    display: -webkit-flex;
    align-items: center;
    justify-content: space-between;
    span {
        font-weight: 700;
        color: #666;
        font-size: 15px;
    }
}
.content-right-form{
  margin: 30px 15px;
  .borderBox{
    border: 1px solid #eee;
    padding: 10px;
  }
}
</style>