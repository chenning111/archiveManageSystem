import { getRequest, postRequestForm } from "./api";
//配置数据库
//获取数据库地址
export const getDB = params => {
  return getRequest("/data/getDB", params).then(res => res.data);
};
export const setDB = params => {
  return postRequestForm("/data/setDB", params).then(res => res.data);
};
