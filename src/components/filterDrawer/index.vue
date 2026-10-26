<template>
  <div v-if="device === 'mobile'">
    <div class="pt-10 pb-10 l-t el-dropdown-link bg-white text-center" @click="drawer = true">
      {{ $t('components.filter') }}<i class="el-icon-arrow-down el-icon--right"></i>
    </div>
    <el-drawer :visible.sync="drawer" direction="ttb" :withHeader="false" size="inhert">
      <slot></slot>
    </el-drawer>
  </div>
  <div v-else>
    <slot></slot>
  </div>
</template>

<script>
export default {
  props: {},
  computed: {
    device() {
      return this.$store.state.app.device
    }
  },
  data() {
    return {
      drawer: false
    }
  },
  methods: {
    switchType(type) {
      this.$emit('switchType', type)
    }
  }
}
</script>
