<template>
  <div>
    <div class="p-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div>{{ scope.row.name }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            <div>{{ scope.row.positionCount }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template>
              <router-link :to="`/advert/posterList?pid=${scope.row.id}`">
                <el-button type="primary" size="mini">广告管理</el-button>
              </router-link>
              <router-link :to="`/advert/posterPosition?pid=${scope.row.id}&name=${scope.row.name}`" v-if="isSaas()">
                <el-button type="primary" size="mini">位置管理</el-button>
              </router-link>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'poster',
    components: {

    },
    data() {
      return {
        list: [],
        listLoading: true
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      /**
       * 获取广告位置
       */
      getList() {
        this.$get('iot-saas-advert/admin/ad/ordinary/types').then(res => {
          this.list = res
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      },

      /**
       * 设置子级广告权限
       */
      setPer(row){
        let agree = row.son_has == 1 ? 0 : 1
        this.$post('agentapi/switch_ad_position', {
          son_id: this.son_id,
          position_id: row.position_id,
          agree: agree
        }).then(res => {
          this.$message({
            message: '设置成功',
            type: 'success'
          })
          row.son_has = agree
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
