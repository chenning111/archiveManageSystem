import { getRequest, postRequestForm, postRequestJSON } from './api'

// 鉴定-------------------------------------------------------------------------
export const retrieveDestroyJudgeArchive = params => { return getRequest('/judge/retrieveDestroyJudgeArchive', params).then(res => res.data) } //获取鉴定档案信息
export const retrieveStorageTime = (params) => { return getRequest('/judge/retrieveStorageTime', params).then(res => res.data) }//获取表对应保管期限
export const insertDestroyJudge = (params) => { return postRequestForm('/judge/insertDestroyJudge', params).then(res => res.data) }//提交鉴定
export const retrieveFirstDestroyJudgeOpinionMsg = (params) => { return getRequest('/judge/retrieveFirstDestroyJudgeOpinionMsg', params).then(res => res.data) }//获取一级鉴定信息
export const approvalDestroyJudgeOpinion = (params) => { return postRequestForm('/judge/approvalDestroyJudgeOpinion', params).then(res => res.data) }//小组鉴定

export const retrieveDestroyInfo = (params) => { return getRequest('/judge/retrieveDestroyInfo', params).then(res => res.data) }//获取销毁清册
export const destroyOpinionByRecordCodes = (params) => { return postRequestForm('/judge/destroyOpinionByRecordCodes', params).then(res => res.data) }//根据记录编号确认销毁
export const cancelDestroyByRecordCodes = (params) => { return postRequestForm('/judge/cancelDestroyByRecordCodes', params).then(res => res.data) }//根据记录编号取消销毁
export const retrieveDestroyInfoByRecordCodes = (params) => { return getRequest('/judge/retrieveDestroyInfoByRecordCodes', params).then(res => res.data) }//根据记录编号获取销毁清册GET 