const getters = {
  userInfo: state => state.user.userInfo,
  departmentTree: state => state.tree.departmentTree,
  tableViewTree: state => state.tree.tableViewTree,
  menuTheme: state => state.theme.menu,
  headerTheme: state => state.theme.header.headerBg,
  mainTheme: state => state.theme.mainBg.backgroundColor,
  stripe: state => state.theme.stripe,
  fontSize: state => state.theme.fontSize,
}
export default getters
