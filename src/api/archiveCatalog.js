import { getRequest, postRequestJSON, putRequestForm } from "./api";
//实体-------------------------------------------------------------------------
//获取实体分类
export const getCatalogTree = params => {
  return getRequest("/getCatalogTree", params).then(res => res.data);
};
//新增实体分类
export const addCatalog = params => {
  return postRequestJSON("/addCatalog", params).then(res => res.data);
};
//删除实体分类
export const deleteCatalog = params => {
  return postRequestJSON("/deleteCatalog", params).then(res => res.data);
};
//修改实体分类
export const updateCatalog = params => {
  return postRequestJSON("/updateCatalog", params).then(res => res.data);
};
//查询
export const selectCatalog = params => {
  return getRequest("/selectCatalog", params).then(res => res.data);
};
//分配门类PUT /addSystemCatalogNodeCode
export const addSystemCatalogNodeCode = params => {
  return putRequestForm("/addSystemCatalogNodeCode", params).then(
    res => res.data
  );
};
//获取已分门类GET /getAssignmentNodeCodes
export const getNodeCodesByCatalog = params => {
  return getRequest("/getNodeCodesByCatalog", params).then(res => res.data);
};
//获取全部体分类树
export const getAllCatalogTree = params => {
  return getRequest("/getAllCatalogTree", params).then(res => res.data);
};
