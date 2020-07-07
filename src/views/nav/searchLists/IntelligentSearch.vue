<template>
    <section style="">
        <el-col :span="5" class="content-left">
            <Tree></Tree>
        </el-col>
        <el-col :span="19" class="content-right">
            <div class="info shu-10">
               <div>
                    <p>请在下框中输入文件的标题或文号或年度，可以使用关键词</p>
                     <p>多个关键词之间使用一个空格分开，然后点击查询。例如：“先进集体 苏交政 1999”</p>
               </div>
            </div>
            <div class="info shu-10">
                <div>
                    <p>如果没有您想找的文件，可尝试减少关键词的数量或文字长度</p>
                     <p>例如“先进 1999”两年以内的文件请到OA系统的文档室查询，两年之前的档案请直接查询</p>
                </div>
            </div>
            <div class="search-input">
                <el-form :model="form" inline ref="form">
                    <el-form-item :rules="[{ required: true,message: '请输入关键词',trigger: 'blur'}]" prop="keywords"  >
                        <el-input  v-model="form.keywords" style="width:550px;" ></el-input>
                        <el-button @click="searchlist('form')" type="primary">搜索</el-button>
                    </el-form-item> 
                </el-form>
                <!-- <input type="text" v-model="keywords" ><button @click="searchlist">搜索</button> -->
            </div>
            <div class="content-wrapper">
                   <no-search v-if="flag1"></no-search>
                   <search-list v-if="flag2"></search-list>
            </div>            
        </el-col>
        
    </section>
</template>
<script>
import Tree from '../../search/Tree'
import NoSearch from '../../search/NoSearch'
import SearchList from '../../search/SearchList'
export default {
    data(){
        return {
            form:{
                keywords:''
            },
           
            flag1:false,
            flag2:false
        }
    },
    components:{
        Tree,NoSearch,SearchList
    },
    methods:{
        searchlist(formName){
             this.$refs[formName].validate((valid) => {
                if (valid) {
                      this.flag1 = false;
                     this.flag2 = true;
                } else {
                    return false;
                }
            });
           
        }   
    }
}
</script>
<style scoped lang="scss">
@import '../../../styles/vars';
    section{
        background-color: #fff;
        overflow: hidden;
        // min-height: 500px;
        box-sizing: border-box;
        .content-left{
            min-height: 500px;
        }
        .content-right{
            padding: 20px;
            min-height:500px;
             border-left:1px solid #ccc;
            .info{
                height: 90px;
                background-color: #F3F3F3;
                // border-left: 10px solid #007AFF;    
                margin-bottom: 20px;
                div{
                    padding: 15px;
                    p{
                        margin: 0;
                        color: #666;
                         margin-bottom: 15px;
                    }
                }
            }
            .search-input{
                text-align: center;
                margin-top: 65px;
                // input{
                //     width: 600px;
                //     height: 47px;
                //     border: 1px solid #ccc;
                //     outline: none;
                //     padding-left: 10px;
                //     vertical-align: middle;
                // }
                // button{
                //     width: 80px;
                //     height: 51px;
                //     outline: none;
                //     background-color: $color-primary;
                //     color: white;
                //     border: none;
                //     cursor: pointer;
                //     vertical-align: middle;
                // }
            }
        }
    }
</style>

