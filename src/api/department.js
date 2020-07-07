import { getRequest, postRequestForm, postRequestJSON } from "./api";

// 部门-------------------------------------------------------------------------
//获取所属部门
export const getDepartmentTree = params => {
  return getRequest("/department/getDepartementTree").then(res => res.data);
};
//获取全宗对应的部门
export const getSystemFondsDepartment = params => {
  return getRequest("/department/getSystemFondsDepartment", params).then(
    res => res.data
  );
};
//添加部门
export const addDepartment = params => {
  return postRequestJSON("/department/addDepartment", params).then(
    res => res.data
  );
};
//删除部门
export const deleteDepartment = params => {
  return postRequestForm("/department/deleteDepartment", params).then(
    res => res.data
  );
};
//修改部门
export const updateDepartment = params => {
  return postRequestJSON("/department/updateDepartment", params).then(
    res => res.data
  );
};
//查询部门
export const selectDepartment = params => {
  return getRequest("/department/selectDepartment", params).then(
    res => res.data
  );
};
