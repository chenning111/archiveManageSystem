
import { getRequest, postRequestForm, postRequestJSON, downloadRequest } from './api'

//原文-------------------------------------------------------------------------
export const download = params => { return downloadRequest('/download', params).then(res => res) }//下载文件


export const getOriginaFileSByRecordCode = params => { return postRequestForm('/getOriginaFileSByRecordCode', params).then(res => res.data) } //获取原文信息
export const upOriginaFilesArchives = params => { return postRequestForm('/upOriginaFilesArchives', params).then(res => res.data) } //删除撤回条目信息
export const getOriginaFilesArchives = params => { return postRequestForm('/getOriginaFilesArchives', params).then(res => res.data) } //获取条目信息
// export const upLoadFiles = params => { return uploadFileRequest('/upLoadFiles', params).then(res => res.data) } //上传文件
export const upTopByFileCode = params => { return postRequestForm('/upTopByFileCode', params).then(res => res.data) } //置顶
export const upOriginaFilesByFileCode = params => { return postRequestForm('/upOriginaFilesByFileCode', params).then(res => res.data) } //修改条目信息
export const getPDFUrlByParameter = params => { return postRequestForm('/getPDFUrlByParameter', params).then(res => res.data) } ///获取pdf查看路径
export const upWatermarkTxt = params => { return postRequestForm('/upWatermarkTxt', params).then(res => res.data) } ///添加水印
export const getWatermarkTxt = params => { return postRequestForm('/getWatermarkTxt').then(res => res.data) } ///获取之前添加的水印
export const originalSynthesis = params => { return postRequestForm('/originalSynthesis', params).then(res => res.data) } ///一键合成pdfPOST /originalSynthesis
