<template>
  <div class="p-10">
    <div class="p-20 bg-white">
      <div class="pb-10 fs-a1">{{ info.title }}</div>
      <div class="fs-s3 text-gray">{{ parseTime(info.add_date) }}</div>
      <div class="max-w" v-html="info.content"></div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'tutorialDetail',
    data() {
      return {
        id: this.$route.params.id || 1,
        info: {}
      }
    },
    mounted() {
      this.getDetail()
    },
    methods: {
      /**
       * 文章详情
       */
      getDetail(row){
        this.$get('agentapi/article/detail', {
          id: this.id
        }).then(res => {
          this.info = res.info
        })
      }
    }
  }
</script>

<style scoped>

</style>
