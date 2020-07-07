import { getRequest, postRequestForm, deleteRequest, downloadRequest, putRequestForm } from './api'
export const retrieveTransfer = (params) => { return getRequest('/transfer/retrieveTransfer', params).then(res => res.data) }//获取移交清册
export const commitTransfer = (params) => { return postRequestForm('/transfer/commitTransfer', params).then(res => res.data) }//添加
export const deleteTransfer = (params) => { return deleteRequest('/transfer/deleteTransfer', params).then(res => res.data) }//删除 DELETE /transfer/deleteTransfer
export const downloadTransferFile = (params) => { return downloadRequest('/transfer/downloadTransferFile', params).then(res => res) }//下载
export const updateTransfer = (params) => { return putRequestForm('/transfer/updateTransfer', params).then(res => res.data) }//修改