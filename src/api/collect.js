import { getRequest, postRequestForm, postRequestJSON } from "./api";

//收藏-------------------------------------------------------------------------
//收藏档案
export const addCollection = params => {
  return postRequestForm("/addCollection", params).then(res => res.data);
};
//添加收藏夹
export const addCreateCollectionFiles = params => {
  return postRequestForm("/addCreateCollectionFiles", params).then(
    res => res.data
  );
};
//删除收藏条目
export const delCollectionByUserCode = params => {
  return postRequestForm("/delCollectionByUserCode", params).then(
    res => res.data
  );
};
//删除收藏夹
export const delCreateCollectionFiles = params => {
  return postRequestForm("/delCreateCollectionFiles", params).then(
    res => res.data
  );
};
//获取收藏的档案列表
export const getAllCollectionByUserCode = params => {
  return postRequestForm("/getAllCollectionByUserCode", params).then(
    res => res.data
  );
};
//获取收藏夹列表
export const getAllCreateCollectionFiles = params => {
  return postRequestForm("/getAllCreateCollectionFiles").then(res => res.data);
};
//获取是否收藏
export const getThisIsCollection = params => {
  return postRequestForm("/getThisIsCollection", params).then(res => res.data);
};
