//库房
import { getRequest, postRequestForm, postRequestJSON, deleteRequest, putRequestJSON } from './api'
export const retrieveStorerooms = params => { return getRequest('/storeroom/retrieveStorerooms', params).then(res => res.data) } //获取库房信息
export const createStoreroom = params => { return postRequestJSON('/storeroom/createStoreroom', params).then(res => res.data) } //新增库房POST /storeroom/createStoreroom
export const updateStoreroom = params => { return postRequestJSON('/storeroom/updateStoreroom', params).then(res => res.data) } //修改库房信息POST /storeroom/updateStoreroom
export const deleteStoreroom = params => { return postRequestForm('/storeroom/deleteStoreroom', params).then(res => res.data) } //删除库房POST /storeroom/deleteStoreroom

//密集架
export const retrieveShelf = params => { return getRequest('/storeroom/retrieveShelf', params).then(res => res.data) } //获取密集架GET /storeroom/retrieveShelf
export const createShelf = params => { return postRequestJSON('/storeroom/createShelf', params).then(res => res.data) } //新增密集架POST /storeroom/createShelf
export const updateShelf = params => { return postRequestJSON('/storeroom/updateShelf', params).then(res => res.data) } //修改密集架POST /storeroom/updateShelf
export const deleteShelf = params => { return postRequestForm('/storeroom/deleteShelf', params).then(res => res.data) } //删除密集架POST /storeroom/deleteShelf

//密集架格子
export const retrieveCells = params => { return getRequest('/storeroom/retrieveCells', params).then(res => res.data) } //获取密集架格子GET GET /storeroom/retrieveCells
export const retrieveCell = params => { return getRequest('/storeroom/retrieveCell', params).then(res => res.data) } //获取密集架格子GET /storeroom/retrieveCell

//档案上架
export const createCellArchive = params => { return postRequestForm('/storeroom/createCellArchive', params).then(res => res.data) } //档案上架POST /storeroom/createCellArchive
export const deleteCellArchive = params => { return deleteRequest('/storeroom/deleteCellArchive', params).then(res => res.data) } //档案上架DELETE /storeroom/deleteCellArchive

//库房温湿度
export const retrieveStoreStandard = params => { return getRequest('/storeroom/retrieveStoreStandard').then(res => res.data) } //获取参数GET /storeroom/retrieveStoreStandard
export const updateStoreStandard = params => { return putRequestJSON('/storeroom/updateStoreStandard', params).then(res => res.data) } //修改参数PUT /storeroom/updateStoreStandard、

export const retrieveStoreRegister = params => { return getRequest('/storeroom/retrieveStoreRegister', params).then(res => res.data) } //获取温湿度GET /storeroom/retrieveStoreRegister
export const createStoreRegister = params => { return postRequestJSON('/storeroom/createStoreRegister', params).then(res => res.data) } //新增温湿度POST /storeroom/createStoreRegister
export const updateStoreRegister = params => { return putRequestJSON('/storeroom/updateStoreRegister', params).then(res => res.data) } //修改温湿度PUT /storeroom/updateStoreRegister
export const deleteStoreRegister = params => { return deleteRequest('/storeroom/deleteStoreRegister', params).then(res => res.data) } //删除温湿度DELETE /storeroom/deleteStoreRegister
