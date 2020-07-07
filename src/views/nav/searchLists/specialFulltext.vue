<template>
<!-- 全文检索 -->
    <section>
        <div class="content-header flex-center">
            <div>
                <search-header title="全文检索" :addZt='addZt'></search-header>
                <div class="search">
                    <el-form :model="form" inline ref="form">
                        <el-form-item :rules="[{ required: true,message: '请输入关键词',trigger: 'blur'}]" prop="keywords"  >
                            <el-input  v-model="form.keywords" style="width:550px;" placeholder="请输入关键词" ></el-input>
                            <el-button @click="searchlist('form')" type="primary">搜索</el-button>
                        </el-form-item> 
                    </el-form>
                    <el-link type="primary" @click="$router.push('/special')" v-if="addZt">查看专题目录</el-link>
                </div>
            </div>
        </div>
       <el-col :span="24" style="background-color:#fff;min-height:500px;padding:20px;">
            <searchList></searchList>
      </el-col>
    </section>
</template>

<script>
import searchList from '../../search/SearchList'
import searchHeader from './searchHeader'
export default {
    data (){
        return {
            form:{
                keywords:""
            },
             addZt:false
        }
    },
    components :{
        searchList,searchHeader
    },
    mounted(){
        this.addZt = String(this.$route.query.addZt) =='true' ?true:false
    },
     
}
</script>

<style lang="scss" scoped>
    section {
        .content-header{
            background-color: #FAFAFA;
            padding-top: 30px;
            border-bottom: 1px solid #eee;
            .search{
                margin-top: 10px;
                .el-form{
                    display:inline-block;
                    margin-right:20px;
                    vertical-align: middle;
                }
                .el-link{
                    position: relative;
                    top: -12px;
                }
            }
        }
    }
</style>
