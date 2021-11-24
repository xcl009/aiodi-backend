<template>
  <div class="p-5">
    <div class="bg-white">
      <el-table id="order_table" v-loading="listLoading" :data="list" element-loading-text="Loading" stripe highlight-current-row>
        <el-table-column label="设备SN码" width="150">
          <template slot-scope="scope">
            {{ scope.row.zuo_sn }}
          </template>
        </el-table-column>
        <el-table-column label="宝SN码" width="150">
          <template slot-scope="scope">
            {{ scope.row.bao_sn }}
          </template>
        </el-table-column>
        <el-table-column label="弹出时间">
          <template slot-scope="scope">
            <span>{{ parseTime(scope.row.add_date, '{y}-{m}-{d} {h}:{i}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="是否归还">
          <template slot-scope="scope">
            <el-link :type="scope.row.eject_status == 2 ? 'primary' : 'danger'">{{ scope.row.eject_status == 2 ? '是' : '否' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column label="商户名称">
          <template slot-scope="scope">
            {{ scope.row.store_name || "--" }}
          </template>
        </el-table-column>
        <el-table-column label="操作者">
          <template slot-scope="scope">
            <div class="flex align-center">
              <el-avatar size="small" :src="scope.row.agent_avatar"></el-avatar>
              <div class="flex1 ml-5">{{ scope.row.agent_name }}</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="flex justify-center">
        <pagination v-show="listQuery.page_num > 0" :page.sync="listQuery.start" :limit.sync="listQuery.limit" :page-count="listQuery.page_num"
          @pagination="getList" />
      </div>
    </div>
  </div>
</template>

<script>
  import Pagination from '@/components/Pagination'
  export default {
    name: 'popupRecord',
    components: {
      Pagination
    },
    data() {
      return {
        list: [],
        listLoading: true,
        listQuery: {
          zuo_sn: this.$route.params.goods_sn,
          type: 1,
          start: 1,
          limi: 20,
          page_num: 1
        },
        selSnArr: []
      }
    },
    mounted() {
      this.getList()
    },
    methods: {
      getList() {
        let listQuery = Object.assign({}, this.listQuery, {
          start: this.listQuery.start - 1
        })
        this.$get('agentapi/eject_bao_record', listQuery).then(res => {
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

</style>
