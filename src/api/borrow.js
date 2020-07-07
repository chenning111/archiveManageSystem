import {
  getRequest,
  postRequestForm,
  postRequestJSON,
  putRequestForm,
  deleteRequest,
  downloadRequest
} from "./api";
export const getUseLend = params => {
  return getRequest("/userLend/getUseLend", params).then(res => res.data);
}; //获取用户借阅列表GET /userLend/getUseLend

// 借阅-------------------------------------------------------------------------
//提交借阅
export const applyLend = params => {
  return postRequestForm("/userLend/applyLend", params).then(res => res.data);
};
//获取一级借阅列表GET /userLend/firstGetUseLend
export const firstGetUseLend = params => {
  return getRequest("/userLend/firstGetUseLend", params).then(res => res.data);
};
//一级审核PUT /userLend/firstCheck
export const firstCheck = params => {
  return putRequestForm("/userLend/firstCheck", params).then(res => res.data);
};
//获取二级借阅列表GET /userLend/secondGetUseLend
export const secondGetUseLend = params => {
  return getRequest("/userLend/secondGetUseLend", params).then(res => res.data);
};
//二级审核PUT /userLend/secondCheck
export const secondCheck = params => {
  return putRequestForm("/userLend/secondCheck", params).then(res => res.data);
};
//获取收回和借出列表GET /userLend/lendAndBack
export const lendAndBack = params => {
  return getRequest("/userLend/lendAndBack", params).then(res => res.data);
};
//处理收回借出归还PUT /userLend/takeBackAndLend
export const takeBackAndLend = params => {
  return putRequestForm("/userLend/takeBackAndLend", params).then(
    res => res.data
  );
};
//根据档案编号处理收回借出归还PUT /userLend/takeBackAndLendByLendCode
export const takeBackAndLendByLendCode = params => {
  return putRequestForm("/userLend/takeBackAndLendByLendCode", params).then(
    res => res.data
  );
};
//填写利用反馈PUT /userLend/useFeedback
export const useFeedback = params => {
  return putRequestForm("/userLend/useFeedback", params).then(res => res.data);
};

//利用历史
//获取利用历史列表
export const retrieveHistoricalUseBean = params => {
  return getRequest("/userLend/retrieveHistoricalUseBean", params).then(
    res => res.data
  );
};
//删除利用历史
export const deleteHistoricalUseBean = params => {
  return deleteRequest("/userLend/deleteHistoricalUseBean", params).then(
    res => res.data
  );
};
//下载利用历史
export const downLoadHistoricalUse = params => {
  return downloadRequest("/userLend/downLoadHistoricalUse", params).then(
    res => res
  );
};
//获取利用历史path
export const retrieveHistoricalUsePath = params => {
  return getRequest("/userLend/retrieveHistoricalUsePath", params).then(
    res => res.data
  );
};
