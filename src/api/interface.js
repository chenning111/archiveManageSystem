import { getRequest, postRequestForm, postRequestJSON, deleteRequest, putRequestJSON, downloadRequest, putRequestForm } from './api'
export const retrieveInterfaceLog = params => { return getRequest('/interface/retrieveInterfaceLog', params).then(res => res.data) }//GET /interface/retrieveInterfaceLog  获取接口日志
export const retrieveInterfaceTimeNumbers = params => { return getRequest('/interface/retrieveInterfaceTimeNumbers', params).then(res => res.data) }//GET /interface/retrieveInterfaceTimeNumbers 获取接口来源对应日期数量
export const retrieveListMsg = params => { return getRequest('/interface/retrieveListMsg', params).then(res => res.data) }//GET /interface/retrieveListMsg获取清单信息
export const retrieveInterfaceNumbers = params => { return getRequest('/interface/retrieveInterfaceNumbers', params).then(res => res.data) }//GET /interface/retrieveInterfaceNumbers 获取接口来源底层门类档案
