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
export default {
  name: 'App'
}
</script>