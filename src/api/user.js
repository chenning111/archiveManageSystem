import {
  getRequest,
  postRequestForm,
  postRequestJSON,
  putRequestForm
} from "./api";
//用户
export const loginCheck = params => {
  return postRequestForm("/user/login", params).then(res => res.data);
}; //登录
export const loginOut = params => {
  return getRequest("/user/logout").then(res => res.data);
}; //退出登录
export const retrieveUserMsg = params => {
  return getRequest("/user/retrieveUserMsg").then(res => res.data);
}; //获取用户信息i
export const upThemeColor = params => {
  return postRequestForm("/upThemeColor", params).then(res => res.data);
}; //修改主题色
export const addUser = params => {
  return postRequestJSON("/user/addUser", params).then(res => res.data);
}; //新增用户
export const deleteUser = params => {
  return postRequestForm("/user/deleteUser", params).then(res => res.data);
}; //删除用户
export const queryUsers = params => {
  return getRequest("/user/queryUsers", params).then(res => res.data);
}; //查询用户
export const updateUser = params => {
  return postRequestJSON("/user/updateUser", params).then(res => res.data);
}; //修改用户

//角色
export const addRole = params => {
  return postRequestJSON("/user/addRole", params).then(res => res.data);
}; //新增角色
export const deleteRole = params => {
  return postRequestForm("/user/deleteRole", params).then(res => res.data);
}; //删除角色
export const queryRoles = params => {
  return getRequest("/user/queryRoles", params).then(res => res.data);
}; //查询角色
export const updateRole = params => {
  return postRequestJSON("/user/updateRole", params).then(res => res.data);
}; //修改角色
export const roleAddUsers = params => {
  return postRequestForm("/user/roleAddUsers", params).then(res => res.data);
}; //角色添加用户
//修改密码
export const updatePassWord = params => {
  return postRequestForm("/user/updatePassword", params).then(res => res.data);
}; //修改密码

//权限
export const getResourceTree = params => {
  return getRequest("/user/getResourceTree", params).then(res => res.data);
}; //获取资源树
export const getUserResource = params => {
  return getRequest("/user/getUserResource", params).then(res => res.data);
}; //获取角色资源树
export const resourceAllocation = params => {
  return postRequestForm("/user/resourceAllocation", params).then(
    res => res.data
  );
}; //获取角色资源树POST /user/resourceAllocation
// export const getDataResourceTree = params => { return getRequest('/user/getDataResourceTree', params).then(res => res.data) }//获取数据权限实体分类树 GET /user/getDataResourceTree
export const createResource = params => {
  return postRequestJSON("/user/createResource", params).then(res => res.data);
}; //新增资源树
export const updateResource = params => {
  return postRequestJSON("/user/updateResource", params).then(res => res.data);
}; //修改角色资源树
export const deleteResource = params => {
  return getRequest("/user/deleteResource", params).then(res => res.data);
}; //删除资源

export const retrieveRoleDateResource = params => {
  return getRequest("/user/retrieveRoleDateResource", params).then(
    res => res.data
  );
}; //获取用户数据权限GET /user/retrieveRoleDateResource
export const createRoleDateResource = params => {
  return postRequestJSON("/user/createRoleDateResource", params).then(
    res => res.data
  );
}; //新增修改用户数据权限
export const topResource = params => {
  return putRequestForm("/user/topResource", params).then(res => res.data);
}; //新增修改用户数据权限
