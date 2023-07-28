<template>
  <div id="app">
    <!-- <transition>
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive"/>
      </keep-alive>
    </transition> -->
    <router-view />
  </div>
</template>

<script>
// export default {
//   name: 'App'
// }
export default {
  name: 'App',
  created () {
    this.$nextTick(() => {
      this.resizeFun()
      window.addEventListener('resize', this.resizeFun)
    })
  },
  methods: {
    resizeFun () {
      const devicePixelRatio = window.devicePixelRatio // 获取下载的缩放 125% -> 1.25    150% -> 1.5
      if (devicePixelRatio !== 1) {
        // 如果在笔记本中用IE浏览器打开 则弹出提示
        if (!! window.ActiveXObject || 'ActiveXObject' in window) {
          alert('balabala。。。')
        } else {
          const c = document.querySelector('body')
          c.style.zoom = 1 / devicePixelRatio// 修改页面的缩放比例
        }
      }
    }
  }
}
</script>
