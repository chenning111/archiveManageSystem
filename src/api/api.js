import axios from "axios";
import { Message, MessageBox } from "element-ui";
import router from "../routes";
import qs from "qs"; //序列化参数
axios.defaults.withCredentials = true;
// axios.defaults.timeout = 10000;
//axios基本配置

/**GET的提交方式 */
export const getRequest = (url, params) => {
  return axios({
    method: "get",
    url: `${url}`,
    params: params,
    headers: {
      Accept: "*/*"
    }
  });
};
/**POST请求分两种一个是form表单提交，参数会跟在请求地址后面，另外一个是Playload 就是json报文提交这两种 */
export const postRequestForm = (url, params) => {
  return axios({
    method: "post",
    url: `${url}`,
    data: qs.stringify(params),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*"
    }
  });
};
export const postRequestJSON = (url, params) => {
  return axios({
    method: "post",
    url: `${url}`,
    data: params,
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*"
    }
  });
};
/**DELETE的提交方式 */
export const deleteRequest = (url, params) => {
  return axios({
    method: "delete",
    url: `${url}`,
    data: qs.stringify(params),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*"
    }
  });
};
//put json修改
export const putRequestJSON = (url, params) => {
  return axios({
    method: "put",
    url: `${url}`,
    data: params,
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*"
    }
  });
};
//put form修改
export const putRequestForm = (url, params) => {
  return axios({
    method: "put",
    url: `${url}`,
    data: qs.stringify(params),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "*/*"
    }
  });
};
//下载
export const downloadRequest = (url, params) => {
  return axios({
    method: "get",
    responseType: "blob",
    url: `${url}`,
    params: params
  });
};
export const upLoadRequest = (url, params, config) => {
  //大多数上传基于element的框架上传 此方法目前在原文挂接时使用
  return axios({
    method: "post",
    url: `${url}`,
    data: params,
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "*/*"
    }
  });
};

//http response 拦截器
axios.interceptors.request.use(
  config => {
    // 所有请求之前都要执行的操作  目前不需要设置token
    // if (store.getters.token) {
    //     config.headers.common['token'] = store.getters.token;
    // }
    // console.log(config)
    return config;
  },
  err => {
    Message({
      message: "请求失败",
      type: "error"
    });
    return Promise.reject(err);
  }
);
let firstError = true;
function goLogin(msg) {
  if (firstError) {
    firstError = false;
    MessageBox.alert(msg, "提示", {
      type: "warning",
      confirmButtonText: "确定",
      callback: action => {
        sessionStorage.clear();
        location.replace(router.options.base + "/login");
        sessionStorage.setItem("referrer", router.currentRoute.fullPath);
        firstError = true;
      }
    });
  }
}
axios.interceptors.response.use(
  response => {
    // 所有请求完成后都要执行的操作
    let { code } = response.data;
    if (code == 301) {
      goLogin("请重新登录！");
    } else if (code == 300) {
      goLogin("账号在其他地方登陆,请重新登录！");
    }
    return response;
  },
  error => {
    if (error.response) {
      let status = error.response.status;
      if (status === 401) {
        if (firstError) {
          firstError = false;
          MessageBox.alert("系统超时，请重新登录！", "错误", {
            confirmButtonText: "确定",
            callback: action => {
              sessionStorage.clear();
              location.replace(router.options.base + "/login");
              sessionStorage.setItem("referrer", router.currentRoute.fullPath);
              firstError = true;
            }
          });
        }
      } else if (String(status).charAt(0) === "4" && status !== 401) {
        Message.error("服务器请求失败，请稍后重试");
      } else if (String(status).charAt(0) === "5") {
        Message.error("服务器内部错误，请稍后重试");
      }
    }
    return Promise.reject(error);
  }
);
