<template>
    <!-- 收回 -->
    <examine-content :words="words">
       
        
    </examine-content>
</template>
<script>
import { Base64 } from "js-base64";
import examineContent from '../ExamineContent'
export default {
    data(){
        return {
            words: "back"
        }
    },
    components:{
        examineContent
    },
    beforeRouteEnter(to, from, next) {
        // 注意，在路由进入之前，组件实例还未渲染，所以无法获取this实例，只能通过vm来访问组件实例
        next(vm => {
        to.meta.title = Base64.decode(vm.$route.query.title || "");
        });
    }
}
</script>