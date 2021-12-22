<template>
  <div class="p-10">
    <div v-infinite-scroll="getList" class="p-30 bg-white box" style="overflow: auto;">
      <el-timeline>
        <template v-for="pitem in list">
          <el-timeline-item v-for="item in pitem" :timestamp="parseTime(item.add_date, '{y}-{m}-{d} {h}:{i}')" placement="top">
            <el-card>
              <div class="fs-c1">{{ item.title }}</div>
              <div v-html="item.content" />
            </el-card>
          </el-timeline-item>
        </template>
      </el-timeline>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
export default {
  name: 'UpdateRecord',
  components: {
    Pagination
  },
  data() {
    return {
      list: {},
      listLoading: true,
      listQuery: {
        article_type: 4,
        start: 0,
        total: 10,
        page_num: 1,
        limit: 5
      }
    }
  },
  mounted(options) {
    this.getList()
  },
  methods: {
    /**
     * 获取列表
     */
    getList() {
      if (this.is_load) return
      this.is_load = true
      this.listQuery.start++
      const listQuery = Object.assign({}, this.listQuery, {
        start: this.listQuery.start - 1
      })
      this.$get('agentapi/article/public_list', listQuery).then(res => {
        this.$set(this.list, res.page, res.list)
        if (res.page_num - 1 > res.page) this.is_load = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .box{
    height: calc(100vh - 70px);
  }
</style>
