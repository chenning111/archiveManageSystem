//表格排序方法 和著录 档案门类检索不同
export default {
  data() {
    return {
      sorts: {}
    };
  },
  methods: {
    handleSort({ column, prop, order }, fn) {
      //点击排序
      if (order) {
        this.sorts[prop] = order == "ascending" ? "asc" : "desc";
      } else {
        this.$delete(this.sorts, prop);
      }
      fn(); //执行搜索方法
    },
    setSortTable() {
      //获取数据后 设置排序
      if (this.sorts) {
        for (let i of this.$refs.tableBox.columns) {
          let name = i.property;
          if (this.sorts.hasOwnProperty(name)) {
            i.order = this.sorts[name] == "asc" ? "ascending" : "descending";
          } else {
            i.order = "";
          }
        }
      }
    }
  }
};
