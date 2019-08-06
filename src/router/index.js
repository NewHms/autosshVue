import Vue from 'vue'
import Router from 'vue-router'
// in development env not use Lazy Loading,because Lazy Loading too many pages will cause webpack hot update too slow.so only in production use Lazy Loading
/* layout */
import Layout from '../views/layout/Layout'
import { Loading } from 'element-ui';

const _import = require('./_import_' + process.env.NODE_ENV)
Vue.use(Router)
export const constantRouterMap = [
  {path: '/login', component: _import('login/index'), hidden: true},
  {path: '/404', component: _import('404'), hidden: true},
  {
    path: '/',
    component: Layout,
    redirect: '/server/',
    name: '首页',
    hidden: true,
    children: [{
      path: 'dashboard', component: _import('server/indexConfig')
    }]
  }
]
export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({y: 0}),
  routes: constantRouterMap
})
export const asyncRouterMap = [
  // {
  //   path: '/system',
  //   component: Layout,
  //   redirect: '/system/article',
  //   name: '功能模块',
  //   meta: {title: '功能模块', icon: 'tree'},
  //   children: [
  //     {
  //       path: 'article',
  //       name: '文章',
  //       component: _import('article/article'),
  //       meta: {title: '文章', icon: 'example'},
  //       menu: 'article'
  //     },
  //   ]
  // },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/',
    name: '',
    meta: {title: '用户权限', icon: 'table'},
    children: [
      {
        path: '', 
        name: '用户列表', 
        component: _import('user/user'), 
        meta: {title: '用户列表', icon: 'user'}, 
        menu: 'user'
      },
      {
        path: 'role',
        name: '权限管理',
        component: _import('user/role'),
        meta: {title: '权限管理', icon: 'password'},
        menu: 'role'
      },
    ]
  },
  {
    path: '/server',
    component: Layout,
    redirect: '/server/',
    name: '',
    meta: {title: '数据库日检', icon: 'table'},
    children: [  
      // {
      //   path: '', 
      //   name: 'Agent信息', 
      //   component: _import('server/details'), 
      //   meta: {title: 'Agent信息', icon: 'tree'}, 
      //   menu: 'details'
      // },
      {
        path: '', 
        name: '检查脚本配置', 
        component: _import('server/scriptConfig'), 
        meta: {title: '检查脚本配置', icon: 'tree'}, 
        menu: 'shell_setting'
      },
      {
        path: 'server_setting', 
        name: '服务器配置', 
        component: _import('server/detailsbak'), 
        meta: {title: '服务器配置', icon: 'tree'}, 
        menu: 'server_setting'
      },   
      {
        path: 'rule_setting', 
        name: '私有阀值配置', 
        component: _import('server/indexConfig'), 
        meta: {title: '私有阀值配置', icon: 'tree'}, 
        menu: 'rule_setting'
      }, 
      {
        path: 'resources', 
        name: '资源配置', 
        component: _import('server/resources'), 
        meta: {title: '资源配置', icon: 'tree'}, 
        menu: 'resources'
      }, 
      {
        path: 'job_runnning', 
        name: 'job运行信息', 
        component: _import('server/quartzJobExecTime'), 
        meta: {title: 'job运行信息', icon: 'tree'}, 
        menu: 'job_runnning'
      }, 
      {
        path: 'sql_log', 
        name: 'SQL性能监控', 
        component: _import('server/sqlLog'), 
        meta: {title: 'SQL性能监控', icon: 'tree'}, 
        menu: 'sql_log'
      },
      {
        path: 'daily_log', 
        name: '日志', 
        component: _import('server/dailyLog'), 
        meta: {title: '日志', icon: 'tree'}, 
        menu: 'daliy_log'
      },

    ]
  },
  {path: '*', redirect: '/404', hidden: true}
]
