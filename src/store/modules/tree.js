import { getTableViewTree } from "@/api/tableView";
import { getDepartmentTree } from "@/api/department";
import { Message } from "element-ui";
const state = {
  tableViewTree: {
    li_attr: {
      TYPE: "I"
    }
  }, //门类树,
  departmentTree: JSON.parse(sessionStorage.getItem("departmentTree")) || [] //部门树
};
const mutations = {
  GET_TABLE_VIEW_TREE: (state, tableViewTree) => {
    state.tableViewTree = tableViewTree;
    sessionStorage.setItem("tableViewTreeStr", JSON.stringify(tableViewTree));
  },
  GET_DEPARTMENT_TREE: (state, departmentTree) => {
    state.departmentTree = departmentTree;
    sessionStorage.setItem("departmentTree", JSON.stringify(departmentTree));
  }
};
const actions = {
  tableViewTree({ commit }) {
    //获取目录树
    return new Promise((resolve, reject) => {
      let tableViewTreeStr = sessionStorage.getItem("tableViewTreeStr");
      if (tableViewTreeStr != "null" && tableViewTreeStr != null) {
        commit("GET_TABLE_VIEW_TREE", JSON.parse(tableViewTreeStr));
        resolve(JSON.parse(tableViewTreeStr));
      } else {
        getTableViewTree()
          .then(res => {
            if (res.success) {
              //隐藏 编研 资料和文件节点 保留档案和电子文件
              let data = handleHideData(res.data);
              commit("GET_TABLE_VIEW_TREE", res.data);
              resolve(res.data);
            } else {
              Message.error(data.msg);
              reject();
            }
          })
          .catch(err => {
            reject();
          });
      }
    });
  },
  departmentTree({ commit }) {
    //部门树
    return new Promise((resolve, reject) => {
      let departentStr = sessionStorage.getItem("departmentTree");
      if (departentStr != "null" && departentStr != null) {
        commit("GET_DEPARTMENT_TREE", JSON.parse(departentStr));
        resolve(JSON.parse(departentStr));
      } else {
        getDepartmentTree()
          .then(data => {
            if (data.success) {
              handleAddTextAndId(data.data);
              commit("GET_DEPARTMENT_TREE", data.data);
              resolve(data.data);
            } else {
              Message.error(data.msg);
              reject();
            }
          })
          .catch(err => {
            reject();
          });
      }
    });
  }
};

function handleHideData(data) {
  if (data.children && data.children.length > 0) {
    data.children = data.children.filter(
      item => item.id === "D_ARCHIVE" || item.id === "D_STUDY"
    );
  }
  return data;
}
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
function handleAddTextAndId(tree) {
  for (let i = 0; i < tree.length; i++) {
    tree[i].textId = tree[i].id + " -- " + tree[i].text;
    if (tree[i].children && tree[i].children.length > 0) {
      handleAddTextAndId(tree[i].children);
    } else {
      tree[i].children = null;
    }
  }
  return tree;
}
