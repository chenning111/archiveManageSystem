<template>
    <section>
        <div class="no">
            <img src="../../assets/img/text.png" alt="无权限">
            <p class="cp">您还没查看原文内容的权限</p>
            <p class="last">需要向管理员申请后，才能查看</p>
            <div class="textCenter">
                <el-button size="small"  @click="handleJy">申请借阅</el-button>
            </div>
        </div>
    </section>
</template>
<script>
export default {
    
    data(){
        return{
            
        }
    },
    methods:{
       handleJy(){
           this.$parent.$parent.putJy()
       }
    }
}
</script>

<style scoped lang='scss'>
    section{
        background-color: #fff;
        .no{
            text-align: center;
            padding: 50px 20px 0 20px;

            img{
                height: 150px;
            }
            .cp{
                font-size: 18px;
                color: #666;
                font-weight: 700;
            }
            .last{
                color: #666;
            }
        }
       
        
    }
</style>