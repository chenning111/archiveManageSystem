
import { getRequest, postRequestJSON } from './api'
//全宗
export const getAllSystemFonds = params => { return getRequest('/getAllSystemFonds').then(res => res.data) } //获取全宗
export const addSystemFonds = (params) => { return postRequestJSON('/addSystemFonds', params).then(res => res.data) }//添加全宗
export const addSystemFondsDepartment = (params) => { return postRequestJSON('/addSystemFondsDepartment', params).then(res => res.data) }//添加全宗部门
export const deleteSystemFonds = (params) => { return postRequestJSON('/deleteSystemFonds', params).then(res => res.data) }//删除全宗
export const updateSystemFonds = (params) => { return postRequestJSON('/updateSystemFonds', params).then(res => res.data) }//修改全宗