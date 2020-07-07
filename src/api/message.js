import { getRequest, postRequestForm, postRequestJSON } from './api'

// 消息-------------------------------------------------------------------------
export const readMessage = params => { return postRequestForm('/message/readMessage', params).then(res => res.data) } //读取站内消息
export const retrieveMessage = (params) => { return getRequest('/message/retrieveMessage', params).then(res => res.data) }//获取站内消息
export const sendMessage = (params) => { return postRequestJSON('/message/sendMessage', params).then(res => res.data) }//发送站内消息