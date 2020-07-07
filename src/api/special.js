import { getRequest, postRequestForm, postRequestJSON, downloadRequest } from './api'

//专题-------------------------------------------------------------------------
export const selecSpecialTopicCatalog = params => { return getRequest('/selecSpecialTopicCatalog', params).then(res => res.data) } //查询专题
export const addSpecialTopicCatalog = params => { return postRequestJSON('/addSpecialTopicCatalog', params).then(res => res.data) } //新增专题
export const updateSpecialTopicCatalog = params => { return postRequestJSON('/updateSpecialTopicCatalog', params).then(res => res.data) } //修改专题
export const deleteSpecialTopicCatalog = params => { return postRequestJSON('/deleteSpecialTopicCatalog', params).then(res => res.data) } //删除专题

export const selecSpecialTopicUtab = params => { return getRequest('/selecSpecialTopicUtab', params).then(res => res.data) } //查询专题档案
export const addSpecialTopicUtab = params => { return postRequestJSON('/addSpecialTopicUtab', params).then(res => res.data) } //新增专题档案
export const updateSpecialTopicUtab = params => { return postRequestJSON('/updateSpecialTopicUtab', params).then(res => res.data) } //修改专题档案
export const deleteSpecialTopicUtab = params => { return postRequestJSON('/deleteSpecialTopicUtab', params).then(res => res.data) } //删除专题档案
//汇编检索
export const retrieveSpecialTopicCatalog = params => { return getRequest('/retrieveSpecialTopicCatalog', params).then(res => res.data) } //查询专题档案
//导出专题目录
export const exportSpecialTopicUtabMsg = params => { return downloadRequest('/exportSpecialTopicUtabMsg', params).then(res => res) } //GET /exportSpecialTopicUtabMsg导出专题档案信息
export const exportSpecialTopicUtabOriginal = params => { return downloadRequest('/exportSpecialTopicUtabOriginal', params).then(res => res) }//GET /exportSpecialTopicUtabOriginal导出专题档案原文
