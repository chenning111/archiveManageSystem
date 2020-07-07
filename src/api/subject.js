import { getRequest, postRequestJSON } from './api'
//主题字-------------------------------------------------------------------------
export const selectSubjectFirst = params => { return getRequest('/selectSubjectFirst', params).then(res => res.data) } //查询主题字首字
export const updateSubjectFirst = params => { return postRequestJSON('/updateSubjectFirst', params).then(res => res.data) } //修改主题字首字
export const deleteSubjectFirst = params => { return postRequestJSON('/deleteSubjectFirst', params).then(res => res.data) } //删除主题字首字
export const addSubjectFirst = params => { return postRequestJSON('/addSubjectFirst', params).then(res => res.data) } //添加主题字首字