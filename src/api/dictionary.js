import { getRequest, postRequestJSON } from "./api";

//辅助字典-------------------------------------------------------------------------
//查询辅助字典目录
export const selecSystemDictionaryCatalog = params => {
  return getRequest("/selecSystemDictionaryCatalog", params).then(
    res => res.data
  );
};
//新增辅助字典目录
export const addSystemDictionaryCatalog = params => {
  return postRequestJSON("/addSystemDictionaryCatalog", params).then(
    res => res.data
  );
};
//修改辅助字典目录
export const updateSystemDictionaryCatalog = params => {
  return postRequestJSON("/updateSystemDictionaryCatalog", params).then(
    res => res.data
  );
};
//删除辅助字典目录

export const deleteSystemDictionaryCatalog = params => {
  return postRequestJSON("/deleteSystemDictionaryCatalog", params).then(
    res => res.data
  );
};
//辅助字典细目-------------------------------------------------------------------------
//查询辅助字典细目
export const selecSystemDictionary = params => {
  return getRequest("/selecSystemDictionary", params).then(res => res.data);
};
//新增辅助字典细目
export const addSystemDictionary = params => {
  return postRequestJSON("/addSystemDictionary", params).then(res => res.data);
};
//修改辅助字典细目
export const updateSystemDictionary = params => {
  return postRequestJSON("/updateSystemDictionary", params).then(
    res => res.data
  );
};
//删除辅助字典细目
export const deleteSystemDictionary = params => {
  return postRequestJSON("/deleteSystemDictionary", params).then(
    res => res.data
  );
};
