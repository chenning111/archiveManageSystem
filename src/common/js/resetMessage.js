import Vue from "vue";
import ElementUI, { Message } from "element-ui";
// ...
Vue.use(ElementUI);
ElementUI.Dialog.props.closeOnClickModal.default = false; //弹出层点击modal不会关闭

// 为了实现Class的私有属性
const showMessage = Symbol("showMessage");
/**
 *  重写ElementUI的Message
 *  single默认值true，因为项目需求，默认只弹出一个，可以根据实际需要设置
 * 如果需要设置弹出时间 this.$message.warning({duration：5000,message:"测试"})
 * this.$message({})这种写法失效 需写提示类型
 */

class DonMessage {
  success(options, single = true) {
    this[showMessage]("success", options, single);
  }
  warning(options, single = true) {
    this[showMessage]("warning", options, single);
  }
  info(options, single = true) {
    this[showMessage]("info", options, single);
  }
  error(options, single = true) {
    this[showMessage]("error", options, single);
  }

  [showMessage](type, options, single) {
    if (single) {
      // 判断是否已存在Message
      if (document.getElementsByClassName("el-message").length === 0) {
        Message[type](options);
      }
    } else {
      Message[type](options);
    }
  }
}

// 命名根据需要，DonMessage只是在文章中使用
Vue.prototype.$message = new DonMessage();
