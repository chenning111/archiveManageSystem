import Vue from "vue";
import Router from "vue-router";
Vue.use(Router);
export const constantRoutes = [
  {
    path: "/login",
    component: () => import("./views/Login.vue"),
    name: "login"
  },

  {
    path: "/404",
    component: () => import("./views/404.vue"),
    name: "404"
  }
];
// keepAlive 页面缓存组件 同时组件必须要设置name
export const asyncRoutes = [
  {
    path: "/",
    component: () => import("./views/Home.vue"),
    redirect: "search",
    children: [
      {
        path: "index",
        component: () => import("./views/Index.vue"),
        name: "index",
        meta: {
          title: "首页"
        }
      },
      {
        path: "search",
        component: () => import("./views/nav/searchLists/Search.vue"),
        name: "search",
        meta: {
          title: "档案检索"
        }
      },
      {
        path: "specialIntelligence",
        component: () => import("./views/nav/searchLists/specialIntelligence"),
        name: "specialIntelligence",
        meta: {
          title: "深度检索"
        }
      },
      {
        path: "specialFulltext",
        component: () => import("./views/nav/searchLists/specialFulltext"),
        name: "specialFulltext",
        meta: {
          title: "全文检索"
        }
      },
      {
        path: "specialCategory",
        component: () => import("./views/nav/searchLists/specialCategory"),
        name: "specialCategory",
        meta: {
          title: "档案门类检索",
          keepAlive: true
        }
      },
      {
        path: "collectSearch",
        component: () => import("./views/nav/searchLists/CollectSearch.vue"),
        name: "collectSearch",
        meta: {
          title: "收藏检索",
          keepAlive: true
        }
      },
      {
        path: "thematicRetrieval",
        component: () =>
          import("./views/nav/searchLists/ThematicRetrieval.vue"),
        name: "thematicRetrieval",
        meta: {
          title: "汇编检索",
          keepAlive: true
        }
      },
      {
        path: "historyArchive",
        component: () => import("./views/nav/searchLists/HistoryArchive.vue"),
        name: "historyArchive",
        meta: {
          title: "我的利用历史"
        }
      },
      {
        path: "useDetail",
        component: () => import("./views/nav/searchLists/UseDetail.vue"),
        name: "useDetail",
        meta: {
          title: "借阅单"
        }
      },
      {
        path: "authorizedRead",
        component: () => import("./views/nav/searchLists/AuthorizedRead.vue"),
        name: "authorizedRead",
        meta: {
          title: "我的申请"
        }
      },
      {
        path: "applyRead",
        component: () => import("./views/search/ApplyRead.vue"),
        name: "applyRead",
        meta: {
          title: "申请借阅"
        }
      },
      {
        path: "searchContent",
        component: () => import("./views/search/SearchContent.vue"),
        name: "searchContent",
        meta: {
          title: "详情"
        }
      },
      {
        path: "noAuthority",
        component: () => import("./views/search/NoAuthority.vue"),
        name: "noAuthority",
        meta: {
          title: "没有内容权限"
        }
      },
      {
        path: "archivesDescription",
        component: () =>
          import("./views/nav/collectionLists/ArchivesDescription.vue"),
        name: "archivesDescription",
        meta: {
          keepAlive: true,
          title: "档案著录"
        }
      },
      {
        path: "dataMonitoring",
        component: () =>
          import("./views/nav/collectionLists/dataMonitoring.vue"),
        name: "dataMonitoring",
        meta: {
          title: "数据监控"
        }
      },
      {
        path: "monitorDetail",
        component: () =>
          import("./views/nav/collectionLists/MonitorDetail.vue"),
        name: "monitorDetail",
        meta: {
          title: "数据监控详情"
        }
      },
      {
        path: "interFace",
        component: () => import("./views/nav/collectionLists/InterFace.vue"),
        name: "interFace",
        redirect: "monitor",
        meta: {
          title: "接口统计",
          keepAlive: true
        },
        children: [
          {
            path: "/monitor",
            name: "系统监控",
            component: () =>
              import("./views/nav/collectionLists/components/monitor.vue"),
            meta: {
              title: "系统监控",
              activeMenu: "interFace"
            }
          },
          {
            path: "/systemState",
            name: "系统状态",
            component: () =>
              import("./views/nav/collectionLists/components/systemState.vue"),
            meta: {
              keepAlive: true,
              title: "系统状态",
              activeMenu: "interFace"
            }
          }
        ]
      },
      {
        path: "formatDefinition",
        component: () => import("./views/nav/reorganizeLists/FormatDefinition"),
        name: "formatDefinition",
        meta: {
          title: "档号格式定义"
        }
      },
      {
        path: "retentionSchedule",
        component: () =>
          import("./views/nav/reorganizeLists/RetentionSchedule"),
        name: "retentionSchedule",
        meta: {
          title: "归档范围和保管期限表"
        }
      },
      {
        path: "dictionary",
        component: () => import("./views/nav/reorganizeLists/Dictionary"),
        name: "dictionary",
        meta: {
          title: "辅助字典设置"
        }
      },
      {
        path: "dictionaryDetail",
        component: () => import("./views/nav/reorganizeLists/DictionaryDetail"),
        name: "dictionaryDetail",
        meta: {
          title: "字典明细"
        }
      },
      {
        path: "entityClass",
        component: () => import("./views/nav/reorganizeLists/EntityClass"),
        name: "entityClass",
        meta: {
          title: "实体分类设置"
        }
      },
      {
        path: "fonds",
        component: () => import("./views/nav/reorganizeLists/Fonds"),
        name: "fonds",
        meta: {
          title: "全宗设置"
        }
      },
      {
        path: "fileAdjustment",
        component: () => import("./views/nav/reorganizeLists/fileAdjustment"),
        name: "fileAdjustment",
        meta: {
          title: "归档调整",
          keepAlive: true
        }
      },
      {
        path: "report",
        component: () => import("./views/nav/reorganizeLists/Report"),
        name: "report",
        meta: {
          title: "报表打印",
          keepAlive: true
        }
      },
      {
        path: "examineFirst",
        component: () =>
          import("./views/nav/utilizeLists/authorization/ExamineFirst"),
        name: "examineFirst",
        meta: {
          title: "一级审核处置"
        }
      },
      {
        path: "firstDetails",
        component: () =>
          import("./views/nav/utilizeLists/authorization/FirstDetails"),
        name: "firstDetails",
        meta: {
          title: "审核"
        }
      },
      {
        path: "examineSecond",
        component: () =>
          import("./views/nav/utilizeLists/authorization/ExamineSecond"),
        name: "examineSecond",
        meta: {
          title: "二级审核处置"
        }
      },
      {
        path: "secondDetails",
        component: () =>
          import("./views/nav/utilizeLists/authorization/SecondDetails"),
        name: "secondDetails",
        meta: {
          title: "审核"
        }
      },
      {
        path: "examineLend",
        component: () =>
          import("./views/nav/utilizeLists/authorization/ExamineLend"),
        name: "examineLend",
        meta: {
          title: "借出处置"
        }
      },
      {
        path: "lendingDisposal",
        component: () =>
          import("./views/nav/utilizeLists/authorization/LendingDisposal"),
        name: "lendingDisposal",
        meta: {
          title: "借出处理"
        }
      },
      {
        path: "takeBack",
        component: () =>
          import("./views/nav/utilizeLists/authorization/TakeBack"),
        name: "takeBack",
        meta: {
          title: "收回处置"
        }
      },
      {
        path: "backContent",
        component: () =>
          import("./views/nav/utilizeLists/authorization/BackContent"),
        name: "backContent",
        meta: {
          title: "收回处置"
        }
      },
      {
        path: "utilizeHistory",
        component: () =>
          import("./views/nav/utilizeLists/history/UtilizeHistory"),
        name: "utilizeHistory",
        meta: {
          title: "利用历史"
        }
      },
      {
        path: "utilizeOriginal",
        component: () => import("./views/nav/utilizeLists/utilizeOriginal"),
        name: "utilizeOriginal",
        meta: {
          title: "利用历史原文"
        }
      },
      {
        path: "theme",
        component: () => import("./components/theme"),
        name: "theme",
        meta: {
          title: "偏好设置"
        }
      },
      {
        path: "special",
        component: () =>
          import("./views/nav/researchLists/specialLists/Special"),
        name: "special",
        meta: {
          title: "专题索引汇编",
          keepAlive: true
        }
      },
      {
        path: "archivesCompilation",
        component: () =>
          import("./views/nav/researchLists/ArchivesCompilation"),
        name: "archivesCompilation",
        meta: {
          title: "档案汇编",
          keepAlive: true
        }
      },
      {
        path: "original",
        component: () => import("./views/nav/researchLists/Original"),
        name: "original",
        meta: {
          title: "原文详情"
        }
      },
      {
        path: "expirationAppraisa",
        component: () =>
          import("./views/nav/appraisalLists/ExpirationAppraisa"),
        name: "expirationAppraisa",
        meta: {
          title: "到期鉴定",
          keepAlive: true
        }
      },
      {
        path: "audit",
        component: () => import("./views/nav/appraisalLists/Audit"),
        name: "audit",
        meta: {
          title: "审核记录"
        }
      },
      {
        path: "panelApproval",
        component: () => import("./views/nav/appraisalLists/PanelApproval"),
        name: "panelApproval",
        meta: {
          title: "小组审批"
        }
      },
      {
        path: "appraisaList",
        component: () => import("./views/nav/appraisalLists/AppraisaList"),
        name: "appraisaList",
        meta: {
          title: "鉴定清册"
        }
      },

      {
        path: "destructionList",
        component: () => import("./views/nav/appraisalLists/DestructionList"),
        name: "destructionList",
        meta: {
          title: "销毁"
        }
      },
      {
        path: "appraisalContent",
        component: () => import("./views/nav/appraisalLists/appraisalContent"),
        name: "appraisalContent",
        meta: {
          title: "档案鉴定"
        }
      },
      {
        path: "readAppraisal",
        component: () => import("./views/nav/appraisalLists/readAppraisal"),
        name: "readAppraisal",
        meta: {
          title: "查看"
        }
      },
      {
        path: "temperatureHumidity",
        component: () =>
          import("./views/nav/safekeepingLists/temperatureHumidity"),
        name: "temperatureHumidity",
        meta: {
          title: "温湿度管理"
        }
      },
      {
        path: "statistics",
        component: () => import("./views/nav/safekeepingLists/Statistics"),
        name: "statistics",
        meta: {
          title: "温湿度统计"
        }
      },
      {
        path: "warehouse",
        component: () => import("./views/nav/safekeepingLists/Warehouse"),
        name: "warehouse",
        meta: {
          title: "库房管理"
        }
      },
      {
        path: "plank",
        component: () => import("./views/nav/safekeepingLists/plank"),
        name: "plank",
        meta: {
          title: "阁子管理"
        }
      },
      {
        path: "addFile",
        component: () => import("./views/nav/safekeepingLists/AddFile"),
        name: "addFile",
        meta: {
          title: "档案上架"
        }
      },

      {
        path: "user",
        component: () => import("./views/nav/systemLists/User"),
        name: "user",
        meta: {
          title: "用户管理"
        }
      },
      {
        path: "rolePage",
        component: () => import("./views/nav/systemLists/rolePage"),
        name: "rolePage",
        meta: {
          title: "角色管理"
        }
      },
      {
        path: "systemLog",
        component: () => import("./views/nav/systemLists/SystemLog"),
        name: "systemLog",
        meta: {
          title: "日志管理"
        }
      },
      {
        path: "editRole",
        component: () => import("./views/nav/systemLists/EditRole"),
        name: "editRole",
        meta: {
          title: "角色修改"
        }
      },
      {
        path: "messagePage",
        component: () => import("./views/nav/systemLists/messagePage"),
        name: "messagePage",
        meta: {
          title: "消息管理"
        }
      },
      {
        path: "messageDetail",
        component: () => import("./views/nav/systemLists/messageDetail"),
        name: "messageDetail",
        meta: {
          title: "消息详情"
        }
      },
      {
        path: "department",
        component: () => import("./views/nav/systemLists/Department"),
        name: "department",
        meta: {
          title: "组织机构"
        }
      },
      {
        path: "reportTemplate",
        component: () => import("./views/nav/systemLists/ReportTemplate"),
        name: "reportTemplate",
        meta: {
          title: "报表模版"
        }
      },
      {
        path: "originalStorage",
        component: () => import("./views/nav/systemLists/OriginalStorage"),
        name: "originalStorage",
        meta: {
          title: "原文存储管理"
        }
      },
      {
        path: "changePassWord",
        component: () => import("./views/nav/systemLists/ChangePassword"),
        name: "changePassWord",
        meta: {
          title: "修改密码"
        }
      },
      {
        path: "userStatistics",
        component: () => import("./views/nav/censusLists/UserStatistics"),
        name: "userStatistics",
        meta: {
          title: "用户统计"
        }
      },
      {
        path: "fileTransfer",
        component: () => import("./views/nav/HandoverReception/FileTransfer"),
        name: "fileTransfer",
        meta: {
          title: "档案移交"
        }
      },
      {
        path: "fileTransferList",
        component: () =>
          import("./views/nav/HandoverReception/FileTransferList"),
        name: "fileTransferList",
        meta: {
          title: "移交清册"
        }
      },
      {
        path: "fileManage",
        redirect: "fileManageIndex",
        component: () => import("./views/nav/HandoverReception/FileManage"),
        name: "fileManage",
        meta: {
          title: "数据管理",
          keepAlive: true
        },
        children: [
          {
            path: "/fileManageIndex",
            component: () =>
              import("./views/nav/HandoverReception/component/FileManageIndex"),
            name: "fileManageIndex",
            meta: {
              title: "数据管理",
              activeMenu: "fileManage"
            }
          }
        ]
      },
      {
        path: "filequantityStatistics",
        redirect: "statisticsType",
        component: () =>
          import("./views/nav/censusLists/FilequantityStatistics"),
        name: "filequantityStatistics",
        meta: {
          title: "档案数量统计"
        },
        children: [
          {
            path: "/statisticsType",
            component: () => import("./views/nav/censusLists/statisticsType"),
            name: "statisticsType",
            meta: {
              title: "档案数量统计",
              activeMenu: "filequantityStatistics"
            }
          },
          {
            path: "/realtimeStatistics",
            component: () =>
              import("./views/nav/censusLists/RealtimeStatistics"),
            name: "realtimeStatistics",
            meta: {
              title: "实时统计",
              activeMenu: "archives"
            }
          },
          {
            path: "/utilizationStatistics",
            component: () =>
              import("./views/nav/censusLists/UtilizationStatistics"),
            name: "utilizationStatistics",
            meta: {
              title: "实时统计"
            }
          },
          {
            path: "/historyStatistics",
            component: () =>
              import("./views/nav/censusLists/HistoryStatistics"),
            name: "historyStatistics",
            meta: {
              title: "历史统计"
            }
          },
          {
            path: "/categoryStatistics",
            component: () =>
              import("./views/nav/censusLists/CategoryStatistics"),
            name: "categoryStatistics",
            meta: {
              title: "综合门类统计"
            }
          }
        ]
      },
      {
        path: "lysituationStatistics",
        redirect: "lyIndex",
        component: () =>
          import("./views/nav/censusLists/lysituationStatistics"),
        name: "lysituationStatistics",
        meta: {
          title: "利用情况统计"
        },
        children: [
          {
            path: "/lyIndex",
            component: () => import("./views/nav/censusLists/lyIndex"),
            name: "lyIndex",
            meta: {
              title: "利用情况统计",
              activeMenu: "lysituationStatistics"
            }
          }
        ]
      }
    ]
  }
];
const createRouter = () =>
  new Router({
    mode: "history",
    base: process.env.routerURL,
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes
  });
const router = createRouter();
// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
