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
    // this.$nextTick(() => {
    //   this.devicePixelRatio = window.devicePixelRatio
    //   if(this.devicePixelRatio){
    //     window.addEventListener('resize', this.resizeFun)
    //   }
    // })
  },
  methods: {
    resizeFun () {
      const devicePixelRatio = window.devicePixelRatio
      console.log(devicePixelRatio)
      if (devicePixelRatio != this.devicePixelRatio) {
        const c = document.querySelector('body')
        c.style.zoom = this.devicePixelRatio / devicePixelRatio// 修改页面的缩放比例
      }
    }
  }
}
</script>
