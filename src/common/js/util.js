import { selecSystemDictionary } from "@/api/dictionary";
//换肤加class函数
export const toggleClass = (element, className) => {
  if (!element || !className) {
    return;
  }
  element.className = className;
};
//件号 页号 页数  案卷号
//num传入的值 n代表显示的位数  传(''，4)代表0000 name代表字段名 有的不需要补0返回档号 CATALOGCODE代表选择的实体对应的code
export const PrefixZero = (val, n, name) => {
  let needPreFixZero = ["pieceNo", "yearFolderNo", "quantity", "pageNo"];
  if (val == "" || val == "undefined" || val == undefined) {
    val = 0;
  }
  if (needPreFixZero.includes(name)) {
    n = Number(n);
    return (Array(n).join(0) + val).slice(-n);
  } else {
    if (name == "archiveCatalogNo") {
      //如果是实体分类号 取最后的值 且长度保持不变
      return getCatalogNo(val);
    } else {
      return val;
    }
  }
};
export const getCatalogNo = function(val) {
  getCatalogCodeList(val);
  return getCode(val);
};
let catalogCodeList = [];
function getCatalogCodeList(num) {
  if (catalogCodeList.length == 0) {
    let params = {
      limit: 999,
      star: 1,
      dictionarycatalogcode: "catalogCode"
    };
    selecSystemDictionary(params).then(res => {
      if (res.success) {
        let arr = res.data.list || [];
        catalogCodeList = arr.map(t => {
          return {
            id: t.code,
            label: t.name
          };
        });
        getCode(num);
      }
    });
  } else {
    getCode(num);
  }
}
function getCode(num) {
  num = String(num);
  if (catalogCodeList.find(val => val.id === num)) {
    return num;
  }
  if (num.lastIndexOf(".") > -1) {
    return num.substr(num.lastIndexOf(".") + 1);
  } else {
    return num;
  }
}
//将数字转化成中文 例如1 => 一   11=>十一 0=> ""
export const toChinesNum = num => {
  let changeNum = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"]; //changeNum[0] = "零"
  let unit = ["", "十", "百", "千", "万"];
  num = parseInt(num);
  let getWan = temp => {
    let strArr = temp
      .toString()
      .split("")
      .reverse();
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum =
        (i == 0 && strArr[i] == 0
          ? ""
          : i > 0 && strArr[i] == 0 && strArr[i - 1] == 0
          ? ""
          : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i])) +
        newNum;
    }
    return newNum;
  };
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = "0" + noWan;
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
};
// 对比两个对象的值是否完全相等 返回值 true/false
export const isObjectValueEqual = (a, b) => {
  //取对象a和b的属性名
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  //判断属性名的length是否一致
  if (aProps.length != bProps.length) {
    return false;
  }
  //循环取出属性名，再判断属性值是否一致
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
};

//下载文件  文件名和下载地址
export const downloadFile = (filename, data) => {
  //ie10
  let blob = new Blob([data]);
  if (window.navigator.msSaveBlob) {
    try {
      console.log("ie");
      window.navigator.msSaveBlob(blob, filename);
    } catch (e) {
      console.log(e);
    }
  } else {
    //谷歌
    const url = window.URL.createObjectURL(blob);
    let DownloadLink = document.createElement("a");

    if (DownloadLink) {
      document.body.appendChild(DownloadLink);
      DownloadLink.style.display = "none";
      DownloadLink.download = filename || "";

      DownloadLink.href = url;
      if (document.createEvent) {
        let DownloadEvt = document.createEvent("MouseEvents");
        DownloadEvt.initEvent("click", true, false);
        DownloadLink.dispatchEvent(DownloadEvt);
      } else if (document.createEventObject) DownloadLink.fireEvent("onclick");
      else if (typeof DownloadLink.onclick == "function")
        DownloadLink.onclick();
      document.body.removeChild(DownloadLink);
      window.URL.revokeObjectURL(url);
    }
  }
};

//深克隆 拷贝对象obj
export const deepClone = source => {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "deepClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach(keys => {
    if (source[keys] && typeof source[keys] === "object") {
      targetObj[keys] = deepClone(source[keys]);
    } else {
      targetObj[keys] = source[keys];
    }
  });
  return targetObj;
};

