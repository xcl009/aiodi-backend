# vue-admin-template

English | [简体中文](./README-zh.md)

## Build Setup


```bash
# clone the project
git clone https://gitee.com/power-duck/saas-brand-vue.git

# enter the project directory
cd saas-brand-vue 

# branch 
git checkout baoyun

# install dependency
npm install

# develop
npm run dev
```

This will automatically open http://localhost:9528

## Build

```bash
# build for test environment
npm run build:stage

# build for production environment
npm run build:prod
```

## Advanced

```bash
# preview the release environment effect
npm run preview

# preview the release environment effect + static resource analysis
npm run preview -- --report

# code format check
npm run lint

# code format check and auto fix
npm run lint -- --fix
```


## public/config.json dist/config.json

```bash
"project_name": "", // 默认品牌名称
"BASE_URL": "", // 后端api接口地址
"DEVICDE_CODE_URL": "", // 后端api接口地址
"baidu_map_ak": "", // 百度地图秘钥  https://lbsyun.baidu.com/  登录百度地图添加应用获取
"baidu_statistics": "" // 百度统计代码  https://tongji.baidu.com
```# aiodi-backend
