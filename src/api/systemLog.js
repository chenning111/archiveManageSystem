import { getRequest, postRequestJSON } from './api'
export const retrieveSystemLog = params => { return getRequest('/systemLog/retrieveSystemLog', params).then(res => res.data) } //查询日志列表GET /systemLog/retrieveSystemLog
