import { getRequest, postRequestForm, postRequestJSON, downloadRequest, upLoadRequest } from './api'

// 归档范围-------------------------------------------------------------------------
export const getFilingScopeMaxNodeCode = params => { return postRequestForm('/getFilingScopeMaxNodeCode', params).then(res => res.data) }//获取最大的编号
export const delFilingScopeByNodeCode = params => { return postRequestForm('/delFilingScopeByNodeCode', params).then(res => res.data) }//删除归档范围节点
export const addFilingScope = (params) => { return postRequestJSON('/addFilingScope', params).then(res => res.data) }//添加归档范围节点
export const getFilingScopeTreeByParms = (params) => { return postRequestJSON('/getFilingScopeTreeByParms', params).then(res => res.data) }//按条件查询归档范围
export const getFilingScopeTreeMenu = params => { return postRequestForm('/getFilingScopeTreeMenu', params).then(res => res.data) }//获取归档范围表
export const upFilingScopeNodeCode = params => { return postRequestForm('/upFilingScopeNodeCode', params).then(res => res.data) }//修改归档范围

// 归档章-------------------------------------------------------------------------
export const getArchivesSeal = params => { return postRequestForm('/getArchivesSeal', params).then(res => res.data) }//获取当前表归档章
export const addArchivesSeal = (params) => { return postRequestJSON('/addArchivesSeal', params).then(res => res.data) }//添加当前表归档章

//导入导出文件
export const exportTable = (params) => { return downloadRequest('/file/exportTable', params).then(res => res) }//导出GET /file/exportTable
export const exportTableDataNumbers = (params) => { return getRequest('/file/exportTableDataNumbers', params).then(res => res.data) }//导出GET /file/exportTable

//校验
export const verification = (params) => { return getRequest('/file/verification', params).then(res => res.data) }//校验GET /file/verification
//原文数量更新
export const originalSizeCalibrate = (params) => { return getRequest('/file/originalSizeCalibrate', params).then(res => res.data) }//原文数量更新GET /file/originalSizeCalibrate
