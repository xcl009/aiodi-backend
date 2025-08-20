<template>
  <div>
    <div class="p-15 bg-white">
      <el-table class="ptd-5" id="list_table" ref="list_table" v-loading="listLoading" :data="list"
        element-loading-text="Loading" highlight-current-row>
        <el-table-column :label="$t('public.type')">
          <template slot-scope="scope">
            <div>{{ myDeviceId[scope.row.advertTypeCode] || 'System Advertising' }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.number')">
          <template slot-scope="scope">
            <div>{{ scope.row.number }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('public.actions')">
          <template slot-scope="scope">
            <el-button type="primary" size="mini" @click="$router.push({path: `/advert/weChatList?category=${category}&advertTypeCode=${scope.row.advertTypeCode}&advertTypeName=${scope.row.advertTypeName}`})">{{ $t('public.advertisingSettings') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'weChatAdBase',
    components: {

    },
    data() {
      return {
        category: 'TRAFFIC',
        clickSubmit: false,
        list: [],
        listLoading: true
      }
    },
    computed: {
      myDeviceId() {
        return this.$store.state.user.myDeviceId
      },
      siteInfo() {
        return this.$store.state.user.siteInfo
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
          let arr = []
          res.map(item => {
            if(item.advertTypeCode == 'SA' || this.myDeviceId[item.advertTypeCode]){
              arr.push(item)
            }
          })
          this.list = arr
          this.listLoading = false
        }).catch(() => {
          this.listLoading = false
        })
      }
    }
  }
</script>

<style lang="scss" scoped>

</style>
