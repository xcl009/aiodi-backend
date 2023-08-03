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
    
  },
  methods: {
    resizeFun () {
      const devicePixelRatio = window.devicePixelRatio // 获取下载的缩放 125% -> 1.25    150% -> 1.5
      if (devicePixelRatio > 1.5) {
        const c = document.querySelector('body')
        c.style.zoom = 1 / devicePixelRatio// 修改页面的缩放比例
      }
    }
  }
}
</script>
