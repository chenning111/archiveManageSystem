
<template>
<el-backtop target=".content-wrapper" :bottom="70">
  <div
    style="{
      height: 100%;
      width: 100%;
      background-color: #444;
      text-align: center;
      box-shadow: 0 0 6px rgba(0,0,0, .12);
      line-height: 40px;
      border-radius:50%;
    }"
  >
    <i class="el-icon-upload2" style="color:#fff"></i>
  </div>
</el-backtop>
</template>
<script>
export default {
    name:'backTop'
}
</script>

