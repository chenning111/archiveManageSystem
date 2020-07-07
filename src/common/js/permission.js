import router from '@/routes'
import store from '@/store'
//设置按钮权限的地址时 请保证前缀是路由地址 例如原文详情界面的原文上传按钮 地址应为 searchContent-upload
export default function getBtnPermission(value) {
    if (value.length && value.length == 0) {
        return false
    }
    let path = router.currentRoute.path.substr(1);//路由地址 /index =>> index
    let btnPermissionArray = value || []; //页面按钮绑定的值
    let roleBtnGroup = store.state.user.btnArray; //角色的按钮数组
    let isArray = roleBtnGroup.filter(item => btnPermissionArray.includes(item)); //首先判断角色是否含有当前的按钮
    if (isArray.length == 0) {
        return false;
    } else {
        if (isArray.filter(item => item.indexOf(path) > -1).length == 0) { //在判断当前地址是否和按钮地址想匹配  因为存在一个页面使用相同的按钮控制
            return false;
        } else {
            return true;
        }
    }
}