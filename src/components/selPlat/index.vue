<template>
  <el-form-item :label="`${$t('components.allBrand')}:`">
    <el-select v-model="listQuery.search_agent_id" @change="$emit('change')">
      <el-option :label="$t('public.all')" value="0" />
      <el-option v-for="item in platList" :label="item.mini_name" :value="item.agent_id" v-if="item.mini_name" />
    </el-select>
  </el-form-item>
</template>

<script>
export default {
  name: 'platList',
  props: {
    listQuery: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      platList: []
    }
  },
  created() {
    this.getPlatList()
  },
  methods: {
    getPlatList() {
      this.$get('commonapi/configer/get_platform_list').then(res => {
        this.platList = res
      })
    }
  }
}
</script>

<style scoped></style>
