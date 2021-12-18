<template>
  <section class="app-main">
    <Breadcrumb class="breadcrumb-container" />
    <!-- <transition name="fade-transform" mode="out-in"> -->
      <!-- <router-view :key="key" /> -->
      <keep-alive>
        <router-view v-if="$route.meta.keepAlive" :key="key"/>
      </keep-alive>
      <router-view v-if="!$route.meta.keepAlive" :key="key"/>
    <!-- </transition> -->
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
export default {
  name: 'AppMain',
  components: {
    Breadcrumb
  },
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style scoped>
.app-main {
  /*60 = navbar  */
  min-height: calc(100vh - 60px);
  width: 100%;
  position: relative;
  overflow: hidden;
  padding: 0 24px;
}
.fixed-header+.app-main {
  padding-top: 60px;
}
@media (max-width: 768px) {
  .app-main {
    padding: 0 10px;
  }
}
</style>

<style lang="scss">
// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: 15px;
  }
}
</style>
