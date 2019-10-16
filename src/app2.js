/* global VueRouter */
import './views/comment/face.vue'

const menuConfig = {
  path: '/subject1',
  name: 'subject1',
  meta: { title: '一级菜单', icon: 'fa fa-desktop', priv: true },
  component: require('./views/subject1/index.vue').default,
  children: [
    {
      path: '/subject1/view1',
      meta: { title: '二级菜单1', icon: 'fa fa-cog', priv: true },
      component: require('./views/subject1/test.vue').default
    },
    {
      path: '/subject1/view2',
      meta: { title: '二级菜单2', icon: 'fa fa-cog', priv: true },
      component: require('./views/subject1/subview1.vue').default
    },
    {
      path: '/subject1/view3',
      meta: { title: '二级菜单3', icon: 'fa fa-cog', priv: true },
      component: require('./views/subject1/subview3.vue').default
    },
    {
      path: '/subject1/view4',
      meta: { title: '二级菜单4', icon: 'fa fa-cog', priv: true },
      component: require('./views/subject1/subview4.vue').default
    }
  ]
}

const subMenusConfig = [
  {
    path: '/member/view1',
    meta: { title: '添加子菜单1', icon: 'fa fa-cog', priv: 'Platform.System' },
    component: require('./views/subject1/subview1.vue').default
  },
  {
    path: '/member/view2',
    meta: { title: '添加子菜单2', icon: 'fa fa-cog', priv: true },
    component: require('./views/subject1/subview2.vue').default
  }
]

document.addEventListener('appbeforeinstantiaterouter', e => {
  VueRouter.insertMenu(menuConfig, 4)
  VueRouter.insertSubMenus(subMenusConfig, '/member', 3)
}, false)
