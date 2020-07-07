<template>
    <archives :word="word"></archives>
</template>
<script>
import archives from '@/components/Archives'
export default {
    name:"fileManage",
    data(){
        return{
             word:"fileManage"//数据管理
        }
       
    },
    components:{
        archives
    },
    
}
</script>