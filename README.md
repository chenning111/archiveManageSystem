# wskjda

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
项目部署 --
    上一级文件夹默认为wskj 如需修改 在config下 prod.env.js下修改routerUrl  请求地址为 http://xxxx/wskj/ ;
    由于不明原因 项目启动 端口号被修改，portfinder插件回退至1.0.21也不生效，webpack.dev.conf.js固定了端口 /////////chenning////////
权限管理
    按钮权限若没有 按钮为disabled 参考common/js/permission.js
下载接口 axios 只返回res 其他接口返回res.data 参考report.js



