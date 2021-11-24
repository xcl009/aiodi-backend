<template>
  <div>
    <drawer ref="filterDrawer">
      <template v-slot:defult>
        <el-form-item label="二维码:">
          <el-input v-model="form.search_goods_sn" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">查询<i class="el-icon-search el-icon--right" /></el-button>
          <el-button type="warning" plain @click="toQuery(1)">重置<i class="el-icon-refresh el-icon--right" /></el-button>
          <el-button type="primary" plain @click="outTab('list_table', '设备记录')">导出<i class="el-icon-male el-icon--right" /></el-button>
        </el-form-item>
      </template>
    </drawer>

    <div class="p-5">
      <el-table
        class="ptd-5"
        id="list_table"
        ref="list_table"
        v-loading="listLoading"
        :data="list"
        element-loading-text="Loading"
        stripe
        highlight-current-row
      >
        <el-table-column label="设备二维码">
          <template slot-scope="scope">
            {{ scope.row.goods_sn || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="设备类型">
          <template slot-scope="scope">
            <span v-if="scope.row.support_buletooth == 1">蓝牙线</span>
            <span v-else>{{ deviceKeyObj[scope.row.depend_type]}}</span>
          </template>
        </el-table-column>
        <el-table-column label="铺货时间">
          <template slot-scope="scope">
            {{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}:{s}') }}
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center bg-white">
        <pagination
          v-show="listQuery.page_num > 0"
          :page.sync="listQuery.start"
          :page-count="listQuery.page_num"
          :limit.sync="listQuery.limit"
          @pagination="getList"
        />
      </div>
    </div>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import drawer from '@/components/filterDrawer/filter'
export default {
  name: 'BindEquip',
  components: {
    Pagination,
    drawer
  },
  data() {
    return {
      nowTime: Date.parse(new Date()) / 1000,
      form: {},
      numInfo: {},
      list: [],
      listLoading: true,
      listQuery: {
        page_num: 1,
        limit: 20
      },
      shopInfo: {}
    }
  },
  computed: {
    deviceKeyObj(){
      return this.$store.state.user.deviceKeyObj
    }
  },
  mounted() {
    this.getShop()
  },
  methods: {
    /**
     * 搜索查询
     */
    toQuery(type = 0) {
      this.$refs.filterDrawer.hide()
      if (type == 1) {
        this.form = {}
        this.listQuery.start = 1
      } else {
        this.listQuery.start = 1
      }
      this.getList()
    },

    getShop(){
      this.$get('agentapi/store/merchant_store_detail').then(res => {
        this.shopInfo = res
        this.getList()
      })
    },

    /**
     * 获取列表
     */
    getList() {
      const listQuery = Object.assign({}, this.listQuery, this.form, {
        start: this.listQuery.start - 1
      })
      listQuery.store_id = this.shopInfo.store_id
      this.$get('agentapi/device/get_store_devices', listQuery).then(res => {
        this.listLoading = false
        this.list = res.list
        this.listQuery.page_num = res.page_num
      }).catch(() => {
        this.listLoading = false
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  #list_table .el-button{
    padding-left: 0;
    padding-right: 0;
    width: 85px;
  }
</style>
