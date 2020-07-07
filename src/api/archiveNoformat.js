import {
  postRequestForm,
  postRequestJSON,
  putRequestForm,
  getRequest
} from "./api";
//档号格式设置-------------------------------------------------------------------------
//添加档号设置
export const addSystemNoFormat = params => {
  return postRequestJSON("/addSystemNoFormat", params).then(res => res.data);
};
//获取设置档号项列表
export const getSystemNoFormatColumnsByEntityCode = params => {
  return postRequestForm("/getSystemNoFormatColumnsByEntityCode", params).then(
    res => res.data
  );
};
//获取档号列表
export const getSystemNoFormatList = params => {
  return postRequestForm("/getSystemNoFormatList").then(res => res.data);
};
//获取指定底层门类档号列表
export const getSystemNoFormatListByEntityCode = params => {
  return postRequestForm("/getSystemNoFormatListByEntityCode", params).then(
    res => res.data
  );
};
//修改指定门类设置的选择项
export const updateSystemNoItemByEntityCode = params => {
  return putRequestForm("/updateSystemNoItemByEntityCode", params).then(
    res => res.data
  );
};
//修改指定门类设置的选择项
export const retrieveSystemNoItemByEntityCode = params => {
  return getRequest("/retrieveSystemNoItemByEntityCode", params).then(
    res => res.data
  );
};
