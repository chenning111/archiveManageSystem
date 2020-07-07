import { getRequest, postRequestForm, postRequestJSON } from "./api";
//统计
export const retrieveUserStatistic = params => {
  return getRequest("/statistic/retrieveUserStatistic").then(res => res.data);
}; //获取用户在线信息GET /statistic/retrieveUserStatistic
export const retrieveLoginStatistic = params => {
  return getRequest("/statistic/retrieveLoginStatistic", params).then(
    res => res.data
  );
}; //获取用户登录情况统计数据 GET /statistic/retrieveLoginStatistic
export const retrieveSearchArchiveStatistic = params => {
  return getRequest("/statistic/retrieveSearchArchiveStatistic", params).then(
    res => res.data
  );
}; //GET /statistic/retrieveSearchArchiveStatistic获取用户查档情况统计数据
export const retrieveArchiveStatistic = params => {
  return getRequest("/statistic/retrieveArchiveStatistic", params).then(
    res => res.data
  );
}; //获取全宗底层门类统计数据GET /statistic/retrieveArchiveStatistic
export const retrieveOriginalFilesSize = params => {
  return getRequest("/statistic/retrieveOriginalFilesSize", params).then(
    res => res.data
  );
}; //获取原文大小GET /statistic/retrieveOriginalFilesSize
export const retrieveSystemDataCount = params => {
  return getRequest("/statistic/retrieveSystemDataCount", params).then(
    res => res.data
  );
}; //获取历史统计数据 GET /statistic/retrieveSystemDataCount
export const categoryStatistic = params => {
  return getRequest("/statistic/categoryStatistic", params).then(
    res => res.data
  );
}; //z综合门类统计 GET /statistic/categoryStatistic
export const retrieveUseStatisticMsg = params => {
  return getRequest("/statistic/retrieveUseStatisticMsg", params).then(
    res => res.data
  );
}; //利用统计报表 GET /statistic/retrieveUseStatisticMsg
export const retrieveUseStatisticPictureMsg = params => {
  return getRequest("/statistic/retrieveUseStatisticPictureMsg", params).then(
    res => res.data
  );
}; //利用统计图表GET /statistic/retrieveUseStatisticPictureMsg
