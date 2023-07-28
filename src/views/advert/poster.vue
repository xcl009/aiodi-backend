<template>
  <div>
    <div class="p-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row>
        <el-table-column label="类型">
          <template slot-scope="scope">
            <div>{{ scope.row.advertTypeName }}</div>
          </template>
        </el-table-column>
        <el-table-column label="数量">
          <template slot-scope="scope">
            <div>{{ scope.row.number }}</div>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <template>
              <router-link :to="`/advert/posterList?category=${category}&advertTypeCode=${scope.row.advertTypeCode}&advertTypeName=${scope.row.advertTypeName}`">
                <el-button type="primary" size="mini">广告管理</el-button>
              </router-link>
              <router-link :to="`/advert/posterPosition?category=${category}&advertTypeCode=${scope.row.advertTypeCode}&advertTypeName=${scope.row.advertTypeName}`" v-if="isSaas()">
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
    data() {
      return {
        category: 'ORDINARY',
        list: [],
        listLoading: true
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.state.user.myDeviceId
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
        this.$get('iot-saas-advert/admin/advert/findAdvertType', {
          category: this.category
        }).then(res => {
          let list = []
          res.map(item => {
            if(this.myDeviceId[item.advertTypeCode]){
              list.push(item)
            }
          })
          this.list = list
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
