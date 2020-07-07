import {
  getRequest,
  postRequestForm,
  postRequestJSON,
  putRequestJSON
} from "./api";
// 调整
//获取归档年度GET /adjust/retrieveFillingYears
export const retrieveFillingYears = params => {
  return getRequest("/adjust/retrieveFillingYears", params).then(
    res => res.data
  );
};
//根据归档年度获取档号列表 /adjust/retrieveArchiveNOs
export const retrieveArchiveNOs = params => {
  return getRequest("/adjust/retrieveArchiveNOs", params).then(res => res.data);
};
//获取调整档案信息GET /adjust/retrieveAdjustArchiveParam
export const retrieveAdjustArchiveParam = params => {
  return getRequest("/adjust/retrieveAdjustArchiveParam", params).then(
    res => res.data
  );
};
// 档案调整PUT /adjust/archiveAdjust
export const archiveAdjust = params => {
  return putRequestJSON("/adjust/archiveAdjust", params).then(res => res.data);
};
// 档案调整类型GET /adjust/retrieveTableType
export const retrieveTableType = params => {
  return getRequest("/adjust/retrieveTableType", params).then(res => res.data);
};
