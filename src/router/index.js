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
    redirect: '/monConfig/',
    name: '首页',
    hidden: true,
    children: [{
      path: 'dashboard', component: _import('monConfig/indexConfig')
    }]
  },
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
    meta: {title: '用户权限', icon: '权限管理'},
    children: [
      {
        path: '', 
        name: '用户列表', 
        component: _import('user/user'), 
        meta: {title: '用户列表', icon: 'user'}, 
        menu: 'user'
      },
      {
        path: 'send_mail',
        name: '告警联系人配置',
        component: _import('user/sendMailUser'),
        meta: {title: '告警联系人配置', icon: '告警联系人'},
        menu: 'send_mail'
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
    path: '/mail',
    component: Layout,
    redirect: '/server/',
    name: '',
    meta: {title: '告警权限', icon: 'setting'},
    children: [
      {
        path: '', 
        name: '告警组配置', 
        component: _import('server/sendMailGroup'), 
        meta: {title: '告警组配置', icon: 'setting'}, 
        menu: 'mail_group'
      },
    ]
  },
  {
    path: '/monConfig',
    component: Layout,
    redirect: '/monConfig/',
    name: '',
    meta: {title: '监控配置', icon: '监控运维'},
    children: [  
      {
        path: '', 
        name: '检查脚本配置', 
        component: _import('monConfig/scriptConfig'), 
        meta: {title: '检查脚本配置', icon: '脚本配置'}, 
        menu: 'shell_setting'
      },
      {
        path: 'sync', 
        name: '数据同步配置', 
        component: _import('monConfig/syncConfig'), 
        meta: {title: '数据同步配置', icon: '数据同步'}, 
        menu: 'syncConfig'
      },
      {
        path: 'server_setting', 
        name: '服务器配置', 
        component: _import('monConfig/detailsbak'), 
        meta: {title: '服务器配置', icon: '服务器配置'}, 
        menu: 'server_setting'
      },   
      {
        path: 'rule_setting', 
        name: '私有阀值配置', 
        component: _import('monConfig/indexConfig'), 
        meta: {title: '私有阀值配置', icon: '阀值配置'}, 
        menu: 'rule_setting'
      }, 
      {
        path: 'datarange_setting', 
        name: '时间范围配置', 
        component: _import('monConfig/dateRangeConfig'), 
        meta: {title: '时间范围配置', icon: '时间配置'}, 
        menu: 'rule_setting'
      }, 
      {
        path: 'resources', 
        name: '资源配置', 
        component: _import('monConfig/resources'), 
        meta: {title: '资源配置', icon: '资源配置'}, 
        menu: 'resources'
      },  
      // {
      //   path: 'daily_log', 
      //   name: '日志', 
      //   component: _import('server/dailyLog'), 
      //   meta: {title: '日志', icon: 'tree'}, 
      //   menu: 'daliy_log'
      // },            
    ]
  },
  {
    path: '/monManage',
    component: Layout,
    redirect: '/monManage/',
    name: '',
    meta: {title: '监控管理', icon: '监控管理'},
    children: [    
      {
        path: '', 
        name: '并发管理器', 
        component: _import('monManage/quartzJobExecTime'), 
        meta: {title: '并发管理器', icon: '并发配置'}, 
        menu: 'job_runnning'
      }, 
      {
        path: 'sql_log', 
        name: 'SQL性能监控', 
        component: _import('monManage/sqlLog'), 
        meta: {title: 'SQL性能监控', icon: 'SQL监控'}, 
        menu: 'sql_log'
      },
      {
        path: 'alarm', 
        name: '告警记录', 
        component: _import('monManage/alarm'), 
        meta: {title: '告警记录', icon: '告警记录'}, 
        menu: 'daliy_log'
      },
      {
        path: 'aduit', 
        name: '测试', 
        component: _import('monManage/aduit'), 
        meta: {title: '测试', icon: 'tree'}, 
        menu: 'aduit'
      },
    ]   
  },
  {
    path: '/outLink',
    component: Layout,
    redirect: '/outLink/',
    name: '',
    meta: {title: '外部链接', icon: '链接'},
    children: [    
      {
        path: '', 
        name: 'swagger-ui', 
        component: _import('outLink/swagger-ui'), 
        meta: {title: 'swagger-ui', icon: '接口'}, 
        menu: 'swagger-ui'
      }, 
      {
        path: 'druid', 
        name: 'druid', 
        component: _import('outLink/druid'), 
        meta: {title: 'druid', icon: 'Druid'}, 
        menu: 'druid'
      },     
    ]   
  },
  {path: '*', redirect: '/404', hidden: true}
]
