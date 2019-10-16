<template>
  <div class="layout-row-main">
    <div class="second-level-navbar">
        <el-toolbar>
        <span class="navbar-title">一级菜单</span>
            </el-toolbar>
        <div class="menu-wrap select-disable">
        <el-menu :default-active="activeMenu" class="layout-menu" @select="onSelectMenu">
          <el-menu-item :index="menu.meta.title" v-for="menu in menus" :key="menu.path">
            <i :class="menu.meta.icon"></i>{{menu.meta.title}}
          </el-menu-item>
        </el-menu>
        </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
const util = zving.common.util

export default {
  data() {
    return {
      menus: [],
      activeMenu: this.$route.meta.title
    }
  },
  methods: {
    onSelectMenu(title) {
      let item = this.menus.find((val) => val.meta.title === title)
      if (item) {
        const path = item.path.replace(/:\w+\??/g, '')
        util.recordMenuClick(path)
        this.$router.push({ path: path })
      }
    }
  },
  created() {
    this.menus = util.getSecondLevelMenus('/subject1') || []
    let path = location.hash.substring(1)
    let item = this.menus.find(val => path.indexOf(val.path) > -1)
    this.activeMenu = item && item.meta ? item.meta.title : this.activeMenu
  },
  beforeRouteUpdate(to, from, next) {
    let path = to.path
    let item = this.menus.find(val => val.path === path)

    if (item && item.meta) {
      this.activeMenu = item.meta.title
    }
    next()
  }

}
</script>
<style scoped>
</style>
