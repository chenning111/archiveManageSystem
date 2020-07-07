import { getCatalogTree } from "@/api/archiveCatalog";
import { getAllSystemFonds } from "@/api/fondsNo";

const state = {
  fondsList: JSON.parse(sessionStorage.getItem("fondsList")) || [],
  catalogtree: []
};
const mutations = {
  SET_FONDSLIST: (state, list) => {
    state.fondsList = list;
    sessionStorage.setItem("fondsList", JSON.stringify(list));
  },
  GET_CATALOG_TREE: (state, catalogtree) => {
    state.catalogtree = catalogtree;
  }
};
const actions = {
  getFondsList({ commit }) {
    //获取全宗
    return new Promise(resolve => {
      let fondsListStr = sessionStorage.getItem("fondsList");
      if (fondsListStr != "null" && fondsListStr != null) {
        commit("SET_FONDSLIST", JSON.parse(fondsListStr));
        resolve(JSON.parse(fondsListStr));
      } else {
        getAllSystemFonds()
          .then(res => {
            commit("SET_FONDSLIST", res.data);
            resolve(res.data);
          })
          .catch(() => {
            commit("SET_FONDSLIST", []);
            resolve([]);
          });
      }
    });
  },
  getCatalogTree({ commit }, obj) {
    //获取实体分类
    return new Promise(resolve => {
      let params = {
        fondscode: obj.fondsCode,
        classnodeId: obj.classnodeId,
        parentcatalogcode: obj.parentcatalogcode
      };
      getCatalogTree(params)
        .then(res => {
          if (res.success) {
            let data = res.data;
            handleAddTextAndId(data);
            commit("GET_CATALOG_TREE", data);
            resolve(data);
          } else {
            resolve([]);
          }
        })
        .catch(error => {
          commit("GET_CATALOG_TREE", []);
          resolve([]);
        });
    });
  }
};
export default {
  namespaced: true,
  state,
  mutations,
  actions
};
import { getCatalogNo } from "@/common/js/util";

function handleAddTextAndId(tree) {
  //给部门树和实体分类树添加组件显示的label
  for (let i = 0; i < tree.length; i++) {
    let label = getCatalogNo(tree[i].id);
    tree[i].textId = label + " -- " + tree[i].text;
    if (tree[i].children && tree[i].children.length > 0) {
      handleAddTextAndId(tree[i].children);
    } else {
      tree[i].children = null;
    }
  }
  return tree;
}
