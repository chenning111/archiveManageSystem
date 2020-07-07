import { getRequest, postRequestForm, postRequestJSON } from './api'

//列表展示和录入视图-------------------------------------------------------------------------
export const getTableViewTree = params => { return getRequest('/getTableViewTree').then(res => res.data) } //获取界面目录树
export const getTableView = params => { return postRequestForm('/getTableView', params).then(res => res.data) } //获取当前实体表表格内容  
export const getInputCard = params => { return postRequestForm('/getInputCard', params).then(res => res.data) } //获取当前实体表录入视图列
export const addTableInfo = params => { return postRequestForm('/addTableInfo', params).then(res => res.data) } //添加数据
export const upArchives = params => { return postRequestForm('/upArchives', params).then(res => res.data) } //删除撤回表数据
export const getArchives = params => { return postRequestForm('/getArchives', params).then(res => res.data) } //获取表数据
export const upArchivesByRecordCode = params => { return postRequestForm('/upArchivesByRecordCode', params).then(res => res.data) } //修改表数据
export const updateArchivesFiled = params => { return postRequestForm('/updateArchivesFiled', params).then(res => res.data) } //批量放入预归档
export const updateArchives = params => { return postRequestForm('/updateArchives', params).then(res => res.data) } //批量放入归档
export const updateNoArchives = params => { return postRequestForm('/updateNoArchives', params).then(res => res.data) } //批量放入不归档
export const getJHMaxBysystemNoFormat = params => { return postRequestForm('/getJHMaxBysystemNoFormat', params).then(res => res.data) } //查询最大件号
export const getGroup = params => { return postRequestForm('/getGroup', params).then(res => res.data) } //获取分组项
export const getRelationByCNodeCode = params => { return getRequest('/getRelationByCNodeCode', params).then(res => res.data) } //获取实体表关系