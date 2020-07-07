import {
  getRequest,
  postRequestForm,
  postRequestJSON,
  deleteRequest,
  downloadRequest,
  putRequestForm
} from "./api";
export const retrieveReport = params => {
  return getRequest("/report/retrieveReport", params).then(res => res.data);
}; //获取实体表对应报表信息GET /report/retrieveReport
export const deleteReport = params => {
  return deleteRequest("/report/deleteReport", params).then(res => res.data);
}; //删除报表DELETE /report/deleteReport
export const addExistsReport = params => {
  return postRequestForm("/report/addExistsReport", params).then(
    res => res.data
  );
}; //添加模版POST /report/addExistsReport
export const downExcel = params => {
  return downloadRequest("/report/downExcel", params).then(res => res);
}; //下载GET /report/downExcel
export const createRepServerLog = params => {
  return postRequestForm("/report/createRepServerLog", params).then(
    res => res.data
  );
}; //生成报表POST /report/createRepServerLog
export const updateSorts = params => {
  return putRequestForm("/report/updateSorts", params).then(res => res.data);
}; //修改排序PUT /report/updateSorts //暂时不用
export const getReportHistory = params => {
  return getRequest("/report/getReportHistory", params).then(res => res.data);
}; //获取报表历史
