<template>
  <section class="app-main" :class="{'is-home': key == '/home', 'is-market': key.indexOf('/market') > -1}">
    <Breadcrumb class="breadcrumb-container" v-if="key != '/home'" />
    <!-- <transition name="fade-transform" mode="out-in"> -->
    <!-- <router-view :key="key" /> -->
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive" :key="key" />
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive" :key="key" />
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
    min-height: 100vh;
    width: 100%;
    position: relative;
    overflow: hidden;
    padding: 0 20px;
  }

  .fixed-header+.app-main {
    padding-top: 35px;
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
