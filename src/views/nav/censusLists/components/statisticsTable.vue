<template>
  <div class="sumtable">
    <el-table
      border
      header-row-class-name="thClassName"
      :data="model"
      show-summary
      v-loading="loading"
      :summary-method="getSummaries"
    >
      <el-table-column
        v-for="item in tableColumns"
        :key="item.name"
        :label="item.label"
        :prop="item.name"
        align="center"
        :width="item.width ? item.width:''"
      >
      <el-table-column  v-for="child in item.children"
        :key="child.name"
        :label="child.label"
        :prop="child.name"
        align="center"
      >
      </el-table-column>
        <template slot-scope="scope">
          <div v-if="item.name == 'ORIGINALARCHIVENUMBER'">
            <!-- 实时统计原文大小 -->
            <span
              v-if="scope.row.FILESIZE==0||scope.row.FILESIZE>0"
              style="color:#ff0036"
            >{{scope.row[item.name]}}（{{scope.row[item.name]}}件,{{scope.row.FILESIZE| toSize}}）</span>
            <span v-else>{{scope.row[item.name]}}</span>
          </div>
          <!-- //统计日期 -->
          <div v-else-if="item.name == 'countdate'"> 
            <span>{{new Date(scope.row[item.name]).format('yyyy-MM-dd')}}</span>
          </div>
          <!-- 原文大小 -->
           <div v-else-if="item.name == 'originalfilelength'">
            <span
              v-if="scope.row.originalfilelength==0||scope.row.originalfilelength>0"
              style="color:#ff0036"
            >{{scope.row.originalfilelength| toSize}}</span>
          </div>
          <div v-else>
            <span>{{scope.row[item.name]}}</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <slot name="pagination"></slot>
  </div>
</template>
<script>
export default {
  name: "statisticsTable",
  props: {
    tableColumns: {
      type: Array
    },
    model: {
      type: Array
    },
    lengIndex:{
      type:String
    }
  },
  data() {
    return {
      loading: false
    };
  },
  methods: {
    getFilterLength(size) {
      if (!size) return "";
      let bsize = size * 1024;
      let num = 1024.0; //byte
      if (bsize < num) return bsize + "B";
      if (bsize < Math.pow(num, 2)) return (bsize / num).toFixed(2) + "K"; //kb
      if (bsize < Math.pow(num, 3))
        return (bsize / Math.pow(num, 2)).toFixed(2) + "M"; //M
      if (bsize < Math.pow(num, 4))
        return (bsize / Math.pow(num, 3)).toFixed(2) + "G"; //G
      return (bsize / Math.pow(num, 4)).toFixed(2) + "T"; //T
    },
    getSummaries(param) {
      const { columns, data } = param;
      const sums = [];
      let length = 0;//原文大小
      let lengthFieldName = '';
      if(Number(this.lengIndex) == 7){//实时统计
        lengthFieldName ='FILESIZE'
      }else{
        lengthFieldName ='originalfilelength'//历史统计
      }
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = "合计：";
          return;
        }

        const values = data.map(item => Number(item[column.property]));
        let fileLengArr = [];
        fileLengArr = data.map(item => {
          if (item[lengthFieldName] == 0 || item[lengthFieldName] > 0) {
            return Number(item[lengthFieldName]);
          }
        });
        //累加文件长度
        if (fileLengArr.length) {
          if (!fileLengArr.every(value => isNaN(value))) {
            length = fileLengArr.reduce((prev, curr) => {
              const value = Number(curr);
              if (!isNaN(value)) {
                return prev + curr;
              } else {
                return prev;
              }
            }, 0);
            length += " ";
          } else {
            length = "";
          }
        }
        
        if (!values.every(value => isNaN(value))) {
          sums[index] = values.reduce((prev, curr) => {
            const value = Number(curr);
            if (!isNaN(value)) {
              return prev + curr;
            } else {
              return prev;
            }
          }, 0);
          sums[index] += " ";
        } else {
          sums[index] = "";
        }
      });
      if (length) {
        let s = this.getFilterLength(length);
        if(Number(this.lengIndex) == 7){ //实时统计
          sums[this.lengIndex] = `${sums[this.lengIndex]}（${sums[this.lengIndex]}件,${s}）`;
        }else{//历史统计
          sums[this.lengIndex] = `${s}`;
        }
      }

      return sums;
    }
  }
};
</script>
<style lang="scss" scoped>
.sumtable {
  .el-table{
    overflow: auto;
  }
  /deep/ .el-table__body-wrapper,
  /deep/ .el-table__header-wrapper,
  /deep/ .el-table__footer-wrapper{
    overflow:visible!important;
  }
  /deep/ .el-table::after{
    position: relative !important;
  }
  /deep/ .el-table__footer-wrapper {
    td {
      color: #ff0036;
    }
  }

}
</style>