// tpye C表示角色分类名 D表示角色名
export const roleGroupDataName = [
  {
    groupCode: "A",
    groupName: "系统管理角色",
    children: [],
    type: "C",
    name: "系统管理角色"
  },
  {
    groupCode: "M",
    groupName: "档案管理角色",
    children: [],
    type: "C",
    name: "档案管理角色"
  },
  {
    groupCode: "L",
    groupName: "领导角色",
    children: [],
    type: "C",
    name: "领导角色"
  },
  {
    groupCode: "C",
    groupName: "一般利用角色",
    children: [],
    type: "C",
    name: "一般利用角色"
  },
  {
    groupCode: "P",
    groupName: "普通角色",
    children: [],
    type: "C",
    name: "普通角色"
  },
  {
    groupCode: "E",
    groupName: "审核审批角色",
    children: [],
    type: "C",
    name: "审核审批角色"
  }
];
//获取角色树形数据
export const getRoleGroupList = list => {
  let data = deepClone(roleGroupDataName);
  if (list && list.length > 0) {
    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < data.length; j++) {
        if (list[i].category == data[j].groupCode) {
          list[i].type = "D";
          list[i].id = list[i].rolecode;
          list[i].parentName = data[j].groupName;
          data[j].children.push(list[i]);
          data[j].id = data[j].groupCode;
          break;
        }
      }
    }
    return data;
  } else {
    return [];
  }
};
//获取当前角色属于哪一类
export const getRoleType = type => {
  let name = "";
  switch (type) {
    case "A":
      name = "系统管理角色";
      break;
    case "M":
      name = "档案管理角色";
      break;
    case "L":
      name = "领导角色";
      break;
    case "C":
      name = "一般利用角色";
      break;
    case "P":
      name = "普通角色";
      break;
    case "E":
      name = "审核审批角色";
      break;
    default:
      name = "暂无分类";
  }
  return name;
};

//查找树形数据节点 arr是查找到的节点数组
export function deepQuery(tree, id, arr) {
  for (var i = 0; i < tree.length; i++) {
    if (tree[i].id == id) {
      arr.push(tree[i]);
      return arr;
    } else {
      if (tree[i].hasOwnProperty("children") && tree[i].children) {
        if (tree[i].children.length > 0) {
          deepQuery(tree[i].children, id, arr);
        }
      }
    }
  }
  return arr;
}
//查找树形数据节点 返回当前节点和父节点 返回数组 生成面包屑用到
export function familyTree(tree, id, parentId, prop) {
  var temp = [];
  var forFn = function(arr, id) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var p = "id";
      if (prop) {
        p = prop;
      }
      if (item[p] == id) {
        temp.push(item);
        let parentCode = item[parentId];
        forFn(tree, parentCode);
        break;
      } else {
        if (item.children) {
          forFn(item.children, id);
        }
      }
    }
  };
  forFn(tree, id);
  return temp;
}
//查找树形数据节点 返回当前节点对象 可传需要获取的属性名
export function getDataFromId(tree, id, prop) {
  var temp = null;
  var forFn = function(arr, id) {
    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var p = "id";
      if (prop) {
        p = prop;
      }
      if (item[p] == id) {
        temp = item;
        break;
      } else {
        if (item.children) {
          forFn(item.children, id);
        }
      }
    }
  };
  forFn(tree, id);
  return temp;
}
//树形数据节点添加属性  prop 指定添加的属性 originProp原数据属性
export function addTreeAttr(tree, prop, originProp) {
  for (var j = 0; j < tree.length; j++) {
    tree[j][prop] = tree[j][originProp]; //添加属性
    if (tree[j].children && tree[j].children.length > 0) {
      addTreeAttr(tree[j].children, prop, originProp);
    }
  }
  return tree;
}
//数组去重
export function uniqueArr(arr) {
  return Array.from(new Set(arr));
}
//获取随机16进制的颜色
export function getColor() {
  //定义字符串变量colorValue存放可以构成十六进制颜色值的值
  var colorValue = "0,1,2,3,4,5,6,7,8,9,a,b,c,d,e,f";
  //以","为分隔符，将colorValue字符串分割为字符数组["0","1",...,"f"]
  var colorArray = colorValue.split(",");
  var color = "#"; //定义一个存放十六进制颜色值的字符串变量，先将#存放进去
  //使用for循环语句生成剩余的六位十六进制值
  for (var i = 0; i < 6; i++) {
    //colorArray[Math.floor(Math.random()*16)]随机取出
    // 由16个元素组成的colorArray的某一个值，然后将其加在color中，
    //字符串相加后，得出的仍是字符串
    color += colorArray[Math.floor(Math.random() * 16)];
  }
  return color;
}
