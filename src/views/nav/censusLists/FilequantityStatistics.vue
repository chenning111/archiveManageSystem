<template>
<!-- 档案数量统计 -->
    <archives :word="word"></archives>
</template>
<script>
import archives from '@/components/Archives'
export default {
    name:"filequantityStatistics",
    data(){
        return{
             word:"statistics"//统计页面
        }
       
    },
    components:{
        archives
    }
}
</script>