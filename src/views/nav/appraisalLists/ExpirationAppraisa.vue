<template>
<!-- 到期鉴定 -->
     <commonData classType="D_ARCHIVE" :isDataEntry='isDataEntry' :jd="jd" >
        <span class="cardTitle" slot="archive">档案鉴定</span>
    </commonData>
</template>
<script>
import commonData from '@/components/commonData'

export default {
    name:"expirationAppraisa",
    data (){
        return {
            isDataEntry:false, //是否是档案著录 false表示不是
            jd:true //鉴定
        }
    },
    components:{
        commonData
    }
}
</script>