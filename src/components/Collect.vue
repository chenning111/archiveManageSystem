<!--  -->
<template>
  <div>
    <el-dialog title="收藏" :visible.sync="collectDialog" width="600px" custom-class="saveDiv">
      <el-form
        ref="favoriteBox"
        :model="saveForm"
        inline
        label-width="120px"
        class="clearboth saveform"
      >
        <el-form-item
          label="创建收藏夹"
          prop="name"
          style="margin:15px 0 20px 0;width:80%;"
          :rules="[{ required: true, message: '请输入收藏夹名称', trigger: 'blur' }]"
        >
          <el-input v-model="saveForm.name"></el-input>
        </el-form-item>
        <el-form-item style="margin:15px 0;" class="pull-right">
          <el-button type="primary" @click="createCollector('favoriteBox')">添加</el-button>
        </el-form-item>
      </el-form>
      <ul>
        <!-- <li class="clearboth">
          <span>默认收藏夹</span>
          <el-button-group class="pull-right">
            <el-button type="primary" size="small">收藏</el-button>
          </el-button-group>
        </li>-->
        <li class="clearboth" v-for="(item,key) in collectList" :key="key">
          <span>{{item.collectionName}}</span>
          <el-button-group class="pull-right">
            <el-button type="primary" size="small" @click="collectItem(item.id)">收藏</el-button>
            <el-button type="danger" size="small" @click="deleteCollector(item.id)">删除</el-button>
          </el-button-group>
        </li>
      </ul>
    </el-dialog>
  </div>
</template>

<script>
import {
  getThisIsCollection,
  getAllCreateCollectionFiles,
  delCollectionByUserCode,
  addCreateCollectionFiles,
  delCreateCollectionFiles,
  addCollection,
  getAllCollectionByUserCode
} from "@/api/collect";
export default {
  props: {
    recordCode: {
      type: String,
      default: ""
    },
    tableCode: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      collectDialog: false,
      saveForm: {
        name: ""
      },
      collectList: []
    };
  },
  methods: {
    collectYwen() {
      if (this.collectList.length == 0) {
        getAllCreateCollectionFiles()
          .then(res => {
            if (res.success) {
              this.collectList = res.data || [];
            } else {
              this.$message.error(res.msg);
            }
          })
          .catch(err => {});
      }
    },
    createCollector(formName) {
      //创建收藏夹
      this.$refs[formName].validate(valid => {
        if (valid) {
          addCreateCollectionFiles({ collectionFilesName: this.saveForm.name })
            .then(data => {
              if (data.success) {
                this.$message.success("创建成功");
                this.saveForm.name = "";
                getAllCreateCollectionFiles()
                  .then(res => {
                    if (res.success) {
                      this.collectList = res.data || [];
                    } else {
                      this.$message.error(res.msg);
                    }
                  })
                  .catch(err => {});
              } else {
                this.$message.error(data.msg);
              }
            })
            .catch(err => {});
        } else {
          return false;
        }
      });
    },
    collectItem(id) {
      //收藏
      let params = {
        archivesCode: this.recordCode,
        tableCode: this.tableCode,
        cid: id
      };
      addCollection(params)
        .then(data => {
          if (data.success) {
            this.$message.success("收藏成功");
          } else {
            this.$message.error({
              message: data.msg,
              type: "error"
            });
          }
        })
        .catch(err => {});
    },
    deleteCollector(id) {
      let params = {
        limit: 50,
        star: 1,
        cid: id
      };
      getAllCollectionByUserCode(params).then(res => {
        if (res.success) {
          let total = res.data.total;
          let msg = total > 0 ? "该收藏夹下有记录，是否删除" : "是否删除";
          this.$confirm(msg, "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          })
            .then(() => {
              delCreateCollectionFiles({
                id: id,
                archivesCode: this.recordCode
              }).then(data => {
                if (data.success) {
                  this.$message.success("删除成功");
                  getAllCreateCollectionFiles()
                    .then(res => {
                      if (res.success) {
                        this.collectList = res.data || [];
                      }
                    })
                    .catch(err => {});
                } else {
                  this.$message.error(data.msg);
                }
              });
            })
            .catch(() => {});
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    cancelCollect(cid) {
      this.$confirm("该档案已收藏，是否取消收藏", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          delCollectionByUserCode({ id: cid }).then(data => {
            if (data.success) {
              this.$message.success("已取消");
            } else {
              this.$message.error(data.msg);
            }
          });
        })
        .catch(() => {});
    },
    getIsCollect() {
      getThisIsCollection({ archivesCode: this.recordCode }).then(res => {
        if (res.success) {
          if (res.data) {
            //已收藏 取消
            let cid = res.data[0].id;
            this.cancelCollect(cid);
          } else {
            //未收藏
            this.collectDialog = true;
          }
        } else {
          this.$message.error(data.msg);
        }
      });
    }
  },
  //生命周期 - 创建完成（访问当前this实例）
  created() {
    this.collectYwen();
  },

  //生命周期 - 挂载完成（访问DOM元素）
  mounted() {}
};
</script>
<style lang="scss">
.saveDiv {
  //收藏div
  .el-dialog__body {
    padding: 0 0 20px 0;
    max-height: 300px;
    min-height: 200px;
    overflow-y: auto;
    .saveform {
      border-bottom: 1px solid #ccc;
      margin-right: 30px;
      background-color: #fff;
      position: sticky;
      top: 0;
      z-index: 100;
      .el-form-item__content {
        width: 55%;
        margin-left: 30px;
      }
    }
    ul {
      margin: 0;
      padding: 0 30px;

      li {
        list-style: none;
        line-height: 70px;
        border-bottom: 1px solid #ccc;
        button {
          margin-top: 18px;
        }
      }
    }
  }
}
</style>
