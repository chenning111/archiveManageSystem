import {
  getRequest,
  postRequestForm,
  postRequestJSON,
  deleteRequest,
  putRequestJSON,
  downloadRequest,
  putRequestForm
} from "./api";
//编研目录
//x新增POST /editor/addEditorCatalog
export const addEditorCatalog = params => {
  return postRequestJSON("/editor/addEditorCatalog", params).then(
    res => res.data
  );
};
//删除DELETE /editor/deleteEditorCatalog
export const deleteEditorCatalog = params => {
  return deleteRequest("/editor/deleteEditorCatalog", params).then(
    res => res.data
  );
};
//查询GET /editor/retrieveEditorCatalog
export const retrieveEditorCatalog = params => {
  return getRequest("/editor/retrieveEditorCatalog", params).then(
    res => res.data
  );
};
//修改PUT /editor/updateEditorCatalog
export const updateEditorCatalog = params => {
  return putRequestJSON("/editor/updateEditorCatalog", params).then(
    res => res.data
  );
};

//编研记录
//x新增POST /editor/addEditor
export const addEditor = params => {
  return postRequestJSON("/editor/addEditor", params).then(res => res.data);
};
//删除DELETE /editor/deleteEditor
export const deleteEditor = params => {
  return deleteRequest("/editor/deleteEditor", params).then(res => res.data);
};
//查询GET /editor/retrieveEditor
export const retrieveEditor = params => {
  return getRequest("/editor/retrieveEditor", params).then(res => res.data);
};
//修改PUT /editor/updateEditor
export const updateEditor = params => {
  return putRequestJSON("/editor/updateEditor", params).then(res => res.data);
};

//tableview
//查询 /editor/retrieveEditorTableView
export const retrieveEditorTableView = params => {
  return postRequestForm("/editor/retrieveEditorTableView", params).then(
    res => res.data
  );
};
//添加 /editor/addEditorTableView
export const addEditorTableView = params => {
  return postRequestForm("/editor/addEditorTableView", params).then(
    res => res.data
  );
};
//删除 /editor/deleteEditorTableView
export const deleteEditorTableView = params => {
  return deleteRequest("/editor/deleteEditorTableView", params).then(
    res => res.data
  );
};
//修改/editor/deleteEditorTableView
export const updateEditorTableView = params => {
  return putRequestForm("/editor/updateEditorTableView", params).then(
    res => res.data
  );
};
// 获取记录详情POST /editor/retrieveEditorTableViewDetail
export const retrieveEditorTableViewDetail = params => {
  return postRequestForm("/editor/retrieveEditorTableViewDetail", params).then(
    res => res.data
  );
};
//原文
//查询编研原文目录GET /editor/retrieveEditorOriginal
export const retrieveEditorOriginal = params => {
  return getRequest("/editor/retrieveEditorOriginal", params).then(
    res => res.data
  );
};
//查询编研原文路径retrieveEditorOriginalPath
export const retrieveEditorOriginalPath = params => {
  return getRequest("/editor/retrieveEditorOriginalPath", params).then(
    res => res.data
  );
};
//查询编研原文详情retrieveEditorOriginalDetailed
export const retrieveEditorOriginalDetailed = params => {
  return getRequest("/editor/retrieveEditorOriginalDetailed", params).then(
    res => res.data
  );
};
//删除编研原文DELETE /editor/Original
export const deleteEditorOriginal = params => {
  return deleteRequest("/editor/deleteEditorOriginal", params).then(
    res => res.data
  );
};
//置顶PUT /editor/topFile
export const topFile = params => {
  return putRequestForm("/editor/topFile", params).then(res => res.data);
};
//下载GET /editor/downLoadEditorOriginal
export const downLoadEditorOriginal = params => {
  return downloadRequest("/editor/downLoadEditorOriginal", params).then(
    res => res
  );
};
//修改原文详情PUT /editor/updateEditorOriginal
export const updateEditorOriginal = params => {
  return putRequestForm("/editor/updateEditorOriginal", params).then(
    res => res.data
  );
};
