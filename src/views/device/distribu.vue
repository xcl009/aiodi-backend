<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item class="ml-20" label="底座SN码：">
          <el-input v-model="form.name" placeholder="请输入底座SN码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="toQuery">查询</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'equipment',
    components: {

    },
    data() {
      return {
        form: {},
        list: [],
        selSnArr: []
      }
    },
    mounted() {

    },
    methods: {

    }
  }
</script>

<style lang="scss" scoped>

</style>
