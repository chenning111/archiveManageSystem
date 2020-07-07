<template>
<!-- 利用情况统计 -->
    <archives :word="word"></archives>
</template>
<script>
import archives from '@/components/Archives'
export default {
    name:"lysituationStatistics",
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