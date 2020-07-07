import { getRequest, postRequestForm, postRequestJSON ,putRequestForm,deleteRequest} from './api'
export const updateUpLoadFilePath = params =>{ return putRequestForm('/updateUpLoadFilePath', params).then(res => res.data) }// PUT /updateUpLoadFilePath修改文件上传路径的信息
export const getUpLoadFilePath = params => { return getRequest('/getUpLoadFilePath', params).then(res => res.data) }// 获取文件上传路径的信息
export const getUpLoadFilePathNodeCodes = params => { return getRequest('/getUpLoadFilePathNodeCodes').then(res => res.data) }// 获取已设置过的nodecode集合
export const deleteUpLoadFilePath = params => { return deleteRequest('/deleteUpLoadFilePath', params).then(res => res.data) }// DELETE /deleteUpLoadFilePath删除文件上传的路径信息
export const creatUpLoadFilePath = params => { return postRequestJSON('/creatUpLoadFilePath', params).then(res => res.data) }// POST /creatUpLoadFilePath新增文件上传的路径信息

